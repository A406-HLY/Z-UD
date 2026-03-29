import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface LegacyAlertModalProps {
  isOpen: boolean;
  message: string;
  type?: 'SUCCESS' | 'ERROR' | 'INFO';
  onClose: () => void;
  title?: string;
}

/**
 * @shared LegacyAlertModal
 * Windows XP 스타일의 레거시 시스템 알림 팝업입니다.
 */
export const LegacyAlertModal = ({ 
  isOpen, 
  message, 
  type = 'INFO', 
  onClose,
  title
}: LegacyAlertModalProps) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="text-[#004b93]" size={32} />;
      case 'ERROR': return <AlertCircle className="text-[#e94b1a]" size={32} />;
      default: return <Info className="text-[#0055e5]" size={32} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'SUCCESS': return '전산 이관 완료';
      case 'ERROR': return '시스템 오류';
      default: return '시스템 알림';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      {/* Windows XP Window Frame */}
      <div className="w-[380px] bg-[#ece9d8] border border-[#003366] shadow-[2px_2px_15px_rgba(0,0,0,0.6)] flex flex-col font-sans select-none animate-in zoom-in-95 duration-150">
        
        {/* Title Bar */}
        <div className="h-6 bg-linear-to-r from-[#0055e5] via-[#0a6cff] to-[#0055e5] flex items-center justify-between px-1.5 py-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-white text-[11px] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
              {title || getDefaultTitle()}
            </span>
          </div>
          <div className="flex gap-0.5">
            <button 
              onClick={onClose}
              className="w-[18px] h-[18px] bg-[#e94b1a] border border-white/30 rounded-[2px] flex items-center justify-center shadow-inner text-white font-bold text-[10px] hover:bg-[#ff5b2a] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4">
          <div className="bg-white border border-[#7f9db9] p-5 flex items-start gap-4 shadow-[inset_0_0_1px_rgba(0,0,0,0.1)]">
            <div className="shrink-0 pt-0.5">
              {getIcon()}
            </div>
            <div className="text-[12px] font-medium text-[#333] leading-relaxed whitespace-pre-wrap break-all pt-1 flex-1">
              {message}
            </div>
          </div>
        </div>

        {/* Button Area */}
        <div className="px-4 pb-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-1 bg-[#ece9d8] border-t border-l border-white border-b-2 border-r-2 border-slate-600 active:border-t-2 active:border-l-2 active:border-white/0 active:bg-[#dcd9c8] text-[11px] font-bold text-[#333] transition-all focus:outline-none min-w-[90px] shadow-sm"
          >
            확인
          </button>
        </div>

        {/* Bottom Status Bar (Optional visual touch) */}
        <div className="h-1 bg-[#ece9d8] border-t border-white/40"></div>
      </div>
    </div>
  );
};
