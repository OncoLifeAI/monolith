export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/api/signup',
      LOGIN: '/api/login',
      LOGOUT: '/api/logout',
      VERIFY: '/api/verify',
      COMPLETE_NEW_PASSWORD: '/api/complete-new-password',
    },
  },
} as const;

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 