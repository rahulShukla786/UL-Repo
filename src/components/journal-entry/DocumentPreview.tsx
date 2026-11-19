import React from "react";
import { FileText } from "lucide-react";
import type { AdHocPreparationRow, SourcePreviewTable } from "../../types";
import { AdHocPreparationTable } from "./AdHocPreparationTable";

interface DocumentPreviewProps {
  fileName: string;
  adHocPreparationData?: AdHocPreparationRow[];
  sourcePreviewTable?: SourcePreviewTable;
  isEditing?: boolean;
}

// Mock spreadsheet rows for standard flow xlsx preview
const SPREADSHEET_HEADERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SPREADSHEET_COLS = [
  "Customer Name",
  "Customer ID",
  "Account Number",
  "Account Name",
  "Amount",
  "Currency",
  "Invoice Number",
  "Invoice Date",
];
const SPREADSHEET_ROWS = [
  [
    "ABC Corp",
    "CUST1001",
    "140210",
    "Accounts Receivable",
    "25780",
    "USD",
    "INV-8891",
    "2025-10-15",
  ],
  [
    "XYZ Ltd",
    "CUST1045",
    "140210",
    "Accounts Receivable",
    "12450",
    "USD",
    "INV-9021",
    "2025-09-10",
  ],
];

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileName,
  adHocPreparationData,
  sourcePreviewTable,
  isEditing = false,
}) => {
  const isExcel =
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".csv") ||
    fileName.endsWith(".xls");
  const isPdf = fileName.endsWith(".pdf") || fileName.endsWith(".PDF");

  return (
    <div>
      {/* Document Preview title + file name — outside the table */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          DOCUMENT PREVIEW
        </span>
        <span className="text-[13px] text-gray-700">{fileName}</span>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Edit mode indicator */}
      {isEditing && (
        <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-700 font-medium">
          Editing mode — Click any cell to modify its value
        </div>
      )}

      {/* Body */}
      {sourcePreviewTable ? (
        <div className="overflow-x-auto overflow-y-auto max-h-[320px] bg-white scrollbar-blue">
          <table className="w-max min-w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {sourcePreviewTable.columns.map((col) => (
                  <th key={col} className="px-4 py-2.5 text-[11px] font-semibold text-gray-700 uppercase tracking-wide text-left whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sourcePreviewTable.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50 transition-colors">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-2.5 whitespace-nowrap ${
                        ci === 0 ? "text-brand font-medium" : "text-gray-700"
                      } ${isEditing ? "cursor-text hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-brand" : ""}`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {sourcePreviewTable.totalLabel && (
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-gray-700">
                    {sourcePreviewTable.totalLabel}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-gray-700">
                    {sourcePreviewTable.totalValue}
                  </td>
                  {sourcePreviewTable.columns.slice(2).map((_, i) => (
                    <td key={i} className="px-4 py-2.5" />
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : adHocPreparationData ? (
        // Show ALL records in scrollable view (480px max-height)
        <AdHocPreparationTable
          rows={adHocPreparationData}
          maxRows={adHocPreparationData.length}
          isEditing={isEditing}
        />
      ) : isExcel ? (
        <div className="overflow-x-scroll overflow-y-auto max-h-[320px] bg-white scrollbar-doc">
          <table
            className="w-max text-[11px]"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th className="w-8 bg-gray-100 border border-gray-300 px-1 py-0.5 text-center text-gray-500" />
                {SPREADSHEET_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="bg-gray-100 border border-gray-300 px-2 py-0.5 text-center font-semibold text-gray-700 w-[220px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="bg-gray-100 border border-gray-300 px-1 py-0.5 text-center text-gray-500 text-[10px]">
                  1
                </td>
                {SPREADSHEET_COLS.map((col) => (
                  <td
                    key={col}
                    className="border border-gray-300 px-2 py-0.5 font-semibold text-gray-900 bg-doc-header-bg"
                  >
                    {col}
                  </td>
                ))}
              </tr>
              {SPREADSHEET_ROWS.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? "bg-source-email-bg" : "bg-white"}
                >
                  <td className="bg-gray-100 border border-gray-300 px-1 py-0.5 text-center text-gray-500 text-[10px]">
                    {ri + 2}
                  </td>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`border border-gray-300 px-2 py-0.5 text-gray-700 ${
                        isEditing ? 'cursor-text hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-brand' : ''
                      }`}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="bg-gray-100 border border-gray-300 px-1 py-0.5 text-center text-gray-500 text-[10px]">
                    {i + 4}
                  </td>
                  {SPREADSHEET_HEADERS.map((h) => (
                    <td key={h} className="border border-gray-300 px-2 py-0.5">
                      &nbsp;
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isPdf ? (
        <div className="p-6 bg-white min-h-[280px] flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-20 bg-failed-light border border-failed-border rounded-lg flex items-center justify-center">
            <FileText size={32} className="text-failed" />
          </div>
          <p className="text-[13px] font-medium text-gray-700">{fileName}</p>
          <p className="text-[12px] text-gray-400">PDF document preview</p>
          <div className="w-full max-w-[400px] mt-3 space-y-2 px-4">
            <div className="h-2.5 bg-gray-200 rounded w-full" />
            <div className="h-2.5 bg-gray-200 rounded w-4/5" />
            <div className="h-2.5 bg-gray-200 rounded w-full" />
            <div className="h-2.5 bg-gray-200 rounded w-3/5" />
            <div className="h-2.5 bg-gray-200 rounded w-full" />
            <div className="h-2.5 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white">
          <div className="border border-gray-200 rounded p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
            <p className="text-[13px] text-gray-400">
              Preview not available for {fileName}
            </p>
          </div>
        </div>
      )}


    </div>
    </div>
  );
};

export default DocumentPreview;
