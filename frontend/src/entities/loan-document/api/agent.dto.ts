/**
 * @entity LoanDocument
 * 에이전트로부터 전달받는 파일 객체의 원시 DTO 규격입니다.
 * (Why) 여러 기능(Feature)에서 공통으로 참조할 수 있도록 엔티티 레이어의 Dto로 정의합니다.
 */
export interface AgentFile {
  sequenceId: number;
  fileName: string;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  detectedAt: string;
}
