import { useMemo } from 'react';
import { Button, LegacySpinner } from '@/shared/ui';
import { StatusBadge } from '@/entities/loan-document/ui/StatusBadge';
import { Document } from '@/entities/loan-document/model/types';
import { documentMapper } from '@/entities/loan-document/model/document.mapper';
import { 
  DOCUMENT_VIEWER_LABELS, 
  DOCUMENT_TABLE_HEADERS 
} from '@/entities/loan-document/model/document.constants';
import { useAgentFiles } from '@/features/document-sync/api/use-agent-files';
import { useSelectSync } from '@/features/document-sync/model/use-select-sync';
import { useAppSelector } from '@/app/store/hooks';
import { useNavigate } from 'react-router-dom';
import { useUploadDocuments } from '@/features/document-sync/api/use-upload-documents';

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
  const navigate = useNavigate();
  const { selectedIds, toggleSelect, toggleAll } = useSelectSync(agentDocs);
  const { mutate: uploadDocuments, isPending } = useUploadDocuments();

  // (Why) Redux Store에 저장된 상담 ID를 가져와 업로드 요청 시 사용합니다.
  const counselId = useAppSelector((state) => state.customer.data.counselId);

  /** 
   * "다음 단계" 진행 핸들러 
   * (Why) 선택된 서류들의 시퀀스 정보를 에이전트를 통해 백엔드로 전송하고, 성공 시 결과 페이지로 이동합니다.
   */
  const handleNextStep = () => {
    if (!counselId) {
      alert('상담 ID가 존재하지 않습니다. 고객 정보를 먼저 저장해 주세요.');
      return;
    }

    if (selectedIds.size === 0) {
      alert('전송할 서류를 선택해 주세요.');
      return;
    }

    const sequenceIds = Array.from(selectedIds).map(id => 
      parseInt(id.replace('agent-', ''), 10)
    );

    uploadDocuments(
      { counselId, mode: 'selected', sequenceIds },
      {
        onSuccess: () => {
          // (Why) 다른 팀원이 개발 중인 결과 확인 페이지로 이동합니다.
          navigate('/verification-result');
        },
        onError: () => {
          alert('서류 전송 중 오류가 발생했습니다.');
        }
      }
    );
  };

  // 4. 데이터 섹션 조립
  const displayDocsA = useMemo(() => [...agentDocs, ...EMPTY_DOCS], [agentDocs]);

  /** 테이블 섹션 렌더링 함수 (UI 전용) */
  const renderTable = (title: string, docs: Document[]) => (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-700">{title} <span className="text-[10px] text-gray-400 font-normal">({docs.length})</span></h3>
        {isPollingActive && title === DOCUMENT_VIEWER_LABELS.SEGMENT_A && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-slate-100 border border-slate-200">
            {/** (Why) 공통으로 추출된 레거시 스피너를 사용하여 일관된 로딩 UI를 제공합니다. */}
            <LegacySpinner size="sm" />
            <span className="text-[9px] text-slate-600 font-bold tracking-tight">
              {DOCUMENT_VIEWER_LABELS.SCANNING_STATUS}
            </span>
          </div>
        )}
      </div>
      {/* (Why) 테이블 내부 텍스트(파일명 등)가 길어져도 부모 너비를 뚫고 나가지 않도록 table-fixed를 적용합니다. */}
      <table className="w-full text-left border-collapse table-fixed">
        <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b border-gray-200">
          <tr>
            <th className="px-2 py-1.5 w-8 text-center">
              <input 
                type="checkbox" 
                className="rounded-none border-gray-300 w-3 h-3" 
                checked={docs.length > 0 && Array.from(docs).every(d => selectedIds.has(d.id))}
                onChange={(e) => toggleAll(e.target.checked)}
              />
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
                  className="rounded-none border-gray-300 text-[#004b93] w-3 h-3" 
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
          {docs.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-gray-400 text-[10px] text-not-italic leading-relaxed">
                {DOCUMENT_VIEWER_LABELS.EMPTY_MESSAGE_LINE1}
                <br/>
                {DOCUMENT_VIEWER_LABELS.EMPTY_MESSAGE_LINE2}
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
          onClick={handleNextStep}
          disabled={isPending}
        >
          {isPending ? DOCUMENT_VIEWER_LABELS.UPLOADING_STATUS : DOCUMENT_VIEWER_LABELS.NEXT_STEP_BUTTON}
        </Button>
      </div>
      <div className="flex flex-1 min-h-[300px]">
        {renderTable(DOCUMENT_VIEWER_LABELS.SEGMENT_A, displayDocsA)}
        <div className="w-px bg-gray-200" />
        {renderTable(DOCUMENT_VIEWER_LABELS.SEGMENT_B, EMPTY_DOCS)}
      </div>
    </div>
  );
};
