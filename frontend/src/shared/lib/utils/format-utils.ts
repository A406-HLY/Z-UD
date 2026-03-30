

export const formatPersonalId = (value: string, prevValue?: string): string => {
  const digits = value.replace(/[^\d]/g, '');

  if (prevValue && value.length < prevValue.length) {
    if (digits.length === 6) return digits;
  }

  if (digits.length < 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6, 13)}`;
};

export const formatPhoneNumber = (value: string, prevValue?: string): string => {
  const digits = value.replace(/[^\d]/g, '');

  if (prevValue && value.length < prevValue.length) {
    if (digits.length === 3 || digits.length === 7) return digits;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

export const formatCurrency = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString();
};

export const formatName = (value: string): string => {
  return value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
};