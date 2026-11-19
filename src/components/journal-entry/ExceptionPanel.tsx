import React, { useState } from 'react';
import { AlertTriangle, XCircle, Paperclip, Send, X, FileText, FileSpreadsheet } from 'lucide-react';
import type { StageData } from '../../types';
import { cn } from '../../lib/utils';

interface ExceptionPanelProps {
  stage: StageData;
  variant: 'warning' | 'error';
  onSendFile?: (fileName: string) => void;
}

export const ExceptionPanel: React.FC<ExceptionPanelProps> = ({
  stage,
  variant,
  onSendFile,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const isError = variant === 'error';

  const panelStyles = isError
    ? {
        border: 'border-failed-border',
        bg: 'bg-failed-light',
        titleColor: 'text-failed',
        icon: <XCircle size={18} className="text-failed flex-shrink-0" />,
        sendBg: 'bg-failed hover:bg-failed-dark',
      }
    : {
        border: 'border-warning-border',
        bg: 'bg-warning-light',
        titleColor: 'text-warning',
        icon: <AlertTriangle size={18} className="text-warning flex-shrink-0" />,
        sendBg: 'bg-warning hover:bg-warning-dark',
      };

  const handleSend = () => {
    if (attachedFile && onSendFile) {
      onSendFile(attachedFile);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.csv') || fileName.endsWith('.xls')) {
      return <FileSpreadsheet size={14} className="text-completed" />;
    }
    return <FileText size={14} className="text-failed" />;
  };

  return (
    <div
      className={cn(
        'border rounded-lg mt-4 overflow-hidden',
        panelStyles.border,
        panelStyles.bg,
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {panelStyles.icon}
          <h4 className={cn('font-semibold text-[14px]', panelStyles.titleColor)}>
            {stage.exceptionTitle}
          </h4>
        </div>
        <button className="p-1 rounded hover:bg-black/5 transition-colors">
          <X size={16} className="text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {/* Agent messages */}
      <div className="px-4 pb-2 space-y-3">
        {stage.agentMessages?.map((msg, i) => (
          <div key={i}>
            {msg.role === 'agent' && (
              <div>
                <span
                  className={cn(
                    'inline-block text-white text-[11px] font-semibold px-2 py-0.5 rounded mb-1',
                    isError ? 'bg-warning' : 'bg-gray-700',
                  )}
                >
                  Agent
                </span>
                <p className="text-[13px] text-gray-700 whitespace-pre-line leading-5">
                  <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </p>
                <p className="text-[11px] text-gray-400 mt-1">{msg.timestamp}</p>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="flex items-start gap-2">
                <span className="inline-block bg-brand text-white text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0">
                  {msg.userName}
                </span>
                <div>
                  {msg.attachment && (
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                      <FileText size={14} className="text-gray-500" />
                      <span>{msg.attachment}</span>
                    </div>
                  )}
                  {msg.content && (
                    <p className="text-[13px] text-gray-700">{msg.content}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      {stage.exceptionActionButtons && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {stage.exceptionActionButtons.map((btn) => (
            <button
              key={btn}
              className="px-3 py-1.5 text-[12px] font-medium border border-gray-300 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      {/* Input area with inline file attachment */}
      <div className="px-4 pb-4">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Attached file shown inside the input box */}
          {attachedFile && (
            <div className="px-3 pt-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 w-fit">
                {getFileIcon(attachedFile)}
                <span className="text-[12px] text-gray-700 font-medium">{attachedFile}</span>
                <span className="text-[11px] text-gray-400">100 KB of 1.5MB</span>
                <button onClick={() => setAttachedFile(null)} className="ml-0.5">
                  <X size={12} className="text-gray-400 hover:text-gray-700" />
                </button>
              </div>
            </div>
          )}

          {/* Text input + actions row */}
          <div className="flex items-center gap-2 px-3 py-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={attachedFile ? '' : 'Type response or attach the file here'}
              className="flex-1 text-[13px] outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
            />
            <label className="cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors">
              <Paperclip size={16} className="text-gray-400 hover:text-gray-500" />
              <input
                type="file"
                className="hidden"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAttachedFile(e.target.files[0].name);
                  }
                }}
              />
            </label>
            <button
              onClick={handleSend}
              disabled={!attachedFile && !inputValue.trim()}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors',
                attachedFile || inputValue.trim()
                  ? panelStyles.sendBg
                  : 'bg-gray-300 cursor-not-allowed',
              )}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExceptionPanel;
