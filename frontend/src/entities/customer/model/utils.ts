import { Customer } from './types';
import { REQUIRED_FIELDS } from './customer.constants';
import { isFieldComplete } from './validation';

/**
 * 고객 정보 입력 진척도를 계산합니다.
 * (Why) 여러 컴포넌트(폼, 상태바 등)에서 동일한 진척도 기준을 유지하기 위해 유틸리티로 분리합니다.
 */
export const calculateCustomerProgress = (data: Customer) => {
  const filledCount = REQUIRED_FIELDS.filter(field => isFieldComplete(field, data[field])).length;
  const percentage = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);
  
  return {
    filledCount,
    totalCount: REQUIRED_FIELDS.length,
    percentage,
    isComplete: percentage === 100,
    firstEmptyField: REQUIRED_FIELDS.find(field => !data[field])
  };
};
