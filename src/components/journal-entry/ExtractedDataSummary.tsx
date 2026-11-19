import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ExtractedField } from '../../types';

interface ExtractedDataSummaryProps {
  fields: ExtractedField[];
  extractedCount: number;
  confidenceScore: number;
  onEdit?: () => void;
}

export const ExtractedDataSummary: React.FC<ExtractedDataSummaryProps> = ({
  fields,
  extractedCount,
  confidenceScore,
  onEdit,
}) => {
  return (
    <div className="border border-source-email-border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide mb-1">
          DATA SUMMARY
        </p>
        <div className="flex items-center justify-between bg-brand-surface rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand" />
            <div>
              <p className="text-[13px] font-semibold text-gray-900">
                AI Extracted {extractedCount} Data Points
              </p>
              <p className="text-[11px] text-gray-500">
                Confidence Score: {confidenceScore}%
              </p>
            </div>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-[13px] text-brand font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="divide-y divide-gray-100">
        {fields.map((field, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <span className="text-[13px] text-gray-700 whitespace-nowrap">{field.label}</span>
            <span
              className={
                field.isLink
                  ? 'text-[13px] text-brand font-medium whitespace-nowrap'
                  : 'text-[13px] text-gray-900 whitespace-nowrap'
              }
            >
              {field.value || '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractedDataSummary;
