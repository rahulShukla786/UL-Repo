import React, { useRef, useEffect, useState } from "react";
import { X, Terminal } from "lucide-react";
import type { JEStatus } from "../../types";

interface AIProcessingLogProps {
  logs: string[];
  status: JEStatus;
}

const getTitle = (status: JEStatus): string => {
  switch (status) {
    case "completed":
      return "AI Processing Completed";
    case "failed":
      return "AI Processing Failed";
    case "action_required":
      return "AI Processing — Needs Input";
    default:
      return "AI Processing";
  }
};

/** Full-screen modal that renders all log lines */
const LogsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  logs: string[];
}> = ({ isOpen, onClose, title, logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[720px] mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-brand" />
            <h2 className="text-[14px] font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-[13px] text-failed font-medium hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X size={14} />
            Close
          </button>
        </div>

        {/* Log lines */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50 rounded-b-xl"
        >
          {logs.length === 0 ? (
            <p className="text-[12px] text-gray-400 font-mono">
              No log entries available.
            </p>
          ) : (
            logs.map((log, i) => (
              <p
                key={i}
                className="text-[12px] text-gray-700 leading-6 font-mono"
              >
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const AIProcessingLog: React.FC<AIProcessingLogProps> = ({
  logs,
  status,
}) => {
  const logRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const title = getTitle(status);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <>
      <div className="mt-4">
        {/* Inline preview — last few log lines */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
          </div>
          <div
            ref={logRef}
            className="px-4 py-3 max-h-36 overflow-y-auto scrollbar-blue"
          >
            {logs.map((log, i) => (
              <p
                key={i}
                className="text-[12px] text-gray-700 leading-5 font-mono"
              >
                {log}
              </p>
            ))}
          </div>
        </div>

        {/* View All Logs — opens modal */}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-[13px] font-medium text-brand border border-brand rounded-lg hover:bg-source-email-bg transition-colors cursor-pointer"
          >
            View All Logs
          </button>
        </div>
      </div>

      {/* Logs modal */}
      <LogsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        logs={logs}
      />
    </>
  );
};

export default AIProcessingLog;
