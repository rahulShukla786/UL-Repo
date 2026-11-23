import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { Select, SelectItem } from "../shared/Select";
import { cn } from "../../lib/utils";
import { useSOPStore } from "../../stores/sopStore";
import type { SOPRule, SOPRuleStatus } from "../../stores/sopStore";

type RuleStatus = SOPRuleStatus;
type DropPosition = "before" | "after";
type RuleItem = SOPRule;

interface DropTarget {
  id: string;
  position: DropPosition;
}

interface SOPLibraryDetailPanelProps {
  entryId: string;
  sopCode: string;
  name: string;
  version: string;
  category: string;
  lastUpdated: string;
  status: "Active" | "Inactive";
  mappedJournalEntries: string[];
  rules: SOPRule[];
  allJEOptions?: string[];
  onBack: () => void;
}

interface JEOption {
  id: string;
  description: string;
}

const parseJEEntry = (raw: string): JEOption => {
  const idx = raw.indexOf(" - ");
  return idx === -1
    ? { id: raw, description: "" }
    : { id: raw.slice(0, idx), description: raw.slice(idx + 3) };
};

const JE_EXTRA_OPTIONS: JEOption[] = [
  { id: "J221AA181", description: "Cash Transaction Reclass" },
  { id: "J221AA182", description: "AP Cash Reclass" },
  { id: "J304BNK055", description: "Bank Fee Allocation" },
  { id: "J422ADJ330", description: "Year-end Adjustment" },
];

const DragDots: React.FC = () => {
  return (
    <span className="inline-grid grid-cols-2 gap-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <span key={index} className="h-1.5 w-1.5 rounded-full bg-brand" />
      ))}
    </span>
  );
};

const resequenceRules = (items: RuleItem[]): RuleItem[] => {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
};

const StatusPill: React.FC<{ status: RuleStatus }> = ({ status }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-[12px] font-medium",
        status === "Approved"
          ? "border-completed text-completed"
          : status === "Rejected"
            ? "border-failed text-failed"
            : "border-border-default text-fiord",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

/** Renders `text` with every occurrence of `query` wrapped in <strong>. */
const HighlightText: React.FC<{ text: string; query: string }> = ({
  text,
  query,
}) => {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={i} className="font-bold text-[var(--bright-black)]">
            {part}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};

export const SOPLibraryDetailPanel: React.FC<SOPLibraryDetailPanelProps> = ({
  entryId,
  sopCode,
  name,
  version,
  category,
  lastUpdated,
  status,
  mappedJournalEntries,
  rules: initialRules,
  allJEOptions: allJEOptionsProp,
  onBack,
}) => {
  const { updateEntry } = useSOPStore();
  const [rules, setRules] = useState<RuleItem[]>(() =>
    initialRules.map((rule) => ({ ...rule })),
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [draftOrder, setDraftOrder] = useState("Select");
  const [draftType, setDraftType] = useState("Select");
  const [draftRuleText, setDraftRuleText] = useState("");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editDraftText, setEditDraftText] = useState("");
  const [editDraftType, setEditDraftType] = useState("Select");
  const [currentStatus, setCurrentStatus] = useState(status);
  const [successToastMessage, setSuccessToastMessage] = useState<string | null>(null);
  const [isJEExpanded, setIsJEExpanded] = useState(false);
  const [jeSearch, setJeSearch] = useState("");
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleTypeFilter, setRuleTypeFilter] = useState("All");
  const [selectedJEs, setSelectedJEs] = useState<Set<string>>(
    () => new Set(mappedJournalEntries.length > 0 ? mappedJournalEntries.map((e) => parseJEEntry(e).id) : []),
  );

  const triggerSuccessToast = (message = "Changes saved successfully") => {
    setSuccessToastMessage(message);
    setTimeout(() => setSuccessToastMessage(null), 2200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest("[data-rule-menu]") ||
        target.closest("[data-menu-trigger]")
      ) {
        return;
      }
      setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ruleTypes = Array.from(new Set(rules.map((rule) => rule.type)));

  const filteredRuleRows = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        rule.text.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        `rule ${rule.order}`.includes(ruleSearch.toLowerCase());
      const matchesType =
        ruleTypeFilter === "All" || rule.type === ruleTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [rules, ruleSearch, ruleTypeFilter]);

  const allJEOptions = useMemo<JEOption[]>(() => {
    const mappedParsed = mappedJournalEntries.map(parseJEEntry);
    const mappedIds = new Set(mappedParsed.map((e) => e.id));
    if (allJEOptionsProp && allJEOptionsProp.length > 0) {
      const otherParsed = allJEOptionsProp.map(parseJEEntry).filter((e) => !mappedIds.has(e.id));
      return [...mappedParsed, ...otherParsed];
    }
    return [...mappedParsed, ...JE_EXTRA_OPTIONS.filter((e) => !mappedIds.has(e.id))];
  }, [mappedJournalEntries, allJEOptionsProp]);

  const filteredJEOptions = useMemo(() => {
    const q = jeSearch.trim().toLowerCase();
    if (!q) return allJEOptions;
    return allJEOptions.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    );
  }, [allJEOptions, jeSearch]);

  const selectedJEList = useMemo(
    () => allJEOptions.filter((e) => selectedJEs.has(e.id)),
    [allJEOptions, selectedJEs],
  );

  const toggleJE = (id: string) => {
    setSelectedJEs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Sync to Zustand store for navigation persistence
      const mapped = allJEOptions
        .filter((e) => next.has(e.id))
        .map((e) => (e.description ? `${e.id} - ${e.description}` : e.id));
      updateEntry(entryId, { mappedJournalEntries: mapped });
      return next;
    });
  };

  type DropPosition = "before" | "after";

  const moveRule = (
    draggedId: string,
    targetId: string,
    position: DropPosition,
  ) => {
    const items = [...rules];

    const fromIndex = items.findIndex((item) => item.id === draggedId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [movedItem] = items.splice(fromIndex, 1);
    let insertIndex = toIndex;
    if (position === "after") insertIndex++;
    if (fromIndex < insertIndex) insertIndex--;
    items.splice(insertIndex, 0, movedItem);

    const updatedRules = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setRules(updatedRules);
    updateEntry(entryId, { rules: updatedRules });
  };

  // const moveRule = (fromId: string, toId: string, position: DropPosition) => {
  //   if (fromId === toId) return;
  //   setRules((prev) => {
  //     const fromIndex = prev.findIndex((rule) => rule.id === fromId);
  //     if (fromIndex === -1) return prev;

  //     const next = [...prev];
  //     const [moved] = next.splice(fromIndex, 1);
  //     const toIndexAfterRemoval = next.findIndex((rule) => rule.id === toId);

  //     if (toIndexAfterRemoval === -1) return prev;

  //     const insertIndex =
  //       position === "after" ? toIndexAfterRemoval + 1 : toIndexAfterRemoval;

  //     next.splice(insertIndex, 0, moved);
  //     return resequenceRules(next);
  //   });
  // };

  const updateRuleStatus = (id: string, status: RuleStatus) => {
    const updatedRules = rules.map((rule) =>
      rule.id === id ? { ...rule, status } : rule,
    );
    setRules(updatedRules);
    updateEntry(entryId, { rules: updatedRules });
    setOpenMenuId(null);
    triggerSuccessToast(`Rule ${status.toLowerCase()} successfully`);
  };

  const editRule = (id: string) => {
    const current = rules.find((rule) => rule.id === id);
    if (!current) return;

    // Adjust puts the rule back to Pending (saved to the library entry)
    const updatedRules = rules.map((rule) =>
      rule.id === id ? { ...rule, status: "Pending" as RuleStatus } : rule,
    );
    setRules(updatedRules);
    updateEntry(entryId, { rules: updatedRules });
    setEditingRuleId(id);
    setEditDraftText(current.text);
    setEditDraftType(current.type);
    setOpenMenuId(null);
  };

  const cancelEditRule = () => {
    setEditingRuleId(null);
    setEditDraftText("");
    setEditDraftType("Select");
  };

  const saveEditedRule = () => {
    if (!editingRuleId || !editDraftText.trim() || editDraftType === "Select") {
      return;
    }

    const updatedRules = rules.map((rule) =>
      rule.id === editingRuleId
        ? {
            ...rule,
            text: editDraftText.trim(),
            type: editDraftType,
          }
        : rule,
    );
    setRules(updatedRules);
    updateEntry(entryId, { rules: updatedRules });

    cancelEditRule();
    triggerSuccessToast();
  };

  const startAddRule = () => {
    setIsAddingRule(true);
    setDraftOrder(String(rules.length + 1));
    setDraftType("Select");
    setDraftRuleText("");
  };

  const cancelAddRule = () => {
    setIsAddingRule(false);
    setDraftOrder("Select");
    setDraftType("Select");
    setDraftRuleText("");
  };

  const saveNewRule = () => {
    if (
      draftOrder === "Select" ||
      draftType === "Select" ||
      !draftRuleText.trim()
    ) {
      return;
    }

    const selectedOrder = Number(draftOrder);
    const next = [...rules];
    const insertIndex = Math.max(0, Math.min(next.length, selectedOrder - 1));
    next.splice(insertIndex, 0, {
      id: `rule-${Date.now()}`,
      order: insertIndex + 1,
      title: draftRuleText.trim(),
      text: draftRuleText.trim(),
      type: draftType,
      status: "Pending",
    });
    const updatedRules = resequenceRules(next);
    setRules(updatedRules);
    updateEntry(entryId, { rules: updatedRules });

    cancelAddRule();
    triggerSuccessToast();
  };

  return (
    <div className="rounded-2xl border border-border-default bg-white shadow-sm">
      {successToastMessage ? (
        <div className="fixed right-6 top-4 z-50 flex h-14 min-w-90 items-center justify-between rounded-lg bg-completed px-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span className="text-[16px] font-medium">
              {successToastMessage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToastMessage(null)}
            className="text-white/90 hover:text-white"
            aria-label="Close success toast"
          >
            <X size={18} />
          </button>
        </div>
      ) : null}

      <div className="border-b border-border-default px-6 py-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-[12px] text-gray-700 hover:text-brand cursor-pointer"
          >
            <ChevronLeft size={13} />
            Back
          </button>

          <div className="border-l border-border-default pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-brand">
                {sopCode}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  currentStatus === "Active"
                    ? "border-completed-border text-completed"
                    : "border-failed-border text-failed",
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {currentStatus}
              </span>
            </div>
            <h2 className="mt-1 text-[16px] font-medium text-[var(--bright-black)]">
              {name}
            </h2>
          </div>

          <div className="border-l border-border-default pl-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-fiord">
              Version Number
            </p>
            <p className="mt-0.5 text-[13px] font-normal text-fiord">
              {version}
            </p>
          </div>

          <div className="border-l border-border-default pl-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-fiord">
              Category
            </p>
            <p className="mt-0.5 text-[13px] font-normal text-fiord">
              {category}
            </p>
          </div>

          <div className="border-l border-border-default pl-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-fiord">
              Last Updated
            </p>
            <p className="mt-0.5 text-[13px] font-normal text-fiord">
              {lastUpdated}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={currentStatus === "Active"}
              onClick={() => {
                const nextStatus =
                  currentStatus === "Active" ? "Inactive" : "Active";
                setCurrentStatus(nextStatus);
                updateEntry(entryId, { status: nextStatus });
              }}
              className="inline-flex items-center gap-3 min-w-fit"
            >
              <span
                className={cn(
                  "text-[13px] w-12",
                  currentStatus !== "Active" ? "text-failed" : "text-gray-400",
                )}
              >
                Inactive
              </span>
              {/* track: w-11 44px · knob: w-5 20px · travel: 0 to 24px (44-20) */}
              <span
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
                  currentStatus === "Active" ? "bg-completed" : "bg-gray-300",
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 shrink-0 rounded-full bg-white shadow transition-transform duration-200",
                    currentStatus === "Active"
                      ? "translate-x-5"
                      : "translate-x-0",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[13px] w-12",
                  currentStatus === "Active"
                    ? "text-completed"
                    : "text-gray-400",
                )}
              >
                Active
              </span>
            </button>

            <Button
              type="button"
              variant="secondary"
              className="h-9 min-w-30 border-brand text-brand hover:bg-brand-light"
            >
              <Download size={14} className="mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <p className="text-[12px] font-normal text-gray-500">
          Mapped to Journal Entry
        </p>
        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 transition-all",
            isJEExpanded
              ? "border border-brand bg-white"
              : "border border-gray-200",
          )}
        >
          {selectedJEList.length === 0 ? (
            <span className="text-[12px] text-gray-400 italic">
              No Journal Entries mapped — click dropdown to select
            </span>
          ) : (
            <>
              {selectedJEList.slice(0, 4).map((entry) => (
                <span
                  key={entry.id}
                  className="inline-flex rounded-md border border-brand bg-white px-3 py-1 text-[12px] font-normal text-gray-700"
                >
                  {entry.id} - {entry.description}
                </span>
              ))}
              {selectedJEList.length > 4 ? (
                <span className="text-[12px] font-medium text-gray-700">
                  + {selectedJEList.length - 4} Others
                </span>
              ) : null}
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setIsJEExpanded((prev) => !prev);
              setJeSearch("");
            }}
            className="ml-auto inline-flex items-center justify-center text-brand hover:text-brand-hover"
            aria-label="Expand mapped journal entries"
            aria-expanded={isJEExpanded}
          >
            <ChevronDown
              size={18}
              className={cn(
                "transition-transform duration-200",
                isJEExpanded ? "rotate-180" : "",
              )}
            />
          </button>
        </div>

        {isJEExpanded ? (
          <div className="mt-2 overflow-hidden rounded-lg border border-border-default bg-white shadow-sm">
            {/* Search bar — same pattern as SOP parser */}
            <div className="border-b border-border-default px-3 py-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  value={jeSearch}
                  onChange={(event) => setJeSearch(event.target.value)}
                  placeholder="Search by SOP Name..."
                  className="h-9 pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setJeSearch("")}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors",
                    jeSearch
                      ? "hover:text-gray-600"
                      : "pointer-events-none opacity-40",
                  )}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Entry list */}
            <div className="max-h-64 overflow-y-auto scrollbar-doc">
              {filteredJEOptions.length === 0 ? (
                <p className="px-4 py-6 text-center text-[13px] text-gray-400">
                  No entries found
                </p>
              ) : (
                <div className="flex flex-col gap-2 p-3">
                  {filteredJEOptions.map((entry) => {
                    const isSelected = selectedJEs.has(entry.id);
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => toggleJE(entry.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-4 py-2 text-left transition-colors",
                          isSelected
                            ? "border-brand bg-brand-surface"
                            : "border-gray-200 bg-white hover:bg-gray-50",
                        )}
                      >
                        <span className="flex-1 text-[12px]">
                          <span className="font-semibold text-brand">
                            {entry.id}
                          </span>{" "}
                          <span className="text-gray-700">
                            {entry.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                            isSelected
                              ? "border-brand bg-brand"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          {isSelected ? (
                            <Check size={12} className="text-white" />
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="px-6">
        {/* Rule search bar */}
        <div className="mt-4 grid gap-3 md:grid-cols-6 md:items-end">
          <div className="md:col-span-5">
            <label className="mb-1 block text-[12px] font-medium text-gray-700">
              Search Rule
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={ruleSearch}
                onChange={(event) => setRuleSearch(event.target.value)}
                placeholder="Search by Rule Name or Keyword..."
                className="h-9 pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setRuleSearch("")}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors",
                  ruleSearch
                    ? "hover:text-gray-600"
                    : "pointer-events-none opacity-50",
                )}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="mb-1 block text-[12px] font-medium text-gray-700">
              Type
            </label>
            <Select
              value={ruleTypeFilter}
              onValueChange={setRuleTypeFilter}
              className="h-9 w-full"
            >
              {["All", ...ruleTypes].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {ruleSearch.trim() ? (
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-fiord">
            {filteredRuleRows.length}{" "}
            {filteredRuleRows.length === 1 ? "RESULT" : "RESULTS"} ACROSS THE
            LIBRARY
          </p>
        ) : null}

        <div className="mt-4 max-h-105 overflow-auto scrollbar-doc">
          <table className="min-w-full">
            <colgroup>
              <col className="w-20" />
              <col className="w-11" />
              <col />
              <col className="w-34" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Order
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500" />
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Rule
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRuleRows?.length > 0 ? (
                filteredRuleRows.map((rule) => {
                  const isDraggingRow = draggingId === rule.id;
                  const isEditingRow = editingRuleId === rule.id;

                  // const dragFirstStyle: React.CSSProperties = isDraggingRow
                  //   ? {
                  //       borderTop: "2px solid #0058ab",
                  //       borderBottom: "2px solid #0058ab",
                  //       borderLeft: "2px solid #0058ab",
                  //       borderTopLeftRadius: 8,
                  //       borderBottomLeftRadius: 8,
                  //       background: "#EBF3FC",
                  //     }
                  //   : {};
                  // const dragMiddleStyle: React.CSSProperties = isDraggingRow
                  //   ? {
                  //       borderTop: "2px solid #0058ab",
                  //       borderBottom: "2px solid #0058ab",
                  //       background: "#EBF3FC",
                  //     }
                  //   : {};
                  // const dragLastStyle: React.CSSProperties = isDraggingRow
                  //   ? {
                  //       borderTop: "2px solid #0058ab",
                  //       borderBottom: "2px solid #0058ab",
                  //       borderRight: "2px solid #0058ab",
                  //       borderTopRightRadius: 8,
                  //       borderBottomRightRadius: 8,
                  //       background: "#EBF3FC",
                  //     }
                  //   : {};

                  return (
                    <tr
                      key={rule.id}
                      className={cn(
                        !isDraggingRow &&
                          "border-b border-border-default h-[95px]",
                        isEditingRow && "bg-[#dce4ec]",
                        dropTarget?.id === rule.id &&
                          dropTarget.position === "before" &&
                          "border-t-3 border-t-brand",
                        dropTarget?.id === rule.id &&
                          dropTarget.position === "after" &&
                          "border-b-3 border-b-brand",
                      )}
                      onDragOver={(event) => {
                        event.preventDefault();

                        if (!draggingId || draggingId === rule.id) {
                          return;
                        }

                        const rect =
                          event.currentTarget.getBoundingClientRect();

                        const middleY = rect.top + rect.height / 2;

                        const position =
                          event.clientY < middleY ? "before" : "after";

                        setDropTarget({
                          id: rule.id,
                          position,
                        });
                      }}
                      onDragLeave={() => {
                        setDropTarget(null);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();

                        if (
                          draggingId &&
                          dropTarget &&
                          draggingId !== rule.id
                        ) {
                          moveRule(
                            draggingId,
                            dropTarget.id,
                            dropTarget.position,
                          );
                        }

                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                    >
                      {/* ORDER COLUMN - NO DRAG BORDER */}
                      <td className="w-20 px-2 py-4 align-middle text-center">
                        <span className="mx-auto inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand text-[11px] font-semibold text-brand">
                          {rule.order}
                        </span>
                      </td>

                      {/* DRAG HANDLE COLUMN */}
                      <td
                        className="w-11 px-3 py-4 align-middle text-center"
                        // style={dragFirstStyle}
                      >
                        <button
                          type="button"
                          draggable={!isEditingRow}
                          onDragStart={(event) => {
                            if (isEditingRow) return;
                            event.dataTransfer.setData("text/plain", rule.id);
                            event.dataTransfer.effectAllowed = "move";
                            // Create ghost image excluding ORDER column
                            const tr = (
                              event.currentTarget as HTMLElement
                            ).closest("tr");
                            if (tr) {
                              const ghost = document.createElement("div");
                              ghost.style.cssText =
                                "display:flex;background:#EBF3FC;align-items:center;gap:8px;padding:10px 16px;border:2px solid #0058ab;border-radius:8px;position:fixed;top:-1000px;left:-1000px;font-size:13px;color:#404040;max-width:700px;";
                              // Get text content from rule and type cells (skip order + drag dots)
                              const cells = tr.querySelectorAll("td");
                              const ruleText =
                                cells[2]?.textContent?.trim().slice(0, 80) ||
                                "";
                              const typeText =
                                cells[3]?.textContent?.trim() || "";
                              ghost.innerHTML = `<span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ruleText}...</span><span style="color:#525252;font-weight:500">${typeText}</span>`;
                              document.body.appendChild(ghost);
                              event.dataTransfer.setDragImage(ghost, 0, 20);
                              requestAnimationFrame(() =>
                                document.body.removeChild(ghost),
                              );
                            }
                            setDraggingId(rule.id);
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setDropTarget(null);
                          }}
                          disabled={isEditingRow}
                          className={cn(
                            "cursor-grab text-brand active:cursor-grabbing",
                            isEditingRow && "cursor-not-allowed opacity-40",
                          )}
                          aria-label="Drag to reorder"
                        >
                          <DragDots />
                        </button>
                      </td>

                      {/* RULE COLUMN */}
                      <td
                        className={cn(
                          "max-w-155 px-4 py-4 text-[13px] leading-6 text-gray-700",
                          isEditingRow ? "align-top" : "align-middle",
                        )}
                        // style={dragMiddleStyle}
                      >
                        {isEditingRow ? (
                          <div>
                            <label className="mb-1 block text-[12px] font-medium text-brand">
                              Rule Description
                            </label>

                            <textarea
                              value={editDraftText}
                              onChange={(event) =>
                                setEditDraftText(event.target.value)
                              }
                              className="h-22 w-full resize-none rounded-lg border border-brand bg-white px-3 py-2 text-[13px] leading-6 text-gray-700 outline-none"
                            />
                          </div>
                        ) : (
                          <HighlightText text={rule.text} query={ruleSearch} />
                        )}
                      </td>

                      {/* TYPE COLUMN */}
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-4 text-[13px] text-gray-600",
                          isEditingRow ? "align-top" : "align-middle",
                        )}
                        // style={dragMiddleStyle}
                      >
                        {isEditingRow ? (
                          <div>
                            <label className="mb-1 block text-[12px] font-medium text-brand">
                              Rule Type
                            </label>

                            <Select
                              value={editDraftType}
                              onValueChange={setEditDraftType}
                              className="h-22 min-w-27"
                            >
                              {ruleTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </Select>
                          </div>
                        ) : (
                          rule.type
                        )}
                      </td>

                      {!isEditingRow && (
                        <td
                          className={cn(
                            "whitespace-nowrap px-4 py-4 align-middle",
                          )}
                        >
                          <StatusPill status={rule.status} />
                        </td>
                      )}

                      {/* ACTIONS COLUMN - RIGHT BORDER */}
                      <td
                        className="whitespace-nowrap px-4 py-4 align-middle text-center"
                        colSpan={isEditingRow ? 2 : 1}
                        // style={dragLastStyle}
                      >
                        {isEditingRow ? (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={cancelEditRule}
                              className="text-[13px] font-medium text-brand hover:text-brand-hover"
                            >
                              Cancel
                            </button>
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 min-w-20 rounded-lg"
                              onClick={saveEditedRule}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              data-menu-trigger
                              onClick={() =>
                                setOpenMenuId((prev) =>
                                  prev === rule.id ? null : rule.id,
                                )
                              }
                              className="text-brand hover:text-brand-hover"
                              aria-label="Open rule actions"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenuId === rule.id ? (
                              <div
                                data-rule-menu
                                className="absolute right-0 top-full z-10 mt-2 flex w-30 flex-col gap-1 rounded-xl border border-border-default bg-white p-2 shadow-lg"
                              >
                                <button
                                  type="button"
                                  onClick={() => updateRuleStatus(rule.id, "Approved")}
                                  disabled={rule.status === "Approved"}
                                  className="block h-8 w-full rounded-lg border border-completed bg-completed-surface px-2 text-center text-[12px] font-medium text-completed hover:bg-completed-surface disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() => editRule(rule.id)}
                                  className="block h-8 w-full rounded-lg border border-border-default bg-gray-50 px-2 text-center text-[12px] text-gray-700 hover:bg-gray-100"
                                >
                                    Adjust
                                </button>

                                <button
                                    type="button"
                                    onClick={() => updateRuleStatus(rule.id, "Rejected")}
                                    disabled={rule.status === "Rejected"}
                                    className="block h-8 w-full rounded-lg border border-failed bg-failed-surface px-2 text-center text-[12px] text-failed hover:bg-failed-surface disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-3 text-center text-[15px] text-fiord h-[95px]"
                  >
                    No rules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-4 mt-4 bg-white px-4 py-4 shadow-[0px_-8px_14px_0px_#00000021]">
          {isAddingRule ? (
            <div>
              <div className="grid gap-4 md:grid-cols-[0.8fr_3.2fr_0.8fr_auto] md:items-end">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-gray-700">
                    Select Order
                  </label>
                  <Select
                    value={draftOrder}
                    onValueChange={setDraftOrder}
                    className="h-17 w-full"
                  >
                    <SelectItem value="Select">Select</SelectItem>
                    {Array.from({ length: rules.length + 1 }).map(
                      (_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          {index + 1}
                        </SelectItem>
                      ),
                    )}
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-gray-700">
                    Rule Description
                  </label>
                  <Input
                    value={draftRuleText}
                    onChange={(event) => setDraftRuleText(event.target.value)}
                    placeholder="Add rule description here..."
                    className="h-17"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-gray-700">
                    Rule Type
                  </label>
                  <Select
                    value={draftType}
                    onValueChange={setDraftType}
                    className="h-17 w-full"
                  >
                    <SelectItem value="Select">Select</SelectItem>
                    {ruleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-gray-700">&nbsp;</label>
                  <div className="flex items-center gap-3 h-17">
                    <button
                      type="button"
                      onClick={cancelAddRule}
                      className="text-[13px] font-medium text-brand hover:text-brand-hover"
                    >
                      Cancel
                    </button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 min-w-20 rounded-lg"
                      onClick={saveNewRule}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                className="h-9 min-w-[320px] border-brand text-brand hover:bg-brand-light"
                onClick={startAddRule}
              >
                <Plus size={14} className="mr-1" />
                Add New Rule
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOPLibraryDetailPanel;