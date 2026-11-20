import React, { useRef, useState } from "react";
import {
  ParserUploadStage,
  type UploadedFile,
} from "./ParserUploadStage";
import { ParserExtractingOverlay } from "./ParserExtractingOverlay";
import { ParserRulesStage } from "./ParserRulesStage";
import type { SOPRule } from "../../stores/sopStore";
import { guessLobFromFileName, type SOPLob } from "../../data/ruleSets";

const ALLOWED_TYPES = ["pdf", "doc", "docx", "txt"];

type ParserPhase = "upload" | "extracting" | "rules";

interface SOPParserPanelProps {
  onSaveToLibrary?: (fileName: string, rules: SOPRule[], lob: SOPLob) => void;
}

export const SOPParserPanel: React.FC<SOPParserPanelProps> = ({ onSaveToLibrary }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [repoConnected, setRepoConnected] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [phase, setPhase] = useState<ParserPhase>("upload");
  const [lob, setLob] = useState<SOPLob | null>(null);

  const processFile = (file?: File | null) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_TYPES.includes(ext)) return;
    setUploadedFile({
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
    setRepoConnected(false);
    // Pre-select the SOP type from the file name (e.g. "..._WH_..." = Warehouse); user can change it
    setLob(guessLobFromFileName(file.name));
  };

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
    event.currentTarget.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleExtract = () => {
    if (!lob) return;
    setPhase("extracting");
    setTimeout(() => {
      setPhase("rules");
    }, 2400);
  };

  return (
    <div className="bg-white px-5 pb-4 pt-5 font-sans sm:px-6 sm:pb-5 sm:pt-6">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleInputChange}
      />

      {phase !== "rules" ? (
        <ParserUploadStage
          uploadedFile={uploadedFile}
          isDragOver={isDragOver}
          onBrowse={handleBrowse}
          onDrop={handleDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onRemove={() => {
            setUploadedFile(null);
            setLob(null);
            setPhase("upload");
          }}
          repoConnected={repoConnected}
          isExtracting={phase === "extracting"}
          lob={lob}
          onLobChange={setLob}
          onToggleConnect={() => setRepoConnected((prev) => !prev)}
          onExtract={handleExtract}
        />
      ) : null}

      {phase === "rules" && uploadedFile && lob ? (
        <ParserRulesStage
          uploadedFile={uploadedFile}
          lob={lob}
          onSaveToLibrary={onSaveToLibrary}
        />
      ) : null}

      {phase === "extracting" ? <ParserExtractingOverlay /> : null}
    </div>
  );
};

export default SOPParserPanel;