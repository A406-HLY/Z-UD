import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { clsx } from 'clsx';

/**
 * @component PollingStatusToast
 * 서류 스캔 요청 시 잠시 나타나는 안내 팝업입니다.
 * (Why) '스캔본 요청하기' 버튼 클릭 시 사용자에게 다음 행동(서류 스캔)을 가이드합니다.
 * 3초 동안만 노출되었다가 자동으로 사라집니다.
 */
export const PollingStatusToast = () => {
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);
  const [visible, setVisible] = useState(false);

  // (Why) 폴링 상태가 true로 전송될 때마다 3초간 팝업을 띄웁니다.
  useEffect(() => {
    if (isPollingActive) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isPollingActive]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-9999 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className={clsx(
        "flex items-center justify-center px-8 py-3 bg-white border border-slate-200",
        "rounded-none min-w-[240px]"
      )}>
        <div className="flex flex-col items-center">
          <span className="text-[12px] font-bold text-slate-900 tracking-wider font-sans">서류를 스캔해 주세요.</span>
          <div className="mt-1.5 w-full h-px bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#004b93] animate-progress origin-left" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
