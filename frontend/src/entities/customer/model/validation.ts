import { Customer } from './types';

export const isValidResidentRegistrationNumber = (id: string): boolean => {
  return id.length === 14;
};

export const isValidPhoneNumber = (num: string): boolean => {
  return num.length === 13;
};

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