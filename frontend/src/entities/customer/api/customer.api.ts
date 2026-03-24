import { apiClient } from '@/shared/api/client';
import { Customer } from '../model/types';
import { ApiResponse } from '@/entities/user';

/**
 * @entity customer/api
 * 고객 상담 정보를 서버에 등록하거나 관리하는 API입니다.
 */

/** 백엔드 규격에 맞춘 상담 등록 요청 DTO */
interface CreateConsultationRequest {
  consultationId: string;
  name: string;
  residentRegistrationNumber: string;
  phoneNumber: string;
  employmentType: string;
  targetLoanAmount: number;
  loanPurpose: string;
  ownedHouseCount: number;
}

/**
 * 프론트엔드 데이터를 백엔드 Enum 및 타입 규격으로 변환합니다.
 */
const mapToBackendRequest = (customer: Customer): CreateConsultationRequest => {
  // (Why) 금액 문자열에서 콤마(,)를 제거하고 숫자로 변환합니다.
  const amount = parseInt(customer.desiredAmount.replace(/,/g, ''), 10) || 0;
  const houseCount = parseInt(customer.houseCount, 10) || 0;

  // (Why) 프론트엔드 한글 옵션을 백엔드 Enum(영문 대문자)으로 매핑합니다.
  const employmentMap: Record<string, string> = {
    '직장인': 'EMPLOYEE',
    '자영업자': 'SELF_EMPLOYED',
    '프리랜서': 'FREELANCER',
  };

  const purposeMap: Record<string, string> = {
    '주택구입목적': 'HOME_PURCHASE',
    '생활안정자금목적': 'LIVING_STABILITY',
  };

  return {
    consultationId: customer.counselId,
    name: customer.name,
    residentRegistrationNumber: customer.personalId,
    phoneNumber: customer.phoneNumber,
    employmentType: employmentMap[customer.employmentType] || 'EMPLOYEE',
    targetLoanAmount: amount,
    loanPurpose: purposeMap[customer.loanPurpose] || 'HOME_PURCHASE',
    ownedHouseCount: houseCount,
  };
};

/**
 * 프론트엔드에서 생성한 상담 ID(UUID)를 백엔드 서버에 등록합니다.
 * (Why) 업로드 에이전트가 해당 ID로 파일을 전송하기 전에, 백엔드가 해당 상담 세션을 인지하고 있어야 404 에러를 방지할 수 있습니다.
 */
export const createConsultation = async (customer: Customer): Promise<ApiResponse<null>> => {
  // (Why) baseURL(/api/v1)과의 중복 방지를 위해 상대 경로를 사용합니다.
  // 명세서 규격으로 데이터를 변환하여 전송합니다.
  const requestBody = mapToBackendRequest(customer);
  
  const response = await apiClient.post<ApiResponse<null>>('/consultations', requestBody);
  return response.data;
};
