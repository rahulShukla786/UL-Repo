import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, FileInput, FileOutput, ListChecks, Loader2, Search } from "lucide-react";
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

/** Simulated process steps of a sub-stage (email stages have one "reading email" step) */
const runSteps = (s: StageData): TabKey[] => (isEmailStage(s) ? ["input"] : availableTabs(s));

/** Process-step tab labels: read input -> apply rules -> retrieve output */
const TAB_LABELS: Record<TabKey, string> = {
  input: "Reading Input",
  rules: "Applying Rules",
  output: "Retrieving Output",
};
const TAB_ICONS: Record<TabKey, React.ElementType> = {
  input: FileInput,
  rules: ListChecks,
  output: FileOutput,
};

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const uniqueRuleCount = (s: StageData) => new Set(ruleGroups(s).flatMap((g) => g.rules)).size;

/** Simulated processing steps shown while a tab "runs" (UI only, no logic change) */
const PROCESS_TITLES: Record<TabKey, string> = {
  input: "Reading input data",
  rules: "Applying business rules",
  output: "Retrieving output",
};
const successText = (s: StageData, tab: TabKey): string => {
  if (tab === "input") {
    const rec = s.totalRecords != null ? ` \u00b7 ${s.totalRecords.toLocaleString("en-GB")} records` : "";
    return `Input read successfully \u00b7 ${plural(inputTables(s).length, "file")}${rec}`;
  }
  if (tab === "rules") return `${plural(uniqueRuleCount(s), "rule")} applied successfully`;
  return `Output retrieved successfully \u00b7 ${plural(outputTables(s).length, "file")} generated`;
};

/** Lightweight loading placeholder (no progress bar): spinner + one line of text */
const LoadingPanel: React.FC<{ tab: TabKey; waiting: boolean }> = ({ tab, waiting }) => (
  <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 rounded-lg py-12 bg-gray-50/50">
    <Loader2 size={22} className="animate-spin text-brand" />
    <p className="text-[13px] font-medium text-gray-700">{`${PROCESS_TITLES[tab]}\u2026`}</p>
    <p className="text-[11px] text-gray-400">
      {waiting ? "Queued \u00b7 starts after the previous step" : "Processing, please wait"}
    </p>
  </div>
);

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
  // Simulated processing: completed steps per sub-stage + the step currently running
  const [done, setDone] = useState<Record<number, TabKey[]>>({});
  const [running, setRunning] = useState<{ stageId: number; tab: TabKey; pct: number } | null>(null);

  // While true, the right-side tab follows the step that is currently running
  const [follow, setFollow] = useState(true);
  // Auto-run: when Stage 2 opens, every sub-stage runs one after another
  const [auto, setAuto] = useState(true);

  /** Start (or resume) a sub-stage: runs Reading Input -> Applying Rules -> Retrieving Output in sequence */
  const startStage = (s: StageData, doneMap: Record<number, TabKey[]> = done) => {
    const next = runSteps(s).find((t) => !doneMap[s.id]?.includes(t));
    if (next) setRunning({ stageId: s.id, tab: next, pct: 0 });
    return Boolean(next);
  };

  // The sub-stage selected on first render starts as if it was clicked
  useEffect(() => {
    if (selected) startStage(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance the step slowly (fast at first, slower near the end), then move to the next step
  useEffect(() => {
    if (!running) return;
    if (running.pct >= 100) {
      const t = setTimeout(() => {
        const { stageId, tab } = running;
        const doneNow = Array.from(new Set([...(done[stageId] ?? []), tab]));
        setDone((d) => ({ ...d, [stageId]: doneNow }));
        const doneMap = { ...done, [stageId]: doneNow };
        const stage = subStages.find((s) => s.id === stageId);
        const next = stage ? runSteps(stage).find((x) => !doneNow.includes(x)) : undefined;
        if (next) {
          setRunning({ stageId, tab: next, pct: 0 });
          if (follow && selectedId === stageId) setActiveTab(next);
          return;
        }
        setRunning(null);
        if (!auto) return;
        // Sub-stage finished: move on to the next sub-stage that is not complete yet
        const nextStage = subStages.find((s) => runSteps(s).some((x) => !doneMap[s.id]?.includes(x)));
        if (nextStage) {
          setSelectedId(nextStage.id);
          setActiveTab(availableTabs(nextStage)[0] ?? "input");
          setFollow(true);
          startStage(nextStage, doneMap);
        } else {
          // All sub-stages complete: go back to the first one on Reading Input
          setAuto(false);
          setSelectedId(subStages[0]?.id ?? null);
          setActiveTab("input");
        }
      }, 300);
      return () => clearTimeout(t);
    }
    const step = running.pct < 50 ? 5 : running.pct < 80 ? 3 : 2;
    const t = setTimeout(() => setRunning((r) => (r ? { ...r, pct: Math.min(100, r.pct + step) } : r)), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, done, follow, auto, selectedId, subStages]);

  /** Card progress: starts at 20% when clicked, then fills as each step completes */
  const cardProgress = (s: StageData) => {
    const total = runSteps(s).length || 1;
    const doneN = done[s.id]?.length ?? 0;
    const run = running?.stageId === s.id ? running : null;
    const frac = (doneN + (run ? run.pct / 100 : 0)) / total;
    const pct = doneN >= total ? 100 : run || doneN ? Math.min(100, 20 + frac * 80) : 0;
    const complete = doneN >= total;
    const status = run
      ? isEmailStage(s)
        ? "Reading email\u2026"
        : `${TAB_LABELS[run.tab]}\u2026`
      : complete
        ? "Completed"
        : doneN === 0
          ? "Not started"
          : `${doneN} of ${total} steps done`;
    return { pct, complete, status };
  };

  // Selecting a stage always opens its first tab (Input when the stage has inputs)
  const selectStage = (s: StageData) => {
    setSelectedId(s.id);
    setActiveTab(availableTabs(s)[0] ?? "input");
    setFollow(true);
    // A manual click stops the auto-run; the clicked sub-stage starts (a completed one is not re-run)
    setAuto(false);
    if (running?.stageId !== s.id) startStage(s);
  };

  if (!selected) return null;

  // Email stages show only the email preview: no Input/Rules/Output cards and no tabs
  const isEmail = isEmailStage(selected);
  const currentTab = isEmail ? "input" : tabs.includes(activeTab) ? activeTab : tabs[0];
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
                      {/* Only the "Selected" badge is shown (no "Done" badge) */}
                      {isSel && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 bg-brand-surface text-brand">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{stageSummary(s)}</p>
                    {/* Process progress (email stages included) */}
                    {(() => {
                      const p = cardProgress(s);
                      return (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-100", p.complete ? "bg-green-500" : "bg-brand")}
                              style={{ width: `${p.pct}%` }}
                            />
                          </div>
                          <p
                            className={cn(
                              "flex items-center gap-1 text-[10px] mt-1",
                              p.complete ? "text-green-600 font-semibold" : "text-gray-500",
                            )}
                          >
                            {p.complete && <CheckCircle2 size={11} />}
                            {p.status}
                            <span className="ml-auto">{Math.round(p.pct)}%</span>
                          </p>
                        </div>
                      );
                    })()}
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
            </div>

            {!isEmail && (
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
            )}

            {/* Tabs: only those the stage actually has (hidden for email stages) */}
            {!isEmail && (
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
              {tabs.map((t) => {
                const isDone = !!done[selected.id]?.includes(t);
                const isRunning = running?.stageId === selected.id && running.tab === t;
                const Icon = isRunning ? Loader2 : isDone ? CheckCircle2 : TAB_ICONS[t];
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setActiveTab(t);
                      setFollow(false);
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-colors cursor-pointer",
                      currentTab === t ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    <Icon
                      size={14}
                      className={cn(isRunning && "animate-spin", isDone && !isRunning && "text-green-600")}
                    />
                    {TAB_LABELS[t]}
                  </button>
                );
              })}
            </div>
            )}

            {/* Step not finished yet: simple loading placeholder (progress is shown on the card) */}
            {!isEmail && currentTab && !done[selected.id]?.includes(currentTab) && (
              <LoadingPanel
                tab={currentTab}
                waiting={!(running?.stageId === selected.id && running.tab === currentTab)}
              />
            )}

            {/* Completed step: success note above the content */}
            {!isEmail && currentTab && done[selected.id]?.includes(currentTab) && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-[12px] font-medium text-green-700">
                <CheckCircle2 size={14} />
                {successText(selected, currentTab)}
              </div>
            )}

            {currentTab === "input" && (isEmail || done[selected.id]?.includes("input")) && (
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

            {currentTab === "rules" && done[selected.id]?.includes("rules") && (
              <RulesPanel key={selected.id} groups={ruleGroups(selected)} />
            )}

            {currentTab === "output" && done[selected.id]?.includes("output") && (
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
