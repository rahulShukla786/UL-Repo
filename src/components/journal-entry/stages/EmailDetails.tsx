import React from "react";
import { ChevronDown, Mail, Info } from "lucide-react";
import type { StageData } from "../../../types";
import { toIsoDate } from "../../../lib/utils";

// Email dates (received / sent / "You replied on") always show TODAY's date (YYYY-MM-DD);
// a leading weekday such as "Thu" is updated too. Times are kept.
const withToday = (text: string): string => {
  const now = new Date();
  const today = toIsoDate(now);
  const weekday = now.toLocaleDateString("en-GB", { weekday: "short" });
  return text
    .replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (?=\d{4}-\d{2}-\d{2})/, `${weekday} `)
    .replace(/\d{4}-\d{2}-\d{2}/g, today);
};

interface EmailDetailsProps {
  stage: StageData;
}

// Excel file logo (same design as Data Extraction source cards)
const ExcelLogo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-label="Excel">
    <rect x="8" y="3" width="21" height="26" rx="2" fill="#21A366" />
    <rect x="8" y="3" width="21" height="8.7" rx="2" fill="#33C481" />
    <rect x="8" y="20.3" width="21" height="8.7" rx="2" fill="#185C37" />
    <rect x="3" y="8" width="15" height="16" rx="2" fill="#107C41" />
    <path
      d="M6.6 20.5 9.3 16 6.8 11.5h2.1l1.4 2.9 1.5-2.9h2l-2.5 4.5 2.6 4.5h-2.1l-1.5-3-1.6 3z"
      fill="#fff"
    />
  </svg>
);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const RecipientChip: React.FC<{ name: string }> = ({ name }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[12px] text-gray-700">
    <span className="w-3 h-3 rounded-full border border-gray-400" />
    {name}
  </span>
);

export const EmailDetails: React.FC<EmailDetailsProps> = ({ stage }) => {
  const email = stage.emailDetails;
  if (!email) return null;

  return (
    <div className="mt-2 space-y-4">
      <div className="flex gap-4">
        {/* Email viewer */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Email Preview
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
              <Mail size={13} /> {withToday(email.receivedAt)}
            </span>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Subject */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100">
              <h3 className="text-[16px] font-semibold text-gray-900">
                {email.subject}
              </h3>
            </div>

            {/* Sender / recipients */}
            <div className="px-5 py-3 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-[14px] font-semibold flex-shrink-0">
                {initials(email.from.name)}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[13px] text-gray-900 flex flex-wrap justify-between gap-2">
                  <span>
                  <span className="font-semibold">{email.from.name}</span>{" "}
                  <span className="text-gray-500">&lt;{email.from.email}&gt;</span>
                  </span>
                  {email.sentAt && (
                    <span className="text-[12px] text-gray-500">{withToday(email.sentAt)}</span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] text-gray-500 w-6">To</span>
                  {email.to.map((n) => (
                    <RecipientChip key={n} name={n} />
                  ))}
                </div>
                {email.cc.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[12px] text-gray-500 w-6">Cc</span>
                    {email.cc.map((n) => (
                      <RecipientChip key={n} name={n} />
                    ))}
                  </div>
                )}
                {email.infoNote && (
                  <p className="flex items-center gap-1.5 pt-1 text-[12px] text-gray-500">
                    <Info size={13} className="text-brand" />
                    {withToday(email.infoNote)}
                  </p>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {email.attachments.map((a) => (
                <div
                  key={a.name}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <ExcelLogo />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-gray-900 truncate">
                      {a.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {a.type}
                      {a.size ? ` \u00b7 ${a.size}` : ""}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              ))}
            </div>

            {/* External sender warning */}
            {email.externalWarning && (
              <div className="mx-5 mb-3 px-4 py-2 rounded bg-red-600 text-white text-[12px] text-center">
                {email.externalWarning}
              </div>
            )}

            {/* Body */}
            <div className="px-5 py-4 border-t border-gray-100 space-y-3 text-[13px] text-gray-800">
              {email.body.map((line, i) => (
                <p key={i}>{line}</p>
              ))}

              {email.bodyPoints && email.bodyPoints.length > 0 && (
                <ol className="list-decimal pl-6 space-y-1">
                  {email.bodyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ol>
              )}

              {email.bodyTable && (
                <div className="pl-6">
                  <p className="font-semibold text-gray-900 mb-1">
                    {email.bodyTable.title}
                  </p>
                  <table className="border border-gray-200 rounded text-[12px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wide text-[11px] border-b border-gray-200">
                          Cost Center
                        </th>
                        <th className="px-3 py-1.5 text-right font-semibold text-gray-500 uppercase tracking-wide text-[11px] border-b border-gray-200">
                          Amount (EUR)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {email.bodyTable.rows.map(([cc, amount]) => (
                        <tr key={cc} className="border-b border-gray-100 last:border-0">
                          <td className="px-3 py-1.5 text-gray-800">{cc}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums text-red-600">
                            {amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Signature */}
            {email.signature && (
              <div className="px-5 pb-4">
                <p className="text-[13px] font-semibold text-gray-900">
                  {email.signature.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetails;
