import { 
  VerificationServerResponse, 
  VerificationResult, 
  DocCategory, 
  DocumentStatus,
  ExtractedField
} from './types';

/**
 * @entity verification/mapper
 * 서버의 검증 응답을 UI 상태와 실시간 정합성 평가를 위한 최적화된 구조로 변환합니다.
 * (Why: 데이터 렌더링 전 전처리를 통해 O(1) 조회를 가능하게 하여 런타임 성능 최적화)
 */
export const mapServerResponseToVerificationResult = (
  response: VerificationServerResponse,
  id: string
): VerificationResult => {
  const { documents, validationResult } = response.data;

  // 1. 빠른 조회를 위한 중간 맵들 생성 (Indexing)
  const missingSet = new Set(validationResult.documentMissings.map(m => m.documentType));
  
  const violationMap: Record<string, Set<string>> = {};
  validationResult.violations.forEach(v => {
    violationMap[v.documentType] = new Set(v.fields);
  });

  const riskMap: Record<string, Set<string>> = {};
  validationResult.risks.forEach(r => {
    riskMap[r.documentType] = new Set(r.fields);
  });

  // 2. 교차 검증 타겟 필드 식별 (Key Indexing)
  // (Why: 전체 문서의 모든 키를 뒤질 필요 없이, 위반 보고된 필드들만 추적)
  const crossValidationFields = new Set<string>();
  validationResult.violations.forEach(v => v.fields.forEach(f => crossValidationFields.add(f)));

  // 3. 교차 검증 딕셔너리 초기화 및 값 수집 (Pass 1)
  const crossValidationDict: Record<string, Set<string>> = {};
  const documentFields: Record<string, ExtractedField[]> = {};

  documents.forEach(doc => {
    documentFields[doc.id] = doc.fields;
    doc.fields.forEach(field => {
      if (crossValidationFields.has(field.key)) {
        if (!crossValidationDict[field.key]) {
          crossValidationDict[field.key] = new Set<string>();
        }
        crossValidationDict[field.key].add(field.value);
      }
    });
  });

  // 4. 카테고리화 및 문서 상태 결정 (Pass 2)
  // (Why: 이미 위에서 인덱싱된 맵들을 활용하여 O(1)로 상태 판별)
  const categories: DocCategory[] = [
    {
      id: 'cat-id',
      name: '본인확인 및 자격서류',
      items: documents.map(doc => {
        let status: DocumentStatus = 'APPROVED';
        
        // 우선순위: MISSING > REVIEW_NEEDED > RISK > APPROVED
        if (missingSet.has(doc.documentType)) {
          status = 'MISSING';
        } else if (violationMap[doc.documentType]) {
          status = 'REVIEW_NEEDED';
        } else if (riskMap[doc.documentType]) {
          status = 'RISK';
        }

        return {
          ...doc,
          status,
          isRisk: !!riskMap[doc.documentType],
        };
      })
    }
  ];

  return {
    id,
    selectedDocId: documents[0]?.id || '',
    categories,
    documentFields,
    crossValidationDict,
    violationMap,
    riskMap,
    missingSet
  };
};
