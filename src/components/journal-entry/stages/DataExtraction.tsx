import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Database,
  Upload,
  Check,
  X,
} from "lucide-react";
import type { StageData, SourceFile } from "../../../types";
import { DocumentPreview } from "../DocumentPreview";
import { ExtractedDataSummary } from "../ExtractedDataSummary";
import { ExceptionPanel } from "../ExceptionPanel";
import sharedDriveIcon from "../../../assets/png/shared_drive.png";
import { SAPLogo } from "../../../assets/svg/SAPLogo";

interface DataExtractionProps {
  stage: StageData;
  onExceptionResolve?: (fileName?: string) => void;
}

const SOURCE_ICONS: Record<string, React.ElementType> = {
  EMAIL: Mail,
  ORACLE: Database,
  UPLOADED: Upload,
};

const SOURCE_ICON_COLORS: Record<string, string> = {
  EMAIL: "text-brand",
  ORACLE: "text-failed",
  UPLOADED: "text-source-uploaded-icon",
};

const SourceCard: React.FC<{
  source: SourceFile;
  isSelected: boolean;
  onClick: () => void;
}> = ({ source, isSelected, onClick }) => {
  const isSAP = source.type === "SAP";
  const isSharedDrive = source.type === "SHAREDRIVE" || isSAP;
  const Icon = SOURCE_ICONS[source.type] || Mail;
  const iconColor = SOURCE_ICON_COLORS[source.type] || "text-gray-500";

  // SHAREDRIVE/SAP uses exact hex colors from design spec
  const cardStyle = isSharedDrive
    ? {
        background: isSelected ? "#0058AB14" : "transparent",
        border: isSelected ? "1.5px solid #0058AB" : "1px solid #E5E7EB",
      }
    : undefined;

  const cardClass = isSharedDrive
    ? "rounded-lg p-3 cursor-pointer min-w-[220px] transition-all"
    : `border rounded-lg p-3 cursor-pointer min-w-[220px] transition-all ${
        isSelected
          ? "border-brand bg-brand-surface shadow-sm"
          : source.type === "EMAIL"
            ? "bg-source-email-bg border-source-email-border"
            : source.type === "ORACLE"
              ? "bg-source-oracle-bg border-source-oracle-border"
              : "bg-source-uploaded-bg border-source-uploaded-border"
      }`;

  return (
    <div onClick={onClick} className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
          {source.type}
        </span>
        {source.status === "success" ? (
          <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center">
            <Check size={10} className="text-completed" strokeWidth={3} />
          </span>
        ) : source.status === "error" ? (
          <span className="w-5 h-5 rounded-full bg-failed flex items-center justify-center">
            <X size={10} className="text-white" strokeWidth={3} />
          </span>
        ) : (
          <span className="w-5 h-5 rounded-full border-2 border-amber flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-amber" />
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isSAP ? (
          <SAPLogo size={28} className="flex-shrink-0" />
        ) : isSharedDrive ? (
          <img
            src={sharedDriveIcon}
            alt="ShareDrive"
            className="w-7 h-7 flex-shrink-0"
          />
        ) : (
          <Icon size={18} className={iconColor} />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-gray-900 truncate">
            {source.name}
          </p>
          <p className="text-[11px] text-gray-400">{source.date}</p>
        </div>
      </div>
    </div>
  );
};

export const DataExtraction: React.FC<DataExtractionProps> = ({
  stage,
  onExceptionResolve,
}) => {
  const sources = stage.sources || [];
  const defaultIndex =
    stage.status === "completed"
      ? Math.max(0, sources.findIndex((s) => s.status === "success"))
      : 0;
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(defaultIndex);
  const [isEditing, setIsEditing] = useState(false);

  // After exception resolution the stage flips to "completed" — auto-select the
  // first successful source so the re-uploaded file's data is shown.
  useEffect(() => {
    if (stage.status === "completed" && sources.length > 0) {
      const firstSuccess = sources.findIndex((s) => s.status === "success");
      if (firstSuccess !== -1 && firstSuccess !== selectedSourceIndex) {
        setSelectedSourceIndex(firstSuccess);
      }
    }
  }, [stage.status]);

  const selectedSource = sources[selectedSourceIndex];

  const scrollLeft = () =>
    setSelectedSourceIndex((prev) => Math.max(0, prev - 1));
  const scrollRight = () =>
    setSelectedSourceIndex((prev) => Math.min(sources.length - 1, prev + 1));

  const hasException =
    stage.exceptionType === "missing_attachment" ||
    stage.exceptionType === "missing_data";

  const handleSendFile = (fileName: string) => {
    if (onExceptionResolve) {
      onExceptionResolve(fileName);
    }
  };

  return (
    <div className="mt-2 space-y-4">
      {/* Source count info */}
      <p className="text-[13px] text-gray-700">
        {stage.extractedCount} sources extracted &middot; {stage.totalRecords}{" "}
        total records. Click a file name to preview
      </p>

      {/* Source Carousel */}
      <div className="flex items-center gap-2">
        <button
          onClick={scrollLeft}
          disabled={selectedSourceIndex === 0}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <div className="flex gap-3 overflow-x-auto pb-1 flex-1">
          {sources.map((src, i) => (
            <SourceCard
              key={i}
              source={src}
              isSelected={i === selectedSourceIndex}
              onClick={() => setSelectedSourceIndex(i)}
            />
          ))}
        </div>
        <button
          onClick={scrollRight}
          disabled={selectedSourceIndex === sources.length - 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <ChevronRight size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Document Preview + Extracted Data Summary */}
      {selectedSource && (
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <DocumentPreview
              fileName={
                stage.sourcePreviewTables?.[selectedSourceIndex]?.fileName ||
                selectedSource.name
              }
              adHocPreparationData={stage.adHocPreparationData}
              sourcePreviewTable={
                stage.sourcePreviewTables?.[selectedSourceIndex]
              }
              isEditing={isEditing}
            />
            {/* Save/Cancel bar when editing */}
            {isEditing && (
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-[12px] font-medium text-white bg-brand border border-brand rounded-lg hover:bg-brand-hover transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          {(() => {
            const perSourceFields =
              stage.sourcePreviewTables?.[selectedSourceIndex]?.extractedFields ||
              stage.extractedFieldsBySource?.[selectedSourceIndex];
            const fields = perSourceFields || stage.extractedFields;
            if (!fields) return null;
            return (
              <div className="flex-shrink-0">
                <ExtractedDataSummary
                  fields={fields}
                  extractedCount={fields.length}
                  confidenceScore={stage.confidenceScore || 0}
                  onEdit={() => setIsEditing(!isEditing)}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* Exception Panel */}
      {hasException && stage.exceptionType && (
        <ExceptionPanel
          stage={stage}
          variant={
            stage.exceptionType === "validation_failed" ? "error" : "warning"
          }
          onSendFile={handleSendFile}
        />
      )}
    </div>
  );
};

export default DataExtraction;
