import React, { useState } from "react";
import { Check, Download, Search } from "lucide-react";
import type { StageData, SourcePreviewTable } from "../../types";
import { DocumentPreview } from "./DocumentPreview";
import { EmailDetails } from "./stages/EmailDetails";
import { cn } from "../../lib/utils";

interface StageGroupViewProps {
  /** Original stages shown inside the group (names are kept as-is, e.g. "Stage 2: Data Processing 1") */
  subStages: StageData[];
}

type TabKey = "input" | "rules" | "output";

const inputTables = (s: StageData): SourcePreviewTable[] => s.sourcePreviewTables ?? [];

const outputTables = (s: StageData): SourcePreviewTable[] => [
  ...(s.outputPreviewTable ? [s.outputPreviewTable] : []),
  ...(s.outputPreviewTables ?? []),
];

/** Rules grouped by the file / email they apply to */
const ruleGroups = (s: StageData): { label: string; rules: string[] }[] => {
  const groups: { label: string; rules: string[] }[] = [];
  inputTables(s).forEach((t) => {
    if (t.rules?.length) groups.push({ label: `Input \u00b7 ${t.fileName}`, rules: t.rules });
  });
  outputTables(s).forEach((t) => {
    if (t.rules?.length) groups.push({ label: `Output \u00b7 ${t.fileName}`, rules: t.rules });
  });
  if (s.emailDetails?.rules?.length) {
    groups.push({ label: `Email \u00b7 ${s.emailDetails.subject}`, rules: s.emailDetails.rules });
  }
  return groups;
};

const isEmailStage = (s: StageData) => s.componentType === "email_details" && !!s.emailDetails;

const stageSummary = (s: StageData): string => {
  if (isEmailStage(s)) {
    const att = s.emailDetails?.attachments?.length ?? 0;
    return `Email \u00b7 ${att} attachment${att === 1 ? "" : "s"}`;
  }
  const inCount = inputTables(s).length;
  const outCount = outputTables(s).length;
  const parts = [`${inCount} input file${inCount === 1 ? "" : "s"}`];
  if (outCount) parts.push(`${outCount} output file${outCount === 1 ? "" : "s"}`);
  if (s.totalRecords != null) parts.push(`${s.totalRecords.toLocaleString("en-GB")} records`);
  return parts.join(" \u00b7 ");
};

const availableTabs = (s: StageData): TabKey[] => {
  const tabs: TabKey[] = [];
  if (inputTables(s).length || isEmailStage(s)) tabs.push("input");
  if (ruleGroups(s).length) tabs.push("rules");
  if (outputTables(s).length) tabs.push("output");
  return tabs;
};

const TAB_LABELS: Record<TabKey, string> = { input: "Input", rules: "Rules", output: "Output" };

/** Split "R001 — Confirms …" (Warehouse) or "R001: Confirms …" (Logistics) into id + text */
const parseRule = (r: string): { id: string; text: string } => {
  const m = r.match(/^\s*([A-Za-z]{0,4}\d+[A-Za-z0-9_]*)\s*[:\u2014\u2013-]\s*([\s\S]*)$/);
  return m ? { id: m[1], text: m[2] } : { id: "", text: r };
};

/** Compact single-view rules panel: de-duplicated, searchable, filterable by source file */
const RulesPanel: React.FC<{ groups: { label: string; rules: string[] }[] }> = ({ groups }) => {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<string>("all");

  // Unique rules with the files/emails they apply to
  const unique = new Map<string, string[]>();
  groups.forEach((g) =>
    g.rules.forEach((r) => unique.set(r, [...(unique.get(r) ?? []), g.label])),
  );
  const all = Array.from(unique.entries()).map(([rule, sources]) => ({ ...parseRule(rule), sources }));

  const q = query.trim().toLowerCase();
  const visible = all.filter(
    (r) =>
      (source === "all" || r.sources.includes(source)) &&
      (!q || r.id.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)),
  );

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Toolbar: search + source filter + count */}
      <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rules"
            className="pl-7 pr-2 py-1 text-[12px] border border-gray-200 rounded-md bg-white w-[200px] focus:outline-none focus:border-brand"
          />
        </div>
        {groups.length > 1 &&
          ["all", ...groups.map((g) => g.label)].map((label) => (
            <button
              key={label}
              onClick={() => setSource(label)}
              title={label}
              className={cn(
                "px-2 py-0.5 text-[11px] rounded-full border max-w-[220px] truncate cursor-pointer",
                source === label
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
              )}
            >
              {label === "all" ? `All files` : label.split(" \u00b7 ").pop()}
            </button>
          ))}
        <span className="ml-auto text-[11px] text-gray-500">
          {visible.length} of {all.length} rules
          {groups.length === 1 && ` \u00b7 ${groups[0].label}`}
        </span>
      </div>

      {/* Two-column compact grid, scrolls inside a fixed height */}
      <div className="max-h-[420px] overflow-y-auto">
        {visible.length ? (
          <ul className="grid grid-cols-1 xl:grid-cols-2">
            {visible.map((r) => (
              <li
                key={`${r.id}-${r.text}`}
                className="flex items-start gap-2 px-3 py-1.5 border-b border-gray-100 text-[12px] leading-snug"
              >
                {r.id && (
                  <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-brand bg-brand-surface rounded px-1.5 py-0.5">
                    {r.id}
                  </span>
                )}
                <span className="text-gray-700">{r.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 text-[12px] text-gray-500">No rules match your search.</p>
        )}
      </div>
    </div>
  );
};

/** Inline view shown inside the expanded grouped stage (Logistics Stage 2) */
export const StageGroupView: React.FC<StageGroupViewProps> = ({ subStages }) => {
  const [selectedId, setSelectedId] = useState<number | null>(subStages[0]?.id ?? null);
  const selected = subStages.find((s) => s.id === selectedId) ?? subStages[0];
  const tabs = selected ? availableTabs(selected) : [];
  const [activeTab, setActiveTab] = useState<TabKey>("input");

  // Selecting a stage always opens its first tab (Input when the stage has inputs)
  const selectStage = (s: StageData) => {
    setSelectedId(s.id);
    setActiveTab(availableTabs(s)[0] ?? "input");
  };

  if (!selected) return null;

  const currentTab = tabs.includes(activeTab) ? activeTab : tabs[0];
  const inCount = inputTables(selected).length + (isEmailStage(selected) ? 1 : 0);
  const outCount = outputTables(selected).length;
  // Unique rules (the same rule set can be attached to several files)
  const rulesCount = new Set(ruleGroups(selected).flatMap((g) => g.rules)).size;

  return (
        <div className="mt-2 flex border border-gray-200 rounded-lg overflow-hidden">
          {/* Pipeline overview */}
          <div className="w-[340px] flex-shrink-0 border-r border-gray-200 p-4 bg-gray-50">
            <p className="text-[14px] font-semibold text-gray-900 mb-3">Pipeline overview</p>
            <div className="space-y-2">
              {subStages.map((s) => {
                const isSel = s.id === selected.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectStage(s)}
                    className={cn(
                      "rounded-lg p-3 cursor-pointer transition-all bg-white border",
                      isSel ? "border-brand shadow-sm" : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-[13px] font-semibold", isSel ? "text-brand" : "text-gray-900")}>
                        {/* Card title = stage subtitle (no "Stage N: Data Processing M" label) */}
                        {s.purpose}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                          isSel ? "bg-brand-surface text-brand" : "bg-green-50 text-completed",
                        )}
                      >
                        {isSel ? "Selected" : "Done"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{stageSummary(s)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage details */}
          <div className="flex-1 min-w-0 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                {/* Details header: the stage subtitle replaces the title; no separate subtitle */}
                <p className="text-[15px] font-semibold text-gray-900">{selected.purpose}</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-completed">
                <Check size={12} strokeWidth={3} /> Completed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="text-[11px] text-gray-500">Input</p>
                <p className="text-[16px] font-semibold text-gray-900">
                  {isEmailStage(selected) ? "Email" : `${inCount} file${inCount === 1 ? "" : "s"}`}
                  {selected.totalRecords != null && (
                    <span className="text-[12px] font-normal text-gray-500">
                      {` \u00b7 ${selected.totalRecords.toLocaleString("en-GB")} records`}
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="text-[11px] text-gray-500">Rules applied</p>
                <p className="text-[16px] font-semibold text-gray-900">{rulesCount}</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="text-[11px] text-gray-500">Output</p>
                <p className="text-[16px] font-semibold text-gray-900">
                  {outCount ? `${outCount} file${outCount === 1 ? "" : "s"}` : "\u2014"}
                </p>
              </div>
            </div>

            {/* Tabs: only those the stage actually has */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors cursor-pointer",
                    currentTab === t ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {currentTab === "input" && (
              <div className="space-y-4">
                {/* Reference files (e.g. Warehouse snapshot.xlsx / FC Update.xlsx) */}
                {!!selected.stageReferenceFiles?.length && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Reference Files
                    </span>
                    {selected.stageReferenceFiles.map((file) => (
                      <a
                        key={file.fileName}
                        href={file.downloadUrl}
                        download={file.fileName}
                        title={`Download ${file.fileName}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-brand bg-white border border-brand rounded-lg hover:bg-brand-surface transition-colors"
                      >
                        <Download size={14} />
                        {file.fileName}
                      </a>
                    ))}
                  </div>
                )}
                {isEmailStage(selected) && <EmailDetails stage={selected} />}
                {inputTables(selected).map((t) => (
                  <DocumentPreview
                    key={t.fileName}
                    title="INPUT PREVIEW"
                    fileName={t.fileName}
                    sourcePreviewTable={t}
                  />
                ))}
              </div>
            )}

            {currentTab === "rules" && (
              <RulesPanel key={selected.id} groups={ruleGroups(selected)} />
            )}

            {currentTab === "output" && (
              <div className="space-y-4">
                {outputTables(selected).map((t) => (
                  <DocumentPreview
                    key={t.fileName}
                    title="OUTPUT PREVIEW"
                    fileName={t.fileName}
                    sourcePreviewTable={t}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
  );
};

export default StageGroupView;
