import { apiClient } from '../../../shared/api/client';
import { ApiResponse, LoginResponseData } from '../../../entities/user';

export interface LoginRequest {
  employeeNumber: string;
  password: string;
}

export const login = async (data: LoginRequest) => {
  return await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', data);
};

export const reissueToken = async () => {
  return await apiClient.post<ApiResponse<LoginResponseData>>('/auth/reissue');
};

export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
  return response.data;
};