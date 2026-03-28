import { useState, useMemo, useEffect } from 'react';
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

  // (Why: 문서가 변경되면 페이지 번호(1)와 배율(80%)을 초기화하여 싱크를 맞춥니다.)
  useEffect(() => {
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
    if (!ocrData || !id) return null;
    return mapServerResponseToVerificationResult(ocrData, id);
  }, [ocrData, id]);

  if (isLoading || !localResult) {
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
        originalWidth={selectedDoc?.resolution?.width}
        originalHeight={selectedDoc?.resolution?.height}
        scale={scale}
        pageNumber={pageNumber}
        onScaleChange={setScale}
        onPageChange={setPageNumber}
      />
    </div>
  );
};
