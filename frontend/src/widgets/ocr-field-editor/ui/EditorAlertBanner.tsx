import { Info } from 'lucide-react';

interface EditorAlertBannerProps {
  isReviewNeeded: boolean;
  isRisk?: boolean;
}

export const EditorAlertBanner = ({
  isReviewNeeded,
  isRisk
}: EditorAlertBannerProps) => {
  if (!isReviewNeeded && !isRisk) return null;

  const config = isReviewNeeded
    ? {
        bg: 'bg-red-100 border-red-200',
        textColor: 'text-red-700',
        titleColor: 'text-red-800',
        title: '알림: 데이터 정합성 확인이 필요한 문서입니다.',
        desc: '일부 필드에서 원본 데이터와 불일치가 감지되었습니다. 추출된 데이터와 실물 이미지를 대조하여 수정해 주세요.'
      }
    : {
        bg: 'bg-yellow-100 border-yellow-200',
        textColor: 'text-yellow-700',
        titleColor: 'text-yellow-800',
        title: '주의: 세밀한 검토가 필요한 위험 문서입니다.',
        desc: '해당 문서는 백엔드 시스템에서 위험 요소가 탐지되었습니다. 추출된 데이터와 실물 이미지를 대조하여 최종 승인해 주시기 바랍니다.'
      };

  return (
    <div className={`border-b px-4 py-2 flex items-start gap-3 transition-colors duration-300 ${config.bg}`}>
      <Info className={`w-4 h-4 mt-0.5 shrink-0 ${config.textColor}`} />
      <div className="space-y-0.5">
        <p className={`text-[11px] font-bold ${config.titleColor}`}>
          {config.title}
        </p>
        <p className={`text-[10px] leading-tight ${config.textColor}`}>
          {config.desc}
        </p>
      </div>
    </div>
  );
};