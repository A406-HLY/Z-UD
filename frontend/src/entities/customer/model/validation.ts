import { Customer } from './types';

/**
 * 주민등록번호 형식이 올바른지 확인합니다. (14자리: 000000-0000000)
 * (Why) 금융 거래의 식별자로서 정확한 14자리 문자열 규격을 충족해야 합니다.
 */
export const isValidPersonalId = (id: string): boolean => {
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

  // (Why) 1단계: 필수적으로 요구되는 항목의 존재 여부를 체크합니다.
  const requiredFields: (keyof Customer)[] = [
    'name', 
    'personalId', 
    'phoneNumber', 
    'loanPurpose', 
    'employmentType', 
    'desiredAmount', 
    'houseCount'
  ];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[field] = true;
    }
  });

  // (Why) 2단계: 값이 존재하더라도 금융 비즈니스 규격(길이 등)에 맞는지 심화 검층을 수행합니다.
  // 이미 에러가 발생한 필드는 추가 검사를 생략하여 불필요한 연산을 줄입니다.
  
  if (!errors.personalId && data.personalId && !isValidPersonalId(data.personalId)) {
    errors.personalId = true;
  }

  if (!errors.phoneNumber && data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = true;
  }

  return errors;
};

/**
 * 개별 필드가 '완성(Complete)' 상태인지 확인합니다.
 * (Why) 단순히 값이 있는지를 넘어, 진행률에 반영될 수 있는 최소한의 품질을 충족했는지 판단합니다.
 * 
 * @param field 필드 이름
 * @param value 필드 값
 */
export const isFieldComplete = (field: keyof Customer, value: string): boolean => {
  if (!value || !value.trim()) return false;

  switch (field) {
    case 'name':
      return value.trim().length >= 2;
    case 'personalId':
      return isValidPersonalId(value);
    case 'phoneNumber':
      return isValidPhoneNumber(value);
    case 'desiredAmount':
      return value.replace(/[^\d]/g, '') !== '0' && value.length > 0;
    default:
      return value.trim().length > 0;
  }
};
