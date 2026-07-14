import { User, PhoneCall, Users, XCircle, UserCheck, TrendingUp } from 'lucide-react';
import { Candidate } from '../types';

interface StatsCardsProps {
  candidates: Candidate[];
}

export default function StatsCards({ candidates }: StatsCardsProps) {
  // Dynamically calculate metrics
  const totalCandidates = candidates.length;
  
  const hrInterviewCount = candidates.filter(
    (c) => c.status === 'HR Interview'
  ).length;
  
  const userInterviewCount = candidates.filter(
    (c) => c.status === 'User Interview'
  ).length;
  
  const rejectedCount = candidates.filter(
    (c) => c.status === 'Ditolak'
  ).length;
  
  const onboardingCount = candidates.filter(
    (c) => c.status === 'Onboarding'
  ).length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
      
      {/* Card 1: Total Candidates */}
      <div className="bg-surface-container-lowest p-6 border border-table-border rounded-lg shadow-sm">
        <p className="font-sans text-xs font-semibold text-on-surface-variant mb-2">Total Kandidat</p>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold text-primary tracking-tight">{totalCandidates}</span>
          <div className="p-1 bg-blue-50 rounded">
            <User className="text-primary w-5 h-5" />
          </div>
        </div>
        <p className="font-mono text-[11px] font-semibold text-status-success mt-2 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> 
          <span>+2 today</span>
        </p>
      </div>

      {/* Card 2: HR Interview */}
      <div className="bg-surface-container-lowest p-6 border border-table-border rounded-lg shadow-sm">
        <p className="font-sans text-xs font-semibold text-on-surface-variant mb-2">HR Interview</p>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold text-status-info tracking-tight">{hrInterviewCount}</span>
          <div className="p-1 bg-blue-50 rounded">
            <PhoneCall className="text-status-info w-5 h-5 opacity-70" />
          </div>
        </div>
        <p className="font-sans text-[11px] text-on-surface-variant mt-2">In screening phase</p>
      </div>

      {/* Card 3: User Interview */}
      <div className="bg-surface-container-lowest p-6 border border-table-border rounded-lg shadow-sm">
        <p className="font-sans text-xs font-semibold text-on-surface-variant mb-2">User Interview</p>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold text-status-warning tracking-tight">{userInterviewCount}</span>
          <div className="p-1 bg-orange-50 rounded">
            <Users className="text-status-warning w-5 h-5 opacity-70" />
          </div>
        </div>
        <p className="font-sans text-[11px] text-on-surface-variant mt-2">Scheduled for this week</p>
      </div>

      {/* Card 4: Rejected */}
      <div className="bg-surface-container-lowest p-6 border border-table-border rounded-lg shadow-sm">
        <p className="font-sans text-xs font-semibold text-on-surface-variant mb-2">Rejected</p>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold text-status-error tracking-tight">{rejectedCount}</span>
          <div className="p-1 bg-red-50 rounded">
            <XCircle className="text-status-error w-5 h-5 opacity-70" />
          </div>
        </div>
        <p className="font-sans text-[11px] text-on-surface-variant mt-2">Post-assessment rejections</p>
      </div>

      {/* Card 5: Onboarding */}
      <div className="bg-surface-container-lowest p-6 border border-table-border rounded-lg shadow-sm">
        <p className="font-sans text-xs font-semibold text-on-surface-variant mb-2">Onboarding</p>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold text-status-neutral tracking-tight">{onboardingCount}</span>
          <div className="p-1 bg-gray-50 rounded">
            <UserCheck className="text-status-neutral w-5 h-5 opacity-70" />
          </div>
        </div>
        <p className="font-sans text-[11px] text-on-surface-variant mt-2">Final offer pending</p>
      </div>

    </section>
  );
}
