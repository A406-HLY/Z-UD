/**
 * @entity review
 * @description API 데이터 포맷팅 및 예외 처리 유틸리티
 */

/**
 * 재귀적 데이터 파싱 유틸리티 함수
 * 동적 객체 형태의 value(`unknown`)를 UI에 표시할 수 있는 안전한 원시 타입(string | number)으로 변환합니다.
 */
export const formatValueForUI = (value: unknown): string | number => {
  // 1. Null 또는 Undefined 방어
  if (value === null || value === undefined) {
    return '정보 없음';
  }

  // 2. 배열인 경우 (재귀 호출)
  if (Array.isArray(value)) {
    return value.length > 0 
      ? value.map((item) => formatValueForUI(item)).join(', ')
      : '항목 없음';
  }

  // 3. 객체인 경우 (재귀 호출)
  if (typeof value === 'object') {
    const values = Object.values(value);
    return values.length > 0
      ? values.map((val) => formatValueForUI(val)).join(' / ')
      : '정보 없음';
  }

  // 4. 불리언 지정
  if (typeof value === 'boolean') {
    return value ? '예' : '아니오';
  }

  // 5. 일반 문자열, 숫자 반환
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  // 6. 최악의 경우 대비 안전망
  return String(value);
};
