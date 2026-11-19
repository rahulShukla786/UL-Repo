import React from 'react';
import { cn } from '../../lib/utils';
import type { JEStatus, StageStatus } from '../../types';

interface ProgressBarProps {
  progress?: number;
  status: JEStatus | StageStatus;
  showCancel?: boolean;
  onCancel?: () => void;
}

const getBarColor = (status: JEStatus | StageStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-completed';
    case 'failed':
    case 'action_required':
    case 'pending':
    case 'in_progress':
    default:
      return 'bg-brand';
  }
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  status,
  showCancel = false,
  onCancel,
}) => {
  const isAnimated = status === 'pending' || status === 'in_progress';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            getBarColor(status),
            isAnimated && progress < 100 && 'progress-shimmer',
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showCancel && status !== 'completed' && status !== 'failed' && (
        <button
          onClick={onCancel}
          className="text-brand text-[13px] font-medium hover:underline shrink-0"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default ProgressBar;
