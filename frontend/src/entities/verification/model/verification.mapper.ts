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

  const errorTargetDict: Record<string, Set<string>> = {};
  const documentFields: Record<string, ExtractedField[]> = {};

  // 1-1. errorTargetDict 초기 구축 (위반 문서 ID를 키별로 수집)
  validationResult.violations.forEach(v => {
    v.fields.forEach(field => {
      if (!errorTargetDict[field]) errorTargetDict[field] = new Set<string>();
      // 여기서는 documentType을 임시로 넣지만, 아래 문서 순회 시 fileId로 매핑을 고도화합니다.
    });
  });

  /** 재귀적 평면화 함수 */
  const flattenContent = (content: any, prefix = '', labelPrefix = ''): ExtractedField[] => {
    let fields: ExtractedField[] = [];
    for (const key in content) {
      const item = content[key];
      const fieldKey = prefix ? `${prefix}_${key}` : key;
      const displayLabel = labelPrefix ? `${labelPrefix} > ${key}` : key;

      if (item && typeof item === 'object' && 'value' in item) {
        fields.push({
          id: `field-${fieldKey}-${Math.random().toString(36).substr(2, 9)}`,
          key: fieldKey,
          label: displayLabel,
          value: item.value,
          confidence: item.confidence || 0,
          isMatch: true, 
          isViolationTarget: false, // 아래에서 재평가
          isRiskTarget: false,      // 아래에서 재평가
          isModified: false,
          evidence: item.evidence
        });
      } else if (Array.isArray(item)) {
        item.forEach((subItem, index) => {
          fields = [...fields, ...flattenContent(subItem, `${fieldKey}[${index}]`, `${displayLabel}[${index + 1}]`)];
        });
      } else if (item && typeof item === 'object') {
        fields = [...fields, ...flattenContent(item, fieldKey, displayLabel)];
      }
    }
    return fields;
  };

  // 2. 문서 처리 및 타겟 마킹
  const processedDocs: DocItem[] = documents.map(doc => {
    const docType = doc.documentClassification.documentType;
    const flattened = flattenContent(doc.extraction.content);
    
    // (Why: 백엔드에서 명시한 위반/위험 필드에 플래그를 달아 UI 권한 제어에 활용)
    const markedFields = flattened.map(field => {
      // 배열 키(예: householdMembers[0]_name)일 경우 원본 키(name)로 매칭 검사 필요 (정규식 활용)
      const baseKey = field.key.replace(/\[\d+\]/g, '').split('_').pop() || field.key;
      
      const isViolation = violationMap[docType]?.has(baseKey) || violationMap[docType]?.has(field.key);
      const isRisk = riskMap[docType]?.has(baseKey) || riskMap[docType]?.has(field.key);

      // errorTargetDict에 실제 fileId 수집
      if (isViolation) {
        if (!errorTargetDict[field.key]) errorTargetDict[field.key] = new Set();
        errorTargetDict[field.key].add(doc.fileId);
      }

      return {
        ...field,
        isViolationTarget: !!isViolation,
        isRiskTarget: !!isRisk,
        isMatch: !isViolation // 초기 상태: 위반 타겟이면 무조건 false(빨간색), 아니면 true
      };
    });

    documentFields[doc.fileId] = markedFields;

    let status: DocumentStatus = 'APPROVED';
    if (missingSet.has(docType)) status = 'MISSING';
    else if (violationMap[docType]) status = 'REVIEW_NEEDED';
    else if (riskMap[docType]) status = 'RISK';

    return { ...doc, id: doc.fileId, status, isRisk: !!riskMap[docType] };
  });

  // 4. 카테고리 그룹화 (번호 유지)
  const categories: DocCategory[] = [];
  const groups = Array.from(new Set(processedDocs.map(d => d.documentClassification.documentGroup)));
  groups.forEach(group => {
    const items = processedDocs.filter(d => d.documentClassification.documentGroup === group);
    categories.push({
      id: `cat-${group}`,
      name: group === 'IDENTITY_FAMILY' ? '본인 및 가족관계' :
            group === 'INCOME_EMPLOYEE' ? '소득 및 재직증빙' :
            group === 'TAX' ? '세금 납부 증빙' : '주택 및 권리관계',
      items
    });
  });

  return {
    id,
    selectedDocId: processedDocs[0]?.id || '',
    categories,
    documentFields,
    errorTargetDict,
    violationMap,
    riskMap,
    missingSet
  };
};
