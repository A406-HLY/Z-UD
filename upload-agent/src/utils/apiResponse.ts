export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code: string;
    details: unknown;
  } | null;
}

export const ApiResponseWrapper = {
  /** 성공 응답 생성 */
  success: <T>(data: T, message: string = 'Success'): ApiResponse<T> => ({
    success: true,
    message,
    data,
    error: null,
  }),

  /** 에러 응답 생성 */
  error: (code: string, details: unknown, message: string = 'Error occurred'): ApiResponse<null> => ({
    success: false,
    message,
    data: null,
    error: {
      code,
      details,
    },
  }),
};
