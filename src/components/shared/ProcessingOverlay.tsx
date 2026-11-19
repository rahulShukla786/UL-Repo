import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  message?: string;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  message = 'Processing',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      {/* Spinner and text */}
      <div className="relative flex flex-col items-center gap-4">
        <Loader2
          size={48}
          className="text-gray-500 animate-spin"
        />
        <p className="text-[15px] font-medium text-gray-700">{message}</p>
      </div>

      {/* Progress bar at bottom of document area */}
      <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 w-[300px]">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full animate-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
