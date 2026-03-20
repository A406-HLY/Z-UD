/**
 * @entity verification
 * 서류 검증 도메인 관련 타입 정의입니다.
 */

/** 문서의 최종 검수 상태 (Priority 순서대로 정의) */
export type DocumentStatus = 'MISSING' | 'REVIEW_NEEDED' | 'RISK' | 'APPROVED';

/** 
 * 서버에서 내려주는 위반/위험 정보 인터페이스 
 */
export interface ValidationViolation {
  documentType: string;
  documentTypeLabel: string;
  fields: string[];
}

export interface ValidationMissing {
  documentType: string;
  documentTypeLabel: string;
}

export interface ValidationRisk {
  documentType: string;
  documentTypeLabel: string;
  fields: string[];
}

/** 백엔드 전체 응답 구조 */
export interface VerificationServerResponse {
  data: {
    documents: ServerDocItem[];
    validationResult: {
      documentMissings: ValidationMissing[];
      violations: ValidationViolation[];
      risks: ValidationRisk[];
    };
  };
}

/** 문서 분류 정보 */
export interface DocumentClassification {
  documentGroup: string;
  documentType: string;
  documentTypeLabel: string;
  classificationConfidence?: number;
}

/** 
 * OCR 추출 필드 상세 데이터 (Field Level)
 * (Why: 단순 값이 아닌 신뢰도와 시각적 근거 데이터를 포함하여 정밀 검수 지원)
 */
export interface ExtractedField {
  id: string;
  key: string;
  value: string | number | boolean | null;
  confidence: number;
  isMatch: boolean; // 초기 정합성 결과
  isModified: boolean; // 사용자 수정 여부
  evidence?: {
    pageNum: number;
    bbox: number[] | null; // [x, y, w, h]
    rawText: string;
  };
}

/** 서버에서 내려주는 개별 문서 원본 데이터 */
export interface ServerDocItem {
  fileId: string;
  fileName: string;
  documentClassification: DocumentClassification;
  status: string;
  extraction: {
    content: Record<string, any>; // 실제 응답은 중첩 구조이므로 any 허용(Mapper에서 처리)
  };
  reviewItems?: Array<{ reviewCode: string; reviewMessage: string }>;
}

/** UI에서 사용하는 가공된 문서 아이템 */
export interface DocItem extends Omit<ServerDocItem, 'extraction'> {
  id: string; // fileId를 id로 매핑하여 사용
  status: DocumentStatus;
  isRisk: boolean;
}

export interface DocCategory {
  id: string;
  name: string;
  items: DocItem[];
}

/** 최종 가공된 검증 결과 데이터 (UI State용) */
export interface VerificationResult {
  id: string;
  selectedDocId: string;
  categories: DocCategory[];
  // 각 문서별 필드 데이터 (평면화된 리스트로 변환하여 관리)
  documentFields: Record<string, ExtractedField[]>;
  // 교차 검증을 위한 딕셔너리 (Key: 필드명, Value: 해당 필드의 중복 값들)
  crossValidationDict: Record<string, Set<string>>;
  // 빠른 조회를 위한 맵들
  violationMap: Record<string, Set<string>>; // docType -> fields
  riskMap: Record<string, Set<string>>;      // docType -> fields
  missingSet: Set<string>;                   // docTypes
}
