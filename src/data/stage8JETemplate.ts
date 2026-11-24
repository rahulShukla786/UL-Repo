// ── Stage 8 "JE Template Generation" — Excellist/output/final_blackline.xlsx ──
// BlackLine upload template (Sheet1): header row = row 3, all 94 columns
// (SECTION - HEADER B-Q, SECTION - LINE R onwards), first 5 records (rows 4-8: header record + lines).
// Download = the original Excel file (bundled by Vite via ?url).
import finalBlacklineUrl from "../../Excellist/output/final_blackline.xlsx?url";

export const FINAL_BLACKLINE_DOWNLOAD_URL = finalBlacklineUrl;
export const FINAL_BLACKLINE_TOTAL_RECORDS = 133;

export const FINAL_BLACKLINE_COLUMNS: string[] = ["Record Type", "JE Classification*", "Document Type (S)*", "Document Date*", "Posting Date*", "Posting Period", "Document Header Text*", "Header Company Code*", "Document Currency*", "Reference Doc", "Translation Date*", "Exchange Rate Override", "VAT Date", "Reversal Reason", "Reversal Date", "Calculate Tax ?*", "Tax Payable", "Posting Key*", "Cross Company Code", "Account*", "Reconciliation Account Adjustment", "Reconciliation Account", "Vendor Number", "Customer Number", "Amount in Document Currency*", "Value Date", "Amount in Local Currency", "Amount in Group Currency", "Cost Center", "Trading Partner", "FI Plant", "Line Item Text*", "Transaction Type", "Reference Key1", "Assignment Number", "Internal Order", "Exceptional approval taken?", "Material Number", "PO Number", "Tax Adjustment", "Tax Base Amount", "Tax Code", "Special GL Indicator", "Payment Block Key", "Payment Method", "Baseline Date", "Terms Of Payment", "Partner Bank Type", "Payment Method Supp", "SCB Indicator", "Brand Code", "Plant", "Product", "Business Place", "COPA Customer", "Quantity", "Measure Base unit", "BFPP", "CPG", "AcctAssgGr (Customer)", "Division", "Distribution Channel", "Sales Org", "Sub Division 2", "CustomerHier05", "CustomerHier06", "CustomerHier07", "Market Code", "Sector Code", "Category Code", "Parent Product", "Non Unilever Product", "Business Unit", "MSO sales Org.", "MSO customer", "MSO distrib. Channel", "MSO Division", "Retail/FS split", "IH/OOH (In/Out home)", "SC Model", "Marketing Element", "Material Type", "ProjectID Innovation", "ProjectID Sustainabi", "ProjectID Others", "Promo Flag", "Acq/Dis", "Rebranding Purpose", "RKE Segment", "Original referen doc", "Period CY / PY", "Sales Quantity", "SalesVol-Pallets (COPA)", "Long Text"];

// Build a 94-cell row from the populated cells only (index = Excel column - 1)
const blRow = (cells: Record<number, string>): string[] =>
  FINAL_BLACKLINE_COLUMNS.map((_, i) => cells[i] ?? "");

export const FINAL_BLACKLINE_ROWS: string[][] = [
  // Row 4: header record (H)
  blRow({ 0: "H", 1: "ACCRUALS", 2: "Y1", 3: "2026-11-19", 4: "2026-11-19", 6: "P1026 ACR  PAL CHEP ", 7: "2611", 8: "EUR", 10: "2026-11-19", 13: "5", 14: "2026-12-01", 15: "N" }),
  // Rows 5-8: line records
  blRow({ 17: "40", 19: "41612001", 24: "0", 28: "1047733799", 31: "P01026 ACR AT PAL CHEP A964" }),
  blRow({ 0: "L", 17: "40", 19: "41612001", 24: "306.42", 28: "1047933799", 31: "P01026 ACR AT PAL CHEP A967" }),
  blRow({ 17: "40", 19: "41612001", 24: "0", 28: "1066133799", 31: "P01026 ACR BNL PAL CHEP A210" }),
  blRow({ 0: "L", 17: "40", 19: "41612001", 24: "40,682.22", 28: "1000533799", 31: "P01026 ACR BNL PAL CHEP C600" }),
];
