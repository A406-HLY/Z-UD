import { apiClient } from '@/shared/api/client';
import { Customer } from '../model/types';
import { EMPLOYMENT_TYPE_MAP, LOAN_PURPOSE_MAP, EmploymentType, LoanPurposeOption } from '../model/customer.constants';
import { ApiResponse } from '@/entities/user';

/**
 * @entity customer/api
 * 고객 상담 정보를 서버에 등록하거나 관리하는 API입니다.
 */

/** 백엔드 규격에 맞춘 상담 등록 요청 DTO */
interface CreateConsultationRequest {
  consultationId?: string; // (Why) 백엔드 생성 방식인 경우 생략 가능
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

  // (Why) 프론트엔드 옵션을 백엔드 Enum(영문 대문자)으로 매핑합니다.
  return {
    consultationId: customer.counselId || undefined,
    name: customer.name,
    residentRegistrationNumber: customer.personalId,
    phoneNumber: customer.phoneNumber,
    employmentType: EMPLOYMENT_TYPE_MAP[customer.employmentType as EmploymentType] || 'EMPLOYEE',
    targetLoanAmount: amount,
    loanPurpose: LOAN_PURPOSE_MAP[customer.loanPurpose as LoanPurposeOption] || 'HOME_PURCHASE',
    ownedHouseCount: houseCount,
  };
};

/**
 * 상담 정보를 서버에 등록하고 백엔드에서 생성된 ID(UUID)를 받아옵니다.
 * (Why) 업로드 에이전트가 해당 ID로 파일을 전송하기 전에, 백엔드가 해당 상담 세션을 생성해야 합니다.
 */
export const createConsultation = async (customer: Customer): Promise<ApiResponse<{ id: string }>> => {
  // (Why) baseURL(/api/v1)과의 중복 방지를 위해 상대 경로를 사용합니다.
  const requestBody = mapToBackendRequest(customer);
  
  const response = await apiClient.post<ApiResponse<{ id: string }>>('/consultations', requestBody);
  return response.data;
};
