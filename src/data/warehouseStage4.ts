// ── Warehouse Stage 4 (JE Template Generation) ─────────────────────────────────
// Input file  : warehouseDocs/Data/Trintech.xlsx (sheet "Trintech", header on row 2)
// Output file : warehouseDocs/Data/SIRIUS_UL Calc & Post_1.xlsx
//               (sheet "1.SIRIUS_UL Calc & Post _1", header on row 3, line rows "L")
// Preview = first 5 rows x 5 columns taken from each file.
// Download = the original Excel file (bundled by Vite via ?url).
// Warehouse flow ends at this stage (Logistics keeps all 8 stages).
import trintechUrl from "../../warehouseDocs/Data/Trintech.xlsx?url";
import siriusUrl from "../../warehouseDocs/Data/SIRIUS_UL Calc & Post_1.xlsx?url";
import type { SourceFile, SourcePreviewTable, StageData } from "../types";

const TRINTECH_TOTAL_RECORDS = 99;

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
  fileName: "Trintech.xlsx",
  downloadUrl: trintechUrl,
  columns: ["GL", "Amount", "CC", "Text", "Plant"],
  rows: [
    ["31812002", "44,391.01", "1000532699", "P1026 ACR BNL C600 Inbound", "C600"],
    ["31812003", "28,601.17", "1000532699", "P1026 ACR BNL C600 Outbound", "C600"],
    ["31812005", "50,344.97", "1000532699", "P1026 ACR BNL C600 Picking", "C600"],
    ["14410020", "-123,337.16", "-", "P1026 ACR BNL C600", "C600"],
    ["31812004", "89,989.36", "1000532699", "P1026 ACR BNL C600 Storage", "C600"],
  ],
  rules: STAGE4_RULES,
};

const SIRIUS_OUTPUT: SourcePreviewTable = {
  fileName: "SIRIUS_UL Calc & Post_1.xlsx",
  downloadUrl: siriusUrl,
  columns: ["Posting Key", "Account", "Amount in Document Currency", "Cost Center", "Line Item Text"],
  rows: [
    ["40", "31812002", "44,391.01", "1000532699", "P1026 ACR BNL C600 Inbound"],
    ["40", "31812003", "28,601.17", "1000532699", "P1026 ACR BNL C600 Outbound"],
    ["40", "31812005", "50,344.97", "1000532699", "P1026 ACR BNL C600 Picking"],
    ["50", "14410020", "123,337.16", "-", "P1026 ACR BNL C600"],
    ["40", "31812004", "89,989.36", "1000532699", "P1026 ACR BNL C600 Storage"],
  ],
};

/** Stage 4 content for Warehouse JEs (last stage of the Warehouse flow). */
export const WAREHOUSE_STAGE4: Partial<StageData> = {
  title: "Stage 4: JE Template Generation",
  purpose: "Build structured JE draft",
  componentType: "data_extraction",
  extractedCount: 1,
  totalRecords: TRINTECH_TOTAL_RECORDS,
  sources: [
    {
      type: "SHAREDRIVE",
      name: TRINTECH_INPUT.fileName,
      date: "20 Nov 2026",
      status: "success",
    } as SourceFile,
  ],
  sourcePreviewTables: [TRINTECH_INPUT],
  outputPreviewTable: SIRIUS_OUTPUT,
  outputPreviewTables: undefined,
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
  stageReferenceFiles: undefined,
};

/** Number of stages shown for Warehouse JEs. */
export const WAREHOUSE_STAGE_COUNT = 4;
