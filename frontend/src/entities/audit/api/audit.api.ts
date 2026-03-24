import { apiClient } from '@/shared/api/client';
import { HouseAuditRequestDto, HouseAuditResponseDto } from '../model/types';

/**
 * @entity Audit API
 * 건물 심사 관련 백엔드 API 연동 함수입니다.
 */

/**
 * 건축물 심사 결과 조회 API를 호출합니다.
 * (Why) 건축물 형태, 위치, 위반 여부를 종합 심사하기 위해 POST 요청을 전송합니다.
 */
export const getHouseAuditResult = async (params: HouseAuditRequestDto): Promise<HouseAuditResponseDto> => {
  const response = await apiClient.post<HouseAuditResponseDto>('/audits/house', params);
  return response.data;
};
