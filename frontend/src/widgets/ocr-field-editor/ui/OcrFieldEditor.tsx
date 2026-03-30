import { Check, AlertCircle, Info } from 'lucide-react';
import { useMemo } from 'react';
import { ExtractedField, DocumentStatus } from '@/entities/verification/model/types';
import { Input } from '@/shared/ui';
import { useEditorKeyboard } from '../model/use-editor-keyboard';
import { EditorAlertBanner } from './EditorAlertBanner';

interface Props {
  fields: ExtractedField[];
  status: DocumentStatus;

  isRisk?: boolean;
  selectedId?: string | null;
  onFieldChange?: (key: string, value: string) => void;
  onFocus?: (key: string) => void;
  onRequestNextDocument?: () => void;
}

export const OcrFieldEditor = ({ fields, status, isRisk, selectedId, onFieldChange, onFocus, onRequestNextDocument }: Props) => {
  const isReviewNeeded = status === 'REVIEW_NEEDED';

  const { visibleFields, firstErrorIndex, lastErrorIndex } = useMemo(() => {
    const vFields = fields.filter(f => {
      const isEmpty = f.value === null || f.value === undefined || String(f.value).trim() === '';
      return !isEmpty || f.isViolationTarget;
    });

    const errorIndices = vFields
      .map((f, i) => (!f.isMatch ? i : -1))
      .filter(i => i !== -1);

    return {
      visibleFields: vFields,
      firstErrorIndex: errorIndices[0] ?? -1,
      lastErrorIndex: errorIndices[errorIndices.length - 1] ?? -1
    };
  }, [fields]);

  const { handleInputKeyDown } = useEditorKeyboard({
    selectedId: selectedId ?? null,
    firstErrorIndex,
    lastErrorIndex,
    onRequestNextDocument
  });

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
      <div className={`h-[40px] border-b border-gray-300 flex items-center px-4 justify-between shrink-0 transition-colors ${isReviewNeeded ? 'bg-red-50' : isRisk ? 'bg-yellow-50' : 'bg-gray-100'}`}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#444] uppercase tracking-wider">OCR Data Correction</span>        </div>
      </div>

      <EditorAlertBanner isReviewNeeded={isReviewNeeded} isRisk={isRisk} />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {visibleFields.map((field, index) => {

            if (field.key === 'latestLossDate' && field.value === null) {
              return null;
            }

            const isErrorField = !field.isMatch;

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
                  tabIndex={!canEdit ? -1 : 0}
                  data-document-id={selectedId}
                  data-nav-error={isErrorField}
                  onFocus={() => onFocus?.(field.key)}
                  onChange={(e) => onFieldChange?.(field.key, e.target.value)}
                  onBlur={() => {}}
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