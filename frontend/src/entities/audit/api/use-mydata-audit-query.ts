import { useQuery } from '@tanstack/react-query';
import { getMyDataAuditResult } from './audit.api';
import { MyDataResDto } from '../model/types';

export const useMyDataAuditQuery = (customerName: string) => {
  return useQuery<MyDataResDto>({
    queryKey: ['audit', 'my-data', customerName],
    queryFn: () => getMyDataAuditResult({ customerName }),
    enabled: !!customerName,
    staleTime: 5 * 60 * 1000,
  });
};