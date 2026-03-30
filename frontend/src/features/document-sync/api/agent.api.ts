import axios from 'axios';
import { env } from '@/shared/config/env';
import { AgentFile } from '@/entities/loan-document/api/agent.dto';

const agentClient = axios.create({
  baseURL: env.agentApiUrl,
  timeout: 60000,
});

export const fetchAgentFiles = async (): Promise<AgentFile[]> => {
  const response = await agentClient.get<{ data: { items: AgentFile[] } }>('/api/files');
  return response.data.data.items;
};

export const startAgentUpload = async (
  consultationId: string,
  mode: 'all' | 'selected' = 'all',
  sequenceIds?: number[],
  accessToken?: string
): Promise<void> => {

  await agentClient.post('/api/upload/start', {
    mode,
    sequenceIds,
    consultationId,
    accessToken,
  });
};