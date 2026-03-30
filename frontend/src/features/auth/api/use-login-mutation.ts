

import { useMutation } from '@tanstack/react-query';
import { login, LoginRequest } from './auth.api';
import { mapLoginResponseToUser } from '../../../entities/user';
import { useAppDispatch } from '../../../app/store/hooks';
import { setCredentials } from '../../../app/store/slices/auth.slice';

export const useLoginMutation = () => {
  const dispatch = useAppDispatch();

  return useMutation({

    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      const { data: apiResponse, headers } = response;

      if (apiResponse.success && apiResponse.data) {

        const authHeader = headers['authorization'] || '';
        const accessToken = authHeader.replace('Bearer ', '');

        const user = mapLoginResponseToUser(apiResponse.data, accessToken);
        dispatch(setCredentials({ user }));

      }
    },
    onError: () => {
    },
  });
};