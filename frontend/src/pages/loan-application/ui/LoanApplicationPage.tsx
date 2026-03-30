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

export const LoanApplicationPage = () => {
  const navigate = useNavigate();
  const consultationId = useAppSelector((state) => state.customer.data.consultationId);
  const customerName = useAppSelector((state) => state.customer.data.name);
  const isSubmitting = useAppSelector((state) => state.customer.isSubmitting);

  const { docs: agentDocs, isPollingActive, isScanComplete } = useAgentDocs();

  const { selectedIds, toggleSelect, toggleAll } = useSelectSync(agentDocs);
  const { mutate: uploadDocuments, isPending } = useUploadDocuments();

  const handleNextStep = () => {
    if (!consultationId) {
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
      { consultationId: consultationId, mode: 'selected', sequenceIds },
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
      {}
      <DocumentTransferModal
        isOpen={isPending || isSubmitting || (isPollingActive && !isScanComplete)}
        customerName={customerName}
        mode={isPending ? 'upload' : 'scan'}
      />

      <PollingStatusToast />

      <Header />

      <main className="flex-1 p-4 space-y-4 flex flex-col min-h-0 overflow-hidden">
        <section className="shrink-0">
          <LoanStepper />
        </section>

        <section className="shrink-0">
          <CustomerInfoForm />
        </section>

        <section className="shrink-0">
          <LoanTabs
            onNextStep={handleNextStep}
            isNextStepPending={isPending}
            isScanComplete={isScanComplete}
          />
        </section>

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