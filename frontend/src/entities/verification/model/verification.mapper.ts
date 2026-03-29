import { 
  VerificationServerResponse, 
  VerificationResult, 
  DocCategory, 
  DocumentStatus,
  ExtractedField,
  DocItem,
  ServerDocItem
} from './types';


const ARRAY_INDEX_REGEX = /\[\d+\]/g;

export const DOCUMENT_GROUP_LABELS: Record<string, string> = {
  IDENTITY_FAMILY: '본인 및 가족관계',
  INCOME_EMPLOYEE: '소득 및 재직증빙',
  INCOME_BUSINESS: '사업자 소득증빙',
  TAX: '세금 납부 증빙',
  PROPERTY_HOUSING: '주택 및 권리관계',
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

  const obj = content as Record<string, unknown>; // 동적 키 순회를 위해 타입 단언 유지
  for (const key in obj) {
    const item = obj[key];
    const fieldKey = prefix ? `${prefix}.${key}` : key;
    const displayLabel = labelPrefix ? `${labelPrefix} > ${key}` : key;

    const isFieldObject = (val: unknown): val is { value: string | number | boolean | null; confidence?: number; evidence?: unknown } => {
      return typeof val === 'object' && val !== null && 'value' in val;
    };

    if (isFieldObject(item)) {
      fields.push({
        id: fieldKey,
        key: fieldKey,
        label: displayLabel,
        value: item.value,
        confidence: item.confidence ?? 0,
        isMatch: true, 
        isViolationTarget: false,
        isRiskTarget: false,
        isModified: false,
        evidence: item.evidence as ExtractedField['evidence']
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
  // (Why) response 자체가 도메인 데이터 객체(VerificationServerResponse)이므로 직접 구조분해를 수행합니다.
  const { documents: serverDocs, validationResult = { documentMissings: [], violations: [] }, resolution } = response;

  // 1. 빠른 조회를 위한 중간 맵들 생성
  const missingSet = new Set((validationResult.documentMissings || []).map(m => m.documentType));
  
  const violationMap: Record<string, Set<string>> = {};
  (validationResult.violations || []).forEach(v => {
    if (!violationMap[v.documentType]) violationMap[v.documentType] = new Set();
    (v.fields || []).forEach(f => violationMap[v.documentType].add(f));
  });

  // (Note) risks 필드는 백엔드 사양 변경에 따라 더 이상 처리하지 않습니다.

  const initialErrorTargetDict: Record<string, Set<string>> = {};
  (validationResult.violations || []).forEach(v => {
    (v.fields || []).forEach(field => {
      if (!initialErrorTargetDict[field]) initialErrorTargetDict[field] = new Set<string>();
    });
  });

  // 2. 문서 종류별 그룹화 (여러 물리 파일을 하나의 논리 문서로)
  const groupedDocs: Record<string, ServerDocItem[]> = {};
  serverDocs.forEach(doc => {
    const docType = doc.documentClassification.documentType;
    if (!groupedDocs[docType]) groupedDocs[docType] = [];
    groupedDocs[docType].push(doc);
  });

  const initialData = {
    processedDocs: [] as DocItem[],
    documentFields: {} as Record<string, ExtractedField[]>,
    documentsMap: {} as Record<string, DocItem>,
    errorTargetDict: initialErrorTargetDict
  };

  // 3. 그룹화된 문서 순회 및 데이터 병합
  const { processedDocs, documentFields, documentsMap, errorTargetDict } = Object.entries(groupedDocs).reduce((acc, [docType, docs]) => {
    // pageNum 기준으로 정렬 (안전장치)
    const sortedDocs = [...docs].sort((a, b) => {
      const pA = a.pageNums?.[0] ?? a.pages?.[0]?.pageNum ?? 1;
      const pB = b.pageNums?.[0] ?? b.pages?.[0]?.pageNum ?? 1;
      return pA - pB;
    });

    // 모든 파일의 콘텐츠 병합 및 rawText 결합
    let combinedRawText = '';
    const mergedFields: ExtractedField[] = [];
    const firstDoc = sortedDocs[0];
    
    sortedDocs.forEach(doc => {
      // (Why) extraction.content 대신 최상위 content 필드를 우선적으로 참조합니다.
      const contentData = doc.content || {};
      const flattened = flattenContent(contentData);
      
      mergedFields.push(...flattened.map(field => ({
        ...field,
        id: `field-${doc.fileId}-${field.id}` // 중복 타입 내의 필드 구분을 위해 fileId 포함 유지
      })));
      combinedRawText += (doc.rawText || '') + '\n';
    });

    // 필드 마킹 (Violation)
    const docViolationFields = violationMap[docType] || new Set<string>();

    const markedFields = mergedFields.map(field => {
      const parts = field.key.replace(ARRAY_INDEX_REGEX, '').split('.');
      const baseKey = parts[parts.length - 1];
      
      const isViolation = docViolationFields.has(baseKey) || docViolationFields.has(field.key);

      if (isViolation) {
        if (!acc.errorTargetDict[field.key]) acc.errorTargetDict[field.key] = new Set();
        acc.errorTargetDict[field.key].add(docType);
      }

      return {
        ...field,
        isViolationTarget: !!isViolation,
        isRiskTarget: false, // 리스크 필드는 더 이상 사용하지 않음
        isMatch: !isViolation
      };
    });

    const hasViolation = markedFields.some(f => f.isViolationTarget);

    let status: DocumentStatus = 'APPROVED';
    if (missingSet.has(docType)) {
      status = 'MISSING';
    } else if (hasViolation) {
      status = 'REVIEW_NEEDED';
    }

    // DocItem 생성 (id를 docType으로 사용하여 UI에서 그룹 단위 제어)
    const docItem: DocItem = { 
      ...firstDoc, 
      id: docType, 
      status, 
      isRisk: false, // 리스크 개념 제거
      // (Why) 백엔드에서 해상도를 주지 않을 경우 프론트엔드 기본값(A4)을 사용합니다.
      resolution: firstDoc.resolution || resolution,
      rawText: combinedRawText.trim(),
      // 병합된 문서에 포함된 모든 물리적 파일의 메타데이터 수집
      files: sortedDocs.map(d => ({
        fileId: d.fileId,
        fileUrl: d.fileUrl,
        // (Why) pageNums 배열 또는 기존 pages 객체를 모두 지원하도록 유연하게 대응합니다.
        pageNum: d.pageNums?.[0] ?? d.pages?.[0]?.pageNum ?? 1
      }))
    };
    
    acc.documentFields[docType] = markedFields;
    acc.documentsMap[docType] = docItem;
    acc.processedDocs.push(docItem);

    return acc;
  }, initialData);

  // 4. 카테고리 구성 (Requested Order: IDENTITY_FAMILY -> INCOME -> PROPERTY -> TAX)
  const ORDERED_GROUPS = [
    'IDENTITY_FAMILY',
    'INCOME_EMPLOYEE',
    'INCOME_BUSINESS',
    'PROPERTY_HOUSING',
    'TAX'
  ];

  const categories: DocCategory[] = [];
  ORDERED_GROUPS.forEach(group => {
    const itemIds = processedDocs
      .filter(d => d.documentClassification.documentGroup === group)
      .map(d => d.id);

    if (itemIds.length > 0) {
      categories.push({
        id: `cat-${group}`,
        name: DOCUMENT_GROUP_LABELS[group] || '주택 및 권리관계',
        itemIds
      });
    }
  });

  return {
    id,
    selectedDocId: processedDocs[0]?.id || '',
    categories,
    documents: documentsMap,
    documentFields,
    errorTargetDict,
    violationMap,
    missingSet
  };
};
