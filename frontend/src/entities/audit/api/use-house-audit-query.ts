import { useQuery } from '@tanstack/react-query';
import { getHouseAuditResult } from './audit.api';
import { HouseAuditRequestDto } from '../model/types';

/**
 * @entity Audit Query
 * 주택 심사 결과를 조회하기 위한 TanStack Query 훅입니다.
 */
export const useHouseAuditQuery = (params: HouseAuditRequestDto) => {
  return useQuery({
    queryKey: ['audit', 'house', params],
    queryFn: () => getHouseAuditResult(params),
    enabled: !!params.propertyAddress, // 주소가 있을 때만 실행
    staleTime: 5 * 60 * 1000,
  });
};
