/**
 * 점 표기법(Dot Notation) 문자열 키를 파싱하여 객체의 깊은 경로에 값을 할당합니다.
 * @param obj 원본 객체 (함수 내부에서 깊은 복사 후 작업함)
 * @param editsValues { "path.to.key": value } 형태의 수정 내역 객체
 * @returns 수정사항이 반영된 새로운 객체
 */
export const mergeDotNotation = <T extends Record<string, any>>(
  obj: T,
  editsValues: Record<string, any>
): T => {
  // 원본 객체 오염 방지를 위한 깊은 복사 (JSON 방식이 성능상 무난하며 순수 객체에 적합)
  const result = JSON.parse(JSON.stringify(obj)) as T;

  Object.entries(editsValues).forEach(([path, value]) => {
    const keys = path.split('.');
    let current: any = result;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      
      // 마지막 키인 경우 값 할당
      if (i === keys.length - 1) {
        current[key] = value;
      } else {
        // 경로 중간에 객체가 없으면 생성 (필요시)
        if (current[key] === undefined || current[key] === null) {
          // 배열 인덱스 형태(예: [0])는 현재 프로젝트의 edits 구조상 문자열 키로 들어오므로 객체로 생성
          current[key] = {};
        }
        current = current[key];
      }
    }
  });

  return result;
};
