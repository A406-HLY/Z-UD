import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { Header } from '@/widgets/header/ui/Header';
import { CustomerInfoForm } from '@/widgets/customer-info-form/ui/CustomerInfoForm';
import { LoanTabs } from '@/widgets/loan-tabs/ui/LoanTabs';
import { DocumentViewer } from '@/widgets/document-viewer/ui/DocumentViewer';
import { PollingStatusToast } from '@/entities/customer/ui/PollingStatusToast';
import { useSelectSync } from '@/features/document-sync/model/use-select-sync';
import { useUploadDocuments } from '@/features/document-sync/api/use-upload-documents';
import { useAgentFiles } from '@/features/document-sync/api/use-agent-files';
import { documentMapper } from '@/entities/loan-document/model/document.mapper';

/**
 * @page LoanApplicationPage
 * 대출 신청 메인 페이지 (기초 정보 입력 단계)입니다.
 * (Why) 페이지 레벨에서는 위젯 간 상태 공유(Selection 등)를 조율하고, 전역 상태(Redux)를 구독하여 하위 위젯에 전달하거나 직접 관리합니다.
 */
export const LoanApplicationPage = () => {
  const navigate = useNavigate();
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);
  const counselId = useAppSelector((state) => state.customer.data.counselId);

  // 1. 데이터 가져와서 가공 (DocumentViewer에 전달할 데이터 준비)
  const { data: agentFiles } = useAgentFiles(isPollingActive);
  const agentDocs = useMemo(() => {
    if (!agentFiles) return [];
    return agentFiles.map(documentMapper.toDomainFromAgent);
  }, [agentFiles]);

  const { selectedIds, toggleSelect, toggleAll } = useSelectSync(agentDocs);
  const { mutate: uploadDocuments, isPending } = useUploadDocuments();

  // (Why) 마지막 서류 감지 후 일정 시간(5초) 동안 변화가 없으면 "스캔 완료"로 간주하여 시각적 가이드를 제공합니다.
  const [isScanComplete, setIsScanComplete] = useState(false);
  const lastFilesCountRef = useRef(0);
  const lastDetectionTimeRef = useRef(Date.now());

  // 1. 서류 개수가 변할 때마다 마지막 감지 시간 업데이트
  useEffect(() => {
    if (agentDocs.length > 0 && agentDocs.length !== lastFilesCountRef.current) {
      lastFilesCountRef.current = agentDocs.length;
      lastDetectionTimeRef.current = Date.now();
      setIsScanComplete(false);
      console.log(`[Scan] New file detected. Count: ${agentDocs.length}. Timer reset.`);
    }
  }, [agentDocs.length]);

  // 2. 폴링 중이고 서류가 있을 때, 1초마다 무활동 시간 체크
  useEffect(() => {
    if (!isPollingActive || agentDocs.length === 0) {
      setIsScanComplete(false);
      lastFilesCountRef.current = agentDocs.length;
      return;
    }

    if (isScanComplete) return;

    const timer = setInterval(() => {
      const idleTime = Date.now() - lastDetectionTimeRef.current;
      if (idleTime > 5000) {
        console.log('[Scan] 5 seconds of idle detected. Marking scan as complete.');
        setIsScanComplete(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [agentDocs.length, isPollingActive, isScanComplete]);

  /** "다음 단계" 진행 핸들러 */
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
          navigate('/verification-result');
        },
        onError: () => {
          alert('서류 전송 중 오류가 발생했습니다.');
        }
      }
    );
  };
  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden relative">
      {/* (Why) 전체 브라우저 스크롤을 방지하고 내부 위젯(뷰어)만 스크롤 가능하게 하기 위해 h-screen과 overflow-hidden을 사용합니다. */}
      {/* 전역 상태 팝업 */}
      <PollingStatusToast />
      
      {/* 1. 고정 헤더 */}
      <Header />

      {/* 2. 메인 콘텐츠 영역 (Flex Container) */}
      <main className="flex-1 p-4 space-y-4 flex flex-col min-h-0 overflow-hidden">
        {/* 고객 기본정보 입력 영역 */}
        <section className="shrink-0">
          <CustomerInfoForm />
        </section>

        {/* 프로세스 탭 바 + 다음 단계 버튼 */}
        <section className="shrink-0">
          <LoanTabs 
            onNextStep={handleNextStep} 
            isNextStepPending={isPending} 
            isScanComplete={isScanComplete}
          />
        </section>

        {/* 서류 뷰어/콘솔 영역 (Flex-1) */}
        <section className="flex-1 min-h-0">
          <DocumentViewer 
            selectedIds={selectedIds}
            toggleSelect={toggleSelect}
            toggleAll={toggleAll}
            isScanComplete={isScanComplete}
          />
        </section>
      </main>
    </div>
  );
};

export default LoanApplicationPage;
