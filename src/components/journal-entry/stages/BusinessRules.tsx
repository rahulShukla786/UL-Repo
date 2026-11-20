import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import type { StageData } from '../../../types';

interface BusinessRulesProps {
  stage: StageData;
}

// Number of rules shown per box before "Show more"
const INITIAL_VISIBLE_RULES = 10;

export const BusinessRules: React.FC<BusinessRulesProps> = ({ stage }) => {
  // Category whose full rule list is shown in the modal
  const [modalTitle, setModalTitle] = useState<string | null>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!modalTitle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalTitle(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalTitle]);

  if (!stage.businessRuleCategories) return null;

  const modalCategory = stage.businessRuleCategories.find(
    (cat) => cat.title === modalTitle,
  );

  return (
    <>
    <div className="grid grid-cols-2 gap-3 mt-2">
      {stage.businessRuleCategories.map((cat) => (
        <div
          key={cat.title}
          className="border border-gray-200 rounded-lg p-3 bg-gray-50"
        >
          <div className={cat.referenceFiles?.length ? "grid grid-cols-2 gap-4" : ""}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
                  <Check size={11} strokeWidth={3} className="text-completed" />
                </span>
                <h4 className="text-[13px] font-semibold text-gray-900">{cat.title}</h4>
              </div>
              {(() => {
                const hasMore = cat.items.length > INITIAL_VISIBLE_RULES;
                const visibleItems = hasMore
                  ? cat.items.slice(0, INITIAL_VISIBLE_RULES)
                  : cat.items;
                return (
                  <>
                    <ul className="space-y-1 pl-1">
                      {visibleItems.map((item) => (
                        <li key={item} className="text-[12px] text-gray-700 flex items-start gap-1.5">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {hasMore && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => setModalTitle(cat.title)}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline cursor-pointer"
                        >
                          Show more ({cat.items.length - INITIAL_VISIBLE_RULES}){" "}
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Reference Files column (same green check icon as the title) */}
            {cat.referenceFiles && cat.referenceFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
                    <Check size={11} strokeWidth={3} className="text-completed" />
                  </span>
                  <h4 className="text-[13px] font-semibold text-gray-900">Reference Files</h4>
                </div>
                <ul className="space-y-1 pl-1">
                  {cat.referenceFiles.map((file) => (
                    <li key={file} className="text-[12px] text-gray-700 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 flex-shrink-0" />
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* All-rules modal */}
    {modalCategory &&
      createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalTitle(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
                  <Check size={11} strokeWidth={3} className="text-completed" />
                </span>
                <h3 className="text-[14px] font-semibold text-gray-900">
                  {modalCategory.title}
                </h3>
                <span className="text-[12px] text-gray-500">
                  ({modalCategory.items.length} rules)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalTitle(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="space-y-1.5 px-5 py-4 overflow-y-auto">
              {modalCategory.items.map((item) => (
                <li key={item} className="text-[12px] text-gray-700 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default BusinessRules;
