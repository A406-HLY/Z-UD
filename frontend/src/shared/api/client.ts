import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { ApiResponse, ReissueResponseData } from '../../entities/user';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiStatusError {
  status: string;
  message: string;
}

let pendingReissue: Promise<AxiosResponse<ApiResponse<ReissueResponseData>>> | null = null;

export const safeReissue = async (): Promise<AxiosResponse<ApiResponse<ReissueResponseData>>> => {
  if (pendingReissue) {
    return pendingReissue;
  }

  pendingReissue = apiClient.post<ApiResponse<ReissueResponseData>>('/auth/reissue').finally(() => {
    pendingReissue = null;
  });

  return pendingReissue;
};

let getAccessToken: () => string | undefined = () => undefined;
let onTokenUpdate: (token: string) => void = () => {};
let onTokenReissue: () => Promise<string | undefined> = async () => undefined;
let onLogout: () => void = () => {};

export const setupAxiosInterceptors = (config: {
  getAccessToken: () => string | undefined;
  onTokenUpdate: (token: string) => void;
  onTokenReissue: () => Promise<string | undefined>;
  onLogout: () => void;
}) => {
  getAccessToken = config.getAccessToken;
  onTokenUpdate = config.onTokenUpdate;
  onTokenReissue = config.onTokenReissue;
  onLogout = config.onLogout;

  apiClient.interceptors.request.use(
    (axiosConfig: InternalAxiosRequestConfig) => {
      const token = getAccessToken();

      if (token && axiosConfig.headers) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }
      return axiosConfig;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      const authHeader = response.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        onTokenUpdate(token);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const responseData = error.response?.data as ApiResponse<unknown>;
      const errorCode = (responseData?.error as unknown as ApiStatusError)?.status;

      const isReissueRequest = originalRequest?.url?.includes('/auth/reissue');
      if (
        error.response?.status === 401 &&
        (errorCode === 'AU-001' || errorCode === 'AU-003') &&
        originalRequest &&
        !originalRequest._retry &&
        !isReissueRequest
      ) {
        originalRequest._retry = true;

        try {
          const newToken = await onTokenReissue();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (reissueError) {

          onLogout();

          window.location.href = '/login';
          return Promise.reject(reissueError);
        }
      }

      if (error.response) {
        switch (error.response.status) {
          case 401:

            break;
          case 403:

            break;
          case 500:

            break;
          default:

        }
      } else {

      }

      return Promise.reject(error);
    }
  );
};