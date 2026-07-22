import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Trash2, 
  Check, 
  Zap, 
  RotateCcw, 
  Search,
  Filter,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Candidate } from '../types';

interface SpamDetectorProps {
  candidates: Candidate[];
  onDeleteCandidate?: (id: number) => void;
  onUpdateStatus?: (id: number, status: any) => void;
  logActivity?: (title: string, description: string) => void;
}

interface SpamGroup {
  name: string;
  email: string;
  count: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  applications: Candidate[];
  uniquePositions: string[];
}

const SIMULATED_SPAM_CANDIDATES = [
  {
    id: 801,
    name: 'Wahyu Mujayadi',
    position: 'Welder',
    status: 'Pending' as const,
    hrResult: '-' as const,
    userResult: '-' as const,
    notes: 'Duplikasi otomatis pelamar - Terdeteksi Spam',
    dateAdded: '2026-07-14',
    source: 'E-Mail'
  },
  {
    id: 802,
    name: 'Wahyu Mujayadi',
    position: 'Rigger',
    status: 'Pending' as const,
    hrResult: '-' as const,
    userResult: '-' as const,
    notes: 'Duplikasi otomatis pelamar - Terdeteksi Spam',
    dateAdded: '2026-07-14',
    source: 'Website'
  },
  {
    id: 803,
    name: 'Wahyu Mujayadi',
    position: 'Safety Officer',
    status: 'Pending' as const,
    hrResult: '-' as const,
    userResult: '-' as const,
    notes: 'Duplikasi otomatis pelamar - Terdeteksi Spam',
    dateAdded: '2026-07-14',
    source: 'Google Form'
  },
  {
    id: 804,
    name: 'Dani Setiawan',
    position: 'Scaffolder',
    status: 'Pending' as const,
    hrResult: '-' as const,
    userResult: '-' as const,
    notes: 'Lamaran ganda pada hari yang sama',
    dateAdded: '2026-07-14',
    source: 'LinkedIn'
  },
  {
    id: 805,
    name: 'Dani Setiawan',
    position: 'Safety Inspector',
    status: 'Pending' as const,
    hrResult: '-' as const,
    userResult: '-' as const,
    notes: 'Lamaran ganda pada hari yang sama',
    dateAdded: '2026-07-14',
    source: 'Jobstreet'
  }
];

export default function SpamDetector({ 
  candidates, 
  onDeleteCandidate, 
  onUpdateStatus,
  logActivity 
}: SpamDetectorProps) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(true); // Default to true to show awesome results instantly!
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Combine real candidates with simulated ones if simulation is on
  const combinedCandidates = useMemo(() => {
    if (isSimulating) {
      return [...candidates, ...SIMULATED_SPAM_CANDIDATES];
    }
    return candidates;
  }, [candidates, isSimulating]);

  // Group and detect duplicates
  const spamGroups = useMemo((): SpamGroup[] => {
    const grouped: { [key: string]: Candidate[] } = {};
    
    combinedCandidates.forEach((c) => {
      const key = c.name.trim().toLowerCase();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(c);
    });

    return Object.entries(grouped)
      .filter(([_, list]) => list.length >= 2) // Flag 2 or more submissions
      .map(([nameKey, list]) => {
        const name = list[0].name;
        // Generate a fake email matching the name for UI completeness
        const sanitizedName = name.toLowerCase().replace(/\s+/g, '');
        const email = list[0].source === 'E-Mail' 
          ? `${sanitizedName}@gmail.com` 
          : `${sanitizedName}@example.com`;

        const uniquePositions = Array.from(new Set(list.map(c => c.position)));
        
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        let description = '';

        if (list.length >= 4) {
          riskLevel = 'HIGH';
          description = `Terdeteksi spam agresif. Mengirimkan ${list.length} lamaran berturut-turut untuk berbagai posisi berbeda dalam rentang waktu sangat sempit.`;
        } else if (list.length === 3) {
          riskLevel = 'MEDIUM';
          description = `Indikasi spamming resume manual. Melamar ke 3 posisi berbeda (${uniquePositions.join(', ')}).`;
        } else {
          riskLevel = 'LOW';
          description = `Duplikasi ringan. Memiliki 2 berkas aktif di database (mungkin klik ganda tidak sengaja atau melamar 2 peran alternatif).`;
        }

        return {
          name,
          email,
          count: list.length,
          riskLevel,
          description,
          applications: list,
          uniquePositions
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [combinedCandidates]);

  // Filtered spam list
  const filteredSpam = useMemo(() => {
    return spamGroups.filter((group) => {
      const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase()) || 
                            group.uniquePositions.some(p => p.toLowerCase().includes(search.toLowerCase()));
      const matchesRisk = riskFilter === 'all' ? true : group.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [spamGroups, search, riskFilter]);

  // Bulk actions on spam group
  const handleRejectAllSpam = (group: SpamGroup) => {
    group.applications.forEach((app) => {
      if (onUpdateStatus) {
        onUpdateStatus(app.id, 'Ditolak');
      }
    });

    setActionSuccess(`Semua ${group.count} lamaran atas nama "${group.name}" berhasil ditolak.`);
    if (logActivity) {
      logActivity('Spam Auto-Reject', `Berhasil menolak otomatis ${group.count} lamaran spam milik ${group.name}`);
    }
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleDeduplicate = (group: SpamGroup) => {
    // Keep the first application, delete the rest
    const [keep, ...remove] = group.applications;
    
    remove.forEach((app) => {
      if (onDeleteCandidate) {
        onDeleteCandidate(app.id);
      }
    });

    setActionSuccess(`Deduplikasi berhasil! Menyimpan lamaran utama (${keep.position}) dan menghapus ${remove.length} berkas duplikat.`);
    if (logActivity) {
      logActivity('Spam Deduplication', `Melakukan penggabungan dan menghapus ${remove.length} berkas lamaran duplikat milik ${group.name}`);
    }
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Overall metrics
  const highRiskCount = spamGroups.filter(g => g.riskLevel === 'HIGH').length;
  const medRiskCount = spamGroups.filter(g => g.riskLevel === 'MEDIUM').length;
  const lowRiskCount = spamGroups.filter(g => g.riskLevel === 'LOW').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* HEADER CONTROLS */}
      <div className="bg-white border border-table-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
            Sistem Detektor & Penyaringan Spam Lamaran Kerja
          </h4>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Secara otomatis mendeteksi kandidat yang melamar berulang kali secara agresif atau mengirim CV duplikat.
          </p>
        </div>

        {/* Simulator Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={isSimulating}
              onChange={(e) => setIsSimulating(e.target.checked)}
              className="rounded text-red-500 focus:ring-red-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Simulasikan Data Spam Pelamar</span>
          </label>
        </div>
      </div>

      {/* SUCCESS ALERTS */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3.5 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-slate-50 text-slate-500 rounded-lg">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Total Profil Duplikat</div>
            <div className="text-2xl font-black text-on-surface leading-none mt-1">{spamGroups.length}</div>
            <div className="text-[10px] text-on-surface-variant mt-1.5">Kandidat melamar {`>`}= 2 kali</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Spam Risiko Tinggi</div>
            <div className="text-2xl font-black text-red-600 leading-none mt-1">{highRiskCount}</div>
            <div className="text-[10px] text-red-500 font-semibold mt-1.5">Saran: Tolak Semua</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Risiko Sedang</div>
            <div className="text-2xl font-black text-amber-600 leading-none mt-1">{medRiskCount}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1.5">Saran: Audit Portofolio</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Duplikasi Rendah</div>
            <div className="text-2xl font-black text-blue-600 leading-none mt-1">{lowRiskCount}</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-1.5">Saran: Bersihkan Duplikat</div>
          </div>
        </div>

      </div>

      {/* FILTER & SCAN BAR */}
      <div className="bg-white border border-table-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau posisi terflagged..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-outline-variant/60 rounded-lg text-xs focus:outline-none focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <span className="font-semibold text-on-surface-variant">Filter Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-outline-variant/65 rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Level Risiko</option>
            <option value="HIGH">🔴 Risiko Tinggi (Spam Bot)</option>
            <option value="MEDIUM">🟡 Risiko Sedang (Resume Spam)</option>
            <option value="LOW">🔵 Duplikasi Rendah</option>
          </select>
        </div>
      </div>

      {/* RESULTS GRID/LIST */}
      <div className="space-y-4">
        {filteredSpam.length === 0 ? (
          <div className="bg-white border border-table-border rounded-xl p-8 text-center text-on-surface-variant italic text-xs space-y-2">
            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
            <div>Tidak ditemukan indikasi spam lamaran aktif dalam filter ini.</div>
          </div>
        ) : (
          filteredSpam.map((group) => {
            const riskColors = {
              HIGH: 'bg-red-50 border-red-200 text-red-700',
              MEDIUM: 'bg-amber-50 border-amber-200 text-amber-700',
              LOW: 'bg-blue-50 border-blue-200 text-blue-700'
            };

            const riskLabel = {
              HIGH: 'RISIKO TINGGI (SPAM BOT)',
              MEDIUM: 'RISIKO SEDANG (RESUME SPAM)',
              LOW: 'DUPLIKASI RENDAH'
            };

            return (
              <div 
                key={group.name} 
                className="bg-white border border-table-border rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Top header block */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h5 className="font-sans text-sm font-black text-on-surface">{group.name}</h5>
                      <span className="font-mono text-[9px] text-on-surface-variant bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {group.email}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${riskColors[group.riskLevel]}`}>
                        {riskLabel[group.riskLevel]}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Deduplicate Button */}
                    <button
                      onClick={() => handleDeduplicate(group)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 rounded-lg transition-colors cursor-pointer"
                      title="Simpan lamaran pertama dan hapus berkas duplikat sisanya"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Bersihkan Duplikat</span>
                    </button>

                    {/* Reject All Button */}
                    <button
                      onClick={() => handleRejectAllSpam(group)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/40 rounded-lg transition-colors cursor-pointer"
                      title="Langsung tolak semua berkas lamaran"
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Tolak Semua</span>
                    </button>
                  </div>
                </div>

                {/* Submissions detailed list */}
                <div className="bg-slate-50 border border-slate-150 rounded-lg p-3.5 space-y-2 text-xs">
                  <div className="text-[10px] uppercase font-mono font-extrabold text-on-surface-variant tracking-wider border-b border-slate-200 pb-1.5">
                    Riwayat Lamaran Masuk ({group.count} kali)
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {group.applications.map((app) => (
                      <div key={app.id} className="bg-white border border-slate-200 p-2.5 rounded-md space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-on-surface">{app.position}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono">{app.dateAdded}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span>Sumber: <strong className="font-mono">{app.source}</strong></span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            app.status === 'Ditolak' 
                              ? 'bg-red-50 text-red-600 border border-red-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* FOOTER INFO BAR */}
      <div className="flex items-start gap-2.5 bg-blue-50/50 border border-blue-100 rounded-lg p-3.5 text-xs text-blue-800 leading-relaxed">
        <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Cara Kerja Detektor Spam:</span> Mesin penyaring memindai kesamaan nama lengkap secara peka huruf besar-kecil dan alamat email. Lamaran yang melebihi batas wajar dalam posisi berbeda dalam periode singkat otomatis diklasifikasikan sebagai spam pengirim massal. Anda bisa menyetujui deduplikasi (menyimpan berkas terbaik/terakhir) atau langsung menolak semua untuk memelihara database yang bersih.
        </div>
      </div>

    </div>
  );
}
