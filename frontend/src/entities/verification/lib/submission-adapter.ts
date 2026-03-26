/**
 * [WHY: lodash와 같은 외부 라이브러리 의존성을 줄이기 위해 구현한 객체 경로 설정 함수입니다.]
 * @param obj - 값을 할당할 대상 객체
 * @param path - 점 표기법 경로 (예: "userInfo.detail.name")
 * @param value - 할당할 값
 */
const setByPath = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  let lastObj = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in lastObj) || lastObj[key] === null || typeof lastObj[key] !== 'object') {
      lastObj[key] = {};
    }
    lastObj = lastObj[key];
  }
  lastObj[keys[keys.length - 1]] = value;
};

/**
 * [WHY: 사용자의 수정 데이터(Flat Key)를 원본 데이터(Nested JSON)에 병합하여 최종 제출 규격을 생성합니다.]
 * 1. 원본 데이터의 불변성을 유지하기 위해 structuredClone을 사용하여 깊은 복사를 수행합니다.
 * 2. Redux에 저장된 점 표기법(Dot Notation) 경로를 해석하여 값을 주입합니다.
 */
export const prepareFinalPayload = <T extends object>(
  originalData: T,
  editedValues: Record<string, any>
): T => {
  // structuredClone은 Node.js 17+ 및 최신 브라우저에서 지원하는 표준 깊은 복사 API입니다.
  const result = structuredClone(originalData);

  Object.entries(editedValues).forEach(([path, value]) => {
    setByPath(result, path, value);
  });

  return result;
};
