import { useQuery } from '@tanstack/react-query';
import { getMyDataAuditResult } from './audit.api';
import { MyDataResDto } from '../model/types';

/**
 * @entity Audit Query
 * 마이데이터(신용등급+기대출) 조회를 위한 TanStack Query 훅입니다.
 * (Why) 고객명을 기반으로 신용 등 정보 조회를 위해 TanStack Query의 선언적 관리 기법을 사용합니다.
 */
export const useMyDataAuditQuery = (customerName: string) => {
  return useQuery<MyDataResDto>({
    queryKey: ['audit', 'my-data', customerName],
    queryFn: () => getMyDataAuditResult({ customerName }),
    enabled: !!customerName, // (Why) 고객명이 입력되었을 때만 자동으로 조회를 실행합니다.
    staleTime: 5 * 60 * 1000,
  });
};
