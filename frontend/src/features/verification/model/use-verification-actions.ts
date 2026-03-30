import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { updateField, resetVerification, setActiveDocument } from '@/entities/verification/model/slice';
import { setIsPollingActive } from '@/entities/customer/model/slice';

export const useVerificationActions = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onFieldUpdate = (docId: string, path: string, value: unknown) => {
    dispatch(updateField({ docId, path, value }));
  };

  const onSelectDocument = (docId: string) => {
    dispatch(setActiveDocument(docId));
  };

  const handleEndService = () => {
    dispatch(resetVerification());
    dispatch(setIsPollingActive(false));

    queryClient.removeQueries({ queryKey: ['agent-files'] });

    navigate('/basic-info');
  };

  const handleNextStep = () => {
    navigate('/customer-info');
  };

  return {
    onFieldUpdate,
    onSelectDocument,
    handleEndService,
    handleNextStep,
  };
};