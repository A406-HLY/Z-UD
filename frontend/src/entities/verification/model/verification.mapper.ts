import { 
  VerificationServerResponse, 
  VerificationResult, 
  DocCategory, 
  DocumentStatus,
  ExtractedField,
  DocItem
} from './types';

const ARRAY_INDEX_REGEX = /\[\d+\]/g;

export const DOCUMENT_GROUP_LABELS: Record<string, string> = {
  IDENTITY_FAMILY: '본인 및 가족관계',
  INCOME_EMPLOYEE: '소득 및 재직증빙',
  TAX: '세금 납부 증빙',
};

/** 
 * 재귀적 평면화 함수 (Tree -> 1D Array)
 * 
 * [왜 평탄화(Flatten) 하나요?]
 * 백엔드 OCR 데이터는 { "주소": { "도시": "서울" } } 처럼 깊이를 알 수 없는 중첩 트리입니다.
 * 이를 React UI가 반복문 한 줄로 가볍게 렌더링하고, 사용자 입력 시 상태(State) 업데이트 성능을 O(1) 수준으로
 * 최적화하기 위해, 1차원 리스트 형태 [{ id: "주소_도시", value: "서울" }] 로 길게 풀어해칩니다.
 */
const flattenContent = (content: unknown, prefix = '', labelPrefix = ''): ExtractedField[] => {
  const fields: ExtractedField[] = [];
  if (!content || typeof content !== 'object') return fields;

  const obj = content as Record<string, any>; // 동적 키 순회를 위해 타입 단언 유지
  for (const key in obj) {
    const item = obj[key];
    const fieldKey = prefix ? `${prefix}_${key}` : key;
    const displayLabel = labelPrefix ? `${labelPrefix} > ${key}` : key;

    if (item && typeof item === 'object' && 'value' in item) {
      fields.push({
        id: fieldKey, // 나중에 문서의 fileId와 조합하여 앱 전체 고유 ID 생성용으로 쓰임
        key: fieldKey,
        label: displayLabel,
        value: item.value,
        confidence: item.confidence || 0,
        isMatch: true, 
        isViolationTarget: false, // 아래에서 에러 타겟인지 재검증됨
        isRiskTarget: false,      // 아래에서 리스크 타겟인지 재검증됨
        isModified: false,
        evidence: item.evidence
      });
    } else if (Array.isArray(item)) {
      item.forEach((subItem, index) => {
        fields.push(...flattenContent(subItem, `${fieldKey}[${index}]`, `${displayLabel}[${index + 1}]`));
      });
    } else if (item && typeof item === 'object') {
      fields.push(...flattenContent(item, fieldKey, displayLabel));
    }
  }
  return fields;
};

/**
 * @entity verification/mapper
 * 서버의 중첩된 OCR 데이터를 프론트엔드가 다루기 쉬운 형태로 변환합니다.
 * 특히, 백엔드의 '문서 종류(Type)' 기준인 검증 규칙을 UI의 '개별 파일(fileId)' 단위로 번역하여 최적화된 룩업 인덱스를 만듭니다.
 */
export const mapServerResponseToVerificationResult = (
  response: VerificationServerResponse,
  id: string
): VerificationResult => {
  const { documents, validationResult } = response.data;

  // 1. 빠른 조회를 위한 중간 맵들 생성 (에러 타겟들을 종류별로 미리 수집)
  // TODO: 백엔드 측에 누락된 문서(Missing) 응답 시 documentGroup 포함 요청. 완료 시 가상 DocItem 채워넣는 로직 구현 필요
  const missingSet = new Set(validationResult.documentMissings.map(m => m.documentType));
  
  const violationMap: Record<string, Set<string>> = {};
  validationResult.violations.forEach(v => {
    if (!violationMap[v.documentType]) violationMap[v.documentType] = new Set();
    v.fields.forEach(f => violationMap[v.documentType].add(f));
  });

  const riskMap: Record<string, Set<string>> = {};
  validationResult.risks.forEach(r => {
    if (!riskMap[r.documentType]) riskMap[r.documentType] = new Set();
    r.fields.forEach(f => riskMap[r.documentType].add(f));
  });

  // 1-1. errorTargetDict 빈 바구니 준비
  // 교차 검증 연동을 위해 '어느 필드에러가 어느 파일들에 걸려있나?' 기록할 사전의 뼈대를 만듭니다.
  const initialErrorTargetDict: Record<string, Set<string>> = {};
  validationResult.violations.forEach(v => {
    v.fields.forEach(field => {
      if (!initialErrorTargetDict[field]) initialErrorTargetDict[field] = new Set<string>();
    });
  });

  // 2. 문서 순회 병합본 (순수 함수 구조인 reduce 활용)
  // map을 쓰면서 외부의 변수를 사이드 이펙트(Side Effect)로 변형시키는 안티 패턴을 방지하기 위해,
  // 하나의 완성된 결과물(acc)만 만들어 반환합니다.
  const initialData = {
    processedDocs: [] as DocItem[],
    documentFields: {} as Record<string, ExtractedField[]>,
    documentsMap: {} as Record<string, DocItem>,
    errorTargetDict: initialErrorTargetDict
  };

  const { processedDocs, documentFields, documentsMap, errorTargetDict } = documents.reduce((acc, doc) => {
    const docType = doc.documentClassification.documentType;
    const flattened = flattenContent(doc.extraction.content);
    
    // 각 문서(파일)의 필드들이 에러 타겟인지 색별(마킹)하는 과정
    const markedFields = flattened.map(field => {
      
      // [왜 정규식과 split으로 원본 키를 추출하나요?]
      // UI 렌더링을 위해 만든 키(예: '연락처_비상연락망[0]')와 백엔드 에러 키(예: '비상연락망')의 모양이 다릅니다.
      // 단순 비교로는 일치하지 않아 빨간불을 켤 수 없으므로, 인덱스 등을 떼어내고 진짜 이름(baseKey)만 추출합니다.
      const parts = field.key.replace(ARRAY_INDEX_REGEX, '').split('_');
      const baseKey = parts[parts.length - 1];
      
      const docRiskFields = riskMap[docType] || new Set<string>();
      const docViolationFields = violationMap[docType] || new Set<string>();
      
      const isViolation = docViolationFields.has(baseKey) || docViolationFields.has(field.key);
      const isRisk = docRiskFields.has(baseKey) || docRiskFields.has(field.key);

      // [왜 errorTargetDict에 fileId를 추가하나요?]
      // 백엔드는 단순히 "이 타입(예: 매매계약서)에 에러가 있다"고 통보하지만,
      // 그 매매계약서 이미지가 1번 파일인지 2번 파일인지 정확한 대상을 찾아 O(1)로 연동하기 위해
      // 여기서 백엔드 규칙을 실제 프론트엔드 UI 식별자인 fileId로 번역(매핑)해 두는 것입니다.
      if (isViolation) {
        if (!acc.errorTargetDict[field.key]) acc.errorTargetDict[field.key] = new Set();
        acc.errorTargetDict[field.key].add(doc.fileId);
      }

      return {
        ...field,
        id: `field-${doc.fileId}-${field.id}`,
        isViolationTarget: !!isViolation,
        isRiskTarget: !!isRisk,
        isMatch: !isViolation // 초기 상태: 위반 타겟으로 색인된 필드면 무조건 false(빨간색/에러), 아니면 true
      };
    });

    acc.documentFields[doc.fileId] = markedFields;

    // 문서 자체의 최종 상태 판별 (자식 필드들 중에 에러가 단 하나라도 있으면 REVIEW_NEEDED 격상)
    const hasViolation = markedFields.some(f => f.isViolationTarget);
    const hasRisk = markedFields.some(f => f.isRiskTarget);

    let status: DocumentStatus = 'APPROVED';
    if (missingSet.has(docType)) {
      status = 'MISSING';
    } else if (hasViolation) {
      status = 'REVIEW_NEEDED';
    } else if (hasRisk) {
      status = 'RISK';
    }

    const docItem: DocItem = { ...doc, id: doc.fileId, status, isRisk: hasRisk };
    acc.documentsMap[doc.fileId] = docItem;
    acc.processedDocs.push(docItem);

    return acc; // 다음 순회를 위해 누산기 반환
  }, initialData);

  // 4. 카테고리(좌측 메뉴 등 표시용) 그룹화 및 목차 구조화
  const categories: DocCategory[] = [];
  const groups = Array.from(new Set(processedDocs.map(d => d.documentClassification.documentGroup)));
  groups.forEach(group => {
    const itemIds = processedDocs
      .filter(d => d.documentClassification.documentGroup === group)
      .map(d => d.id);

    categories.push({
      id: `cat-${group}`,
      name: DOCUMENT_GROUP_LABELS[group] || '주택 및 권리관계', // 레이블이 선언되지 않은 새 그룹 시의 대비책 폴백
      itemIds // 실제 포함된 파일들의 목록(fileId의 배열)을 주입
    });
  });

  return {
    id,
    selectedDocId: processedDocs[0]?.id || '',
    categories,
    documents: documentsMap,
    documentFields,
    errorTargetDict,
    violationMap,
    riskMap,
    missingSet
  };
};
