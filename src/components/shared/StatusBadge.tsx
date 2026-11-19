import React from "react";
import type { JEStatus } from "../../types";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: JEStatus;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_CONFIG: Record<
  JEStatus,
  { label: string; dot: string; badge: string }
> = {
  completed: {
    label: "Completed",
    dot: "bg-white",
    badge: "bg-completed text-white",
  },
  action_required: {
    label: "Action Required",
    dot: "bg-white",
    badge: "bg-warning text-white",
  },
  failed: {
    label: "Failed",
    dot: "bg-white",
    badge: "bg-failed text-white",
  },
  pending: {
    label: "Pending",
    dot: "bg-fiord",
    badge: "bg-white text-fiord border border-fiord-300",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  className,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full h-[24px] font-medium",
        size === "md" ? "px-3 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]",
        config.badge,
        className,
      )}
    >
      <span
        className={cn("rounded-full flex-shrink-0 w-[6px] h-[6px]", config.dot)}
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;
