import { Check, AlertCircle, Info } from 'lucide-react';
import { useMemo } from 'react';
import { ExtractedField, DocumentStatus } from '@/entities/verification/model/types';
import { Input } from '@/shared/ui';
import { useEditorKeyboard } from '../model/use-editor-keyboard';
import { EditorAlertBanner } from './EditorAlertBanner';

interface Props {
  fields: ExtractedField[];
  status: DocumentStatus;
  /** 문서 전체 단위의 위험 여부 플래그 (cf. field.isRiskTarget: 개별 필드 원인 단위) */
  isRisk?: boolean;
  selectedId?: string | null;
  onFieldChange?: (key: string, value: string) => void;
  onFocus?: (key: string) => void;
  onRequestNextDocument?: () => void;
}

/**
 * @widget ocr-field-editor
 * OCR로 추출된 데이터 필드를 편집하며 정합성 상태(오류/경고/통과)에 따른 제어 로직을 제공합니다.
 * (Why: 정합성이 통과된 데이터는 수정을 막아 데이터 무결성을 보장하고, 오류가 있는 데이터만 집중 검수 유도)
 */
export const OcrFieldEditor = ({ fields, status, isRisk, selectedId, onFieldChange, onFocus, onRequestNextDocument }: Props) => {
  const isReviewNeeded = status === 'REVIEW_NEEDED';

  // (Point: 렌더링 최적화 및 제어용 인덱스 추출)
  const { errorFieldIndices, firstErrorIndex, lastErrorIndex } = useMemo(() => {
    const indices = fields
      .map((f, i) => (!f.isMatch ? i : -1))
      .filter(i => i !== -1);
    return {
      errorFieldIndices: indices,
      firstErrorIndex: indices[0] ?? -1,
      lastErrorIndex: indices[indices.length - 1] ?? -1
    };
  }, [fields]);

  const { handleInputKeyDown } = useEditorKeyboard({
    selectedId: selectedId ?? null,
    firstErrorIndex,
    lastErrorIndex,
    onRequestNextDocument
  });

  /**
   * (Point: 4중 중첩 삼항 연산자를 제거하고 선언적인 스타일링 로직 제공)
   */
  const getFieldStyles = (field: ExtractedField, canEdit: boolean) => {
    const isError = !field.isMatch;

    if (isError) return 'border-red-400 bg-red-50 text-red-700 font-bold focus-within:border-red-600 focus-within:bg-white focus-within:ring-red-600 cursor-text';
    if (field.isRiskTarget) return 'border-yellow-400 bg-yellow-50 text-yellow-800 focus-within:border-yellow-600 focus-within:bg-white focus-within:ring-yellow-600 cursor-pointer';
    if (field.isModified) return 'border-blue-400 bg-blue-50 text-[#444] font-bold focus-within:border-blue-600 focus-within:bg-white focus-within:ring-blue-600 cursor-text';
    if (!canEdit) return 'bg-gray-50/30 border-gray-100 text-gray-400 cursor-pointer select-none focus-within:border-gray-300';
    
    return 'border-gray-300 bg-[#fcfcfc] focus-within:border-[#004b93] focus-within:bg-white cursor-text';
  };
  
  return (
    <div className="flex-1 h-full min-h-0 border-r border-gray-300 flex flex-col bg-white overflow-hidden">
      {/* Header with Dynamic Judgment Badge */}
      <div className={`h-[40px] border-b border-gray-300 flex items-center px-4 justify-between shrink-0 transition-colors ${isReviewNeeded ? 'bg-red-50' : isRisk ? 'bg-yellow-50' : 'bg-gray-100'}`}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#444] uppercase tracking-wider">OCR Data Correction</span>        </div>
      </div>

      {/* (Point: 복잡한 배너 로직을 컴포넌트로 분리) */}
      <EditorAlertBanner isReviewNeeded={isReviewNeeded} isRisk={isRisk} />

      {/* Field List Section */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {fields.map((field, index) => {
            // 정합성 통과 여부 및 수정 가능 여부 판단
            const isErrorField = !field.isMatch;

            // (Why: 위험(Risk) 필드는 행원에게 경고(인지)만 하고 원본 보존을 위해 수정은 막음. 
            // 오직 정합성 오류(Violation)가 있거나 이미 수정을 시작한 필드만 편집 허용)
            const canEdit = isErrorField || field.isModified;

            return (
              <div key={field.id} className="space-y-1.5 group">
                <label className={`
                  text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1
                  ${isErrorField ? 'text-red-500' : field.isRiskTarget ? 'text-yellow-700' : 'text-gray-400'}
                `}>
                  {field.label}               
                  {!isErrorField && !field.isRiskTarget && <Check className="w-2.5 h-2.5 text-gray-400" />}
                </label>
                
                <Input 
                  value={String(field.value ?? '')}
                  readOnly={!canEdit}
                  data-document-id={selectedId}
                  data-nav-error={isErrorField}
                  onFocus={() => onFocus?.(field.key)}
                  onChange={(e) => onFieldChange?.(field.key, e.target.value)}
                  onBlur={() => {}} // TODO: 필요 시 Blur 처리 추가
                  onKeyDown={(e) => handleInputKeyDown(e, index)}
                  className={`h-8 rounded-none transition-all ${getFieldStyles(field, canEdit)}`}
                  inputClassName={`!text-[10px] font-mono ${!canEdit ? '!cursor-pointer' : ''}`}
                  rightElement={
                    isErrorField ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : field.isRiskTarget ? (
                      <Info className="w-3.5 h-3.5 text-yellow-600" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-gray-400 opacity-60" />
                    )
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
