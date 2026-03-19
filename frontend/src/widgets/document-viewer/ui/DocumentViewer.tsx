import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/shared/ui';
import { StatusBadge } from '@/entities/loan-document/ui/StatusBadge';
import { useAgentFiles } from '@/features/document-sync/api/use-agent-files';

/**
 * 서류 정보 타입 정의
 */
interface Document {
  id: string;
  no: number;
  fileName: string;
  status: 'VERIFIED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'UPLOADING';
}

interface DocumentViewerProps {
  isPollingActive: boolean;
}

const EMPTY_DOCS: Document[] = [];

/**
 * @widget DocumentViewer
 * 중앙 분할형 서류 뷰어 위젯입니다.
 * (Why) BATCH A/B 영역을 동시에 확인하며, 에이전트로부터 실시간으로 감지된 파일을 목록에 노출하고 자동 선택 기능을 제공합니다.
 */
export const DocumentViewer = ({ isPollingActive }: DocumentViewerProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // (Why) 에이전트 연동 활성화 상태일 때 데이터를 폴링합니다.
  const { data: agentFiles } = useAgentFiles(isPollingActive);

  /** 에이전트 파일 데이터를 Document 형식으로 변환 */
  const agentDocs = useMemo(() => {
    if (!agentFiles) return [];
    return agentFiles.map((file) => ({
      id: `agent-${file.sequenceId}`,
      no: file.sequenceId, // 에이전트 시퀀스를 번호로 활용
      fileName: file.fileName,
      status: file.status,
    })) as Document[];
  }, [agentFiles]);

  /** 
   * (Why) 에이전트에서 새 서류가 감지되면 자동으로 체크박스를 선택 상태로 만듭니다.
   */
  useEffect(() => {
    if (agentDocs.length > 0) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        let hasNew = false;
        agentDocs.forEach((doc) => {
          if (!next.has(doc.id)) {
            next.add(doc.id);
            hasNew = true;
          }
        });
        return hasNew ? next : prev;
      });
    }
  }, [agentDocs]);

  /** 기존 목록과 에이전트 감지 목록 합치기 */
  const displayDocsA = useMemo(() => [...agentDocs, ...EMPTY_DOCS], [agentDocs]);

  /** 체크박스 선택 토글 핸들러 */
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  /** 테이블 섹션 렌더링 함수 */
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
