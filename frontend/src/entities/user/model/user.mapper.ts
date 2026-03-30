/**
 * @entity User
 * 유저 도메인 관련 데이터 변환을 담당하는 매퍼입니다.
 * 백엔드의 snake_case 응답을 프론트엔드의 camelCase 모델로 매핑합니다.
 */

import { LoginResponseData, User } from './user.types';

/**
 * 백엔드 응답 데이터를 프론트엔드 유저 모델로 변환합니다.
 * @param response 로그인 성공 응답 데이터
 * @param accessToken 헤더에서 추출한 토큰
 */
export const mapLoginResponseToUser = (response: LoginResponseData, accessToken: string): User => {
  return {
    id: response.userInfoDto.userId,
    employeeNumber: response.userInfoDto.employeeNumber,
    name: response.userInfoDto.name,
    branchId: response.branchInfoDto.id,
    branchName: response.branchInfoDto.name || '알 수 없는 지점',
    accessToken,
    sessionExpiry: response.sessionExpiry,
  };
};
