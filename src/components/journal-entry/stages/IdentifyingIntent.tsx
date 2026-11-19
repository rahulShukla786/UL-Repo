import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { StageData } from '../../../types';
import { ExceptionPanel } from '../ExceptionPanel';

interface IdentifyingIntentProps {
  stage: StageData;
  onExceptionResolve?: (fileName?: string) => void;
}

export const IdentifyingIntent: React.FC<IdentifyingIntentProps> = ({ stage, onExceptionResolve }) => {
  return (
    <div className="mt-2 space-y-3">
      {/* Intent details list */}
      {stage.intentDetails && (
        <div className="space-y-2">
          {stage.intentDetails.map((detail, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-completed flex-shrink-0" />
              <span className="text-[13px] text-gray-700">
                {detail.value ? (
                  <>
                    {detail.label}: <span className="font-medium">{detail.value}</span>
                  </>
                ) : (
                  <span className="font-medium">{detail.label}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Exception Panel for missing attachment */}
      {stage.exceptionType && (
        <ExceptionPanel
          stage={stage}
          variant="warning"
          onSendFile={onExceptionResolve}
        />
      )}
    </div>
  );
};

export default IdentifyingIntent;
