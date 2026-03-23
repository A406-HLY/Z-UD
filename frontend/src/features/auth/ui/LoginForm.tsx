/**
 * @feature Auth/LoginForm
 * 행원 세션 로그인을 위한 폼 컴포넌트입니다.
 * 사번과 비밀번호를 입력받아 useLoginMutation을 통해 인증을 수행합니다.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Button, Input } from '@/shared/ui';
import { useLoginMutation } from '../api/use-login-mutation';
import { ApiResponse } from '../../../entities/user';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  
  // (Note) 폼 데이터는 컴포넌트 내부에서만 사용되므로 Local State로 관리함
  const [formData, setFormData] = useState({
    employeeNumber: '',
    password: '',
  });

  /** 입력 필드 변경 핸들러 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** 로그인 제출 핸들러 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    loginMutation.mutate(formData, {
      onSuccess: (response) => {
        if (response.success) {
          // (Note) 로그인 성공 후 실제 업무 화면(기초 정보 입력)으로 리다이렉트함
          navigate('/basic-info');
        }
      },
    });
  };

  // (Note) AxiosError 여부에 따라 서버에서 내려준 상세 메시지 혹은 기본 에러 메시지를 노출함
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
