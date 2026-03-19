import { Check, Save, AlertCircle } from 'lucide-react';

interface Props {
  data: Record<string, string>;
}

/**
 * @widget ocr-field-editor
 * OCR로 추출된 데이터 필드를 편집하며 판정 결과에 따른 시각적 피드백을 제공합니다.
 * (Why: 에이전트의 오인식 가능성을 사용자에게 명확히 고지하여 휴먼 에러 방지)
 */
export const OcrFieldEditor = ({ data }: Props) => {
  return (
    <div className="flex-1 h-full border-r border-gray-300 flex flex-col bg-white overflow-hidden">
      {/* Header with Judgment Badge */}
      <div className="h-[32px] bg-gray-200 border-b border-gray-300 flex items-center px-4 justify-between shrink-0">
        <span className="text-[10px] font-bold text-[#444] uppercase tracking-wider">OCR Data Correction</span>
        <div className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-tighter animate-pulse shadow-sm">
           JUDGMENT: MISMATCH (ERROR)
        </div>
      </div>

      {/* Field List Section */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {Object.entries(data).map(([label, value]) => {
            // (Why: 특정 필드에서 에러가 발생했다는 시뮬레이션 로직)
            const isErrorField = label.includes('DATE') || label.includes('BIRTH');

            return (
              <div key={label} className="space-y-1.5 group">
                <label className={`text-[9px] font-bold uppercase tracking-tighter ${isErrorField ? 'text-red-600' : 'text-gray-500'}`}>
                  {label.replace('_', ' ')} {isErrorField && '(! ERR)'}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue={value}
                    className={`
                      w-full h-8 px-2 pr-8 text-[10px] font-mono border rounded-none shadow-inner focus:outline-none focus:border-[#004b93] transition-all
                      ${isErrorField ? 'border-red-400 bg-red-50 text-red-700 font-bold' : 'border-gray-300 bg-[#fcfcfc] focus:bg-white'}
                    `}
                  />
                  <div className="absolute right-2 top-2">
                    {isErrorField ? <AlertCircle className="w-3.5 h-3.5 text-red-500" /> : <Check className="w-3.5 h-3.5 text-green-500 opacity-0 group-focus-within:opacity-100 transition-opacity" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-[48px] bg-[#F0F2F5] border-t border-gray-300 flex items-center px-4 gap-2 shrink-0">
         <button className="flex-1 h-8 bg-[#004b93] text-white font-bold text-[10px] border border-black hover:bg-blue-800 transition-colors uppercase cursor-pointer flex items-center justify-center gap-2 group">
           <Check className="w-3.5 h-3.5" /> Approve Correction
         </button>
         <button className="flex-1 h-8 bg-[#4C566A] text-white font-bold text-[10px] border border-black hover:bg-gray-700 transition-colors uppercase cursor-pointer flex items-center justify-center gap-2">
           <Save className="w-3.5 h-3.5" /> Temporarily Save
         </button>
      </div>
    </div>
  );
};
