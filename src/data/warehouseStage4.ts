// ── Warehouse Stage 4 (JE Template Generation) ─────────────────────────────────
// Input file  : Excellist/NewWH/Trintech_ (1).xlsx (Sheet1, 10 rows, all shown with pagination)
// Output file : warehouseDocs/SIRIUS_UL Calc & Post.xlsx
//               (Sheet2, field codes on row 1, header on row 2, H record row 3, "L" lines from row 4)
// Output preview = all 24 columns of the file, first 5 records (H + 4 L lines), empty cells = "-".
// Download = the original Excel file (bundled by Vite via ?url).
// Warehouse flow ends at this stage (Logistics keeps all 8 stages).
import trintechUrl from "../../Excellist/NewWH/Trintech_ (1).xlsx?url";
import siriusUrl from "../../warehouseDocs/SIRIUS_UL Calc & Post.xlsx?url";
import type { SourceFile, SourcePreviewTable, StageData } from "../types";

// Rule Summary for Stage 4 — from warehouseDocs/Data/Stage-final-rules.xlsx (sheet "Trintech_BlackLine_Rules").
const STAGE4_RULES: string[] = [
  "R003 — Loads the current accounting period/month information into Trintech.",
  "R097 — Creates balancing journal lines to ensure journal entries net to zero.",
  "R073 — Validates that the journal total matches the expected accrual amount.",
  "R074 — Reconciles journal totals against Snapshot New totals.",
  "R098 — Sets the journal posting date.",
  "R099 — Sets the journal reversal date.",
  "R100 — Populates the BlackLine upload template header fields.",
  "R108 — Maps Trintech journal lines into the BlackLine upload format.",
  "R101 — Compares the BlackLine upload total against the Trintech journal total.",
  "R077 — Validates that the difference between BlackLine and Trintech totals is within the allowed tolerance.",
  "R109 — Uploads the completed BlackLine file as part of the posting process.",
];

const TRINTECH_INPUT: SourcePreviewTable = {
  fileName: "Trintech_ (1).xlsx",
  downloadUrl: trintechUrl,
  columns: ["GL", "Amount", "CC", "Text", "Plant"],
  rows: [
    ["31812002", "44,391.01", "1000532699", "P1026 ACR BNL C600 Inbound", "C600"],
    ["31812003", "28,601.17", "1000532699", "P1026 ACR BNL C600 Outbound", "C600"],
    ["31812005", "50,344.97", "1000532699", "P1026 ACR BNL C600 Picking", "C600"],
    ["14410020", "-123,337.16", "-", "P1026 ACR BNL C600", "C600"],
    ["31812004", "89,989.36", "1000532699", "P1026 ACR BNL C600 Storage", "C600"],
    ["31812006", "10,060.02", "1000532699", "P1026 ACR BNL C600 Waste", "C600"],
    ["31812007", "1,831.77", "1000532699", "P1026 ACR BNL C600 Admin", "C600"],
    ["31812010", "7,630.96", "1000532699", "P1026 ACR BNL C600 Other", "C600"],
    ["31812008", "0.00", "1000532699", "P1026 ACR BNL C600 Rework", "C600"],
    ["14410020", "-109,512.12", "-", "P1026 ACR BNL C600", "C600"],
  ],
  rules: STAGE4_RULES,
};

const SIRIUS_OUTPUT: SourcePreviewTable = {
  fileName: "SIRIUS_UL Calc & Post.xlsx",
  downloadUrl: siriusUrl,
  showAllColumns: true,
  columns: [
    "Record Type", "JE Classification*", "Document Type (S)*", "Document Date*", "Posting Date*",
    "Posting Period", "Document Header Text*", "Header Company Code*", "Document Currency*", "Reference Doc",
    "Translation Date*", "Exchange Rate Override", "VAT Date", "Reversal Reason", "Reversal Date",
    "Calculate Tax ?*", "Tax Payable", "Posting Key*", "Cross Company Code", "Account*",
    "Amount in Document Currency*", "Cost Center", "Line Item Text*", "Tax Code",
  ],
  rows: [
    ["H", "ACCRUALS", "Y1", "2026-10-31", "2026-10-31", "-", "P1026 ACR BNL", "2611", "EUR", "-", "2026-10-31", "-", "-", "05", "2026-11-01", "2026-10-31", "N", "-", "-", "-", "-", "-", "-", "-"],
    ["L", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "40", "2611", "31812002", "44,391.01", "1000532699", "P1026 ACR BNL C600 Inbound", "-"],
    ["L", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "40", "2611", "31812003", "28,601.17", "1000532699", "P1026 ACR BNL C600 Outbound", "-"],
    ["L", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "40", "2611", "31812005", "50,344.97", "1000532699", "P1026 ACR BNL C600 Picking", "-"],
    ["L", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "50", "2611", "14410020", "123,337.16", "-", "P1026 ACR BNL C600", "-"],
  ],
};

/** Stage 4 content for Warehouse JEs (last stage of the Warehouse flow). */
export const WAREHOUSE_STAGE4: Partial<StageData> = {
  title: "Stage 4: JE Template Generation",
  purpose: "Build structured JE draft",
  componentType: "data_extraction",
  extractedCount: 1,
  totalRecords: TRINTECH_INPUT.rows.length,
  sources: [
    {
      type: "SHAREDRIVE",
      name: TRINTECH_INPUT.fileName,
      date: "2026-11-20",
      status: "success",
    } as SourceFile,
  ],
  sourcePreviewTables: [TRINTECH_INPUT],
  outputPreviewTable: SIRIUS_OUTPUT,
  outputPreviewTables: undefined,
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
  stageReferenceFiles: undefined,
  // Per user: hide the input part (sources line, Trintech_ (1).xlsx card, input preview,
  // Rule Summary) — Stage 3 "JE Template Generation" shows only the SIRIUS output preview.
  hideInputSection: true,
};

/** Number of stages shown for Warehouse JEs. */
export const WAREHOUSE_STAGE_COUNT = 4;
