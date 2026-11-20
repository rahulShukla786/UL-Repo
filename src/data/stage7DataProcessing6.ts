// ── Stage 7 "Data Processing 6" — preview data (populated columns, 5 rows per file) ──
// Source: Excellist/output/Reaccrual_input.xlsx (input),
//         Excellist/output/Summary.xlsx and Excellist/output/Final_summary.xlsx (outputs)

export const REACCRUAL_INPUT_TOTAL_RECORDS = 166;
export const FINAL_SUMMARY_TOTAL_RECORDS = 165;

export const REACCRUAL_INPUT_COLUMNS = ["PlantID", "Country", "To Be invoice of Sep'26", "SAP Invoiced still Oct'26", "Sep'26 Re-Accrual"];
export const REACCRUAL_INPUT_ROWS: string[][] = [
  ["A113", "ES", "80,135.98", "80,135.98", "0"],
  ["A126", "ES", "28,494.76", "28,647.68", "0"],
  ["A150", "GB", "63,976.50", "73,328.86", "0"],
  ["A153", "GB", "18,575.37", "21,291.66", "0"],
  ["A211", "BE", "23,947.29", "0", "23,947.29"],
];

// Summary.xlsx has only 2 columns; the 5 populated rows are shown
export const SUMMARY_COLUMNS_STAGE7 = ["Split of Month Accrual", "Value in Eur"];
export const SUMMARY_ROWS_STAGE7: string[][] = [
  ["Opening Balance", "282,987.09"],
  ["Re-Accrual for September'26", "65,894.60"],
  ["Accrual for October'26", "2,511,916.01"],
  ["Total Accrual", "2,577,810.61"],
  ["Final Result", "2,860,797.70"],
];

export const FINAL_SUMMARY_COLUMNS = ["Plant", "Country", "Opening balance", "October'26 Accrual", "Final Result"];
export const FINAL_SUMMARY_ROWS: string[][] = [
  ["A150", "GB", "7,581.42", "3,984.12", "11,565.54"],
  ["A153", "GB", "8,793.55", "11,391.34", "20,184.89"],
  ["A800", "GB", "3,316.62", "25,149.20", "28,465.82"],
  ["A802", "GB", "1,840.01", "46,826.19", "48,666.20"],
  ["C101", "GB", "-4,747.66", "43,089.51", "38,341.85"],
];
