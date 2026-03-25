import { useSseAudit } from '../api/use-sse-audit';
import { useAppSelector } from '@/app/store/hooks';

/**
 * @widget GlobalSseSubscriber
 * (Why) 페이지 이동(basic-info -> verification-result -> customer-info) 중에도 
 * SSE 연결이 끊기지 않도록 앱 전체 레벨에서 백그라운드 구독을 유지하는 컴포넌트입니다.
 */
export const GlobalSseSubscriber = () => {
  const counselId = useAppSelector((state) => state.customer.data.counselId);
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);
  
  // (Why) basic-info에서 폼 저장 시 counselId가 발급되고 isPollingActive가 true로 변환될 때 구독을 시작합니다.
  useSseAudit(counselId, isPollingActive);

  return null;
};
