import { useQuery } from '@tanstack/react-query';
import { fetchAgentFiles } from './agent.api';
import { AgentFile } from '@/entities/loan-document/api/agent.dto';

export const useAgentFiles = (enabled: boolean = false) => {
  return useQuery<AgentFile[]>({
    queryKey: ['agent-files'],
    queryFn: fetchAgentFiles,

    enabled,
    refetchInterval: enabled ? 3000 : false,
    refetchOnWindowFocus: true,
  });
};