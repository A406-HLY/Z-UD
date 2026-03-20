import { useMemo } from 'react';
import { LegacySpinner } from '@/shared/ui';
import { StatusBadge } from '@/entities/loan-document/ui/StatusBadge';
import { Document } from '@/entities/loan-document/model/types';
import { documentMapper } from '@/entities/loan-document/model/document.mapper';
import { 
  DOCUMENT_VIEWER_LABELS, 
  DOCUMENT_TABLE_HEADERS 
} from '@/entities/loan-document/model/document.constants';
import { useAgentFiles } from '@/features/document-sync/api/use-agent-files';
import { useAppSelector } from '@/app/store/hooks';



interface DocumentViewerProps {
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  toggleAll: (checked: boolean) => void;
  isScanComplete?: boolean; // (Why) 스캔 완료 시 시인성을 위해 스피너 비활성화를 제어합니다.
}

/**
 * @widget DocumentViewer
 * 중앙 분할형 서류 뷰어 위젯입니다.
 * (Why) 에이전트 연동 데이터와 전역 폴링 상태를 결합하여 실시간 서류 현황을 렌더링합니다.
 */
export const DocumentViewer = ({ selectedIds, toggleSelect, toggleAll, isScanComplete }: DocumentViewerProps) => {
  // (Why) 전역 상태(Redux)에서 폴링 활성화 여부를 직접 가져와 통신 여부를 결정합니다.
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

  // 1. 데이터 가져오기 (Feature)
  const { data: agentFiles } = useAgentFiles(isPollingActive);

  // 2. 데이터 변환 (Mapper)
  const agentDocs = useMemo(() => {
    if (!agentFiles) return [];
    return agentFiles.map(documentMapper.toDomainFromAgent);
  }, [agentFiles]);

  // 3. 비즈니스 로직 및 상태 관리 (Hook 제거 - 부모로부터 Props로 전달받음)

  // 4. 데이터 섹션 조립 (A -> B Overflow 로직)
  // (Why) 서류가 많아질 경우 왼쪽 칸(A)을 먼저 채우고, 20개가 넘어가면 오른쪽 칸(B)으로 넘겨 공간 효율을 극대화합니다.
  const COLUMN_THRESHOLD = 20;
  const displayDocsA = useMemo(() => agentDocs.slice(0, COLUMN_THRESHOLD), [agentDocs]);
  const displayDocsB = useMemo(() => agentDocs.slice(COLUMN_THRESHOLD), [agentDocs]);

  /** 테이블 섹션 렌더링 함수 (UI 전용) */
  const renderTable = (docs: Document[], isLeftColumn: boolean) => (
    <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa] overflow-y-auto w-1/2">
      <table className="w-full text-left border-collapse table-fixed">
        <thead className="bg-[#f0f4f8] text-[10px] uppercase text-gray-500 font-bold border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-2 py-1.5 w-8 text-center">
              {isLeftColumn && (
                <input 
                  type="checkbox" 
                  className="rounded-none border-gray-300 w-3 h-3 text-[#004b93] cursor-pointer" 
                  checked={agentDocs.length > 0 && selectedIds.size === agentDocs.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              )}
            </th>
            <th className="px-2 py-1.5 w-10 text-center">{DOCUMENT_TABLE_HEADERS.NO}</th>
            <th className="px-2 py-1.5">{DOCUMENT_TABLE_HEADERS.FILE_NAME}</th>
            <th className="px-2 py-1.5 w-24 text-center">{DOCUMENT_TABLE_HEADERS.STATUS}</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors text-[11px] group">
              <td className="px-2 py-1.5 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(doc.id)}
                  onChange={() => toggleSelect(doc.id)}
                  className="rounded-none border-gray-300 text-[#004b93] w-3 h-3 cursor-pointer" 
                />
              </td>
              <td className="px-2 py-1.5 text-gray-400 font-mono text-center">{doc.no}</td>
              <td className="px-2 py-1.5 font-medium text-slate-700 truncate group-hover:text-blue-600 cursor-pointer">
                {doc.fileName}
              </td>
              <td className="px-2 py-1.5 flex justify-center">
                <StatusBadge status={doc.status} />
              </td>
            </tr>
          ))}
          {/* 하단 패딩을 위한 빈 공간 */}
          {docs.length > 0 && (
            <tr className="h-full">
              <td colSpan={4}></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-none overflow-hidden shadow-sm h-full">
      {/* 1. 단일 통합 헤더 */}
      <div className="px-4 py-2 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
        <h3 className="text-sm font-black text-[#004b93]">
          {DOCUMENT_VIEWER_LABELS.SEGMENT_A} <span className="text-[11px] text-gray-400 font-bold ml-1">({agentDocs.length})</span>
        </h3>
        
        {/* 오른쪽 끝 스피너 및 상태 가이드 */}
        <div className="flex items-center">
          {isPollingActive && !isScanComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-none bg-blue-50/50 border border-blue-100">
              <LegacySpinner size="sm" color="primary" />
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

      {/* 2. 콘텐츠/테이블 영역 */}
      <div className="flex-1 flex min-h-0 bg-[#fafafa] relative">
        {/* A -> B 연속 흐름 듀얼 뷰어 (항상 표시) */}
        {renderTable(displayDocsA, true)}
        <div className="w-px bg-gray-200 shrink-0" />
        {renderTable(displayDocsB, false)}

        {/* 빈 상태 오버레이 (서류가 없을 때만 중앙에 표시) */}
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
