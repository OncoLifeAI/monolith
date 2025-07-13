export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/api/signup',
      LOGIN: '/api/login',
      LOGOUT: '/api/logout',
      VERIFY: '/api/verify',
    },
  },
} as const;

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 