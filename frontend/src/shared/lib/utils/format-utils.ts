/**
 * @shared lib/utils/format-utils
 * 데이터 포맷팅을 위한 범용 유틸리티 함수 모음입니다.
 * (Why) 여러 위젯에서 공통으로 사용되는 입력 데이터의 시각적 일관성을 유지하고 중복 로직을 제거하기 위해 추출되었습니다.
 */

/**
 * 주민등록번호 포맷팅 (9912091234567 -> 991209-1234567)
 * (Why) 사용자가 하이픈 없이 숫자만 입력해도 자동으로 규격에 맞춰 표시하여 입력 편의성을 높입니다.
 * @param value 숫자 문자열
 */
export const formatPersonalId = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6, 13)}`;
};

/**
 * 전화번호 포맷팅 (01012345678 -> 010-1234-5678)
 * (Why) 전화번호 입력 시 표준 규격(010-0000-0000)을 강제하여 데이터 정합성을 확보합니다.
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
 * (Why) 큰 금액 단위의 가독성을 높이기 위해 천 단위 콤마를 자동으로 삽입합니다.
 * @param value 숫자 또는 포맷팅된 문자열
 */
export const formatCurrency = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString();
};
