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
    id: response.userInfoDto.userId,
    employeeNumber: response.userInfoDto.employeeNumber,
    name: response.userInfoDto.name,
    branchId: response.branchInfoDto.id,
    branchName: response.branchInfoDto.name,
    // (Why) Redux 직렬화 규칙 준수를 위해 Date 객체 대신 문자열 그대로 유지함
    sessionExpiry: response.sessionExpiry,
  };
};
