import React from 'react';
import { LoginForm } from '../../../features/auth/ui/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">로그인</h1>
          <p className="mt-2 text-slate-500">서비스 이용을 위해 로그인해주세요.</p>
        </div>
        <div className="flex justify-center">
          <LoginForm />
        </div>
        <div className="text-center pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            도움이 필요하신가요? 
            <a href="mailto:support@example.com" className="ml-1 text-blue-600 hover:underline">고객센터 문의</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
