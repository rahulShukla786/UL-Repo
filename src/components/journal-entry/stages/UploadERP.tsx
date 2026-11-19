import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { StageData } from '../../../types';
import { ApprovalEmailModal } from '../../shared/ApprovalEmailModal';

interface UploadERPProps {
  stage: StageData;
  onStageComplete?: () => void;
}

export const UploadERP: React.FC<UploadERPProps> = ({ stage, onStageComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emailBody = `Dear Team,

This is to inform you that the Journal-ID: J166CNJ807 (JE Currency Fluctuation for March 2026) has been completed successfully.

No further action is required at this time.`;

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (onStageComplete) {
      onStageComplete();
    }
  };

  return (
    <div className="mt-2 space-y-3">
      {/* Successfully uploaded */}
      {stage.uploadBatchId && (
        <div className="border border-completed-border bg-completed-light rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
              <Check size={11} className="text-completed" strokeWidth={3} />
            </span>
            <p className="text-[13px] font-semibold text-completed">
              Successfully uploaded to {stage.uploadTarget || "SAP"}, {stage.uploadBatchId}
            </p>
          </div>
          <p className="text-[12px] text-gray-500 mt-1 ml-7">{stage.uploadDate}</p>
        </div>
      )}

      {/* Notification sent */}
      {stage.notificationEmail && (
        <div className="border border-gray-200 bg-white rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border-2 border-completed flex items-center justify-center flex-shrink-0">
              <Check size={11} className="text-completed" strokeWidth={3} />
            </span>
            <p className="text-[13px] font-semibold text-gray-900">Notification Sent Successfully</p>
          </div>
          <p
            className="text-[13px] text-brand ml-7 mt-0.5 cursor-pointer hover:underline"
            onClick={() => setIsModalOpen(true)}
          >
            Email sent to: {stage.notificationEmail}
          </p>
        </div>
      )}

      {/* Completion Email Modal */}
      <ApprovalEmailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onApprove={handleModalClose}
        subject="JE Currency Fluctuation – March 2026 Completed"
        journalId="J166CNJ807"
        senderName="Singh, Gagandeep"
        recipientName="Singh, Gagandeep"
        attachments={[
          { name: 'Balance Write-off Request.PDF', size: '223 KB', type: 'pdf' },
        ]}
        emailBody={emailBody}
        signOff="Regards,"
        senderTitle="System Notification"
        hideApproveButton
      />
    </div>
  );
};

export default UploadERP;
