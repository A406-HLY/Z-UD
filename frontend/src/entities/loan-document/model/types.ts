/**
 * @entity LoanDocument
 * 대출 심사에 사용되는 서류의 공통 타입을 정의합니다.
 */

export type DocumentStatus = 'VERIFIED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'UPLOADING';

export interface Document {
  id: string;
  no: number;
  fileName: string;
  status: DocumentStatus;
}
