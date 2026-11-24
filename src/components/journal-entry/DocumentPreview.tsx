import React, { useEffect, useState } from "react";
import { FileText, Download, ChevronLeft, ChevronRight, Loader2, Check, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import type { AdHocPreparationRow, SourcePreviewTable } from "../../types";
import { AdHocPreparationTable } from "./AdHocPreparationTable";

interface DocumentPreviewProps {
  fileName: string;
  adHocPreparationData?: AdHocPreparationRow[];
  sourcePreviewTable?: SourcePreviewTable;
  isEditing?: boolean;
  /** Header label shown above the table (default: "INPUT PREVIEW") */
  title?: string;
}

// Preview shows only the first N columns and N rows per page
const PREVIEW_COLUMN_COUNT = 5;
const PREVIEW_PAGE_SIZE = 5;

// Read the first sheet of a real .xlsx/.xls/.csv file served from /public.
// Returns null when the file is missing (Vite serves index.html instead).
const loadExcelTable = async (
  filePath: string,
  fileName: string,
): Promise<SourcePreviewTable | null> => {
  const res = await fetch(encodeURI(filePath));
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 4));
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // "PK" = xlsx
  const isOle = bytes[0] === 0xd0 && bytes[1] === 0xcf; // legacy .xls
  const isCsv = /\.csv$/i.test(filePath);
  if (!isZip && !isOle && !isCsv) return null;

  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });
  const nonEmpty = aoa.filter((r) => r.some((c) => String(c).trim() !== ""));
  if (nonEmpty.length === 0) return null;
  const [header, ...body] = nonEmpty;
  return {
    fileName,
    filePath,
    columns: header.map((c, i) => String(c).trim() || `Column ${i + 1}`),
    rows: body.map((r) => header.map((_, i) => String(r[i] ?? ""))),
  };
};

// Download the full table (all columns / rows) as an .xlsx file
const downloadTableAsExcel = (table: SourcePreviewTable) => {
  const sheet = XLSX.utils.aoa_to_sheet([table.columns, ...table.rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Data");
  const name = /\.(xlsx|xls|csv)$/i.test(table.fileName)
    ? table.fileName.replace(/\.(xls|csv)$/i, ".xlsx")
    : `${table.fileName}.xlsx`;
  XLSX.writeFile(workbook, name);
};

// Fetch a file with progress reporting, then hand it to the browser as a download.
// onProgress gets 0-100, or null when the server sends no Content-Length.
const downloadWithProgress = async (
  url: string,
  name: string,
  onProgress: (pct: number | null) => void,
) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const total = Number(res.headers.get("content-length")) || 0;
  let blob: Blob;
  if (res.body && total > 0) {
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress(Math.min(100, Math.round((received / total) * 100)));
    }
    blob = new Blob(chunks as BlobPart[]);
  } else {
    onProgress(null);
    blob = await res.blob();
  }
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

type DownloadState = "idle" | "downloading" | "done" | "error";

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
  sourcePreviewTable: providedTable,
  isEditing = false,
  title = "INPUT PREVIEW",
}) => {
  const [page, setPage] = useState(0);
  // Table read from the actual selected file (if it exists in /public)
  const [liveTable, setLiveTable] = useState<SourcePreviewTable | null>(null);
  // Download button feedback: spinner + % while fetching, then "Downloaded" / "Retry"
  const [dlState, setDlState] = useState<DownloadState>("idle");
  const [dlProgress, setDlProgress] = useState<number | null>(null);

  const handleDownload = async (table: SourcePreviewTable) => {
    if (dlState === "downloading") return;
    const downloadUrl = providedTable?.downloadUrl;
    const url = downloadUrl ?? (liveTable?.filePath ? encodeURI(liveTable.filePath) : null);
    const name = downloadUrl ? providedTable?.fileName || fileName : liveTable?.fileName || fileName;
    setDlState("downloading");
    setDlProgress(url ? 0 : null);
    try {
      if (url) {
        await downloadWithProgress(url, name, setDlProgress);
      } else {
        // No original file -> build the .xlsx from the table data
        await new Promise((r) => setTimeout(r, 300));
        downloadTableAsExcel(table);
      }
      setDlState("done");
    } catch {
      setDlState("error");
    }
    setTimeout(() => setDlState("idle"), 2500);
  };

  // Reset to the first page whenever another file is selected
  useEffect(() => setPage(0), [fileName]);

  // Load data from the selected file itself; fall back to providedTable
  useEffect(() => {
    setLiveTable(null);
    const filePath = providedTable?.filePath;
    if (!filePath) return;
    let cancelled = false;
    loadExcelTable(filePath, providedTable?.fileName || fileName)
      .then((table) => {
        if (!cancelled) setLiveTable(table);
      })
      .catch(() => {
        if (!cancelled) setLiveTable(null);
      });
    return () => {
      cancelled = true;
    };
  }, [providedTable?.filePath, providedTable?.fileName, fileName]);

  const sourcePreviewTable = liveTable ?? providedTable;

  // Tables flagged showAllColumns display every column; others the first N
  const columnCount = providedTable?.showAllColumns
    ? sourcePreviewTable?.columns.length ?? 0
    : PREVIEW_COLUMN_COUNT;
  const previewColumns = sourcePreviewTable
    ? sourcePreviewTable.columns.slice(0, columnCount)
    : [];
  const totalRows = sourcePreviewTable?.rows.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / PREVIEW_PAGE_SIZE));
  const pageStart = page * PREVIEW_PAGE_SIZE;
  const pageRows = sourcePreviewTable
    ? sourcePreviewTable.rows
        .slice(pageStart, pageStart + PREVIEW_PAGE_SIZE)
        .map((row) => row.slice(0, columnCount))
    : [];

  const isExcel =
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".csv") ||
    fileName.endsWith(".xls");
  const isPdf = fileName.endsWith(".pdf") || fileName.endsWith(".PDF");

  return (
    <div>
      {/* Document Preview title + file name — outside the table */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            {title}
          </span>
          {/* INPUT / OUTPUT PREVIEW label: displayName if set, else file name without .xlsx/.xls/.csv */}
          <span className="text-[13px] text-gray-700 truncate">
            {providedTable?.displayName ?? fileName.replace(/\.(xlsx|xls|csv)$/i, "")}
          </span>
        </div>
        {sourcePreviewTable && (
          <button
            onClick={() => handleDownload(sourcePreviewTable)}
            disabled={dlState === "downloading"}
            aria-busy={dlState === "downloading"}
            aria-live="polite"
            title={dlState === "downloading" ? "Downloading file, please wait..." : "Download the original file"}
            className={`relative overflow-hidden flex items-center justify-center gap-1.5 min-w-[118px] px-3 py-1.5 text-[12px] font-medium bg-white border rounded-lg transition-colors flex-shrink-0 ${
              dlState === "done"
                ? "text-green-700 border-green-600 bg-green-50"
                : dlState === "error"
                  ? "text-red-600 border-red-500 hover:bg-red-50 cursor-pointer"
                  : dlState === "downloading"
                    ? "text-brand border-brand cursor-wait"
                    : "text-brand border-brand hover:bg-brand-surface cursor-pointer"
            }`}
          >
            {/* Progress fill behind the label while downloading */}
            {dlState === "downloading" && (
              <span
                className={`absolute inset-y-0 left-0 bg-brand-surface transition-all duration-200 ${dlProgress === null ? "w-full animate-pulse" : ""}`}
                style={dlProgress !== null ? { width: `${dlProgress}%` } : undefined}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {dlState === "downloading" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {dlProgress !== null && dlProgress > 0 ? `Downloading ${dlProgress}%` : "Preparing..."}
                </>
              ) : dlState === "done" ? (
                <>
                  <Check size={14} />
                  Downloaded
                </>
              ) : dlState === "error" ? (
                <>
                  <AlertCircle size={14} />
                  Retry
                </>
              ) : (
                <>
                  <Download size={14} />
                  Download
                </>
              )}
            </span>
          </button>
        )}
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
                {previewColumns.map((col, ci) => (
                  <th key={`${ci}-${col}`} className="px-4 py-2.5 text-[11px] font-semibold text-gray-700 uppercase tracking-wide text-left whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50 transition-colors">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-2.5 whitespace-nowrap text-gray-700 ${isEditing ? "cursor-text hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-brand" : ""}`}
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
                  {previewColumns.slice(2).map((_, i) => (
                    <td key={i} className="px-4 py-2.5" />
                  ))}
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          {totalRows > PREVIEW_PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-white text-[12px] text-gray-600">
              <span>
                Showing {pageStart + 1}–{Math.min(pageStart + PREVIEW_PAGE_SIZE, totalRows)} of {totalRows} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
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
