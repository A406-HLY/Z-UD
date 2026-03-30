import axios from 'axios';
import { env } from '@/shared/config/env';
import { AgentFile } from '@/entities/loan-document/api/agent.dto';

/**
 * @feature DocumentSync
 * 로컬 업로드 에이전트와 통신하여 파일 목록을 동기화하는 기능을 제공합니다.
 * (Why) 사용자가 로컬 PC의 특정 폴더에 서류를 넣었을 때, 수동 업로드 없이도 웹 화면에서 즉시 인지할 수 있도록 실시간 인터페이스를 제공하기 위함입니다.
 */
const agentClient = axios.create({
  baseURL: env.agentApiUrl,
  timeout: 60000,
});


/** 에이전트 파일 응답 규격 */
// (Moved to entities/loan-document/api/agent.dto.ts)

/**
 * 에이전트로부터 감지된 파일 목록을 조회합니다.
 * (Why) 에이전트가 관리하는 로컬 임시 폴더의 파일 큐 데이터를 HTTP 요청으로 가져옵니다.
 */
export const fetchAgentFiles = async (): Promise<AgentFile[]> => {
  const response = await agentClient.get<{ data: { items: AgentFile[] } }>('/api/files');
  return response.data.data.items;
};

/**
 * 에이전트에게 백엔드 전송 프로세스 시작을 요청합니다.
 * @param consultationId 상담 ID
 * @param mode 'all' | 'selected'
 * @param sequenceIds 선택된 파일의 sequenceId 목록 (mode가 'selected'일 때 필드 필수)
 * @param accessToken [NEW] Redux 메모리에서 주입받은 인증 토큰
 */
export const startAgentUpload = async (
  consultationId: string, 
  mode: 'all' | 'selected' = 'all', 
  sequenceIds?: number[],
  accessToken?: string
): Promise<void> => {
  // (Why) 에이전트는 독립 프로세스이므로 브라우저의 인증 세션을 공유하지 못합니다. 
  // 호출 시점에 주입받은 액세스 토큰(Memory-only)을 전달합니다.
  await agentClient.post('/api/upload/start', {
    mode,
    sequenceIds,
    consultationId,
    accessToken,
  });
};


