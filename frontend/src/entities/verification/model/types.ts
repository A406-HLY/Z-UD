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

/** OCR 서버 데이터 (도메인 모델) */
export interface VerificationServerResponse {
  // (Why) ApiResponse<T> 래퍼와 혼동을 피하기 위해 도메인 필드만 남깁니다.
  resolution?: { width: number; height: number };
  documents: ServerDocItem[];
  validationResult: {
    documentMissings: ValidationMissing[];
    violations: ValidationViolation[];
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
    bbox: number[] | null; // [x1, y1, x2, y2] (상대 좌표: 0.0 ~ 1.0)
    rawText: string;
    confidence?: number;
  };
}

/** 서버에서 내려주는 개별 문서 원본 데이터 */
export interface ServerDocItem {
  fileId: string;
  storageType?: string;
  bucket?: string;
  fileKey?: string;
  fileName: string;
  fileUrl?: string; // 백엔드에서 전달할 실제 PDF 주소
  mimeType?: string;
  documentClassification: DocumentClassification;
  status: string;
  // (Note) errorCode/errorMessage 대신 error 필드로 통합될 수 있으므로 유연하게 대응합니다.
  errorCode?: string | null;
  errorMessage?: string | null;
  error?: string | null;
  
  // (Why) extraction 계층을 거치지 않고 직접 content로 접근하도록 변경되었습니다.
  content: Record<string, unknown>; 
  
  resolution?: { width: number; height: number };
  rawText?: string;
  // (Why) 백엔드 필드명이 pageNums로 변경되었습니다.
  pageNums?: number[];
  pages?: Array<{ pageNum: number }>; // 레거시 지원을 위해 유지
}

export interface DocItem extends ServerDocItem {
  id: string; // docType을 id로 매핑하여 사용
  status: DocumentStatus;
  isRisk: boolean;
  /** 병합된 문서에 포함된 물리적 파일들의 메타데이터 리스트 */
  files: Array<{
    fileId: string;
    fileUrl?: string;
    pageNum: number;
  }>;
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
  missingSet: Set<string>;                   // docTypes
}

/** 
 * [Why: Redux 전역 상태에 저장될 사용자의 작업 중인(Work-in-Progress) 수정 데이터를 정의합니다. 
 * 무거운 전체 객체가 아닌 평탄화된 키 기반의 데이터만 저장하여 성능과 동기화 효율을 높입니다.]
 */
export interface VerificationEdits {
  /** 평탄화된 키(Dot Notation) 기반의 수정된 값들 (예: "userInfo.name": "홍길동") */
  values: Record<string, unknown>;
  /** 해당 문서의 최종 수정 일시 (ISO 8601 형식) */
  lastModified: string;
}

/** 
 * Redux 'verification' 슬라이스의 전체 상태 구조 
 * (Why: 페이지 이동 간 사용자 수정 내역을 보존하고 현재 활세션 상태를 관리하기 위함)
 */
export interface VerificationState {
  /** 
   * 문서ID(`docId`)를 키로 하는 수정 데이터 저장소 
   */
  edits: Record<string, VerificationEdits>;
  /** 현재 사용자 화면에서 활성화된(선택된) 문서의 고유 ID */
  activeDocumentId: string | null;
}
