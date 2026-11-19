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
      return <JETemplate stage={stage} onStageComplete={onStageComplete} />;
    case "upload_erp":
      return <UploadERP stage={stage} onStageComplete={onStageComplete} />;
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

  const [stages, setStages] = useState<StageData[]>(() =>
    initialStages.map((stage) => ({ ...stage })),
  );
  const [entryStatus, setEntryStatus] = useState<JEStatus>(
    entry?.status ?? "pending",
  );
  const [progress, setProgress] = useState(entry?.progress ?? 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedStageId, setExpandedStageId] = useState<number | null>(() => {
    if (usesStaticTemplate) return 4;

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
    if (id) updateEntryStatus(id, entryStatus);
  }, [id, entryStatus, updateEntryStatus]);

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
          updated[stageIndex] = stage.gitJEPostingData
            ? { ...GIT_STAGE4_APPROVED }
            : { ...STD_STAGE4_APPROVED };
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
      <JEHeader entry={{ ...entry, status: entryStatus }} />
      <div className="flex-1 overflow-y-auto px-6 pt-0 py-5 bg-[var(--dgem-gray-100)]">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[var(--dgem-light-grayish-blue)]">
          {" "}
          <p className="text-[12px] text-gray-500 mb-3">
            {isHistorical ? "Execution History" : "Execution Started"}:{" "}
            {entry.executionHistory || entry.executionStarted}
          </p>
          <div className="mb-5">
            <ProgressBar
              progress={progress}
              status={entryStatus}
              showCancel={!isHistorical}
            />
          </div>
          <div className="space-y-3">
            {stages.map((stage, idx) => {
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

              const allPriorCompleted = stages
                .slice(0, idx)
                .every((s) => s.status === "completed");

              return (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  isExpanded={expandedStageId === stage.id}
                  onToggleExpand={handleToggleExpand}
                  onStageClick={
                    allPriorCompleted ? handleStageClick : undefined
                  }
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
            status={usesStaticTemplate ? "completed" : entryStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default JournalEntryDetail;
