import { useMutation } from '@tanstack/react-query';
import { startAgentUpload } from './agent.api';
import { useAppSelector } from '../../../app/store/hooks';

interface UploadParams {
  consultationId: string;
  mode: 'all' | 'selected';
  sequenceIds?: number[];
}

export const useUploadDocuments = () => {
  const accessToken = useAppSelector((state) => state.auth.user?.accessToken);

  return useMutation({
    mutationFn: ({ consultationId, mode, sequenceIds }: UploadParams) =>
      startAgentUpload(consultationId, mode, sequenceIds, accessToken),
    onSuccess: () => {

    },
    onError: () => {
    },
  });
};