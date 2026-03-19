/**
 * @entity verification
 * 서류 검증 도메인 관련 타입 정의입니다.
 */

export interface DocItem {
  id: string;
  name: string;
  status: 'VERIFIED' | 'PENDING' | 'ERROR' | 'PROCESSING';
  size: string;
}

export interface DocCategory {
  id: string;
  name: string;
  items: DocItem[];
}

export interface VerificationResult {
  id: string;
  selectedDocId: string;
  categories: DocCategory[];
  extractedData: Record<string, string>;
}
