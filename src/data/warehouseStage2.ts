// ── Warehouse Stage 2 (Data Processing 1) ─────────────────────────────────────
// Input file  : Excellist/NewWH/UHPC overview weekly figures 2026-Week43.xlsx (Sheet1, 21 activity rows)
// Output file : Excellist/NewWH/C600_005.xlsx (Sheet1, 17 rows)
// Preview = ALL activity rows x 5 columns from each file; DocumentPreview pages them 5 rows at a time.
// Download = the original Excel file (bundled by Vite via ?url).
import uhpcWeek43Url from "../../Excellist/NewWH/UHPC overview weekly figures 2026-Week43.xlsx?url";
import c600Url from "../../Excellist/NewWH/C600_005.xlsx?url";
import type { SourceFile, SourcePreviewTable, StageData } from "../types";

// Rule Summary for Stage 2 — from warehouseDocs/Data/Stage-1.xlsx (sheet "Rules Summary").
const STAGE2_RULES: string[] = [
  "R001 — Confirms the C600 weekly input files are available.",
  "R012 — Reads volume and tariff data from the Weekly Overview sheet, excluding Belgium (BE) lines.",
  "R014 — Checks whether tariffs from the Weekly Overview match the tariffs in C600_005.",
  "R019 — Copies weekly volumes into C600_005 rows 33–53.",
  "R015 — Validates that the input total matches the total recorded in C600_005.",
  "R041 — Updates the Accrual Invoice value in C600_005 using the input total.",
  "R005 — Pulls the period/week information from the Trintech sheet into the C600 Plant file.",
  "R013 — Reads activity codes and tariff information from the C600 Plant tab.",
  "R016 — Calculates the current-month percentage for weeks split across two months.",
  "R017 — Calculates the next-month percentage for weeks split across two months.",
  "R018 — Calculates costs using tariff × volume and derives the weekly total.",
  "R052 — Loads GR (Goods Receipt) values from SAP into the accrual calculation.",
  "R033 — Calculates variance as Accrual Invoice − GR.",
  "R054 — Calculates accrual amounts when GR has not yet been received.",
  "R045 — Creates the ACR (accrual) aggregation values used for reporting.",
  "R046 — Calculates the final accrual reporting amount from intermediate columns.",
  "R085 — Transfers accrual data from C600 Plant to Snapshot New.",
  "R089 — Transfers GR-related data from C600 Plant to Snapshot New.",
  "R102 — Loads C600 judgemental accrual values entered in Snapshot New.",
  "R105 — Uses judgemental accrual adjustments maintained in Snapshot New.",
];

const UHPC_INPUTS: SourcePreviewTable[] = [
  {
    fileName: "UHPC overview weekly figures 2026-Week43.xlsx",
    downloadUrl: uhpcWeek43Url,
    columns: ["Activity", "Activity Description", "Week 41", "Week 42", "Week 43"],
    rows: [
      ["400010 - Inbound", "1000532599 pallet handling", "4104", "4833", "5107"],
      ["400010 - Inbound", "1000532599 pallet labeling", "28", "1", "101"],
      ["400010 - Inbound", "1000532599 extra work inbound (re-stacking)", "0", "0", "0"],
      ["400010 - Inbound", "1000532599 forecast deviation inbound", "0", "0", "0"],
      ["400015 - Outbound", "1000532599 picking full pallets", "3544", "3127", "3662"],
      ["400014 - Orderpicking", "1000532599 picking cases", "41266", "28796", "45896"],
      ["400014 - Orderpicking", "1000532599 (automatic) layer picking", "110440", "67485", "125177"],
      ["400015 - Outbound", "1000532599 forecast deviation outbound", "0", "0", "0"],
      ["400028 - Storage", "1000532799 storage euro pallets", "22108", "23400", "24381"],
      ["400028 - Storage", "1000532799 storage industrial pallets", "673", "544", "490"],
      ["400028 - Storage", "1000532799 storage ADR euro pallets", "4398", "4542", "4507"],
      ["400028 - Storage", "1000532799 storage ADR industrial pallets", "11", "10", "9"],
      ["400028 - Storage", "1000532799 Minimum storage threshold (24.938) Non ADR", "0", "0", "0"],
      ["400028 - Storage", "1000532799 Minimum storage threshold (24.938) ADR", "0", "0", "0"],
      ["400007 - Employee hours", "1000532599 warehouse employees", "110.8", "83.9", "92.65"],
      ["400007 - Employee hours", "1000532599 retourverwerking", "0.58", "0", "0.42"],
      ["400007 - Employee hours", "Fixed admin costs: stock control", "1", "1", "1"],
      ["400007 - Employee hours", "1000532599 customer service cost Amazon", "0", "0", "0"],
      ["400023 - Rest warehouse", "1000532599 Internal move - subcollation", "0", "0", "0"],
      ["400007 - Emplyee hours", "1000532599 - alloceren incomplete pallets - 2,5h (akk. Martijn vd Helm)", "2.5", "2.5", "2.5"],
      ["400023 - Rest warehouse", "1000532599 - Gas measurements", "0", "0", "0"],
    ],
    rules: STAGE2_RULES,
  },
];

const C600_PLANT_OUTPUT: SourcePreviewTable = {
  fileName: "C600_005.xlsx",
  downloadUrl: c600Url,
  columns: ["Activity Code", "Activity Description", "Week 41", "Week 42", "Week 43"],
  rows: [
    ["HIN", "1000532599 pallet handling", "19499.17", "22962.84", "24264.68"],
    ["OTH", "1000532599 pallet labeling", "24.49", "0.87", "88.33"],
    ["WST", "1000532599 extra work inbound (re-stacking)", "0", "0", "0"],
    ["HOUT", "1000532599 picking full pallets", "12590.06", "11108.66", "13009.25"],
    ["PCK", "1000532599 picking cases", "8129.96", "5673.20", "9042.14"],
    ["PCK", "1000532599 (automatic) layer picking", "15311.31", "9356.07", "17354.44"],
    ["PCK", "1000532599 Extra costs due to picking fust AH", "0", "0", "0"],
    ["STR", "1000532799 storage euro pallets", "33968.89", "35954.04", "37461.35"],
    ["STR", "1000532799 storage industrial pallets", "1378.52", "1114.28", "1003.67"],
    ["STR", "1000532799 storage ADR euro pallets", "11337.41", "11708.62", "11618.39"],
    ["STR", "1000532799 storage ADR industrial pallets", "37.83", "34.39", "30.95"],
    ["ADM", "Fixed admin costs: stock control Henk Speelman", "915.89", "915.89", "915.89"],
    ["WST", "1000532599 warehouse employees", "6465.11", "4895.51", "5406.07"],
    ["WST", "1000532599 retourverwerking", "33.84", "0", "24.51"],
    ["OTH", "Additional costs", "144.39", "144.39", "144.39"],
    ["OTH", "Internal move - subcollation", "0", "0", "0"],
    ["OTH", "transportkosten Amazon", "0", "0", "0"],
  ],
};

/** Stage 2 content for Warehouse JEs (id/title are kept from the static flow). */
export const WAREHOUSE_STAGE2: Partial<StageData> = {
  componentType: "data_extraction",
  extractedCount: UHPC_INPUTS.length,
  totalRecords: UHPC_INPUTS.reduce((sum, t) => sum + t.rows.length, 0),
  sources: UHPC_INPUTS.map(
    (table): SourceFile => ({
      type: "SHAREDRIVE",
      name: table.fileName,
      date: "2026-11-20",
      status: "success",
    }),
  ),
  sourcePreviewTables: UHPC_INPUTS,
  outputPreviewTable: C600_PLANT_OUTPUT,
  outputPreviewTables: undefined,
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
};
