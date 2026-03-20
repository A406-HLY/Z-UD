import { Check, Save, AlertCircle, Info } from 'lucide-react';
import { ExtractedField, DocumentStatus } from '@/entities/verification/model/types';

interface Props {
  fields: ExtractedField[];
  status: DocumentStatus;
  isRisk?: boolean;
  onFieldChange?: (key: string, value: string) => void;
}

/**
 * @widget ocr-field-editor
 * OCR로 추출된 데이터 필드를 편집하며 정합성 상태(오류/경고/통과)에 따른 제어 로직을 제공합니다.
 * (Why: 정합성이 통과된 데이터는 수정을 막아 데이터 무결성을 보장하고, 오류가 있는 데이터만 집중 검수 유도)
 */
export const OcrFieldEditor = ({ fields, status, isRisk, onFieldChange }: Props) => {
  // 문서 자체가 정합성 오류 상태인지 확인
  const isReviewNeeded = status === 'REVIEW_NEEDED';
  
  return (
    <div className="flex-1 h-full border-r border-gray-300 flex flex-col bg-white overflow-hidden">
      {/* Header with Dynamic Judgment Badge */}
      <div className={`h-[36px] border-b border-gray-300 flex items-center px-4 justify-between shrink-0 transition-colors ${isReviewNeeded ? 'bg-red-50' : isRisk ? 'bg-yellow-50' : 'bg-gray-100'}`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#444] uppercase tracking-wider">OCR Data Correction</span>
          {isRisk && <span className="px-1.5 py-0.5 bg-yellow-600 text-white text-[8px] font-black uppercase">RISK DOC</span>}
        </div>
        
        {/* Priority Status Badge */}
        {isReviewNeeded ? (
          <div className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-tighter animate-pulse shadow-sm flex items-center gap-1">
             <AlertCircle className="w-3 h-3" /> JUDGMENT: MISMATCH
          </div>
        ) : isRisk ? (
          <div className="px-2 py-0.5 bg-yellow-600 text-white text-[9px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
             <Info className="w-3 h-3" /> JUDGMENT: CHECK RISK
          </div>
        ) : (
          <div className="px-2 py-0.5 bg-green-600 text-white text-[9px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
             <Check className="w-3 h-3" /> JUDGMENT: VERIFIED
          </div>
        )}
      </div>

      {/* Risk Alert Banner */}
      {isRisk && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 flex items-start gap-3">
          <Info className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-yellow-800">주의: 세밀한 검토가 필요한 위험 문서입니다.</p>
            <p className="text-[9px] text-yellow-700 leading-tight">해당 문서는 백엔드 시스템에서 위험 요소가 탐지되었습니다. 추출된 데이터와 실물 이미지를 대조하여 최종 승인해 주시기 바랍니다.</p>
          </div>
        </div>
      )}

      {/* Field List Section */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {fields.map((field) => {
            // 정합성 통과 여부 및 수정 가능 여부 판단
            const isErrorField = !field.isMatch;

            // (Why: 위험(Risk) 필드는 행원에게 경고(인지)만 하고 원본 보존을 위해 수정은 막음. 
            // 오직 정합성 오류(Violation)가 있거나 이미 수정을 시작한 필드만 편집 허용)
            const canEdit = isErrorField || field.isModified;

            return (
              <div key={field.id} className="space-y-1.5 group">
                <label className={`
                  text-[9px] font-bold uppercase tracking-tighter flex items-center gap-1
                  ${isErrorField ? 'text-red-500' : isRisk ? 'text-yellow-700' : 'text-gray-400'}
                `}>
                  {field.label} 
                  {isErrorField && <span className="text-[8px] text-red-600 bg-red-50 px-1 border border-red-100 font-normal">(! 불일치)</span>}
                  {!isErrorField && isRisk && <span className="text-[8px] text-yellow-700 bg-yellow-50 px-1 border border-yellow-100 font-normal">(! 주의)</span>}
                  {!isErrorField && !isRisk && <Check className="w-2.5 h-2.5 text-green-500" />}
                </label>
                
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue={String(field.value ?? '')}
                    disabled={!canEdit}
                    onChange={(e) => onFieldChange?.(field.key, e.target.value)}
                    className={`
                      w-full h-8 px-2 pr-8 text-[10px] font-mono border rounded-none shadow-inner transition-all
                      ${!canEdit 
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : isErrorField 
                          ? 'border-red-400 bg-red-50 text-red-700 font-bold focus:border-red-600 focus:bg-white focus:outline-none' 
                          : isRisk
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800 focus:border-yellow-600 focus:bg-white focus:outline-none'
                            : 'border-gray-300 bg-[#fcfcfc] focus:border-[#004b93] focus:bg-white focus:outline-none'
                      }
                      ${field.isModified ? 'border-blue-400 !bg-blue-50' : ''}
                    `}
                  />
                  <div className="absolute right-2 top-2">
                    {isErrorField ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : isRisk ? (
                      <Info className="w-3.5 h-3.5 text-yellow-600" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-green-500 opacity-60" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-[48px] bg-[#F0F2F5] border-t border-gray-300 flex items-center px-4 gap-2 shrink-0">
         <button className="flex-1 h-8 bg-[#004b93] text-white font-bold text-[10px] border border-black hover:bg-blue-800 transition-colors uppercase cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed" disabled={status === 'MISSING'}>
           <Check className="w-3.5 h-3.5" /> Approve Correction
         </button>
         <button className="flex-1 h-8 bg-[#4C566A] text-white font-bold text-[10px] border border-black hover:bg-gray-700 transition-colors uppercase cursor-pointer flex items-center justify-center gap-2">
           <Save className="w-3.5 h-3.5" /> Temporarily Save
         </button>
      </div>
    </div>
  );
};
