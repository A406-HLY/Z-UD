import { 
  VerificationServerResponse, 
  VerificationResult, 
  DocCategory, 
  DocumentStatus,
  ExtractedField,
  DocItem
} from './types';

/**
 * @entity verification/mapper
 * 서버의 중첩된 OCR 데이터를 UI에서 사용하기 쉬운 평면 구조로 변환하고 최적화 인덱스를 생성합니다.
 */
export const mapServerResponseToVerificationResult = (
  response: VerificationServerResponse,
  id: string
): VerificationResult => {
  const { documents, validationResult } = response.data;

  // 1. 빠른 조회를 위한 중간 맵들 생성
  const missingSet = new Set(validationResult.documentMissings.map(m => m.documentType));
  const violationMap: Record<string, Set<string>> = {};
  validationResult.violations.forEach(v => {
    violationMap[v.documentType] = new Set(v.fields);
  });
  const riskMap: Record<string, Set<string>> = {};
  validationResult.risks.forEach(r => {
    riskMap[r.documentType] = new Set(r.fields);
  });

  const crossValidationFields = new Set<string>();
  validationResult.violations.forEach(v => v.fields.forEach(f => crossValidationFields.add(f)));

  const crossValidationDict: Record<string, Set<string>> = {};
  const documentFields: Record<string, ExtractedField[]> = {};

  /**
   * @private flattenContent
   * 중첩된 OCR 응답 데이터를 에디터 UI에서 사용하기 위한 평면 리스트로 변환합니다.
   * (Why: 재귀적 탐색을 통해 객체 계층에 상관없이 모든 추출 필드를 O(1) 조회 가능한 리스트로 구축)
   */
  const flattenContent = (content: any, prefix = '', labelPrefix = ''): ExtractedField[] => {
    let fields: ExtractedField[] = [];
    
    for (const key in content) {
      const item = content[key];
      // 시스템용 키 (예: buyer_name)
      const fieldKey = prefix ? `${prefix}_${key}` : key;
      // 화면 표시용 레이블 (예: 구매자 > 성명)
      const displayLabel = labelPrefix ? `${labelPrefix} > ${key}` : key;

      if (item && typeof item === 'object' && 'value' in item) {
        // [Leaf Node] 실제 값이 들어있는 필드 객체인 경우
        fields.push({
          id: `field-${fieldKey}-${Math.random().toString(36).substr(2, 9)}`,
          key: fieldKey,
          // 화면 표시를 위해 key 대신 가공된 레이블을 임시로 사용할 수도 있으나, 
          // 여기서는 시스템 키를 유지하고 UI 렌더링 시 가공하도록 설계
          value: item.value,
          confidence: item.confidence || 0,
          isMatch: true, 
          isModified: false,
          evidence: item.evidence
        });
      } else if (Array.isArray(item)) {
        // [Array Node] 세대원, 세목 등 배열 데이터인 경우
        item.forEach((subItem, index) => {
          fields = [
            ...fields, 
            ...flattenContent(subItem, `${fieldKey}[${index}]`, `${displayLabel}[${index + 1}]`)
          ];
        });
      } else if (item && typeof item === 'object') {
        // [Nested Object Node] 중첩 객체인 경우
        fields = [...fields, ...flattenContent(item, fieldKey, displayLabel)];
      }
    }
    return fields;
  };

  // 3. 문서 순회 및 딕셔너리 구축 (Pass 1)
  const processedDocs: DocItem[] = documents.map(doc => {
    const flattened = flattenContent(doc.extraction.content);
    documentFields[doc.fileId] = flattened;

    // 딕셔너리 수집
    flattened.forEach(field => {
      if (crossValidationFields.has(field.key)) {
        if (!crossValidationDict[field.key]) {
          crossValidationDict[field.key] = new Set<string>();
        }
        if (field.value !== null) {
          crossValidationDict[field.key].add(String(field.value));
        }
      }
    });

    let status: DocumentStatus = 'APPROVED';
    if (missingSet.has(doc.documentClassification.documentType)) {
      status = 'MISSING';
    } else if (violationMap[doc.documentClassification.documentType]) {
      status = 'REVIEW_NEEDED';
    } else if (riskMap[doc.documentClassification.documentType]) {
      status = 'RISK';
    }

    return {
      ...doc,
      id: doc.fileId,
      status,
      isRisk: !!riskMap[doc.documentClassification.documentType]
    };
  });

  // 4. 초기 정합성 결과 반영 (Self-correction based on dict)
  for (const docId in documentFields) {
    documentFields[docId] = documentFields[docId].map(field => ({
      ...field,
      isMatch: crossValidationFields.has(field.key) 
        ? (crossValidationDict[field.key]?.has(String(field.value)) ?? true)
        : true
    }));
  }

  // 5. 카테고리 그룹화
  const categories: DocCategory[] = [];
  const groups = Array.from(new Set(processedDocs.map(d => d.documentClassification.documentGroup)));
  
  groups.forEach(group => {
    const items = processedDocs.filter(d => d.documentClassification.documentGroup === group);
    categories.push({
      id: `cat-${group}`,
      name: items[0].documentClassification.documentGroup === 'IDENTITY_FAMILY' ? '본인 및 가족관계' :
            items[0].documentClassification.documentGroup === 'INCOME_EMPLOYEE' ? '소득 및 재직증빙' :
            items[0].documentClassification.documentGroup === 'TAX' ? '세금 납부 증빙' : '주택 및 권리관계',
      items
    });
  });

  return {
    id,
    selectedDocId: processedDocs[0]?.id || '',
    categories,
    documentFields,
    crossValidationDict,
    violationMap,
    riskMap,
    missingSet
  };
};
