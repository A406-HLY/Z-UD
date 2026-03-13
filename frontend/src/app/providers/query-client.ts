import { QueryClient } from '@tanstack/react-query';

/**
 * 전역 TanStack Query 클라이언트
 * 
 * - defaultOptions: API 특성과 프로젝트 성격에 맞춰 기본 staleTime 등을 설정합니다.
 * - 업무형 프로젝트 특성 상 데이터 변동에 민감하다면 refetchOnWindowFocus를 켜두되,
 *   네트워크 요청 최소화를 위해 staleTime을 약간 부여했습니다. (1분 예시)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 1, // 1분
      refetchOnWindowFocus: true,     // 화면 포커스 시 재요청 기본값
      retry: 1,                       // 실패 시 재시도 기본 1회
    },
    // mutations: { ... }
  },
});
