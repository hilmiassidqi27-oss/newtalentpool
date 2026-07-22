import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocFromServer,
  query,
  limit,
  getDoc
} from 'firebase/firestore';
import { auth } from './googleAuth';
import { Candidate, Job } from '../types';

// Obtain the initialized app and initialize firestore
import { getApps, getApp, initializeApp } from 'firebase/app';
import localFirebaseConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || localFirebaseConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || localFirebaseConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || localFirebaseConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || localFirebaseConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || localFirebaseConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || localFirebaseConfig.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Access the firestore database using the custom firestoreDatabaseId if configured
const firestoreDatabaseId = (localFirebaseConfig as any).firestoreDatabaseId || undefined;
export const db = getFirestore(app, firestoreDatabaseId);

// Error Handling Enum and Interface conforming to the firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Connection Validation at Startup
export async function testFirestoreConnection() {
  const testPath = 'candidates';
  try {
    // Attempt to test the connection by querying a limited set of documents
    const q = query(collection(db, testPath), limit(1));
    await getDocs(q);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}

// 2. Fetch all candidates
export async function fetchCandidatesFromFirestore(): Promise<Candidate[]> {
  const path = 'candidates';
  try {
    const q = collection(db, path);
    const snapshot = await getDocs(q);
    const list: Candidate[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      list.push({
        id: Number(data.id),
        name: String(data.name || ''),
        position: String(data.position || ''),
        status: data.status,
        hrResult: data.hrResult,
        userResult: data.userResult,
        notes: String(data.notes || ''),
        dateAdded: String(data.dateAdded || ''),
        source: String(data.source || 'LinkedIn'),
      });
    });
    return list;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 3. Save / Update a candidate
export async function saveCandidateToFirestore(candidate: Candidate): Promise<void> {
  const docId = `candidate_${candidate.id}`;
  const path = `candidates/${docId}`;
  try {
    const docRef = doc(db, 'candidates', docId);
    await setDoc(docRef, {
      id: Number(candidate.id),
      name: String(candidate.name),
      position: String(candidate.position),
      status: candidate.status,
      hrResult: candidate.hrResult,
      userResult: candidate.userResult,
      notes: String(candidate.notes || '-'),
      dateAdded: String(candidate.dateAdded),
      source: String(candidate.source || 'LinkedIn'),
    });
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 4. Delete a candidate
export async function deleteCandidateFromFirestore(candidateId: number): Promise<void> {
  const docId = `candidate_${candidateId}`;
  const path = `candidates/${docId}`;
  try {
    const docRef = doc(db, 'candidates', docId);
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. Bulk synchronization of candidates (e.g. after pulling from Google Sheets)
export async function syncAllCandidatesToFirestore(candidates: Candidate[]): Promise<void> {
  const path = 'candidates';
  try {
    // Delete existing candidates first, or overwrite them in batch
    const batch = writeBatch(db);
    
    // First retrieve current document references to delete to keep in sync
    const currentSnapshot = await getDocs(collection(db, 'candidates'));
    currentSnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    
    // Write new candidates
    candidates.forEach((candidate) => {
      const docId = `candidate_${candidate.id}`;
      const docRef = doc(db, 'candidates', docId);
      batch.set(docRef, {
        id: Number(candidate.id),
        name: String(candidate.name),
        position: String(candidate.position),
        status: candidate.status,
        hrResult: candidate.hrResult,
        userResult: candidate.userResult,
        notes: String(candidate.notes || '-'),
        dateAdded: String(candidate.dateAdded),
        source: String(candidate.source || 'LinkedIn'),
      });
    });
    
    await batch.commit();
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Fetch job positions list
export async function fetchPositionsFromFirestore(): Promise<string[] | null> {
  const path = 'config/positions';
  try {
    const docRef = doc(db, 'config', 'positions');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.list)) {
        return data.list;
      }
    }
    return null;
  } catch (error) {
    console.error("Firestore Fetch Positions Error:", error);
    return null;
  }
}

// 7. Save / Update job positions list
export async function savePositionsToFirestore(positions: string[]): Promise<void> {
  const path = 'config/positions';
  try {
    const docRef = doc(db, 'config', 'positions');
    await setDoc(docRef, { list: positions });
  } catch (error) {
    console.error("Firestore Save Positions Error:", error);
  }
}

// 8. Fetch job openings list
export async function fetchJobsFromFirestore(): Promise<Job[] | null> {
  const path = 'config/jobs';
  try {
    const docRef = doc(db, 'config', 'jobs');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.list)) {
        return data.list;
      }
    }
    return null;
  } catch (error) {
    console.error("Firestore Fetch Jobs Error:", error);
    return null;
  }
}

// 9. Save / Update job openings list
export async function saveJobsToFirestore(jobs: Job[]): Promise<void> {
  const path = 'config/jobs';
  try {
    const docRef = doc(db, 'config', 'jobs');
    await setDoc(docRef, { list: jobs });
  } catch (error) {
    console.error("Firestore Save Jobs Error:", error);
  }
}

// 10. Fetch allowed emails list (Google Whitelist)
export async function fetchAllowedEmailsFromFirestore(): Promise<string[] | null> {
  const path = 'config/allowed_emails';
  try {
    const docRef = doc(db, 'config', 'allowed_emails');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.list)) {
        return data.list.map(e => String(e).trim().toLowerCase());
      }
    }
    return null;
  } catch (error) {
    console.error("Firestore Fetch Allowed Emails Error:", error);
    return null;
  }
}

// 11. Save / Update allowed emails list
export async function saveAllowedEmailsToFirestore(emails: string[]): Promise<void> {
  const path = 'config/allowed_emails';
  try {
    const docRef = doc(db, 'config', 'allowed_emails');
    await setDoc(docRef, { list: emails.map(e => String(e).trim().toLowerCase()) });
  } catch (error) {
    console.error("Firestore Save Allowed Emails Error:", error);
  }
}

// 12. Fetch authorized logins list (System Credentials)
export async function fetchAuthorizedLoginsFromFirestore(): Promise<any[] | null> {
  const path = 'config/authorized_logins';
  try {
    const docRef = doc(db, 'config', 'authorized_logins');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.list)) {
        return data.list;
      }
    }
    return null;
  } catch (error) {
    console.error("Firestore Fetch Authorized Logins Error:", error);
    return null;
  }
}

// 13. Save / Update authorized logins list
export async function saveAuthorizedLoginsToFirestore(logins: any[]): Promise<void> {
  const path = 'config/authorized_logins';
  try {
    const docRef = doc(db, 'config', 'authorized_logins');
    await setDoc(docRef, { list: logins });
  } catch (error) {
    console.error("Firestore Save Authorized Logins Error:", error);
  }
}

// 14. Fetch role permissions mapping
export async function fetchRolePermissionsFromFirestore(): Promise<Record<string, Record<string, boolean>> | null> {
  const path = 'config/role_permissions';
  try {
    const docRef = doc(db, 'config', 'role_permissions');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.mapping) {
        return data.mapping;
      }
    }
    return null;
  } catch (error) {
    console.error("Firestore Fetch Role Permissions Error:", error);
    return null;
  }
}

// 15. Save / Update role permissions mapping
export async function saveRolePermissionsToFirestore(mapping: Record<string, Record<string, boolean>>): Promise<void> {
  const path = 'config/role_permissions';
  try {
    const docRef = doc(db, 'config', 'role_permissions');
    await setDoc(docRef, { mapping });
  } catch (error) {
    console.error("Firestore Save Role Permissions Error:", error);
  }
}



