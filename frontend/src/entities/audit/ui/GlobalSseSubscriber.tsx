import { useSseAudit } from '../api/use-sse-audit';
import { useAppSelector } from '@/app/store/hooks';

export const GlobalSseSubscriber = () => {
  const consultationId = useAppSelector((state) => state.customer.data.consultationId);
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

  useSseAudit(consultationId, isPollingActive);

  return null;
};