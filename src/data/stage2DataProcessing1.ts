// Stage 2 "Data Processing 1" (Pull transactional/aggregated data) — real input previews.
// Source files: Docs/B&M Input.xlsx (Sheet1) and Docs/SAP data 1.xlsx (Sheet1).
// Preview columns = all columns that contain data. B&M Input = first 5 rows, SAP Data 1 = first 5 rows.
// Download = the original Excel file (bundled by Vite via ?url).
import bmInputUrl from "../../Docs/B&M Input.xlsx?url";
import sapData1Url from "../../Docs/SAP data 1.xlsx?url";
import summaryForReaccrualUrl from "../../Docs/Summary for Reaccrual.xlsx?url";

// Output: Docs/Summary for Reaccrual.xlsx — all 11 named columns, first 5 rows
export const SUMMARY_FOR_REACCRUAL_DOWNLOAD_URL = summaryForReaccrualUrl;
export const SUMMARY_FOR_REACCRUAL_TOTAL_RECORDS = 166;
export const SUMMARY_FOR_REACCRUAL_COLUMNS = ["PlantID", "Plant Type", "Country", "Cost Centre", "SAP Invoiced still August'26", "To Be invoice of Aug'26", "Aug'26 Re-Accrual", "SAP Invoiced still Sep'26", "To Be invoice of Sep'26", "Sep'26 Re-Accrual", "Total Accrual"];
export const SUMMARY_FOR_REACCRUAL_ROWS: string[][] = [
  ["A113", "SU", "ES", "1006122999", "79,188.43", "76,000.85", "0", "76,000.85", "80,135.98", "0", "0"],
  ["A126", "DC", "ES", "1050633799", "54,890.37", "35,271.03", "0", "35,470.27", "28,494.76", "0", "45.41"],
  ["A150", "SU", "GB", "1013922999", "85,260.95", "65,558.58", "0", "74,455.24", "63,976.50", "0", "0"],
  ["A153", "DC", "GB", "1064033799", "19,314.71", "21,431.87", "0", "24,340.29", "18,575.37", "0", "0"],
  ["A211", "DC", "BE", "1076133799", "56,302.50", "25,034.61", "0", "38,771.33", "23,947.29", "23,947.29", "23,947.29"],
];

export const BM_INPUT_DOWNLOAD_URL = bmInputUrl;
export const SAP_DATA1_DOWNLOAD_URL = sapData1Url;

export const BM_INPUT_TOTAL_RECORDS = 32458;
export const BM_INPUT_UNIQUE_PLANTS = 129;
export const BM_INPUT_COUNTRIES = 25;
export const BM_INPUT_TOTAL_COST = "4,114,408.26";

export const BM_INPUT_COLUMNS: string[] = ["CLIENT", "INVOICE", "INV_NUMBER", "MOVEDATE", "SGID", "SENDNAME", "PT", "QTY", "CORRREV", "REF1", "REF2", "REF3", "TRANSTYPE", "INVGRP", "RECGID", "RECNAME", "NCDCHARGE", "OTHERCH", "TOTAL", "RTF2", "ADMIN2", "ENTRY", "NCD2", "REG", "B_M_TOTAL", "SENDCNTRY", "RECCNTRY", "TPCODE", "NCD_RATE", "FLOW_RATE", "RTF_RATE", "PLANT", "Unilever Code", "PlantID", "Plant Type", "Chep ID / Name", "Category", "Country", "Net Qty", "Month", "Year", "Invoice Currency", "Cost Type", "Conversion Rate", "Converted Total", "Invoice Number", "Cost Bucket", "Cost Centre", "CRG", "P2P Cost Centre", "P2P CRG", "UK Mapping", "year mapping"];

export const BM_INPUT_ROWS: string[][] = [
  ["UHED", "46273", "8001155615", "", "DE97", "CHEP Service Center", "03", "9900", "", "July 2025 - December 2025", "", "", "Debit request item", "Transport Credit", "0100977855", "Unilever IC Heppenheim DC (TLB", "", "-2475", "-2475", "", "-2475", "", "", "", "-2475", "", "DE", "DE97", "", "-0.25", "", "", "0100977855", "A567/A577", "DC", "DC Heppenheim", "Ice Cream", "Germany", "9900", "9", "2026", "EURO", "Other", "1", "-2475", "8001155615", "03-DC-Transport Credit", "Logistics DC", "337", "Logistics DC", "337", "N/A", "20269"],
  ["IC", "46274", "4300143687", "2026-05-29", "0100687900", "Unilever IC Gloucester DC (Lineage)", "01", "11", "Rev", "00419ICP00017", "4253645120", "4509097988", "Trade Dispatch", "Channel Cost", "0100517718", "Brakes Newark Lineage", "-18.48", "", "-18.48", "", "", "", "-18.48", "", "-18.48", "GB", "GB", "0100517718", "1.68", "", "", "", "0100687900", "A153", "DC", "Lineage Logistics Gloucester", "Ice Cream", "UK", "-11", "9", "2026", "Sterling", "Channel Costs", "1.1645", "-21.52", "4300143687", "01-DC-Channel Cost", "Logistics DC", "337", "Logistics DC", "337", "C106", "20269"],
  ["IC", "46274", "4300143687", "2026-06-05", "0100687900", "Unilever IC Gloucester DC (Lineage)", "01", "16", "Rev", "00425ICP00015", "4253740186", "4509109211", "Trade Dispatch", "Channel Cost", "0100517718", "Brakes Newark Lineage", "-26.88", "", "-26.88", "", "", "", "-26.88", "", "-26.88", "GB", "GB", "0100517718", "1.68", "", "", "", "0100687900", "A153", "DC", "Lineage Logistics Gloucester", "Ice Cream", "UK", "-16", "9", "2026", "Sterling", "Channel Costs", "1.1645", "-31.3", "4300143687", "01-DC-Channel Cost", "Logistics DC", "337", "Logistics DC", "337", "C106", "20269"],
  ["IC", "46274", "4300143687", "2026-06-15", "0100687900", "Unilever IC Gloucester DC (Lineage)", "01", "22", "Rev", "00431ICP00001", "4253815387", "4509119674", "Trade Dispatch", "Channel Cost", "0100517718", "Brakes Newark Lineage", "-36.96", "", "-36.96", "", "", "", "-36.96", "", "-36.96", "GB", "GB", "0100517718", "1.68", "", "", "", "0100687900", "A153", "DC", "Lineage Logistics Gloucester", "Ice Cream", "UK", "-22", "9", "2026", "Sterling", "Channel Costs", "1.1645", "-43.04", "4300143687", "01-DC-Channel Cost", "Logistics DC", "337", "Logistics DC", "337", "C106", "20269"],
  ["UTUA", "46282", "1100931152", "", "1000394919", "Unilever CZ FM A998 ATÂ", "16", "10589", "", "Agreed RTF Credit", "CZ to AT", "", "", "RTF", "CZ to AT", "", "", "", "-3388.48", "-3388.48", "", "", "", "-3388.48", "-3388.48", "CZ", "AT", "CZ to AT", "", "", "-0.32", "", "1000394919", "A998", "DC", "FM Logistic Tuchomerice AT", "HC/NU/PC", "Czechia", "10589", "9", "2026", "EURO", "RTF", "1", "-3388.48", "1100931152", "16-DC-RTF", "Promo Repack", "TBC", "Logistics DC", "337", "N/A", "20269"],
];

export const SAP_DATA1_TOTAL_RECORDS = 263;
export const SAP_DATA1_UNIQUE_COST_CENTERS = 99;
export const SAP_DATA1_TOTAL_AMOUNT = "4,241,206.75";

export const SAP_DATA1_COLUMNS: string[] = ["X", "Cost Center", "CO object name", "Cost Element", "Cost element descr.", "Period", "Name of offsetting account", "Name", "Ref. document number", "Offsetting acct no.", "Company Code", "User Name", "Document Header Text", "Var.val.in rep.cur.", "Document Date", "Posting Date", "Plant", "Purchasing Document", "Purchase order text", "Document type"];

export const SAP_DATA1_ROWS: string[][] = [
  ["1006222999416120015063666560M0726_A301_CHEP FR4519148960", "1006222999", "SU Pallets INCURR", "41612001", "Rental/Operating Leases - Pallets", "9", "AP GR/IR Ssp 3 Pty", "", "5063666560", "14221001", "2611", "AR_A500", "M0726_A301_CHEP FR", "41783.28", "2026-09-01", "2026-09-01", "B001", "4519148960", "A301 - SU Sanit-Dizier 2026 SU", "WE"],
  ["1038833799416120015063666618M0726_A361_CHEP FR4519148960", "1038833799", "PALLETS - DCS", "41612001", "Rental/Operating Leases - Pallets", "9", "AP GR/IR Ssp 3 Pty", "", "5063666618", "14221001", "2611", "AR_A500", "M0726_A361_CHEP FR", "33516.7", "2026-09-01", "2026-09-01", "B001", "4519148960", "A361- St. Dizier rent pallets 2026 Lo.DC", "WE"],
  ["1039133799416120015063666618M0726_A361_CHEP FR4519148960", "1039133799", "PALLETS - DCS", "41612001", "Rental/Operating Leases - Pallets", "9", "AP GR/IR Ssp 3 Pty", "", "5063666618", "14221001", "2611", "AR_A500", "M0726_A361_CHEP FR", "4583.13", "2026-09-01", "2026-09-01", "B001", "4519148960", "Mutual 2026 A364 Lo.DC", "WE"],
  ["1037133799416120015063666887M0726_C341_CHEP FR4519148960", "1037133799", "Pallets - DCs", "41612001", "Rental/Operating Leases - Pallets", "9", "AP GR/IR Ssp 3 Pty", "", "5063666887", "14221001", "2611", "AR_A500", "M0726_C341_CHEP FR", "1127.61", "2026-09-01", "2026-09-01", "B001", "4519148960", "Amora Dépôt Chevigny 2026 A316 Lo.DC", "WE"],
  ["1064433799416120015063666887M0726_C341_CHEP FR4519148960", "1064433799", "Pallets - DCs", "41612001", "Rental/Operating Leases - Pallets", "9", "AP GR/IR Ssp 3 Pty", "", "5063666887", "14221001", "2611", "AR_A500", "M0726_C341_CHEP FR", "37690.17", "2026-09-01", "2026-09-01", "B001", "4519148960", "Fauverney Food 2026 A341 Lo.DC", "WE"],
];
