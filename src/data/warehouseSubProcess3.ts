// ── Warehouse Stage 2 · Sub-process 3 (Process Accrual data and generate Snapshot_new) ──
// Input file      : warehouseDocs/Sub_Process_2/accrual_october.xlsx (Sheet2) — all columns, first 5 records
// Reference files : warehouseDocs/Data/FC Update.xlsx
// Output files    : warehouseDocs/Data/Snapshot New.xlsx + Trintech.xlsx (label; file = Excellist/NewWH/Trintech_ (1).xlsx) — all columns, first 5 records
// Rules           : warehouseDocs/rules/Rules_What_File_Does_Final.xlsx (sheet "Rules", 21 rows).
// Download = the original Excel file (bundled by Vite via ?url).
import accrualOctoberUrl from "../../warehouseDocs/Sub_Process_2/accrual_october.xlsx?url";
import fcUpdateUrl from "../../warehouseDocs/Data/FC Update.xlsx?url";
import snapshotNewUrl from "../../warehouseDocs/Data/Snapshot New.xlsx?url";
import trintechUrl from "../../Excellist/NewWH/Trintech_ (1).xlsx?url";
import type { SourceFile, SourcePreviewTable, StageData } from "../types";

// Rule Summary for sub-process 3 — from warehouseDocs/rules/Rules_What_File_Does_Final.xlsx (sheet "Rules").
const SUBPROCESS3_RULES: string[] = [
  "R004 — Snapshot New E271 holds the period (typed 10); Trintech B1 reads it",
  "R080, R081, R082, R083, R084 — Adds the pasted SAP rows (rows 1-266) by period and cost centre: F C600, G E001, H E004, I A211; K = total",
  "R070 — Checks the SAP copy total (L274 = SUM(L2:L266)) equals row 275 total",
  "R085, R086, R087, R088 — F279:F286 = SUMPRODUCT(C600_005!P123:CN130 x (GL = column D) x (row 122 = E271)); F277 = SUM(F279:F286)",
  "R089, R090, R091 — F290 = C600_005!CP123 ... per GL; F288 = SUM(F290:F297)",
  "R092 — E004 judgemental accrual in column H row 299",
  "R102, R103, R104 — F299 = SUM(F301:F308), typed amounts per GL",
  "R105, R106, R107 — F310 = SUM(F312:F319), typed amounts per GL",
  "R093 — F332 = F321 + F310 + F299 + F288 + F277 + F275",
  "R094 — F334 = FC Update!O8 x 1000 (G = O9, H = O11, I = O6)",
  "R071 — Checks the forecast total carried to Snapshot New",
  "R095 — F336 = F334 - F332",
  "R072, R096 — Variance % per plant and total (K340 = K336 / K334)",
  "R074 — Compares Trintech journal total with Snapshot New accrual rows",
  "R003 — Trintech B1 = Snapshot New!E271",
  "R005, R006, R007, R008 — C600_005!B1 = Trintech!B1 (also E001_355, A211_761, E004_204); drives row 1 status ACT / ACR / FVC",
  "R097 — D6 = -SUM(D3:D5); D12 = -SUM(D7:D11) for C600 blocks",
  "R073 — D1 sums all lines; F1 compares balancing total with snapshot L4 (12,41,472.49)",
  "R074 — Journal total vs Snapshot New accrual rows",
  "R098 — Trintech K1 (used by BlackLine header D4)",
  "R099 — Trintech K2 (used by BlackLine header O4)",
];

const ACCRUAL_OCTOBER_INPUT: SourcePreviewTable = {
  fileName: "accrual_october.xlsx",
  downloadUrl: accrualOctoberUrl,
  // All 10 columns of Sheet2 (numeric week headers shown as "Week N"; 2nd "Activity" = code); first 5 of 8 records.
  showAllColumns: true,
  columns: ["Activity", "GL", "Activity Code", "CC", "Week 40", "Week 41", "Week 42", "Week 43", "Week 44", "Total_accrual_october"],
  rows: [
    ["Inbound", "0031812002", "HIN", "1000532699", "0", "0", "0", "24264.68", "20126.33", "44391.01"],
    ["Outbound", "0031812003", "HOUT", "1000532699", "0", "0", "0", "13009.25", "15591.92", "28601.17"],
    ["Storage", "0031812004", "STR", "1000532699", "0", "0", "0", "50114.37", "39875.00", "89989.36"],
    ["Picking", "0031812005", "PCK", "1000532699", "0", "0", "0", "26396.58", "23948.40", "50344.97"],
    ["Waste", "0031812006", "WST", "1000532699", "0", "0", "0", "5430.58", "4629.44", "10060.02"],
  ],
  rules: SUBPROCESS3_RULES,
};

const SNAPSHOT_NEW_OUTPUT: SourcePreviewTable = {
  fileName: "Snapshot New.xlsx",
  downloadUrl: snapshotNewUrl,
  // All 14 columns of sheet "Snapshot New" (A-N); first 5 of 132 records (dates YYYY-MM-DD).
  showAllColumns: true,
  columns: ["Cost Element", "Cost element descr.", "Cost Center", "Period", "Name of offsetting account", "Name", "Ref. document number", "Offsetting acct no.", "Company Code", "User Name", "Document Header Text", "Val.in rep.cur.", "Document Date", "Posting Date"],
  rows: [
    ["31812010", "Distribution - 3rd Pty Warehousing - Oth", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "2,731.55", "2026-10-02", "2026-10-02"],
    ["31812007", "Distn-3pty WH-Admin", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "1,171.32", "2026-10-02", "2026-10-02"],
    ["31812002", "Distribution-3rd Pty Warehousing-Inbound", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "17,836.23", "2026-10-02", "2026-10-02"],
    ["31812003", "Distn-3rd Pty Warehousing-Outbound", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "13,463.97", "2026-10-02", "2026-10-02"],
    ["31812005", "Distribution 3p Warehousing - Picking", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "22,625.89", "2026-10-02", "2026-10-02"],
  ],
  rules: [],
};

const TRINTECH_OUTPUT: SourcePreviewTable = {
  fileName: "Trintech.xlsx",
  downloadUrl: trintechUrl,
  // Label stays "Trintech.xlsx"; data + download = Excellist/NewWH/Trintech_ (1).xlsx
  // (Sheet1, all 9 columns, first 5 of 10 lines; dates YYYY-MM-DD).
  showAllColumns: true,
  columns: ["GL", "GL trin", "Amount", "CC", "Text", "Plant", "BCS costs", "Rev date", "Doc date"],
  rows: [
    ["31812002", "0031812002", "44,391.01", "1000532699", "P1026 ACR BNL C600 Inbound", "C600", "no", "2026-11-01", "2026-10-31"],
    ["31812003", "0031812003", "28,601.17", "1000532699", "P1026 ACR BNL C600 Outbound", "C600", "no", "2026-11-01", "2026-10-31"],
    ["31812005", "0031812005", "50,344.97", "1000532699", "P1026 ACR BNL C600 Picking", "C600", "no", "2026-11-01", "2026-10-31"],
    ["14410020", "0014410020", "-123,337.16", "", "P1026 ACR BNL C600", "C600", "no", "2026-11-01", "2026-10-31"],
    ["31812004", "0031812004", "89,989.36", "1000532699", "P1026 ACR BNL C600 Storage", "C600", "no", "2026-11-01", "2026-10-31"],
  ],
  rules: [],
};

/** Sub-stage id inside the grouped Warehouse "Stage 2" (must not clash with real stage ids). */
export const WAREHOUSE_SUBPROCESS3_ID = 31;

/** Sub-process 3 of the Warehouse "Stage 2: Data Processing" group (same processing flow as the other sub-stages). */
export const WAREHOUSE_SUBPROCESS3: Partial<StageData> = {
  id: WAREHOUSE_SUBPROCESS3_ID,
  purpose: "Process Accrual data and generate Snapshot_new",
  componentType: "data_extraction",
  extractedCount: 1,
  totalRecords: ACCRUAL_OCTOBER_INPUT.rows.length,
  sources: [
    {
      type: "SHAREDRIVE",
      name: ACCRUAL_OCTOBER_INPUT.fileName,
      date: "2026-11-20",
      status: "success",
    } as SourceFile,
  ],
  sourcePreviewTables: [ACCRUAL_OCTOBER_INPUT],
  outputPreviewTable: SNAPSHOT_NEW_OUTPUT,
  outputPreviewTables: [TRINTECH_OUTPUT],
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
  stageReferenceFiles: [{ fileName: "FC Update.xlsx", downloadUrl: fcUpdateUrl }],
};
