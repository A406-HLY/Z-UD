/**
 * @shared lib/utils/format-utils
 * 데이터 포맷팅을 위한 범용 유틸리티 함수 모음입니다.
 */

/**
 * 주민등록번호 포맷팅 (9912091234567 -> 991209-1234567)
 * @param value 숫자 문자열
 */
export const formatPersonalId = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6, 13)}`;
};

/**
 * 전화번호 포맷팅 (01012345678 -> 010-1234-5678)
 * @param value 숫자 문자열
 */
export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

/**
 * 금액 포맷팅 (1234567 -> 1,234,567)
 * @param value 숫자 또는 포맷팅된 문자열
 */
export const formatCurrency = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString();
};
