// ── Stage 3 "Data Processing 2" — preview data (first 5 records per file) ──
// Input : Docs/October 2026 CHEP Accrual.xlsx
// Output: Docs/Summary by Plant without Copack.xlsx, Docs/Summary by Plant DACH PL.xlsx

// Full-file stats (computed from October 2026 CHEP Accrual.xlsx)
export const CHEP_ACCRUAL_TOTAL_RECORDS = 284535;
export const CHEP_ACCRUAL_UNIQUE_PLANTS = 121;
export const CHEP_ACCRUAL_COUNTRIES = 25;
export const CHEP_ACCRUAL_TOTAL_COST = "2,621,877.19";

export const CHEP_ACCRUAL_COLUMNS = ["Country", "Plant Code", "Category", "Plant Name", "Plant Type", "Total Cost", "pt", "PostingDate"];
export const CHEP_ACCRUAL_ROWS: string[][] = [
  ["Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "0", "1", "20261019"],
  ["Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "0", "1", "20261019"],
  ["Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "0", "1", "20261005"],
  ["Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "0", "1", "20261005"],
  ["Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "0", "1", "20261005"],
];

export const SUMMARY_COLUMNS = ["Country", "Category", "Plant Code", "Plant Name", "Sum of Total Cost"];

export const SUMMARY_WITHOUT_COPACK_ROWS: string[][] = [
  ["Austria", "HPC / Foods", "A967", "0100786765  Q Logistik GmbH", "236.78"],
  ["Austria", "IC", "A969", "0101022313  TKL Wien", "-1,301.52"],
  ["Austria", "IC", "A971", "0101022314  Daily", "-1,148.40"],
  ["Austria", "IC", "A965", "0101022311  Wiener Kühlhaus - Frigo", "0"],
  ["Austria", "IC", "A970", "0101022310  TKL Bergheim", "-1,148.40"],
];

export const SUMMARY_DACH_PL_ROWS: string[][] = [
  ["Germany", "Foods", "A517", "Unilever - DC Heilbronn", "0"],
  ["Germany", "Foods", "REPACK", "IdealPack", "0"],
  ["Germany", "Foods", "REPACK", "Unilever - DSC", "0"],
  ["Germany", "HPC", "C400", "", "0"],
  ["Germany", "HPC / Foods", "MSO", "Unilever Shop - MSO Hamburg", "0"],
];
