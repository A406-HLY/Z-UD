

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Button, Input } from '@/shared/ui';
import { useLoginMutation } from '../api/use-login-mutation';
import { ApiResponse } from '../../../entities/user';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const [formData, setFormData] = useState({
    employeeNumber: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(formData, {
      onSuccess: (response) => {

        if (response.data.success) {
          navigate('/bank-system');
        }
      },
    });
  };

  const errorMessage = loginMutation.isError
    ? (loginMutation.error instanceof AxiosError
        ? (loginMutation.error.response?.data as ApiResponse<unknown>)?.error?.message
        : (loginMutation.error as Error)?.message) || '로그인 중 오류가 발생했습니다.'
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-sm">
      <div className="flex flex-col gap-4">
        <Input
          name="employeeNumber"
          placeholder="사번을 입력하세요 (예: EMP20230001)"
          value={formData.employeeNumber}
          onChange={handleChange}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      {errorMessage && (
        <div className="text-sm text-red-500 font-medium">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        isLoading={loginMutation.isPending}
        className="mt-2"
      >
        로그인
      </Button>

      <div className="flex items-center justify-between text-sm">
        <a href="#" className="text-blue-600 hover:underline">비밀번호 찾기</a>
        <a href="#" className="text-blue-600 hover:underline">시스템 가이드</a>
      </div>
    </form>
  );
};