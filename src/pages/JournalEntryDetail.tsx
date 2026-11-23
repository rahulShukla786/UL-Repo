import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJournalEntryById,
  ENTRY_PATH_MAP,
  PATH_STAGE_RESULTS,
  STATIC_STANDARD_DETAIL_STAGES,
  STATIC_STANDARD_DETAIL_LOGS,
  STD_STAGE2_RESOLVED,
  STD_STAGE4_APPROVED,
  GIT_STAGE4_APPROVED,
  ADHOC_STAGE1_COMPLETED,
  ADHOC_STAGE2_SOP_SELECTION,
  ADHOC_STAGE2_SOP_COMPLETED,
} from "../data/mockData";
import { useJournalEntries } from "../context/JournalEntriesContext";
import {
  buildWarehouseBusinessRuleCategories,
  loadWarehouseRules,
} from "../data/ruleSets";
import { WAREHOUSE_STAGE2 } from "../data/warehouseStage2";
import { WAREHOUSE_STAGE3 } from "../data/warehouseStage3";
import { WAREHOUSE_STAGE4, WAREHOUSE_STAGE_COUNT } from "../data/warehouseStage4";
import { JEHeader } from "../components/journal-entry/JEHeader";
import { ProgressBar } from "../components/shared/ProgressBar";
import { StageCard } from "../components/shared/StageCard";
import { stageHasContent } from "../lib/stageHasContent";
import { AIProcessingLog } from "../components/shared/AIProcessingLog";
import { ProcessingOverlay } from "../components/shared/ProcessingOverlay";
import { IdentifyingIntent } from "../components/journal-entry/stages/IdentifyingIntent";
import { SOPClassification } from "../components/journal-entry/stages/SOPClassification";
import { BusinessRules } from "../components/journal-entry/stages/BusinessRules";
import { DataExtraction } from "../components/journal-entry/stages/DataExtraction";
import { DataValidation } from "../components/journal-entry/stages/DataValidation";
import { JETemplate } from "../components/journal-entry/stages/JETemplate";
import { UploadERP } from "../components/journal-entry/stages/UploadERP";
import { EmailDetails } from "../components/journal-entry/stages/EmailDetails";
import { DocumentPreview } from "../components/journal-entry/DocumentPreview";
import { StageGroupView } from "../components/journal-entry/StageGroupModal";
import type { StageData, JEStatus } from "../types";

interface StageContentProps {
  stage: StageData;
  onExceptionResolve?: (fileName?: string) => void;
  onStageComplete?: () => void;
  onSOPSelect?: (sopId: string) => void;
}

const StageContent: React.FC<StageContentProps> = ({
  stage,
  onExceptionResolve,
  onStageComplete,
  onSOPSelect,
}) => {
  switch (stage.componentType) {
    case "identifying_intent":
      return (
        <IdentifyingIntent
          stage={stage}
          onExceptionResolve={onExceptionResolve}
        />
      );
    case "sop_classification":
      return <SOPClassification stage={stage} onSOPSelect={onSOPSelect} />;
    case "business_rules":
      return <BusinessRules stage={stage} />;
    case "data_extraction":
      return (
        <DataExtraction stage={stage} onExceptionResolve={onExceptionResolve} />
      );
    case "data_validation":
      return <DataValidation stage={stage} />;
    case "je_template":
      return (
        <>
          {/* Optional file previews (e.g. final_blackline.xlsx) with Download button */}
          {stage.outputPreviewTables?.map((table) => (
            <div key={table.fileName} className="w-full mb-4">
              <DocumentPreview
                title="OUTPUT PREVIEW"
                fileName={table.fileName}
                sourcePreviewTable={table}
              />
            </div>
          ))}
          {/* When file previews are provided, show only them (no JE table / approval workflow) */}
          {!stage.outputPreviewTables?.length && (
            <JETemplate stage={stage} onStageComplete={onStageComplete} />
          )}
        </>
      );
    case "upload_erp":
      return <UploadERP stage={stage} onStageComplete={onStageComplete} />;
    case "email_details":
      return <EmailDetails stage={stage} />;
    default:
      return null;
  }
};

export const JournalEntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, updateEntryStatus } = useJournalEntries();
  const uploadedEntry = entries.find((item) => item.id === id);
  const entry = uploadedEntry ?? (id ? getJournalEntryById(id) : undefined);
  const usesStaticTemplate = !!uploadedEntry && !ENTRY_PATH_MAP[uploadedEntry.id];
  const initialStages =
    usesStaticTemplate
      ? STATIC_STANDARD_DETAIL_STAGES
      : (entry?.stages ?? []);

  // Warehouse SOP: Stage 1 shows the Warehouse rules (warehouseDocs/WH_rule_111.xlsx);
  // Stage 2 shows the UHPC Week41-43 inputs + C600_005 Plant.xlsx output (warehouseDocs/Data);
  // Stage 3 shows SAP.xlsx input + Snapshot New.xlsx output, with snapshot.xlsx /
  // FC Update.xlsx as Reference Files;
  // Stage 4 "JE Template Generation" shows Trintech.xlsx input + SIRIUS_UL Calc & Post_1.xlsx output.
  // Warehouse uses these 4 stages, Logistics 8; in both, the data-processing stages are
  // grouped into one expandable "Stage 2" so the page shows Stage 1 / 2 / 3.
  const isWarehouseEntry = usesStaticTemplate && uploadedEntry?.lob === "Warehouse";
  // Stage 1 subtitle describes what Stage 1 shows for the LOB (static flow only)
  const stage1Subtitle = isWarehouseEntry
    ? "Read the Warehouse SOP rules and the required source and reference files"
    : "Read the Logistics SOP business rules used in the accrual process";
  const [stages, setStages] = useState<StageData[]>(() =>
    initialStages
      .filter((stage) => !isWarehouseEntry || stage.id <= WAREHOUSE_STAGE_COUNT)
      .map((stage) => {
        if (usesStaticTemplate && stage.id === 1) {
          const base = isWarehouseEntry ? { ...stage, businessRuleCategories: [] } : { ...stage };
          return { ...base, purpose: stage1Subtitle };
        }
        if (isWarehouseEntry && stage.id === 2) return { ...stage, ...WAREHOUSE_STAGE2 };
        if (isWarehouseEntry && stage.id === 3) return { ...stage, ...WAREHOUSE_STAGE3 };
        if (isWarehouseEntry && stage.id === 4) return { ...stage, ...WAREHOUSE_STAGE4 };
        return { ...stage };
      })
      .reduce<StageData[]>((acc, stage) => {
        // Static flow: data-processing stages are grouped into one "Stage 2"
        // (Logistics: original Stages 2–7; Warehouse: Stages 2–3); JE Template becomes Stage 3.
        if (!usesStaticTemplate) return [...acc, stage];
        const lastGroupedId = isWarehouseEntry ? 3 : 7;
        const jeTemplateId = isWarehouseEntry ? WAREHOUSE_STAGE_COUNT : 8;
        if (stage.id >= 2 && stage.id <= lastGroupedId) {
          const group = acc.find((s) => s.id === 2 && s.subStages);
          if (group) {
            group.subStages = [...(group.subStages ?? []), stage];
            return acc;
          }
          return [
            ...acc,
            {
              id: 2,
              title: "Stage 2: Data Processing",
              purpose: "Data Processing using calculation and validation rules",
              status: stage.status,
              componentType: "data_extraction",
              subStages: [stage],
            },
          ];
        }
        if (stage.id === jeTemplateId) {
          return [...acc, { ...stage, id: 3, title: "Stage 3: JE Template Generation" }];
        }
        return [...acc, stage];
      }, []),
  );

  useEffect(() => {
    if (!isWarehouseEntry) return;
    let cancelled = false;
    loadWarehouseRules()
      .then((rules) => {
        if (cancelled) return;
        const categories = buildWarehouseBusinessRuleCategories(rules);
        setStages((prev) =>
          prev.map((stage) =>
            stage.id === 1 ? { ...stage, businessRuleCategories: categories } : stage,
          ),
        );
      })
      .catch((err) => console.error("Failed to load warehouse rules", err));
    return () => {
      cancelled = true;
    };
  }, [isWarehouseEntry]);
  // Static (uploaded SOP) flow always stays Pending
  const [entryStatus, setEntryStatus] = useState<JEStatus>(
    usesStaticTemplate ? "pending" : (entry?.status ?? "pending"),
  );
  // Static step-through flow: progress starts at 20% and each clicked stage turns green
  const STATIC_BASE_PROGRESS = 20;
  // Entry already finished in this session (list shows Completed) -> reopen with all stages done
  const staticAlreadyCompleted = usesStaticTemplate && uploadedEntry?.status === "completed";
  const [staticDoneCount, setStaticDoneCount] = useState(
    staticAlreadyCompleted ? stages.length : 0,
  );
  const [progress, setProgress] = useState(
    staticAlreadyCompleted
      ? 100
      : usesStaticTemplate
        ? STATIC_BASE_PROGRESS
        : (entry?.progress ?? 0),
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedStageId, setExpandedStageId] = useState<number | null>(() => {
    if (usesStaticTemplate) return null; // stages open as the user clicks through them

    const stageToExpand = stages.find(
      (stage) =>
        stage.exceptionType ||
        stage.status === "failed" ||
        (stage.status === "in_progress" && stageHasContent(stage)),
    ) ?? stages.find(
      (stage) => stage.status === "completed" && stageHasContent(stage),
    );
    return stageToExpand?.id ?? null;
  });

  const path = id ? ENTRY_PATH_MAP[id] : undefined;
  const isAdhoc = path?.startsWith("adhoc") ?? false;

  useEffect(() => {
    // Static flow: list status is driven by staticAllDone (below), not by entryStatus
    if (id && !usesStaticTemplate) updateEntryStatus(id, entryStatus);
  }, [id, entryStatus, updateEntryStatus, usesStaticTemplate]);

  const handleToggleExpand = useCallback((stageId: number) => {
    setExpandedStageId((prev) => (prev === stageId ? null : stageId));
  }, []);

  const handleStageClick = useCallback(
    (stageId: number) => {
      if (!path) return;
      const stageResults = PATH_STAGE_RESULTS[path];

      setStages((prev) => {
        const stageIndex = prev.findIndex((s) => s.id === stageId);
        if (stageIndex === -1) return prev;
        const resultStage = stageResults[stageIndex];
        if (!resultStage) return prev;

        const updated = [...prev];
        updated[stageIndex] = { ...resultStage };

        if (resultStage.status === "completed") {
          for (let i = stageIndex + 1; i < updated.length; i++) {
            if (updated[i].status === "pending") {
              updated[i] = { ...updated[i], status: "in_progress" };
              break;
            }
          }
        }

        const completedCount = updated.filter(
          (s) => s.status === "completed",
        ).length;
        setProgress(Math.round((completedCount / updated.length) * 100));

        if (resultStage.status === "failed") setEntryStatus("failed");
        else if (resultStage.exceptionType) setEntryStatus("action_required");
        else if (completedCount === updated.length) setEntryStatus("completed");
        else setEntryStatus(entry?.status ?? "pending");

        return updated;
      });

      // Auto-expand — include stdJEPostingData / adHocJEPostingData so Stage 4/6 opens on click
      const stageIndex = stages.findIndex((s) => s.id === stageId);
      const resultStageData = stageResults[stageIndex];
      if (
        resultStageData &&
        (resultStageData.status === "completed" ||
          resultStageData.status === "failed" ||
          resultStageData.exceptionType ||
          resultStageData.journalLines ||
          resultStageData.stdJEPostingData ||
          resultStageData.adHocJEPostingData ||
          resultStageData.gitJEPostingData ||
          resultStageData.gitJETemplateData ||
          resultStageData.uploadBatchId ||
          resultStageData.intentDetails)
      ) {
        setExpandedStageId(stageId);
      }
    },
    [path, stages, entry],
  );

  const handleStageInteractionComplete = useCallback(
    (stageIndex: number) => {
      setStages((prev) => {
        const updated = [...prev];
        const stage = updated[stageIndex];

        if (stage.componentType === "je_template") {
          // Keep current id/title so renumbered flows (e.g. Stage 5) stay correct
          updated[stageIndex] = stage.gitJEPostingData
            ? { ...GIT_STAGE4_APPROVED, id: stage.id, title: stage.title, outputPreviewTables: stage.outputPreviewTables }
            : { ...STD_STAGE4_APPROVED, id: stage.id, title: stage.title, outputPreviewTables: stage.outputPreviewTables };
        } else {
          updated[stageIndex] = { ...stage, status: "completed" };
        }

        for (let i = stageIndex + 1; i < updated.length; i++) {
          if (updated[i].status === "pending") {
            updated[i] = { ...updated[i], status: "in_progress" };
            break;
          }
        }

        const completedCount = updated.filter(
          (s) => s.status === "completed",
        ).length;
        setProgress(Math.round((completedCount / updated.length) * 100));
        setEntryStatus(
          completedCount === updated.length
            ? "completed"
            : (entry?.status ?? "pending"),
        );
        return updated;
      });
    },
    [isAdhoc, entry],
  );

  const handleExceptionResolve = useCallback(
    (stageIndex: number, _fileName?: string) => {
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        setStages((prev) => {
          const updated = [...prev];
          const stage = prev[stageIndex];

          if (stage.componentType === "identifying_intent") {
            updated[stageIndex] = { ...ADHOC_STAGE1_COMPLETED };
            updated[stageIndex + 1] = { ...ADHOC_STAGE2_SOP_SELECTION };
          } else if (stage.componentType === "data_extraction") {
            updated[stageIndex] = {
              ...STD_STAGE2_RESOLVED,
              id: stage.id,
              title: stage.title,
            };
            for (let i = stageIndex + 1; i < updated.length; i++) {
              if (updated[i].status === "pending") {
                updated[i] = { ...updated[i], status: "in_progress" };
                break;
              }
            }
          }

          const completedCount = updated.filter(
            (s) => s.status === "completed",
          ).length;
          setProgress(Math.round((completedCount / updated.length) * 100));
          const hasException = updated.some((s) => s.exceptionType);
          setEntryStatus(
            hasException ? "action_required" : (entry?.status ?? "pending"),
          );
          return updated;
        });
      }, 2500);
    },
    [entry],
  );

  const handleSOPSelect = useCallback(
    (stageIndex: number, sopId: string) => {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStages((prev) => {
          const updated = [...prev];
          const selectedSOP = ADHOC_STAGE2_SOP_SELECTION.sopOptions?.find(
            (s) => s.id === sopId,
          );
          updated[stageIndex] = {
            ...ADHOC_STAGE2_SOP_COMPLETED,
            sopName: selectedSOP?.name || ADHOC_STAGE2_SOP_COMPLETED.sopName,
            sopConfidenceScore:
              selectedSOP?.confidenceScore ||
              ADHOC_STAGE2_SOP_COMPLETED.sopConfidenceScore,
          };
          for (let i = stageIndex + 1; i < updated.length; i++) {
            if (updated[i].status === "pending") {
              updated[i] = { ...updated[i], status: "in_progress" };
              break;
            }
          }
          const completedCount = updated.filter(
            (s) => s.status === "completed",
          ).length;
          setProgress(Math.round((completedCount / updated.length) * 100));
          setEntryStatus(entry?.status ?? "pending");
          return updated;
        });
        setExpandedStageId(2);
      }, 2000);
    },
    [entry],
  );

  // Static flow: clicking the next stage marks it completed (green) and advances progress
  const handleStaticStageClick = useCallback(
    (stageId: number) => {
      const idx = stages.findIndex((s) => s.id === stageId);
      if (idx === -1 || idx !== staticDoneCount) return;
      const done = idx + 1;
      setStaticDoneCount(done);
      setProgress(
        Math.round(
          STATIC_BASE_PROGRESS +
            (done / stages.length) * (100 - STATIC_BASE_PROGRESS),
        ),
      );
      setExpandedStageId(stageId);
    },
    [stages, staticDoneCount],
  );

  const displayStages: StageData[] = usesStaticTemplate
    ? stages.map((s, i) => ({
        ...s,
        status:
          i < staticDoneCount
            ? "completed"
            : i === staticDoneCount
              ? "in_progress"
              : "pending",
      }))
    : stages;
  const staticAllDone =
    usesStaticTemplate && staticDoneCount === stages.length;

  // Static flow finished -> mark this journal ID Completed in the Journal Entry list too.
  // (On a browser refresh the context resets uploaded SOP entries back to Pending.)
  useEffect(() => {
    if (staticAllDone && uploadedEntry && uploadedEntry.status !== "completed") {
      updateEntryStatus(uploadedEntry.id, "completed");
    }
  }, [staticAllDone, uploadedEntry, updateEntryStatus]);

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[16px] font-semibold text-gray-700">
            Journal Entry not found
          </p>
          <button
            onClick={() => navigate("/journal-entry")}
            className="mt-3 text-brand text-[13px] hover:underline"
          >
            Back to Journal Entries
          </button>
        </div>
      </div>
    );
  }

  const isHistorical = entryStatus === "completed" || entryStatus === "failed";

  return (
    <div className="flex flex-col h-full relative">
      {isProcessing && <ProcessingOverlay />}
      {/* Static flow: once the last stage is clicked, the header badge turns Pending -> Completed */}
      <JEHeader entry={{ ...entry, status: staticAllDone ? "completed" : entryStatus }} />
      <div className="flex-1 overflow-y-auto px-6 pt-0 py-5 bg-[var(--dgem-gray-100)]">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[var(--dgem-light-grayish-blue)]">
          {" "}
          <p className="text-[12px] text-gray-500 mb-3">
            {isHistorical ? "Execution History" : "Execution Started"}:{" "}
            {entry.executionHistory || entry.executionStarted}
          </p>
          <div className="mb-5">
            {/* Static flow: after the last stage is clicked the bar is green and shows "Completed" */}
            <ProgressBar
              progress={progress}
              status={staticAllDone ? "completed" : entryStatus}
              showCancel={!isHistorical}
            />
          </div>
          <div className="space-y-3">
            {displayStages.map((stage, idx) => {
              // hasIntermediateData covers standard stdJEPostingData, ad-hoc adHocJEPostingData,
              // journalLines fallback, and uploadBatchId — so Stage 4/6 content shows correctly
              const hasIntermediateData = stageHasContent(stage);
              const hasContent =
                stage.status === "completed" ||
                stage.status === "failed" ||
                (stage.status === "in_progress" &&
                  (!!stage.exceptionType || hasIntermediateData));
              const showContent =
                stage.componentType === "identifying_intent"
                  ? hasContent && !!(stage.intentDetails || stage.exceptionType)
                  : hasContent;

              const allPriorCompleted = displayStages
                .slice(0, idx)
                .every((s) => s.status === "completed");
              const isNextStaticStage =
                usesStaticTemplate && idx === staticDoneCount;

              // Grouped stage (Logistics Stage 2): clicking expands the pipeline view inline
              if (stage.subStages?.length) {
                return (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    isExpanded={expandedStageId === stage.id}
                    onToggleExpand={handleToggleExpand}
                    onStageClick={isNextStaticStage ? handleStaticStageClick : undefined}
                    forceClickable={isNextStaticStage}
                  >
                    {stage.status === "completed" ? (
                      <StageGroupView subStages={stage.subStages} />
                    ) : null}
                  </StageCard>
                );
              }

              return (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  isExpanded={expandedStageId === stage.id}
                  onToggleExpand={handleToggleExpand}
                  onStageClick={
                    usesStaticTemplate
                      ? isNextStaticStage
                        ? handleStaticStageClick
                        : undefined
                      : allPriorCompleted
                        ? handleStageClick
                        : undefined
                  }
                  forceClickable={isNextStaticStage}
                >
                  {showContent ? (
                    <StageContent
                      stage={stage}
                      onExceptionResolve={
                        (stage.componentType === "identifying_intent" ||
                          stage.componentType === "data_extraction") &&
                        stage.exceptionType
                          ? (fileName) => handleExceptionResolve(idx, fileName)
                          : undefined
                      }
                      onStageComplete={() =>
                        handleStageInteractionComplete(idx)
                      }
                      onSOPSelect={
                        stage.componentType === "sop_classification" &&
                        stage.exceptionType === "sop_selection"
                          ? (sopId) => handleSOPSelect(idx, sopId)
                          : undefined
                      }
                    />
                  ) : null}
                </StageCard>
              );
            })}
          </div>
          <AIProcessingLog
            logs={
              usesStaticTemplate
                ? STATIC_STANDARD_DETAIL_LOGS
                : entry.aiProcessingLog
            }
            status={
              usesStaticTemplate
                ? staticAllDone
                  ? "completed"
                  : "pending"
                : entryStatus
            }
          />
        </div>
      </div>
    </div>
  );
};

export default JournalEntryDetail;
