import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  initAuth 
} from '../lib/googleAuth';
import { 
  getSpreadsheetInfo, 
  createSpreadsheet, 
  exportCandidatesToSheet, 
  importCandidatesFromSheet,
  parseRawSheetData
} from '../lib/sheetsService';
import { Candidate } from '../types';
import { 
  FileSpreadsheet, 
  Share2, 
  Download, 
  Upload, 
  UploadCloud,
  ExternalLink, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface SheetsSyncProps {
  candidates: Candidate[];
  onImportCandidates: (newCandidates: Partial<Candidate>[]) => void;
  onReplaceCandidates: (newCandidates: Partial<Candidate>[]) => void;
  logActivity: (title: string, description: string) => void;
}

export default function SheetsSync({ candidates, onImportCandidates, onReplaceCandidates, logActivity }: SheetsSyncProps) {
  // Auth state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Active Database Sheet State (User's specific spreadsheet)
  const [userSpreadsheetId, setUserSpreadsheetId] = useState(() => {
    return localStorage.getItem('recruitpro_user_spreadsheet_id') || '15lcJ5Z89Jz5snwkesaLOvH8jN3Vf5b8i6iCgvGDniQI';
  });
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempIdInput, setTempIdInput] = useState(userSpreadsheetId);
  const [dbSheetInfo, setDbSheetInfo] = useState<{ title: string; sheets: string[]; url: string } | null>(null);
  const [isLoadingDbInfo, setIsLoadingDbInfo] = useState(false);
  const [dbSheetError, setDbSheetError] = useState<string | null>(null);
  const [dbSelectedTab, setDbSelectedTab] = useState('Sheet1');
  const [isPullingDb, setIsPullingDb] = useState(false);
  const [isPushingDb, setIsPushingDb] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // Export state
  const [newSheetTitle, setNewSheetTitle] = useState(`RecruitPro Talent Pipeline - ${new Date().toISOString().split('T')[0]}`);
  const [existingSpreadsheetId, setExistingSpreadsheetId] = useState('15lcJ5Z89Jz5snwkesaLOvH8jN3Vf5b8i6iCgvGDniQI');
  const [existingSheetName, setExistingSheetName] = useState('Sheet1');
  const [exportMode, setExportMode] = useState<'new' | 'existing'>('existing');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; url?: string; title?: string; error?: string } | null>(null);

  interface StagedFile {
    id: string;
    name: string;
    type: 'google' | 'file';
    count: number;
    candidates: Partial<Candidate>[];
  }

  // Import state
  const [importSpreadsheetId, setImportSpreadsheetId] = useState('15lcJ5Z89Jz5snwkesaLOvH8jN3Vf5b8i6iCgvGDniQI');
  const [importSheetName, setImportSheetName] = useState('Sheet1');
  const [isReadingImport, setIsReadingImport] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Local Excel/CSV Upload State
  const [importMethod, setImportMethod] = useState<'google' | 'file'>('google');
  const [isDragging, setIsDragging] = useState(false);

  const importPreview = stagedFiles.length > 0 ? stagedFiles.flatMap(f => f.candidates) : null;
  const importSource = stagedFiles.map(f => f.name).join(', ');

  // Initialize Auth listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Load sheet workspace metadata on connect or when spreadsheet ID changes
  useEffect(() => {
    if (accessToken && userSpreadsheetId) {
      setIsLoadingDbInfo(true);
      setDbSheetError(null);
      getSpreadsheetInfo(accessToken, userSpreadsheetId)
        .then((info) => {
          setDbSheetInfo({
            title: info.title,
            sheets: info.sheets,
            url: info.url
          });
          if (info.sheets && info.sheets.length > 0) {
            setDbSelectedTab(info.sheets[0]);
            setExistingSheetName(info.sheets[0]);
            setImportSheetName(info.sheets[0]);
          }
        })
        .catch((err: any) => {
          console.error('Failed to load primary database info:', err);
          setDbSheetError(err.message || 'Error connecting to spreadsheet. Please make sure you have access to this Google Sheet.');
        })
        .finally(() => {
          setIsLoadingDbInfo(false);
        });
    } else {
      setDbSheetInfo(null);
    }
  }, [accessToken, userSpreadsheetId]);

  const handlePullDatabase = async () => {
    if (!accessToken) return;
    setIsPullingDb(true);
    setDbSheetError(null);
    try {
      logActivity('Sheet Sync Pull', `Pulling candidate rows from G-Sheets database tab: "${dbSelectedTab}"`);
      const parsed = await importCandidatesFromSheet(accessToken, userSpreadsheetId, dbSelectedTab);
      if (parsed && parsed.length > 0) {
        onReplaceCandidates(parsed);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncedTime(`Pulled today at ${timeStr}`);
        logActivity('Sync Success', `Successfully loaded ${parsed.length} candidate database rows from Google Sheets.`);
      } else {
        alert('The worksheet contains no candidates or valid headers.');
      }
    } catch (err: any) {
      console.error(err);
      setDbSheetError(err.message || 'Failed to pull rows from G-Sheets database.');
      alert('Sync Pull Error: ' + (err.message || err));
    } finally {
      setIsPullingDb(false);
    }
  };

  const handlePushDatabase = async () => {
    if (!accessToken) return;
    const confirmPush = window.confirm(
      `Are you sure you want to write ${candidates.length} active application candidates back into Google Sheet tab "${dbSelectedTab}"? This will overwrite the tab data.`
    );
    if (!confirmPush) return;

    setIsPushingDb(true);
    setDbSheetError(null);
    try {
      logActivity('Sheet Sync Push', `Pushing active candidates to Google Sheet tab: "${dbSelectedTab}"`);
      await exportCandidatesToSheet(accessToken, userSpreadsheetId, dbSelectedTab, candidates);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedTime(`Pushed today at ${timeStr}`);
      logActivity('Push Success', `Overwrote G-Sheet with ${candidates.length} current candidates.`);
      alert(`Worksheet Synced! Wrote ${candidates.length} records successfully.`);
    } catch (err: any) {
      console.error(err);
      setDbSheetError(err.message || 'Failed to push records to Google Sheets.');
      alert('Sync Push Error: ' + (err.message || err));
    } finally {
      setIsPushingDb(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setExportResult(null);
    setImportError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        logActivity('Google Connected', `PIC authenticated with Google Account: ${res.user.email}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to connect to Google: ' + (err.message || err));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Disconnect your Google account? You will need to re-authenticate to sync spreadsheets.')) {
      try {
        await logoutGoogle();
        setGoogleUser(null);
        setAccessToken(null);
        setStagedFiles([]);
        setExportResult(null);
        logActivity('Google Disconnected', 'Logged out of Google Drive & Sheets services.');
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  const handleCreateAndExport = async () => {
    if (!accessToken) return;
    setIsExporting(true);
    setExportResult(null);
    try {
      logActivity('Export Initiated', 'Creating new Google Spreadsheet...');
      const info = await createSpreadsheet(accessToken, newSheetTitle);
      
      // The default sheet tab is typically "Sheet1" or similar
      const firstTabName = info.sheets[0] || 'Sheet1';
      
      await exportCandidatesToSheet(accessToken, info.id, firstTabName, candidates);
      
      setExportResult({
        success: true,
        title: info.title,
        url: info.url
      });
      logActivity('Export Completed', `Successfully exported ${candidates.length} candidates to Google Sheets: "${info.title}"`);
    } catch (err: any) {
      console.error(err);
      setExportResult({
        success: false,
        error: err.message || 'Unknown error occurred during export.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToExisting = async () => {
    if (!accessToken) return;
    if (!existingSpreadsheetId.trim()) {
      alert('Please enter a valid Spreadsheet ID');
      return;
    }
    
    setIsExporting(true);
    setExportResult(null);
    try {
      logActivity('Export Initiated', `Writing candidates to spreadsheet ID: ${existingSpreadsheetId}`);
      
      // Fetch sheet metadata to confirm it exists and check if sheet tab is valid
      const info = await getSpreadsheetInfo(accessToken, existingSpreadsheetId.trim());
      
      const targetSheetName = existingSheetName.trim() || info.sheets[0] || 'Sheet1';
      
      // Explicit user confirmation before overwriting data in an existing sheet
      const proceed = window.confirm(
        `Are you sure you want to write candidate data to tab "${targetSheetName}" of spreadsheet "${info.title}"? This will overwrite existing headers and data in that tab.`
      );
      if (!proceed) {
        setIsExporting(false);
        return;
      }

      await exportCandidatesToSheet(accessToken, info.id, targetSheetName, candidates);

      setExportResult({
        success: true,
        title: info.title,
        url: info.url
      });
      logActivity('Export Completed', `Updated existing Google Sheet "${info.title}" with current pipeline.`);
    } catch (err: any) {
      console.error(err);
      setExportResult({
        success: false,
        error: err.message || 'Failed to update the existing spreadsheet.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewImport = async () => {
    if (!accessToken) return;
    if (!importSpreadsheetId.trim()) {
      setImportError('Please enter a valid Google Spreadsheet ID.');
      return;
    }
    setIsReadingImport(true);
    setImportError(null);
    try {
      const parsed = await importCandidatesFromSheet(accessToken, importSpreadsheetId.trim(), importSheetName.trim());
      
      const newStaged: StagedFile = {
        id: `gs-${importSpreadsheetId.trim()}-${importSheetName.trim()}`,
        name: `Google Sheet: ${importSheetName.trim()} (${importSpreadsheetId.trim().substring(0, 6)}...)`,
        type: 'google',
        count: parsed.length,
        candidates: parsed
      };

      setStagedFiles(prev => {
        const filtered = prev.filter(f => f.id !== newStaged.id);
        return [...filtered, newStaged];
      });

      logActivity('Sheet Fetched', `Loaded Google Sheet "${importSheetName.trim()}" with ${parsed.length} candidate rows staged.`);
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || 'Failed to fetch or parse candidates from sheet.');
    } finally {
      setIsReadingImport(false);
    }
  };

  const handleMultipleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setImportError(null);
    setIsReadingImport(true);

    const fileList = Array.from(files);
    const newStagedFiles: StagedFile[] = [];
    const errors: string[] = [];

    const readAndParseFile = (file: File): Promise<StagedFile> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) {
              return reject(new Error(`Gagal membaca file ${file.name}`));
            }
            
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
              return reject(new Error(`File "${file.name}" tidak memiliki sheet.`));
            }
            
            const worksheet = workbook.Sheets[firstSheetName];
            const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
            
            if (rawRows.length === 0) {
              return reject(new Error(`File "${file.name}" kosong.`));
            }
            
            const stringRows: string[][] = rawRows.map(row => 
              Array.isArray(row) 
                ? row.map(cell => cell !== null && cell !== undefined ? String(cell) : '') 
                : []
            );
            
            const parsed = parseRawSheetData(stringRows);
            if (parsed.length === 0) {
              return reject(new Error(`Header kolom file "${file.name}" tidak cocok. Pastikan ada kolom Nama/Name, Posisi/Position, Status.`));
            }
            
            resolve({
              id: `file-${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              type: 'file',
              count: parsed.length,
              candidates: parsed
            });
          } catch (err: any) {
            reject(new Error(`Gagal mengurai "${file.name}": ${err.message || err}`));
          }
        };
        reader.onerror = () => reject(new Error(`Gagal membaca "${file.name}"`));
        reader.readAsArrayBuffer(file);
      });
    };

    try {
      const results = await Promise.allSettled(fileList.map(f => readAndParseFile(f)));
      
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          newStagedFiles.push(res.value);
          logActivity('File Uploaded', `Processed local file "${res.value.name}" with ${res.value.count} candidate rows.`);
        } else {
          errors.push(res.reason.message || String(res.reason));
        }
      });

      if (newStagedFiles.length > 0) {
        setStagedFiles(prev => {
          const existingNames = new Set(newStagedFiles.map(n => n.name));
          const filtered = prev.filter(f => !existingNames.has(f.name));
          return [...filtered, ...newStagedFiles];
        });
      }

      if (errors.length > 0) {
        setImportError(`Berhasil memproses ${newStagedFiles.length} file. Gagal pada file berikut:\n` + errors.join('\n'));
      }
    } catch (globalErr: any) {
      setImportError(globalErr.message || 'Gagal memproses file unggahan.');
    } finally {
      setIsReadingImport(false);
    }
  };

  const handleRemoveStagedFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.length === 0) return;
    setIsImporting(true);
    try {
      onImportCandidates(importPreview);
      logActivity('Import Completed', `Successfully imported ${importPreview.length} candidates from ${importSource}.`);
      alert(`Import Berhasil! Menambahkan ${importPreview.length} kandidat dari ${importSource} ke dalam database pipeline.`);
      setStagedFiles([]);
      if (importMethod === 'google') {
        setImportSpreadsheetId('');
      }
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengimpor kandidat: ' + err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Info */}
      <div>
        <h3 className="text-xl font-bold text-on-surface font-sans">Google Sheets Integration</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Sync candidates, export interview status lists, or load batches of prospects directly from live G-Suite worksheets.
        </p>
      </div>

      {/* Grid: Left connection status / Right Sync functions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Google Account Connection Status Card */}
        <div className="lg:col-span-1 bg-white border border-table-border rounded-lg p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Account Connection</h4>
            
            {googleUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50/50 border border-green-100 rounded-lg">
                  {googleUser.photoURL ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={googleUser.photoURL} 
                      alt="Google User" 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-green-200" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-sm">
                      {googleUser.displayName?.charAt(0) || googleUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-sans text-xs font-semibold text-on-surface leading-tight truncate">
                      {googleUser.displayName || 'Authorized Member'}
                    </p>
                    <p className="font-mono text-[10px] text-on-surface-variant leading-none truncate mt-0.5">
                      {googleUser.email}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3.5 rounded space-y-2">
                  <div className="flex items-center gap-1.5 text-status-success font-semibold">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Drive & Sheets Connected</span>
                  </div>
                  <p className="text-[11px]">
                    You can now create, read, and write to spreadsheets in your Google Workspace account with permission.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center mx-auto text-on-surface-variant">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-xs font-semibold text-on-surface">No G-Suite Account Linked</p>
                  <p className="font-sans text-[11px] text-on-surface-variant max-w-[200px] mx-auto">
                    Link your Google Account to unlock bi-directional spreadsheet synchronization.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            {googleUser ? (
              <button
                onClick={handleDisconnect}
                className="w-full text-center py-2 border border-red-200 text-status-error text-xs font-semibold rounded hover:bg-red-50/50 transition-colors focus:outline-none cursor-pointer"
              >
                Disconnect Account
              </button>
            ) : (
              /* Official Google Sign-In resembling style */
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 h-11 px-4 bg-white border border-outline-variant hover:border-primary/50 text-xs font-semibold text-on-surface hover:bg-surface-container-low/20 rounded shadow-sm transition-all cursor-pointer active:scale-[0.99]"
              >
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Sign In with Google</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Sync Modules (Export / Import) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Action Modules - Locked if not connected */}
          {!googleUser ? (
            <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-lg p-10 text-center flex flex-col items-center justify-center min-h-[350px]">
              <AlertTriangle className="w-10 h-10 text-status-warning/80 mb-3" />
              <h5 className="font-bold text-sm text-on-surface">Spreadsheet Actions Locked</h5>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-6 leading-relaxed">
                Connect your Google Account first to activate the recruitment pipeline exporter and smart sheets importer.
              </p>
              <button
                onClick={handleConnect}
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded hover:bg-primary-container transition-colors focus:outline-none cursor-pointer"
              >
                Authenticate with Google
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SPECIAL FEATURE: Primary Linked Database Sheet */}
              <div className="bg-gradient-to-br from-green-50/70 to-emerald-50/30 border border-green-200 rounded-lg p-6 space-y-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                  <FileSpreadsheet className="w-48 h-48 text-green-700" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 rounded-lg text-green-700 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wider mb-0.5">
                        Primary Database Sheet
                      </span>
                      <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                        {isLoadingDbInfo ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant font-normal">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-green-700" /> Fetching spreadsheet details...
                          </span>
                        ) : dbSheetInfo ? (
                          <span>{dbSheetInfo.title}</span>
                        ) : (
                          <span>Candidate Pipeline Database</span>
                        )}
                      </h4>
                    </div>
                  </div>
                  
                  <a 
                    href={`https://docs.google.com/spreadsheets/d/${userSpreadsheetId}/edit?usp=sharing`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors focus:outline-none"
                  >
                    <span>Open Live Spreadsheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Spreadsheet ID Configuration Section */}
                <div className="flex flex-col gap-2 p-3 bg-white border border-green-100 rounded-lg text-xs relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-green-800 uppercase tracking-wider font-semibold">
                      Google Spreadsheet ID
                    </span>
                    {!isEditingId ? (
                      <button 
                        type="button"
                        onClick={() => {
                          setTempIdInput(userSpreadsheetId);
                          setIsEditingId(true);
                        }}
                        className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Ganti ID Spreadsheet
                      </button>
                    ) : null}
                  </div>
                  
                  {!isEditingId ? (
                    <div className="font-mono text-xs text-on-surface-variant truncate select-all bg-surface-container-lowest p-1.5 rounded border border-outline-variant/40" title="Klik ganda untuk memilih semua">
                      {userSpreadsheetId}
                    </div>
                  ) : (
                    <div className="space-y-2 mt-1">
                      <input
                        type="text"
                        value={tempIdInput}
                        onChange={(e) => setTempIdInput(e.target.value)}
                        placeholder="Masukkan ID Google Spreadsheet baru Anda..."
                        className="w-full h-9 px-3 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary font-mono shadow-sm"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (tempIdInput.trim()) {
                              localStorage.setItem('recruitpro_user_spreadsheet_id', tempIdInput.trim());
                              setUserSpreadsheetId(tempIdInput.trim());
                              setIsEditingId(false);
                            } else {
                              alert('ID tidak boleh kosong.');
                            }
                          }}
                          className="bg-primary text-white text-[11px] px-3 py-1.5 rounded hover:bg-primary/90 font-semibold transition-colors cursor-pointer"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingId(false)}
                          className="border border-outline bg-white text-on-surface text-[11px] px-3 py-1.5 rounded hover:bg-surface-container-low transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const defaultId = '15lcJ5Z89Jz5snwkesaLOvH8jN3Vf5b8i6iCgvGDniQI';
                            setTempIdInput(defaultId);
                          }}
                          className="text-[10px] text-on-surface-variant hover:underline ml-auto cursor-pointer"
                        >
                          Gunakan Default Demo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {dbSheetError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-[11px] text-status-error flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{dbSheetError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* Tab Selector */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-green-800 uppercase tracking-wider font-semibold block">Select Database Tab</label>
                    <div className="relative">
                      {dbSheetInfo && dbSheetInfo.sheets.length > 0 ? (
                        <select 
                          value={dbSelectedTab}
                          onChange={(e) => setDbSelectedTab(e.target.value)}
                          className="w-full h-10 pl-3 pr-8 bg-white border border-green-200 rounded text-xs text-on-surface focus:outline-none focus:border-green-600 appearance-none cursor-pointer font-medium"
                        >
                          {dbSheetInfo.sheets.map(sheet => (
                            <option key={sheet} value={sheet}>{sheet}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={dbSelectedTab}
                          onChange={(e) => setDbSelectedTab(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-green-200 rounded text-xs focus:outline-none focus:border-green-600 font-medium"
                        />
                      )}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-green-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Pull Action Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handlePullDatabase}
                      disabled={isPullingDb || isPushingDb}
                      className="w-full h-10 px-4 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded transition-colors shadow-sm focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isPullingDb ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Pull & Sync App State</span>
                    </button>
                  </div>

                  {/* Push Action Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handlePushDatabase}
                      disabled={isPullingDb || isPushingDb}
                      className="w-full h-10 px-4 bg-white border border-green-300 hover:border-green-400 text-green-700 hover:bg-green-50 font-semibold text-xs rounded transition-colors shadow-sm focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isPushingDb ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Push Local Changes</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-green-800/80 bg-green-100/50 p-2.5 rounded-md">
                  <div className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-green-700 shrink-0" />
                    <span>Database size: <strong>{candidates.length} candidates</strong> currently managed in local session.</span>
                  </div>
                  {lastSyncedTime && (
                    <span className="font-mono text-[10px] text-green-700 bg-white px-2 py-0.5 rounded shadow-sm border border-green-200">
                      {lastSyncedTime}
                    </span>
                  )}
                </div>
              </div>

              {/* module 1: Export Card */}
              <div className="bg-white border border-table-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-table-border pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="text-primary w-5 h-5" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Export Active Pipeline</h4>
                  </div>
                  <div className="flex bg-surface-container-low rounded p-0.5 text-[10px] font-semibold border border-table-border">
                    <button 
                      onClick={() => { setExportMode('new'); setExportResult(null); }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${exportMode === 'new' ? 'bg-white shadow text-primary' : 'text-on-surface-variant'}`}
                    >
                      New Sheet
                    </button>
                    <button 
                      onClick={() => { setExportMode('existing'); setExportResult(null); }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${exportMode === 'existing' ? 'bg-white shadow text-primary' : 'text-on-surface-variant'}`}
                    >
                      Existing Sheet
                    </button>
                  </div>
                </div>

                {exportMode === 'new' ? (
                  <div className="space-y-4">
                    <p className="text-xs text-on-surface-variant">
                      Creates a pristine, formatted Google Spreadsheet in your Drive and populates it with all {candidates.length} candidate rows.
                    </p>
                    <div className="space-y-1.5">
                      <label className="font-mono text-[10px] text-on-surface uppercase tracking-wider font-semibold block">Spreadsheet Title</label>
                      <input 
                        type="text" 
                        value={newSheetTitle}
                        onChange={(e) => setNewSheetTitle(e.target.value)}
                        className="w-full h-10 px-3 border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={handleCreateAndExport}
                      disabled={isExporting}
                      className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded hover:bg-primary-container transition-colors flex items-center justify-center gap-2 w-full sm:w-auto focus:outline-none disabled:opacity-55 cursor-pointer"
                    >
                      {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{isExporting ? 'Generating Spreadsheet...' : 'Export to New Spreadsheet'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-on-surface-variant">
                      Injects or overwrites candidates list directly into a specified spreadsheet and sheet tab tabulator.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-mono text-[10px] text-on-surface uppercase tracking-wider font-semibold block">Spreadsheet ID</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1uK7f9K9V0..."
                          value={existingSpreadsheetId}
                          onChange={(e) => setExistingSpreadsheetId(e.target.value)}
                          className="w-full h-10 px-3 border border-outline-variant rounded text-xs focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-on-surface uppercase tracking-wider font-semibold block">Sheet Tab Name</label>
                        <input 
                          type="text" 
                          placeholder="Sheet1"
                          value={existingSheetName}
                          onChange={(e) => setExistingSheetName(e.target.value)}
                          className="w-full h-10 px-3 border border-outline-variant rounded text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleExportToExisting}
                      disabled={isExporting || !existingSpreadsheetId.trim()}
                      className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded hover:bg-primary-container transition-colors flex items-center justify-center gap-2 w-full sm:w-auto focus:outline-none disabled:opacity-55 cursor-pointer"
                    >
                      {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      <span>{isExporting ? 'Updating Sheet...' : 'Overwrite Selected Tab'}</span>
                    </button>
                  </div>
                )}

                {/* Export Feedback Result */}
                {exportResult && (
                  <div className={`p-4 rounded-lg border flex gap-3 items-start ${exportResult.success ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                    <div className="mt-0.5">
                      {exportResult.success ? <CheckCircle className="w-5 h-5 text-status-success" /> : <AlertTriangle className="w-5 h-5 text-status-error" />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h5 className={`font-bold text-xs ${exportResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {exportResult.success ? 'Export Completed Successfully!' : 'Export Failed'}
                      </h5>
                      <p className={`text-[11px] leading-relaxed ${exportResult.success ? 'text-green-700/85' : 'text-red-700/85'}`}>
                        {exportResult.success 
                          ? `All data was written successfully. You can open and edit your pipeline spreadsheet directly.`
                          : exportResult.error
                        }
                      </p>
                      {exportResult.success && exportResult.url && (
                        <div className="pt-2">
                          <a 
                            href={exportResult.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-green-700 text-white font-semibold text-[10px] px-3 py-1.5 rounded hover:bg-green-800 transition-colors shadow-sm focus:outline-none cursor-pointer"
                          >
                            <span>Open In Google Sheets</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* module 2: Import Card */}
              <div className="bg-white border border-table-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-table-border pb-3">
                  <div className="flex items-center gap-2">
                    <Download className="text-secondary w-5 h-5" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">Import Candidates</h4>
                  </div>
                  <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                    <Info className="w-3 h-3" /> Smart Header Mapping Enabled
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Import rows from any worksheet. The system maps position, status, results, and notes automatically. 
                  (Headers like <em>ID</em>, <em>Name</em>, and <em>Position</em> are searched dynamically).
                </p>

                {/* Mode Selector Tabs */}
                <div className="flex bg-surface-container-low rounded p-0.5 text-[11px] font-semibold border border-table-border w-fit">
                  <button 
                    type="button"
                    onClick={() => { setImportMethod('google'); setStagedFiles([]); setImportError(null); }}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${importMethod === 'google' ? 'bg-white shadow text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span>Google Sheets</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setImportMethod('file'); setStagedFiles([]); setImportError(null); }}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${importMethod === 'file' ? 'bg-white shadow text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span>Excel / CSV File</span>
                  </button>
                </div>

                {/* List of staged files */}
                {stagedFiles.length > 0 && (
                  <div className="space-y-2 border border-table-border rounded-lg p-3 bg-surface-container-lowest animate-fadeIn">
                    <div className="flex justify-between items-center pb-2 border-b border-table-border">
                      <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider block">Staged Files / Sheets ({stagedFiles.length})</span>
                      <button 
                        type="button"
                        onClick={() => { setStagedFiles([]); setImportError(null); }}
                        className="text-[10px] text-status-error hover:underline cursor-pointer font-semibold"
                      >
                        Hapus Semua
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {stagedFiles.map((file) => (
                        <div key={file.id} className="flex justify-between items-center text-xs p-2 rounded bg-surface-container-low border border-table-border hover:bg-surface-container-high transition-colors">
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <FileSpreadsheet className={`w-4 h-4 shrink-0 ${file.type === 'google' ? 'text-green-600' : 'text-blue-500'}`} />
                            <span className="font-medium text-on-surface truncate" title={file.name}>{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-semibold">{file.count} kandidat</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveStagedFile(file.id)}
                              className="text-on-surface-variant hover:text-status-error transition-colors cursor-pointer p-0.5"
                              title="Hapus file ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importMethod === 'file' ? (
                  <div className="space-y-4">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Unggah file Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) atau <strong>.csv</strong> untuk mengimpor banyak kandidat sekaligus. Anda dapat mengunggah beberapa file sekaligus.
                    </p>
                    
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all ${
                        isDragging 
                          ? 'border-secondary bg-secondary/5' 
                          : 'border-outline-variant hover:border-secondary bg-surface-container-lowest'
                      }`}
                    >
                      <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-secondary animate-bounce' : 'text-on-surface-variant/70'}`} />
                      <p className="text-xs font-semibold text-on-surface">
                        Tarik dan lepas file Anda di sini, atau klik tombol di bawah
                      </p>
                      <p className="text-[10px] text-on-surface-variant mt-1 mb-4">
                        Mendukung beberapa file .xlsx, .xls, .csv hingga 10MB
                      </p>
                      
                      <input 
                        type="file" 
                        id="excel-import-file" 
                        accept=".xlsx,.xls,.csv" 
                        multiple
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleMultipleFilesUpload(e.target.files);
                          }
                        }}
                      />
                      <label 
                        htmlFor="excel-import-file"
                        className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-secondary/90 transition-colors cursor-pointer inline-block"
                      >
                        Pilih File dari Komputer
                      </label>
                    </div>

                    {importPreview && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setStagedFiles([]); setImportError(null); }}
                          className="bg-surface-container-low border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer"
                        >
                          Clear Files
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-mono text-[10px] text-on-surface uppercase tracking-wider font-semibold block">Source Spreadsheet ID</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1uK7f9K9V0..."
                          value={importSpreadsheetId}
                          onChange={(e) => setImportSpreadsheetId(e.target.value)}
                          className="w-full h-10 px-3 border border-outline-variant rounded text-xs focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-on-surface uppercase tracking-wider font-semibold block">Sheet Tab Name</label>
                        <input 
                          type="text" 
                          placeholder="Sheet1"
                          value={importSheetName}
                          onChange={(e) => setImportSheetName(e.target.value)}
                          className="w-full h-10 px-3 border border-outline-variant rounded text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviewImport}
                        disabled={isReadingImport || !importSpreadsheetId.trim()}
                        className="bg-secondary hover:bg-secondary/90 text-white text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 w-full sm:w-auto focus:outline-none disabled:opacity-55 cursor-pointer"
                      >
                        {isReadingImport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span>{isReadingImport ? 'Loading Spreadsheet...' : 'Fetch Sheet & Preview'}</span>
                      </button>
                      {importPreview && (
                        <button
                          onClick={() => { setStagedFiles([]); setImportError(null); }}
                          className="bg-surface-container-low border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Import Error Feedback */}
                {importError && (
                  <div className="p-4 rounded-lg bg-red-50/50 border border-red-200 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-status-error shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-red-800">Parsing Failure</h5>
                      <p className="text-[11px] text-red-700/85 leading-relaxed">{importError}</p>
                    </div>
                  </div>
                )}

                {/* Import Preview Table */}
                {importPreview && (
                  <div className="space-y-4 border-t border-table-border pt-4">
                    <div className="flex justify-between items-center bg-blue-50/40 p-3 rounded border border-blue-100">
                      <div>
                        <h5 className="font-bold text-xs text-primary flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-primary" />
                          <span>Candidates Staged for Import ({importPreview.length} Candidates)</span>
                        </h5>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Review mapped properties before appending them permanently to the active database.</p>
                      </div>
                      <button
                        onClick={handleConfirmImport}
                        disabled={isImporting || importPreview.length === 0}
                        className="bg-status-success text-white text-xs font-bold px-4 py-2 rounded hover:bg-status-success/90 transition-colors shadow-sm focus:outline-none cursor-pointer flex items-center gap-1.5"
                      >
                        {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Confirm Bulk Import</span>
                      </button>
                    </div>

                    <div className="border border-table-border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-table-border font-mono text-[10px] uppercase font-semibold text-on-surface-variant">
                            <th className="py-2.5 px-4 font-semibold">Name</th>
                            <th className="py-2.5 px-4 font-semibold">Position</th>
                            <th className="py-2.5 px-4 font-semibold">Status</th>
                            <th className="py-2.5 px-4 font-semibold">HR / User</th>
                            <th className="py-2.5 px-4 font-semibold">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-table-border">
                          {importPreview.map((cand, index) => (
                            <tr key={index} className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="py-2 px-4 font-bold text-on-surface">{cand.name}</td>
                              <td className="py-2 px-4 font-mono text-[11px] text-on-surface-variant">{cand.position}</td>
                              <td className="py-2 px-4">
                                <span className={`status-badge text-[10px] ${
                                  cand.status === 'Ditolak' ? 'status-tidak-lolos' :
                                  cand.status === 'Onboarding' ? 'status-lolos' : 'status-dijadwalkan'
                                }`}>
                                  {cand.status}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-[11px] font-medium text-on-surface-variant">
                                {cand.hrResult} / {cand.userResult}
                              </td>
                              <td className="py-2 px-4 text-[11px] italic text-on-surface-variant truncate max-w-[120px]" title={cand.notes}>
                                {cand.notes}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
