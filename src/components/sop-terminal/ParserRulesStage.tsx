import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Search,
  MoreHorizontal,
  Plus,
  ArrowUp,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { Select, SelectItem } from "../shared/Select";
import { cn } from "../../lib/utils";
import type { UploadedFile } from "./ParserUploadStage";
import {
  LOGISTICS_RULES,
  getRulesForLob,
  type LobRule,
  type SOPLob,
} from "../../data/ruleSets";
import type { SOPRule } from "../../stores/sopStore";

type RuleItem = SOPRule;

type DropPosition = "before" | "after";

interface DropTarget {
  id: string;
  position: DropPosition;
}

const resequenceRules = (items: RuleItem[]): RuleItem[] => {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
};

const DragDots: React.FC = () => {
  return (
    <span className="inline-grid grid-cols-2 gap-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <span key={index} className="h-1.5 w-1.5 rounded-full bg-brand" />
      ))}
    </span>
  );
};

interface ParserRulesStageProps {
  uploadedFile: UploadedFile;
  lob: SOPLob;
  onSaveToLibrary?: (fileName: string, rules: SOPRule[], lob: SOPLob) => void;
}

// Enabled rules of the LOB rule set, mapped to the parser row shape
const toRuleItems = (lobRules: LobRule[]): RuleItem[] =>
  lobRules
    .filter((rule) => rule.enabled)
    .map((rule) => ({
      id: rule.rule_id,
      order: rule.order_of_execution,
      title: rule.title,
      text: rule.description,
      type: rule.rule_type,
      status: "Pending" as const,
    }));

const getStepItems = (lob: SOPLob) => {
  const label = lob === "Warehouse" ? "Warehouse" : "Pallet";
  return [
    { title: "SOP Received", subtitle: "Uploaded document ready" },
    { title: `Loading ${label} Rules`, subtitle: "Preparing enabled rules for review" },
    { title: `${label} Rules Loaded`, subtitle: "Rules ordered by execution sequence" },
    { title: "Ready for Review", subtitle: "Review and update rule statuses" },
  ];
};

const StatusPill: React.FC<{ status: RuleItem["status"] }> = ({ status }) => {
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

const StepProgress: React.FC<{ lob: SOPLob }> = ({ lob }) => {
  return (
    <div className="mt-4 border-y border-border-default py-4">
      <div className="relative">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-completed" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {getStepItems(lob).map((step) => (
            <div key={step.title} className="relative text-center">
              <span className="relative z-10 mx-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-completed text-white">
                <Check size={14} />
              </span>
              <p className="mt-3 text-[13px] font-semibold text-[var(--deep-blue)]">
                {step.title}
              </p>
              <p className="mt-1 text-[12px] text-fiord">{step.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ParserRulesStage: React.FC<ParserRulesStageProps> = ({
  uploadedFile,
  lob,
  onSaveToLibrary,
}) => {
  // Logistics rules are bundled; Warehouse rules are read from warehouseDocs/WH_rule_111.xlsx
  const [rules, setRules] = useState<RuleItem[]>(() =>
    lob === "Logistics" ? toRuleItems(LOGISTICS_RULES) : [],
  );
  const [rulesLoading, setRulesLoading] = useState(lob !== "Logistics");
  const [rulesError, setRulesError] = useState<string | null>(null);

  useEffect(() => {
    if (lob === "Logistics") return;
    let cancelled = false;
    setRulesLoading(true);
    setRulesError(null);
    getRulesForLob(lob)
      .then((lobRules) => {
        if (!cancelled) setRules(toRuleItems(lobRules));
      })
      .catch((err: unknown) => {
        if (!cancelled) setRulesError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setRulesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lob]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [successToastMessage, setSuccessToastMessage] = useState<string | null>(null);
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

  const ruleTypes = useMemo(() => {
    return ["All", ...Array.from(new Set(rules.map((rule) => rule.type)))];
  }, [rules]);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        rule.title.toLowerCase().includes(search.toLowerCase()) ||
        rule.text.toLowerCase().includes(search.toLowerCase()) ||
        `rule ${rule.order}`.includes(search.toLowerCase());
      const matchesType = selectedType === "All" || rule.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [rules, search, selectedType]);

  const updateRuleStatus = (id: string, status: RuleItem["status"]) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? { ...rule, status }
          : rule,
      ),
    );
    setOpenMenuId(null);
    triggerSuccessToast(`Rule ${status.toLowerCase()} successfully`);
  };

  const editRule = (id: string) => {
    const current = rules.find((rule) => rule.id === id);
    if (!current) return;

    setEditingRuleId(id);
    setEditDraftText(current.text);
    setEditDraftType(current.type);
    setOpenMenuId(null);
    triggerSuccessToast();
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

    setRules((prev) =>
      prev.map((rule) =>
        rule.id === editingRuleId
          ? {
              ...rule,
              text: editDraftText.trim(),
              type: editDraftType,
            }
          : rule,
      ),
    );

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

  const triggerSuccessToast = (message = "Changes saved successfully") => {
    setSuccessToastMessage(message);
    setTimeout(() => setSuccessToastMessage(null), 2200);
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
    setRules((prev) => {
      const next = [...prev];
      const insertIndex = Math.max(0, Math.min(next.length, selectedOrder - 1));
      next.splice(insertIndex, 0, {
        id: `rule-${Date.now()}`,
        order: insertIndex + 1,
        title: draftRuleText.trim(),
        text: draftRuleText.trim(),
        type: draftType,
        status: "Pending",
      });
      return resequenceRules(next);
    });

    cancelAddRule();
    triggerSuccessToast();
  };

  const moveRule = (fromId: string, toId: string, position: DropPosition) => {
    if (fromId === toId) return;
    setRules((prev) => {
      const fromIndex = prev.findIndex((rule) => rule.id === fromId);
      if (fromIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);

      const toIndexAfterRemoval = next.findIndex((rule) => rule.id === toId);
      if (toIndexAfterRemoval === -1) return prev;

      const insertIndex =
        position === "after" ? toIndexAfterRemoval + 1 : toIndexAfterRemoval;

      next.splice(insertIndex, 0, moved);
      return resequenceRules(next);
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-semibold text-[var(--deep-blue)]">
            Business Rules (
            {rulesLoading
              ? "loading…"
              : `${rules.length} enabled ${lob === "Warehouse" ? "warehouse" : "pallet"} rules`}
            )
          </h3>
          <p className="mt-1 text-[13px] text-[var(--bright-black)]">
            Input: {uploadedFile.name} · SOP Type: {lob}
          </p>
          {rulesError ? (
            <p className="mt-1 text-[12px] text-failed">{rulesError}</p>
          ) : null}
        </div>
        <Button
          type="button"
          className="h-9 min-w-61 rounded-lg bg-brand px-5 text-[13px] font-medium text-white hover:bg-brand-hover disabled:opacity-45"
          disabled={rulesLoading || rules.length === 0}
          onClick={() => {
            triggerSuccessToast();
            if (onSaveToLibrary) {
              setTimeout(() => {
                onSaveToLibrary(uploadedFile.name, rules, lob);
              }, 1200);
            }
          }}
        >
          <ArrowUp size={14} className="mr-1" />
          Save to SOP Library
        </Button>
      </div>

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

      <StepProgress lob={lob} />

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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Rule Name or Keyword..."
              className="h-9 pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setSearch("")}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors",
                search
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
            value={selectedType}
            onValueChange={setSelectedType}
            className="h-9 w-full"
          >
            {ruleTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {search.trim() ? (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-fiord">
          {filteredRules.length}{" "}
          {filteredRules.length === 1 ? "RESULT" : "RESULTS"} ACROSS THE LIBRARY
        </p>
      ) : null}

      <div className="mt-4 max-h-105 overflow-auto scrollbar-doc">
        <table className="min-w-full">
          <colgroup>
            <col className="w-20" />
            <col className="w-11" />
            <col />
            <col className="w-32" />
            <col className="w-36" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Order
              </th>
              <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500"></th>
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
            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => {
                const isDraggingRow = draggingId === rule.id;
                const isEditingRow = editingRuleId === rule.id;
                // const dragFirstStyle: React.CSSProperties = isDraggingRow
                //   ? { borderTop: "2px solid #0058ab", borderBottom: "2px solid #0058ab", borderLeft: "2px solid #0058ab", borderTopLeftRadius: 8, borderBottomLeftRadius: 8, background: "#EBF3FC" }
                //   : {};
                // const dragMiddleStyle: React.CSSProperties = isDraggingRow
                //   ? { borderTop: "2px solid #0058ab", borderBottom: "2px solid #0058ab", background: "#EBF3FC" }
                //   : {};
                // const Style: React.CSSProperties = isDraggingRow
                //   ? { borderTop: "2px solid #0058ab", borderBottom: "2px solid #0058ab", background: "#EBF3FC" }
                //   : {};
                // const dragLastStyle: React.CSSProperties = isDraggingRow
                //   ? { borderTop: "2px solid #0058ab", borderBottom: "2px solid #0058ab", borderRight: "2px solid #0058ab", borderTopRightRadius: 8, borderBottomRightRadius: 8, background: "#EBF3FC" }
                //   : {};

                return (
                  <tr
                    key={rule.id}
                    className={cn(
                      !isDraggingRow &&
                        "border-b border-border-default h-[95px]",
                      isEditingRow ? "bg-[#dce4ec]" : "",

                      dropTarget?.id === rule.id &&
                        dropTarget.position === "before"
                        ? "border-t-3 border-t-brand"
                        : "",
                      dropTarget?.id === rule.id &&
                        dropTarget.position === "after"
                        ? "border-b-3 border-b-brand"
                        : "",
                    )}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (!draggingId || isEditingRow) return;

                      const bounds =
                        event.currentTarget.getBoundingClientRect();
                      const position: DropPosition =
                        event.clientY < bounds.top + bounds.height / 2
                          ? "before"
                          : "after";

                      setDropTarget({ id: rule.id, position });
                    }}
                    onDragLeave={() => {
                      setDropTarget(null);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggingId && dropTarget && draggingId !== rule.id) {
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
                    <td
                      className={cn("w-20 px-2 py-4 align-middle text-center")}
                    >
                      <span className="mx-auto inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand text-[11px] font-semibold text-brand">
                        {rule.order}
                      </span>
                    </td>
                    <td
                      className={cn("w-11 px-3 py-4 align-middle text-center")}
                    >
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          if (isEditingRow) return;
                          event.dataTransfer.setData("text/plain", rule.id);
                          event.dataTransfer.effectAllowed = "move";
                          const tr = (
                            event.currentTarget as HTMLElement
                          ).closest("tr");
                          if (tr) {
                            const ghost = document.createElement("div");
                            ghost.style.cssText =
                              "display:flex;align-items:center;gap:8px;padding:10px 16px;border:2px solid #0058ab;border-radius:8px;background:#EBF3FC;position:fixed;top:-1000px;left:-1000px;font-size:13px;color:#404040;max-width:700px;";
                            const cells = tr.querySelectorAll("td");
                            const ruleText =
                              cells[2]?.textContent?.trim().slice(0, 80) || "";
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
                          isEditingRow ? "cursor-not-allowed opacity-60" : "",
                        )}
                        aria-label="Drag to reorder"
                      >
                        <DragDots />
                      </button>
                    </td>
                    <td
                      className={cn(
                        "max-w-155 px-4 py-4 align-middle text-[13px] leading-6 text-[var(--bright-black)]",
                      )}
                    >
                      {isEditingRow ? (
                        <div>
                          <label className="mb-1 block text-[12px] font-medium text-[var(--bright-black)]">
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
                        <div className="space-y-1">
                          <p className="font-semibold">
                            <HighlightText text={rule.title} query={search} />
                          </p>
                          <p className="whitespace-pre-line text-[12px] text-fiord">
                            <HighlightText text={rule.text} query={search} />
                          </p>
                        </div>
                      )}
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-4 py-4 align-middle text-[13px] text-fiord",
                      )}
                    >
                      {isEditingRow ? (
                        <div>
                          <label className="mb-1 block text-[12px] font-medium text-gray-700">
                            Rule Type
                          </label>
                          <Select
                            value={editDraftType}
                            onValueChange={setEditDraftType}
                            className="h-22 min-w-27"
                          >
                            {ruleTypes
                              .filter((type) => type !== "All")
                              .map((type) => (
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
                        className={cn("whitespace-nowrap px-4 py-4 align-middle")}
                      >
                        <StatusPill status={rule.status} />
                      </td>
                    )}
                    <td
                      className={cn(
                        "whitespace-nowrap px-4 py-4 align-middle text-center",
                      )}
                      colSpan={isEditingRow ? 2 : 1}
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
                                className="block h-8 w-full rounded-lg border border-completed bg-completed-surface px-2 text-center text-[12px] font-medium text-completed hover:bg-completed-surface"
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
                                className="block h-8 w-full rounded-lg border border-failed bg-failed-surface px-2 text-center text-[12px] text-failed hover:bg-failed-surface"
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
                  {Array.from({ length: rules.length + 1 }).map((_, index) => (
                    <SelectItem key={index + 1} value={String(index + 1)}>
                      {index + 1}
                    </SelectItem>
                  ))}
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
                  {ruleTypes
                    .filter((type) => type !== "All")
                    .map((type) => (
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
  );
};

export default ParserRulesStage;