/**
 * @shared lib/utils/id-utils
 * 시스템 내에서 사용되는 고유 식별자 생성을 담당하는 유틸리티입니다.
 */

/**
 * 전역 고유 식별자(UUID v4)를 생성합니다.
 * (Why) 상담 ID 등 중복되지 않아야 하는 고유 식별자를 표준화된 방식으로 생성하기 위해 브라우저 표준 crypto API를 사용합니다.
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};
