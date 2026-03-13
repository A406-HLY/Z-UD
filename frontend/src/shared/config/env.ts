/**
 * 환경 변수 매핑 및 검증 유틸리티
 * 
 * - 컴포넌트나 로직 전체에서 직접 import.meta.env를 쓰지 않도록 해주는 인터페이스입니다.
 * - 기본값 설정이나 형변환(Number, Boolean 등)을 담당합니다.
 */
export const env = {
  /**
   * 백엔드 API 기본 주소
   * - 기본값: 루트 (프록시 등을 사용하는 경우)
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  
  /**
   * 앱 실행 환경
   * - 'development' | 'production' | 'test' 등
   */
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  /**
   * MSW 등 모킹 허용 여부
   * - 'true' 문자열인 경우에만 활성화
   */
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
};
