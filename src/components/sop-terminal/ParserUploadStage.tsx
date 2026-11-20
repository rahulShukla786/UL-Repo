import React from "react";
import { Upload, Link2, CheckCircle2, FileText } from "lucide-react";
import { Button } from "../shared/Button";
import { Select, SelectItem } from "../shared/Select";
import { cn } from "../../lib/utils";
import { SOP_LOBS, isSOPLob, type SOPLob } from "../../data/ruleSets";

export interface UploadedFile {
  name: string;
  sizeKb: number;
}

interface FileDropCardProps {
  uploadedFile: UploadedFile | null;
  isDragOver: boolean;
  onBrowse: () => void;
  onDrop: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragLeave: () => void;
  onRemove: () => void;
}

const FileDropCard: React.FC<FileDropCardProps> = ({
  uploadedFile,
  isDragOver,
  onBrowse,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemove,
}) => {
  return (
    <button
      type="button"
      onClick={uploadedFile ? undefined : onBrowse}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "flex h-[160px] w-full flex-col items-center justify-center rounded-xl border-[2px] border-brand bg-white px-4 py-4 text-center transition-colors",
        uploadedFile
          ? "border-completed bg-completed-light"
          : isDragOver
            ? "border-brand bg-brand-light/30"
            : "border-brand/70 hover:border-brand hover:bg-brand-light/10",
      )}
    >
      <span
        className={cn(
          "mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg",
          uploadedFile
            ? "bg-white text-completed"
            : "bg-brand-light text-brand",
        )}
      >
        {uploadedFile ? <FileText size={18} /> : <Upload size={18} />}
      </span>
      <p className="text-[16px] font-semibold text-[var(--bright-black)]">
        {uploadedFile ? uploadedFile.name : "Drop your SOP document here"}
      </p>
      <p className="mt-2.5 text-[12px] text-fiord">
        {uploadedFile
          ? `${uploadedFile.sizeKb} KB · Ready to parse`
          : "or click to browse · PDF, DOCX, TXT"}
      </p>
      {uploadedFile ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3 h-7 rounded-md px-3 text-[12px]"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          Remove
        </Button>
      ) : null}
    </button>
  );
};

interface ConnectCardProps {
  connected: boolean;
  disabled?: boolean;
  onConnect: () => void;
}

const ConnectCard: React.FC<ConnectCardProps> = ({
  connected,
  disabled = false,
  onConnect,
}) => {
  const stateClasses = disabled
    ? "cursor-not-allowed border-border-default bg-white text-gray-400"
    : connected
      ? "cursor-pointer border-brand bg-brand-light/15"
      : "cursor-pointer border-brand/70 bg-white hover:border-brand hover:bg-brand-light/10";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onConnect}
      className={cn(
        "flex h-[160px] w-full flex-col items-center justify-center rounded-xl border-[2px] border-brand px-4 py-4 text-center transition-colors",
        stateClasses,
      )}
    >
      <span
        className={cn(
          "mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg",
          disabled ? "bg-gray-100 text-gray-400" : "bg-brand-light text-brand",
        )}
      >
        {connected ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
      </span>
      <p
        className={cn(
          "text-[16px] font-semibold",
          disabled ? "text-gray-400" : "text-[var(--bright-black)]",
        )}
      >
        Connect to SOP knowledge repository
      </p>
      <p
        className={cn(
          "mt-2.5 text-[12px]",
          disabled ? "text-gray-400" : "text-fiord",
        )}
      >
        {connected
          ? "Repository connected"
          : "Access SOPs and process guidance"}
      </p>
    </button>
  );
};

interface ParserUploadStageProps {
  uploadedFile: UploadedFile | null;
  isDragOver: boolean;
  repoConnected: boolean;
  isExtracting: boolean;
  /** SOP type / Line of Business chosen for the uploaded file */
  lob: SOPLob | null;
  onLobChange: (lob: SOPLob) => void;
  onBrowse: () => void;
  onDrop: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragLeave: () => void;
  onRemove: () => void;
  onToggleConnect: () => void;
  onExtract: () => void;
}

export const ParserUploadStage: React.FC<ParserUploadStageProps> = ({
  uploadedFile,
  isDragOver,
  repoConnected,
  isExtracting,
  lob,
  onLobChange,
  onBrowse,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemove,
  onToggleConnect,
  onExtract,
}) => {
  const canExtract = Boolean(uploadedFile) && Boolean(lob) && !isExtracting;

  return (
    <>
      <h2 className="text-[24px] font-semibold text-[var(--deep-blue)]">
        SOP Parser
      </h2>
      <p className="mt-1 max-w-190 text-[13px] text-fiord">
        Upload a Standard Operating Procedure, choose its SOP type (Logistics
        or Warehouse) and review the enabled business rules of that rule set.
      </p>

      <div className="mt-4 grid w-full gap-6 md:grid-cols-2">
        <FileDropCard
          uploadedFile={uploadedFile}
          isDragOver={isDragOver}
          onBrowse={onBrowse}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onRemove={onRemove}
        />
        <ConnectCard
          connected={repoConnected}
          disabled={Boolean(uploadedFile) || isExtracting}
          onConnect={onToggleConnect}
        />
      </div>

      <div className="mt-3.5 flex flex-wrap items-end justify-end gap-4">
        <div className="w-56">
          <label className="mb-1 block text-[12px] font-medium text-gray-700">
            SOP Type (Line of Business)
          </label>
          <Select
            value={lob ?? "Select"}
            onValueChange={(value) => {
              if (isSOPLob(value)) onLobChange(value);
            }}
            className="h-9 w-full"
          >
            <SelectItem value="Select">Select</SelectItem>
            {SOP_LOBS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          className="h-9 min-w-61 rounded-lg bg-brand px-5 text-[13px] font-medium text-white hover:bg-brand-hover disabled:opacity-45"
          disabled={!canExtract}
          onClick={onExtract}
        >
          Extract Business Rules
        </Button>
      </div>
    </>
  );
};

export default ParserUploadStage;
