import React, { useState } from "react";
import {
  Check,
  Info,
  Download,
  ChevronLeft,
  ChevronRight,
  Mail,
  MousePointerClick,
  Clock,
} from "lucide-react";
import type { StageData } from "../../../types";
import { ApprovalEmailModal } from "../../shared/ApprovalEmailModal";
import type { EmailAttachment } from "../../shared/ApprovalEmailModal";
import { toIsoDateTime } from "../../../lib/utils";

interface JETemplateProps {
  stage: StageData;
  onStageComplete?: () => void;
}

const PAGE_SIZE = 7;

const fmtAmount = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TH: React.FC<{ children: React.ReactNode; align?: "left" | "right" }> = ({
  children,
  align = "left",
}) => (
  <th
    className={`px-4 py-2.5 text-[11px] font-semibold text-gray-700 uppercase tracking-wide text-${align}`}
  >
    {children}
  </th>
);

export const JETemplate: React.FC<JETemplateProps> = ({
  stage,
  onStageComplete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Pagination state for both standard and ad-hoc posting tables
  const [currentPage, setCurrentPage] = useState(1);

  const defaultAttachments: EmailAttachment[] = [
    { name: "Journal Entry_J166CNJ807.xlsx", size: "9 KB", type: "xlsx" },
    { name: "P01-GL Account-124530.csv", size: "232 bytes", type: "csv" },
    { name: "Invoice.pdf", size: "628 KB", type: "pdf" },
  ];

  const emailBody = `Dear Team,\n\n**Journal - Open DO Provision JE** has been created successfully and is pending approval.\n\nThe input files used to create the journal entry, and the generated JE template have been attached for your review.\n\nPlease review the attachments and complete the approval process.`;

  const handleModalApprove = () => {
    setIsModalOpen(false);
    handleManualApprove();
  };

  // ── Approval workflow steps ────────────────────────────────────────────
  const APPROVAL_STEPS = [
    { key: "generated", label: "Template Generated" },
    { key: "requested", label: "Approval Requested" },
    { key: "pending", label: "Pending Approval" },
    { key: "approved", label: "Approved" },
  ];

  const [localApprovalStatus, setLocalApprovalStatus] = useState(
    stage.approvalStatus,
  );
  const [localApprovalDetails, setLocalApprovalDetails] = useState(
    stage.approvalDetails,
  );

  const getActiveStep = () => {
    if (localApprovalStatus === "approved") return 3;
    if (localApprovalStatus === "pending") return 2;
    if (localApprovalStatus === "submitted") return 1;
    return 0;
  };

  const handleManualApprove = () => {
    setLocalApprovalStatus("approved");
    const now = new Date();
    // YYYY-MM-DD, HH:mm
    const formatted = toIsoDateTime(now).replace(" ", ", ") + " CST";
    setLocalApprovalDetails(`Manually approved by John Doe - ${formatted}`);
    if (onStageComplete) onStageComplete();
  };

  const handleDownloadJE = () => {
    let csvContent =
      "Document Currency,Posting Key,Account,Amount in Document Currency,Cost Center,Line Item Text\n";
    if (stage.gitJEPostingData) {
      csvContent =
        "PO Number,Material Code,Material Description,Business Unit,Incoterm,Total Value (IDR)\n";
      stage.gitJEPostingData.forEach((row) => {
        csvContent += `${row.poNumber},${row.materialCode},${row.materialDescription},${row.businessUnit},${row.incoterm},${row.totalValue}\n`;
      });
    } else if (stage.stdJEPostingData) {
      csvContent =
        "Company,Currency,Post Date,Doc Date,Reference,Doc Header,Ledger Account,Ledger Amount\n";
      stage.stdJEPostingData.forEach((row) => {
        csvContent += `${row.documentCurrency},${row.postingKey},${row.account},${row.amountInDocCurrency},${row.costCenter},${row.lineItemText}\n`;
      });
    } else if (stage.adHocJEPostingData) {
      csvContent =
        "GL Account,GL Account Description,Posting Amount,DR/CR,Cost Center\n";
      stage.adHocJEPostingData.forEach((row) => {
        csvContent += `${row.gl_account},${row.gl_account_description},${row.posting_amount},${row.debit_credit_indicator},${row.cost_center}\n`;
      });
    } else if (stage.journalLines) {
      csvContent = "Line,Account,Cost Center,Description,Debit,Credit\n";
      stage.journalLines.forEach((line) => {
        csvContent += `${line.line},${line.account},${line.costCenter},${line.description},${line.debit || ""},${line.credit || ""}\n`;
      });
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Download-JE.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeStep = getActiveStep();

  // ── Approval Stepper + Actions ───────────────────────────────────────
  const ApprovalFooter = () => (
    <div className="space-y-4">
      {/* Progress Stepper */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Approval Workflow
        </p>
        <div className="flex items-center">
          {APPROVAL_STEPS.map((step, i) => {
            const isCompleted = i < activeStep;
            const isCurrent = i === activeStep;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                      isCompleted ||
                      (isCurrent && localApprovalStatus === "approved")
                        ? "bg-completed text-white"
                        : isCurrent
                          ? "bg-brand text-white ring-4 ring-brand/20"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ||
                    (isCurrent && localApprovalStatus === "approved") ? (
                      <Check size={13} strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-center leading-tight max-w-[80px] ${
                      isCompleted ||
                      (isCurrent && localApprovalStatus === "approved")
                        ? "text-completed font-semibold"
                        : isCurrent
                          ? "text-brand font-semibold"
                          : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < APPROVAL_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 rounded-full ${
                      i < activeStep || localApprovalStatus === "approved"
                        ? "bg-completed"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Approved state */}
      {localApprovalStatus === "approved" && (
        <div className="flex items-center gap-3 border border-completed-border bg-completed-light rounded-lg px-4 py-3">
          <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
            <Check size={11} className="text-completed" strokeWidth={3} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-completed">
              Approved - Ready for ERP Upload
            </p>
            <p className="text-[12px] text-gray-500">{localApprovalDetails}</p>
          </div>
        </div>
      )}

      {/* Pending state — shows both approval mechanisms */}
      {localApprovalStatus === "pending" && (
        <div className="space-y-3">
          {/* Email-based approval — click to open popup */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 border border-source-email-border bg-source-email-bg rounded-lg px-4 py-3 cursor-pointer hover:bg-brand-light transition-colors"
          >
            <Mail size={18} className="text-brand flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-gray-900">
                Submitted for Review & Approval
              </p>
              <p className="text-[12px] text-brand">{localApprovalDetails}</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock size={12} />
              Awaiting response
            </div>
          </div>

          {/* Manual approval option */}
          <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
            <div className="flex items-center gap-3">
              <MousePointerClick
                size={18}
                className="text-gray-500 flex-shrink-0"
              />
              <div>
                <p className="text-[13px] font-medium text-gray-700">
                  Manual Approval
                </p>
                <p className="text-[11px] text-gray-400">
                  Approve directly as a fallback option
                </p>
              </div>
            </div>
            <button
              onClick={handleManualApprove}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-completed hover:bg-completed-dark rounded-lg transition-colors cursor-pointer"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {/* Submitted (legacy compat) — same as pending */}
      {localApprovalStatus === "submitted" && (
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 border border-source-email-border bg-source-email-bg rounded-lg px-4 py-3 cursor-pointer hover:bg-brand-light transition-colors"
        >
          <Info size={18} className="text-brand flex-shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-gray-900">
              Submitted for Review & Approval
            </p>
            <p className="text-[13px] text-brand">{localApprovalDetails}</p>
          </div>
        </div>
      )}

      <ApprovalEmailModal
        isOpen={isModalOpen}
        onClose={handleModalApprove}
        onApprove={handleModalApprove}
        subject="Journal Entry Created - Approval Required | Journal ID: J166CNJ807"
        journalId="J166CNJ807"
        senderName="Jugran, Dipankar"
        recipientName="Jugran, Dipankar"
        attachments={defaultAttachments}
        emailBody={emailBody}
        signOff="Thanks,"
        signOffName="AI Journal Entry Agent"
        senderTitle="System Notification"
        hideApproveButton
      />
    </div>
  );

  // ── Shared Pagination component ─────────────────────────────────────────────
  const Pagination: React.FC<{ totalRows: number }> = ({ totalRows }) => {
    const totalPages = Math.ceil(totalRows / PAGE_SIZE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-gray-500">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex items-center justify-center w-7 h-7 rounded border text-[12px] font-medium transition-colors ${
                page === currentPage
                  ? "border-brand bg-brand text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ── GIT: JE Template table from JSON (two-row header: field key + label)
  if (stage.gitJETemplateData) {
    const { columns, headerRow, lineItems, totalLineItems } = stage.gitJETemplateData;

    return (
      <div className="mt-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[13px] font-semibold text-gray-900">
              Journal Entries
            </h4>
            <p className="text-[12px] text-gray-500">
              Showing {lineItems.length} of {totalLineItems} records
            </p>
          </div>
          {/* Source workbook lives outside public/, so link matches the existing SOP download convention */}
          <a
            href={encodeURI("/data/Stage 4 JE Template Generation/2408_GIT_JV_May'26.xlsx")}
            download="2408_GIT_JV_May'26.xlsx"
            className="flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline cursor-pointer"
          >
            <Download size={14} />
            Download-JE.xlsx
          </a>
        </div>

        {/* Table with blue scroller */}
        <div className="border border-gray-200 rounded-lg overflow-x-auto overflow-y-auto max-h-[380px] scrollbar-blue">
          <table className="w-max min-w-full text-[13px]">
            <thead className="sticky top-0 z-10">
              {/* Row 1: Field keys */}
              <tr className="bg-gray-50 border-b border-gray-100">
                {columns.map((col) => (
                  <th
                    key={`key-${col.key}`}
                    className="px-4 pt-2.5 pb-0.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.key}
                  </th>
                ))}
              </tr>
              {/* Row 2: Display labels */}
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={`label-${col.key}`}
                    className="px-4 pt-0.5 pb-2.5 text-left text-[12px] font-semibold text-gray-800 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Header row (document-level fields like currency) */}
              {Object.keys(headerRow).length > 0 && (
                <tr className="bg-white">
                  {columns.map((col) => (
                    <td
                      key={`hdr-${col.key}`}
                      className="px-4 py-2.5 text-gray-700 whitespace-nowrap"
                    >
                      {headerRow[col.key] || ""}
                    </td>
                  ))}
                </tr>
              )}
              {/* Line items */}
              {lineItems.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={`${i}-${col.key}`}
                      className="px-4 py-2.5 text-gray-700 whitespace-nowrap"
                    >
                      {row[col.key] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ApprovalFooter />
      </div>
    );
  }

    // ── GIT: JE Template table (PO NUMBER | MATERIAL CODE | MATERIAL DESCRIPTION | BUSINESS UNIT | INCOTERM | TOTAL VALUE)
  if (stage.gitJEPostingData) {
    const allRows = stage.gitJEPostingData;
    const totalRows = allRows.length;

    return (
      <div className="mt-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[13px] font-semibold text-gray-900">
              Journal Entries
            </h4>
            <p className="text-[12px] text-gray-500">
              Showing {totalRows} of {totalRows} records
            </p>
          </div>
          <button
            onClick={handleDownloadJE}
            className="flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline cursor-pointer"
          >
            <Download size={14} />
            Download-JE.xlsx
          </button>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <TH>PO Number</TH>
                <TH>Material Code</TH>
                <TH>Material Description</TH>
                <TH>Business Unit</TH>
                <TH>Incoterm</TH>
                <TH align="right">Total Value (IDR)</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allRows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <span className="text-brand font-medium">
                      {row.poNumber}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {row.materialCode}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {row.materialDescription}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {row.businessUnit}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {row.incoterm}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-700">
                    {row.totalValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ApprovalFooter />
      </div>
    );
  }

    // ── Standard: paginated table (10 per page) ───────────────────────────────
  // Columns: COMPANY CODE | DOC TYPE | POSTING DATE | GL ACCOUNT | AMOUNT | CURRENCY | COST CENTER
  if (stage.stdJEPostingData) {
    const allRows = stage.stdJEPostingData;
    const totalRows = allRows.length;

    return (
      <div className="mt-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[13px] font-semibold text-gray-900">
              Journal Entries
            </h4>
            <p className="text-[12px] text-gray-500">
              Showing {totalRows} of {totalRows} records
            </p>
          </div>
          <button
            onClick={handleDownloadJE}
            className="flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline cursor-pointer"
          >
            <Download size={14} />
            Download-JE.xlsx
          </button>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">JRNCURRENCY</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">JRNLPOSTINGKEY</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">JRNLACCOUNT</th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-700 uppercase tracking-wide">JRNLAMOUNTINDOCCURR</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">JRNLCOSTCENTER</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">JRNLLINEITEMTEXT</th>
              </tr>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-4 py-2 text-left text-[13px] font-bold text-gray-900">Document Currency*</th>
                <th className="px-4 py-2 text-left text-[13px] font-bold text-gray-900">Posting Key*</th>
                <th className="px-4 py-2 text-left text-[13px] font-bold text-gray-900">Account*</th>
                <th className="px-4 py-2 text-right text-[13px] font-bold text-gray-900">Amount in Document Currency*</th>
                <th className="px-4 py-2 text-left text-[13px] font-bold text-gray-900">Cost Center</th>
                <th className="px-4 py-2 text-left text-[13px] font-bold text-gray-900">Line Item Text*</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Currency group row */}
              <tr>
                <td className="px-4 py-2.5 text-gray-700">{allRows[0]?.documentCurrency}</td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5"></td>
              </tr>
              {allRows.map((row: typeof allRows[number], i: number) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-700"></td>
                  <td className="px-4 py-2.5 text-gray-700">{row.postingKey}</td>
                  <td className="px-4 py-2.5 text-gray-700">{row.account}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{row.amountInDocCurrency}</td>
                  <td className="px-4 py-2.5 text-gray-700">{row.costCenter}</td>
                  <td className="px-4 py-2.5 text-gray-700">{row.lineItemText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ApprovalFooter />
      </div>
    );
  }

  // ── Ad-hoc: paginated table (10 per page) ─────────────────────────────────
  // Columns: LINE | ACCOUNT | DESCRIPTION | COST CENTER | DEBIT | CREDIT
  if (stage.adHocJEPostingData) {
    const allRows = stage.adHocJEPostingData;
    const totalRows = allRows.length;
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, totalRows);
    const pagedRows = allRows.slice(startIdx, endIdx);

    // Compute totals from ALL rows (not just current page)
    const totalDebitNum = allRows
      .filter((r) => r.debit_credit_indicator === "DR")
      .reduce((sum, r) => sum + r.posting_amount, 0);
    const totalCreditNum = allRows
      .filter((r) => r.debit_credit_indicator === "CR")
      .reduce((sum, r) => sum + r.posting_amount, 0);

    return (
      <div className="mt-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[13px] font-semibold text-gray-900">
              Journal Entries
            </h4>
            <p className="text-[12px] text-gray-500">
              Showing {startIdx + 1}–{endIdx} of {totalRows} records
            </p>
          </div>
          <button
            onClick={handleDownloadJE}
            className="flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline cursor-pointer"
          >
            <Download size={14} />
            Download-JE.xlsx
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <TH>Line</TH>
                <TH>Account</TH>
                <TH>Description</TH>
                <TH>Cost Center</TH>
                <TH align="right">Debit</TH>
                <TH align="right">Credit</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedRows.map((row, i) => (
                <tr
                  key={row.je_posting_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-700">
                    {startIdx + i + 1}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-brand font-medium">
                      {row.gl_account}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {row.gl_account_description}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {row.cost_center}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-700">
                    {row.debit_credit_indicator === "DR"
                      ? fmtAmount(row.posting_amount)
                      : ""}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-700">
                    {row.debit_credit_indicator === "CR"
                      ? fmtAmount(row.posting_amount)
                      : ""}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 border-t border-gray-200">
                <td
                  colSpan={4}
                  className="px-4 py-2.5 text-right text-[13px] font-semibold text-gray-700"
                >
                  Total
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                  {fmtAmount(totalDebitNum)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                  {fmtAmount(totalCreditNum)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination totalRows={totalRows} />
        <ApprovalFooter />
      </div>
    );
  }

  // ── Fallback: standard journalLines (FX gain/loss lines) ──────────────────
  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[13px] font-semibold text-gray-900">
            Journal Entries
          </h4>
          <p className="text-[12px] text-gray-500">
            Showing {stage.totalShowing} of {stage.totalRecordsCount} records
          </p>
        </div>
        <button
          onClick={handleDownloadJE}
          className="flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline cursor-pointer"
        >
          <Download size={14} />
          Download-JE.xlsx
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <TH>Line</TH>
              <TH>Account</TH>
              <TH>Cost Center</TH>
              <TH>Description</TH>
              <TH align="right">Debit</TH>
              <TH align="right">Credit</TH>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {stage.journalLines?.map((line) => (
              <tr
                key={line.line}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2.5 text-gray-700">{line.line}</td>
                <td className="px-4 py-2.5">
                  <span className="text-brand font-medium">{line.account}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-700">{line.costCenter}</td>
                <td className="px-4 py-2.5 text-gray-700">
                  {line.description}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700">
                  {line.debit || ""}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700">
                  {line.credit || ""}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 border-t border-gray-200">
              <td
                colSpan={4}
                className="px-4 py-2.5 text-right text-[13px] font-semibold text-gray-700"
              >
                Total
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                {stage.totalDebit}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                {stage.totalCredit}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ApprovalFooter />
    </div>
  );
};

export default JETemplate;
