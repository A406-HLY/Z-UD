
export const env = {

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',

  appEnv: import.meta.env.VITE_APP_ENV || 'development',

  agentApiUrl: import.meta.env.VITE_AGENT_API_URL || 'http://127.0.0.1:4000',

  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
};