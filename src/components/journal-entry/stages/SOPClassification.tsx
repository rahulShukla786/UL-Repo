import { AlertTriangle, CheckCircle2, Folder, Search } from "lucide-react";
import React, { useState } from "react";
import sopPdfUrl from "../../../data/Accrual_details_SOP.pdf?url";
import type { StageData } from "../../../types";

interface SOPClassificationProps {
  stage: StageData;
  onSOPSelect?: (sopId: string) => void;
}

const openSOP = () => window.open(sopPdfUrl, "_blank", "noopener,noreferrer");

export const SOPClassification: React.FC<SOPClassificationProps> = ({
  stage,
  onSOPSelect,
}) => {
  const [selectedSOP, setSelectedSOP] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // SOP Selection UI (action-required state)
  if (stage.exceptionType === "sop_selection" && stage.sopOptions) {
    const filteredOptions = stage.sopOptions.filter((sop) =>
      sop.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className="mt-2 space-y-3">
        {/* Classification items */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-completed flex-shrink-0" />
            <span className="text-[13px] text-gray-700">
              Journal type classified:{" "}
              <span className="font-medium">{stage.sopClassification}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-completed flex-shrink-0" />
            <span className="text-[13px] text-gray-700">
              Relevant SOP identified:{" "}
              <span className="font-medium">{stage.sopIdentified}</span>
            </span>
          </div>
        </div>

        {/* SOP Selection Panel */}
        <div className="border border-warning-border bg-warning-light rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-warning flex-shrink-0" />
            <span className="text-[14px] font-semibold text-warning">
              Please select the most appropriate SOP to proceed.
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mb-3 ml-6">
            Suggesting top 5 relevant SOP's based on the data.
          </p>

          {/* Search input */}
          <div className="relative mb-3 ml-6">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search from the SOP library"
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-warning bg-white placeholder:text-gray-400"
            />
          </div>

          {/* SOP Radio Options */}
          <div className="space-y-2 ml-6">
            {filteredOptions.map((sop) => (
              <label
                key={sop.id}
                className={`flex items-center justify-between border rounded-lg px-4 py-2.5 cursor-pointer transition-colors ${
                  selectedSOP === sop.id
                    ? "border-warning bg-warning-light"
                    : "border-gray-200 bg-white hover:border-warning-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="sop-selection"
                    value={sop.id}
                    checked={selectedSOP === sop.id}
                    onChange={() => setSelectedSOP(sop.id)}
                    className="w-4 h-4 text-warning accent-warning"
                  />
                  <div className="flex items-center gap-2">
                    <Folder size={14} className="text-gray-500" />
                    <span className="text-[13px] text-gray-700 font-medium">
                      {sop.name}
                    </span>
                  </div>
                  <span className="text-[12px] text-gray-500">
                    Confidence Score: {sop.confidenceScore}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openSOP();
                  }}
                  className="text-[13px] text-brand font-medium hover:underline"
                >
                  View
                </button>
              </label>
            ))}
          </div>

          {/* Proceed button */}
          <div className="mt-4 ml-6">
            <button
              onClick={() => selectedSOP && onSOPSelect?.(selectedSOP)}
              disabled={!selectedSOP}
              className={`px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
                selectedSOP
                  ? "bg-warning text-white hover:bg-warning-dark"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Proceed with Select SOP
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal completed state — SOP Auto Mapped Successfully
  return (
    <div className="mt-2 space-y-3">
      {/* Classification items */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-completed flex-shrink-0" />
          <span className="text-[13px] text-gray-700">
            Journal type classified:{" "}
            <span className="font-medium">{stage.sopClassification}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-completed flex-shrink-0" />
          <span className="text-[13px] text-gray-700">
            Relevant SOP identified:{" "}
            <span className="font-medium">{stage.sopIdentified}</span>
          </span>
        </div>
      </div>

      {/* SOP Auto Mapped box */}
      <div className="border border-completed-border bg-completed-light rounded-lg px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={16} className="text-completed" />
          <span className="text-[14px] font-semibold text-completed">
            SOP Auto Mapped Successfully!
          </span>
        </div>
        <p className="text-[12px] text-gray-500 mb-3 ml-6">
          Agent has automatically mapped the relevant SOP with a success rate
          greater than 95%
        </p>
        <div className="ml-6 flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5 bg-white">
          <div className="flex items-center gap-2">
            <Folder size={16} className="text-gray-500" />
            <span className="text-[13px] text-gray-700 font-medium">
              {stage.sopName}
            </span>
            <span className="text-[12px] text-gray-500 ml-2">
              Confidence Score: {stage.sopConfidenceScore}%
            </span>
          </div>
          <button
            type="button"
            onClick={openSOP}
            className="text-[13px] text-brand font-medium hover:underline"
          >
            View SOP
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOPClassification;
