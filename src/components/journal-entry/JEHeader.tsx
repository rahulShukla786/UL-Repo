import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { StatusBadge } from "../shared/StatusBadge";
import { Button } from "../shared/Button";
import type { JournalEntry } from "../../types";

interface JEHeaderProps {
  entry: JournalEntry;
}

const SOURCE_LABELS: Record<string, string> = {
  "/work-list": "Work List",
  "/exception": "Exception",
  "/journal-entry": "Journal Entry",
};

const SOP_FILE_MAP: Record<string, string> = {
  "Goods in Transit JE_SOP v1.0": "UL_INDO_DTP_U2K2_V 3.0_Goods In Transit (GIT) Journal.docx",
  "Media BD Open DO Provision_SOP v1.0": "Media_Cost centre Open DO Provision V4.0-06 Apr 2026.docx",
  "Sales Reclass JE_SOP v1.0": "Sales Reclass Journal DTP V 2.0_05 May'2026.docx",
};

export const JEHeader: React.FC<JEHeaderProps> = ({ entry }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/journal-entry";
  const fromLabel = SOURCE_LABELS[from] || "Journal Entry";

  return (
    <div className="h-[140px]">
      {/* Breadcrumb — has its own bottom border */}
      <div className="px-6 py-3 border-b border-gray-200">
        <nav className="flex items-center gap-1 text-[12px] text-gray-500">
          <button
            onClick={() => navigate("/journal-entry")}
            className="hover:text-brand transition-colors cursor-pointer"
          >
            OD Journal Entry
          </button>
          <span className="mx-0.5">/</span>
          <button
            onClick={() => navigate(from)}
            className="hover:text-brand transition-colors cursor-pointer"
          >
            {fromLabel}
          </button>
          <span className="mx-0.5">/</span>
          <span className="text-brand font-medium cursor-default">
            {entry.id}
          </span>
        </nav>
      </div>

      {/* Main header row */}
      <div className="px-6 py-4 flex items-center">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(from)}
          className="flex items-center gap-1 text-[13px] font-medium shrink-0 px-0 hover:bg-transparent hover:text-brand cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back
        </Button>

        {/* Vertical divider after Back */}
        <div className="mx-4 self-stretch w-px bg-gray-200 shrink-0" />

        {/* Journal ID + Status + Name */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-semibold text-brand">
              {entry.id}
            </span>
            <StatusBadge status={entry.status} />
          </div>
          <h1 className="text-[16px] font-bold text-[var(--deep-blue)]">
            {entry?.subTitle ? entry.subTitle : entry.name}
          </h1>
        </div>

        {/* Vertical divider before metadata */}
        <div className="mx-6 self-stretch w-px bg-gray-200 shrink-0" />

        {/* Metadata columns */}
        <div className="flex items-center shrink-0">
          <div className="px-4">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              JE PROCESS DATE
            </p>
            <p className="text-[13px] text-gray-700">{entry.processDate}</p>
          </div>
          <div className="self-stretch w-px bg-gray-200 shrink-0" />
          <div className="px-4">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              COUNTRY
            </p>
            <p className="text-[13px] text-gray-700">{entry.country}</p>
          </div>
          <div className="self-stretch w-px bg-gray-200 shrink-0" />
          <div className="px-4">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              LOB
            </p>
            <p className="text-[13px] text-gray-700">{entry.lob}</p>
          </div>
          <div className="self-stretch w-px bg-gray-200 shrink-0" />
          <div className="px-4">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              JE TYPE
            </p>
            <p className="text-[13px] text-gray-700">{entry.jeType}</p>
          </div>
          {entry.sop ? (
            <>
              <div className="self-stretch w-px bg-gray-200 shrink-0" />
              <div className="px-4">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  SOP
                </p>
                {SOP_FILE_MAP[entry.sop] ? (
                  <a
                    href={encodeURI(`/data/${SOP_FILE_MAP[entry.sop]}`)}
                    download
                    className="text-[13px] text-brand font-medium hover:underline cursor-pointer"
                  >
                    {entry.sop}
                  </a>
                ) : (
                  <span className="text-[13px] text-gray-700">{entry.sop}</span>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default JEHeader;
