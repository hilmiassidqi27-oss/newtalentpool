import React, { useState, useMemo } from 'react';
import { 
  Map, 
  MapPin, 
  SlidersHorizontal, 
  Download, 
  HelpCircle, 
  Users, 
  Wrench, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  Minus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Building,
  ArrowUpRight
} from 'lucide-react';
import { Job } from '../types';
import indonesiaMap from '@svg-maps/indonesia';

interface GeoSourceDashboardProps {
  jobs: Job[];
  logActivity: (title: string, desc: string) => void;
}

// Full mock data for Indonesian Vocational Institutions (BLK, LPK, universities)
interface Institution {
  id: string;
  name: string;
  type: 'BLK' | 'LPK' | 'EDUCATIONAL';
  typeName: string;
  applicants: number;
  passRate: number; // 0-100
  activeCandidates: number;
  status: 'High Priority' | 'Standard' | 'Underperforming';
  province: string;
  island: 'Java' | 'Kalimantan' | 'Sumatra' | 'Sulawesi_Papua';
  coordinates: { x: number; y: number }; // Relative coordinates for our custom SVG map
  details: string;
}

const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    name: 'BLK Sangatta Utara',
    type: 'BLK',
    typeName: 'Balai Latihan Kerja',
    applicants: 142,
    passRate: 78,
    activeCandidates: 34,
    status: 'High Priority',
    province: 'Kalimantan Timur',
    island: 'Kalimantan',
    coordinates: { x: 375, y: 115 },
    details: 'Pusat pelatihan las (welding) bersertifikat BNSP, menyuplai industri tambang batubara.'
  },
  {
    id: 'inst-2',
    name: 'LPK Teknik Mulia',
    type: 'LPK',
    typeName: 'Lembaga Pelatihan',
    applicants: 96,
    passRate: 63,
    activeCandidates: 21,
    status: 'Standard',
    province: 'Jawa Barat',
    island: 'Java',
    coordinates: { x: 210, y: 240 },
    details: 'Spesialisasi fabrikasi logam dan pelatihan keselamatan kerja (K3 umum).'
  },
  {
    id: 'inst-3',
    name: 'Univ Balikpapan - Mechanical Eng.',
    type: 'EDUCATIONAL',
    typeName: 'Educational',
    applicants: 75,
    passRate: 85,
    activeCandidates: 12,
    status: 'High Priority',
    province: 'Kalimantan Timur',
    island: 'Kalimantan',
    coordinates: { x: 368, y: 135 },
    details: 'Program studi teknik mesin dengan fokus perancangan struktur baja.'
  },
  {
    id: 'inst-4',
    name: 'SMK Negeri 1 Bontang',
    type: 'EDUCATIONAL',
    typeName: 'Educational',
    applicants: 112,
    passRate: 45,
    activeCandidates: 18,
    status: 'Underperforming',
    province: 'Kalimantan Timur',
    island: 'Kalimantan',
    coordinates: { x: 372, y: 120 },
    details: 'Sekolah vokasi industri, penyedia welder muda kualifikasi dasar.'
  },
  {
    id: 'inst-5',
    name: 'BLK Samarinda',
    type: 'BLK',
    typeName: 'Balai Latihan Kerja',
    applicants: 180,
    passRate: 72,
    activeCandidates: 45,
    status: 'High Priority',
    province: 'Kalimantan Timur',
    island: 'Kalimantan',
    coordinates: { x: 365, y: 125 },
    details: 'BLK pusat Provinsi Kalimantan Timur dengan fasilitas pengelasan terlengkap di Kalimantan.'
  },
  {
    id: 'inst-6',
    name: 'LPK Jaya Mandiri Sidoarjo',
    type: 'LPK',
    typeName: 'Lembaga Pelatihan',
    applicants: 88,
    passRate: 59,
    activeCandidates: 15,
    status: 'Standard',
    province: 'Jawa Timur',
    island: 'Java',
    coordinates: { x: 320, y: 254 },
    details: 'Fokus pelatihan kelistrikan industri dan fitters konstruksi besi.'
  },
  {
    id: 'inst-7',
    name: 'Politeknik Negeri Samarinda',
    type: 'EDUCATIONAL',
    typeName: 'Educational',
    applicants: 95,
    passRate: 82,
    activeCandidates: 28,
    status: 'High Priority',
    province: 'Kalimantan Timur',
    island: 'Kalimantan',
    coordinates: { x: 366, y: 122 },
    details: 'Teknik Alat Berat dan Teknik Mesin, kerjasama erat dengan kontraktor tambang.'
  },
  {
    id: 'inst-8',
    name: 'BLK Bekasi (Pusat Vokasi)',
    type: 'BLK',
    typeName: 'Balai Latihan Kerja',
    applicants: 210,
    passRate: 88,
    activeCandidates: 55,
    status: 'High Priority',
    province: 'Jawa Barat',
    island: 'Java',
    coordinates: { x: 200, y: 239 },
    details: 'Balai Besar Pengembangan Latihan Kerja (BBPLK) di bawah Kemnaker RI.'
  },
  {
    id: 'inst-9',
    name: 'LPK Global Borneo',
    type: 'LPK',
    typeName: 'Lembaga Pelatihan',
    applicants: 64,
    passRate: 51,
    activeCandidates: 10,
    status: 'Standard',
    province: 'Kalimantan Selatan',
    island: 'Kalimantan',
    coordinates: { x: 350, y: 174 },
    details: 'Menyediakan sertifikasi mekanik alat berat kelas II.'
  },
  {
    id: 'inst-10',
    name: 'BLK Medan',
    type: 'BLK',
    typeName: 'Balai Latihan Kerja',
    applicants: 125,
    passRate: 67,
    activeCandidates: 22,
    status: 'Standard',
    province: 'Sumatera Utara',
    island: 'Sumatra',
    coordinates: { x: 50, y: 90 },
    details: 'Pelatihan operator manufaktur dan perawatan kelistrikan pabrik kelapa sawit.'
  },
  {
    id: 'inst-11',
    name: 'SMK Negeri 2 Surabaya',
    type: 'EDUCATIONAL',
    typeName: 'Educational',
    applicants: 104,
    passRate: 48,
    activeCandidates: 14,
    status: 'Underperforming',
    province: 'Jawa Timur',
    island: 'Java',
    coordinates: { x: 315, y: 252 },
    details: 'Program keahlian teknik konstruksi baja dan las.'
  },
  {
    id: 'inst-12',
    name: 'BLK Makassar',
    type: 'BLK',
    typeName: 'Balai Latihan Kerja',
    applicants: 110,
    passRate: 70,
    activeCandidates: 26,
    status: 'High Priority',
    province: 'Sulawesi Selatan',
    island: 'Sulawesi_Papua',
    coordinates: { x: 439, y: 210 },
    details: 'Pusat pelatihan kelautan, teknik pendingin, dan fabrikasi logam Indonesia Timur.'
  },
  {
    id: 'inst-13',
    name: 'LPK Nusantara Kendari',
    type: 'LPK',
    typeName: 'Lembaga Pelatihan',
    applicants: 58,
    passRate: 55,
    activeCandidates: 11,
    status: 'Standard',
    province: 'Sulawesi Tenggara',
    island: 'Sulawesi_Papua',
    coordinates: { x: 465, y: 195 },
    details: 'Pendidikan vokasi mekanik bubut dan industri galangan kapal.'
  },
  {
    id: 'inst-14',
    name: 'Politeknik Negeri Ujung Pandang',
    type: 'EDUCATIONAL',
    typeName: 'Educational',
    applicants: 78,
    passRate: 79,
    activeCandidates: 19,
    status: 'High Priority',
    province: 'Sulawesi Selatan',
    island: 'Sulawesi_Papua',
    coordinates: { x: 435, y: 206 },
    details: 'D3/D4 Teknik Konversi Energi & Teknik Mesin.'
  },
  {
    id: 'inst-15',
    name: 'BLK Sorong',
    type: 'BLK',
    typeName: 'Balai Latihan Kerja',
    applicants: 45,
    passRate: 60,
    activeCandidates: 8,
    status: 'Standard',
    province: 'Papua Barat',
    island: 'Sulawesi_Papua',
    coordinates: { x: 630, y: 160 },
    details: 'Pelatihan dasar otomotif dan pengelasan plat baja maritim.'
  },
  {
    id: 'inst-16',
    name: 'SMK Negeri 1 Palembang',
    type: 'EDUCATIONAL',
    typeName: 'Educational',
    applicants: 82,
    passRate: 40,
    activeCandidates: 9,
    status: 'Underperforming',
    province: 'Sumatera Selatan',
    island: 'Sumatra',
    coordinates: { x: 150, y: 185 },
    details: 'Keahlian teknik gambar bangunan dan kelistrikan otomotif.'
  },
  {
    id: 'inst-17',
    name: 'BLK Banda Aceh',
    type: 'BLK',
    typeName: 'Balai Latihan Kerja',
    applicants: 60,
    passRate: 64,
    activeCandidates: 14,
    status: 'Standard',
    province: 'Aceh',
    island: 'Sumatra',
    coordinates: { x: 25, y: 55 },
    details: 'Mengembangkan kompetensi teknisi instalasi penerangan dan pengelasan gas.'
  },
  {
    id: 'inst-18',
    name: 'LPK Cipta Karya Balikpapan',
    type: 'LPK',
    typeName: 'Lembaga Pelatihan',
    applicants: 72,
    passRate: 60,
    activeCandidates: 16,
    status: 'Standard',
    province: 'Kalimantan Timur',
    island: 'Kalimantan',
    coordinates: { x: 368, y: 130 },
    details: 'Sertifikasi keahlian operator crane dan rigger industri berat.'
  }
];

export default function GeoSourceDashboard({ jobs, logActivity }: GeoSourceDashboardProps) {
  // Filter States
  const [lembagaType, setLembagaType] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  
  // Applied filters (to avoid filtering on every selection change, like the original "Apply Filters" button)
  const [appliedFilters, setAppliedFilters] = useState({
    type: 'All',
    job: 'All',
    region: 'All'
  });

  // Map settings
  const [viewMode, setViewMode] = useState<'points' | 'heatmap'>('points');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [hoveredInstitution, setHoveredInstitution] = useState<Institution | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  // Table search & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Static options
  const regions = [
    { value: 'All', label: 'All Indonesia Regions' },
    { value: 'Java', label: 'Java Island' },
    { value: 'Kalimantan', label: 'Kalimantan Region' },
    { value: 'Sumatra', label: 'Sumatra Region' },
    { value: 'Sulawesi_Papua', label: 'Sulawesi & Papua' }
  ];

  // Apply filters trigger
  const handleApplyFilters = () => {
    setAppliedFilters({
      type: lembagaType,
      job: selectedJob,
      region: selectedRegion
    });
    setCurrentPage(1);
    logActivity(
      'Sourcing Filters Applied', 
      `Menyaring data asal kandidat berdasarkan Tipe Lembaga: ${lembagaType}, Lowongan: ${selectedJob}, dan Wilayah: ${selectedRegion}.`
    );
  };

  // Filtered dataset
  const filteredInstitutions = useMemo(() => {
    return INITIAL_INSTITUTIONS.filter(inst => {
      // Type filter
      if (appliedFilters.type !== 'All' && inst.type !== appliedFilters.type) {
        return false;
      }
      // Region (Island) filter
      if (appliedFilters.region !== 'All' && inst.island !== appliedFilters.region) {
        return false;
      }
      // Job Request filter simulation (e.g. welder filters Kalimantan/Java mostly, or changes weights)
      if (appliedFilters.job !== 'All') {
        // Welder Sangatta WLD-001 is mostly in Kalimantan Timur
        if (appliedFilters.job.includes('WLD-001') || appliedFilters.job.includes('Welder')) {
          return inst.province === 'Kalimantan Timur' || inst.island === 'Kalimantan' || inst.applicants > 80;
        }
        // Fitter is Java and Kalimantan
        if (appliedFilters.job.includes('FTR-002') || appliedFilters.job.includes('Fitter')) {
          return inst.island === 'Java' || inst.island === 'Kalimantan';
        }
      }
      return true;
    });
  }, [appliedFilters]);

  // Derived KPIs
  const totalSourced = useMemo(() => {
    const sum = filteredInstitutions.reduce((acc, curr) => acc + curr.applicants, 0);
    // Multiply by dynamic scaling factor if job is selected to show realistic variety
    return appliedFilters.job !== 'All' ? Math.round(sum * 0.45) : sum;
  }, [filteredInstitutions, appliedFilters]);

  const blkCount = useMemo(() => {
    return filteredInstitutions.filter(i => i.type === 'BLK').length;
  }, [filteredInstitutions]);

  const avgPassRate = useMemo(() => {
    if (filteredInstitutions.length === 0) return 0;
    const totalRate = filteredInstitutions.reduce((acc, curr) => acc + curr.passRate, 0);
    return Math.round((totalRate / filteredInstitutions.length) * 10) / 10;
  }, [filteredInstitutions]);

  const activeCandidatesCount = useMemo(() => {
    const sum = filteredInstitutions.reduce((acc, curr) => acc + curr.activeCandidates, 0);
    return appliedFilters.job !== 'All' ? Math.round(sum * 0.4) : sum;
  }, [filteredInstitutions, appliedFilters]);

  // Regional Distribution values (dynamic calculation)
  const regionalDistribution = useMemo(() => {
    const total = filteredInstitutions.reduce((acc, curr) => acc + curr.applicants, 0);
    if (total === 0) return { java: 0, kalimantan: 0, sumatra: 0, sulawesiPapua: 0 };

    const java = filteredInstitutions.filter(i => i.island === 'Java').reduce((acc, curr) => acc + curr.applicants, 0);
    const kalimantan = filteredInstitutions.filter(i => i.island === 'Kalimantan').reduce((acc, curr) => acc + curr.applicants, 0);
    const sumatra = filteredInstitutions.filter(i => i.island === 'Sumatra').reduce((acc, curr) => acc + curr.applicants, 0);
    const sulawesiPapua = filteredInstitutions.filter(i => i.island === 'Sulawesi_Papua').reduce((acc, curr) => acc + curr.applicants, 0);

    return {
      java: Math.round((java / total) * 100),
      kalimantan: Math.round((kalimantan / total) * 100),
      sumatra: Math.round((sumatra / total) * 100),
      sulawesiPapua: Math.round((sulawesiPapua / total) * 100)
    };
  }, [filteredInstitutions]);

  // Top Institutions List
  const topInstitutions = useMemo(() => {
    return [...filteredInstitutions]
      .sort((a, b) => b.applicants - a.applicants)
      .slice(0, 3);
  }, [filteredInstitutions]);

  // Search and paginated institutions for table
  const searchedInstitutions = useMemo(() => {
    return filteredInstitutions.filter(inst => {
      const query = searchTerm.toLowerCase().trim();
      if (!query) return true;
      return (
        inst.name.toLowerCase().includes(query) ||
        inst.province.toLowerCase().includes(query) ||
        inst.typeName.toLowerCase().includes(query)
      );
    });
  }, [filteredInstitutions, searchTerm]);

  const paginatedInstitutions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchedInstitutions.slice(startIndex, startIndex + itemsPerPage);
  }, [searchedInstitutions, currentPage]);

  const totalPages = Math.ceil(searchedInstitutions.length / itemsPerPage);

  // Map Handlers for Pan and Zoom
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomScale(1);
    setMapOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleExportReport = () => {
    // Generate simulated CSV
    const headers = 'Institution Name,Type,Province,Applicants,Pass Rate,Active Candidates,Status\n';
    const rows = searchedInstitutions
      .map(i => `"${i.name}","${i.type}","${i.province}",${i.applicants},"${i.passRate}%",${i.activeCandidates},"${i.status}"`)
      .join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GeoSource_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity('Report Exported', `Mengekspor laporan GeoSource (${searchedInstitutions.length} lembaga) ke format CSV.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* GeoSource Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface font-sans flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            <span>GeoSource Dashboard</span>
          </h2>
          <p className="text-[11px] font-mono font-semibold text-on-surface-variant uppercase tracking-widest mt-1">
            Candidate Origin & Sourcing Analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportReport}
            className="bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface text-xs font-bold px-3.5 h-9 rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export Report</span>
          </button>
          <button
            type="button"
            onClick={() => alert('GeoSource Dashboard membantu melacak asal lembaga pengirim kandidat seperti BLK (Balai Latihan Kerja) dan LPK untuk mengoptimalkan kuota rekrutmen regional.')}
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar Panel */}
      <div className="bg-white border border-table-border rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          {/* Institution Type */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider font-mono">
              Lembaga Type
            </label>
            <select
              value={lembagaType}
              onChange={(e) => setLembagaType(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
            >
              <option value="All">All Institution Types</option>
              <option value="BLK">BLK (Balai Latihan Kerja)</option>
              <option value="LPK">LPK (Lembaga Pelatihan Swasta)</option>
              <option value="EDUCATIONAL">Educational Institutions (SMK / Univ)</option>
            </select>
          </div>

          {/* Job Request ID */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider font-mono">
              Job Request ID
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
            >
              <option value="All">All Open Positions</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.position} ({j.reqCode})
                </option>
              ))}
              <option value="Welder-Mock">Welder Sangatta 2024 (WLD-001)</option>
              <option value="Fitter-Mock">Structural Fitter 2024 (FTR-002)</option>
            </select>
          </div>

          {/* Province / Region */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider font-mono">
              Province / Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
            >
              {regions.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Apply */}
          <div>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="w-full h-10 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-table-border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
              Total Sourced
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface tracking-tight">
                {totalSourced.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[10px] text-status-success font-semibold flex items-center gap-1">
              <span className="text-xs">↑</span>
              <span>+12.5% vs last month</span>
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-table-border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
              BLK Institutions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface tracking-tight">
                {blkCount}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Across {Math.max(1, Math.round(blkCount * 0.4))} provinces
            </p>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600 group-hover:scale-110 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-table-border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
              Average Pass Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface tracking-tight">
                {avgPassRate}%
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Sourced from BLK/LPK
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl text-status-warning group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-table-border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
              Active Candidates
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface tracking-tight">
                {activeCandidatesCount}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Currently in interview stage
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Map & Regional Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customized Indonesia SVG Map Card */}
        <div className="lg:col-span-2 bg-white border border-table-border rounded-xl p-6 shadow-xs flex flex-col relative overflow-hidden min-h-[420px] select-none">
          
          {/* Map Header */}
          <div className="flex justify-between items-center border-b border-table-border pb-3 mb-4 z-10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface font-sans">
                Interactive Sourcing Map
              </span>
            </div>
            
            {/* View Mode Switcher */}
            <div className="flex bg-surface-container p-0.5 rounded-lg border border-outline-variant">
              <button
                type="button"
                onClick={() => setViewMode('points')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'points' 
                    ? 'bg-white text-primary shadow-xs' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Points
              </button>
              <button
                type="button"
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'heatmap' 
                    ? 'bg-white text-primary shadow-xs' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Heatmap
              </button>
            </div>
          </div>

          {/* SVG Map Container */}
          <div 
            className="flex-1 bg-blue-50/20 border border-dotted border-table-border rounded-lg relative cursor-grab active:cursor-grabbing overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Zoom / Reset Controller buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-8 h-8 bg-white border border-outline-variant hover:bg-surface-container shadow-sm rounded-lg flex items-center justify-center text-on-surface cursor-pointer focus:outline-none"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 bg-white border border-outline-variant hover:bg-surface-container shadow-sm rounded-lg flex items-center justify-center text-on-surface cursor-pointer focus:outline-none"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 bg-white border border-outline-variant hover:bg-surface-container shadow-sm rounded-md text-[9px] font-bold text-on-surface cursor-pointer focus:outline-none"
                title="Reset View"
              >
                Reset
              </button>
            </div>

            {/* Live Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 border border-table-border shadow-md rounded-lg p-3 z-20 text-[10px] font-sans space-y-1.5 backdrop-blur-xs max-w-[200px]">
              <span className="font-bold text-[9px] uppercase tracking-wider text-on-surface block border-b border-table-border pb-1">MAP LEGEND</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block shrink-0" />
                <span className="font-medium text-on-surface-variant">BLK (Balai Latihan Kerja)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 block shrink-0" />
                <span className="font-medium text-on-surface-variant">LPK (Lembaga Pelatihan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block shrink-0" />
                <span className="font-medium text-on-surface-variant">Educational Institutions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/50 animate-pulse block shrink-0" />
                <span className="font-medium text-on-surface-variant">Heatmap Cluster</span>
              </div>
            </div>

            {/* Main Interactive Map Stage */}
            <div 
              className="absolute inset-0 transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoomScale})`,
                transformOrigin: 'center center'
              }}
            >
              {/* Detailed Stylized Indonesia SVG map */}
              <svg 
                viewBox={indonesiaMap.viewBox} 
                className="w-full h-full max-h-[360px] opacity-95 mx-auto select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Subtle coordinate grid pattern to mimic pro GIS mapping tools */}
                  <pattern id="gis-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1,5" />
                  </pattern>
                </defs>

                {/* Ocean Background with grid coordinates */}
                <rect width="100%" height="100%" fill="url(#gis-grid)" rx="8" />

                {/* Render Detailed Provinces from @svg-maps/indonesia */}
                <g id="indonesia-provinces">
                  {indonesiaMap.locations.map((loc) => {
                    const isHovered = hoveredProvince === loc.name;
                    
                    // See if we have institutions in this province
                    const provinceInsts = INITIAL_INSTITUTIONS.filter(inst => inst.province === loc.name);
                    const hasActiveInsts = provinceInsts.length > 0;
                    
                    // Highlight color if hovered
                    let fillCol = '#52525b'; // Elegant dark slate/zinc
                    if (isHovered) {
                      fillCol = '#2563eb'; // Deep primary blue hover
                    } else if (hasActiveInsts) {
                      fillCol = '#3f3f46'; // Slightly darker for active sourcing provinces
                    }

                    return (
                      <path
                        key={loc.id}
                        id={loc.id}
                        d={loc.path}
                        fill={fillCol}
                        stroke="#ffffff"
                        strokeWidth="0.6"
                        className="transition-all duration-150 cursor-pointer hover:opacity-90"
                        onMouseEnter={() => setHoveredProvince(loc.name)}
                        onMouseLeave={() => setHoveredProvince(null)}
                      />
                    );
                  })}
                </g>

                {/* RENDER DYNAMIC MARKERS / HEATMAP CLUSTERS */}
                {viewMode === 'points' ? (
                  // Normal Pins View
                  filteredInstitutions.map((inst) => {
                    const isSelected = selectedInstitution?.id === inst.id;
                    const markerColor = 
                      inst.type === 'BLK' ? '#2563eb' : // Blue-600
                      inst.type === 'LPK' ? '#38bdf8' : // Sky-400
                      '#a855f7'; // Purple-500
                    
                    return (
                      <g 
                        key={inst.id}
                        transform={`translate(${inst.coordinates.x}, ${inst.coordinates.y})`}
                        onMouseEnter={() => setHoveredInstitution(inst)}
                        onMouseLeave={() => setHoveredInstitution(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstitution(inst);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Soft pulse background glow for hovered/selected */}
                        {(isSelected || hoveredInstitution?.id === inst.id) && (
                          <circle 
                            cx="0" 
                            cy="-9" 
                            r="15" 
                            fill={markerColor} 
                            opacity="0.3" 
                            className="animate-ping" 
                          />
                        )}
                        {/* Beautiful drop pin path where 0,0 is the tip */}
                        <path
                          d="M 0,-16 C -4,-16 -7,-13 -7,-9 C -7,-5 -1,-1 0,0 C 1,-1 7,-5 7,-9 C 7,-13 4,-16 0,-16 Z"
                          fill={markerColor}
                          stroke="#ffffff"
                          strokeWidth="1.2"
                          className="transition-all transform group-hover:scale-125 duration-150 origin-bottom"
                          style={{ transformOrigin: '0px 0px' }}
                        />
                        {/* Inner white dot at center of head */}
                        <circle
                          cx="0"
                          cy="-9"
                          r="2"
                          fill="#ffffff"
                        />
                      </g>
                    );
                  })
                ) : (
                  // Heatmap Cluster View
                  // Group markers close to each other to create stunning heatmap blobs
                  [
                    { x: 367, y: 125, count: 45, label: 'Kalimantan Cluster' },
                    { x: 258, y: 253, count: 83, label: 'Java West-Central Cluster' },
                    { x: 100, y: 130, count: 24, label: 'Sumatra Cluster' },
                    { x: 450, y: 175, count: 32, label: 'Sulawesi Cluster' }
                  ].map((cluster, idx) => (
                    <g key={idx} className="animate-pulse">
                      <circle 
                        cx={cluster.x} 
                        cy={cluster.y} 
                        r={Math.min(45, 18 + cluster.count * 0.3)} 
                        fill="#2563eb" 
                        opacity="0.15" 
                      />
                      <circle 
                        cx={cluster.x} 
                        cy={cluster.y} 
                        r="12" 
                        fill="#2563eb" 
                        opacity="0.6" 
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text 
                        x={cluster.x} 
                        y={cluster.y + 3} 
                        fill="#ffffff" 
                        fontSize="9" 
                        fontWeight="bold" 
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {cluster.count}
                      </text>
                    </g>
                  ))
                )}
              </svg>
            </div>

            {/* Hovered Province overlay inside map container */}
            {hoveredProvince && (
              <div className="absolute top-3 right-3 bg-white/90 border border-table-border shadow-sm rounded-lg px-2.5 py-1 z-20 text-[10px] font-sans font-bold text-primary flex items-center gap-1.5 backdrop-blur-xs">
                <MapPin className="w-3 h-3 text-blue-600 animate-bounce" />
                <span>{hoveredProvince}</span>
              </div>
            )}

            {/* Hover Tooltip (Inside Map Container) */}
            {hoveredInstitution && (
              <div 
                className="absolute z-30 bg-white border border-table-border rounded-lg shadow-lg p-3 max-w-[220px] pointer-events-none animate-fadeIn"
                style={{
                  left: `${Math.min(500, hoveredInstitution.coordinates.x + mapOffset.x * 0.3 + 15)}px`,
                  top: `${Math.min(260, hoveredInstitution.coordinates.y + mapOffset.y * 0.3 - 25)}px`
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    hoveredInstitution.type === 'BLK' ? 'bg-blue-600' :
                    hoveredInstitution.type === 'LPK' ? 'bg-sky-400' : 'bg-purple-500'
                  }`} />
                  <span className="font-bold text-xs text-primary truncate block max-w-[180px]">
                    {hoveredInstitution.name}
                  </span>
                </div>
                <div className="space-y-1 text-[10px] text-on-surface-variant font-sans">
                  <div className="flex justify-between">
                    <span>Wilayah:</span>
                    <span className="font-semibold text-on-surface">{hoveredInstitution.province}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sourced:</span>
                    <span className="font-bold text-on-surface">{hoveredInstitution.applicants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Rate:</span>
                    <span className="font-bold text-status-success">{hoveredInstitution.passRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel: Regional Distribution & Top Institutions */}
        <div className="space-y-6">
          {/* Regional Distribution */}
          <div className="bg-white border border-table-border rounded-xl p-5 shadow-xs flex flex-col space-y-4">
            <div className="border-b border-table-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface font-sans">
                Regional Distribution
              </h3>
            </div>
            
            <div className="space-y-3.5">
              {/* Region 1: Java */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface">Java Island</span>
                  <span className="font-mono font-bold text-primary">{regionalDistribution.java}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, regionalDistribution.java)}%` }}
                  />
                </div>
              </div>

              {/* Region 2: Kalimantan */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface">Kalimantan</span>
                  <span className="font-mono font-bold text-teal-600">{regionalDistribution.kalimantan}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, regionalDistribution.kalimantan)}%` }}
                  />
                </div>
              </div>

              {/* Region 3: Sumatra */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface">Sumatra</span>
                  <span className="font-mono font-bold text-sky-500">{regionalDistribution.sumatra}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, regionalDistribution.sumatra)}%` }}
                  />
                </div>
              </div>

              {/* Region 4: Sulawesi & Papua */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface">Sulawesi & Papua</span>
                  <span className="font-mono font-bold text-purple-600">{regionalDistribution.sulawesiPapua}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, regionalDistribution.sulawesiPapua)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Sourcing Institutions */}
          <div className="bg-white border border-table-border rounded-xl p-5 shadow-xs flex flex-col space-y-3.5">
            <div className="border-b border-table-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface font-sans">
                Top Sourcing Institutions
              </h3>
            </div>

            <div className="space-y-3">
              {topInstitutions.map((inst, index) => {
                const IconComponent = inst.type === 'BLK' ? Wrench : inst.type === 'LPK' ? Building : GraduationCap;
                const iconColor = 
                  inst.type === 'BLK' ? 'bg-blue-50 text-blue-600' :
                  inst.type === 'LPK' ? 'bg-sky-50 text-sky-500' : 'bg-purple-50 text-purple-600';
                
                return (
                  <div 
                    key={inst.id} 
                    onClick={() => setSelectedInstitution(inst)}
                    className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-mono font-bold text-on-surface-variant w-4">
                      {index + 1}
                    </div>
                    <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                        {inst.name}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        {inst.applicants} Applicants • {inst.province}
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
                  </div>
                );
              })}

              {topInstitutions.length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-4 italic font-sans">
                  No institutions available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Institution Performance Ranking Table Card */}
      <div className="bg-white border border-table-border rounded-xl shadow-xs overflow-hidden">
        
        {/* Table Header & Search */}
        <div className="px-6 py-4 border-b border-table-border flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-surface-container-low/50">
          <div>
            <h3 className="text-sm font-bold text-on-surface font-sans">
              Institution Performance Ranking
            </h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              Tabel performansi kualitas pengiriman kandidat vokasi nasional.
            </p>
          </div>
          
          <div className="relative max-w-xs w-full sm:w-64">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search Institution..."
              className="w-full h-8 pl-9 pr-3 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
            />
          </div>
        </div>

        {/* Live Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-table-border bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                <th className="py-3 px-6">Institution Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Total Applicants</th>
                <th className="py-3 px-4">Pass Rate</th>
                <th className="py-3 px-4 text-center">Active Candidates</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-border text-xs">
              {paginatedInstitutions.map((inst) => {
                const isSelected = selectedInstitution?.id === inst.id;
                
                // Status mapping classes
                const statusStyles = 
                  inst.status === 'High Priority' ? 'text-green-600 bg-green-50 border-green-100' :
                  inst.status === 'Standard' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                  'text-red-600 bg-red-50 border-red-100';

                // Progress bar colors
                const barColor = 
                  inst.passRate >= 75 ? 'bg-green-500' :
                  inst.passRate >= 50 ? 'bg-amber-500' : 'bg-red-500';

                return (
                  <tr 
                    key={inst.id}
                    onClick={() => setSelectedInstitution(inst)}
                    className={`hover:bg-primary/5 transition-colors cursor-pointer group ${isSelected ? 'bg-primary/10 font-medium' : ''}`}
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-primary group-hover:underline">{inst.name}</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">{inst.province}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-mono ${
                        inst.type === 'BLK' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        inst.type === 'LPK' ? 'bg-sky-50 text-sky-500 border border-sky-100' :
                        'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}>
                        {inst.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-on-surface">
                      {inst.applicants}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${inst.passRate}%` }} />
                        </div>
                        <span className="font-mono text-[10px] font-bold min-w-[28px] text-right">{inst.passRate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-on-surface">
                      {inst.activeCandidates}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusStyles}`}>
                        {inst.status === 'High Priority' ? '● High Priority' : inst.status === 'Standard' ? '● Standard' : '● Underperforming'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {paginatedInstitutions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-on-surface-variant italic">
                    Tidak ada lembaga yang cocok dengan pencarian atau kriteria filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-table-border flex justify-between items-center bg-surface-container-lowest text-xs">
            <span className="text-on-surface-variant font-medium">
              Showing <strong className="text-on-surface">{Math.min(searchedInstitutions.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(searchedInstitutions.length, currentPage * itemsPerPage)}</strong> of <strong className="text-on-surface">{searchedInstitutions.length}</strong> institutions
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded text-xs font-semibold focus:outline-none cursor-pointer ${
                    currentPage === page
                      ? 'bg-primary text-white font-bold'
                      : 'border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Institution Detail modal popup */}
      {selectedInstitution && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-table-border rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-scale-up">
            <button
              type="button"
              onClick={() => setSelectedInstitution(null)}
              className="absolute top-4 right-4 p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-on-surface focus:outline-none cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 rotate-90" />
            </button>

            {/* Modal Title & Type */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className={`p-3 rounded-xl text-white shrink-0 ${
                selectedInstitution.type === 'BLK' ? 'bg-blue-600' :
                selectedInstitution.type === 'LPK' ? 'bg-sky-500' : 'bg-purple-500'
              }`}>
                {selectedInstitution.type === 'BLK' ? <Wrench className="w-6 h-6" /> : 
                 selectedInstitution.type === 'LPK' ? <Building className="w-6 h-6" /> : 
                 <GraduationCap className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[9px] font-bold font-mono tracking-wider uppercase border border-outline-variant bg-surface-container-low px-2 py-0.5 rounded text-on-surface-variant">
                  {selectedInstitution.typeName}
                </span>
                <h3 className="text-base font-bold text-on-surface mt-1.5">{selectedInstitution.name}</h3>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{selectedInstitution.province}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 border-t border-table-border pt-4">
              {/* Institution details description */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase font-mono tracking-wider">
                  Deskripsi & Fokus Lembaga
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedInstitution.details}
                </p>
              </div>

              {/* Institution Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container-low border border-table-border rounded-lg p-2.5 text-center">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase font-mono block">Sourced</span>
                  <span className="text-base font-bold text-primary font-mono">{selectedInstitution.applicants}</span>
                </div>
                <div className="bg-surface-container-low border border-table-border rounded-lg p-2.5 text-center">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase font-mono block">Pass Rate</span>
                  <span className="text-base font-bold text-status-success font-mono">{selectedInstitution.passRate}%</span>
                </div>
                <div className="bg-surface-container-low border border-table-border rounded-lg p-2.5 text-center">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase font-mono block">Active</span>
                  <span className="text-base font-bold text-purple-600 font-mono">{selectedInstitution.activeCandidates}</span>
                </div>
              </div>

              {/* Performance status indicator */}
              <div className="flex justify-between items-center bg-surface-container-low border border-table-border rounded-lg p-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  Performance Status
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                  selectedInstitution.status === 'High Priority' ? 'text-green-600 bg-green-50 border-green-100' :
                  selectedInstitution.status === 'Standard' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                  'text-red-600 bg-red-50 border-red-100'
                }`}>
                  {selectedInstitution.status}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-table-border pt-4 mt-5">
              <button
                type="button"
                onClick={() => setSelectedInstitution(null)}
                className="w-full py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
