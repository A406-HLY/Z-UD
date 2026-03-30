

import { LoginResponseData, User } from './user.types';

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