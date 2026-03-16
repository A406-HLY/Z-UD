import { createBrowserRouter } from 'react-router-dom';

/**
 * 프로젝트 전체 라우팅 설정
 * 
 * - Lazy Loading 등 필요한 경우 `React.lazy` 등을 붙여서 확장할 수 있습니다.
 * - pages 하위의 조립 컴포넌트들을 요소로 배치합니다.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    // element: <AppLayout />, // widgets/layout/... 나중에 추가
    children: [
      {
        index: true,
        element: <div>홈 화면 (리다이렉트 혹은 대시보드)</div>,
      },
      {
        path: 'basic-info', // 기초정보 입력
        element: <div>기초 정보 입력 화면</div>,
      },
      {
        path: 'upload', // 서류 업로드
        element: <div>서류 업로드 화면</div>,
      },
      {
        path: 'review-report', // 심사 레포트
        element: <div>심사 레포트 상세 화면</div>,
      },
      {
        path: '*',
        element: <div>페이지를 찾을 수 없습니다. (404)</div>,
      },
    ],
  },
]);
