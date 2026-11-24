// ── Stage 7 "Data Processing 6" — preview data (populated columns, 5 rows per file) ──
// Source: Docs/Summary for Reaccrual.xlsx (input, shown as "Reaccrual_input"),
//         Excellist/output/Summary.xlsx and Excellist/output/Final_summary.xlsx (outputs)
// Every preview: all columns with data, first 5 rows; Download = the original Excel file (Vite ?url).
import {
  SUMMARY_FOR_REACCRUAL_DOWNLOAD_URL,
  SUMMARY_FOR_REACCRUAL_TOTAL_RECORDS,
  SUMMARY_FOR_REACCRUAL_COLUMNS,
  SUMMARY_FOR_REACCRUAL_ROWS,
} from "./stage2DataProcessing1";
import summaryUrl from "../../Excellist/output/Summary.xlsx?url";
import finalSummaryUrl from "../../Excellist/output/Final_summary.xlsx?url";

// Input = Docs/Summary for Reaccrual.xlsx (11 named columns, 166 records; same file as Stage 2 output)
export const REACCRUAL_INPUT_DOWNLOAD_URL = SUMMARY_FOR_REACCRUAL_DOWNLOAD_URL;
export const SUMMARY_STAGE7_DOWNLOAD_URL = summaryUrl;
export const FINAL_SUMMARY_DOWNLOAD_URL = finalSummaryUrl;

export const REACCRUAL_INPUT_TOTAL_RECORDS = SUMMARY_FOR_REACCRUAL_TOTAL_RECORDS;
export const FINAL_SUMMARY_TOTAL_RECORDS = 165;

export const REACCRUAL_INPUT_COLUMNS: string[] = SUMMARY_FOR_REACCRUAL_COLUMNS;
export const REACCRUAL_INPUT_ROWS: string[][] = SUMMARY_FOR_REACCRUAL_ROWS;

// Summary.xlsx has only 2 columns; first 5 rows as in the file
export const SUMMARY_COLUMNS_STAGE7 = ["Split of Month Accrual", "Value in Eur"];
export const SUMMARY_ROWS_STAGE7: string[][] = [
  ["Opening Balance", "282,987.09"],
  ["Re-Accrual for September'26", "65,894.60"],
  ["Accrual for October'26", "2,511,916.01"],
  ["Accrual for Missing Pallets", ""],
  ["Total Accrual", "2,577,810.61"],
];

// Final_summary.xlsx: all 15 named columns in file order (A-J and U-Y; K-T are empty), first 5 rows
export const FINAL_SUMMARY_COLUMNS = ["Plant", "Plant Type", "Country", "Cost Centre", "Opening balance", "August'26 Re-Accrual", "September'26 Re-Accrual", "October'26 Accrual", "Total Accrual", "Final Result", "August'26 Re-Accrual", "September'26 Re-Accrual", "October'26 Accrual", "Total Accrual", "Final Result"];
export const FINAL_SUMMARY_ROWS: string[][] = [
  ["A150", "SU", "GB", "1013922999", "7,581.42", "0", "0", "3,984.12", "3,984.12", "11,565.54", "0", "0", "3,984.12", "3,984.12", "11,565.54"],
  ["A153", "DC", "GB", "1064033799", "8,793.55", "0", "0", "11,391.34", "11,391.34", "20,184.89", "0", "0", "11,391.34", "11,391.34", "20,184.89"],
  ["A800", "SU", "GB", "1008222999", "3,316.62", "0", "0", "25,149.20", "25,149.20", "28,465.82", "0", "0", "25,149.20", "25,149.20", "28,465.82"],
  ["A802", "SU", "GB", "1008322999", "1,840.01", "0", "0", "46,826.19", "46,826.19", "48,666.20", "0", "0", "46,826.19", "46,826.19", "48,666.20"],
  ["C101", "SU", "GB", "1010722999", "-4,747.66", "0", "0", "43,089.51", "43,089.51", "38,341.85", "0", "0", "43,089.51", "43,089.51", "38,341.85"],
];
