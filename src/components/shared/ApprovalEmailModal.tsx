import React from 'react';
import { X, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

export interface EmailAttachment {
  name: string;
  size: string;
  type: 'xlsx' | 'csv' | 'pdf';
}

export interface ApprovalEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  subject: string;
  journalId: string;
  senderName: string;
  senderAvatar?: string;
  recipientName: string;
  attachments: EmailAttachment[];
  emailBody: string;
  signOff?: string;
  signOffName?: string;
  senderTitle?: string;
  hideApproveButton?: boolean;
}

export const ApprovalEmailModal: React.FC<ApprovalEmailModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  subject,
  journalId: _journalId,
  senderName,
  senderAvatar,
  recipientName,
  attachments,
  emailBody,
  signOff = 'Thanks,',
  signOffName,
  senderTitle = 'System Notification',
  hideApproveButton = false,
}) => {
  if (!isOpen) return null;

  const totalSize = attachments.length > 0
    ? `${attachments.length} attachment${attachments.length > 1 ? 's' : ''} (${attachments.reduce((acc, a) => {
        const num = parseFloat(a.size);
        if (a.size.includes('KB')) return acc + num;
        if (a.size.includes('bytes')) return acc + num / 1024;
        if (a.size.includes('MB')) return acc + num * 1024;
        return acc;
      }, 0).toFixed(0)} KB)`
    : '';

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'xlsx':
        return <FileSpreadsheet size={16} className="text-completed" />;
      case 'csv':
        return <FileSpreadsheet size={16} className="text-brand" />;
      case 'pdf':
        return <FileText size={16} className="text-failed" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[680px] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-200">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              Subject: {subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-[13px] text-failed font-medium hover:opacity-80 transition-opacity"
          >
            <X size={14} />
            Close
          </button>
        </div>

        {/* Sender info */}
        <div className="px-6 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {senderAvatar ? (
                  <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[13px] font-semibold text-gray-700">
                    {senderName.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">{senderName}</p>
                <p className="text-[12px] text-gray-500">
                  To: <span className="inline-flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-completed inline-block" />
                    {recipientName}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-6 pb-3">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                >
                  {getFileIcon(attachment.type)}
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-700 leading-tight">
                      {attachment.name}
                    </span>
                    <span className="text-[11px] text-gray-400">{attachment.size}</span>
                  </div>
                  <ChevronDown size={12} className="text-gray-400 ml-1" />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">{totalSize}</p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 mx-6" />

        {/* Email body */}
        <div className="px-6 py-5 text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
          {emailBody.split(/(\*\*.*?\*\*)/).map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>

        {/* Sign off */}
        {signOff && (
          <div className="px-6 pb-1 text-[13px] text-gray-700">
            <p>{signOff}</p>
            {signOffName && <p className="font-bold">{signOffName}</p>}
          </div>
        )}

        {/* Sender title */}
        {senderTitle && (
          <div className="px-6 pb-5 text-[12px] text-gray-500">
            {senderTitle}
          </div>
        )}

        {/* Approve button (conditionally shown) */}
        {!hideApproveButton && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={() => {
                onApprove();
                onClose();
              }}
              className="px-5 py-2 bg-completed text-white text-[13px] font-semibold rounded-lg hover:bg-completed-dark transition-colors"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalEmailModal;
