import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CANDIDATES, 
  INITIAL_TIMELINE, 
  MOCK_USER,
  POSITIONS_LIST
} from './data';
import { Candidate, CandidateStatus, TimelineItem } from './types';
import { auth } from './lib/googleAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  fetchCandidatesFromFirestore, 
  saveCandidateToFirestore, 
  deleteCandidateFromFirestore, 
  syncAllCandidatesToFirestore,
  testFirestoreConnection
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
  Clock
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

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    localStorage.setItem('nexus_allowed_emails', JSON.stringify(allowedEmails));
  }, [allowedEmails]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);

  // Settings Whitelist States
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

    setAllowedEmails(prev => [...prev, email]);
    setNewEmailInput('');
    setSettingsSuccess(`Berhasil mengizinkan email Google: ${email}`);
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  const handleRemoveAllowedEmail = (emailToRemove: string) => {
    setSettingsError('');
    setSettingsSuccess('');

    if (emailToRemove.toLowerCase() === 'hilmiassidqi27@gmail.com') {
      setSettingsError('Anda tidak diperbolehkan menghapus email administrator utama (Hilmiassidqi27@gmail.com).');
      return;
    }

    setAllowedEmails(prev => prev.filter(e => e !== emailToRemove));
    setSettingsSuccess(`Berhasil menghapus otorisasi email: ${emailToRemove}`);
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  // Load Initial Data with Firestore and LocalStorage Fallback
  useEffect(() => {
    testFirestoreConnection();
    setTimeline(INITIAL_TIMELINE);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          console.log('Firebase authenticated user:', firebaseUser.email);
          const dbCandidates = await fetchCandidatesFromFirestore();
          if (dbCandidates && dbCandidates.length > 0) {
            setCandidates(dbCandidates);
            console.log('Loaded candidates from Firestore:', dbCandidates.length);
          } else {
            console.log('Firestore is empty. Seeding with INITIAL_CANDIDATES...');
            await syncAllCandidatesToFirestore(INITIAL_CANDIDATES);
            setCandidates(INITIAL_CANDIDATES);
          }
        } catch (err) {
          console.error('Error fetching candidates from Firestore:', err);
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
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage for fast fallback
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      localStorage.setItem('nexus_local_candidates', JSON.stringify(candidates));
    }
  }, [candidates]);

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

          {/* TAB 3: Job Openings */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface font-sans">Active Job Openings</h3>
                <p className="text-xs text-on-surface-variant mt-1">Industrial and corporate recruitment requirements.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {POSITIONS_LIST.map((jobName, idx) => {
                  const jobCandidates = candidates.filter(c => c.position === jobName);
                  return (
                    <div key={jobName} className="bg-white border border-table-border rounded-lg p-6 flex justify-between items-center hover:border-primary/40 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="text-primary w-5 h-5 shrink-0" />
                          <h4 className="font-bold text-sm text-primary">{jobName}</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant">Divisi: Corporate Operations</p>
                        <div className="flex gap-4 text-xs mt-4">
                          <span>Applicants: <strong className="text-primary">{jobCandidates.length}</strong></span>
                          <span>Hiring Target: <strong>3</strong></span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <span className="status-badge status-lolos">OPEN</span>
                        <p className="text-[10px] font-mono text-on-surface-variant">Created June 2026</p>
                      </div>
                    </div>
                  );
                })}
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
            />
          )}

          {/* TAB 7: Whitelist Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface font-sans">Sistem Keamanan & Otorisasi</h3>
                <p className="text-xs text-on-surface-variant mt-1">Kelola daftar email Google yang diizinkan untuk masuk ke sistem Nexus Talent.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Whitelist Panel */}
                <div className="lg:col-span-2 bg-white border border-table-border rounded-lg p-6 space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-2">Daftar Email Google Terotorisasi (Whitelist)</h4>
                    <p className="text-xs text-on-surface-variant">Hanya akun Google yang berada dalam daftar ini yang dapat login menggunakan Google Sign-In.</p>
                  </div>

                  {settingsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-status-error flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-status-error" />
                      <span>{settingsError}</span>
                    </div>
                  )}

                  {settingsSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-status-success flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-status-success" />
                      <span>{settingsSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddAllowedEmail} className="flex gap-2">
                    <input 
                      type="email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="Masukkan email Google baru..."
                      required
                      className="flex-1 px-3 py-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                    />
                    <button 
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded font-semibold text-xs hover:bg-primary-container transition-colors cursor-pointer"
                    >
                      Otorisasi Email
                    </button>
                  </form>

                  <div className="border border-table-border rounded-lg divide-y divide-table-border">
                    {allowedEmails.map((email) => (
                      <div key={email} className="flex justify-between items-center px-4 py-3 bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                        <span className="text-xs font-medium text-on-surface">{email}</span>
                        {email === 'hilmiassidqi27@gmail.com' ? (
                          <span className="text-[10px] bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded font-semibold uppercase tracking-wider">
                            Owner
                          </span>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => handleRemoveAllowedEmail(email)}
                            className="text-[10px] text-status-error hover:underline cursor-pointer font-semibold"
                          >
                            Hapus Akses
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info and Simulation Panel */}
                <div className="space-y-6">
                  {/* Current Active Session */}
                  <div className="bg-white border border-table-border rounded-lg p-6">
                    <h4 className="font-bold text-xs text-primary uppercase tracking-wider mb-4">Sesi Aktif Saat Ini</h4>
                    <div className="flex items-center gap-3">
                      <img 
                        referrerPolicy="no-referrer"
                        src={currentUser.avatarUrl} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover border border-table-border"
                      />
                      <div>
                        <p className="font-sans text-xs font-bold text-on-surface">{currentUser.fullName}</p>
                        <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">{currentUser.email}</p>
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-status-success font-semibold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                          Diingat (Remembered)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Password Login Info */}
                  <div className="bg-white border border-table-border rounded-lg p-6 space-y-3">
                    <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Metode Akses Alternatif</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Selain menggunakan Google Sign-In, sistem ini juga dapat dimasuki secara offline menggunakan kredensial terotorisasi berikut:
                    </p>
                    <div className="text-[11px] font-mono bg-surface-container-low p-3 rounded border border-table-border space-y-2">
                      <div>
                        <span className="text-primary font-bold">Username:</span> admin<br/>
                        <span className="text-primary font-bold">Password:</span> password123<br/>
                        <span className="text-on-surface-variant font-medium">(Role: Administrator)</span>
                      </div>
                      <div className="border-t border-table-border pt-2 mt-2">
                        <span className="text-primary font-bold">Username:</span> hilmiassidqi27@gmail.com<br/>
                        <span className="text-primary font-bold">Password:</span> password123<br/>
                        <span className="text-on-surface-variant font-medium">(Role: Super Admin)</span>
                      </div>
                    </div>
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
      />

    </div>
  );
}
