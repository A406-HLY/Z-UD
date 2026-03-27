import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';

import { router } from './router/routes';
import { queryClient } from './providers/query-client';
import { store } from './store';
import { GlobalSseSubscriber } from '@/entities/audit/ui/GlobalSseSubscriber';
import { setupAxiosInterceptors } from '@/shared/api/client';
import { updateToken, logout as logoutAction } from '@/app/store/slices/auth.slice';
import { reissueToken } from '@/features/auth/api/auth.api';

import './styles/index.css';

/**
 * Axios 인터셉터 DI(의존성 주입) 설정
 * - shared/api/client.ts 의 순환 참조를 피하기 위해 가장 최상위 계층에서 의존성을 주입합니다.
 */
setupAxiosInterceptors({
  getAccessToken: () => store.getState().auth.user?.accessToken,
  onTokenUpdate: (token: string) => store.dispatch(updateToken(token)),
  onTokenReissue: async () => {
    const res = await reissueToken();
    return res.headers['authorization']?.replace('Bearer ', '');
  },
  onLogout: () => store.dispatch(logoutAction()),
});

/**
 * 전역 Provider 및 라우터 주입 진입점
 */
function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <GlobalSseSubscriber />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
