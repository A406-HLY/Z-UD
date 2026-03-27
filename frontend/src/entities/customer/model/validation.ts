import { Customer } from './types';

/**
 * 주민등록번호 형식이 올바른지 확인합니다. (14자리: 000000-0000000)
 */
export const isValidResidentRegistrationNumber = (id: string): boolean => {
  return id.length === 14;
};

/**
 * 휴대폰 번호 형식이 올바른지 확인합니다. (13자리: 010-0000-0000)
 * (Why) 연락처 정보로서 하이픈을 포함한 13자리 표준 규격을 충족해야 합니다.
 */
export const isValidPhoneNumber = (num: string): boolean => {
  return num.length === 13;
};

/**
 * 고객 정보 데이터의 유효성을 검증합니다.
 * (Why) 저장 시점에 필수 항목 누락 여부 및 데이터 규격의 정합성을 최종 판단하기 위함입니다.
 * (Layer) FSD Entity Layer: 특정 위젯에 종속되지 않는 데이터 자체의 비즈니스 규칙을 담당합니다.
 * 
 * @param data 검증할 고객 데이터 객체
 * @returns 각 필드별 에러 여부를 담은 객체 (true일 경우 에러)
 */
export const validateCustomer = (data: Customer): Partial<Record<keyof Customer, boolean>> => {
  const errors: Partial<Record<keyof Customer, boolean>> = {};

  const requiredFields: (keyof Customer)[] = [
    'name', 
    'residentRegistrationNumber', 
    'phoneNumber', 
    'loanPurpose', 
    'employmentType', 
    'targetLoanAmount', 
    'ownedHouseCount'
  ];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[field] = true;
    }
  });

  if (!errors.residentRegistrationNumber && data.residentRegistrationNumber && !isValidResidentRegistrationNumber(data.residentRegistrationNumber)) {
    errors.residentRegistrationNumber = true;
  }

  if (!errors.phoneNumber && data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = true;
  }

  return errors;
};

/**
 * 개별 필드가 '완성(Complete)' 상태인지 확인합니다.
 */
export const isFieldComplete = (field: keyof Customer, value: string): boolean => {
  if (!value || !value.trim()) return false;

  switch (field) {
    case 'name':
      return value.trim().length >= 2;
    case 'residentRegistrationNumber':
      return isValidResidentRegistrationNumber(value);
    case 'phoneNumber':
      return isValidPhoneNumber(value);
    case 'targetLoanAmount':
      return value.replace(/[^\d]/g, '') !== '0' && value.length > 0;
    default:
      return value.trim().length > 0;
  }
};
