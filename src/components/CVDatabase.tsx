import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Upload, 
  Download, 
  CheckCircle, 
  X, 
  Plus, 
  FileUp, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Eye,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';
import { POSITIONS_LIST } from '../data';

interface CVDatabaseProps {
  candidates: Candidate[];
  onAddCandidateFromCV: (candidateData: Omit<Candidate, 'id'>) => void;
  logActivity: (title: string, description: string) => void;
}

interface CVFile {
  id: string;
  name: string;
  candidateName: string;
  position: string;
  fileSize: string;
  uploadDate: string;
  source: string;
  status: 'Unlinked' | 'Linked';
  linkedCandidateId?: number;
  email: string;
  phone: string;
  experienceYears: number;
  education: string;
  skills: string[];
  summary: string;
  workHistory: { company: string; role: string; period: string; description: string }[];
}

const INITIAL_CVS: CVFile[] = [
  {
    id: 'cv-1',
    name: 'CV_Julianda_Toni_Putra_Rigger.pdf',
    candidateName: 'Julianda Toni Putra',
    position: 'Rigger',
    fileSize: '2.4 MB',
    uploadDate: '2026-06-15',
    source: 'Google Drive',
    status: 'Linked',
    linkedCandidateId: 3,
    email: 'julianda.toni@gmail.com',
    phone: '+62 812-3456-7890',
    experienceYears: 5,
    education: 'SMK Teknik Mesin, Balikpapan',
    skills: ['Slinging & Rigging Class II', 'Heavy Lifting Safety', 'K3 Migas', 'Load Calculation', 'Sling Inspection'],
    summary: 'Rigger bersertifikasi SIO Kelas II dengan pengalaman lebih dari 5 tahun di rig lepas pantai (offshore) maupun darat (onshore). Memiliki rekam jejak keselamatan kerja yang bersih dan keahlian tinggi dalam merencanakan pengangkatan beban berat serta inspeksi peralatan rigging.',
    workHistory: [
      { company: 'Pertamina Hulu Mahakam', role: 'Lead Rigger', period: '2023 - Sekarang', description: 'Memimpin tim rigging harian untuk operasi pengeboran offshore, membuat laporan rencana pengangkatan kritis, dan memastikan semua peralatan bersertifikasi penuh.' },
      { company: 'Chevron Pacific Indonesia', role: 'Rigger Specialist', period: '2021 - 2023', description: 'Melakukan penanganan sling dan belenggu rigger untuk instalasi derek darat, membantu crane operator dalam mengoordinasikan manuver beban berat secara aman.' }
    ]
  },
  {
    id: 'cv-2',
    name: 'CV_Hendrik_Khusairi_Scaffolder.pdf',
    candidateName: 'Hendrik Khusairi',
    position: 'Scaffolder',
    fileSize: '1.8 MB',
    uploadDate: '2026-06-18',
    source: 'Google Drive',
    status: 'Linked',
    linkedCandidateId: 9,
    email: 'hendrik.khusairi@outlook.com',
    phone: '+62 821-9876-5432',
    experienceYears: 6,
    education: 'Politeknik Negeri Samarinda',
    skills: ['BNSP Scaffolder Madya', 'Tube & Coupler Assembly', 'Ringlock Systems', 'Working at Heights Safety', 'HSE Compliance'],
    summary: 'Scaffolding specialist bersertifikat BNSP tingkat Madya. Sangat berpengalaman dalam membangun konstruksi scaffolding yang aman untuk kilang minyak, struktur industri berat, dan pembangkit listrik. Mengutamakan zero-accident policy.',
    workHistory: [
      { company: 'Badak NGL Bontang', role: 'Scaffolding Supervisor', period: '2022 - Sekarang', description: 'Mengawasi instalasi perancah di area fasilitas pencairan gas, mengaudit kekuatan struktur perancah sebelum diserahkan ke kru pemeliharaan.' },
      { company: 'Truba Jaya Engineering', role: 'Scaffolder Specialist', period: '2020 - 2022', description: 'Mendirikan scaffolding pipa industri di proyek ekspansi kilang minyak Balikpapan sesuai standar keselamatan kerja yang ketat.' }
    ]
  },
  {
    id: 'cv-3',
    name: 'CV_M_Fadillah_Safety_Officer.pdf',
    candidateName: 'M. Fadillah',
    position: 'Safety Officer',
    fileSize: '3.1 MB',
    uploadDate: '2026-06-20',
    source: 'LinkedIn',
    status: 'Linked',
    linkedCandidateId: 10,
    email: 'fadillah.hse@gmail.com',
    phone: '+62 853-2211-4433',
    experienceYears: 4,
    education: 'S1 Kesehatan Masyarakat, Universitas Indonesia',
    skills: ['AK3 Umum Kemnaker', 'HIRA / JSA', 'Incident Investigation', 'OSHA Guidelines', 'Safety Auditing', 'ISO 45001'],
    summary: 'Ahli K3 Umum bersertifikat Kemnaker RI dengan latar belakang akademis yang kuat di bidang Kesehatan & Keselamatan Kerja. Terampil menyusun JSA, mengoordinasikan safety induction bagi kontraktor baru, dan melakukan investigasi insiden lapangan.',
    workHistory: [
      { company: 'Adaro Energy Tbk', role: 'HSE Officer', period: '2023 - Sekarang', description: 'Menjalankan program keselamatan harian di site pertambangan, memfasilitasi rapat komite keselamatan kerja (P2K3), dan mengoordinasikan simulasi tanggap darurat.' },
      { company: 'Adhi Karya (Persero)', role: 'Project Safety Coordinator', period: '2022 - 2023', description: 'Mengawasi kepatuhan APD dan perilaku kerja selamat di proyek infrastruktur jalan layang perkotaan.' }
    ]
  },
  {
    id: 'cv-4',
    name: 'CV_Budi_Santoso_Welder_6G.docx',
    candidateName: 'Budi Santoso',
    position: 'Welder',
    fileSize: '1.2 MB',
    uploadDate: '2026-06-25',
    source: 'Local Upload',
    status: 'Linked',
    linkedCandidateId: 13,
    email: 'budi.welder6g@yahoo.com',
    phone: '+62 811-5544-3322',
    experienceYears: 8,
    education: 'Balai Latihan Kerja (BLK) Industri',
    skills: ['GTAW / SMAW Welding', '6G Certification (MIG/TIG)', 'Pipe Fitting', 'Blueprint Reading', 'NDT Testing Basics'],
    summary: 'Welder bersertifikat 6G dengan spesialisasi pengelasan tekanan tinggi dan jalur pipa industri. Terampil melakukan pengelasan menggunakan metode SMAW dan GTAW pada baja karbon tinggi, stainless steel, dan paduan khusus dengan tingkat cacat radiografi mendekati 0%.',
    workHistory: [
      { company: 'Tripatra Engineers & Constructors', role: 'Senior 6G Welder', period: '2020 - 2025', description: 'Melakukan pengelasan presisi pada pipa jalur gas tekanan tinggi dan kapal selam penampung minyak mentah.' },
      { company: 'Rekayasa Industri (Rekind)', role: 'Pipe Welder', period: '2018 - 2020', description: 'Mengelas struktur boiler dan pipa utilitas suhu ekstrim di proyek PLTU Jawa Tengah.' }
    ]
  },
  {
    id: 'cv-5',
    name: 'CV_Ahmad_Subarjo_Crane_Operator.pdf',
    candidateName: 'Ahmad Subarjo',
    position: 'Crane Operator',
    fileSize: '2.9 MB',
    uploadDate: '2026-06-30',
    source: 'Google Drive',
    status: 'Linked',
    linkedCandidateId: 14,
    email: 'ahmad.subarjo@operators.co.id',
    phone: '+62 813-1122-3344',
    experienceYears: 10,
    education: 'SMA Negeri 1 Balikpapan',
    skills: ['SIO Crane Kelas I', 'Mobile & Crawler Cranes', 'Tandem Lifting', 'Rigging Safety Protocols', 'Preventative Maintenance'],
    summary: 'Operator Crane senior dengan SIO Kelas I Kemnaker RI aktif. Berpengalaman 10 tahun mengoperasikan berbagai jenis derek mobile, crawler, dan gantry dengan kapasitas beban hingga 250 ton. Ahli dalam kalkulasi kurva beban rekayasa angkat kritis.',
    workHistory: [
      { company: 'Sarens Indonesia', role: 'Heavy Lift Crane Operator', period: '2021 - Sekarang', description: 'Mengemudikan crawler crane kapasitas tinggi untuk instalasi balok baja jembatan dan turbin angin.' },
      { company: 'Waskita Karya', role: 'Mobile Crane Operator', period: '2016 - 2021', description: 'Mengoperasikan All-Terrain crane di proyek bendungan dan konstruksi pelabuhan laut.' }
    ]
  },
  {
    id: 'cv-6',
    name: 'CV_Suryana_Hidayat_Safety_Inspector.pdf',
    candidateName: 'Suryana Hidayat',
    position: 'Safety Inspector',
    fileSize: '2.1 MB',
    uploadDate: '2026-07-05',
    source: 'Local Upload',
    status: 'Unlinked',
    email: 'suryana.hidayat@outlook.co.id',
    phone: '+62 812-9988-7766',
    experienceYears: 5,
    education: 'D3 Teknik Sipil, Universitas Diponegoro',
    skills: ['HSE Inspection', 'Confined Space Safety', 'Scaffolding Inspector Certificate', 'Electrical Safety', 'Fire Fighting Class D'],
    summary: 'Safety Inspector yang teliti dan berdedikasi tinggi dengan keahlian khusus dalam inspeksi kepatuhan HSE lapangan, pengujian atmosfer ruang terbatas (confined space), dan inspeksi instalasi perancah pipa berisiko tinggi.',
    workHistory: [
      { company: 'Wijaya Karya (Wika)', role: 'Lead HSE Inspector', period: '2023 - Sekarang', description: 'Menjalankan patroli HSE harian di lokasi konstruksi pembangkit listrik, mengeluarkan tindakan perbaikan cepat bagi pelanggaran standar K3.' },
      { company: 'Chiyoda Corp Joint Venture', role: 'HSE Officer', period: '2021 - 2023', description: 'Melakukan inspeksi harian kelayakan alat angkat, gas detektor, peralatan K3 pemadam, dan izin kerja aman.' }
    ]
  }
];

export default function CVDatabase({ candidates, onAddCandidateFromCV, logActivity }: CVDatabaseProps) {
  const [cvs, setCvs] = useState<CVFile[]>(() => {
    const saved = localStorage.getItem('recruitpro_cv_vault');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_CVS; }
    }
    return INITIAL_CVS;
  });

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCv, setSelectedCv] = useState<CVFile | null>(null);
  
  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination / Display variables
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'parsed'>('preview');
  const [showAddCandidateForm, setShowAddCandidateForm] = useState(false);
  
  // Linking inputs
  const [customStatus, setCustomStatus] = useState<CandidateStatus>('Pending');
  const [customNotes, setCustomNotes] = useState('');

  // Persist locally
  const saveToStorage = (newCvs: CVFile[]) => {
    setCvs(newCvs);
    localStorage.setItem('recruitpro_cv_vault', JSON.stringify(newCvs));
  };

  // Filter CVs
  const filteredCvs = cvs.filter(cv => {
    const matchesSearch = 
      cv.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      cv.name.toLowerCase().includes(search.toLowerCase()) ||
      cv.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      cv.position.toLowerCase().includes(search.toLowerCase());
      
    const matchesPosition = positionFilter ? cv.position === positionFilter : true;
    const matchesSource = sourceFilter ? cv.source === sourceFilter : true;
    const matchesStatus = statusFilter ? cv.status === statusFilter : true;

    return matchesSearch && matchesPosition && matchesSource && matchesStatus;
  });

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc' && ext !== 'txt') {
      alert('Tipe file tidak didukung! Harap unggah file PDF, DOCX, atau TXT.');
      return;
    }

    // Auto-generate name from file name
    let cleanName = file.name
      .replace(/^(cv|resume|curriculum|vitae)[_\-\s]*/gi, '')
      .replace(/\.(pdf|docx|doc|txt)$/i, '')
      .replace(/[_\-\s]+/g, ' ')
      .trim();
    
    // Capitalize words
    cleanName = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // If name becomes empty, default
    if (!cleanName) cleanName = 'Kandidat Baru';

    // Randomize position from POSITIONS_LIST or fallback to file parsing
    let detectedPosition = 'Scaffolder';
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('safety') || lowerName.includes('hse') || lowerName.includes('k3')) {
      detectedPosition = lowerName.includes('inspector') ? 'Safety Inspector' : 'Safety Officer';
    } else if (lowerName.includes('rigger') || lowerName.includes('rig')) {
      detectedPosition = 'Rigger';
    } else if (lowerName.includes('welder') || lowerName.includes('weld')) {
      detectedPosition = 'Welder';
    } else if (lowerName.includes('crane') || lowerName.includes('operat')) {
      detectedPosition = 'Crane Operator';
    }

    // Convert bytes to clean MB string
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const fileSizeStr = `${sizeInMB} MB`;

    // Create a high quality mock parsed record
    const newCv: CVFile = {
      id: `cv-${Date.now()}`,
      name: file.name,
      candidateName: cleanName,
      position: detectedPosition,
      fileSize: fileSizeStr,
      uploadDate: new Date().toISOString().split('T')[0],
      source: 'Local Upload',
      status: 'Unlinked',
      email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: `+62 812-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      experienceYears: Math.floor(2 + Math.random() * 8),
      education: 'Pusat Diklat Tenaga Teknik & Vokasi',
      skills: [
        'HSE Regulations', 
        'Safety Audit', 
        'Technical Drawing', 
        'Tools Inspection', 
        detectedPosition + ' Specialist'
      ],
      summary: `${cleanName} merupakan tenaga profesional yang kompeten di bidang ${detectedPosition} dengan rekam jejak kerja lapangan yang terbukti aman dan berintegritas tinggi. Berfokus pada keandalan kerja dan ketaatan standar operasional prosedur.`,
      workHistory: [
        { 
          company: 'KSO Adhi Karya-Wika', 
          role: detectedPosition, 
          period: '2024 - Sekarang', 
          description: 'Melaksanakan pekerjaan instalasi dan operasional teknis proyek dengan mematuhi sepenuhnya kaidah-kaidah K3 nasional.' 
        },
        { 
          company: 'PT. Sanggar Sarana Baja', 
          role: `Junior ${detectedPosition}`, 
          period: '2022 - 2024', 
          description: 'Membantu kru lapangan senior dalam inspeksi kelayakan peralatan kerja dan memastikan produktivitas harian terpenuhi.' 
        }
      ]
    };

    const updatedCvs = [newCv, ...cvs];
    saveToStorage(updatedCvs);
    logActivity('Unggah CV Baru', `Berhasil mengunggah dan mem-parsing berkas CV: ${file.name} untuk ${cleanName}.`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // One-click Sync / Register Candidate
  const handleRegisterAsCandidate = (cv: CVFile) => {
    const candidateData: Omit<Candidate, 'id'> = {
      name: cv.candidateName,
      position: cv.position,
      status: customStatus,
      hrResult: customStatus === 'Pending' ? '-' : 'Lolos',
      userResult: '-',
      notes: customNotes || `Terdaftar otomatis dari unggahan dokumen CV (${cv.name}).`,
      source: cv.source === 'Local Upload' ? 'Referensi' : 'G-Suite Sync',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    onAddCandidateFromCV(candidateData);
    
    // Find the candidate we just added to get the simulated ID
    // We can assume it gets added as next simulated candidate ID
    // To link properly, let's update this CV's status to Linked
    const nextSimulatedId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;

    const updatedCvs = cvs.map(item => {
      if (item.id === cv.id) {
        return {
          ...item,
          status: 'Linked' as const,
          linkedCandidateId: nextSimulatedId
        };
      }
      return item;
    });

    saveToStorage(updatedCvs);
    setShowAddCandidateForm(false);
    setSelectedCv(null);
    logActivity('CV Disinkronkan', `Dokumen CV ${cv.candidateName} berhasil ditautkan ke sistem pipeline rekrutmen utama.`);
  };

  // Remove CV from vault
  const handleDeleteCv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus berkas CV ini dari basis data?')) return;
    const item = cvs.find(c => c.id === id);
    const updated = cvs.filter(c => c.id !== id);
    saveToStorage(updated);
    if (item) {
      logActivity('CV Dihapus', `Menghapus dokumen CV ${item.name} dari arsip.`);
    }
  };

  // Helper to check if a CV candidate is linked
  const getLinkedCandidate = (cv: CVFile): Candidate | undefined => {
    if (!cv.linkedCandidateId) {
      // Fallback search by name if not explicitly stored
      return candidates.find(c => c.name.toLowerCase() === cv.candidateName.toLowerCase());
    }
    return candidates.find(c => c.id === cv.linkedCandidateId);
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction */}
      <div className="bg-white border border-table-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface font-sans">Koleksi & Database CV Digital</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Arsip lengkap dokumen CV lamaran kerja. Unggah file CV baru, cari keahlian spesifik menggunakan filter cerdas, atau langsung daftarkan kandidat ke alur rekrutmen.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-full flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Total CV: {cvs.length} File
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Upload Dropzone & Quick Filters */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 bg-white ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-outline-variant hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileInput}
            />
            
            <Upload className="w-10 h-10 text-primary/40 mx-auto mb-3 animate-pulse" />
            <h5 className="font-bold text-xs text-primary mb-1">Unggah CV Baru</h5>
            <p className="text-[10px] text-on-surface-variant max-w-[180px] mx-auto leading-relaxed mb-4">
              Tarik & lepaskan file Anda di sini, atau klik tombol di bawah.
            </p>
            
            <button
              onClick={onButtonClick}
              className="w-full py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Pilih File</span>
            </button>
            <span className="text-[9px] text-on-surface-variant block mt-2">Format: PDF, DOCX, TXT (Maks 10MB)</span>
          </div>

          {/* Detailed Filters Sidebar */}
          <div className="bg-white border border-table-border rounded-xl p-5 shadow-sm space-y-4">
            <h5 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-table-border pb-2.5">
              <Filter className="w-4 h-4" />
              Penyaringan Cepat
            </h5>

            {/* Filter by Position */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant">Posisi Pekerjaan</label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full p-2 bg-surface-container-low border border-outline-variant rounded text-xs font-sans text-on-surface"
              >
                <option value="">Semua Posisi</option>
                {POSITIONS_LIST.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Filter by Source */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant">Sumber Dokumen</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full p-2 bg-surface-container-low border border-outline-variant rounded text-xs font-sans text-on-surface"
              >
                <option value="">Semua Sumber</option>
                <option value="Google Drive">Google Drive (G-Suite)</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Local Upload">Local Upload</option>
              </select>
            </div>

            {/* Filter by Linking Status */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant">Status Tautan</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 bg-surface-container-low border border-outline-variant rounded text-xs font-sans text-on-surface"
              >
                <option value="">Semua Status</option>
                <option value="Linked">Telah Ditautkan (Active)</option>
                <option value="Unlinked">Belum Ditautkan (Arsip)</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(positionFilter || sourceFilter || statusFilter || search) && (
              <button
                onClick={() => {
                  setPositionFilter('');
                  setSourceFilter('');
                  setStatusFilter('');
                  setSearch('');
                }}
                className="w-full mt-2 py-1.5 border border-red-200 bg-red-50 text-red-700 text-[11px] font-semibold rounded hover:bg-red-100 transition-colors text-center cursor-pointer"
              >
                Atur Ulang Penyaringan
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Search & Files Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search Header */}
          <div className="bg-white border border-table-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari file CV berdasarkan nama kandidat, kata kunci keahlian, atau kompetensi..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs font-sans text-on-surface"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-primary"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="text-[11px] font-mono font-bold text-primary bg-primary/5 border border-primary/10 px-3.5 py-2.5 rounded-lg whitespace-nowrap">
              Menampilkan {filteredCvs.length} dari {cvs.length} File
            </div>
          </div>

          {/* Empty State */}
          {filteredCvs.length === 0 && (
            <div className="bg-white border border-table-border rounded-xl p-12 text-center">
              <FileText className="w-14 h-14 text-primary/20 mx-auto mb-4" />
              <h4 className="font-bold text-sm text-primary mb-1">Tidak Ada Dokumen CV Ditemukan</h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Tidak ada dokumen yang cocok dengan pencarian atau penyaringan Anda. Harap ganti filter pencarian atau unggah dokumen CV baru.
              </p>
            </div>
          )}

          {/* Grid of Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCvs.map(cv => {
              const linkedCand = getLinkedCandidate(cv);
              return (
                <div 
                  key={cv.id} 
                  onClick={() => {
                    setSelectedCv(cv);
                    setActiveSubTab('preview');
                    setShowAddCandidateForm(false);
                    setCustomNotes('');
                  }}
                  className="bg-white border border-table-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    
                    {/* Upper Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="bg-primary/5 p-2 rounded-lg border border-primary/10 shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-on-surface truncate" title={cv.name}>{cv.name}</h4>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Ukuran: {cv.fileSize} | Diunggah: {cv.uploadDate}</p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteCv(cv.id, e)}
                        className="p-1 hover:bg-red-50 text-on-surface-variant hover:text-red-600 rounded transition-colors cursor-pointer shrink-0"
                        title="Hapus berkas CV"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata & Key Metrics */}
                    <div className="bg-surface-container-low/50 border border-outline-variant/40 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-on-surface-variant">Nama Kandidat:</span>
                        <strong className="text-primary truncate max-w-[130px]">{cv.candidateName}</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-on-surface-variant">Posisi Kompetensi:</span>
                        <span className="font-mono bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-semibold">{cv.position}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-on-surface-variant">Masa Pengalaman:</span>
                        <strong className="text-on-surface">{cv.experienceYears} Tahun</strong>
                      </div>
                    </div>

                    {/* Skills Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cv.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[9px] font-sans font-semibold bg-surface-container-lowest border border-table-border text-on-surface-variant px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {cv.skills.length > 3 && (
                        <span className="text-[9px] font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                          +{cv.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer status & Actions */}
                  <div className="border-t border-table-border pt-4 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      Sumber: <strong className="text-on-surface">{cv.source}</strong>
                    </span>

                    {linkedCand ? (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        Tautan Aktif: {linkedCand.status}
                      </span>
                    ) : (
                      <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        ● Belum Ditautkan
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* DETAILED CV DOCUMENT READER MODAL */}
      {selectedCv && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-table-border animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-primary text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 shrink-0 text-white/80" />
                <div>
                  <h3 className="font-bold text-sm md:text-base leading-none text-white">{selectedCv.name}</h3>
                  <p className="text-[11px] text-white/70 mt-1">
                    Kompetensi Terdeteksi: <strong>{selectedCv.position}</strong> | Diunggah pada {selectedCv.uploadDate} oleh PIC Rekrutmen
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCv(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-surface-container-low border-b border-table-border px-6 py-2.5 flex justify-between items-center shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSubTab('preview')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeSubTab === 'preview' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Pratinjau Dokumen Asli
                </button>
                <button
                  onClick={() => setActiveSubTab('parsed')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeSubTab === 'parsed' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  AI Resume Parsing & Detail
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Download Document */}
                <button
                  onClick={() => {
                    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(
                      `CURRICULUM VITAE - ${selectedCv.candidateName}\n\n` +
                      `Summary: ${selectedCv.summary}\n\n` +
                      `Skills: ${selectedCv.skills.join(', ')}\n\n` +
                      `Work History:\n` + selectedCv.workHistory.map(w => `- ${w.company} (${w.role}, ${w.period}): ${w.description}`).join('\n')
                    );
                    const dl = document.createElement('a');
                    dl.setAttribute("href", dataStr);
                    dl.setAttribute("download", selectedCv.name);
                    dl.click();
                  }}
                  className="px-3 py-1.5 bg-white border border-outline-variant hover:bg-surface-container text-xs font-semibold rounded-md text-on-surface flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CV</span>
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Side: Dynamic Workspace Area */}
              <div className="flex-1 overflow-y-auto bg-slate-100 p-6 flex justify-center">
                
                {activeSubTab === 'preview' ? (
                  /* MOCK PDF RENDERER */
                  <div className="bg-white w-full max-w-2xl min-h-[750px] shadow-lg border border-slate-200 rounded p-12 relative flex flex-col justify-between font-sans">
                    
                    {/* Header */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start border-b-2 border-primary pb-6">
                        <div>
                          <h1 className="text-2xl font-bold text-primary font-sans leading-none">{selectedCv.candidateName}</h1>
                          <p className="text-xs text-on-surface-variant mt-2 font-mono">{selectedCv.position} Specialist</p>
                        </div>
                        <div className="text-right text-[11px] text-on-surface-variant leading-relaxed">
                          <p>{selectedCv.email}</p>
                          <p>{selectedCv.phone}</p>
                          <p>{selectedCv.education.split(',')[1] || 'Indonesia'}</p>
                        </div>
                      </div>

                      {/* Profile Summary */}
                      <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans border-b border-table-border pb-1">Ringkasan Profil</h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed text-justify">
                          {selectedCv.summary}
                        </p>
                      </div>

                      {/* Technical Skills */}
                      <div className="space-y-2 pt-4">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans border-b border-table-border pb-1">Keahlian Teknis & Sertifikasi</h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedCv.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-semibold rounded border border-primary/10">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Work Experience */}
                      <div className="space-y-4 pt-4">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans border-b border-table-border pb-1">Riwayat Pengalaman Kerja</h3>
                        {selectedCv.workHistory.map((work, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-xs font-bold text-on-surface">{work.role} — <span className="text-primary">{work.company}</span></h4>
                              <span className="text-[10px] font-mono text-on-surface-variant">{work.period}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed text-justify">
                              {work.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Education */}
                      <div className="space-y-2 pt-4">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans border-b border-table-border pb-1">Pendidikan Terakhir</h3>
                        <p className="text-xs text-on-surface-variant">
                          <strong>{selectedCv.education}</strong>
                        </p>
                      </div>

                    </div>

                    {/* Footer */}
                    <div className="border-t border-table-border pt-6 mt-12 flex justify-between items-center text-[10px] text-on-surface-variant">
                      <span>Dokumen Curriculum Vitae Resmi</span>
                      <span>Halaman 1 dari 1</span>
                    </div>

                  </div>
                ) : (
                  /* STRUCTURED PARSED DETAILS VIEW */
                  <div className="bg-white w-full max-w-2xl rounded-xl border border-table-border p-6 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-primary border-b border-table-border pb-2 uppercase tracking-wider">Hasil Ekstraksi Resume</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Berikut adalah detail data yang berhasil diidentifikasi oleh sistem rekrutmen dari berkas CV.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-low p-3.5 rounded-lg">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Nama Lengkap</span>
                        <span className="text-xs font-bold text-primary mt-1 block">{selectedCv.candidateName}</span>
                      </div>
                      <div className="bg-surface-container-low p-3.5 rounded-lg">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Posisi Yang Dilamar</span>
                        <span className="text-xs font-bold text-primary mt-1 block">{selectedCv.position}</span>
                      </div>
                      <div className="bg-surface-container-low p-3.5 rounded-lg">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Email Address</span>
                        <span className="text-xs font-bold text-on-surface mt-1 block">{selectedCv.email}</span>
                      </div>
                      <div className="bg-surface-container-low p-3.5 rounded-lg">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Nomor Telepon</span>
                        <span className="text-xs font-bold text-on-surface mt-1 block">{selectedCv.phone}</span>
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-4 rounded-lg space-y-2">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Ulasan Singkat Kompetensi</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed italic">"{selectedCv.summary}"</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Sertifikat & Kompetensi Kunci</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedCv.skills.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side: Action Hub Panel */}
              <div className="w-80 border-l border-table-border bg-white p-6 overflow-y-auto shrink-0 flex flex-col justify-between">
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Status Integrasi Pipeline</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Hubungkan resume ini langsung dengan database utama.</p>
                  </div>

                  {getLinkedCandidate(selectedCv) ? (
                    /* ALREADY LINKED ACTIONS */
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-2">
                        <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h5 className="font-bold text-xs text-emerald-800">Telah Terhubung Aktif</h5>
                        <p className="text-[10px] text-emerald-700 leading-relaxed">
                          Kandidat <strong>{selectedCv.candidateName}</strong> sudah terdaftar dalam pipeline aktif dengan status:
                        </p>
                        <span className="status-badge status-lolos inline-block text-[11px] font-bold">
                          {getLinkedCandidate(selectedCv)?.status}
                        </span>
                      </div>

                      <div className="bg-surface-container-low border border-table-border rounded-lg p-4 space-y-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Catatan Rekrutmen Saat Ini</span>
                        <p className="text-xs text-on-surface-variant italic">
                          "{getLinkedCandidate(selectedCv)?.notes || '-'}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* UNLINKED - FORM TO REGISTER */
                    <div className="space-y-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center space-y-1">
                        <span className="text-orange-700 text-xs font-bold">Belum Terdaftar</span>
                        <p className="text-[10px] text-orange-600 leading-relaxed">
                          Ingin mengimpor resume ini menjadi kandidat aktif di pipeline rekrutmen utama?
                        </p>
                      </div>

                      {showAddCandidateForm ? (
                        <div className="space-y-4 border border-table-border rounded-lg p-3.5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tahapan Alur Kerja</label>
                            <select
                              value={customStatus}
                              onChange={(e) => setCustomStatus(e.target.value as CandidateStatus)}
                              className="w-full p-2 bg-surface-container-low border border-outline-variant rounded text-xs font-sans text-on-surface"
                            >
                              <option value="Pending">Pending (Tinjauan)</option>
                              <option value="HR Interview">HR Interview</option>
                              <option value="User Interview">User Interview</option>
                              <option value="Medical Check">Medical Check</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Catatan Awal</label>
                            <textarea
                              value={customNotes}
                              onChange={(e) => setCustomNotes(e.target.value)}
                              rows={3}
                              placeholder="Ketik catatan evaluasi resume awal..."
                              className="w-full p-2 bg-surface-container-low border border-outline-variant rounded text-xs font-sans text-on-surface focus:outline-none focus:border-primary"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRegisterAsCandidate(selectedCv)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Konfirmasi Impor Pipeline</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCandidateForm(true);
                            setCustomStatus('Pending');
                          }}
                          className="w-full py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Daftarkan Sebagai Kandidat</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-table-border mt-6">
                  <button
                    onClick={() => setSelectedCv(null)}
                    className="w-full py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs rounded text-center cursor-pointer"
                  >
                    Tutup Pratinjau
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
