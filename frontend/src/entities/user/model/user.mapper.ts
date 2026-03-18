/**
 * @entity User
 * 유저 도메인 관련 데이터 변환을 담당하는 매퍼입니다.
 * 백엔드의 snake_case 응답을 프론트엔드의 camelCase 모델로 매핑합니다.
 */

import { LoginResponseData, User } from './user.types';

/**
 * 로그인 응답 데이터를 내부 유저 모델(User)로 변환합니다.
 * @param response 백엔드 로그인 API 응답 객체
 * @returns UI에서 사용하기 적합한 camelCase 유저 객체
 */
export const mapLoginResponseToUser = (response: LoginResponseData): User => {
  return {
    id: response.user_id,
    employeeNumber: response.employee_number,
    name: response.name,
    branchId: response.branch_id,
    branchName: response.branch_name,
    // (Why) 문자열 날짜는 UI 계산이나 포맷팅에 불편하므로 Date 객체로 미리 변환함
    sessionExpiry: new Date(response.session_expiry),
  };
};
