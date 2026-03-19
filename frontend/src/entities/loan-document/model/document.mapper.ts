import { AgentFile } from '@/features/document-sync/api/agent.api';
import { Document } from './types';

/**
 * @entity LoanDocument
 * 에이전트로부터 전달받은 로우 데이터를 시스템 도메인 모델로 변환합니다.
 * (Why) 규칙 3에 따라 백엔드/에이전트 응답 규격이 UI에 직접 침투하지 않도록 격리하기 위함입니다.
 */
export const documentMapper = {
  /** AgentFile DTO -> Document 모델 변환 */
  toDomainFromAgent: (agentFile: AgentFile): Document => ({
    id: `agent-${agentFile.sequenceId}`,
    no: agentFile.sequenceId,
    fileName: agentFile.fileName,
    status: agentFile.status as Document['status'],
  })
};
