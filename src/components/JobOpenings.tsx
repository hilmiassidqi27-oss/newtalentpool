import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  AlertCircle, 
  Download, 
  X, 
  ArrowRight,
  TrendingUp,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { Job, Candidate } from '../types';

interface JobOpeningsProps {
  jobs: Job[];
  candidates: Candidate[];
  onAddJob: (job: Omit<Job, 'id'>) => void;
  onEditJob?: (id: string, job: Partial<Job>) => void;
  onDeleteJob?: (id: string) => void;
  logActivity: (title: string, desc: string) => void;
  onViewPipeline?: (position: string) => void;
}

export default function JobOpenings({ jobs, candidates, onAddJob, onEditJob, onDeleteJob, logActivity, onViewPipeline }: JobOpeningsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [position, setPosition] = useState('');
  const [reqCode, setReqCode] = useState('');
  const [customer, setCustomer] = useState('');
  const [location, setLocation] = useState('');
  const [manpowerNeeded, setManpowerNeeded] = useState(1);
  const [jobType, setJobType] = useState<'PENAMBAHAN' | 'PERGANTIAN'>('PENAMBAHAN');
  const [isUrgent, setIsUrgent] = useState(false);
  const [jobStatus, setJobStatus] = useState<'Open' | 'Closed' | 'On Hold'>('Open');

  // Unique list of locations for filtering
  const locations = ['All', ...Array.from(new Set(jobs.map(j => j.location)))];

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.reqCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' ? true : job.status === statusFilter;
    const matchesLocation = locationFilter === 'All' ? true : job.location === locationFilter;
    const matchesUrgent = urgentOnly ? job.isUrgent : true;

    return matchesSearch && matchesStatus && matchesLocation && matchesUrgent;
  });

  // Simple pagination (6 items per page)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenAdd = () => {
    setEditingJob(null);
    setPosition('');
    setReqCode('');
    setCustomer('');
    setLocation('');
    setManpowerNeeded(1);
    setJobType('PENAMBAHAN');
    setIsUrgent(false);
    setJobStatus('Open');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setPosition(job.position);
    setReqCode(job.reqCode);
    setCustomer(job.customer);
    setLocation(job.location);
    setManpowerNeeded(job.manpowerNeeded);
    setJobType(job.type);
    setIsUrgent(job.isUrgent);
    setJobStatus(job.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim() || !customer.trim() || !location.trim()) {
      alert('Mohon isi semua field wajib.');
      return;
    }

    const autoReqCode = reqCode.trim() || `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (editingJob) {
      if (onEditJob) {
        onEditJob(editingJob.id, {
          position: position.trim(),
          reqCode: autoReqCode,
          customer: customer.trim(),
          location: location.trim(),
          manpowerNeeded: Number(manpowerNeeded) || 1,
          type: jobType,
          isUrgent,
          status: jobStatus
        });
      }
      logActivity('Job Updated', `Memperbarui lowongan pekerjaan: ${position} untuk ${customer}.`);
    } else {
      onAddJob({
        position: position.trim(),
        reqCode: autoReqCode,
        customer: customer.trim(),
        location: location.trim(),
        manpowerNeeded: Number(manpowerNeeded) || 1,
        type: jobType,
        isUrgent,
        status: 'Open',
        datePosted: new Date().toISOString().split('T')[0]
      });
      logActivity('Job Posted', `Membuat lowongan pekerjaan baru: ${position} untuk ${customer}.`);
    }
    
    // Reset form
    setPosition('');
    setReqCode('');
    setCustomer('');
    setLocation('');
    setManpowerNeeded(1);
    setJobType('PENAMBAHAN');
    setIsUrgent(false);
    setJobStatus('Open');
    setEditingJob(null);
    setIsModalOpen(false);
  };

  const exportJobsCSV = () => {
    try {
      let csvContent = '\uFEFF'; // UTF-8 BOM
      const headers = ['Req Code', 'Position', 'Customer/Company', 'Location', 'Manpower Needed', 'Type', 'Urgent', 'Status', 'Date Posted'];
      csvContent += headers.map(h => `"${h}"`).join(',') + '\r\n';
      
      jobs.forEach(j => {
        const row = [j.reqCode, j.position, j.customer, j.location, j.manpowerNeeded, j.type, j.isUrgent ? 'Yes' : 'No', j.status, j.datePosted];
        csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\r\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RecruitPro_Job_Openings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  // Mock avatar helper
  const getMockAvatars = (id: string) => {
    const avatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60&h=60',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60&h=60',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60&h=60',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60&h=60'
    ];
    // deterministic seed based on string ID length
    const count = (id.charCodeAt(0) % 3) + 1; // 1 to 3 avatars
    return avatars.slice(0, count);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="job-openings-page">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface font-sans lg:text-2xl leading-none">Job Openings</h2>
          <p className="text-xs text-on-surface-variant mt-2">
            Manage and track all active recruitment requests across various locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={exportJobsCSV}
            className="bg-white border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-bold px-4 h-10 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Report</span>
          </button>
          <button 
            type="button"
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 h-10 rounded shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Search and Filters row */}
      <div className="bg-white p-4 border border-table-border rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-sm">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Position, No Req, or Customer..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 pl-9 pr-3 bg-surface-container-lowest border border-outline-variant rounded text-xs focus:outline-none focus:border-primary transition-all font-sans"
          />
        </div>
        
        <div className="md:col-span-2">
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded text-xs focus:outline-none focus:border-primary transition-all font-sans"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button 
            type="button"
            onClick={() => { setUrgentOnly(!urgentOnly); setCurrentPage(1); }}
            className={`w-full h-10 px-3 rounded text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
              urgentOnly 
                ? 'bg-red-50 border-red-200 text-status-error font-bold' 
                : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Urgent Only</span>
          </button>
        </div>

        <div className="md:col-span-3">
          <select 
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded text-xs focus:outline-none focus:border-primary transition-all font-sans"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Render actual jobs */}
        {paginatedJobs.map((job) => {
          const isPenambahan = job.type === 'PENAMBAHAN';
          
          // Find actual candidates matching this position
          const jobCandidates = candidates.filter(
            (c) => c.position.toLowerCase() === job.position.toLowerCase()
          );
          
          return (
            <div 
              key={job.id} 
              className="bg-white border border-table-border hover:border-primary rounded-lg p-5 hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer"
              onClick={() => onViewPipeline && onViewPipeline(job.position)}
              title="Click to view candidates in the recruitment pipeline"
            >
              <div>
                {/* Badges line */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded font-mono tracking-wider uppercase ${
                    isPenambahan 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'bg-orange-50 text-orange-600 border border-orange-100'
                  }`}>
                    {job.type}
                  </span>

                  {job.isUrgent && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-status-error uppercase tracking-wider font-mono bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      <AlertCircle className="w-3 h-3 text-status-error shrink-0 animate-pulse" />
                      <span>URGENT</span>
                    </span>
                  )}
                </div>

                {/* Job Title and Code */}
                <div>
                  <h3 className="font-bold text-base text-on-surface font-sans leading-snug group-hover:text-primary transition-colors">
                    {job.position}
                  </h3>
                  <span className="text-[10px] text-on-surface-variant/70 font-mono tracking-wider block mt-0.5">
                    {job.reqCode}
                  </span>
                </div>

                {/* Customer and Company Metadata */}
                <div className="mt-4 space-y-2 border-t border-dotted border-table-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-on-surface font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <span>{job.customer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Users className="w-3.5 h-3.5" />
                    <span>Manpower Needed: <strong className="text-on-surface font-bold font-mono">{job.manpowerNeeded} MP</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Active Candidates: <strong className="text-emerald-600 font-extrabold font-mono">{jobCandidates.length} Candidates</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom bar of Card: Users + Details button */}
              <div className="mt-5 pt-4 border-t border-table-border flex justify-between items-center">
                {/* Users Assignees */}
                <div className="flex items-center">
                  {jobCandidates.length > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden">
                      {jobCandidates.slice(0, 3).map((cand) => {
                        const avatarSrc = getMockAvatars(cand.id.toString())[0];
                        return (
                          <img 
                            key={cand.id} 
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" 
                            src={avatarSrc} 
                            alt={cand.name}
                            title={`${cand.name} (${cand.status})`}
                            referrerPolicy="no-referrer"
                          />
                        );
                      })}
                      {jobCandidates.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center text-[9px] font-mono font-bold text-on-surface ring-2 ring-white">
                          +{jobCandidates.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-on-surface-variant font-medium bg-surface-container-lowest border border-outline-variant px-2 py-0.5 rounded">
                      No candidates assigned
                    </span>
                  )}
                </div>

                {/* Detail action */}
                <div className="flex items-center gap-1.5">
                  {onEditJob && (
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenEdit(job);
                      }}
                      className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all p-1.5 rounded cursor-pointer"
                      title="Edit Lowongan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDeleteJob && (
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setJobToDelete(job);
                      }}
                      className="text-on-surface-variant hover:text-status-error hover:bg-surface-container-low transition-all p-1.5 rounded cursor-pointer"
                      title="Hapus Lowongan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewPipeline) {
                        onViewPipeline(job.position);
                      }
                    }}
                    className="text-primary hover:text-primary-container transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer hover:underline px-2 py-1 rounded hover:bg-primary/5"
                  >
                    <span>View Pipeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Post New Position Card PlaceHolder - exactly like left screen mockup */}
        <div 
          onClick={handleOpenAdd}
          className="border-2 border-dashed border-outline-variant hover:border-primary bg-surface-container-lowest/50 hover:bg-primary/5 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-bold text-sm text-on-surface font-sans">Post New Position</h4>
          <p className="text-[11px] text-on-surface-variant max-w-[200px] mt-1 mb-4">
            Quickly add a new recruitment request to the board.
          </p>
          <span className="text-[11px] font-bold text-primary hover:underline">
            Get Started
          </span>
        </div>

      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-table-border text-xs text-on-surface-variant font-medium">
        <div>
          Showing <span className="font-bold text-on-surface">{Math.min(startIndex + 1, filteredJobs.length)}</span> to{' '}
          <span className="font-bold text-on-surface">{Math.min(startIndex + itemsPerPage, filteredJobs.length)}</span> of{' '}
          <span className="font-bold text-on-surface">{filteredJobs.length}</span> active jobs
        </div>

        {/* Numeric page selectors */}
        <div className="flex items-center gap-1.5 font-semibold">
          <button 
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-2 py-1 rounded border border-outline-variant hover:bg-surface-container disabled:opacity-40 cursor-pointer"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i}
              type="button"
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border cursor-pointer ${
                currentPage === i + 1 
                  ? 'bg-primary border-primary text-white font-bold shadow-sm' 
                  : 'bg-white border-outline-variant hover:bg-surface-container text-on-surface'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-2 py-1 rounded border border-outline-variant hover:bg-surface-container disabled:opacity-40 cursor-pointer"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Post New Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fadeIn">
          <div className="bg-white border border-table-border rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-table-border flex justify-between items-center bg-surface-container-low">
              <h3 className="font-bold text-primary text-sm lg:text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>{editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingJob(null); }}
                className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-on-surface focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Position */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                  Job Position (Posisi Jabatan) *
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Req Code */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                    Req Code (Nomor Permintaan)
                  </label>
                  <input
                    type="text"
                    value={reqCode}
                    onChange={(e) => setReqCode(e.target.value)}
                    placeholder="e.g. REQ-2026-001 (Opsional)"
                    className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans font-mono"
                  />
                </div>

                {/* Company / Customer */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                    Company / Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Tech Solutions Inc."
                    className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                    Location (Lokasi) *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Jakarta Selatan"
                    className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                  />
                </div>

                {/* Manpower Needed */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                    Manpower Needed (MP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manpowerNeeded}
                    onChange={(e) => setManpowerNeeded(Math.max(1, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans font-mono"
                  />
                </div>
              </div>

              {/* Status Selector - Only when editing */}
              {editingJob && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                    Job Status *
                  </label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value as 'Open' | 'Closed' | 'On Hold')}
                    className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                  >
                    <option value="Open">Open</option>
                    <option value="On Hold">On Hold (Ditangguhkan)</option>
                    <option value="Closed">Closed (Ditutup)</option>
                  </select>
                </div>
              )}

              {/* Type PENAMBAHAN or PERGANTIAN */}
              <div className="space-y-2 pt-2 border-t border-dotted border-table-border">
                <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                  Recruitment Category (Kategori Permintaan)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer">
                    <input 
                      type="radio" 
                      name="jobType" 
                      checked={jobType === 'PENAMBAHAN'}
                      onChange={() => setJobType('PENAMBAHAN')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>PENAMBAHAN (New Headcount)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer">
                    <input 
                      type="radio" 
                      name="jobType" 
                      checked={jobType === 'PERGANTIAN'}
                      onChange={() => setJobType('PERGANTIAN')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>PERGANTIAN (Replacement)</span>
                  </label>
                </div>
              </div>

              {/* Urgent Flag checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="modal-urgent-checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer w-4 h-4"
                />
                <label htmlFor="modal-urgent-checkbox" className="text-xs font-bold text-status-error flex items-center gap-1 cursor-pointer">
                  <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                  <span>Mark as URGENT (Prioritas Utama)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-table-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingJob(null); }}
                  className="px-4 py-2 bg-surface-container border border-outline-variant text-on-surface text-xs font-semibold rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
                >
                  {editingJob ? 'Save Changes' : 'Post Job opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Job */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-table-border rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-scale-up">
            <div className="flex items-center gap-3 mb-4 text-status-error">
              <div className="p-3 bg-red-50 rounded-full text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Hapus Lowongan</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-6 font-sans">
              Apakah Anda yakin ingin menghapus lowongan pekerjaan untuk posisi <strong className="text-on-surface font-semibold">{jobToDelete.position}</strong> di <strong className="text-on-surface font-semibold">{jobToDelete.customer}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 bg-surface-container border border-outline-variant text-on-surface text-xs font-semibold rounded hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteJob) {
                    onDeleteJob(jobToDelete.id);
                  }
                  setJobToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors shadow-sm cursor-pointer animate-pulse-once"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
