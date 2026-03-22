import { useQuery } from '@tanstack/react-query';
import { fetchAgentFiles } from './agent.api';
import { AgentFile } from '@/entities/loan-document/api/agent.dto';

/**
 * @feature DocumentSync
 * 에이전트 파일 목록을 실시간으로 폴링하기 위한 훅입니다.
 * @param enabled 폴링 활성화 여부
 */
export const useAgentFiles = (enabled: boolean = false) => {
  return useQuery<AgentFile[]>({
    queryKey: ['agent-files'],
    queryFn: fetchAgentFiles,
    /** 
     * (Why) 트리거 버튼이 눌렸을 때만 에이전트에 요청을 보냅니다.
     * 활성화 시 3초 간격으로 데이터를 갱신합니다.
     */
    enabled,
    refetchInterval: enabled ? 3000 : false,
    refetchOnWindowFocus: true,
  });
};
