import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { mapServerResponseToVerificationResult } from '@/entities/verification/model/verification.mapper';
import { useCrossWindowSync } from '@/features/verification/model/use-cross-window-sync';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';

export const PdfViewerPage = () => {
  const { id } = useParams<{ id: string }>();

  const ocrData = useAppSelector(state => state.audit.data.ocrData);
  const ocrStatus = useAppSelector(state => state.audit.steps.ocr);
  const isLoading = ocrStatus === 'LOADING' || ocrStatus === 'IDLE';

  const [searchParams] = useSearchParams();
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialScale = Number(searchParams.get('scale')) || 0.8;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(initialScale);
  const [focusedFieldKey, setFocusedFieldKey] = useState<string | null>(null);

  useEffect(() => {
    setPageNumber(1);
    setScale(0.8);
  }, [selectedId]);

  useCrossWindowSync({
    role: 'receiver',
    onSync: (payload) => {
      if (payload.selectedId !== undefined) setSelectedId(payload.selectedId);
      if (payload.pageNumber !== undefined) setPageNumber(payload.pageNumber);
      if (payload.scale !== undefined) setScale(payload.scale);
      if (payload.focusedFieldKey !== undefined) setFocusedFieldKey(payload.focusedFieldKey);
    }
  });

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
        scale={scale}
        pageNumber={pageNumber}
        onScaleChange={setScale}
        onPageChange={setPageNumber}
      />
    </div>
  );
};