import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/login/ui/LoginPage';
import { LoanApplicationPage } from '@/pages/loan-application/ui/LoanApplicationPage';
import { VerificationResultPage } from '@/pages/verification-result/ui/VerificationResultPage';
import { ReviewReportPage } from '@/pages/review-report/ui/ReviewReportPage';
import { CustomerInfoPage } from '@/pages/customer-info/ui/CustomerInfoPage';
import { MockPage } from '@/pages/mock/ui/MockPage';

/**
 * @app router
 */
export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'basic-info', element: <LoanApplicationPage /> },
      { path: 'verification-result', element: <VerificationResultPage /> },
      { path: 'customer-info', element: <CustomerInfoPage /> },
      { path: 'review-report', element: <ReviewReportPage /> },
      { path: '*', element: <MockPage title="404 - NOT FOUND" step="Error" /> }
    ],
  },
]);
