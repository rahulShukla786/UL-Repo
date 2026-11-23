import React, { useState } from 'react';
import { Check, FileSpreadsheet, Search } from 'lucide-react';
import type { StageData } from '../../../types';

interface BusinessRulesProps {
  stage: StageData;
}

/** Split "R001: text" / "R001 — text" into id + text */
const RULE_RE = /^\s*([A-Za-z]{0,4}\d+[A-Za-z0-9_]*)\s*[:\u2014\u2013-]\s*([\s\S]*)$/;
const parseRule = (r: string) => {
  const m = r.match(RULE_RE);
  return m ? { id: m[1], text: m[2] } : { id: '', text: r };
};

const CheckIcon = () => (
  <span className="w-4 h-4 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
    <Check size={9} strokeWidth={3} className="text-completed" />
  </span>
);

const FileChip: React.FC<{ name: string }> = ({ name }) => (
  <span
    title={name}
    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-gray-700 bg-white border border-gray-200 rounded-md max-w-[260px]"
  >
    <FileSpreadsheet size={12} className="text-green-600 flex-shrink-0" />
    <span className="truncate">{name}</span>
  </span>
);

/**
 * Stage 1 compact view: files as a one-line chip strip, and all rule types
 * (Source / Validation / Calculation) side by side in equal-height columns that
 * scroll internally, with one search box across all rules.
 */
export const BusinessRules: React.FC<BusinessRulesProps> = ({ stage }) => {
  const [query, setQuery] = useState('');

  if (!stage.businessRuleCategories) return null;

  const cats = stage.businessRuleCategories;
  // "Source File Requirements" / "Reference Files" are file lists (chip strip); all others are rule columns
  const isFileCat = (title: string) => /source file|reference file/i.test(title);
  const fileCats = cats.filter((c) => isFileCat(c.title));
  const ruleCats = cats.filter((c) => !isFileCat(c.title));
  const referenceFiles = cats.flatMap((c) => c.referenceFiles ?? []);
  const totalRules = ruleCats.reduce((n, c) => n + c.items.length, 0);

  const q = query.trim().toLowerCase();
  const filtered = ruleCats.map((c) => ({
    ...c,
    visible: c.items.filter((i) => !q || i.toLowerCase().includes(q)),
  }));
  const matchCount = filtered.reduce((n, c) => n + c.visible.length, 0);

  return (
    <div className="mt-2 space-y-3">
      {/* Files strip: Source File Requirements, then Reference Files on its own line */}
      {(fileCats.length > 0 || referenceFiles.length > 0) && (
        <div className="flex flex-col gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
          {fileCats.map((c) => (
            <div key={c.title} className="flex items-center gap-2 flex-wrap">
              <CheckIcon />
              <span className="text-[12px] font-semibold text-gray-900">{c.title}</span>
              {c.items.map((f) => (
                <FileChip key={f} name={f} />
              ))}
            </div>
          ))}
          {referenceFiles.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <CheckIcon />
              <span className="text-[12px] font-semibold text-gray-900">Reference Files</span>
              {referenceFiles.map((f) => (
                <FileChip key={f} name={f} />
              ))}
            </div>
          )}
        </div>
      )}

      {ruleCats.length > 0 && (
        <>
          {/* Search across all rule types */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all rules (ID or text)"
                className="pl-7 pr-2 py-1 text-[12px] border border-gray-200 rounded-md bg-white w-[260px] focus:outline-none focus:border-brand"
              />
            </div>
            <span className="text-[11px] text-gray-500">
              {q ? `${matchCount} of ${totalRules} rules match` : `${totalRules} rules`}
            </span>
          </div>

          {/* Rule types side by side; each column scrolls inside a fixed height */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${ruleCats.length}, minmax(0, 1fr))` }}
          >
            {filtered.map((c) => (
              <div key={c.title} className="border border-gray-200 rounded-lg bg-white flex flex-col">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <CheckIcon />
                  <h4 className="text-[13px] font-semibold text-gray-900">{c.title}</h4>
                  <span className="ml-auto text-[11px] font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-2">
                    {q ? `${c.visible.length}/${c.items.length}` : c.items.length}
                  </span>
                </div>
                <ul className="h-[340px] overflow-y-auto">
                  {c.visible.map((item) => {
                    const r = parseRule(item);
                    return (
                      <li
                        key={item}
                        title={item}
                        className="flex items-start gap-2 px-3 py-1 border-b border-gray-100 text-[12px] leading-snug"
                      >
                        {r.id && (
                          <span className="flex-shrink-0 font-mono text-[10px] font-semibold text-brand bg-brand-surface rounded px-1 py-0.5">
                            {r.id}
                          </span>
                        )}
                        <span className="text-gray-700">{r.text}</span>
                      </li>
                    );
                  })}
                  {c.visible.length === 0 && (
                    <li className="px-3 py-3 text-[12px] text-gray-400">No matching rules</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessRules;
