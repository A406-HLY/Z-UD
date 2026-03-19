import { useMemo } from 'react';
import { Button } from '@/shared/ui';
import { StatusBadge } from '@/entities/loan-document/ui/StatusBadge';
import { Document } from '@/entities/loan-document/model/types';
import { documentMapper } from '@/entities/loan-document/model/document.mapper';
import { useAgentFiles } from '@/features/document-sync/api/use-agent-files';
import { useSelectSync } from '@/features/document-sync/model/use-select-sync';
import { useAppSelector } from '@/app/store/hooks';

const EMPTY_DOCS: Document[] = [];

/**
 * @widget DocumentViewer
 * 중앙 분할형 서류 뷰어 위젯입니다.
 * (Why) 에이전트 연동 데이터와 전역 폴링 상태를 결합하여 실시간 서류 현황을 렌더링합니다.
 */
export const DocumentViewer = () => {
  // (Why) 전역 상태(Redux)에서 폴링 활성화 여부를 직접 가져와 통신 여부를 결정합니다.
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

  // 1. 데이터 가져오기 (Feature)
  const { data: agentFiles } = useAgentFiles(isPollingActive);

  // 2. 데이터 변환 (Mapper)
  const agentDocs = useMemo(() => {
    if (!agentFiles) return [];
    return agentFiles.map(documentMapper.toDomainFromAgent);
  }, [agentFiles]);

  // 3. 비즈니스 로직 및 상태 관리 (Hook)
  const { selectedIds, toggleSelect } = useSelectSync(agentDocs);

  // 4. 데이터 섹션 조립
  const displayDocsA = useMemo(() => [...agentDocs, ...EMPTY_DOCS], [agentDocs]);

  /** 테이블 섹션 렌더링 함수 (UI 전용) */
  const renderTable = (title: string, docs: Document[]) => (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700">{title} [COUNT: {docs.length}]</h3>
        {isPollingActive && title.includes('A') && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">
              Agent Synced
            </span>
          </div>
        )}
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 w-10 text-center">
              <input type="checkbox" className="rounded-sm border-gray-300" />
            </th>
            <th className="px-3 py-2 w-12">NO.</th>
            <th className="px-3 py-2">FILE NAME</th>
            <th className="px-3 py-2 w-28 text-center">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors text-xs">
              <td className="px-3 py-2 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(doc.id)}
                  onChange={() => toggleSelect(doc.id)}
                  className="rounded-sm border-gray-300 text-[#004b93]" 
                />
              </td>
              <td className="px-3 py-2 text-gray-500">{doc.no}</td>
              <td className="px-3 py-2 font-medium text-blue-600 underline cursor-pointer truncate">
                {doc.fileName}
              </td>
              <td className="px-3 py-2 flex justify-center">
                <StatusBadge status={doc.status} />
              </td>
            </tr>
          ))}
          {docs.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-10 text-center text-gray-400 text-xs text-not-italic">
                제출된 서류가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b border-gray-200 bg-white flex justify-end items-center">
        <Button 
          size="sm" 
          variant="primary"
          className="bg-[#004b93] text-white text-xs px-6"
          onClick={() => alert('다음 단계로 진행합니다.')}
        >
          다음 단계
        </Button>
      </div>
      <div className="flex h-[500px]">
        {renderTable('BATCH SEGMENT A', displayDocsA)}
        <div className="w-px bg-gray-200" />
        {renderTable('BATCH SEGMENT B', EMPTY_DOCS)}
      </div>
    </div>
  );
};
