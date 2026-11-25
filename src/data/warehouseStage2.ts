// ── Warehouse Stage 2 (Data Processing 1) ─────────────────────────────────────
// Input file  : warehouseDocs/2025 Actuals PY.xlsx (Sheet1) — all 84 columns, first 5 records.
// Output file : warehouseDocs/C600_005.xlsx (Sheet1) — all 10 columns, first 5 records.
// Download = the original Excel file (bundled by Vite via ?url).
import actualsPyUrl from "../../warehouseDocs/2025 Actuals PY.xlsx?url";
import c600Url from "../../warehouseDocs/C600_005.xlsx?url";
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

const ACTUALS_PY_INPUTS: SourcePreviewTable[] = [
  {
    fileName: "2025 Actuals PY.xlsx",
    downloadUrl: actualsPyUrl,
    // All 84 columns of Sheet1 (A Description, B Code, I-CL weekly Input/Estimated + monthly ACT); first 5 records.
    showAllColumns: true,
    columns: ["Description", "Code", "M1 Wk 1 (Input)", "M1 Wk 2 (Input)", "M1 Wk 3 (Input)", "M1 Wk 4 (Input)", "M1 Wk 5 (Input)", "Month 1 ACT", "M2 Wk 5 (Input)", "M2 Wk 6 (Input)", "M2 Wk 7 (Input)", "M2 Wk 8 (Input)", "M2 Wk 9 (Input)", "Month 2 ACT", "M3 Wk 9 (Input)", "M3 Wk 10 (Input)", "M3 Wk 11 (Input)", "M3 Wk 12 (Input)", "M3 Wk 13 (Input)", "M3 Wk 14 (Input)", "Month 3 ACT", "M4 Wk 13 (Input)", "M4 Wk 14 (Input)", "M4 Wk 15 (Estimated)", "M4 Wk 16 (Estimated)", "M4 Wk 17 (Estimated)", "M4 Wk 18 (Estimated)", "Month 4 ACT", "M5 Wk 17 (Estimated)", "M5 Wk 18 (Estimated)", "M5 Wk 19 (Estimated)", "M5 Wk 20 (Estimated)", "M5 Wk 21 (Estimated)", "M5 Wk 22 (Input)", "Month 5 ACT", "M6 Wk 22 (Input)", "M6 Wk 23 (Input)", "M6 Wk 24 (Input)", "M6 Wk 25 (Input)", "M6 Wk 26 (Input)", "M6 Wk 27 (Input)", "Month 6 ACT", "M7 Wk 26 (Input)", "M7 Wk 27 (Input)", "M7 Wk 28 (Input)", "M7 Wk 29 (Input)", "M7 Wk 30 (Input)", "M7 Wk 31 (Input)", "Month 7 ACT", "M8 Wk 31 (Input)", "M8 Wk 32 (Input)", "M8 Wk 33 (Input)", "M8 Wk 34 (Input)", "M8 Wk 35 (Input)", "M8 Wk 36 (Input)", "Month 8 ACT", "M9 Wk 35 (Input)", "M9 Wk 36 (Input)", "M9 Wk 37 (Input)", "M9 Wk 38 (Input)", "M9 Wk 39 (Input)", "M9 Wk 40 (Input)", "Month 9 ACT", "M10 Wk 39 (Estimated)", "M10 Wk 40 (Input)", "M10 Wk 41 (Input)", "M10 Wk 42 (Input)", "M10 Wk 43 (Input)", "M10 Wk 44 (Input)", "Month 10 ACT", "M11 Wk 44 (Estimated)", "M11 Wk 45 (Estimated)", "M11 Wk 46 (Estimated)", "M11 Wk 47 (Estimated)", "M11 Wk 48 (Estimated)", "M11 Wk 49 (Input)", "Month 11 ACT", "M12 Wk 48 (Input)", "M12 Wk 49 (Input)", "M12 Wk 50 (Input)", "M12 Wk 51 (Input)", "M12 Wk 52 (Input)", "M12 Wk 53 (Input)", "Month 12 ACT"],
    rows: [
      ["TOTAL", "", "153497.60", "166536.50", "162893.53", "188879.25", "194192.46", "865999.33", "0", "175935.02", "170375.99", "89613.71", "117475.71", "553400.43", "0", "157276.37", "171798.61", "159071.21", "156072.63", "34776.07", "678994.89", "0", "139763.46", "173771.06", "191606.45", "158398.62", "97102.39", "760641.98", "", "64734.93", "157323.01", "191339.31", "189401.84", "178639.53", "781438.62", "0", "184733.31", "181777.76", "215270.18", "191795.48", "35990.68", "809567.43", "0", "143962.73", "200398.56", "182413.18", "176719.61", "144175.35", "847669.44", "36043.84", "149538.76", "166279.98", "194158.72", "197067.39", "0", "743088.69", "0", "173533.70", "213326.84", "203247.90", "172276.96", "86761.77", "849147.18", "0", "130142.66", "212452.29", "190362.30", "166339.93", "194681.34", "893978.52", "0", "200607.92", "196900.58", "209951.15", "228856.59", "0", "836316.24", "", "152645.96", "198157.70", "138059.20", "121285.17", "85582.85", "695730.88"],
      ["1000532599 pallet handling", "HIN", "2240", "3219", "3851", "4708", "4790", "18808", "0", "4724", "4119", "3802", "3498", "16143", "0", "3618", "4558", "4279", "5130", "818", "18403", "0", "3017", "4387", "3190", "2759", "2572.20", "15925.20", "0", "1714.80", "3553", "4625", "5114", "3991", "18997.80", "0", "4619", "3417", "4729", "3965", "806.40", "17536.40", "0", "3225.60", "4087", "3882", "3847", "3056", "18097.60", "764", "3705", "2599", "2888", "2959", "0", "12915", "0", "2402", "3469", "3415", "3679", "1181.60", "14146.60", "0", "1772.40", "3768", "4099", "4192", "4236", "18067.40", "0", "4691", "5207", "5428", "4984", "0", "20310", "", "3097", "5785", "4665", "1576", "1355.40", "16478.40"],
      ["1000532599 pallet labeling", "OTH", "390", "786", "1043", "757", "1009", "3985", "0", "809", "1103", "0", "0", "1912", "0", "0", "1805", "934", "900", "117", "3756", "0", "423", "550", "76", "241", "42.60", "1332.60", "0", "28.40", "29", "281", "123", "236", "697.40", "0", "238", "39", "162", "121", "28.40", "588.40", "0", "113.60", "190", "306", "66", "108.80", "784.40", "27.20", "183", "182", "129", "103", "0", "624.20", "0", "269", "136", "185", "175", "64.40", "829.40", "0", "96.60", "178", "229", "183", "14", "700.60", "0", "65", "376", "149", "227", "0", "817", "", "81", "231", "96", "22", "93.60", "523.60"],
      ["1000532599 extra work inbound (re-stacking)", "WST", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "", "0", "0", "0", "0", "0", "0"],
      ["1000532599 picking full pallets", "HOUT", "3356", "3604", "4544", "4595", "4733", "20832", "0", "3050", "4494", "3115", "3838", "14497", "0", "4006", "3563", "3120", "4331", "961", "15981", "0", "2406", "3163", "4021", "2329", "1888.20", "13807.20", "0", "1258.80", "2952", "3688", "3083", "3268", "14249.80", "0", "3937", "4831", "3389", "4204", "687.60", "17048.60", "0", "2750.40", "3385", "3604", "3397", "2793.60", "15930", "698.40", "2704", "3714", "3382", "3635", "0", "14133.40", "0", "3959", "3665", "2932", "4910", "1640.40", "17106.40", "0", "2460.60", "3148", "3952", "3643", "4389", "17592.60", "0", "4350", "4185", "3890", "4752", "0", "17177", "", "3225", "3662", "3612", "2314", "1793.40", "14606.40"],
    ],
    rules: STAGE2_RULES,
  },
];

const C600_PLANT_OUTPUT: SourcePreviewTable = {
  fileName: "C600_005.xlsx",
  downloadUrl: c600Url,
  // All 10 columns of Sheet1 (headers as in the Excel file); first 5 records.
  showAllColumns: true,
  columns: ["GL", "Activity code", "Activity Description", "Tariff 2025", "Tariff 2026", "Tariff", "week 41", "week 42", "week 43", "week 44"],
  rows: [
    ["31812002", "HIN", "1000532599 pallet handling", "4.38", "4.75", "4.56", "19499.17", "22962.84", "24264.68", "20126.33"],
    ["31812010", "OTH", "1000532599 pallet labeling", "0.81", "0.87", "0.84", "24.49", "0.87", "88.33", "12.24"],
    ["31812006", "WST", "1000532599 extra work inbound (re-stacking)", "0.13", "0.14", "0.13", "0", "0", "0", "0"],
    ["31812003", "HOUT", "1000532599 picking full pallets", "3.27", "3.55", "3.41", "12590.06", "11108.66", "13009.25", "15591.92"],
    ["31812005", "PCK", "1000532599 picking cases", "0.18", "0.20", "0.19", "8129.96", "5673.20", "9042.14", "8126.61"],
  ],
};

/** Stage 2 content for Warehouse JEs (id/title are kept from the static flow). */
export const WAREHOUSE_STAGE2: Partial<StageData> = {
  componentType: "data_extraction",
  extractedCount: ACTUALS_PY_INPUTS.length,
  totalRecords: ACTUALS_PY_INPUTS.reduce((sum, t) => sum + t.rows.length, 0),
  sources: ACTUALS_PY_INPUTS.map(
    (table): SourceFile => ({
      type: "SHAREDRIVE",
      name: table.fileName,
      date: "2026-11-20",
      status: "success",
    }),
  ),
  sourcePreviewTables: ACTUALS_PY_INPUTS,
  outputPreviewTable: C600_PLANT_OUTPUT,
  outputPreviewTables: undefined,
  extractedFieldsBySource: undefined,
  extractedFields: undefined,
};
