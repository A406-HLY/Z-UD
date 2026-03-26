import { apiClient } from '@/shared/api/client';
import { 
  HouseAuditRequestDto, 
  HouseAuditResponseDto,
  MyDataReqDto,
  MyDataResDto
} from '../model/types';

/**
 * @entity Audit API
 * 심사 관련 백엔드 API 연동 함수입니다.
 */

/**
 * 건축물 심사 결과 조회 API를 호출합니다.
 * (Why) 건축물 형태, 위치, 위반 여부를 종합 심사하기 위해 POST 요청을 전송합니다.
 */
export const getHouseAuditResult = async (params: HouseAuditRequestDto): Promise<HouseAuditResponseDto> => {
  const response = await apiClient.post<HouseAuditResponseDto>('/audits/house', params);
  return response.data;
};

/**
 * 마이데이터 조회 API (신용등급 + 기대출 통합)
 * (Why) 고객명을 기준으로 내부 DB 조회 및 외부 마이데이터 API 연동을 통해 금융 정보를 가져옵니다.
 */
export const getMyDataAuditResult = async (params: MyDataReqDto): Promise<MyDataResDto> => {
  // (Why) 백엔드의 응답 구조 { success: boolean, data: MyDataResDto } 를 준수합니다.
  const response = await apiClient.post<{ data: MyDataResDto }>('/audits/my-data', params);
  return response.data.data;
};
