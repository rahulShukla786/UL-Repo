// ── Stage 3 "Data Processing 2" — preview data (first 5 records per file) ──
// Input : Docs/Raw Data.xlsx (Sheet1) — shown in the app as "October 2026 CHEP Accrual".
//         Preview = all 55 columns of the Excel file, first 5 rows.
//         Download = the same Raw Data.xlsx content (66 MB, served from the UC volume
//         via /api/files/chep-accrual), saved as "October 2026 CHEP Accrual.xlsx".
// Output: Docs/Summary by Plant without Copack.xlsx, Docs/Summary by Plant DACH PL.xlsx

// Full-file stats (computed from Raw Data.xlsx)
export const CHEP_ACCRUAL_TOTAL_RECORDS = 284535;
export const CHEP_ACCRUAL_UNIQUE_PLANTS = 121;
export const CHEP_ACCRUAL_COUNTRIES = 25;
export const CHEP_ACCRUAL_TOTAL_COST = "2,621,877.19";

export const CHEP_ACCRUAL_COLUMNS: string[] = ["In or out", "Country", "Plant Code", "Category", "Plant Name", "Plant Type", "Transaction Group", "CHANNEL LOOKUP", "RTF LOOKUP", "id", "moveid", "Total Cost", "Cost Fee", "account", "pt", "senderCha", "senderChannel", "sender", "senderName", "senderSoldToparty", "senderSoldTopartyName", "senderRepParent", "senderRepParentName", "senderGrandRepParent", "senderGrRepParentName", "senderCo", "senderCountry", "RecCo", "RecCountry", "RecCha", "RecChannel", "Receiver", "ReceiverName", "house_andstNo", "city", "Country", "ReceiverSoldToParty", "ReceiverSoldToPartyName", "ReceiverRepParent", "ReceiverRepParentName", "ReceiverRepgrParent", "ReceiverRepgrParentName", "senderPostingType", "senderPType", "commentPTL", "commentPDF", "DispatchDate", "PostingDate", "Receiver_qty", "cost_Type", "New Invoice Text", "Mvt Receiver EU Channel", "FileName", "DateTimeCreate", "Key"];
export const CHEP_ACCRUAL_ROWS: string[][] = [
  ["Outbound", "Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "Out - Intracompany", "IT1E", "ITGB1", "10744987", "3640397", "0", "0", "", "1", "EMITTER", "EMITTER", "100079013", "Unilever Foods Menz COMAN", "100330968", "Unilever Italia SRL", "100196348", "Unilever - EU", "100194307", "Unilever Group - EU", "IT", "Italy", "GB", "United Kingdom", "EMITTER", "101252351", "101252351", "Unilever Foods & HC Cannock DC(DHL)", "Kingswood Lakeside, Hitchling Road", "Cannock", "GB", "101252350", "Unilever Cannock DC", "100290784", "Unilever - EU", "100194307", "Unilever Group - EU", "Transfer Customer to Customer - Out", "C01", "Out - Intracompany", "Out - Intracompany", "20260910", "20261019", "48", "Generic Costs", "Out - Intracompany", "E", "Unilever October 2026 - Forecast file for customer new_.xlsx", "2026-10-26", "1.00079E+17"],
  ["Outbound", "Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "Out - Intracompany", "IT1E", "ITGB1", "10744988", "3640398", "0", "0", "", "1", "EMITTER", "EMITTER", "100079013", "Unilever Foods Menz COMAN", "100330968", "Unilever Italia SRL", "100196348", "Unilever - EU", "100194307", "Unilever Group - EU", "IT", "Italy", "GB", "United Kingdom", "EMITTER", "101252351", "101252351", "Unilever Foods & HC Cannock DC(DHL)", "Kingswood Lakeside, Hitchling Road", "Cannock", "GB", "101252350", "Unilever Cannock DC", "100290784", "Unilever - EU", "100194307", "Unilever Group - EU", "Transfer Customer to Customer - Out", "C01", "Out - Intracompany", "Out - Intracompany", "20260917", "20261019", "47", "Generic Costs", "Out - Intracompany", "E", "Unilever October 2026 - Forecast file for customer new_.xlsx", "2026-10-26", "1.00079E+17"],
  ["Outbound", "Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "Out - Intracompany", "IT1E", "ITGB1", "10744989", "3640399", "0", "0", "", "1", "EMITTER", "EMITTER", "100079013", "Unilever Foods Menz COMAN", "100330968", "Unilever Italia SRL", "100196348", "Unilever - EU", "100194307", "Unilever Group - EU", "IT", "Italy", "GB", "United Kingdom", "EMITTER", "101252351", "101252351", "Unilever Foods & HC Cannock DC(DHL)", "Kingswood Lakeside, Hitchling Road", "Cannock", "GB", "101252350", "Unilever Cannock DC", "100290784", "Unilever - EU", "100194307", "Unilever Group - EU", "Transfer Customer to Customer - Out", "C01", "Out - Intracompany", "Out - Intracompany", "20260928", "20261005", "48", "Generic Costs", "Out - Intracompany", "E", "Unilever October 2026 - Forecast file for customer new_.xlsx", "2026-10-26", "1.00079E+17"],
  ["Outbound", "Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "Out - Intracompany", "IT1E", "ITGB1", "10744990", "3640400", "0", "0", "", "1", "EMITTER", "EMITTER", "100079013", "Unilever Foods Menz COMAN", "100330968", "Unilever Italia SRL", "100196348", "Unilever - EU", "100194307", "Unilever Group - EU", "IT", "Italy", "GB", "United Kingdom", "EMITTER", "101252351", "101252351", "Unilever Foods & HC Cannock DC(DHL)", "Kingswood Lakeside, Hitchling Road", "Cannock", "GB", "101252350", "Unilever Cannock DC", "100290784", "Unilever - EU", "100194307", "Unilever Group - EU", "Transfer Customer to Customer - Out", "C01", "Out - Intracompany", "Out - Intracompany", "20260928", "20261005", "48", "Generic Costs", "Out - Intracompany", "E", "Unilever October 2026 - Forecast file for customer new_.xlsx", "2026-10-26", "1.00079E+17"],
  ["Outbound", "Italy", "A858", "Foods", "A858 - SU Sanguinetto - 0100079013", "SU", "Out - Intracompany", "IT1E", "ITGB1", "10744991", "3640401", "0", "0", "", "1", "EMITTER", "EMITTER", "100079013", "Unilever Foods Menz COMAN", "100330968", "Unilever Italia SRL", "100196348", "Unilever - EU", "100194307", "Unilever Group - EU", "IT", "Italy", "GB", "United Kingdom", "EMITTER", "101252351", "101252351", "Unilever Foods & HC Cannock DC(DHL)", "Kingswood Lakeside, Hitchling Road", "Cannock", "GB", "101252350", "Unilever Cannock DC", "100290784", "Unilever - EU", "100194307", "Unilever Group - EU", "Transfer Customer to Customer - Out", "C01", "Out - Intracompany", "Out - Intracompany", "20260928", "20261005", "48", "Generic Costs", "Out - Intracompany", "E", "Unilever October 2026 - Forecast file for customer new_.xlsx", "2026-10-26", "1.00079E+17"],
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
