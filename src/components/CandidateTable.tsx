import { useState } from 'react';
import { MoreVertical, Filter, ArrowUpDown, Edit2, Trash2, Check, X, Search } from 'lucide-react';
import { Candidate, CandidateStatus, InterviewResult } from '../types';
import { POSITIONS_LIST } from '../data';

interface CandidateTableProps {
  candidates: Candidate[];
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (id: number) => void;
  onUpdateStatus: (id: number, status: CandidateStatus) => void;
}

export default function CandidateTable({ 
  candidates, 
  onEditCandidate, 
  onDeleteCandidate,
  onUpdateStatus
}: CandidateTableProps) {
  // Local states for filtering and sorting
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'status' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Active candidate ID for row actions menu dropdown
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Status badges mapping
  const getStatusClass = (status: CandidateStatus | string) => {
    switch (status) {
      case 'Lolos':
      case 'Onboarding':
        return 'status-lolos';
      case 'Ditolak':
      case 'Tidak Lolos':
      case 'No Show':
        return 'status-tidak-lolos';
      case 'User Interview':
      case 'HR Interview':
      case 'Medical Check':
      case 'Dijadwalkan':
        return 'status-dijadwalkan';
      default:
        return 'status-pending';
    }
  };

  // Convert Indonesian labels for table display matching screenshot
  const displayLabel = (val: string) => {
    if (val === '-') return '-';
    return val;
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.position.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = selectedPosition ? candidate.position === selectedPosition : true;
    const matchesStatus = selectedStatus ? candidate.status === selectedStatus : true;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (!sortBy) return 0;
    
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'position') {
      comparison = a.position.localeCompare(b.position);
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination math
  const totalItems = sortedCandidates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSortToggle = () => {
    if (sortBy === 'name') {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortBy(null); // Reset
      }
    } else {
      setSortBy('name');
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedPosition('');
    setSelectedStatus('');
    setSortBy(null);
    setCurrentPage(1);
  };

  return (
    <section className="bg-surface-container-lowest border border-table-border rounded-lg overflow-hidden flex flex-col font-sans">
      
      {/* Table Header Row */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center border-b border-table-border gap-3 bg-white">
        <div>
          <h4 className="text-sm font-bold text-primary lg:text-base">Candidate Pipeline</h4>
          <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
            Manage candidates, check interview statuses and update records.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search bar inside Candidate Pipeline */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-3.5 h-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search in list..."
              className="w-full pl-8 pr-3 py-1 bg-surface-container-low border border-outline-variant/60 rounded text-xs focus:outline-none focus:border-primary font-sans"
            />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded text-xs font-semibold hover:bg-surface-container-low transition-colors focus:outline-none cursor-pointer ${
              selectedPosition || selectedStatus || showFilters ? 'bg-secondary-container/50 border-primary text-primary' : 'bg-white text-on-surface'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          
          <button 
            onClick={handleSortToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded text-xs font-semibold hover:bg-surface-container-low transition-colors focus:outline-none cursor-pointer ${
              sortBy === 'name' ? 'bg-secondary-container/50 border-primary text-primary' : 'bg-white text-on-surface'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort {sortBy === 'name' ? `(${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})` : ''}</span>
          </button>

          {(selectedPosition || selectedStatus || search || sortBy) && (
            <button 
              onClick={clearFilters}
              className="text-xs text-status-error hover:underline font-semibold px-2 focus:outline-none"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      {showFilters && (
        <div className="px-6 py-3 bg-surface-container-low border-b border-table-border grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
          <div>
            <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider mb-1 font-mono">
              Filter by Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => {
                setSelectedPosition(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-outline-variant rounded text-xs py-1.5 px-2 focus:outline-none focus:border-primary font-sans"
            >
              <option value="">All Positions</option>
              {POSITIONS_LIST.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider mb-1 font-mono">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-outline-variant rounded text-xs py-1.5 px-2 focus:outline-none focus:border-primary font-sans"
            >
              <option value="">All Statuses</option>
              <option value="Ditolak">Ditolak (Rejected)</option>
              <option value="User Interview">User Interview</option>
              <option value="HR Interview">HR Interview</option>
              <option value="Medical Check">Medical Check</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans">
          <thead className="bg-table-header-bg">
            <tr className="border-b border-table-border">
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider w-12 text-center">
                No
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Nama Kandidat
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Posisi
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Status Saat Ini
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                HR Result
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                User Result
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider max-w-[240px]">
                Catatan
              </th>
              <th className="px-4 py-3 font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right w-16">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border bg-white">
            {paginatedCandidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-on-surface-variant">
                  No candidates found matching the criteria.
                </td>
              </tr>
            ) : (
              paginatedCandidates.map((candidate, index) => {
                const itemNumber = startIndex + index + 1;
                return (
                  <tr 
                    key={candidate.id} 
                    className="hover:bg-surface-container-low transition-colors group relative"
                  >
                    <td className="px-4 py-3 text-center font-mono text-xs text-on-surface-variant">
                      {itemNumber}
                    </td>
                    <td 
                      onClick={() => onEditCandidate(candidate)}
                      className="px-4 py-3 font-sans text-xs font-bold text-on-surface cursor-pointer hover:text-primary transition-colors"
                    >
                      {candidate.name}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-on-surface-variant">
                      {candidate.position}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${getStatusClass(candidate.status)}`}>
                        {displayLabel(candidate.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${getStatusClass(candidate.hrResult)}`}>
                        {displayLabel(candidate.hrResult)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${getStatusClass(candidate.userResult)}`}>
                        {displayLabel(candidate.userResult)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-on-surface-variant truncate max-w-[240px]" title={candidate.notes}>
                      {displayLabel(candidate.notes)}
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === candidate.id ? null : candidate.id)}
                        className="p-1 hover:text-primary hover:bg-surface-container rounded-full transition-colors focus:outline-none cursor-pointer inline-flex items-center"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu for Actions */}
                      {activeMenuId === candidate.id && (
                        <div className="absolute right-4 mt-1 w-44 bg-white border border-table-border rounded shadow-lg z-50 py-1 text-left animate-fadeIn">
                          <button
                            onClick={() => {
                              onEditCandidate(candidate);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors focus:outline-none text-left"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-primary" />
                            <span>Edit Detail</span>
                          </button>
                          
                          {/* Quick Status Changers */}
                          <div className="border-t border-table-border my-1" />
                          <div className="px-3 py-1 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                            Set Status
                          </div>
                          
                          {(['User Interview', 'HR Interview', 'Medical Check', 'Ditolak', 'Onboarding'] as CandidateStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                onUpdateStatus(candidate.id, st);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-on-surface hover:bg-surface-container-low transition-colors focus:outline-none"
                            >
                              <span>{st}</span>
                              {candidate.status === st && <Check className="w-3 h-3 text-status-success" />}
                            </button>
                          ))}

                          <div className="border-t border-table-border my-1" />
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${candidate.name} from the pipeline?`)) {
                                onDeleteCandidate(candidate.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-status-error hover:bg-red-50/50 transition-colors focus:outline-none text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="px-6 py-3 bg-surface-container-low flex justify-between items-center border-t border-table-border bg-white/70">
        <p className="font-sans text-xs text-on-surface-variant font-medium">
          Showing <span className="font-semibold text-on-surface">{totalItems > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-on-surface">{endIndex}</span> of{' '}
          <span className="font-semibold text-on-surface">{totalItems}</span> candidates
        </p>
        
        <div className="flex gap-1">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-outline-variant rounded font-sans text-xs font-semibold hover:bg-surface-container-low disabled:opacity-40 transition-colors cursor-pointer"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded font-sans text-xs font-semibold transition-all cursor-pointer ${
                currentPage === page 
                  ? 'bg-primary text-white font-bold' 
                  : 'border border-outline-variant bg-white text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-outline-variant rounded font-sans text-xs font-semibold hover:bg-surface-container-low disabled:opacity-40 transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

    </section>
  );
}
