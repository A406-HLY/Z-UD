import { useMemo } from 'react';
import { LegacySpinner } from '@/shared/ui';
import { Document } from '@/entities/loan-document/model/types';
import { DOCUMENT_VIEWER_LABELS } from '@/entities/loan-document/model/document.constants';
import { DocumentTable } from './DocumentTable';

interface DocumentViewerProps {
  agentDocs: Document[];
  isPollingActive: boolean;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  toggleAll: (checked: boolean) => void;
  isScanComplete?: boolean;
}

export const DocumentViewer = ({ agentDocs, isPollingActive, selectedIds, toggleSelect, toggleAll, isScanComplete }: DocumentViewerProps) => {

  const COLUMN_THRESHOLD = 20;
  const displayDocsA = useMemo(() => agentDocs.slice(0, COLUMN_THRESHOLD), [agentDocs]);
  const displayDocsB = useMemo(() => agentDocs.slice(COLUMN_THRESHOLD), [agentDocs]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-none overflow-hidden shadow-sm h-full">
      <div className="px-4 py-2 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
        <h3 className="text-sm font-black text-[#004b93]">
          {DOCUMENT_VIEWER_LABELS.SEGMENT_A} <span className="text-[11px] text-gray-400 font-bold ml-1">({agentDocs.length})</span>
        </h3>

        <div className="flex items-center">
          {isPollingActive && !isScanComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-none bg-blue-50/50 border border-blue-100">
              <LegacySpinner size="sm" />
              <span className="text-[10px] text-[#004b93] font-bold tracking-tight">
                {DOCUMENT_VIEWER_LABELS.SCANNING_STATUS}
              </span>
            </div>
          )}
          {isPollingActive && isScanComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-none bg-gray-50 border border-gray-200">
              <div className="w-1.5 h-1.5 rounded-full bg-[#004b93]" />
              <span className="text-[10px] text-gray-600 font-bold tracking-tight">스캔 완료</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0 bg-[#fafafa] relative">
        <DocumentTable
          docs={displayDocsA}
          isLeftColumn={true}
          selectedIds={selectedIds}
          totalDocsLength={agentDocs.length}
          toggleAll={toggleAll}
          toggleSelect={toggleSelect}
        />
        <div className="w-px bg-gray-200 shrink-0" />
        <DocumentTable
          docs={displayDocsB}
          isLeftColumn={false}
          selectedIds={selectedIds}
          totalDocsLength={agentDocs.length}
          toggleAll={toggleAll}
          toggleSelect={toggleSelect}
        />

        {agentDocs.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <div className="bg-[#fafafa] px-6 py-4 flex flex-col items-center text-gray-400">
              <p className="text-[11px] font-medium leading-relaxed text-center">
                {DOCUMENT_VIEWER_LABELS.EMPTY_MESSAGE_LINE1}
                <br />
                {DOCUMENT_VIEWER_LABELS.EMPTY_MESSAGE_LINE2}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};