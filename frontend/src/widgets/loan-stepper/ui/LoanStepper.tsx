import { clsx } from 'clsx';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';

/**
 * @widget LoanStepper
 * 대출 신청의 전체 프로세스(고객정보 -> OCR검토 -> 기초정보 -> 심사레포트)를 
 * 시각적으로 표현하는 화살표형 단계 표시기(Chevron Stepper)입니다.
 * (Why) 페이지별 진행 상태를 일관되게 보여주고, 특정 단계의 분석 중 상태를 전역적으로 노출합니다.
 */
export const LoanStepper = () => {
  const location = useLocation();
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

  // (Point: 라우트 경로와 표시 레이블 매핑)
  const STEPS_CONFIG = [
    { id: 1, label: '01 고객정보/서류', path: '/basic-info' },
    { id: 2, label: '02 문서OCR검토', path: '/verification-result' },
    { id: 3, label: '03 기초정보입력', path: '/customer-info' },
    { id: 4, label: '04 심사레포트', path: '/review-report' },
  ];

  // 현재 경로의 인덱스 확인 (매칭되지 않으면 -1)
  const currentStepIdx = STEPS_CONFIG.findIndex(s => s.path === location.pathname);
  // (Why: 초기 진입 시나 매칭 경로가 없을 때의 방어 로직)
  const activeIdx = currentStepIdx === -1 ? 0 : currentStepIdx;

  return (
    <div className="flex w-full h-7 bg-white shadow-sm border border-slate-200 overflow-hidden">
      {STEPS_CONFIG.map((step, idx) => {
        const isActive = idx === activeIdx;
        const isComplete = idx < activeIdx;

        return (
          <div
            key={step.id}
            className={clsx(
              "flex-1 flex items-center justify-center relative text-[9px] font-black tracking-tight transition-all duration-300",
              isActive ? "bg-[#004b93] text-white" : isComplete ? "bg-blue-50 text-[#004b93]" : "bg-slate-100 text-slate-400"
            )}
            style={{
              clipPath: idx === 0 
                ? 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
                : idx === STEPS_CONFIG.length - 1
                ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)'
                : 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)',
              marginLeft: idx > 0 ? '-7px' : '0',
              zIndex: STEPS_CONFIG.length - idx,
            }}
          >
            <div className="relative z-10 pl-2 flex items-center gap-1.5">
              <span>{step.label}</span>
              {/* (Why: 기초정보입력 단계에서 OCR 백그라운드 분석 중일 때 시각적 피드백 제공) */}
              {step.path === '/customer-info' && isPollingActive && (
                <div className={clsx(
                  "w-1 h-1 bg-white animate-pulse",
                  isActive ? "bg-white" : "bg-[#004b93]"
                )} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
