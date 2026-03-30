import { apiClient } from '@/shared/api/client';
import { Customer } from '../model/types';
import { EMPLOYMENT_TYPE_MAP, LOAN_PURPOSE_MAP, EmploymentType, LoanPurposeOption } from '../model/customer.constants';
import { ApiResponse } from '@/entities/user';

interface CreateConsultationRequest {
  consultationId?: string;
  name: string;
  residentRegistrationNumber: string;
  phoneNumber: string;
  employmentType: string;
  targetLoanAmount: number;
  loanPurpose: string;
  ownedHouseCount: number;
}

const mapToBackendRequest = (customer: Customer): CreateConsultationRequest => {

  const amount = parseInt(customer.targetLoanAmount.replace(/,/g, ''), 10) || 0;
  const houseCount = parseInt(customer.ownedHouseCount, 10) || 0;

  return {
    consultationId: customer.consultationId,
    name: customer.name,
    residentRegistrationNumber: customer.residentRegistrationNumber,
    phoneNumber: customer.phoneNumber,
    employmentType: EMPLOYMENT_TYPE_MAP[customer.employmentType as EmploymentType] || 'EMPLOYEE',
    targetLoanAmount: amount,
    loanPurpose: LOAN_PURPOSE_MAP[customer.loanPurpose as LoanPurposeOption] || 'HOME_PURCHASE',
    ownedHouseCount: houseCount,
  };
};

export const createConsultation = async (customer: Customer): Promise<ApiResponse<{ id: string }>> => {

  const requestBody = mapToBackendRequest(customer);

  const response = await apiClient.post<ApiResponse<{ id: string }>>('/consultations', requestBody);
  return response.data;
};

export const transferConsultationToLegacy = async (
  consultationId: string,
  payload: any
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(
    `/consultations/${consultationId}/transfer`,
    payload
  );
  return response.data;
};