import { Candidate } from '../types';

interface StageConversionProps {
  candidates: Candidate[];
}

export default function StageConversion({ candidates }: StageConversionProps) {
  const total = candidates.length;
  
  // HR Passed: either they passed HR, or are further down the pipeline
  const hrPassed = candidates.filter(
    (c) => c.hrResult === 'Lolos' || c.status === 'Medical Check' || c.status === 'Onboarding'
  ).length;

  // User Passed: they passed User interview or are in onboarding
  const userPassed = candidates.filter(
    (c) => c.userResult === 'Lolos' || c.status === 'Onboarding'
  ).length;

  const hrPercentage = total > 0 ? Math.round((hrPassed / total) * 100) : 0;
  const userPercentage = total > 0 ? Math.round((userPassed / total) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest border border-table-border rounded-lg p-6 font-sans">
      <h4 className="text-sm font-bold text-on-surface mb-6 lg:text-base">Stage Conversion</h4>
      
      <div className="space-y-4">
        {/* Stage 1: Applications */}
        <div>
          <div className="flex justify-between mb-1.5 items-end">
            <span className="font-sans text-xs font-semibold text-on-surface-variant">
              Applications ({total})
            </span>
            <span className="font-sans text-xs font-bold text-primary">100%</span>
          </div>
          <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-full transition-all duration-1000" />
          </div>
        </div>

        {/* Stage 2: HR Passed */}
        <div>
          <div className="flex justify-between mb-1.5 items-end">
            <span className="font-sans text-xs font-semibold text-on-surface-variant">
              HR Passed ({hrPassed})
            </span>
            <span className="font-sans text-xs font-bold text-primary">{hrPercentage}%</span>
          </div>
          <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#a0c9ff] h-full transition-all duration-1000" 
              style={{ width: `${hrPercentage}%` }}
            />
          </div>
        </div>

        {/* Stage 3: User Passed */}
        <div>
          <div className="flex justify-between mb-1.5 items-end">
            <span className="font-sans text-xs font-semibold text-on-surface-variant">
              User Passed ({userPassed})
            </span>
            <span className="font-sans text-xs font-bold text-primary">{userPercentage}%</span>
          </div>
          <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#2d6197] h-full transition-all duration-1000" 
              style={{ width: `${userPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-table-border text-center">
        <p className="text-[10px] text-on-surface-variant leading-snug">
          Calculated in real-time based on active application lifecycle progression.
        </p>
      </div>
    </div>
  );
}
