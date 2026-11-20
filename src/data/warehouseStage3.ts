// ── Warehouse Stage 3 (Data Processing 2) ─────────────────────────────────────
// Input file      : warehouseDocs/Data/SAP.xlsx (sheet "SAP", header on row 2)
// Output file     : warehouseDocs/Data/Snapshot New.xlsx (sheet "Snapshot New")
// Reference files : warehouseDocs/Data/snapshot.xlsx, warehouseDocs/Data/FC Update.xlsx
//                   (offered in the "Reference Files" download menu)
// Preview = first 5 rows x 5 columns taken from each file.
// Download = the original Excel file (bundled by Vite via ?url).
import sapUrl from "../../warehouseDocs/Data/SAP.xlsx?url";
import snapshotNewUrl from "../../warehouseDocs/Data/Snapshot New.xlsx?url";
import snapshotUrl from "../../warehouseDocs/Data/snapshot.xlsx?url";
import fcUpdateUrl from "../../warehouseDocs/Data/FC Update.xlsx?url";
import type { SourceFile, SourcePreviewTable, StageData } from "../types";

const SAP_TOTAL_RECORDS = 22677;

// Rule Summary for Stage 3 — from warehouseDocs/Data/Stage-2.xlsx (sheet "Rules Summary").
const STAGE3_RULES: string[] = [
  "R009 — Reads warehouse cost element data from the pivot table.",
  "R011 — Calculates total accrual/forecast values using columns M, N, and O.",
  "R010 — Validates that specific control values are zero.",
  "R071 — Compares Snapshot New values against calculated balances.",
  "R094 — Transfers calculated values from the file into Snapshot New.",
  "R030 — Loads SAP export data for accrual processing.",
  "R036 — Maintains SAP historical transaction data.",
  "R032 — Calculates SAP totals using filtered data.",
  "R037 — Derives WH/PALLETS category using lookup logic.",
  "R038 — Derives Plant information using lookup logic.",
  "R039 — Derives Plant_BCS information using lookup logic.",
  "R040 — Derives the fiscal year from posting dates.",
  "R051 — Identifies and tags Stock Insurance transactions.",
  "R043 — Supplies GR (Goods Receipt) data for accrual calculations.",
  "R052 — Supplies GR values used in accrual and reconciliation processing.",
  "R053 — Supplies additional GR calculations for reporting.",
  "R069 — Loads stock adjustment values by plant.",
  "R078 — Processes plant-level stock adjustment amounts.",
  "R079 — Validates stock adjustment balances.",
  "R073 — Provides final total used for journal validation and BlackLine reconciliation.",
  "R004 — Loads control value used in Snapshot New calculations.",
  "R080 — Calculates SAP totals using SUMIFS logic.",
  "R081 — Aggregates SAP accrual amounts.",
  "R082 — Summarizes SAP data for reporting.",
  "R083 — Calculates plant-level SAP totals.",
  "R084 — Produces final SAP aggregation values.",
  "R070 — Calculates variance between forecast and SAP actuals.",
  "R085 — Loads accrual values into the reporting summary.",
  "R086 — Aggregates accrual balances by plant.",
  "R087 — Calculates accrual reporting totals.",
  "R088 — Produces final accrual summary values.",
  "R089 — Loads GR values into the reporting summary.",
  "R090 — Aggregates GR balances by plant.",
  "R091 — Produces final GR reporting totals.",
  "R092 — Loads judgemental accrual/re-accrual values.",
  "R102 — Processes judgemental adjustment amounts.",
  "R103 — Aggregates judgemental accrual balances.",
  "R104 — Produces final judgemental accrual totals.",
  "R105 — Processes judgemental re-accrual amounts.",
  "R106 — Aggregates judgemental re-accrual balances.",
  "R107 — Produces final judgemental re-accrual totals.",
  "R093 — Calculates total forecast/accrual position using all components.",
  "R095 — Calculates variance between forecast and actual totals.",
  "R072 — Calculates variance percentage against forecast.",
  "R096 — Validates variance percentage against threshold limits.",
  "R074 — Reconciles accrual, GR, and judgemental totals to BlackLine.",
];

const SAP_INPUT: SourcePreviewTable = {
  fileName: "SAP.xlsx",
  downloadUrl: sapUrl,
  columns: ["Description", "Cost Element", "Cost Element Description", "Cost Center", "Val.in rep.cur."],
  rows: [
    ["Reversal", "31812005", "Distribution 3p Warehousing - Picking", "1067932699", "-129.30"],
    ["Reversal", "31812003", "Distn-3rd Pty Warehousing-Outbound", "1035632699", "-358.36"],
    ["Reversal", "31812010", "Distribution - 3rd Pty Warehousing - Oth", "1035532696", "-439.32"],
    ["Reversal", "31812010", "Distribution - 3rd Pty Warehousing - Oth", "1035632699", "-669.71"],
    ["Reversal", "31812006", "Distn-3pty WH-Waste", "1035632699", "-937.01"],
  ],
  rules: STAGE3_RULES,
};

const SNAPSHOT_NEW_OUTPUT: SourcePreviewTable = {
  fileName: "Snapshot New.xlsx",
  downloadUrl: snapshotNewUrl,
  columns: ["Cost Element", "Cost element descr.", "Cost Center", "Document Header Text", "Val.in rep.cur."],
  rows: [
    ["31812010", "Distribution - 3rd Pty Warehousing - Oth", "1000532699", "W3626_Standard invoice", "2,731.55"],
    ["31812007", "Distn-3pty WH-Admin", "1000532699", "W3626_Standard invoice", "1,171.32"],
    ["31812002", "Distribution-3rd Pty Warehousing-Inbound", "1000532699", "W3626_Standard invoice", "17,836.23"],
    ["31812003", "Distn-3rd Pty Warehousing-Outbound", "1000532699", "W3626_Standard invoice", "13,463.97"],
    ["31812005", "Distribution 3p Warehousing - Picking", "1000532699", "W3626_Standard invoice", "22,625.89"],
  ],
};

/** Stage 3 content for Warehouse JEs (id/title are kept from the static flow). */
export const WAREHOUSE_STAGE3: Partial<StageData> = {
  purpose: "Process SAP data and build plant summaries",
  componentType: "data_extraction",
  extractedCount: 1,
  totalRecords: SAP_TOTAL_RECORDS,
  sources: [
    {
      type: "SHAREDRIVE",
      name: SAP_INPUT.fileName,
      date: "20 Nov 2026",
      status: "success",
    } as SourceFile,
  ],
  sourcePreviewTables: [SAP_INPUT],
  outputPreviewTable: SNAPSHOT_NEW_OUTPUT,
  outputPreviewTables: undefined,
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
  stageReferenceFiles: [
    { fileName: "snapshot.xlsx", downloadUrl: snapshotUrl },
    { fileName: "FC Update.xlsx", downloadUrl: fcUpdateUrl },
  ],
};
