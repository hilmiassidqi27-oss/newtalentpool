import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CANDIDATES, 
  INITIAL_TIMELINE, 
  MOCK_USER,
  POSITIONS_LIST
} from './data';
import { INITIAL_JOBS } from './data_jobs';
import { Candidate, CandidateStatus, TimelineItem, Job } from './types';
import { auth } from './lib/googleAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  fetchCandidatesFromFirestore, 
  saveCandidateToFirestore, 
  deleteCandidateFromFirestore, 
  syncAllCandidatesToFirestore,
  testFirestoreConnection,
  fetchPositionsFromFirestore,
  savePositionsToFirestore,
  fetchJobsFromFirestore,
  saveJobsToFirestore,
  fetchAllowedEmailsFromFirestore,
  saveAllowedEmailsToFirestore,
  fetchAuthorizedLoginsFromFirestore,
  saveAuthorizedLoginsToFirestore,
  fetchRolePermissionsFromFirestore,
  saveRolePermissionsToFirestore
} from './lib/firebaseService';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import CandidateTable from './components/CandidateTable';
import CandidateModal from './components/CandidateModal';
import StageConversion from './components/StageConversion';
import PipelineTimeline from './components/PipelineTimeline';
import SheetsSync from './components/SheetsSync';
import RecruitmentReports from './components/RecruitmentReports';
import CVDatabase from './components/CVDatabase';
import ProfileModal from './components/ProfileModal';
import JobOpenings from './components/JobOpenings';
import RecruitmentPipeline from './components/RecruitmentPipeline';
import GeoSourceDashboard from './components/GeoSourceDashboard';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  FileSpreadsheet, 
  TrendingUp, 
  UserPlus, 
  AlertCircle,
  FileText,
  Clock,
  Shield,
  Key,
  Lock,
  UserCheck,
  Trash2,
  Plus,
  Edit2
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('nexus_remember_login') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('nexus_logged_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    return MOCK_USER;
  });
  const [allowedEmails, setAllowedEmails] = useState<string[]>(() => {
    const stored = localStorage.getItem('nexus_allowed_emails');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(e => String(e).trim().toLowerCase());
        }
      } catch (err) {
        console.error(err);
      }
    }
    const defaults = ['hilmiassidqi27@gmail.com', 'admin@nexus.com', 'recruiter@nexus.com', 'manager@nexus.com'];
    localStorage.setItem('nexus_allowed_emails', JSON.stringify(defaults));
    return defaults;
  });

  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const stored = localStorage.getItem('nexus_role_permissions');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error(err);
      }
    }
    const defaults = {
      'Recruiter': {
        'dashboard': true,
        'geosource': true,
        'jobs': true,
        'pipeline': true,
        'candidates': true,
        'interviews': true,
        'talent': true,
        'sheets': false,
        'reports': false,
        'settings': false
      },
      'Administrator': {
        'dashboard': true,
        'geosource': true,
        'jobs': true,
        'pipeline': true,
        'candidates': true,
        'interviews': true,
        'talent': true,
        'sheets': true,
        'reports': true,
        'settings': true
      },
      'Manager': {
        'dashboard': true,
        'geosource': true,
        'jobs': false,
        'pipeline': false,
        'candidates': true,
        'interviews': false,
        'talent': true,
        'sheets': false,
        'reports': true,
        'settings': false
      },
      'Super Admin': {
        'dashboard': true,
        'geosource': true,
        'jobs': true,
        'pipeline': true,
        'candidates': true,
        'interviews': true,
        'talent': true,
        'sheets': true,
        'reports': true,
        'settings': true
      }
    };
    localStorage.setItem('nexus_role_permissions', JSON.stringify(defaults));
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem('nexus_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedPipelinePosition, setSelectedPipelinePosition] = useState('All');
  const [positionsList, setPositionsList] = useState<string[]>(() => {
    const stored = localStorage.getItem('nexus_positions_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error(err);
      }
    }
    return POSITIONS_LIST;
  });

  // Dynamic combined list of positions from custom list + defined jobs
  const combinedPositions = Array.from(new Set([
    ...positionsList,
    ...jobs.map(j => j.position)
  ])).filter(Boolean);

  useEffect(() => {
    localStorage.setItem('nexus_positions_list', JSON.stringify(positionsList));
  }, [positionsList]);

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic Tab Guard based on Role Permissions
  useEffect(() => {
    if (!currentUser?.role) return;
    const permissions = rolePermissions[currentUser.role];
    if (!permissions) return;

    if (activeTab === 'settings') {
      if (permissions['settings'] === false) {
        const allowedTab = Object.keys(permissions).find(tab => permissions[tab] === true && tab !== 'settings');
        if (allowedTab) setActiveTab(allowedTab);
      }
    } else if (permissions[activeTab] === false) {
      const allowedTab = Object.keys(permissions).find(tab => permissions[tab] === true);
      if (allowedTab) setActiveTab(allowedTab);
    }
  }, [activeTab, currentUser?.role, rolePermissions]);

  useEffect(() => {
    localStorage.setItem('nexus_allowed_emails', JSON.stringify(allowedEmails));
  }, [allowedEmails]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleUpdateProfile = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('nexus_logged_user', JSON.stringify(updatedUser));
    logActivity('Profile Updated', `Profil pengguna diperbarui menjadi ${updatedUser.fullName} (${updatedUser.role}).`);
  };

  // Settings Whitelist States
  const [settingsSubTab, setSettingsSubTab] = useState<'google' | 'credentials'>('google');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const handleAddAllowedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    const email = newEmailInput.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSettingsError('Masukkan alamat email Google yang valid.');
      return;
    }

    if (allowedEmails.includes(email)) {
      setSettingsError('Email ini sudah terdaftar dalam daftar otorisasi.');
      return;
    }

    const updated = [...allowedEmails, email];
    setAllowedEmails(updated);
    setNewEmailInput('');
    setSettingsSuccess(`Berhasil mengizinkan email Google: ${email}`);
    setTimeout(() => setSettingsSuccess(''), 4000);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveAllowedEmailsToFirestore(updated).catch(err => {
        console.error("Firestore Save Allowed Emails Error:", err);
      });
    }
  };

  const handleRemoveAllowedEmail = (emailToRemove: string) => {
    setSettingsError('');
    setSettingsSuccess('');

    if (emailToRemove.toLowerCase() === 'hilmiassidqi27@gmail.com') {
      setSettingsError('Anda tidak diperbolehkan menghapus email administrator utama (Hilmiassidqi27@gmail.com).');
      return;
    }

    const updated = allowedEmails.filter(e => e !== emailToRemove);
    setAllowedEmails(updated);
    setSettingsSuccess(`Berhasil menghapus otorisasi email: ${emailToRemove}`);
    setTimeout(() => setSettingsSuccess(''), 4000);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveAllowedEmailsToFirestore(updated).catch(err => {
        console.error("Firestore Save Allowed Emails Error:", err);
      });
    }
  };

  // Settings Custom Login States
  const [authorizedLogins, setAuthorizedLogins] = useState<any[]>(() => {
    const stored = localStorage.getItem('nexus_authorized_logins');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (err) {
        console.error(err);
      }
    }
    const defaults = [
      { username: 'admin', password: 'password123', role: 'Administrator', email: 'admin@nexus.com', fullName: 'PIC Rekrutmen' },
      { username: 'recruiter', password: 'password123', role: 'Recruiter', email: 'recruiter@nexus.com', fullName: 'Recruitment Staff' },
      { username: 'hilmiassidqi27', password: 'password123', role: 'Super Admin', email: 'hilmiassidqi27@gmail.com', fullName: 'Hilmi Assidqi' },
      { username: 'hilmi', password: 'password123', role: 'Manager', email: 'hilmi@nexus.com', fullName: 'Hilmi Manager' }
    ];
    localStorage.setItem('nexus_authorized_logins', JSON.stringify(defaults));
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem('nexus_authorized_logins', JSON.stringify(authorizedLogins));
  }, [authorizedLogins]);

  // Form states for adding custom credentials
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('Recruiter');
  const [newEmail, setNewEmail] = useState('');

  const handleAddCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    const username = newUsername.trim().toLowerCase();
    const password = newPassword.trim();
    const fullName = newFullName.trim();
    const email = newEmail.trim().toLowerCase();
    const role = newRole;

    if (!username || !password || !fullName || !email) {
      setSettingsError('Semua kolom wajib diisi untuk menambahkan akun kredensial!');
      return;
    }

    if (authorizedLogins.some(acc => acc.username.toLowerCase() === username)) {
      setSettingsError('Username ini sudah terdaftar.');
      return;
    }

    if (authorizedLogins.some(acc => acc.email.toLowerCase() === email)) {
      setSettingsError('Email ini sudah terdaftar pada akun lain.');
      return;
    }

    const newAcc = { username, password, fullName, email, role };
    const updatedLogins = [...authorizedLogins, newAcc];
    setAuthorizedLogins(updatedLogins);
    
    // Auto-authorize email in the whitelist if not already there
    let updatedEmails = allowedEmails;
    if (!allowedEmails.includes(email)) {
      updatedEmails = [...allowedEmails, email];
      setAllowedEmails(updatedEmails);
    }

    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewEmail('');
    setNewRole('Recruiter');

    setSettingsSuccess(`Berhasil membuat akun PIC baru: @${username} (${fullName})`);
    setTimeout(() => setSettingsSuccess(''), 4000);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveAuthorizedLoginsToFirestore(updatedLogins).catch(err => {
        console.error("Firestore Save Logins Error:", err);
      });
      saveAllowedEmailsToFirestore(updatedEmails).catch(err => {
        console.error("Firestore Save Allowed Emails Error:", err);
      });
    }
  };

  const handleRemoveCustomLogin = (usernameToRemove: string) => {
    setSettingsError('');
    setSettingsSuccess('');

    const target = authorizedLogins.find(acc => acc.username === usernameToRemove);
    if (!target) return;

    if (usernameToRemove.toLowerCase() === 'hilmiassidqi27' || target.email.toLowerCase() === 'hilmiassidqi27@gmail.com') {
      setSettingsError('Anda tidak diperbolehkan menghapus akun administrator utama (Hilmi Assidqi).');
      return;
    }

    const updatedLogins = authorizedLogins.filter(acc => acc.username !== usernameToRemove);
    setAuthorizedLogins(updatedLogins);
    setSettingsSuccess(`Berhasil menghapus akun PIC: @${usernameToRemove}`);
    setTimeout(() => setSettingsSuccess(''), 4000);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveAuthorizedLoginsToFirestore(updatedLogins).catch(err => {
        console.error("Firestore Save Logins Error:", err);
      });
    }
  };

  // Load Initial Data with Firestore and LocalStorage Fallback
  useEffect(() => {
    testFirestoreConnection();
    setTimeline(INITIAL_TIMELINE);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          console.log('Firebase authenticated user:', firebaseUser.email);
          const dbPositions = await fetchPositionsFromFirestore();
          const hasSeeded = dbPositions !== null;

          if (hasSeeded) {
            setPositionsList(dbPositions);
            console.log('Loaded positions from Firestore:', dbPositions.length);
          } else {
            console.log('Firestore has no positions config. Seeding...');
            await savePositionsToFirestore(positionsList);
          }

          const dbCandidates = await fetchCandidatesFromFirestore();
          if (dbCandidates.length > 0 || hasSeeded) {
            setCandidates(dbCandidates);
            console.log('Loaded candidates from Firestore:', dbCandidates.length);
          } else {
            console.log('Firestore is empty. Seeding with INITIAL_CANDIDATES...');
            await syncAllCandidatesToFirestore(INITIAL_CANDIDATES);
            setCandidates(INITIAL_CANDIDATES);
          }

          const dbJobs = await fetchJobsFromFirestore();
          if (dbJobs !== null) {
            setJobs(dbJobs);
            console.log('Loaded jobs from Firestore:', dbJobs.length);
          } else {
            console.log('Firestore is empty of jobs. Seeding...');
            await saveJobsToFirestore(INITIAL_JOBS);
            setJobs(INITIAL_JOBS);
          }

          // Fetch or Seed Allowed Emails
          const dbEmails = await fetchAllowedEmailsFromFirestore();
          if (dbEmails !== null && dbEmails.length > 0) {
            setAllowedEmails(dbEmails);
            console.log('Loaded allowed emails from Firestore:', dbEmails.length);
          } else {
            console.log('Firestore has no allowed emails. Seeding with current defaults...');
            await saveAllowedEmailsToFirestore(allowedEmails);
          }

          // Fetch or Seed Authorized Logins
          const dbLogins = await fetchAuthorizedLoginsFromFirestore();
          if (dbLogins !== null && dbLogins.length > 0) {
            setAuthorizedLogins(dbLogins);
            console.log('Loaded authorized logins from Firestore:', dbLogins.length);
          } else {
            console.log('Firestore has no authorized logins. Seeding with current defaults...');
            await saveAuthorizedLoginsToFirestore(authorizedLogins);
          }

          // Fetch or Seed Role Permissions
          const dbPermissions = await fetchRolePermissionsFromFirestore();
          if (dbPermissions !== null && Object.keys(dbPermissions).length > 0) {
            setRolePermissions(dbPermissions);
            console.log('Loaded role permissions from Firestore');
          } else {
            console.log('Firestore has no role permissions. Seeding with current defaults...');
            await saveRolePermissionsToFirestore(rolePermissions);
          }
        } catch (err) {
          console.error('Error fetching data from Firestore:', err);
          // Fallback to local storage on error
          const storedLocal = localStorage.getItem('nexus_local_candidates');
          if (storedLocal) {
            try {
              setCandidates(JSON.parse(storedLocal));
            } catch {
              setCandidates(INITIAL_CANDIDATES);
            }
          } else {
            setCandidates(INITIAL_CANDIDATES);
          }

          const storedLocalJobs = localStorage.getItem('nexus_local_jobs');
          if (storedLocalJobs) {
            try {
              setJobs(JSON.parse(storedLocalJobs));
            } catch {
              setJobs(INITIAL_JOBS);
            }
          } else {
            setJobs(INITIAL_JOBS);
          }
        }
      } else {
        const storedLocal = localStorage.getItem('nexus_local_candidates');
        if (storedLocal) {
          try {
            setCandidates(JSON.parse(storedLocal));
          } catch {
            setCandidates(INITIAL_CANDIDATES);
          }
        } else {
          setCandidates(INITIAL_CANDIDATES);
        }

        const storedLocalJobs = localStorage.getItem('nexus_local_jobs');
        if (storedLocalJobs) {
          try {
            setJobs(JSON.parse(storedLocalJobs));
          } catch {
            setJobs(INITIAL_JOBS);
          }
        } else {
          setJobs(INITIAL_JOBS);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage for fast fallback
  useEffect(() => {
    if (candidates) {
      localStorage.setItem('nexus_local_candidates', JSON.stringify(candidates));
    }
  }, [candidates]);

  useEffect(() => {
    if (jobs) {
      localStorage.setItem('nexus_local_jobs', JSON.stringify(jobs));
    }
  }, [jobs]);

  const handleLogin = (userPayload?: any) => {
    setIsAuthenticated(true);
    if (userPayload) {
      setCurrentUser({
        username: userPayload.username || userPayload.email?.split('@')[0] || 'admin',
        email: userPayload.email || 'Hilmiassidqi27@gmail.com',
        fullName: userPayload.fullName || userPayload.username || 'PIC Rekrutmen',
        role: userPayload.role || 'Administrator',
        avatarUrl: userPayload.avatarUrl || MOCK_USER.avatarUrl
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    localStorage.removeItem('nexus_remember_login');
    localStorage.removeItem('nexus_logged_user');
    
    import('./lib/googleAuth').then(mod => {
      mod.logoutGoogle().catch(err => console.error('Error logging out of Google:', err));
    }).catch(err => console.error(err));
  };

  // Timeline logger utility
  const logActivity = (title: string, description: string) => {
    const today = new Date();
    const formattedDate = today.toLocaleString('en-US', { month: 'short', day: '2-digit' }); // e.g. "Jul 12"
    
    const newLog: TimelineItem = {
      id: `t-${Date.now()}`,
      date: formattedDate,
      title,
      description
    };
    
    setTimeline(prev => [newLog, ...prev]);
  };

  // Add or Update Candidate
  const handleSaveCandidate = (savedData: Omit<Candidate, 'id'> & { id?: number }) => {
    let finalCandidate: Candidate;
    if (savedData.id) {
      // Edit mode
      finalCandidate = savedData as Candidate;
      setCandidates(prev => 
        prev.map(c => c.id === savedData.id ? finalCandidate : c)
      );
      logActivity(
        'Updated Record', 
        `Modified details for ${savedData.name} (${savedData.position})`
      );
    } else {
      // Create mode
      const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
      finalCandidate = {
        ...savedData,
        id: newId,
        dateAdded: new Date().toISOString().split('T')[0]
      } as Candidate;
      
      setCandidates(prev => [finalCandidate, ...prev]);
      logActivity(
        'Candidate Registered', 
        `Added ${savedData.name} as ${savedData.position}`
      );
    }
    setCandidateToEdit(null);

    // Sync to Firestore if authenticated with Google
    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveCandidateToFirestore(finalCandidate).catch(err => {
        console.error("Firestore Save Error:", err);
      });
    }
  };

  // Add Job Opening
  const handleAddJob = (newJobData: Omit<Job, 'id'>) => {
    const newId = `job-${Date.now()}`;
    const newJob: Job = {
      ...newJobData,
      id: newId
    };
    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    
    // Save to Firestore if verified
    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveJobsToFirestore(updatedJobs).catch(err => console.error("Firestore Save Jobs Error:", err));
    }
  };

  // Edit Job Opening
  const handleEditJob = (id: string, updatedJobData: Partial<Job>) => {
    const updatedJobs = jobs.map(j => j.id === id ? { ...j, ...updatedJobData } as Job : j);
    setJobs(updatedJobs);

    // Save to Firestore if verified
    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveJobsToFirestore(updatedJobs).catch(err => console.error("Firestore Save Jobs Error:", err));
    }
  };

  // Delete Job Opening
  const handleDeleteJob = (id: string) => {
    const updatedJobs = jobs.filter(j => j.id !== id);
    setJobs(updatedJobs);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveJobsToFirestore(updatedJobs).catch(err => console.error("Firestore Save Jobs Error:", err));
    }
    logActivity('Job Removed', `Lowongan pekerjaan berhasil dihapus.`);
  };

  // Import Candidates from Google Sheets (Merge and Update by ID)
  const handleImportCandidates = (imported: Partial<Candidate>[]) => {
    let finalCands: Candidate[] = [];
    setCandidates(prev => {
      const candidateMap = new Map<number, Candidate>();
      prev.forEach(c => candidateMap.set(c.id, c));

      // Collect all defined IDs to avoid collision during new ID auto-generation
      const usedIds = new Set<number>(prev.map(c => c.id));
      imported.forEach(c => {
        if (c.id !== undefined && !isNaN(c.id)) {
          usedIds.add(c.id);
        }
      });

      let currentNextId = 1;
      const getNextUniqueId = (): number => {
        while (usedIds.has(currentNextId)) {
          currentNextId++;
        }
        usedIds.add(currentNextId);
        return currentNextId;
      };

      const updatedOrNewCands: Candidate[] = [];

      imported.forEach((c) => {
        const hasValidId = c.id !== undefined && !isNaN(c.id);
        const targetId = hasValidId ? c.id! : getNextUniqueId();

        const existingCand = candidateMap.get(targetId);

        const mergedCandidate: Candidate = {
          id: targetId,
          name: c.name || existingCand?.name || 'Unknown',
          position: c.position || existingCand?.position || 'Scaffolder',
          status: (c.status || existingCand?.status || 'HR Interview') as CandidateStatus,
          hrResult: c.hrResult || existingCand?.hrResult || '-',
          userResult: c.userResult || existingCand?.userResult || '-',
          notes: c.notes || existingCand?.notes || '-',
          dateAdded: c.dateAdded || existingCand?.dateAdded || new Date().toISOString().split('T')[0],
          source: c.source || existingCand?.source || 'LinkedIn',
        };

        if (existingCand) {
          candidateMap.set(targetId, mergedCandidate);
        } else {
          updatedOrNewCands.push(mergedCandidate);
        }
      });

      // Maintain order of original candidates with updated fields, then append any new candidates
      const updatedList = prev.map(c => candidateMap.get(c.id)!);
      finalCands = [...updatedOrNewCands, ...updatedList];
      return finalCands;
    });

    // Sync imported candidates to Firestore in bulk if authenticated with Google
    setTimeout(() => {
      if (auth.currentUser && auth.currentUser.emailVerified && finalCands.length > 0) {
        syncAllCandidatesToFirestore(finalCands).catch(err => {
          console.error("Firestore Import Sync Error:", err);
        });
      }
    }, 100);
  };

  // Replace active candidates entirely with Google Sheet rows while keeping specified IDs intact
  const handleReplaceCandidates = (imported: Partial<Candidate>[]) => {
    const usedIds = new Set<number>();
    imported.forEach(c => {
      if (c.id !== undefined && !isNaN(c.id)) {
        usedIds.add(c.id);
      }
    });

    let currentNextId = 1;
    const getNextUniqueId = (): number => {
      while (usedIds.has(currentNextId)) {
        currentNextId++;
      }
      usedIds.add(currentNextId);
      return currentNextId;
    };

    const nextCands: Candidate[] = imported.map((c) => {
      const hasValidId = c.id !== undefined && !isNaN(c.id);
      const targetId = hasValidId ? c.id! : getNextUniqueId();

      const item: Candidate = {
        id: targetId,
        name: c.name || 'Unknown',
        position: c.position || 'Scaffolder',
        status: (c.status || 'HR Interview') as CandidateStatus,
        hrResult: c.hrResult || '-',
        userResult: c.userResult || '-',
        notes: c.notes || '-',
        dateAdded: c.dateAdded || new Date().toISOString().split('T')[0],
        source: c.source || 'LinkedIn',
      };
      return item;
    });

    setCandidates(nextCands);
    logActivity('Database Synced', `Entire active database synchronized with Google Sheet records.`);

    // Sync the complete replacement to Firestore
    if (auth.currentUser && auth.currentUser.emailVerified) {
      syncAllCandidatesToFirestore(nextCands).catch(err => {
        console.error("Firestore Replace Sync Error:", err);
      });
    }
  };

  // Delete Candidate
  const handleDeleteCandidate = (id: number) => {
    const candidateToRemove = candidates.find(c => c.id === id);
    if (!candidateToRemove) return;

    setCandidates(prev => prev.filter(c => c.id !== id));
    logActivity(
      'Candidate Removed', 
      `${candidateToRemove.name} was removed from the recruitment pipeline`
    );

    // Sync deletion to Firestore if authenticated
    if (auth.currentUser && auth.currentUser.emailVerified) {
      deleteCandidateFromFirestore(id).catch(err => {
        console.error("Firestore Delete Error:", err);
      });
    }
  };

  // Update Status directly
  const handleUpdateStatus = (id: number, status: CandidateStatus) => {
    const existing = candidates.find(c => c.id === id);
    if (!existing) return;

    // Dynamically adjust interview results based on logical statuses
    let hrResult = existing.hrResult;
    let userResult = existing.userResult;
    
    if (status === 'Ditolak') {
      hrResult = 'Tidak Lolos';
      userResult = 'Tidak Lolos';
    } else if (status === 'Onboarding') {
      hrResult = 'Lolos';
      userResult = 'Lolos';
    } else if (status === 'Medical Check') {
      hrResult = 'Lolos';
      userResult = 'Lolos';
    }

    const updatedCand: Candidate = { ...existing, status, hrResult, userResult };

    setCandidates(prev => prev.map(c => c.id === id ? updatedCand : c));
    logActivity(
      'Status Transferred', 
      `Moved ${existing.name} from ${existing.status} to ${status}`
    );

    // Sync to Firestore if authenticated with Google
    if (auth.currentUser && auth.currentUser.emailVerified) {
      saveCandidateToFirestore(updatedCand).catch(err => {
        console.error("Firestore Status Update Error:", err);
      });
    }
  };

  // Open Candidate Editor Modal
  const handleOpenEdit = (candidate: Candidate) => {
    setCandidateToEdit(candidate);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setCandidateToEdit(null);
    setIsModalOpen(true);
  };

  // Helper to add manual timeline item
  const handleAddTimelineItem = (title: string, description: string) => {
    logActivity(title, description);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddCandidate={handleOpenAdd}
        onLogout={handleLogout}
        userRole={currentUser?.role}
        rolePermissions={rolePermissions}
      />

      {/* Main Container */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        
        {/* Top Header navbar */}
        <Header 
          user={currentUser} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          candidates={candidates}
          onLogout={handleLogout}
          onEditProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Content Body */}
        <main className="p-8 flex-1 space-y-8 max-w-[1440px] w-full mx-auto">
          
          {/* TAB 1: Dashboard View */}
          {activeTab === 'dashboard' && (
            <>
              {/* Daily Overview metadata */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                <div>
                  <h3 className="text-xl font-bold text-on-surface lg:text-2xl font-sans leading-none">
                    Daily Tracking Overview
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2">
                    Tanggal Laporan: <span className="font-bold">29-Jun-26</span> | Divisi/Unit: <span className="font-semibold text-primary">Corporate Operations</span>
                  </p>
                </div>
                <div>
                  <span className="status-badge status-lolos inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                    Active Pipeline
                  </span>
                </div>
              </div>

              {/* Dynamic metrics row */}
              <StatsCards candidates={candidates} />

              {/* Candidate main list section */}
              <CandidateTable 
                candidates={candidates} 
                onEditCandidate={handleOpenEdit}
                onDeleteCandidate={handleDeleteCandidate}
                onUpdateStatus={handleUpdateStatus}
                positionsList={combinedPositions}
              />

              {/* Two Column Layout (Stage Conversion & Timeline) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                <div className="lg:col-span-2">
                  <StageConversion candidates={candidates} />
                </div>
                <div>
                  <PipelineTimeline 
                    timelineItems={timeline} 
                    onAddTimelineItem={handleAddTimelineItem}
                  />
                </div>
              </div>
            </>
          )}

          {/* TAB: GeoSource Dashboard */}
          {activeTab === 'geosource' && (
            <GeoSourceDashboard 
              jobs={jobs}
              logActivity={logActivity}
            />
          )}

          {/* TAB: Job Openings */}
          {activeTab === 'jobs' && (
            <JobOpenings 
              jobs={jobs}
              candidates={candidates}
              onAddJob={handleAddJob}
              onEditJob={handleEditJob}
              onDeleteJob={handleDeleteJob}
              logActivity={logActivity}
              onViewPipeline={(positionName) => {
                setSelectedPipelinePosition(positionName);
                setActiveTab('pipeline');
              }}
            />
          )}

          {/* TAB: Pipeline Kanban Board */}
          {activeTab === 'pipeline' && (
            <RecruitmentPipeline 
              candidates={candidates}
              onUpdateStatus={handleUpdateStatus}
              onAddCandidate={handleOpenAdd}
              onEditCandidate={handleOpenEdit}
              positionsList={combinedPositions}
              selectedPosition={selectedPipelinePosition}
              onSelectedPositionChange={setSelectedPipelinePosition}
            />
          )}

          {/* TAB 2: Candidates Detailed Directory */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface font-sans">Candidates Archive</h3>
                <p className="text-xs text-on-surface-variant mt-1">Full database of active and past job applicants.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map(candidate => (
                  <div key={candidate.id} className="bg-white border border-table-border rounded-lg p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-primary">{candidate.name}</h4>
                        <span className="text-[11px] text-on-surface-variant font-mono">{candidate.position}</span>
                      </div>
                      <span className={`status-badge text-[10px] ${
                        candidate.status === 'Ditolak' ? 'status-tidak-lolos' :
                        candidate.status === 'Onboarding' ? 'status-lolos' : 'status-dijadwalkan'
                      }`}>
                        {candidate.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 border-t border-table-border pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">Sumber Lamaran:</span>
                        <span className="font-semibold text-primary">{candidate.source || '-'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">HR Result:</span>
                        <span className="font-bold">{candidate.hrResult}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">User Result:</span>
                        <span className="font-bold">{candidate.userResult}</span>
                      </div>
                      <div className="text-xs mt-2 bg-surface-container-low p-2 rounded text-on-surface-variant italic">
                        "{candidate.notes}"
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2 justify-end">
                      <button 
                        onClick={() => handleOpenEdit(candidate)}
                        className="px-3 py-1 bg-surface-container-low border border-outline-variant hover:bg-surface-container text-[11px] font-semibold rounded cursor-pointer"
                      >
                        Modify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Interviews Agenda */}
          {activeTab === 'interviews' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface font-sans">Interviews Agenda</h3>
                <p className="text-xs text-on-surface-variant mt-1">Calendar coordination and scheduling overview.</p>
              </div>
              
              <div className="bg-white border border-table-border rounded-lg p-6">
                <div className="flex gap-2 mb-6 items-center border-b border-table-border pb-4">
                  <Calendar className="text-primary w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider text-on-surface">Upcoming Scheduled Slots</span>
                </div>
                
                <div className="divide-y divide-table-border">
                  {candidates.filter(c => c.status.includes('Interview')).map(candidate => (
                    <div key={candidate.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="font-bold text-xs text-on-surface">{candidate.name}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{candidate.position} - {candidate.status}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-mono bg-orange-50 text-status-warning px-2.5 py-1 rounded border border-status-warning/20 font-semibold">
                          July 15, 2026 @ 09:00 AM
                        </span>
                        <button 
                          onClick={() => alert(`Interview link generated for ${candidate.name}`)}
                          className="px-3 py-1 bg-primary text-white text-[10px] font-semibold rounded hover:bg-primary-container"
                        >
                          Join Meet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Talent Pool */}
          {activeTab === 'talent' && (
            <CVDatabase 
              candidates={candidates}
              onAddCandidateFromCV={handleSaveCandidate}
              logActivity={logActivity}
              positionsList={combinedPositions}
            />
          )}

          {/* TAB: Google Sheets Sync */}
          {activeTab === 'sheets' && (
            <SheetsSync 
              candidates={candidates} 
              onImportCandidates={handleImportCandidates}
              onReplaceCandidates={handleReplaceCandidates}
              logActivity={logActivity}
            />
          )}

          {/* TAB 6: Reports */}
          {activeTab === 'reports' && (
            <RecruitmentReports 
              candidates={candidates} 
              logActivity={logActivity} 
              positionsList={combinedPositions}
              onDeleteCandidate={handleDeleteCandidate}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {/* TAB 7: Whitelist & Access Control Settings */}
          {activeTab === 'settings' && (currentUser?.role === 'Super Admin' || currentUser?.role === 'Administrator') && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-on-surface font-sans flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <span>Pusat Kontrol Akses & Otorisasi</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Kelola otorisasi akun Google Sign-In dan kredensial sistem (Username/Password) secara mandiri.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 text-status-success border border-green-100 text-xs px-3 py-1.5 rounded-full font-semibold w-fit">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                  Sistem Keamanan Aktif
                </div>
              </div>

              {/* Settings Errors / Success Alerts */}
              {settingsError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-status-error flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-status-error" />
                  <span>{settingsError}</span>
                </div>
              )}

              {settingsSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-status-success flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 shrink-0 text-status-success" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Management Panel */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Sub-tab Navigation */}
                  <div className="flex border-b border-table-border">
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('google')}
                      className={`px-5 py-3 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer flex items-center gap-2 focus:outline-none ${
                        settingsSubTab === 'google'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Otorisasi Email Google (Whitelist)</span>
                      <span className="ml-1 bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                        {allowedEmails.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('credentials')}
                      className={`px-5 py-3 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer flex items-center gap-2 focus:outline-none ${
                        settingsSubTab === 'credentials'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                      <span>Akun PIC & Kredensial Sistem</span>
                      <span className="ml-1 bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                        {authorizedLogins.length}
                      </span>
                    </button>
                  </div>

                  {/* Sub-tab Content: Google Whitelist */}
                  {settingsSubTab === 'google' && (
                    <div className="bg-white border border-table-border rounded-lg p-6 space-y-6 animate-fadeIn">
                      <div>
                        <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-1">Daftar Akun Google Terotorisasi</h4>
                        <p className="text-xs text-on-surface-variant">Hanya akun Google yang terdaftar di bawah ini yang dapat masuk ke sistem menggunakan Google Sign-In.</p>
                      </div>

                      <form onSubmit={handleAddAllowedEmail} className="flex gap-2">
                        <input 
                          type="email"
                          value={newEmailInput}
                          onChange={(e) => setNewEmailInput(e.target.value)}
                          placeholder="Masukkan email Google (misal: staff@gmail.com)..."
                          required
                          className="flex-1 px-3 py-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                        />
                        <button 
                          type="submit"
                          className="bg-primary text-white px-4 py-2 rounded font-semibold text-xs hover:bg-primary-container transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Otorisasi Email</span>
                        </button>
                      </form>

                      <div className="border border-table-border rounded-lg divide-y divide-table-border overflow-hidden">
                        {allowedEmails.map((email) => (
                          <div key={email} className="flex justify-between items-center px-4 py-3.5 bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-xs font-semibold text-on-surface">{email}</span>
                            </div>
                            {email === 'hilmiassidqi27@gmail.com' ? (
                              <span className="text-[9px] bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded font-bold uppercase tracking-wider font-mono">
                                Owner / Admin Utama
                              </span>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => handleRemoveAllowedEmail(email)}
                                className="text-[10px] text-status-error hover:text-red-700 hover:underline cursor-pointer font-bold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Otorisasi</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab Content: Credentials */}
                  {settingsSubTab === 'credentials' && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Form Add Account */}
                      <div className="bg-white border border-table-border rounded-lg p-6 space-y-4">
                        <div>
                          <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-1">Tambah Akun PIC Baru</h4>
                          <p className="text-xs text-on-surface-variant">Buat kredensial login (Username & Password) untuk anggota tim rekrutmen baru.</p>
                        </div>

                        <form onSubmit={handleAddCustomLogin} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nama Lengkap</label>
                            <input 
                              type="text"
                              value={newFullName}
                              onChange={(e) => setNewFullName(e.target.value)}
                              placeholder="Nama lengkap PIC..."
                              required
                              className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Email Google / Akun</label>
                            <input 
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="email@nexus.com..."
                              required
                              className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Username</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs">@</span>
                              <input 
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="username"
                                required
                                className="w-full pl-7 pr-3 py-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Password</label>
                            <input 
                              type="text"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Ketik password..."
                              required
                              className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Role Keanggotaan</label>
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                            >
                              <option value="Recruiter">Recruiter (Staf Rekrutmen)</option>
                              <option value="Administrator">Administrator (PIC Utama)</option>
                              <option value="Manager">Manager (Pimpinan/Direksi)</option>
                              <option value="Super Admin">Super Admin (Hak Akses Penuh)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2 pt-2">
                            <button 
                              type="submit"
                              className="w-full bg-primary text-white py-2 rounded font-bold text-xs hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Daftarkan Akun Kredensial Baru</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Accounts Table */}
                      <div className="bg-white border border-table-border rounded-lg p-6 space-y-4">
                        <div>
                          <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Daftar Akun Kredensial Terdaftar</h4>
                          <p className="text-xs text-on-surface-variant">Berikut adalah akun kredensial yang aktif di sistem offline database.</p>
                        </div>

                        <div className="border border-table-border rounded-lg overflow-hidden divide-y divide-table-border">
                          {authorizedLogins.map((acc) => (
                            <div key={acc.username} className="p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-on-surface">{acc.fullName}</span>
                                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                                    {acc.role}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-on-surface-variant">
                                  <div><span className="font-semibold text-on-surface">Username:</span> @{acc.username}</div>
                                  <div><span className="font-semibold text-on-surface">Password:</span> {acc.password}</div>
                                  <div className="col-span-1 sm:col-span-2"><span className="font-semibold text-on-surface">Email:</span> {acc.email}</div>
                                </div>
                              </div>
                              <div className="flex sm:justify-end items-center">
                                {acc.username === 'hilmiassidqi27' || acc.email === 'hilmiassidqi27@gmail.com' ? (
                                  <span className="text-[9px] bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded font-bold uppercase tracking-wider font-mono">
                                    Owner
                                  </span>
                                ) : (
                                  <button 
                                    type="button"
                                    onClick={() => handleRemoveCustomLogin(acc.username)}
                                    className="text-[10px] text-status-error hover:text-red-700 hover:underline cursor-pointer font-bold flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Akun</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Role Permission Mapping Table */}
                      <div className="bg-white border border-table-border rounded-lg p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Pemetaan Hak Akses Modul</h4>
                            <p className="text-xs text-on-surface-variant">Konfigurasi hak akses modul fungsional untuk setiap peran pengguna di sistem.</p>
                          </div>
                          <span className="text-[10px] bg-green-50 text-status-success border border-green-100 px-2 py-0.5 rounded font-mono font-bold">
                            Cloud Sync Active
                          </span>
                        </div>

                        <div className="overflow-x-auto border border-table-border rounded-lg">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-surface-container-low border-b border-table-border">
                                <th className="px-4 py-3 text-xs font-bold font-sans text-on-surface">Peran / Role</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Dashboard</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">GeoSource</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Job Openings</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Pipeline</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Candidates</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Interviews</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Talent Pool</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Sheets Sync</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Reports</th>
                                <th className="px-3 py-3 text-[10px] font-bold font-sans text-on-surface text-center">Kelola Akses</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-table-border">
                              {[
                                { id: 'Recruiter', label: 'Recruiter (Staf Rekrutmen)', desc: 'Menambahkan & melacak proses kandidat.' },
                                { id: 'Manager', label: 'Manager (Pimpinan/Direksi)', desc: 'Melihat laporan & analisis rekrutmen.' },
                                { id: 'Administrator', label: 'Administrator (PIC Utama)', desc: 'Kelola penuh database & pengaturan dasar.' },
                                { id: 'Super Admin', label: 'Super Admin (Owner)', desc: 'Hak akses administratif penuh atas semua modul.' }
                              ].map((roleRow) => {
                                const modules = [
                                  { key: 'dashboard', label: 'Dashboard' },
                                  { key: 'geosource', label: 'GeoSource' },
                                  { key: 'jobs', label: 'Jobs' },
                                  { key: 'pipeline', label: 'Pipeline' },
                                  { key: 'candidates', label: 'Candidates' },
                                  { key: 'interviews', label: 'Interviews' },
                                  { key: 'talent', label: 'Talent Pool' },
                                  { key: 'sheets', label: 'Sheets Sync' },
                                  { key: 'reports', label: 'Reports' },
                                  { key: 'settings', label: 'Kelola Akses' }
                                ];

                                return (
                                  <tr key={roleRow.id} className="hover:bg-surface-container-low transition-colors">
                                    <td className="px-4 py-3.5">
                                      <div className="font-semibold text-xs text-on-surface">{roleRow.label}</div>
                                      <div className="text-[10px] text-on-surface-variant mt-0.5">{roleRow.desc}</div>
                                    </td>
                                    {modules.map((m) => {
                                      const isChecked = rolePermissions[roleRow.id]?.[m.key] !== false;
                                      const isSuperAdminSettings = roleRow.id === 'Super Admin' && m.key === 'settings';
                                      const isSelfSettings = roleRow.id === currentUser?.role && m.key === 'settings';
                                      const isDisabled = isSuperAdminSettings || isSelfSettings;

                                      return (
                                        <td key={m.key} className="px-3 py-3.5 text-center">
                                          <div className="flex items-center justify-center">
                                            <button
                                              type="button"
                                              disabled={isDisabled}
                                              onClick={() => {
                                                const currentVal = rolePermissions[roleRow.id]?.[m.key] !== false;
                                                const updated = {
                                                  ...rolePermissions,
                                                  [roleRow.id]: {
                                                    ...rolePermissions[roleRow.id],
                                                    [m.key]: !currentVal
                                                  }
                                                };
                                                setRolePermissions(updated);
                                                logActivity('Akses Modul Diubah', `Perubahan hak akses peran ${roleRow.id} untuk modul ${m.label} menjadi ${!currentVal ? 'Aktif' : 'Non-aktif'}.`);
                                                if (auth.currentUser && auth.currentUser.emailVerified) {
                                                  saveRolePermissionsToFirestore(updated).catch(err => {
                                                    console.error("Firestore Save Permissions Error:", err);
                                                  });
                                                }
                                              }}
                                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                isChecked ? 'bg-primary' : 'bg-outline-variant'
                                              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                              <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                                  isChecked ? 'translate-x-4' : 'translate-x-0'
                                                }`}
                                              />
                                            </button>
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-surface-container-low/50 p-3.5 rounded-lg border border-table-border">
                          <p className="text-[10px] text-on-surface-variant leading-relaxed">
                            💡 <span className="font-bold text-primary">Petunjuk Keamanan:</span> Beberapa toggle akses dikunci secara otomatis oleh sistem (ditandai dengan opsi redup) untuk melindungi administrator utama agar tidak terkunci (lockout) dari konsol kontrol utama.
                          </p>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                  
                  {/* Current Active Session */}
                  <div className="bg-white border border-table-border rounded-lg p-6">
                    <h4 className="font-bold text-xs text-primary uppercase tracking-wider mb-4">Sesi Aktif Saat Ini</h4>
                    <div className="flex items-center gap-3">
                      <img 
                        referrerPolicy="no-referrer"
                        src={currentUser.avatarUrl} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover border border-table-border"
                      />
                      <div>
                        <p className="font-sans text-xs font-bold text-on-surface">{currentUser.fullName}</p>
                        <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">{currentUser.email}</p>
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-status-success font-semibold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                          Terhubung (Connected)
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-table-border space-y-2">
                      <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="w-full bg-primary hover:bg-primary-container text-white py-2 px-3 rounded font-sans font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Edit Profil Saya
                      </button>
                    </div>
                  </div>

                  {/* Security Policy Information */}
                  <div className="bg-white border border-table-border rounded-lg p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Kebijakan Otorisasi</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Sistem Nexus Talent menerapkan protokol otorisasi ganda:
                    </p>
                    <ul className="text-[11px] text-on-surface-variant space-y-2 list-disc pl-4">
                      <li>
                        <strong className="text-on-surface">Otentikasi Google:</strong> Menjamin login cepat dan aman via akun Google resmi yang terdaftar di Whitelist.
                      </li>
                      <li>
                        <strong className="text-on-surface">Otentikasi Lokal:</strong> Memungkinkan akses offline atau cadangan via kredensial kustom yang dikelola secara internal oleh pemilik sistem.
                      </li>
                    </ul>
                  </div>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Candidate Editor Modal / Pane */}
      <CandidateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCandidateToEdit(null);
        }}
        onSave={handleSaveCandidate}
        candidateToEdit={candidateToEdit}
        positionsList={combinedPositions}
      />

      {/* User Profile Editor Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onSave={handleUpdateProfile}
      />

    </div>
  );
}
