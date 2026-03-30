import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { mapServerResponseToVerificationResult } from '@/entities/verification/model/verification.mapper';
import { useCrossWindowSync } from '@/features/verification/model/use-cross-window-sync';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';

/**
 * @page pdf-viewer
 * 메인 창과 연동되어 PDF 문서만 전체 화면으로 보여주는 독립 페이지입니다.
 */
export const PdfViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // 1. 서버 데이터 조회 (Redux Audit 슬라이스 활용)
  const ocrData = useAppSelector(state => state.audit.data.ocrData);
  const ocrStatus = useAppSelector(state => state.audit.steps.ocr);
  const isLoading = ocrStatus === 'LOADING' || ocrStatus === 'IDLE';

  // 2. 초기 상태 로드 (Query Parameter 활용)
  const [searchParams] = useSearchParams();
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialScale = Number(searchParams.get('scale')) || 0.8;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(initialScale);
  const [focusedFieldKey, setFocusedFieldKey] = useState<string | null>(null);
  const initialFileUrl = searchParams.get('fileUrl');

  // (Why: 문서가 변경되면 페이지 번호(1)와 배율(80%)을 초기화하여 싱크를 맞춥니다.)
  // (Note: 초기 마운트 시에는 쿼리 파라미터로 받은 페이지/배율을 유지하기 위해 초기화 로직을 건너뜁니다.)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPageNumber(1);
    setScale(0.8);
  }, [selectedId]);

  // 3. 크로스 윈도우 동기화 수신 (Receiver)
  useCrossWindowSync({
    role: 'receiver',
    onSync: (payload) => {
      // (Why: undefined가 아닌 경우에만 업데이트하여 null 값도 정상 수신되도록 합니다.)
      if (payload.selectedId !== undefined) setSelectedId(payload.selectedId);
      if (payload.pageNumber !== undefined) setPageNumber(payload.pageNumber);
      if (payload.scale !== undefined) setScale(payload.scale);
      if (payload.focusedFieldKey !== undefined) setFocusedFieldKey(payload.focusedFieldKey);
    }
  });

  // 4. 데이터 매핑
  const localResult = useMemo(() => {
    // (Why: fileUrl이 직접 전달된 경우, ocrData가 없더라도 가상 문서 정보를 생성하여 즉시 렌더링을 지원합니다.)
    if (initialFileUrl) {
      const docId = id || 'v-report';
      return {
        selectedDocId: docId,
        documents: {
          [docId]: { fileUrl: initialFileUrl, files: [], id: docId, fileName: 'Document' }
        },
        documentFields: { [docId]: [] }
      } as any;
    }

    if (!ocrData || !id) return null;
    return mapServerResponseToVerificationResult(ocrData, id);
  }, [ocrData, id, initialFileUrl]);

  // (Why: fileUrl이 전달된 경우에는 Redux 상태(ocrStatus)와 무관하게 즉시 렌더링을 진행합니다.)
  if (!initialFileUrl && (isLoading || !localResult)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#808080] text-white font-mono animate-pulse">
        SYNCING VIEWER...
      </div>
    );
  }

  const activeDocId = selectedId || localResult.selectedDocId;
  const selectedDoc = localResult.documents[activeDocId];
  const fields = localResult.documentFields[activeDocId] || [];

  return (
    <div className="h-screen w-screen bg-[#808080] overflow-hidden">
      <DocumentImageViewer 
        fields={fields}
        focusedFieldKey={focusedFieldKey}
        fileUrl={selectedDoc?.fileUrl}
        files={selectedDoc?.files}
        scale={scale}
        pageNumber={pageNumber}
        onScaleChange={setScale}
        onPageChange={setPageNumber}
        showFullButton={false}
      />
    </div>
  );
};
