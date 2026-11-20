// ── Warehouse Stage 2 (Data Processing 1) ─────────────────────────────────────
// Input files : warehouseDocs/Data/UHPC overview weekly figures 2026-Week41/42/43 1.xlsx
//               (sheet "Weekly Overview")
// Output file : warehouseDocs/Data/C600_005 Plant.xlsx (sheet "C600_005")
// Preview = first 5 activity rows x 5 columns taken from each file.
// Download = the original Excel file (bundled by Vite via ?url).
import uhpcWeek41Url from "../../warehouseDocs/Data/UHPC overview weekly figures 2026-Week41 1.xlsx?url";
import uhpcWeek42Url from "../../warehouseDocs/Data/UHPC overview weekly figures 2026-Week42 1.xlsx?url";
import uhpcWeek43Url from "../../warehouseDocs/Data/UHPC overview weekly figures 2026-Week43 1.xlsx?url";
import c600PlantUrl from "../../warehouseDocs/Data/C600_005 Plant.xlsx?url";
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
    fileName: "UHPC overview weekly figures 2026-Week41 1.xlsx",
    downloadUrl: uhpcWeek41Url,
    columns: ["Activity", "Description", "2026 Week 39", "2026 Week 40", "2026 Week 41"],
    rows: [
      ["400010 - Inbound", "1000532599 pallet handling", "4315", "3940", "4104"],
      ["400010 - Inbound", "1000532599 pallet handling (BE)", "4315", "3940", "4104"],
      ["400010 - Inbound", "1000532599 pallet labeling", "144", "45", "28"],
      ["400010 - Inbound", "1000532599 pallet labeling (BE)", "144", "45", "28"],
      ["400010 - Inbound", "1000532599 extra work inbound (re-stacking)", "0", "0", "0"],
    ],
    rules: STAGE2_RULES,
  },
  {
    fileName: "UHPC overview weekly figures 2026-Week42 1.xlsx",
    downloadUrl: uhpcWeek42Url,
    columns: ["Activity", "Description", "2026 Week 40", "2026 Week 41", "2026 Week 42"],
    rows: [
      ["400010 - Inbound", "1000532599 pallet handling", "3940", "4104", "4833"],
      ["400010 - Inbound", "1000532599 pallet handling (BE)", "3940", "4104", "4833"],
      ["400010 - Inbound", "1000532599 pallet labeling", "45", "28", "1"],
      ["400010 - Inbound", "1000532599 pallet labeling (BE)", "45", "28", "1"],
      ["400010 - Inbound", "1000532599 extra work inbound (re-stacking)", "0", "0", "0"],
    ],
    rules: STAGE2_RULES,
  },
  {
    fileName: "UHPC overview weekly figures 2026-Week43 1.xlsx",
    downloadUrl: uhpcWeek43Url,
    columns: ["Activity", "Description", "2026 Week 41", "2026 Week 42", "2026 Week 43"],
    rows: [
      ["400010 - Inbound", "1000532599 pallet handling", "4104", "4833", "5107"],
      ["400010 - Inbound", "1000532599 pallet handling (BE)", "4104", "4833", "5107"],
      ["400010 - Inbound", "1000532599 pallet labeling", "28", "1", "101"],
      ["400010 - Inbound", "1000532599 pallet labeling (BE)", "28", "1", "101"],
      ["400010 - Inbound", "1000532599 extra work inbound (re-stacking)", "0", "0", "0"],
    ],
    rules: STAGE2_RULES,
  },
];

const C600_PLANT_OUTPUT: SourcePreviewTable = {
  fileName: "C600_005 Plant.xlsx",
  downloadUrl: c600PlantUrl,
  columns: ["Description", "Code", "Week 41", "Week 42", "Week 43"],
  rows: [
    ["1000532599 pallet handling", "HIN", "3768", "4099", "4192"],
    ["1000532599 pallet labeling", "OTH", "178", "229", "183"],
    ["1000532599 extra work inbound (re-stacking)", "WST", "0", "0", "0"],
    ["1000532599 picking full pallets", "HOUT", "3148", "3952", "3643"],
    ["1000532599 picking cases", "PCK", "46471", "57894", "37114"],
  ],
};

/** Stage 2 content for Warehouse JEs (id/title are kept from the static flow). */
export const WAREHOUSE_STAGE2: Partial<StageData> = {
  componentType: "data_extraction",
  extractedCount: UHPC_INPUTS.length,
  totalRecords: 233 + 234 + 238,
  sources: UHPC_INPUTS.map(
    (table): SourceFile => ({
      type: "SHAREDRIVE",
      name: table.fileName,
      date: "20 Nov 2026",
      status: "success",
    }),
  ),
  sourcePreviewTables: UHPC_INPUTS,
  outputPreviewTable: C600_PLANT_OUTPUT,
  outputPreviewTables: undefined,
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
};
