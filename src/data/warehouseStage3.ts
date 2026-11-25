// ── Warehouse Stage 3 (Data Processing 2) ─────────────────────────────────────
// Input file      : Excellist/NewWH/SAP_data.xlsx (Sheet1) — all 18 columns, first 5 records
// Output files    : warehouseDocs/Sub_Process_2/accrual_october.xlsx + accrual_sept.xlsx (Sheet2) — all columns, first 5 records
// Reference files : none (FC Update.xlsx moved to sub-process 3, warehouseSubProcess3.ts)
// Download = the original Excel file (bundled by Vite via ?url).
import sapUrl from "../../Excellist/NewWH/SAP_data.xlsx?url";
import accrualOctoberUrl from "../../warehouseDocs/Sub_Process_2/accrual_october.xlsx?url";
import accrualSeptUrl from "../../warehouseDocs/Sub_Process_2/accrual_sept.xlsx?url";
import type { SourceFile, SourcePreviewTable, StageData } from "../types";

// Rule Summary for sub-process 2 — from warehouseDocs/rules/SAP_Rules.xlsx (sheet "Rules", 10 rules).
const STAGE3_RULES: string[] = [
  "R030 — Pastes the SAP report S_ALR_87013611 (October, BNL cost centres) into the MEF sheet SAP",
  "R036 — Adds the October rows below last month's rows in SAP (history is never deleted)",
  "R038 — Fills SAP column Q (Plant) = VLOOKUP(Cost Center, mapping) → C600 for 1000532699",
  "R032 — Checks SAP N1 = SUBTOTAL(9, column N) for period 10 = SAP report total (3,14,803.93)",
  "R052 — Sums SAP column N for C600 lines with header text W{week}26 × WK% → C600_005 row 170 (GR): week 40 41,979.25, week 41 1,12,659.34, week 42 1,06,399.50",
  "R041 — Fills C600_005 row 169 (Accrual inv). The rule says input total, but the file holds the pasted earlier estimate (last year's volume × column F tariff), for example week 41 1,03,037.70",
  "R033 — C600_005 row 183 = row 169 − row 170. The rule says must be 0, but the file shows the estimate vs the invoice (week 41 −9,621.64)",
  "R054 — C600_005 rows 123–130 = IF(row 170 > 0, 0, SUMIF(activity code, cost)) → weeks 43–44 accrued",
  "R045 — C600_005 column CO = SUMIFS(accrual row, row 1 = ACR) → current accrual. The rule's formula is a placeholder and needs fixing.",
  "R089 — Snapshot New F290:F297 = C600_005 CP by GL, F288 = SUM → re-accrual row (0 for C600)",
];

const SAP_INPUT: SourcePreviewTable = {
  fileName: "SAP_data.xlsx",
  downloadUrl: sapUrl,
  // All 18 columns of Sheet1; first 5 of 69 records (dates shown as YYYY-MM-DD).
  showAllColumns: true,
  columns: ["Cost Element", "Cost Element Description", "Cost Center", "Period", "Name of offsetting account", "Name", "RefDocNo", "Offst.acct", "CoCd", "User Name", "Header Text", "Val.in rep.cur.", "Doc. Date", "Postg Date", "Plant", "Plant_BCS", "Year", "ACT YEAR"],
  rows: [
    ["31812010", "Distribution - 3rd Pty Warehousing - Oth", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "2,731.55", "2026-10-02", "2026-10-02", "C600", "C600", "2026", "2026"],
    ["31812007", "Distn-3pty WH-Admin", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "1,171.32", "2026-10-02", "2026-10-02", "C600", "C600", "2026", "2026"],
    ["31812002", "Distribution-3rd Pty Warehousing-Inbound", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "17,836.23", "2026-10-02", "2026-10-02", "C600", "C600", "2026", "2026"],
    ["31812003", "Distn-3rd Pty Warehousing-Outbound", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "13,463.97", "2026-10-02", "2026-10-02", "C600", "C600", "2026", "2026"],
    ["31812005", "Distribution 3p Warehousing - Picking", "1000532699", "10", "AP GR/IR Ssp 3 Pty", "", "5064016894", "14221001", "2611", "THAMILA_P500", "W3626_Standard invoice", "22,625.89", "2026-10-02", "2026-10-02", "C600", "C600", "2026", "2026"],
  ],
  rules: STAGE3_RULES,
};

const ACCRUAL_OCTOBER_OUTPUT: SourcePreviewTable = {
  fileName: "accrual_october.xlsx",
  downloadUrl: accrualOctoberUrl,
  // All 10 columns of Sheet2 (numeric week headers 40-44 shown as "Week N"; 2nd "Activity" = code); first 5 of 8 records.
  showAllColumns: true,
  columns: ["Activity", "GL", "Activity Code", "CC", "Week 40", "Week 41", "Week 42", "Week 43", "Week 44", "Total_accrual_october"],
  rows: [
    ["Inbound", "0031812002", "HIN", "1000532699", "0", "0", "0", "24264.68", "20126.33", "44391.01"],
    ["Outbound", "0031812003", "HOUT", "1000532699", "0", "0", "0", "13009.25", "15591.92", "28601.17"],
    ["Storage", "0031812004", "STR", "1000532699", "0", "0", "0", "50114.37", "39875.00", "89989.36"],
    ["Picking", "0031812005", "PCK", "1000532699", "0", "0", "0", "26396.58", "23948.40", "50344.97"],
    ["Waste", "0031812006", "WST", "1000532699", "0", "0", "0", "5430.58", "4629.44", "10060.02"],
  ],
};

const ACCRUAL_SEPT_OUTPUT: SourcePreviewTable = {
  fileName: "accrual_sept.xlsx",
  downloadUrl: accrualSeptUrl,
  // All 9 columns of Sheet2 (numeric week headers 36-40 shown as "Week N"; 2nd "Activity" = code); first 5 of 8 records.
  showAllColumns: true,
  columns: ["Activity", "GL", "Activity Code", "CC", "Week 36", "Week 37", "Week 38", "Week 39", "Week 40"],
  rows: [
    ["Inbound", "0031812002", "HIN", "1000532699", "0", "0", "0", "0", "0"],
    ["Outbound", "0031812003", "HOUT", "1000532699", "0", "0", "0", "0", "0"],
    ["Storage", "0031812004", "STR", "1000532699", "0", "0", "0", "0", "0"],
    ["Picking", "0031812005", "PCK", "1000532699", "0", "0", "0", "0", "0"],
    ["Waste", "0031812006", "WST", "1000532699", "0", "0", "0", "0", "0"],
  ],
};

/** Stage 3 content for Warehouse JEs (id/title are kept from the static flow). */
export const WAREHOUSE_STAGE3: Partial<StageData> = {
  purpose: "Process SAP data and build plant summaries",
  componentType: "data_extraction",
  extractedCount: 1,
  totalRecords: SAP_INPUT.rows.length,
  sources: [
    {
      type: "SHAREDRIVE",
      name: SAP_INPUT.fileName,
      date: "2026-11-20",
      status: "success",
    } as SourceFile,
  ],
  sourcePreviewTables: [SAP_INPUT],
  outputPreviewTable: ACCRUAL_OCTOBER_OUTPUT,
  outputPreviewTables: [ACCRUAL_SEPT_OUTPUT],
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
  // Reference files removed per user (FC Update.xlsx now shown in sub-process 3)
  stageReferenceFiles: undefined,
};
