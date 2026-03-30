import { apiClient } from '@/shared/api/client';
import {
  HouseAuditRequestDto,
  HouseAuditResponseDto,
  MyDataReqDto,
  MyDataResDto
} from '../model/types';

export const getHouseAuditResult = async (params: HouseAuditRequestDto): Promise<HouseAuditResponseDto> => {
  const response = await apiClient.post<HouseAuditResponseDto>('/audits/house', params);
  return response.data;
};

export const getMyDataAuditResult = async (params: MyDataReqDto): Promise<MyDataResDto> => {

  const response = await apiClient.post<{ data: MyDataResDto }>('/audits/my-data', params);
  return response.data.data;
};