export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/signup',
      LOGIN: '/login',
      LOGOUT: '/logout',
      VERIFY: '/verify',
      COMPLETE_NEW_PASSWORD: '/complete-new-password',
    },
    SUMMARIES: '/summaries',
    NOTES: '/notes',
    DASHBOARD: '/dashboard',
    PATIENTS: '/patients',
    STAFF: '/staff',
    PROFILE: '/profile',
    CHAT: '/chat',
    EDUCATION: '/education',
  },
} as const;

export const SESSION_TIMEOUT_MINUTES = 60; // Session timeout in minutes (configurable)

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 