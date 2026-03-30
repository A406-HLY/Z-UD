
export interface Customer {
  name: string;
  residentRegistrationNumber: string;
  phoneNumber: string;
  loanPurpose: string;
  employmentType: string;
  targetLoanAmount: string;
  ownedHouseCount: string;
  consultationId: string;
}

export const INITIAL_CUSTOMER_STATE: Customer = {
  name: '김민수',
  residentRegistrationNumber: '900101-1234567',
  phoneNumber: '010-1234-5678',
  loanPurpose: '주택구입목적',
  employmentType: '직장인',
  targetLoanAmount: '100000000',
  ownedHouseCount: '0',
  consultationId: '',
};