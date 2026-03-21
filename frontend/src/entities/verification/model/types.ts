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
  // TODO: 백엔드 협의 필요 - documentMissings 응답에 documentGroup 필드 추가 요청 (Why: 누락된 서류를 올바른 폴더에 표시하기 위함)
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
  label: string; // 화면 표시용 레이블 (예: 세대원[1] > 성명)
  value: string | number | boolean | null;
  confidence: number;
  isMatch: boolean; // 딕셔너리 대조 결과 (실시간 일치 여부)
  isViolationTarget: boolean; // 백엔드가 지정한 정합성 오류 필드 여부 (수정 활성화 기준)
  isRiskTarget: boolean; // 백엔드가 지정한 위험(주의) 필드 여부 (노란색 강조 기준)
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
  itemIds: string[]; // (Why: 평면적 구조 관리를 위해 실제 객체 대신 ID 리스트만 보유)
}

/** 최종 가공된 검증 결과 데이터 (UI State용) */
export interface VerificationResult {
  id: string;
  selectedDocId: string;
  categories: DocCategory[];
  // (Why: 평면적 관리를 위해 문서 정보를 ID 기반 Map으로 분리)
  documents: Record<string, DocItem>; 
  // 각 문서별 필드 데이터 (평면화된 리스트로 변환하여 관리)
  documentFields: Record<string, ExtractedField[]>;
  // 정합성 오류가 발생한 타겟 문서 ID를 키(필드명)별로 관리
  // (Why: 사용자가 값을 수정했을 때, 해당 키의 오류를 공유하는 문서들만 핀포인트로 재대조하기 위함)
  errorTargetDict: Record<string, Set<string>>;
  // 빠른 조회를 위한 맵들
  violationMap: Record<string, Set<string>>; // docType -> fields
  riskMap: Record<string, Set<string>>;      // docType -> fields
  missingSet: Set<string>;                   // docTypes
}
