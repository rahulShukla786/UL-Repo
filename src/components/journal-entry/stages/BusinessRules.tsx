import React from 'react';
import { Check } from 'lucide-react';
import type { StageData } from '../../../types';

interface BusinessRulesProps {
  stage: StageData;
}

export const BusinessRules: React.FC<BusinessRulesProps> = ({ stage }) => {
  if (!stage.businessRuleCategories) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {stage.businessRuleCategories.map((cat) => (
        <div
          key={cat.title}
          className="border border-gray-200 rounded-lg p-3 bg-gray-50"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
              <Check size={11} strokeWidth={3} className="text-completed" />
            </span>
            <h4 className="text-[13px] font-semibold text-gray-900">{cat.title}</h4>
          </div>
          <ul className="space-y-1 pl-1">
            {cat.items.map((item) => (
              <li key={item} className="text-[12px] text-gray-700 flex items-start gap-1.5">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default BusinessRules;
