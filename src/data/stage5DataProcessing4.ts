// ── Stage 5 "Data Processing 4" — preview data (5 columns × 5 rows per file) ──
// Source: Excellist/B&M_input_october.xlsx, Excellist/ACCR_estimate.xlsx (inputs)
//         Excellist/ACCR_estimate_output.xlsx (output, shown as ACCR_estimate.xlsx)

export const BM_INPUT_OCTOBER_TOTAL_RECORDS = 194;
export const ACCR_ESTIMATE_TOTAL_RECORDS = 131;

export const BM_INPUT_OCTOBER_COLUMNS = ["Country", "Category", "Plant Code", "Chep ID / Name", "Sum of Cost"];
export const BM_INPUT_OCTOBER_ROWS: string[][] = [
  ["Austria", "HPC / Foods", "A967", "0100786765  Q Logistik GmbH", "236.78"],
  ["Austria", "IC", "A969", "0101022313  TKL Wien", "-1,301.52"],
  ["Austria", "IC", "A971", "0101022314  Daily", "-1,148.40"],
  ["Austria", "IC", "A965", "0101022311  Wiener Kühlhaus - Frigo", "0"],
  ["Austria", "IC", "A970", "0101022310  TKL Bergheim", "-1,148.40"],
];

export const ACCR_ESTIMATE_INPUT_COLUMNS = ["Country", "Final Plant", "Plant Name", "Plant type", "cc"];
export const ACCR_ESTIMATE_INPUT_ROWS: string[][] = [
  ["AT", "A964", "AT-DC Vereinigte Eisfabriken", "DC", "1047733799"],
  ["AT", "A967", "AT-DC EC Logistics", "DC", "1047933799"],
  ["BNL", "A210", "UBF-BE Bornem DC", "DC", "1066133799"],
  ["BNL", "C600", "NL ACR Raamsdonksveer", "DC", "1000533799"],
  ["BNL", "D101", "BE HPC Bornem DC", "DC", "1066233799"],
];

export const ACCR_ESTIMATE_OUTPUT_COLUMNS = ["Final Plant", "Plant Name", "Amount in Loc Curr", "No. Of ACT Days", "Final Amount to be Accrued"];
export const ACCR_ESTIMATE_OUTPUT_ROWS: string[][] = [
  ["A964", "AT-DC Vereinigte Eisfabriken", "0", "17", "0"],
  ["A967", "AT-DC EC Logistics", "236.78", "17", "306.42"],
  ["A210", "UBF-BE Bornem DC", "0", "17", "0"],
  ["C600", "NL ACR Raamsdonksveer", "31,436.26", "17", "40,682.22"],
  ["D101", "BE HPC Bornem DC", "0", "17", "0"],
];

// Excellist/october_month_BL.xlsx — BlackLine journal template.
// Only the line-section columns that are populated (first 5 journal lines).
export const OCTOBER_MONTH_BL_COLUMNS = ["Posting Key*", "Account*", "Amount in Document Currency*", "Cost Center", "Line Item Text*"];
export const OCTOBER_MONTH_BL_ROWS: string[][] = [
  ["40", "41612001", "0", "1047733799", "P01026 ACR AT PAL CHEP A964"],
  ["40", "41612001", "278.56", "1047933799", "P01026 ACR AT PAL CHEP A967"],
  ["40", "41612001", "0", "1066133799", "P01026 ACR BNL PAL CHEP A210"],
  ["40", "41612001", "36,983.84", "1000533799", "P01026 ACR BNL PAL CHEP C600"],
  ["40", "41612001", "0", "1066233799", "P01026 ACR BNL PAL CHEP D101"],
];
