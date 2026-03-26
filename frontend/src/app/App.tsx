import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';

import { router } from './router/routes';
import { queryClient } from './providers/query-client';
import { store } from './store';
import { GlobalSseSubscriber } from '@/entities/audit/ui/GlobalSseSubscriber';

import './styles/index.css';

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
