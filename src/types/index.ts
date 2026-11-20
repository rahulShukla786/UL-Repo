export type JEStatus = "completed" | "action_required" | "failed" | "pending";
export type StageStatus = "completed" | "in_progress" | "pending" | "failed";
export type ExceptionType =
  | "missing_attachment"
  | "missing_data"
  | "validation_failed"
  | "sop_selection"
  | null;
export type StageComponentType =
  | "identifying_intent"
  | "sop_classification"
  | "business_rules"
  | "data_extraction"
  | "data_validation"
  | "je_template"
  | "upload_erp"
  | "email_details";

/** Email shown in an "email_details" stage (e.g. Stage 4 Data Processing 3) */
export interface EmailDetailsData {
  subject: string;
  receivedAt: string;
  from: { name: string; email: string };
  to: string[];
  cc: string[];
  attachments: { name: string; type: string; size?: string }[];
  body: string[];
  /** Optional sent timestamp shown at the right of the sender row */
  sentAt?: string;
  /** Optional note under recipients (e.g. "You replied to this message on ...") */
  infoNote?: string;
  /** Optional red external-sender warning banner */
  externalWarning?: string;
  /** Optional numbered points shown after the body lines */
  bodyPoints?: string[];
  /** Optional small table in the body (e.g. GL / cost centre amounts) */
  bodyTable?: { title: string; rows: [string, string][] };
  signature?: {
    name: string;
    title: string;
    work: string;
    mobile: string;
    company: string;
    address: string;
  };
  /** Business rules applied to this email / attachment */
  rules?: string[];
}

export interface SourceFile {
  type: "EMAIL" | "ORACLE" | "SHAREDRIVE" | "UPLOADED" | "SAP";
  name: string;
  date: string;
  status: "success" | "error" | "warning";
}

export interface ExtractedField {
  label: string;
  value: string;
  isLink?: boolean;
}

export interface ValidationCheck {
  title: string;
  description: string;
  result: string;
  status: "passed" | "failed";
}

export interface JournalEntryLine {
  line: number;
  account: string;
  costCenter: string;
  description: string;
  debit?: string;
  credit?: string;
}

export interface BusinessRuleCategory {
  title: string;
  items: string[];
  status: "completed" | "pending";
  /** Optional reference files listed beside the items (e.g. Source File Requirements) */
  referenceFiles?: string[];
}

export interface SOPOption {
  id: string;
  name: string;
  confidenceScore: number;
}

export interface IntentDetail {
  label: string;
  value: string;
}

// ── Ad-hoc data row types ────────────────────────────────────────────────────

export interface AdHocPreparationRow {
  je_preparation_id: number;
  gl_account: number;
  gl_account_description: string;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: number;
  validation_status: string;
  posting_date: string;
}

export interface AdHocPostingRow {
  je_posting_id: number;
  gl_account: number;
  gl_account_description: string;
  posting_amount: number;
  debit_credit_indicator: string;
  cost_center: number;
  posting_status: string;
  calculation_rule_applied: string;
}

/**
 * Standard JE posting row — shown in Stage 4 JE Template for the standard flow.
 * Columns: COMPANY CODE | DOC TYPE | POSTING DATE | GL ACCOUNT |
 *           AMOUNT (IN DOC CURRENCY) | CURRENCY | COST CENTER
 * Sourced from je_preparation VALID records in standard-je.json.
 */
export interface StdPostingRow {
  documentCurrency: string;
  postingKey: string;
  account: string;
  amountInDocCurrency: string;
  costCenter: string;
  lineItemText: string;
}

/**
 * GIT JE posting row — shown in Stage 4 for Goods in Transit action-required flow.
 * Columns: PO NUMBER | MATERIAL CODE | MATERIAL DESCRIPTION | BUSINESS UNIT | INCOTERM | TOTAL VALUE (IDR)
 */
export interface GITPostingRow {
  poNumber: string;
  materialCode: string;
  materialDescription: string;
  businessUnit: string;
  incoterm: string;
  totalValue: string;
}

export interface GitJETemplateColumn {
  key: string;
  label: string;
}

export interface GitJETemplateData {
  columns: GitJETemplateColumn[];
  headerRow: Record<string, string>;
  lineItems: Record<string, string>[];
  totalLineItems: number;
}


/**
 * One entry per validation rule shown in Stage 5 (ad-hoc flow).
 * Derived at startup from email_attachments_input_data + ad_hoc_business_rules.
 */
export interface AdHocProofOfWorkItem {
  ruleId: string;
  title: string; // e.g. "Company Code Validation"
  description: string; // e.g. "Validate Company Code Is 1000 – 2 rows affected"
  totalRows: number; // total records checked
  affectedRows: number; // rows that failed this rule
  status: "passed" | "warning";
}

// ────────────────────────────────────────────────────────────────────────────

export interface StageData {
  id: number;
  title: string;
  purpose: string;
  status: StageStatus;
  componentType: StageComponentType;
  // Identifying Intent
  intentDetails?: IntentDetail[];
  // Classifying JE and Mapping SOP
  sopClassification?: string;
  sopIdentified?: string;
  sopName?: string;
  sopConfidenceScore?: number;
  sopOptions?: SOPOption[];
  // Business Rules
  businessRuleCategories?: BusinessRuleCategory[];
  // Data Extraction
  sources?: SourceFile[];
  extractedFields?: ExtractedField[];
  extractedCount?: number;
  totalRecords?: number;
  confidenceScore?: number;
  // Ad-hoc: preparation rows shown inside Document Preview spreadsheet
  adHocPreparationData?: AdHocPreparationRow[];
  // Per-source document preview tables (indexed by source position)
  sourcePreviewTables?: SourcePreviewTable[];
  // Output file preview shown below the input preview (e.g. Summary for Reaccrual.xlsx)
  outputPreviewTable?: SourcePreviewTable;
  // Multiple output file previews (e.g. Stage 3 Data Processing 2 summaries)
  outputPreviewTables?: SourcePreviewTable[];
  // Reference files offered in the "Reference Files" download menu of a stage
  stageReferenceFiles?: StageReferenceFile[];
  // Per-source extracted fields (indexed by source position) — summary changes on file select
  extractedFieldsBySource?: ExtractedField[][];
  // Data Validation
  validationChecks?: ValidationCheck[];
  // Ad-hoc: proof-of-work validation items (Stage 5 ad-hoc flow / Stage 3 standard flow)
  adHocProofOfWork?: AdHocProofOfWorkItem[];
  // JE Template — standard fallback (FX lines)
  journalLines?: JournalEntryLine[];
  totalDebit?: string;
  totalCredit?: string;
  approvalStatus?: "approved" | "pending" | "submitted" | null;
  approvalDetails?: string;
  totalShowing?: number;
  totalRecordsCount?: number;
  // Ad-hoc JE Template posting data (LINE | ACCOUNT | DESCRIPTION | COST CENTER | DEBIT | CREDIT)
  adHocJEPostingData?: AdHocPostingRow[];
  // Standard JE Template posting data (COMPANY CODE | DOC TYPE | POSTING DATE | GL ACCOUNT | AMOUNT | CURRENCY | COST CENTER)
  stdJEPostingData?: StdPostingRow[];
  // GIT JE Template posting data (PO NUMBER | MATERIAL CODE | MATERIAL DESCRIPTION | BUSINESS UNIT | INCOTERM | TOTAL VALUE)
  gitJEPostingData?: GITPostingRow[];
  gitJETemplateData?: GitJETemplateData;
  // Upload ERP
  uploadTarget?: string;
  uploadBatchId?: string;
  uploadDate?: string;
  notificationEmail?: string;
  // Email details (Data Processing 3)
  emailDetails?: EmailDetailsData;
  // Exception handling
  exceptionType?: ExceptionType;
  exceptionTitle?: string;
  exceptionMessage?: string;
  exceptionActionButtons?: string[];
  agentMessages?: AgentMessage[];
}

export interface StageReferenceFile {
  fileName: string;
  downloadUrl: string;
}

export interface SourcePreviewTable {
  fileName: string;
  /** Path under /public of the actual file; when present the preview is read from it */
  filePath?: string;
  /** Server URL to download the full original file (e.g. large files kept in a UC volume) */
  downloadUrl?: string;
  columns: string[];
  rows: string[][];
  totalLabel?: string;
  totalValue?: string;
  extractedFields?: ExtractedField[];
  /** Business rules applied to this file (shown in Rule Summary) */
  rules?: string[];
}

export interface AgentMessage {
  role: "agent" | "user";
  userName?: string;
  content: string;
  timestamp: string;
  attachment?: string;
}

export interface JournalEntry {
  id: string;
  name: string;
  jeCategory: string;
  country: string;
  jeType: string;
  lob: string;
  processDate: string;
  status: JEStatus;
  sop: string;
  executionStarted: string;
  executionHistory?: string;
  stages: StageData[];
  aiProcessingLog: string[];
  progress?: number;
  subTitle?: string;
}

export interface FilterState {
  search: string;
  jeCategory: string;
  country: string;
  jeType: string;
  lob: string;
  month: string;
  year: string;
  status: string;
}
