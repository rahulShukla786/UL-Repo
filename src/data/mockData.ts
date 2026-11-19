import type { JournalEntry, StageData, ExtractedField, SourcePreviewTable, GitJETemplateData } from "../types";
import adHocRaw from "./ad-hoc.json";
import gitStage2Raw from "./git-stage2-data.json";
import gitStage4Raw from "./git-stage4-data.json";

// ── Standard business rule categories ────────────────────────────────────────
export const STD_BUSINESS_RULE_CATEGORIES = [
  {
    title: "Source File Requirements",
    status: "completed" as const,
    items: [
      "SAP YMM234 Open DO Report (24 months)",
      "XE.com exchange rates for foreign currency conversion",
      "Media Cost Center master file from HUL-HO",
      "Consolidated Open DO Report for provision calculation",
    ],
  },
  {
    title: "Processing Rules",
    status: "completed" as const,
    items: [
      "Consolidate monthly Open DO reports into a single dataset",
      "Exclude WBS Elements starting with \"E\"",
      "Exclude Brand Codes A999, Z999, and Y999",
      "Classify DOs as 2WM or 3WM based on GR-Based Invoice Verification",
      "Calculate provision based on DO type and currency",
      "Set provision amount to 0 for future-dated POs",
      "Identify Media Cost Centers using the mapping file",
    ],
  },
  {
    title: "Validation Rules",
    status: "completed" as const,
    items: [
      "Consolidated totals must match source reports",
      "XE exchange rates must be applied to foreign currency transactions",
      "Media Cost Center mapping must be validated",
      "Journal Entry must balance (P&L Dr = Liability Cr 1442402)",
      "Reviewer approval required before posting",
    ],
  },
  {
    title: "Exception Rules",
    status: "completed" as const,
    items: [
      "Deletion Indicator = L \u2192 Cancelled DO",
      "Delivery Complete Indicator = X \u2192 Delivery Completed",
      "Blank Internal Order \u2192 Blank Internal Order",
      "Missing Media Cost Center \u2192 Not Related to Media",
      "Zero Provision \u2192 Nil Balance",
      "Negative Provision \u2192 Forex Diff / Service Tax Diff",
      "Missing stakeholder confirmation \u2192 Apply YTD provision formula",
    ],
  },
];
// ── Goods in Transit JE — business rule categories ───────────────────────────
const GIT_BUSINESS_RULE_CATEGORIES = [
  {
    title: "Source File Requirements",
    status: "completed" as const,
    items: [
      "YUMM_PUR0058 Import Tracker Report.",
      "YUMM_PUR0041 PO List.",
      "SAP ME23N transaction.",
      "GRIR Review Report.",
      "PLB Report.",
      "Material List Master File."
    ],
  },
  {
    title: "Processing Rules",
    status: "completed" as const,
    items: [
      "Include only EXW, FCA and FOB Incoterms.",
      "Exclude Unilever sister companies and consignment vendors.",
      "Exclude shipments marked as DELIVERED.",
      "Include Import Tracker records with ETA within the GIT eligibility window.",
      "Calculate Qty Need to be Delivered as Qty minus GR Qty.",
      "Include only records with Qty Need to be Delivered greater than zero.",
      "Exclude records with Total Goods Movement Status equal to C (Completed).",
      "Convert eligible transaction values to IDR using applicable exchange rates.",
      "Include PLB records with non-consignment vendors and valid Incoterms.",
      "Exclude damaged materials and invalid PLB locations.",
      "Perform BNG, Import Tracker and Movement Indicator validation checks.",
      "Combine eligible Import Tracker and PLB populations to determine the final GIT value.",
    ],
  },
  {
    title: "Validation Rules",
    status: "completed" as const,
    items: [
      "Incoterms validated for all eligible purchase orders.",
      "Missing Incoterm validated through PO List or SAP ME23N.",
      "Duplicate purchase orders removed from lookup populations.",
      "BNG check completed against GRIR Review report.",
      "Import Tracker cross-check completed for PLB records.",
      "Movement Indicator validated against MB51 status.",
      "Material Type mapping completed using Material List.",
      "Journal amount agrees with GIT Summary."
    ],
  },
  {
    title: "Exception Rules",
    status: "completed" as const,
    items: [
      "Missing Incoterm \u2192 Validate through PO List or SAP ME23N.",
      "Qty Need to be Delivered = 0 \u2192 Exclude.",
      "Total Goods Movement Status = C \u2192 Exclude.",
      "Delivered shipment status \u2192 Exclude.",
      "Consignment vendor record \u2192 Exclude.",
      "Unilever sister company vendor \u2192 Exclude.",
      "Material Status = Damaged \u2192 Exclude.",
      "Location = OF Cakung \u2192 Exclude.",
      "PO already booked in BNG \u2192 Exclude.",
      "Movement Indicator = C \u2192 Exclude.",
      "Import Tracker duplicate population \u2192 Exclude.",
    ],
  },
];

const SALES_RECLASS_BUSINESS_RULE_CATEGORIES = [
  {
    title: "Source File Requirements",
    items: [
      "Sales Reclass input file received from Kalyanashettar, Shidramesh in BEX format.",
      "Profit Centre field available for journal attribute derivation.",
    ],
  },
  {
    title: "Processing Rules",
    items: [
      "Extract Profit_Centre as the last 4 digits of the Profit Centre field.",
      "Assign Business_Area as C003 for all journal entries.",
      "For Credit entries, assign GL Account 5140312 and post Document Amount as a negative value.",
      "For Debit entries, assign GL Account 2110146 and post Document Amount as a positive value.",
      "Generate the Journal Working Dataset using the transformed records.",
    ],
  },
  {
    title: "Validation Rules",
    items: [
      "Profit Centre extracted correctly from the last 4 digits of the source field.",
      "Business Area assigned as C003 for all records.",
      "GL Account mapping applied according to entry type.",
      "Document Amount sign applied correctly for Debit and Credit entries.",
      "Period open approval obtained before journal preparation.",
    ],
  },
  {
    title: "Exception Rules",
    items: [
      "Missing or invalid Profit Centre \u2192 Validate source data.",
      "Entry Type is not equal to Debit or Credit \u2192 Exclude record.",
      "Missing posting period approval \u2192 Do not prepare journal.",
      "Missing GL Account mapping \u2192 Flag for manual review.",
      "Missing Document Amount \u2192 Flag for manual review.",
    ],
  },
];

const SALES_RECLASS_STAGE1_COMPLETED: StageData = {
  id: 1,
  title: "Stage 1: Reading Business Rules",
  purpose:
    "Fetch accounting logic (mapping, policies, thresholds, posting rules)",
  status: "completed",
  componentType: "business_rules",
  businessRuleCategories: SALES_RECLASS_BUSINESS_RULE_CATEGORIES.map((c) => ({
    ...c,
    status: "completed" as const,
  })),
};



// ── Standard SOURCING rows (for Stage 2 Data Extraction Document Preview) ────
// These are the 22 records that passed the sourcing filter (R001).
// Distinct from je_preparation which has all 30 records.

// ── Standard JE posting rows for Stage 4 JE Template ─────────────────────────
// 15 records — JETemplate handles pagination (10 per page).
// Columns: COMPANY | CURRENCY | POST DATE | DOC DATE | REFERENCE | DOC HEADER | LEDGER ACCOUNT | LEDGER AMOUNT
const STD_JE_POSTING_TOTAL = 6;

const STD_JE_POSTING_ROWS = [
  {
    documentCurrency: "INR",
    postingKey: "40",
    account: "5140312",
    amountInDocCurrency: "1250000",
    costCenter: "CC10001",
    lineItemText: "Open DO Provision - Media",
  },
  {
    documentCurrency: "INR",
    postingKey: "40",
    account: "5140312",
    amountInDocCurrency: "750000",
    costCenter: "CC10001",
    lineItemText: "Open DO Provision - Media",
  },
  {
    documentCurrency: "INR",
    postingKey: "50",
    account: "5140312",
    amountInDocCurrency: "2000000",
    costCenter: "",
    lineItemText: "Open DO Provision - Media",
  },
  {
    documentCurrency: "INR",
    postingKey: "40",
    account: "2110146",
    amountInDocCurrency: "980000",
    costCenter: "CC10002",
    lineItemText: "Open DO Provision - Media",
  },
  {
    documentCurrency: "INR",
    postingKey: "50",
    account: "2110146",
    amountInDocCurrency: "1500000",
    costCenter: "CC10003",
    lineItemText: "Open DO Provision - Media",
  },
  {
    documentCurrency: "INR",
    postingKey: "40",
    account: "5140312",
    amountInDocCurrency: "520000",
    costCenter: "CC10004",
    lineItemText: "Open DO Provision - Media",
  },
];
// ── Stage 3 Data Validation — single "Reclassify line items" card (R002) ──────
// totalRows = 22 (sourced via R001), affectedRows = 2 (failed calc)
// Displays: "20/22 validated" ⚠
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// AD-HOC JE — JSON types + computed data
// ═══════════════════════════════════════════════════════════════════════════════
type AdHocPrepRecord = {
  je_preparation_id: number;
  document_name: string;
  journal_type: string;
  company_code: number;
  document_type: string;
  posting_date: string;
  document_date: string;
  currency: string;
  gl_account: number;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: number;
  gl_account_description: string;
  validation_status: string;
  source_type: string;
  load_timestamp: string;
  update_timestamp: string;
};
type AdHocRuleRecord = { rule_type: string; description: string };
type AdHocPostRecord = {
  je_posting_id: number;
  je_preparation_id: number;
  gl_account: number;
  gl_account_description: string;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: number;
  posting_status: string;
  calculation_rule_applied: string;
  posted_timestamp: string;
};
type AdHocJson = {
  ad_hoc_je_preparation: AdHocPrepRecord[];
  ad_hoc_business_rules: AdHocRuleRecord[];
  ad_hoc_je_posting: AdHocPostRecord[];
};

const adHocData = adHocRaw as unknown as AdHocJson;

const AD_HOC_PREP_ROWS = adHocData.ad_hoc_je_preparation.map((r) => ({
  je_preparation_id: r.je_preparation_id,
  gl_account: r.gl_account,
  gl_account_description: r.gl_account_description,
  posting_amount: r.posting_amount,
  debit_credit_indicator: r.debit_credit_indicator,
  cost_center: r.cost_center,
  validation_status: r.validation_status,
  posting_date: r.posting_date,
}));

// ─────────────────────────────────────────────────────────────────────────────

const AI_LOG_PENDING = [
  "[01:58:02.110] ─── AI Journal Entry Agent v1.0 Initialized ───",
  "[01:58:02.230] Session ID: sess_a9f3c8e1-7d42-4b1a-bc09-ef12d8a6c0d3",
  "[01:58:02.310] User: john.doe@company.com | Role: Finance Analyst",
  "[01:58:02.450] Loading SOP configuration from knowledge base...",
  "[01:58:03.020] SOP loaded: JB Cash Deposit Miscellaneous_v2.2 (last updated: 2026-06-01)",
  "[01:58:03.180] ─── Stage 1: Reading Business Rules ───",
  "[01:58:03.250] Fetching business rules from SOP repository...",
  "[01:58:03.890] Rule R001 loaded: Data sourcing filter (cost_center 2500000–2599999)",
  "[01:58:04.010] Rule R002 loaded: Reclassification logic (GL 41804001, CC 2540104)",
  "[01:58:04.150] Rule R003 loaded: Posting date validation (current fiscal period)",
  "[01:58:04.320] Rule R004 loaded: Currency conversion check (base currency = USD)",
  "[01:58:04.500] Business rules validation: 4/4 rules parsed successfully.",
  "[01:58:04.650] ─── Stage 2: Data Extraction ───",
  "[01:58:04.720] Initiating data source connection...",
  "[01:58:05.100] Connected to SAP ECC via RFC (T-Code: KSB1)",
  "[01:58:05.340] Applying extraction filters:",
  "[01:58:05.350]   • Controlling area = PH01",
  "[01:58:05.360]   • Cost center range = 2500000 to 2599999",
  "[01:58:05.370]   • Cost element ≥ 41702024",
  "[01:58:05.380]   • Company code = 4707",
  "[01:58:05.390]   • Posting date = 01.01.2025 to 31.12.2025",
  "[01:58:06.800] Query executed successfully. Response time: 1.41s",
  "[01:58:06.950] Records retrieved: 30 (raw extraction)",
  "[01:58:07.120] Applying sourcing filter R001...",
  "[01:58:07.450] Sourcing complete: 22/30 records matched filter criteria.",
  "[01:58:07.600] 8 records excluded (cost_element mismatch).",
  "[01:58:07.780] Document generated: KSB1_Bunker_Reclass_2025.xlsx",
  "[01:58:07.900] Confidence score: 95% (high extraction quality)",
  "[01:58:08.050] ─── Stage 3: Data Validation ───",
  "[01:58:08.120] Running validation checks on 22 sourced records...",
  "[01:58:08.350] Check 1/5: Company code validation → PASSED (all records = 4707)",
  "[01:58:08.520] Check 2/5: Currency consistency → PASSED (all records = PHP)",
  "[01:58:08.690] Check 3/5: GL account mapping → PASSED (valid chart of accounts)",
  "[01:58:08.870] Check 4/5: Debit/credit balance → PASSED (net = $0.00)",
  "[01:58:09.040] Check 5/5: Duplicate detection → PASSED (0 duplicates found)",
  "[01:58:09.200] Applying calculation rule R002 (reclassification)...",
  "[01:58:09.580] Reclassification result: 20 entries successful, 2 affected.",
  "[01:58:09.750] ⚠ Warning: 2 records failed reclassification (posting_date = null)",
  "[01:58:09.900] Validation summary: 20/22 records validated | 2 warnings",
  "[01:58:10.050] ─── Stage 4: JE Template Generation ───",
  "[01:58:10.120] Generating journal entry template from validated data...",
  "[01:58:10.340] Template format: SAP FI Document (ZJ type)",
  "[01:58:10.500] Mapping fields: COMPANY_CODE, DOC_TYPE, POSTING_DATE, GL_ACCOUNT, AMOUNT, CURRENCY, COST_CENTER",
  "[01:58:10.780] Generated 20 line items across 1 document.",
  "[01:58:10.950] Total debit: $863,400.00 | Total credit: $863,400.00",
  "[01:58:11.100] Balance check: PASSED (debit = credit)",
  "[01:58:11.280] Template ID: TPL-20260701-BNK-RECLASS-001",
  "[01:58:11.450] Submitting for approval...",
  "[01:58:11.620] Approval email sent to: je-owner@company.com",
  "[01:58:11.800] ─── Stage 5: Upload to ERP ───",
  "[01:58:11.870] Preparing batch upload package...",
  "[01:58:12.100] Batch ID: BATCH-20260612-00441",
  "[01:58:12.280] Target system: SAP ECC (Production)",
  "[01:58:12.450] Upload method: BAPI_ACC_DOCUMENT_POST",
  "[01:58:12.620] Scheduled upload time: 17 Jun, 2026, 16:00 UTC",
  "[01:58:12.800] Notification recipient: je-operations@company.com",
  "[01:58:13.000] ─── Post-Processing ───",
  "[01:58:13.150] Evaluating approval workflow conditions.",
  "[01:58:13.300] JE total amount = $863,400.00",
  "[01:58:13.450] Approval rule applied → Single-level approval required (< $1M)",
  "[01:58:13.620] Final reconciliation checkpoint.",
  "[01:58:13.800] Audit trail recorded: 5 stages completed, 0 critical exceptions.",
  "[01:58:14.000] Processing duration: 11.89s (within SLA threshold of 30s)",
  "[01:58:14.200] ─── Process Complete ───",
  "[01:58:14.350] Status: JE prepared, validated, and submitted for approval.",
  "[01:58:14.500] Next action: Awaiting approver response.",
];

export const STATIC_STANDARD_DETAIL_LOGS = [...AI_LOG_PENDING];

// ═══════════════════════════════════════════════════════════════════════════════
// STANDARD JE PATH RESULTS (Stages 1–5)
// ═══════════════════════════════════════════════════════════════════════════════

export const STD_STAGE1_COMPLETED: StageData = {
  id: 1,
  title: "Stage 1: Reading Business Rules",
  purpose:
    "Fetch accounting logic (mapping, policies, thresholds, posting rules)",
  status: "completed",
  componentType: "business_rules",
  businessRuleCategories: GIT_BUSINESS_RULE_CATEGORIES,
};

export const GIT_STAGE1_COMPLETED: StageData = {
  id: 1,
  title: "Stage 1: Reading Business Rules",
  purpose:
    "Fetch accounting logic (mapping, policies, thresholds, posting rules)",
  status: "completed",
  componentType: "business_rules",
  businessRuleCategories: STD_BUSINESS_RULE_CATEGORIES,
};

// Stage 2 — two SHAREDRIVE sources with per-source preview tables
export const STD_STAGE2_COMPLETED: StageData = {
  id: 2,
  title: "Stage 2: Data Extraction",
  purpose: "Pull transactional/aggregated data",
  status: "completed",
  componentType: "data_extraction",
  extractedCount: 3,
  totalRecords: 123,
  sources: [
    {
      type: "SAP",
      name: "YMM234 Open DO Report.xlsx",
      date: "17 Jun 2026",
      status: "success",
    },
    {
      type: "SHAREDRIVE",
      name: "Consolidated Open DO Report.xlsx",
      date: "17 Jun 2026",
      status: "success",
    },
    {
      type: "SHAREDRIVE",
      name: "XE Currency Rates.xlsx",
      date: "17 Jun 2026",
      status: "success",
    },
  ],
  confidenceScore: 90,
  extractedFields: [
    { label: "Total Number of POs", value: "5" },
    { label: "Total Pending PO Quantity", value: "190" },
    { label: "Highest Basic Price", value: "\u20b9500,000 (PO100001)" },
    { label: "Unique Cost Centers", value: "5" },
    { label: "Highest Pending PO Quantity", value: "100 (PO100001)" },
  ],
  sourcePreviewTables: [
    {
      fileName: "YMM234 Open DO Report.xlsx",
      columns: ["Document Date", "PO Number", "Purchasing Doc Type", "Cost Center", "WBS Element"],
      rows: [
        ["30 June 2026", "PO100001", "ZPAR", "CC10001", "WBS001"],
        ["30 June 2026", "PO100001", "ZARS", "CC10002", "WBS002"],
        ["30 June 2026", "PO100001", "ZCIM", "CC10003", "WBS003"],
        ["30 June 2026", "PO100001", "ZCDO", "CC10004", "WBS004"],
        ["30 June 2026", "PO100001", "ZAIS", "CC10005", "WBS005"],
      ],
    },
    {
      fileName: "Consolidated Open DO Report.xlsx",
      columns: ["PO Number", "Vendor Name", "Material Group", "Pending Qty", "Basic Price", "Currency"],
      rows: [
        ["PO100001", "HUL Supplier A", "Raw Materials", "100", "500,000", "INR"],
        ["PO100002", "HUL Supplier B", "Packaging", "45", "220,000", "INR"],
        ["PO100003", "HUL Supplier C", "Chemicals", "25", "180,000", "INR"],
        ["PO100004", "HUL Supplier D", "Consumables", "10", "75,000", "INR"],
        ["PO100005", "HUL Supplier E", "Services", "10", "150,000", "USD"],
      ],
    },
    {
      fileName: "XE Currency Rates.xlsx",
      columns: ["Currency Pair", "Rate", "Effective Date", "Source"],
      rows: [
        ["USD/INR", "83.45", "30 Jun 2026", "XE.com"],
        ["EUR/INR", "90.12", "30 Jun 2026", "XE.com"],
        ["GBP/INR", "105.78", "30 Jun 2026", "XE.com"],
        ["JPY/INR", "0.53", "30 Jun 2026", "XE.com"],
        ["AUD/INR", "55.20", "30 Jun 2026", "XE.com"],
      ],
    },
  ],
};
export const STD_STAGE3_COMPLETED: StageData = {
  id: 3,
  title: "Stage 3: Data Validation and Quality Checks",
  purpose: "Ensure completeness and correctness",
  status: "completed",
  componentType: "data_validation",
  validationChecks: [
    {
      title: "Source file validation",
      description: "All required source files available and validated.",
      result: "4/4 files valid",
      status: "passed",
    },
    {
      title: "Provision validation",
      description:
        "2WM/3WM classification and provision calculations completed successfully.",
      result: "100% records processed",
      status: "passed",
    },
    {
      title: "Currency validation",
      description:
        "Foreign currency transactions converted using approved XE exchange rates.",
      result: "Rates applied successfully",
      status: "passed",
    },
    {
      title: "Master data validation",
      description: "Media Cost Center mapping completed and validated.",
      result: "Mapping completed",
      status: "passed",
    },
    {
      title: "Journal balance check",
      description:
        "P&L Debit and Liability Credit values reconciled successfully.",
      result: "Net Difference: INR 0.00",
      status: "passed",
    },
    {
      title: "Exception check",
      description:
        "Exception records identified and tagged as per business rules.",
      result: "All exceptions classified",
      status: "passed",
    },
  ],
};
const GIT_STAGE3_COMPLETED: StageData = {
  id: 3,
  title: "Stage 3: Data Validation and Quality Checks",
  purpose: "Ensure completeness and correctness",
  status: "completed",
  componentType: "data_validation",
  validationChecks: [
    {
      title: "Source file validation",
      description: "All required source files available and validated.",
      result: "6/6 files valid",
      status: "passed",
    },
    {
      title: "Import Tracker validation",
      description:
        "Incoterm, ETA, open quantity and movement status checks completed successfully.",
      result: "100% eligible records processed",
      status: "passed",
    },
    {
      title: "PLB validation",
      description:
        "BNG, location, material status and movement checks completed successfully.",
      result: "100% records validated",
      status: "passed",
    },
    {
      title: "Journal balance check",
      description:
        "Import Tracker and PLB balances reconciled to GIT summary successfully.",
      result: "Net Difference: IDR 0.00",
      status: "passed",
    },
    {
      title: "Currency validation",
      description:
        "Foreign currency transactions converted using approved exchange rates.",
      result: "Rates applied successfully",
      status: "passed",
    },
  ],
};


export const STD_STAGE3_FAILED: StageData = {
  id: 3,
  title: "Stage 3: Data Validation and Quality Checks",
  purpose: "Ensure completeness and correctness",
  status: "failed",
  componentType: "data_validation",
  exceptionType: "validation_failed",
  exceptionTitle: "Validation Failed: Profit Center Validation Check",
  exceptionMessage:
    "The system has detected a data validation exception during the Profit Center Validation process.\nIssue: One or more Profit Centers in the uploaded file are either inactive or not mapped to the specified Business Area.\nDetails are below:\n\n\u2022 Company Code: IN01\n\u2022 Business Area: C003\n\u2022 Invalid Profit Center: PC10005678\n\u2022 Validation Status: Mapping Not Found\n\u2022 Posting Month: Apr-26\n\nThe journal cannot be processed until a valid Profit Center mapping is provided. Please update the source file and rerun the validation.",
  exceptionActionButtons: [
    "Re-Run Agent",
    "Select a different SOP",
    "Ignore this step",
  ],
  agentMessages: [
    {
      role: "agent",
      content:
        "The system has detected a data validation exception during the Profit Center Validation process.\nIssue: One or more Profit Centers in the uploaded file are either inactive or not mapped to the specified Business Area.\nDetails are below:\n\n\u2022 Company Code: IN01\n\u2022 Business Area: C003\n\u2022 Invalid Profit Center: PC10005678\n\u2022 Validation Status: Mapping Not Found\n\u2022 Posting Month: Apr-26\n\nThe journal cannot be processed until a valid Profit Center mapping is provided. Please update the source file and rerun the validation.",
      timestamp: "08 June 2026, 03:44 UTC",
    },
  ],
};

// Stage 4 — all 20 rows passed; JETemplate paginates at 10 per page
export const GIT_JE_POSTING_ROWS = [
  {
    poNumber: "4531007821",
    materialCode: "70124589",
    materialDescription: "Premium Green Tea Extract Concentrate",
    businessUnit: "Foods",
    incoterm: "CIF",
    totalValue: "1,285,450,000",
  },
  {
    poNumber: "4531007822",
    materialCode: "68123477",
    materialDescription: "Advanced Moisturizing Lotion Base Formula",
    businessUnit: "Beauty & Wellbeing",
    incoterm: "FOB",
    totalValue: "875,320,500",
  },
  {
    poNumber: "4531007823",
    materialCode: "69231841",
    materialDescription: "High Density Packaging Film Roll 25 Micron",
    businessUnit: "Home Care",
    incoterm: "FCA",
    totalValue: "458,920,000",
  },
  {
    poNumber: "4531007824",
    materialCode: "64587231",
    materialDescription: "Natural Citrus Fragrance Blend",
    businessUnit: "Personal Care",
    incoterm: "EXW",
    totalValue: "215,780,250",
  },
  {
    poNumber: "4531007825",
    materialCode: "67895412",
    materialDescription: "Liquid Detergent Surfactant Compound",
    businessUnit: "Home Care",
    incoterm: "CIF",
    totalValue: "1,042,650,900",
  },
  {
    poNumber: "4531007826",
    materialCode: "63457892",
    materialDescription: "Shea Butter Cosmetic Grade Refined",
    businessUnit: "Beauty & Wellbeing",
    incoterm: "FOB",
    totalValue: "692,114,750",
  },
];

// ── GIT Stage 4 JE Template Data (from git-stage4-data.json) ──
type GitStage4Raw = {
  file_name: string;
  description: string;
  sheet_name: string;
  field_labels: Record<string, string>;
  header: Record<string, string | null>;
  line_items: Record<string, string | null>[];
  total_line_items: number;
};
const gitStage4Data = gitStage4Raw as unknown as GitStage4Raw;

// Document-level (header) fields that carry data in git-stage4-data.json
const GIT_STAGE4_HEADER_KEYS = [
  "JRNDOCCAT",
  "JRNDOCUMENTTYPEU",
  "JRNDOCUMENTDATE",
  "JRNPOSTINGDATE",
  "JRNPOSTINGPERIOD",
  "JRNDOCHEADERTEXT",
  "JRNHEADERCOMPANYCODE",
  "JRNCURRENCY",
  "JRNTRANSLATIONDATE",
  "JRNREVERSALREASONU",
  "JRNREVERSALDATE",
  "JRNCALCTAX",
];

// Line-item fields that carry data in git-stage4-data.json
const GIT_STAGE4_LINE_ITEM_KEYS = [
  "JRNLPOSTINGKEY",
  "JRNLACCOUNT",
  "JRNLAMOUNTINDOCCURR",
  "JRNLPROFITCENTER",
  "JRNLLINEITEMTEXT",
];

const GIT_STAGE4_COLUMNS: { key: string; label: string }[] = [
  ...GIT_STAGE4_HEADER_KEYS,
  ...GIT_STAGE4_LINE_ITEM_KEYS,
].map((key) => ({ key, label: gitStage4Data.field_labels[key] || key }));

const GIT_STAGE4_HEADER_ROW: Record<string, string> = GIT_STAGE4_HEADER_KEYS.reduce(
  (acc, key) => {
    const val = gitStage4Data.header[key];
    acc[key] = val == null ? "" : String(val);
    return acc;
  },
  {} as Record<string, string>,
);

const GIT_STAGE4_LINE_ITEMS: Record<string, string>[] = gitStage4Data.line_items.map((item) => {
  const row: Record<string, string> = {};
  GIT_STAGE4_COLUMNS.forEach((col) => {
    const val = item[col.key];
    row[col.key] = val == null ? "" : String(val);
  });
  return row;
});

const GIT_JE_TEMPLATE_DATA: GitJETemplateData = {
  columns: GIT_STAGE4_COLUMNS,
  headerRow: GIT_STAGE4_HEADER_ROW,
  lineItems: GIT_STAGE4_LINE_ITEMS,
  totalLineItems: gitStage4Data.total_line_items,
};

const GIT_STAGE4_SUBMITTED: StageData = {
  id: 4,
  title: "Stage 4: JE Template Generation",
  purpose: "Build structured JE draft",
  status: "in_progress",
  componentType: "je_template",
  approvalStatus: "pending",
  approvalDetails: "Email sent to: je-owner@company.com",
  totalRecordsCount: gitStage4Data.total_line_items,
  gitJETemplateData: GIT_JE_TEMPLATE_DATA,
};

export const GIT_STAGE4_APPROVED: StageData = {
  id: 4,
  title: "Stage 4: JE Template Generation",
  purpose: "Build structured JE draft",
  status: "completed",
  componentType: "je_template",
  approvalStatus: "approved",
  approvalDetails: "Approved by John Doe - 17 June 2026, 04:50 CST",
  totalRecordsCount: gitStage4Data.total_line_items,
  gitJETemplateData: GIT_JE_TEMPLATE_DATA,
};

export const STD_STAGE4_SUBMITTED: StageData = {
  id: 4,
  title: "Stage 4: JE Template Generation",
  purpose: "Build structured JE draft",
  status: "in_progress",
  componentType: "je_template",
  approvalStatus: "pending",
  approvalDetails: "Email sent to: je-owner@company.com",
  totalRecordsCount: STD_JE_POSTING_TOTAL,
  stdJEPostingData: STD_JE_POSTING_ROWS,
};

export const STD_STAGE4_APPROVED: StageData = {
  id: 4,
  title: "Stage 4: JE Template Generation",
  purpose: "Build structured JE draft",
  status: "completed",
  componentType: "je_template",
  approvalStatus: "approved",
  approvalDetails: "Approved by John Doe - 17 June 2026, 02:22 CST",
  totalRecordsCount: STD_JE_POSTING_TOTAL,
  stdJEPostingData: STD_JE_POSTING_ROWS,
};

export const STD_STAGE4_PENDING: StageData = {
  id: 4,
  title: "Stage 4: JE Template Generation",
  purpose: "Build structured JE draft",
  status: "pending",
  componentType: "je_template",
};

export const GIT_STAGE5_SHOWING: StageData = {
  id: 5,
  title: "Stage 5: Upload to ERP",
  purpose: "Upload the JE in ERP (Blackline)",
  status: "completed",
  componentType: "upload_erp",
  uploadTarget: "Blackline",
  uploadBatchId: "BATCH-20260612-00441",
  uploadDate: "17 Jun, 2026, 16:00 UTC",
  notificationEmail: "je-operations@company.com",
};

const STD_STAGE5_SHOWING: StageData = {
  id: 5,
  title: "Stage 5: Upload to ERP",
  purpose: "Upload the JE in ERP (Blackline)",
  status: "completed",
  componentType: "upload_erp",
  uploadTarget: "Blackline",
  uploadBatchId: "BATCH-20260612-00441",
  uploadDate: "17 Jun, 2026, 16:00 UTC",
  notificationEmail: "je-operations@company.com",
};

export const STD_STAGE5_COMPLETED: StageData = {
  ...STD_STAGE5_SHOWING,
  status: "completed" as const,
};

export const STD_STAGE5_PENDING: StageData = {
  id: 5,
  title: "Stage 5: Upload to ERP",
  purpose: "Upload the JE in ERP (SAP)",
  status: "pending",
  componentType: "upload_erp",
};

export const STATIC_STANDARD_DETAIL_STAGES: StageData[] = [
  STD_STAGE1_COMPLETED,
  STD_STAGE2_COMPLETED,
  STD_STAGE3_COMPLETED,
  STD_STAGE4_APPROVED,
  STD_STAGE5_COMPLETED,
];

// ── GIT Stage 2 — build from git-stage2-data.json ────────────────────────────
type GitStage2Source = {
  file_name: string;
  description: string;
  columns: string[];
  total_records: number;
  data: Record<string, unknown>[];
};
type GitStage2Json = Record<string, GitStage2Source>;
const gitStage2Data = gitStage2Raw as unknown as GitStage2Json;

const GIT_STAGE2_SOURCES = Object.values(gitStage2Data);

// PLB/BNG (sources 4 & 5) are raw exports with unlabeled "Unnamed: N" columns, mostly
// empty, where the real header text ended up as the first data row — normalize those
// into a single clean "PO Number" column instead of showing the raw artifacts.
const buildGitPreviewTable = (
  s: GitStage2Source,
  maxCols?: number,
  maxRows?: number,
): { columns: string[]; rows: string[][] } => {
  const isRawUnnamed = s.columns.every((c) => c.startsWith("Unnamed"));

  if (isRawUnnamed) {
    const populatedCol = s.columns.find((col) =>
      s.data.some((row) => row[col] != null),
    );
    const values = populatedCol
      ? s.data.map((row) => row[populatedCol]).filter((v) => v != null)
      : [];
    // First populated value is the embedded column header (e.g. "Cust Ref#1 PO"), not real data
    const rows = values.slice(1, maxRows ? maxRows + 1 : undefined).map((v) => [String(v)]);
    return { columns: populatedCol ? ["PO Number"] : [], rows };
  }

  const displayCols = s.columns
    .filter((c) => !c.startsWith("Unnamed"))
    .filter((c) => s.data.some((row) => row[c] != null && row[c] !== ""))
    .slice(0, maxCols ?? s.columns.length);
  const rows = s.data.slice(0, maxRows ?? s.data.length).map((row) =>
    displayCols.map((col) => {
      const val = row[col];
      return val == null ? "" : String(val);
    }),
  );
  return { columns: displayCols, rows };
};

const GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE: ExtractedField[][] = [
  // Import Tracker
  [
    { label: "Total Records", value: String(GIT_STAGE2_SOURCES[0].total_records) },
    { label: "Report", value: "Import Tracker" },
    { label: "Unique Vendors", value: "8" },
    { label: "Primary Currency", value: "USD" },
    { label: "Open Shipments", value: "11" },
    { label: "Period", value: "May 2026" },
  ],
  // PO List
  [
    { label: "Total Records", value: String(GIT_STAGE2_SOURCES[1].total_records) },
    { label: "Report", value: "PO List" },
    { label: "Company Codes", value: "2408, 5659" },
    { label: "Primary Currency", value: "USD" },
    { label: "Material Groups", value: "8" },
    { label: "Period", value: "May 2026" },
  ],
  // MB51 Movement Indicator
  [
    { label: "Total Records", value: String(GIT_STAGE2_SOURCES[2].total_records) },
    { label: "Report", value: "MB51 Movement Indicator" },
    { label: "Plants", value: "9000, 9003, 9006, 9013" },
    { label: "Movement Type", value: "101 (GR goods receipt)" },
    { label: "Primary Currency", value: "IDR" },
    { label: "Period", value: "May 2026" },
  ],
  // PLB
  [
    { label: "Total Records", value: String(GIT_STAGE2_SOURCES[3].total_records) },
    { label: "Report", value: "PLB (Port Logistic Base)" },
    { label: "Unique POs", value: "23" },
    { label: "Data Type", value: "PO Reference List" },
    { label: "Period", value: "May 2026" },
  ],
  // BNG
  [
    { label: "Total Records", value: String(GIT_STAGE2_SOURCES[4].total_records) },
    { label: "Report", value: "BNG (Booked Not GR)" },
    { label: "Unique POs", value: "20" },
    { label: "Data Type", value: "PO Reference List" },
    { label: "Period", value: "May 2026" },
  ],
];

export const STD_STAGE2_MISSING_DATA: StageData = {
  id: 2,
  title: "Stage 2: Data Extraction",
  purpose: "Pull transactional/aggregated data",
  status: "in_progress",
  componentType: "data_extraction",
  extractedCount: 5,
  totalRecords: GIT_STAGE2_SOURCES.reduce((sum, s) => sum + s.total_records, 0),
  sources: GIT_STAGE2_SOURCES.map((s) => ({
    type: "SHAREDRIVE" as const,
    name: s.file_name,
    date: "30 May 2026",
    status: "success" as const,
  })),
  confidenceScore: 91,
  extractedFields: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE[0],
  extractedFieldsBySource: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE,
  sourcePreviewTables: GIT_STAGE2_SOURCES.map((s, idx) => {
    const { columns, rows } = buildGitPreviewTable(s);
    return {
      fileName: s.file_name,
      columns,
      rows,
      extractedFields: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE[idx],
    } as SourcePreviewTable;
  }),
  exceptionType: "missing_data",
  exceptionTitle: "Exception - Missing Data",
  exceptionMessage:
    "The system has encountered a missing data exception: the Material Code and GR Qty for **PO Number 4530138712 (Vendor: SYENSQO ASIA PACIFIC PTE LTD, Material Description: BRIJ 78/STEARETH20/VOLPOS20)** are not available in the Import Tracker report. Please provide the missing information or upload an updated file containing the required details.",
  exceptionActionButtons: [
    "Skip this step",
    "Retry fetching the data",
    "Use last available report",
  ],
  agentMessages: [
    {
      role: "agent",
      content:
        "The system has encountered a missing data exception: the Material Code and GR Qty for **PO Number 4530138712 (Vendor: SYENSQO ASIA PACIFIC PTE LTD, Material Description: BRIJ 78/STEARETH20/VOLPOS20)** are not available in the Import Tracker report. Please provide the missing information or upload an updated file containing the required details.",
      timestamp: "30 May 2026, 03:40 CST",
    },
  ],
};

export const STD_STAGE2_RESOLVED: StageData = {
  id: 2,
  title: "Stage 2: Data Extraction",
  purpose: "Pull transactional/aggregated data",
  status: "completed",
  componentType: "data_extraction",
  extractedCount: 5,
  totalRecords: GIT_STAGE2_SOURCES.reduce((sum, s) => sum + s.total_records, 0),
  sources: GIT_STAGE2_SOURCES.map((s) => ({
    type: "SHAREDRIVE" as const,
    name: s.file_name,
    date: "30 May 2026",
    status: "success" as const,
  })),
  confidenceScore: 93,
  extractedFields: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE[0],
  extractedFieldsBySource: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE,
  sourcePreviewTables: GIT_STAGE2_SOURCES.map((s) => {
    const { columns, rows } = buildGitPreviewTable(s, 7, 5);
    return {
      fileName: s.file_name,
      columns,
      rows,
    };
  }),
};
export const STD_STAGE2_WITH_EXCEL: StageData = {
  id: 2,
  title: "Stage 2: Data Extraction",
  purpose: "Pull transactional/aggregated data",
  status: "completed",
  componentType: "data_extraction",
  extractedCount: 2,
  totalRecords: 123,
  sources: [
    {
      type: "EMAIL",
      name: "BEX Input File.xlsx",
      date: "01 Jun 2026",
      status: "success",
    },
    {
      type: "EMAIL",
      name: "Sales Reclass JV_May\'26.xlsx",
      date: "01 Jun 2026",
      status: "success",
    },
  ],
  confidenceScore: 95,
  extractedFields: [
    { label: "Company Code", value: "IN01" },
    { label: "Business Area", value: "C003" },
    { label: "Posting Month", value: "Apr-26" },
    { label: "Currency", value: "INR" },
    { label: "Document Text", value: "Sales Reclass Apr-26" },
  ],
  sourcePreviewTables: [
    {
      fileName: "BEX Input File.xlsx",
      columns: ["Company Code", "Profit Center", "Business Area", "Amount", "Currency", "Document Text", "Posting Month"],
      rows: [
        ["IN01", "PC10001234", "C003", "-1250000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "PC10002345", "C003", "-875000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "PC10003456", "C003", "-560000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "PC10004567", "C003", "-2300000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "PC10005678", "C003", "-415000", "INR", "Sales Reclass Apr-26", "Apr-26"],
      ],
    },
    {
      fileName: "Sales Reclass JV_May\'26.xlsx",
      columns: ["Company Code", "GL Account", "Profit Center", "Amount", "Currency", "Document Text", "Posting Month"],
      rows: [
        ["IN01", "5140312", "PC10001234", "-1250000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "2110146", "PC10001234", "1250000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "5140312", "PC10002345", "-875000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "2110146", "PC10002345", "875000", "INR", "Sales Reclass Apr-26", "Apr-26"],
        ["IN01", "5140312", "PC10003456", "-560000", "INR", "Sales Reclass Apr-26", "Apr-26"],
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// AD-HOC PATH RESULTS (Stages 1–7)
// ═══════════════════════════════════════════════════════════════════════════════

export const ADHOC_STAGE1_ACTION_REQUIRED: StageData = {
  id: 1,
  title: "Stage 1: Identifying Intent",
  purpose: "Understand journal request",
  status: "in_progress",
  componentType: "identifying_intent",
  intentDetails: [
    { label: "Email received", value: "" },
    { label: "Intent identified", value: "Balance write-off request" },
    { label: "Account", value: "140210 (Accounts Receivable)" },
    { label: "Customer / Reference", value: "ABC Corp" },
    {
      label: "Reason captured",
      value: "Unrecoverable balance / aged > 180 days",
    },
  ],
  exceptionType: "missing_attachment",
  exceptionTitle: "Data source: Missing Email Attachment",
  exceptionMessage:
    "The system has encountered missing e-mail attachment exception: Aging Report (.xlsx) for customer ABC Corp (Customer ID: CUST1001, Invoice: INV-8891) referenced in the email is not available. Please provide the file or share an updated report with the relevant details.",
  exceptionActionButtons: ["Skip this step", "Re-look for attachment"],
  agentMessages: [
    {
      role: "agent",
      content:
        "The system has encountered missing e-mail attachment exception: Aging Report (.xlsx) for customer ABC Corp (Customer ID: CUST1001, Invoice: INV-8891) referenced in the email is not available. Please provide the file or share an updated report with the relevant details.",
      timestamp: "08 June 2026, 03:44 CST",
    },
  ],
};

export const ADHOC_STAGE1_COMPLETED: StageData = {
  id: 1,
  title: "Stage 1: Identifying Intent",
  purpose: "Understand journal request",
  status: "completed",
  componentType: "identifying_intent",
  intentDetails: [
    { label: "Email received", value: "" },
    { label: "Intent identified", value: "Balance write-off request" },
    { label: "Account", value: "140210 (Accounts Receivable)" },
    { label: "Customer / Reference", value: "ABC Corp" },
    {
      label: "Reason captured",
      value: "Unrecoverable balance / aged > 180 days",
    },
    { label: "Data source", value: "Email attachment (aging report)" },
    { label: "Required action", value: "Write off outstanding balance" },
  ],
};

export const ADHOC_STAGE2_SOP_SELECTION: StageData = {
  id: 2,
  title: "Stage 2: Classifying Journal Entry and Mapping SOP",
  purpose: "Identify journal type and apply standard procedure",
  status: "in_progress",
  componentType: "sop_classification",
  sopClassification: "Accrual Details",
  sopIdentified: "posting the accrual journal",
  exceptionType: "sop_selection",
  sopOptions: [
    {
      id: "sop-1",
      name: "SOP-BIL-02: Service Invoice Creation",
      confidenceScore: 92,
    },
    {
      id: "sop-2",
      name: "SOP-BIL-03: Credit Memo Processing",
      confidenceScore: 88,
    },
    {
      id: "sop-3",
      name: "SOP-COL-01: Accrual Details",
      confidenceScore: 85,
    },
    {
      id: "sop-4",
      name: "SOP-REV-04: Revenue Recognition Adjustments",
      confidenceScore: 78,
    },
    {
      id: "sop-5",
      name: "SOP-TAX-02: Tax Provision Entries",
      confidenceScore: 71,
    },
  ],
};

export const ADHOC_STAGE2_SOP_COMPLETED: StageData = {
  id: 2,
  title: "Stage 2: Classifying Journal Entry and Mapping SOP",
  purpose: "Identify journal type and apply standard procedure",
  status: "completed",
  componentType: "sop_classification",
  sopClassification: "Accrual Details",
  sopIdentified: "Posting the accrual journal",
  sopName: "SOP-COL-01: Accrual Details",
  sopConfidenceScore: 85,
  adHocPreparationData: AD_HOC_PREP_ROWS,
};

// Business rules stage removed from ad-hoc flow

export const ADHOC_STAGE3_DATA_EXTRACTION: StageData = {
  id: 3,
  title: "Stage 3: Data Extraction",
  purpose: "Pull transactional/aggregated data",
  status: "completed",
  componentType: "data_extraction",
  extractedCount: 1,
  totalRecords: 2,
  sources: [
    {
      type: "EMAIL",
      name: "Ageing-Report.xlsx",
      date: "17 Jun 2026",
      status: "success",
    },
  ],
  confidenceScore: 90,
  extractedFields: [
    { label: "Customer Name", value: "ABC Corp" },
    { label: "Customer ID", value: "CUST1001" },
    { label: "Account Number", value: "140210" },
    { label: "Account Name", value: "Accounts Receivable" },
    { label: "Amount", value: "25780" },
    { label: "Currency", value: "USD" },
  ],
};

export const ADHOC_STAGE4_VALIDATION: StageData = {
  id: 4,
  title: "Stage 4: Data Validation and Quality Checks",
  purpose: "Ensure completeness and correctness",
  status: "completed",
  componentType: "data_validation",
  validationChecks: [
    {
      title: "Account validation",
      description:
        "Write-off account (140210 - Accounts Receivable) and expense account (Bad Debt Expense) verified in Chart of Accounts",
      result: "Verified",
      status: "passed",
    },
    {
      title: "Debit/credit balance check",
      description:
        "Debit ($25,780) = Credit ($25,780) \u2192 Balanced (Net: $0.00)",
      result: "Balanced",
      status: "passed",
    },
    {
      title: "Supporting documentation check",
      description:
        "Aging report (>180 days) and write-off justification validated from email attachment",
      result: "Validated",
      status: "passed",
    },
    {
      title: "Threshold & approval compliance",
      description:
        "Amount ($25,780) within predefined write-off approval limits \u2192 No escalation required",
      result: "Compliant",
      status: "passed",
    },
  ],
};

// Ad-hoc Stage 6 — ALL 16 posting records, pagination handled in JETemplate
export const ADHOC_STAGE5_SUBMITTED: StageData = {
  id: 5,
  title: "Stage 5: JE Template Generation",
  purpose: "Build structured JE draft",
  status: "in_progress",
  componentType: "je_template",
  totalRecordsCount: STD_JE_POSTING_TOTAL,
  stdJEPostingData: STD_JE_POSTING_ROWS,
  approvalStatus: "pending",
  approvalDetails: "Email sent to: je-owner@company.com",
};

export const ADHOC_STAGE5_APPROVED: StageData = {
  id: 5,
  title: "Stage 5: JE Template Generation",
  purpose: "Build structured JE draft",
  status: "completed",
  componentType: "je_template",
  totalRecordsCount: STD_JE_POSTING_TOTAL,
  stdJEPostingData: STD_JE_POSTING_ROWS,
  approvalStatus: "approved",
  approvalDetails: "Approved by John Doe - 17 June 2026, 02:22 UTC",
};

export const ADHOC_STAGE6_SHOWING: StageData = {
  id: 6,
  title: "Stage 6: Upload to ERP",
  purpose: "Upload the JE in ERP (SAP)",
  status: "in_progress",
  componentType: "upload_erp",
  uploadBatchId: "BATCH-20260612-00441",
  uploadDate: "17 Jun, 2026, 16:00 UTC",
  notificationEmail: "je-operations@company.com",
};

export const ADHOC_STAGE6_COMPLETED: StageData = {
  ...ADHOC_STAGE6_SHOWING,
  status: "completed" as const,
};


// ═══════════════════════════════════════════════════════════════════════════════
// GIT STAGE 2 HAPPY (Goods in Transit - standard happy path)
// ═══════════════════════════════════════════════════════════════════════════════

export const GIT_STAGE2_HAPPY: StageData = {
  id: 2,
  title: "Stage 2: Data Extraction",
  purpose: "Pull transactional/aggregated data",
  status: "completed",
  componentType: "data_extraction",
  extractedCount: 5,
  totalRecords: GIT_STAGE2_SOURCES.reduce((sum, s) => sum + s.total_records, 0),
  sources: GIT_STAGE2_SOURCES.map((s) => ({
    type: "SHAREDRIVE" as const,
    name: s.file_name,
    date: "30 May 2026",
    status: "success" as const,
  })),
  confidenceScore: 94,
  extractedFields: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE[0],
  extractedFieldsBySource: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE,
  sourcePreviewTables: GIT_STAGE2_SOURCES.map((s, idx) => {
    const { columns, rows } = buildGitPreviewTable(s);
    return {
      fileName: s.file_name,
      columns,
      rows,
      extractedFields: GIT_STAGE2_EXTRACTED_FIELDS_BY_SOURCE[idx],
    } as SourcePreviewTable;
  }),
};

// ── Media BD Open DO Provision — temporary Stage 1 & 2 data ──────────────────
const MEDIA_BD_BUSINESS_RULE_CATEGORIES = [
  {
    title: "Source File Requirements",
    status: "completed" as const,
    items: [
      "SAP YMM234 Open DO Report (24 months)",
      "XE.com exchange rates for foreign currency conversion",
      "Media Cost Center master file from HUL-HO",
      "Consolidated Open DO Report for provision calculation",
    ],
  },
  {
    title: "Processing Rules",
    status: "completed" as const,
    items: [
      "Consolidate monthly Open DO reports into a single dataset",
      "Exclude WBS Elements starting with \"E\"",
      "Exclude Brand Codes A999, Z999, and Y999",
      "Classify DOs as 2WM or 3WM based on GR-Based Invoice Verification",
      "Calculate provision based on DO type and currency",
      "Set provision amount to 0 for future-dated POs",
      "Identify Media Cost Centers using the mapping file",
    ],
  },
  {
    title: "Validation Rules",
    status: "completed" as const,
    items: [
      "Consolidated totals must match source reports",
      "XE exchange rates must be applied to foreign currency transactions",
      "Media Cost Center mapping must be validated",
      "Journal Entry must balance (P&L Dr = Liability Cr 1442402)",
      "Reviewer approval required before posting",
    ],
  },
  {
    title: "Exception Rules",
    status: "completed" as const,
    items: [
      "Deletion Indicator = L → Cancelled DO",
      "Delivery Complete Indicator = X → Delivery Completed",
      "Blank Internal Order → Blank Internal Order",
      "Missing Media Cost Center → Not Related to Media",
      "Zero Provision → Nil Balance",
      "Negative Provision → Forex Diff / Service Tax Diff",
      "Missing stakeholder confirmation → Apply YTD provision formula",
    ],
  },
];

const MEDIA_BD_STAGE1_COMPLETED: StageData = {
  id: 1,
  title: "Stage 1: Reading Business Rules",
  purpose:
    "Fetch accounting logic (mapping, policies, thresholds, posting rules)",
  status: "completed",
  componentType: "business_rules",
  businessRuleCategories: MEDIA_BD_BUSINESS_RULE_CATEGORIES,
};

const MEDIA_BD_STAGE2_MISSING_DATA: StageData = {
  id: 2,
  title: "Stage 2: Data Extraction",
  purpose: "Pull transactional/aggregated data",
  status: "in_progress",
  componentType: "data_extraction",
  extractedCount: 3,
  totalRecords: 154,
  sources: [
    {
      type: "SAP" as const,
      name: "YMM234 Open DO Report.xlsx",
      date: "17 Jun 2026",
      status: "success" as const,
    },
    {
      type: "SHAREDRIVE" as const,
      name: "Consolidated Open DO Report.xlsx",
      date: "17 Jun 2026",
      status: "success" as const,
    },
    {
      type: "SHAREDRIVE" as const,
      name: "XE Currency Rates.xlsx",
      date: "17 Jun 2026",
      status: "success" as const,
    },
  ],
  confidenceScore: 88,
  extractedFields: [
    { label: "Total Number of POs", value: "12" },
    { label: "Total Pending PO Quantity", value: "450" },
    { label: "Highest Basic Price", value: "₹850,000 (PO100045)" },
    { label: "Unique Cost Centers", value: "7" },
    { label: "Highest Pending PO Quantity", value: "180 (PO100045)" },
  ],
  sourcePreviewTables: [
    {
      fileName: "YMM234 Open DO Report.xlsx",
      columns: ["Document Date", "PO Number", "Purchasing Doc Type", "Cost Center", "WBS Element"],
      rows: [
        ["30 June 2026", "PO100045", "ZPAR", "CC20001", "WBS001"],
        ["28 June 2026", "PO100046", "ZARS", "CC20002", "WBS002"],
        ["27 June 2026", "PO100047", "ZCIM", "CC20003", "WBS003"],
        ["26 June 2026", "PO100048", "ZCDO", "CC20004", "WBS004"],
        ["25 June 2026", "PO100049", "ZAIS", "CC20005", "WBS005"],
      ],
    },
    {
      fileName: "Consolidated Open DO Report.xlsx",
      columns: ["PO Number", "Vendor Name", "Material Group", "Pending Qty", "Basic Price", "Currency"],
      rows: [
        ["PO100045", "HUL Media Supplier A", "Advertising Materials", "180", "850,000", "INR"],
        ["PO100046", "HUL Media Supplier B", "Promotional Items", "95", "420,000", "INR"],
        ["PO100047", "HUL Media Supplier C", "Printing", "75", "310,000", "INR"],
        ["PO100048", "HUL Media Supplier D", "Digital", "60", "280,000", "INR"],
        ["PO100049", "HUL Media Supplier E", "Events", "40", "215,000", "USD"],
      ],
    },
    {
      fileName: "XE Currency Rates.xlsx",
      columns: ["Currency Pair", "Rate", "Effective Date", "Source"],
      rows: [
        ["USD/INR", "83.45", "30 Jun 2026", "XE.com"],
        ["EUR/INR", "90.12", "30 Jun 2026", "XE.com"],
        ["GBP/INR", "105.78", "30 Jun 2026", "XE.com"],
        ["JPY/INR", "0.53", "30 Jun 2026", "XE.com"],
        ["AUD/INR", "55.20", "30 Jun 2026", "XE.com"],
      ],
    },
  ],
  exceptionType: "missing_data",
  exceptionTitle: "Exception - Incomplete Data",
  exceptionMessage:
    "The system has encountered incomplete data for **Media Cost Center CC20006**. The Consolidated Open DO Report is missing cost center mapping details for 3 purchase orders. Please provide the updated mapping file or provide the missing details manually.",
  exceptionActionButtons: [
    "Skip this step",
    "Retry fetching the data",
    "Use last available report",
  ],
  agentMessages: [
    {
      role: "agent",
      content:
        "The system has encountered incomplete data for **Media Cost Center CC20006**. The Consolidated Open DO Report is missing cost center mapping details for 3 purchase orders. Please provide the updated mapping file or provide the missing details manually.",
      timestamp: "17 Jun 2026, 10:35 CST",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PATH TYPES & RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

export type JEPath =
  | "standard-happy"
  | "standard-failure"
  | "standard-action-required"
  | "adhoc-happy"
  | "adhoc-action-required";

export const PATH_STAGE_RESULTS: Record<JEPath, StageData[]> = {
  "standard-happy": [
    STD_STAGE1_COMPLETED,
    GIT_STAGE2_HAPPY,
    GIT_STAGE3_COMPLETED,
    GIT_STAGE4_SUBMITTED,
    GIT_STAGE5_SHOWING,
  ],
  "standard-failure": [
    SALES_RECLASS_STAGE1_COMPLETED,
    STD_STAGE2_WITH_EXCEL,
    STD_STAGE3_FAILED,
    STD_STAGE4_PENDING,
    STD_STAGE5_PENDING,
  ],
  "standard-action-required": [
    STD_STAGE1_COMPLETED,
    STD_STAGE2_MISSING_DATA,
    STD_STAGE3_COMPLETED,
    STD_STAGE4_SUBMITTED,
    STD_STAGE5_SHOWING,
  ],
  "adhoc-happy": [
    ADHOC_STAGE1_COMPLETED,
    ADHOC_STAGE2_SOP_COMPLETED,
    ADHOC_STAGE3_DATA_EXTRACTION,
    ADHOC_STAGE4_VALIDATION,
    ADHOC_STAGE5_SUBMITTED,
    ADHOC_STAGE6_SHOWING,
  ],
  "adhoc-action-required": [
    ADHOC_STAGE1_ACTION_REQUIRED,
    ADHOC_STAGE2_SOP_SELECTION,
    ADHOC_STAGE3_DATA_EXTRACTION,
    ADHOC_STAGE4_VALIDATION,
    ADHOC_STAGE5_SUBMITTED,
    ADHOC_STAGE6_SHOWING,
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// INITIAL STAGES — for pending records
// ═══════════════════════════════════════════════════════════════════════════════

const INITIAL_STAGES_STANDARD: StageData[] = [
  {
    id: 1,
    title: "Stage 1: Reading Business Rules",
    purpose:
      "Fetch accounting logic (mapping, policies, thresholds, posting rules)",
    status: "in_progress",
    componentType: "business_rules",
  },
  {
    id: 2,
    title: "Stage 2: Data Extraction",
    purpose: "Pull transactional/aggregated data",
    status: "pending",
    componentType: "data_extraction",
  },
  {
    id: 3,
    title: "Stage 3: Data Validation and Quality Checks",
    purpose: "Ensure completeness and correctness",
    status: "pending",
    componentType: "data_validation",
  },
  {
    id: 4,
    title: "Stage 4: JE Template Generation",
    purpose: "Build structured JE draft",
    status: "pending",
    componentType: "je_template",
  },
  {
    id: 5,
    title: "Stage 5: Upload to ERP",
    purpose: "Upload the JE in ERP (SAP)",
    status: "pending",
    componentType: "upload_erp",
  },
];

const INITIAL_STAGES_ADHOC: StageData[] = [
  {
    id: 1,
    title: "Stage 1: Identifying Intent",
    purpose: "Understand journal request",
    status: "in_progress",
    componentType: "identifying_intent",
  },
  {
    id: 2,
    title: "Stage 2: Classifying Journal Entry and Mapping SOP",
    purpose: "Identify journal type and apply standard procedure",
    status: "pending",
    componentType: "sop_classification",
  },
  {
    id: 3,
    title: "Stage 3: Data Extraction",
    purpose: "Pull transactional/aggregated data",
    status: "pending",
    componentType: "data_extraction",
  },
  {
    id: 4,
    title: "Stage 4: Data Validation and Quality Checks",
    purpose: "Ensure completeness and correctness",
    status: "pending",
    componentType: "data_validation",
  },
  {
    id: 5,
    title: "Stage 5: JE Template Generation",
    purpose: "Build structured JE draft",
    status: "pending",
    componentType: "je_template",
  },
  {
    id: 6,
    title: "Stage 6: Upload to ERP",
    purpose: "Upload the JE in ERP (SAP)",
    status: "pending",
    componentType: "upload_erp",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-LOADED STAGE SNAPSHOTS
// ═══════════════════════════════════════════════════════════════════════════════

const PRELOADED_STD_FAILED: StageData[] = [
  { ...SALES_RECLASS_STAGE1_COMPLETED },
  { ...STD_STAGE2_WITH_EXCEL },
  { ...STD_STAGE3_FAILED },
  { ...STD_STAGE4_PENDING },
  { ...STD_STAGE5_PENDING },
];

export const PRELOADED_GIT_ACTION_REQUIRED: StageData[] = [
  { ...GIT_STAGE1_COMPLETED },
  { ...STD_STAGE2_MISSING_DATA },
  {
    id: 3,
    title: "Stage 3: Data Validation and Quality Checks",
    purpose: "Ensure completeness and correctness",
    status: "pending",
    componentType: "data_validation",
  },
  {
    id: 4,
    title: "Stage 4: JE Template Generation",
    purpose: "Build structured JE draft",
    status: "pending",
    componentType: "je_template",
  },
  {
    id: 5,
    title: "Stage 5: Upload to ERP",
    purpose: "Upload the JE in ERP (SAP)",
    status: "pending",
    componentType: "upload_erp",
  },
];



const PRELOADED_STD_COMPLETED: StageData[] = [
  { ...STD_STAGE1_COMPLETED },
  { ...STD_STAGE2_COMPLETED },
  { ...STD_STAGE3_COMPLETED },
  { ...STD_STAGE4_APPROVED },
  { ...STD_STAGE5_COMPLETED },
];

export const PRELOADED_GIT_COMPLETED: StageData[] = [
  { ...STD_STAGE1_COMPLETED },
  { ...GIT_STAGE2_HAPPY },
  { ...GIT_STAGE3_COMPLETED },
  { ...GIT_STAGE4_APPROVED },
  { ...STD_STAGE5_COMPLETED },
];

const PRELOADED_ADHOC_ACTION_REQUIRED: StageData[] = [
  { ...ADHOC_STAGE1_ACTION_REQUIRED },
  {
    id: 2,
    title: "Stage 2: Classifying Journal Entry and Mapping SOP",
    purpose: "Identify journal type and apply standard procedure",
    status: "pending",
    componentType: "sop_classification",
  },
  {
    id: 3,
    title: "Stage 3: Data Extraction",
    purpose: "Pull transactional/aggregated data",
    status: "pending",
    componentType: "data_extraction",
  },
  {
    id: 4,
    title: "Stage 4: Data Validation and Quality Checks",
    purpose: "Ensure completeness and correctness",
    status: "pending",
    componentType: "data_validation",
  },
  {
    id: 5,
    title: "Stage 5: JE Template Generation",
    purpose: "Build structured JE draft",
    status: "pending",
    componentType: "je_template",
  },
  {
    id: 6,
    title: "Stage 6: Upload to ERP",
    purpose: "Upload the JE in ERP (SAP)",
    status: "pending",
    componentType: "upload_erp",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// JOURNAL ENTRIES
// ═══════════════════════════════════════════════════════════════════════════════

export const journalEntries: JournalEntry[] = [
  {
    id: "J166CNJ807",
    name: "Balance write off",
    jeCategory: "Ad-Hoc",
    country: "India",
    jeType: "-",
    lob: "S&M",
    processDate: "01 Jul 2026",
    status: "pending",
    sop: "",
    executionStarted: "Mar 15, 2026 · 09:14 CST",
    progress: 0,
    stages: PRELOADED_ADHOC_ACTION_REQUIRED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ801",
    name: "Currency Fluctuation Mar'26",
    jeCategory: "Standard",
    country: "India",
    jeType: "Adjustment",
    lob: "Bank",
    processDate: "01 Jul 2026",
    status: "completed",
    sop: "Currency Fluctuation_SOP v1.0",
    executionStarted: "01 Jul 2026 · 09:14 CST",
    executionHistory: "01 Jul 2026 · 09:14 CST",
    progress: 100,
    stages: PRELOADED_STD_COMPLETED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ802",
    name: "JB Cash Deposit Miscellaneous",
    jeCategory: "Standard",
    country: "Australia",
    jeType: "Reclass",
    lob: "Bank",
    processDate: "01 Jul 2026",
    status: "pending",
    sop: "JB Cash Deposit Miscellaneous_v2.2",
    executionStarted: "01 Jul 2026 · 09:14 CST",
    executionHistory: "01 Jul 2026 · 09:14 CST",
    progress: 0,
    stages: INITIAL_STAGES_STANDARD.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ803",
    name: "Media BD Open DO Provision",
    jeCategory: "Standard",
    country: "India",
    jeType: "Accrual",
    lob: "Media",
    processDate: "01 Jun 2026",
    status: "action_required",
    sop: "Media BD Open DO Provision_SOP v1.0",
    executionStarted: "01 Jun 2026 · 09:14 CST",
    progress: 20,
    stages: [
      MEDIA_BD_STAGE1_COMPLETED,
      MEDIA_BD_STAGE2_MISSING_DATA,
      {
        id: 3,
        title: "Stage 3: Data Validation and Quality Checks",
        purpose: "Ensure completeness and correctness",
        status: "pending" as const,
        componentType: "data_validation" as const,
      },
      {
        id: 4,
        title: "Stage 4: JE Template Generation",
        purpose: "Build structured JE draft",
        status: "pending" as const,
        componentType: "je_template" as const,
      },
      {
        id: 5,
        title: "Stage 5: Upload to ERP",
        purpose: "Upload the JE in ERP (SAP)",
        status: "pending" as const,
        componentType: "upload_erp" as const,
      },
    ].map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ804",
    name: "Sales Reclass JE",
    jeCategory: "Standard",
    country: "India",
    jeType: "Reclass",
    lob: "Retail",
    processDate: "01 Jun 2026",
    status: "failed",
    sop: "Sales Reclass JE_SOP v1.0",
    executionStarted: "01 Jun 2026 · 09:14 CST",
    progress: 40,
    stages: PRELOADED_STD_FAILED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J026DMG107",
    name: "Goods in Transit JE",
    jeCategory: "Standard",
    country: "Indonesia",
    jeType: "Accrual",
    lob: "Logistics",
    processDate: "02 Jul 2026",
    status: "pending",
    sop: "Goods in Transit JE_SOP v1.0",
    executionStarted: "02 Jul 2026 · 09:14 CST",
    executionHistory: "02 Jul 2026 · 09:14 CST",
    progress: 0,
    stages: INITIAL_STAGES_STANDARD.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ806",
    name: "AP Cash Reclass",
    jeCategory: "Standard",
    country: "Indonesia",
    jeType: "Accrual",
    lob: "S&M",
    processDate: "02 Jul 2026",
    status: "completed",
    sop: "AP Cash Reclass_SOP v1.0",
    executionStarted: "02 Jul 2026 · 09:14 CST",
    executionHistory: "02 Jul 2026 · 09:14 CST",
    progress: 100,
    stages: PRELOADED_STD_COMPLETED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ808",
    name: "FX Gain/Loss Adj",
    jeCategory: "Standard",
    country: "India",
    jeType: "Adjustment",
    lob: "Bank",
    processDate: "03 Jul 2026",
    status: "completed",
    sop: "FX Gain Loss Adj_SOP v1.0",
    executionStarted: "03 Jul 2026 · 09:14 CST",
    executionHistory: "03 Jul 2026 · 09:14 CST",
    progress: 100,
    stages: PRELOADED_STD_COMPLETED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ809",
    name: "Payroll Accrual",
    jeCategory: "Standard",
    country: "Australia",
    jeType: "Accrual",
    lob: "S&M",
    processDate: "03 Jul 2026",
    status: "completed",
    sop: "Payroll Accrual_SOP v1.0",
    executionStarted: "03 Jul 2026 · 09:14 CST",
    executionHistory: "03 Jul 2026 · 09:14 CST",
    progress: 100,
    stages: PRELOADED_STD_COMPLETED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ810",
    name: "Vendor Payment Reclass",
    jeCategory: "Standard",
    country: "Indonesia",
    jeType: "Reclass",
    lob: "Bank",
    processDate: "03 Jul 2026",
    status: "pending",
    sop: "Vendor Payment Reclass_SOP v1.0",
    executionStarted: "03 Jul 2026 · 09:14 CST",
    executionHistory: "03 Jul 2026 · 09:14 CST",
    progress: 0,
    stages: INITIAL_STAGES_STANDARD.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ811",
    name: "Tax Provision Entry",
    jeCategory: "Standard",
    country: "India",
    jeType: "Miscellaneous",
    lob: "S&M",
    processDate: "04 Jul 2026",
    status: "completed",
    sop: "Tax Provision Entry_SOP v1.0",
    executionStarted: "04 Jul 2026 · 09:14 CST",
    executionHistory: "04 Jul 2026 · 09:14 CST",
    progress: 100,
    stages: PRELOADED_STD_COMPLETED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ812",
    name: "Lease Adjustment",
    jeCategory: "Standard",
    country: "Australia",
    jeType: "Adjustment",
    lob: "Bank",
    processDate: "04 Jul 2026",
    status: "pending",
    sop: "Lease Adjustment_SOP v1.0",
    executionStarted: "04 Jul 2026 · 09:14 CST",
    executionHistory: "04 Jul 2026 · 09:14 CST",
    progress: 0,
    stages: INITIAL_STAGES_STANDARD.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ813",
    name: "Revenue Accrual Q2",
    jeCategory: "Ad-Hoc",
    country: "India",
    jeType: "Accrual",
    lob: "S&M",
    processDate: "04 Jul 2026",
    status: "pending",
    sop: "",
    executionStarted: "04 Jul 2026 · 09:14 CST",
    executionHistory: "04 Jul 2026 · 09:14 CST",
    progress: 0,
    stages: INITIAL_STAGES_ADHOC.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ814",
    name: "Intercompany Settlement",
    jeCategory: "Standard",
    country: "Indonesia",
    jeType: "Adjustment",
    lob: "Bank",
    processDate: "05 Jul 2026",
    status: "completed",
    sop: "Intercompany Settlement_SOP v1.0",
    executionStarted: "05 Jul 2026 · 09:14 CST",
    executionHistory: "05 Jul 2026 · 09:14 CST",
    progress: 100,
    stages: PRELOADED_STD_COMPLETED.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
  {
    id: "J166CNJ815",
    name: "Depreciation Monthly",
    jeCategory: "Standard",
    country: "Australia",
    jeType: "Accrual",
    lob: "Logistics",
    processDate: "05 Jul 2026",
    status: "pending",
    sop: "Depreciation Monthly_SOP v1.0",
    executionStarted: "05 Jul 2026 · 09:14 CST",
    executionHistory: "05 Jul 2026 · 09:14 CST",
    progress: 0,
    stages: INITIAL_STAGES_STANDARD.map((s) => ({ ...s })),
    aiProcessingLog: AI_LOG_PENDING,
  },
];

export const ENTRY_PATH_MAP: Record<string, JEPath> = {
  J166CNJ801: "standard-happy",
  J166CNJ802: "standard-happy",
  J166CNJ803: "standard-action-required",
  J166CNJ804: "standard-failure",
  J026DMG107: "standard-happy",
  J166CNJ806: "standard-happy",
  J166CNJ807: "adhoc-action-required",
  J166CNJ813: "adhoc-happy",
};

export const getJournalEntryById = (id: string): JournalEntry | undefined =>
  journalEntries.find((je) => je.id === id);
