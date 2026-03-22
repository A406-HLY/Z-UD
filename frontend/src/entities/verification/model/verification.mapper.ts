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

  // 1. 빠른 조회를 위한 중간 맵들 생성 (합집합 방식으로 수집하여 데이터 유실 방지)
  // TODO: 백엔드에서 documentMissings에 documentGroup를 포함해주면, 해당 정보를 바탕으로 가상 DocItem을 생성하여 카테고리에 주입하는 로직 구현 필요
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

  const crossValidationFields = new Set<string>();
  validationResult.violations.forEach(v => v.fields.forEach(f => crossValidationFields.add(f)));

  const errorTargetDict: Record<string, Set<string>> = {};
  const documentFields: Record<string, ExtractedField[]> = {};
  const documentsMap: Record<string, DocItem> = {};

  // 1-1. errorTargetDict 초기 구축 (위반 문서 ID를 키별로 수집)
  validationResult.violations.forEach(v => {
    v.fields.forEach(field => {
      if (!errorTargetDict[field]) errorTargetDict[field] = new Set<string>();
    });
  });

  /** 재귀적 평면화 함수 */
  const flattenContent = (content: unknown, prefix = '', labelPrefix = ''): ExtractedField[] => {
    const fields: ExtractedField[] = [];
    if (!content || typeof content !== 'object') return fields;

    const obj = content as Record<string, any>; // (Why: 동적 키 순회를 위해 타입 단언 사용)
    for (const key in obj) {
      const item = obj[key];
      const fieldKey = prefix ? `${prefix}_${key}` : key;
      const displayLabel = labelPrefix ? `${labelPrefix} > ${key}` : key;

      if (item && typeof item === 'object' && 'value' in item) {
        fields.push({
          id: fieldKey, // (Why: flattened.map에서 doc.fileId와 조합하여 최종 고유 ID 생성)
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
          fields.push(...flattenContent(subItem, `${fieldKey}[${index}]`, `${displayLabel}[${index + 1}]`));
        });
      } else if (item && typeof item === 'object') {
        fields.push(...flattenContent(item, fieldKey, displayLabel));
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
      // (Why: 배열 키나 중첩 키의 경우 원본 키를 추출하여 매칭 확률을 높임)
      const parts = field.key.replace(/\[\d+\]/g, '').split('_');
      const baseKey = parts[parts.length - 1];
      
      const docRiskFields = riskMap[docType] || new Set<string>();
      const docViolationFields = violationMap[docType] || new Set<string>();
      
      const isViolation = docViolationFields.has(baseKey) || docViolationFields.has(field.key);
      const isRisk = docRiskFields.has(baseKey) || docRiskFields.has(field.key);

      // errorTargetDict에 실제 fileId 수집
      if (isViolation) {
        if (!errorTargetDict[field.key]) errorTargetDict[field.key] = new Set();
        errorTargetDict[field.key].add(doc.fileId);
      }

      return {
        ...field,
        id: `field-${doc.fileId}-${field.id}`,
        isViolationTarget: !!isViolation,
        isRiskTarget: !!isRisk,
        isMatch: !isViolation // 초기 상태: 위반 타겟이면 무조건 false(빨간색), 아니면 true
      };
    });

    documentFields[doc.fileId] = markedFields;

    // (Why: 정보 흐름 원칙에 따라, 필드들의 상태를 합산하여 문서의 초기 상태를 결정합니다.)
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
    documentsMap[doc.fileId] = docItem;
    return docItem;
  });

  // 4. 카테고리 그룹화 (번호 유지)
  const categories: DocCategory[] = [];
  const groups = Array.from(new Set(processedDocs.map(d => d.documentClassification.documentGroup)));
  groups.forEach(group => {
    const itemIds = processedDocs
      .filter(d => d.documentClassification.documentGroup === group)
      .map(d => d.id);

    categories.push({
      id: `cat-${group}`,
      name: group === 'IDENTITY_FAMILY' ? '본인 및 가족관계' :
            group === 'INCOME_EMPLOYEE' ? '소득 및 재직증빙' :
            group === 'TAX' ? '세금 납부 증빙' : '주택 및 권리관계',
      itemIds
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
