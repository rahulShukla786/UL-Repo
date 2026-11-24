// ── Stage 5 "Data Processing 4" (Build ACCR estimate from B&M October input) ──
// Source: Excellist/B&M_input_october.xlsx, Excellist/ACCR_estimate.xlsx (inputs)
//         Excellist/ACCR_estimate_output.xlsx (output, shown as ACCR_estimate.xlsx)
//         Excellist/october_month_BL.xlsx (output)
// Every preview: all columns with data, first 5 rows;
// Download = the original Excel file (bundled by Vite via ?url).
import bmInputOctoberUrl from "../../Excellist/B&M_input_october.xlsx?url";
import accrEstimateUrl from "../../Excellist/ACCR_estimate.xlsx?url";
import octoberMonthBlUrl from "../../Excellist/october_month_BL.xlsx?url";
import accrEstimateOutputUrl from "../../Excellist/ACCR_estimate_output.xlsx?url";

export const BM_INPUT_OCTOBER_DOWNLOAD_URL = bmInputOctoberUrl;
export const ACCR_ESTIMATE_INPUT_DOWNLOAD_URL = accrEstimateUrl;
export const OCTOBER_MONTH_BL_DOWNLOAD_URL = octoberMonthBlUrl;
export const ACCR_ESTIMATE_OUTPUT_DOWNLOAD_URL = accrEstimateOutputUrl;

export const BM_INPUT_OCTOBER_TOTAL_RECORDS = 194;
export const ACCR_ESTIMATE_TOTAL_RECORDS = 131;
export const OCTOBER_MONTH_BL_TOTAL_RECORDS = 133;

export const BM_INPUT_OCTOBER_COLUMNS = ["Country", "Category", "Plant Code", "Chep ID / Name", "Sum of Cost"];
export const BM_INPUT_OCTOBER_ROWS: string[][] = [
  ["Austria", "HPC / Foods", "A967", "0100786765  Q Logistik GmbH", "236.78"],
  ["Austria", "IC", "A969", "0101022313  TKL Wien", "-1,301.52"],
  ["Austria", "IC", "A971", "0101022314  Daily", "-1,148.40"],
  ["Austria", "IC", "A965", "0101022311  Wiener Kühlhaus - Frigo", "0"],
  ["Austria", "IC", "A970", "0101022310  TKL Bergheim", "-1,148.40"],
];

export const ACCR_ESTIMATE_INPUT_COLUMNS = ["Country", "Final Plant", "Plant Name", "Plant type", "cc", "GL"];
export const ACCR_ESTIMATE_INPUT_ROWS: string[][] = [
  ["AT", "A964", "AT-DC Vereinigte Eisfabriken", "DC", "1047733799", "41612001"],
  ["AT", "A967", "AT-DC EC Logistics", "DC", "1047933799", "41612001"],
  ["BNL", "A210", "UBF-BE Bornem DC", "DC", "1066133799", "41612001"],
  ["BNL", "C600", "NL ACR Raamsdonksveer", "DC", "1000533799", "41612001"],
  ["BNL", "D101", "BE HPC Bornem DC", "DC", "1066233799", "41612001"],
];

// Excellist/ACCR_estimate_output.xlsx — 21 columns with data (FC PY amount is empty); Excel date serials shown as dates
export const ACCR_ESTIMATE_OUTPUT_COLUMNS = ["Country", "Final Plant", "Plant Name", "Plant type", "cc", "GL", "Amount in Loc Curr", "Year", "Month", "Date of ACT", "Key to calendar", "First Day of Month", "Last Day of Month", "No. Of ACT Days", "No. of Days to be Accrued", "FX", "Amount in EUR", "Final Amount to be Accrued", "Period", "Item Text", "One-offs_EUR"];
export const ACCR_ESTIMATE_OUTPUT_ROWS: string[][] = [
  ["AT", "A964", "AT-DC Vereinigte Eisfabriken", "DC", "1047733799", "41612001", "0", "2026", "10", "2026-10-25", "202610", "2026-10-01", "2026-10-31", "17", "5", "1", "0", "0", "P01026", "P01026 ACR AT PAL CHEP A964", ""],
  ["AT", "A967", "AT-DC EC Logistics", "DC", "1047933799", "41612001", "236.78", "2026", "10", "2026-10-25", "202610", "2026-10-01", "2026-10-31", "17", "5", "1", "236.78", "306.42", "P01026", "P01026 ACR AT PAL CHEP A967", ""],
  ["BNL", "A210", "UBF-BE Bornem DC", "DC", "1066133799", "41612001", "0", "2026", "10", "2026-10-25", "202610", "2026-10-01", "2026-10-31", "17", "5", "1", "0", "0", "P01026", "P01026 ACR BNL PAL CHEP A210", ""],
  ["BNL", "C600", "NL ACR Raamsdonksveer", "DC", "1000533799", "41612001", "31,436.26", "2026", "10", "2026-10-25", "202610", "2026-10-01", "2026-10-31", "17", "5", "1", "31,436.26", "40,682.22", "P01026", "P01026 ACR BNL PAL CHEP C600", ""],
  ["BNL", "D101", "BE HPC Bornem DC", "DC", "1066233799", "41612001", "0", "2026", "10", "2026-10-25", "202610", "2026-10-01", "2026-10-31", "17", "5", "1", "0", "0", "P01026", "P01026 ACR BNL PAL CHEP D101", ""],
];

// Excellist/october_month_BL.xlsx — BlackLine journal template (header row 3).
// All columns that contain data (19 of 101 template columns), first 5 rows (H + journal lines).
export const OCTOBER_MONTH_BL_COLUMNS = ["Record Type", "JE Classification*", "Document Type (S)*", "Document Date*", "Posting Date*", "Document Header Text*", "Header Company Code*", "Document Currency*", "Translation Date*", "Reversal Reason", "Reversal Date", "Calculate Tax ?*", "Posting Key*", "Account*", "Amount in Document Currency*", "Cost Center", "Line Item Text*", "Plant Code", "Final Plant"];
export const OCTOBER_MONTH_BL_ROWS: string[][] = [
  ["H", "ACCRUALS", "Y1", "2026-11-19", "2026-11-19", "P1026 ACR  PAL CHEP", "2611", "EUR", "2026-11-19", "5", "2026-12-01", "N", "", "", "", "", "", "", ""],
  ["L", "", "", "", "", "", "", "", "", "", "", "", "40", "41612001", "0", "1047733799", "P01026 ACR AT PAL CHEP A964", "A964", "A964"],
  ["L", "", "", "", "", "", "", "", "", "", "", "", "40", "41612001", "278.56", "1047933799", "P01026 ACR AT PAL CHEP A967", "A967", "A967"],
  ["", "", "", "", "", "", "", "", "", "", "", "", "40", "41612001", "0", "1066133799", "P01026 ACR BNL PAL CHEP A210", "A210", "A210/D101"],
  ["L", "", "", "", "", "", "", "", "", "", "", "", "40", "41612001", "36,983.84", "1000533799", "P01026 ACR BNL PAL CHEP C600", "C600", "C600"],
];
