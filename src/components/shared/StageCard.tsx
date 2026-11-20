import React from "react";
import { ChevronDown, ChevronUp, Check, XCircle } from "lucide-react";
import type { StageData } from "../../types";
import { cn } from "../../lib/utils";
import { stageHasContent } from "../../lib/stageHasContent";

interface StageCardProps {
  stage: StageData;
  isExpanded: boolean;
  onToggleExpand: (stageId: number) => void;
  children?: React.ReactNode;
  onStageClick?: (stageId: number) => void;
  /** Force the header to act as a "click to process" trigger (static step-through flow) */
  forceClickable?: boolean;
}

const STAGE_STYLES: Record<
  string,
  { border: string; iconBg: string; titleColor: string }
> = {
  completed: {
    border: "border-completed-border",
    iconBg: "bg-completed",
    titleColor: "text-completed",
  },
  in_progress: {
    border: "border-brand",
    iconBg: "bg-brand",
    titleColor: "text-brand",
  },
  failed: {
    border: "border-failed-border",
    iconBg: "bg-failed",
    titleColor: "text-failed",
  },
  pending: {
    border: "border-gray-200",
    iconBg: "bg-gray-200",
    titleColor: "text-gray-400",
  },
};

const StageIcon: React.FC<{ stage: StageData }> = ({ stage }) => {
  const styles = STAGE_STYLES[stage.status];

  if (stage.status === "completed") {
    return (
      <span
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
          styles.iconBg,
        )}
      >
        <Check size={13} color="white" strokeWidth={3} />
      </span>
    );
  }
  if (stage.status === "failed") {
    return (
      <XCircle size={20} className="text-failed flex-shrink-0" />
    );
  }
  if (stage.status === "in_progress") {
    return (
      <span
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
          styles.iconBg,
        )}
      >
        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
      </span>
    );
  }
  // Pending: show stage number
  return (
    <span
      className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold",
        styles.iconBg,
        "text-gray-400",
      )}
    >
      {stage.id}
    </span>
  );
};

export const StageCard: React.FC<StageCardProps> = ({
  stage,
  isExpanded,
  onToggleExpand,
  children,
  onStageClick,
  forceClickable = false,
}) => {
  const styles = STAGE_STYLES[stage.status];

  // Stage has intermediate content (data loaded but awaiting user interaction)
  const hasIntermediateData = stageHasContent(stage);

  // Clickable to trigger processing if in_progress, no exception, and no data yet
  const isClickableToProcess =
    !!onStageClick &&
    (forceClickable ||
      (stage.status === "in_progress" &&
        !stage.exceptionType &&
        !hasIntermediateData));

  // Can expand/collapse
  const hasExpandableContent =
    !forceClickable &&
    (stage.status === "completed" ||
    stage.status === "failed" ||
    (stage.status === "in_progress" &&
      (!!stage.exceptionType || hasIntermediateData)));

  const handleHeaderClick = () => {
    if (isClickableToProcess && onStageClick) {
      onStageClick(stage.id);
    } else if (hasExpandableContent) {
      onToggleExpand(stage.id);
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg bg-white overflow-hidden transition-all duration-300",
        styles.border,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3.5 h-[57px]",
          (isClickableToProcess || hasExpandableContent) &&
            "cursor-pointer hover:bg-gray-50 transition-colors",
        )}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3">
          <StageIcon stage={stage} />
          <div>
            <p className={cn("font-semibold text-[14px]", styles.titleColor)}>
              {stage.title}
            </p>
            <p className="text-[12px] text-gray-500">{stage.purpose}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasExpandableContent && (
            <button className="text-gray-500 p-1 flex-shrink-0">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>
      {isExpanded && children && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default StageCard;
