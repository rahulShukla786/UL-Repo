import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import type { StageData, AdHocProofOfWorkItem } from '../../../types';
import { ExceptionPanel } from '../ExceptionPanel';

interface DataValidationProps {
  stage: StageData;
}

// ── Ad-hoc proof-of-work card ─────────────────────────────────────────────────
const ProofOfWorkCard: React.FC<{ item: AdHocProofOfWorkItem }> = ({ item }) => {
  const validated = item.totalRows - item.affectedRows;
  const isPassed = item.status === 'passed';

  return (
    <div className="flex items-start justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isPassed
              ? 'border-2 border-completed'
              : 'bg-amber-400'
          }`}
        >
          {isPassed ? (
            <Check size={11} strokeWidth={3} className="text-completed" />
          ) : (
            <AlertTriangle size={11} strokeWidth={2.5} className="text-white" />
          )}
        </span>

        {/* Title + description */}
        <div>
          <p className="text-[13px] font-semibold text-gray-900">{item.title}</p>
          <p className="text-[12px] text-gray-500">{item.description}</p>
        </div>
      </div>

      {/* "N/M validated" badge */}
      <span
        className={`text-[12px] font-semibold flex-shrink-0 ml-4 px-2 py-0.5 rounded-full whitespace-nowrap ${
          isPassed
            ? 'bg-completed-light text-completed'
            : 'bg-amber-50 text-amber-600'
        }`}
      >
        {validated}/{item.totalRows} validated
      </span>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export const DataValidation: React.FC<DataValidationProps> = ({ stage }) => {
  const hasValidationFailure = stage.exceptionType === 'validation_failed';

  // Ad-hoc flow — show proof-of-work items (derived from validation rules + input data)
  if (stage.adHocProofOfWork) {
    return (
      <div className="mt-2 space-y-3">
        {stage.adHocProofOfWork.map((item) => (
          <ProofOfWorkCard key={item.ruleId} item={item} />
        ))}
      </div>
    );
  }

  // Standard flow — show generic validation checks
  return (
    <div className="mt-2 space-y-3">
      {stage.validationChecks?.map((check, i) => (
        <div
          key={i}
          className="flex items-start justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50"
        >
          <div className="flex items-start gap-3">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                check.status === 'passed'
                  ? 'border-2 border-completed'
                  : 'bg-failed'
              }`}
            >
              <Check
                size={11}
                strokeWidth={3}
                className={
                  check.status === 'passed' ? 'text-completed' : 'text-white'
                }
              />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">{check.title}</p>
              <p className="text-[12px] text-gray-500">{check.description}</p>
            </div>
          </div>
          <span
            className={`text-[13px] font-medium flex-shrink-0 ml-4 ${
              check.status === 'passed' ? 'text-completed' : 'text-failed'
            }`}
          >
            {check.result}
          </span>
        </div>
      ))}

      {/* Validation Failed Exception Panel */}
      {hasValidationFailure && (
        <ExceptionPanel stage={stage} variant="error" />
      )}
    </div>
  );
};

export default DataValidation;
