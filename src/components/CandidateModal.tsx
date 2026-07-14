import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Candidate, CandidateStatus, InterviewResult } from '../types';
import { POSITIONS_LIST } from '../data';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: Omit<Candidate, 'id'> & { id?: number }) => void;
  candidateToEdit?: Candidate | null;
}

const STATUSES: CandidateStatus[] = [
  'HR Interview',
  'User Interview',
  'Medical Check',
  'Pending',
  'Onboarding',
  'Ditolak'
];

const INTERVIEW_RESULTS: InterviewResult[] = [
  '-',
  'Dijadwalkan',
  'Lolos',
  'Tidak Lolos',
  'No Show'
];

export default function CandidateModal({ isOpen, onClose, onSave, candidateToEdit }: CandidateModalProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState(POSITIONS_LIST[0]);
  const [status, setStatus] = useState<CandidateStatus>('HR Interview');
  const [hrResult, setHrResult] = useState<InterviewResult>('Dijadwalkan');
  const [userResult, setUserResult] = useState<InterviewResult>('-');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (candidateToEdit) {
      setName(candidateToEdit.name);
      setPosition(candidateToEdit.position);
      setStatus(candidateToEdit.status);
      setHrResult(candidateToEdit.hrResult);
      setUserResult(candidateToEdit.userResult);
      setNotes(candidateToEdit.notes);
    } else {
      // Reset forms for new candidate
      setName('');
      setPosition(POSITIONS_LIST[0]);
      setStatus('HR Interview');
      setHrResult('Dijadwalkan');
      setUserResult('-');
      setNotes('');
    }
  }, [candidateToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: candidateToEdit?.id,
      name: name.trim(),
      position,
      status,
      hrResult,
      userResult,
      notes: notes.trim() || '-',
      dateAdded: candidateToEdit?.dateAdded || new Date().toISOString().split('T')[0]
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fadeIn">
      <div className="bg-white border border-table-border rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-table-border flex justify-between items-center bg-surface-container-low">
          <h3 className="font-bold text-primary text-sm lg:text-base">
            {candidateToEdit ? 'Edit Candidate Details' : 'Add New Candidate'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-on-surface focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name field */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
              Candidate Name (Nama Kandidat) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bertolomeus Rowa"
              className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
            />
          </div>

          {/* Position field */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
              Applied Position (Posisi)
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
            >
              {POSITIONS_LIST.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Status */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CandidateStatus)}
                className="w-full h-10 px-2 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* HR Result */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                HR Result
              </label>
              <select
                value={hrResult}
                onChange={(e) => setHrResult(e.target.value as InterviewResult)}
                className="w-full h-10 px-2 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              >
                {INTERVIEW_RESULTS.map((res) => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
            </div>

            {/* User Result */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                User Result
              </label>
              <select
                value={userResult}
                onChange={(e) => setUserResult(e.target.value as InterviewResult)}
                className="w-full h-10 px-2 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              >
                {INTERVIEW_RESULTS.map((res) => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes field */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
              Notes (Catatan)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Potensial safety specialist, Ijazah lengkap"
              className="w-full p-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-table-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant rounded font-sans font-semibold text-xs text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded font-sans font-semibold text-xs hover:bg-primary-container transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
