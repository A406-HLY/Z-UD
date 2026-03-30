

export interface LoginResponseData {
  userInfoDto: {
    userId: number;
    employeeNumber: string;
    name: string;
  };
  branchInfoDto: {
    id: number;
    name?: string;
  };
  sessionExpiry: string;
}

export interface ReissueResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userInfoDto: {
    userId: number;
    employeeNumber: string;
    name: string;
  };
  branchInfoDto: {
    id: number;
    name?: string;
  };
  sessionExpiry: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
  rejected_value?: string | number | boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: {
    status: string;
    message: string;
    method: string;
    request_uri: string;
    errors: ApiFieldError[];
  } | null;
  timestamp: string;
}

export interface User {
  id: number;
  employeeNumber: string;
  name: string;
  branchId: number;
  branchName: string;
  accessToken: string;
  sessionExpiry: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}