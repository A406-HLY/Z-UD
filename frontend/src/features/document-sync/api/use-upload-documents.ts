import { useMutation } from '@tanstack/react-query';
import { startAgentUpload } from './agent.api';

interface UploadParams {
  counselId: string;
  mode: 'all' | 'selected';
  sequenceIds?: number[];
}

/**
 * @feature DocumentSync
 * 에이전트에게 서류 전송 프로세스(백엔드 업로드) 시작을 요청하는 뮤테이션 훅입니다.
 */
export const useUploadDocuments = () => {
  return useMutation({
    mutationFn: ({ counselId, mode, sequenceIds }: UploadParams) => 
      startAgentUpload(counselId, mode, sequenceIds),
    onSuccess: () => {
      console.log('Upload process triggered successfully.');
    },
    onError: (error) => {
      console.error('Failed to trigger upload process:', error);
    },
  });
};
