import { useQuery } from '@tanstack/react-query';
import { getHouseAuditResult } from './audit.api';
import { HouseAuditRequestDto } from '../model/types';

export const useHouseAuditQuery = (params: HouseAuditRequestDto) => {
  return useQuery({
    queryKey: ['audit', 'house', params],
    queryFn: () => getHouseAuditResult(params),
    enabled: !!params.propertyAddress,
    staleTime: 5 * 60 * 1000,
  });
};