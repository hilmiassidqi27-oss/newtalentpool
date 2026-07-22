import React, { useState } from 'react';
import { TimelineItem } from '../types';
import { Plus, Check, Clock } from 'lucide-react';

interface PipelineTimelineProps {
  timelineItems: TimelineItem[];
  onAddTimelineItem: (title: string, description: string) => void;
}

export default function PipelineTimeline({ timelineItems, onAddTimelineItem }: PipelineTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    onAddTimelineItem(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-surface-container-lowest border border-table-border rounded-lg p-6 font-sans flex flex-col h-full justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-sm font-bold text-on-surface lg:text-base">Pipeline Timeline</h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-primary hover:text-primary-container p-1 rounded hover:bg-surface-container-low transition-all text-xs font-semibold flex items-center gap-1 focus:outline-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Add Event Inline Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-surface-container-low rounded border border-table-border space-y-3 animate-fadeIn">
            <div>
              <label className="block text-[10px] font-semibold text-on-surface uppercase tracking-wider mb-1 font-mono">
                Event Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. July 05 - Job Offer"
                className="w-full h-8 px-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface uppercase tracking-wider mb-1 font-mono">
                Details / Candidates
              </label>
              <input
                type="text"
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Sent offer letter to Muhammad Gilang"
                className="w-full h-8 px-2 bg-white border border-outline-variant rounded text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 border border-outline-variant rounded text-[10px] font-semibold hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-primary text-white rounded text-[10px] font-semibold hover:bg-primary-container"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Timeline Trail */}
        <ul className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-outline-variant">
          {timelineItems.map((item, index) => {
            // First item has active/primary visual cues, second is standard outline, third is half-opacity
            const isFirst = index === 0;
            const isLast = index === timelineItems.length - 1;
            
            return (
              <li 
                key={item.id} 
                className={`relative pl-8 transition-opacity duration-200 ${
                  index >= 2 ? 'opacity-50 hover:opacity-100' : ''
                }`}
              >
                <div className="absolute left-0 top-1 w-6 h-6 bg-surface-container-lowest border-2 border-primary rounded-full flex items-center justify-center z-10">
                  <div className={`w-2 h-2 rounded-full ${isFirst ? 'bg-primary' : 'bg-outline-variant'}`} />
                </div>
                <p className="font-sans text-xs font-semibold text-on-surface">{item.date} - {item.title}</p>
                <p className="font-sans text-xs text-on-surface-variant leading-snug mt-0.5">{item.description}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 pt-4 border-t border-table-border flex items-center gap-2 text-on-surface-variant justify-center sm:justify-start">
        <Clock className="w-3.5 h-3.5 shrink-0 text-status-success" />
        <span className="text-[10px] font-mono font-medium uppercase tracking-wider">
          Last log sync: Just now
        </span>
      </div>
    </div>
  );
}
