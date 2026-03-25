import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { Header } from '@/widgets/header/ui/Header';
import { CustomerInfoForm } from '@/widgets/customer-info-form/ui/CustomerInfoForm';
import { LoanTabs } from '@/widgets/loan-tabs/ui/LoanTabs';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';
import { DocumentViewer } from '@/widgets/document-viewer/ui/DocumentViewer';
import { PollingStatusToast } from '@/entities/customer/ui/PollingStatusToast';
import { useSelectSync } from '@/features/document-sync/model/use-select-sync';
import { useUploadDocuments } from '@/features/document-sync/api/use-upload-documents';
import { useAgentDocs } from '@/features/document-sync/model/use-agent-docs';

import { DocumentTransferModal } from '@/features/document-sync/ui/DocumentTransferModal';

/**
 * @page LoanApplicationPage
 * 대출 신청 메인 페이지 (기초 정보 입력 단계)입니다.
 * (Why) 페이지 레벨에서는 위젯 간 상태 공유(Selection 등)를 조율하고, 전역 상태(Redux)를 구독하여 하위 위젯에 전달하거나 직접 관리합니다.
 */
export const LoanApplicationPage = () => {
  const navigate = useNavigate();
  const counselId = useAppSelector((state) => state.customer.data.counselId);
  const customerName = useAppSelector((state) => state.customer.data.name);
  const isSubmitting = useAppSelector((state) => state.customer.isSubmitting);

  // 1. 에이전트 서류 데이터, 폴링 상태, 스캔 완료 상태 가져오기 (Feature)
  const { docs: agentDocs, isPollingActive, isScanComplete } = useAgentDocs();

  // 2. 선택 상태 훅 초기화
  const { selectedIds, toggleSelect, toggleAll } = useSelectSync(agentDocs);
  const { mutate: uploadDocuments, isPending } = useUploadDocuments();


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
      {/* 파일 전송 팝업 (XP 스타일) */}
      <DocumentTransferModal 
        isOpen={isPending || isSubmitting || (isPollingActive && !isScanComplete)} 
        customerName={customerName}
        mode={isPending ? 'upload' : 'scan'} 
      />
      
      {/* 전역 상태 팝업 */}
      <PollingStatusToast />
      
      {/* 1. 고정 헤더 */}
      <Header />

      {/* 2. 메인 콘텐츠 영역 (Flex Container) */}
      <main className="flex-1 p-4 space-y-4 flex flex-col min-h-0 overflow-hidden">
        {/* 프로세스 가이드: 스텝퍼 */}
        <section className="shrink-0">
          <LoanStepper />
        </section>

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
            agentDocs={agentDocs}
            isPollingActive={isPollingActive}
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
