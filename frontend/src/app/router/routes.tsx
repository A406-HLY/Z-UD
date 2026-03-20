import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/login/ui/LoginPage';
import { LoanApplicationPage } from '@/pages/loan-application/ui/LoanApplicationPage';

/**
 * 프로젝트 전체 라우팅 설정
 * 
 * - Lazy Loading 등 필요한 경우 `React.lazy` 등을 붙여서 확장할 수 있습니다.
 * - pages 하위의 조립 컴포넌트들을 요소로 배치합니다.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        // TODO: 로그인 여부에 따라 /login 또는 /basic-info로 리다이렉트하는 Guard 컴포넌트 추가 필요
        element: <LoginPage />, 
      },
      {
        path: 'login', // 로그인 페이지
        element: <LoginPage />,
      },
      {
        path: 'basic-info', // 기초 정보 입력 화면
        element: <LoanApplicationPage />,
      },
      {
        path: 'verification-result', // 서류 검증 결과 (다른 팀원 작업 영역)
        element: (
          <div className="p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">서류 검증 결과</h1>
            <p className="text-gray-600">서류 전송이 완료되었습니다. 결과 분석 중입니다...</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
            >
              상신 완료 (임시)
            </button>
          </div>
        ),
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
