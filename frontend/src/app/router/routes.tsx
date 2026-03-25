import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/login/ui/LoginPage';
import { LoanApplicationPage } from '@/pages/loan-application/ui/LoanApplicationPage';
import { VerificationResultPage } from '@/pages/verification-result/ui/VerificationResultPage';
import { ReviewReportPage } from '@/pages/review-report/ui/ReviewReportPage';
import { CustomerInfoPage } from '@/pages/customer-info/ui/CustomerInfoPage';
import { PdfViewerPage } from '@/pages/pdf-viewer/ui/PdfViewerPage';
import { MockPage } from '@/pages/mock/ui/MockPage';
import { BankSystemPage } from '@/pages/bank-system/ui/BankSystemPage';

/**
 * @app router
 * 애플리케이션의 전체 라우팅 구조를 정의하는 중앙 설정 파일입니다.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> }, // 로그인 화면
      { path: 'basic-info', element: <LoanApplicationPage /> }, // 대출 신청 정보 입력
      { path: 'verification-result', element: <VerificationResultPage /> }, // OCR 서류 검증 및 교정
      { path: 'viewer/:id', element: <PdfViewerPage /> }, // 실시간 연동 PDF 전문 뷰어
      { path: 'customer-info', element: <CustomerInfoPage /> }, // 고객 인적사항 및 정보 확인
      { path: 'review-report', element: <ReviewReportPage /> }, // 심사 결과 보고서 확인
      { path: 'bank-system', element: <BankSystemPage /> },
      { path: '*', element: <MockPage title="404 - NOT FOUND" step="Error" /> } // 404 에러 페이지
    ],
  },
]);
