import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/login/ui/LoginPage';
import { LoanApplicationPage } from '@/pages/loan-application/ui/LoanApplicationPage';
import { VerificationResultPage } from '@/pages/verification-result/ui/VerificationResultPage';
import { ReviewReportPage } from '@/pages/review-report/ui/ReviewReportPage';
import { CustomerInfoPage } from '@/pages/customer-info/ui/CustomerInfoPage';
import { PdfViewerPage } from '@/pages/pdf-viewer/ui/PdfViewerPage';
import { NotFoundPage } from '@/pages/not-found/ui/NotFoundPage';
import { BankSystemPage } from '@/pages/bank-system/ui/BankSystemPage';
import { AuthInitializer } from '@/features/auth/ui/AuthInitializer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthInitializer />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'basic-info', element: <LoanApplicationPage /> },
      { path: 'verification-result', element: <VerificationResultPage /> },
      { path: 'viewer/:id', element: <PdfViewerPage /> },
      { path: 'customer-info', element: <CustomerInfoPage /> },
      { path: 'review-report', element: <ReviewReportPage /> },
      { path: 'bank-system', element: <BankSystemPage /> },
      { path: '*', element: <NotFoundPage title="404 - NOT FOUND" step="Error" /> }
    ],
  },
]);