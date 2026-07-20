import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Calendar, 
  User, 
  UserCheck, 
  Search,
  Filter,
  ArrowRightLeft
} from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';

interface RecruitmentPipelineProps {
  candidates: Candidate[];
  onUpdateStatus: (id: number, status: CandidateStatus) => void;
  onAddCandidate: () => void;
  onEditCandidate: (candidate: Candidate) => void;
  positionsList: string[];
  selectedPosition?: string;
  onSelectedPositionChange?: (position: string) => void;
}

interface Column {
  id: CandidateStatus;
  title: string;
  color: string;
}

export default function RecruitmentPipeline({ 
  candidates, 
  onUpdateStatus, 
  onAddCandidate, 
  onEditCandidate,
  positionsList,
  selectedPosition,
  onSelectedPositionChange
}: RecruitmentPipelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localPositionFilter, setLocalPositionFilter] = useState('All');

  const positionFilter = selectedPosition !== undefined ? selectedPosition : localPositionFilter;
  const setPositionFilter = onSelectedPositionChange !== undefined ? onSelectedPositionChange : setLocalPositionFilter;

  // Define column metadata
  const columns: Column[] = [
    { id: 'Applied', title: 'APPLIED', color: 'border-t-blue-500' },
    { id: 'Skill Test', title: 'SKILL TEST', color: 'border-t-yellow-500' },
    { id: 'Psychological Test', title: 'PSYCHOLOGICAL TEST', color: 'border-t-purple-500' },
    { id: 'HR Interview', title: 'HR INTERVIEW', color: 'border-t-teal-500' },
    { id: 'User Interview', title: 'USER INTERVIEW', color: 'border-t-indigo-500' },
    { id: 'Medical Check', title: 'MEDICAL CHECK', color: 'border-t-pink-500' },
    { id: 'Onboarding', title: 'ONBOARDING / LOLOS', color: 'border-t-emerald-500' },
    { id: 'Ditolak', title: 'DITOLAK', color: 'border-t-rose-500' }
  ];

  // Helper to map old statuses if any candidates are loaded with legacy status names
  const normalizeStatus = (status: string): CandidateStatus => {
    if (status === 'Pending') return 'Applied';
    if (status === 'Lolos') return 'Onboarding';
    return status as CandidateStatus;
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => {
    const status = normalizeStatus(cand.status);
    const matchesSearch = cand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cand.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'All' ? true : cand.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  // Simple state-based moving helper
  const moveCandidate = (candidateId: number, currentStatus: CandidateStatus, direction: 'left' | 'right') => {
    const normStatus = normalizeStatus(currentStatus);
    const currentIndex = columns.findIndex(col => col.id === normStatus);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex + (direction === 'left' ? -1 : 1);
    if (targetIndex >= 0 && targetIndex < columns.length) {
      onUpdateStatus(candidateId, columns[targetIndex].id);
    }
  };

  // Get candidates in a specific column
  const getCandidatesByColumn = (columnId: CandidateStatus) => {
    return filteredCandidates.filter(c => {
      const cStatus = normalizeStatus(c.status);
      return cStatus === columnId;
    });
  };

  // Status indicator helper exactly as shown in screenshot
  const renderCardStatusIndicator = (cand: Candidate, status: CandidateStatus) => {
    if (status === 'Applied') {
      return (
        <span className="bg-blue-50 text-blue-600 font-extrabold text-[9px] px-2 py-0.5 rounded tracking-wide uppercase shadow-sm">
          New
        </span>
      );
    }
    if (status === 'Skill Test') {
      return (
        <span className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    }
    if (status === 'Psychological Test') {
      return (
        <span className="flex items-center gap-1 text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
          <span>Staged</span>
        </span>
      );
    }
    if (status === 'HR Interview') {
      return (
        <span className="flex items-center gap-1 text-[8px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
          <Calendar className="w-2.5 h-2.5 shrink-0" />
          <span>Scheduled Today 14:00</span>
        </span>
      );
    }
    if (status === 'User Interview') {
      return (
        <span className="flex items-center gap-1 text-[8px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
          <Calendar className="w-2.5 h-2.5 shrink-0" />
          <span>Scheduled Tomorrow</span>
        </span>
      );
    }
    if (status === 'Medical Check') {
      return (
        <span className="bg-pink-50 text-pink-600 font-bold text-[9px] px-2 py-0.5 rounded border border-pink-100 uppercase">
          MCU Lab
        </span>
      );
    }
    if (status === 'Onboarding') {
      return (
        <span className="bg-emerald-50 text-emerald-600 font-bold text-[9px] px-2 py-0.5 rounded border border-emerald-100 uppercase">
          Passed
        </span>
      );
    }
    return null;
  };

  // Mock timestamp based on ID to simulate "Updated X mins ago"
  const getMockUpdatedTime = (id: number) => {
    if (id % 5 === 0) return 'Updated 10m ago';
    if (id % 3 === 0) return 'Updated 1h ago';
    if (id % 2 === 0) return 'Updated 3h ago';
    return 'Updated yesterday';
  };

  // Mock avatar picture
  const getCandidateAvatar = (id: number) => {
    const urls = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60&h=60',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60&h=60',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60&h=60',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=60&h=60',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60&h=60'
    ];
    return urls[id % urls.length];
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="pipeline-board-page">
      
      {/* Header section identical to right mockup */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface font-sans lg:text-2xl leading-none">Recruitment Pipeline</h2>
          <p className="text-xs text-on-surface-variant mt-2">
            Manage your candidates across different hiring stages
          </p>
        </div>
        <div>
          <button 
            type="button"
            onClick={onAddCandidate}
            className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 h-10 rounded shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Board search & filter filters */}
      <div className="bg-white p-3.5 border border-table-border rounded-lg flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari kandidat berdasarkan nama atau posisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface-container-lowest border border-outline-variant rounded text-xs focus:outline-none focus:border-primary transition-all font-sans"
          />
        </div>
        
        <div className="w-full sm:w-64 flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-on-surface-variant shrink-0" />
          <select 
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-xs focus:outline-none focus:border-primary transition-all font-sans"
          >
            <option value="All">All Positions</option>
            {positionsList.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Horizontal Scrollable container */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-280px)] min-h-[500px]">
          
          {columns.map((column) => {
            const colCandidates = getCandidatesByColumn(column.id);
            
            return (
              <div 
                key={column.id}
                className="w-80 flex-shrink-0 flex flex-col bg-surface-container-low/40 rounded-xl border border-table-border shadow-sm overflow-hidden"
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-table-border bg-white flex justify-between items-center border-t-4 ${column.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px] text-on-surface uppercase tracking-wider font-sans">
                      {column.title}
                    </span>
                    <span className="bg-surface-container text-on-surface-variant font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {colCandidates.length}
                    </span>
                  </div>
                  <button type="button" className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Body Cards */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin bg-surface-container-lowest/30">
                  {colCandidates.length === 0 ? (
                    <div className="h-28 border border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center text-center p-4">
                      <User className="w-5 h-5 text-on-surface-variant/40 mb-1" />
                      <p className="text-[10px] font-medium text-on-surface-variant/60">No candidates in this stage</p>
                    </div>
                  ) : (
                    colCandidates.map((cand) => (
                      <div 
                        key={cand.id}
                        className="bg-white border border-table-border hover:border-primary rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                      >
                        {/* Upper row of card */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img 
                              src={getCandidateAvatar(cand.id)} 
                              alt={cand.name} 
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-outline-variant shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors" title={cand.name}>
                                {cand.name}
                              </h4>
                              <p className="text-[10px] text-on-surface-variant/80 font-mono font-medium truncate mt-0.5">
                                {cand.position}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Middle row details/indicators */}
                        <div className="flex items-center justify-between mt-1">
                          {/* Left helper updated time */}
                          <span className="text-[9px] text-on-surface-variant font-medium flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-on-surface-variant/60" />
                            {getMockUpdatedTime(cand.id)}
                          </span>

                          {/* Dynamic Badge indicator */}
                          {renderCardStatusIndicator(cand, normalizeStatus(cand.status))}
                        </div>

                        {/* Move controls bottom overlay */}
                        <div className="mt-3 pt-3 border-t border-dotted border-table-border flex justify-between items-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveCandidate(cand.id, cand.status, 'left')}
                              disabled={column.id === columns[0].id}
                              className="p-1 rounded bg-surface-container-low border border-outline-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer text-on-surface-variant transition-colors"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCandidate(cand.id, cand.status, 'right')}
                              disabled={column.id === columns[columns.length - 1].id}
                              className="p-1 rounded bg-surface-container-low border border-outline-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer text-on-surface-variant transition-colors"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onEditCandidate(cand)}
                            className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
}
