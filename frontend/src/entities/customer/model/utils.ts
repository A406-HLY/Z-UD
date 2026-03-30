import { Customer } from './types';
import { REQUIRED_FIELDS } from './customer.constants';
import { isFieldComplete } from './validation';

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