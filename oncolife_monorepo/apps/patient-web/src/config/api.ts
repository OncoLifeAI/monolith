export const API_CONFIG = {
  BASE_URL: '/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      COMPLETE_NEW_PASSWORD: '/auth/complete-new-password',
      LOGOUT: '/auth/logout'
    },
    PROFILE: '/profile',
    NOTES: '/notes',
    SUMMARIES: '/summaries',
    CHAT: {
      SESSION_TODAY: '/chat/session/today',
      MESSAGE: '/chat/message',
      SESSION_NEW: '/chat/session/new',
      CHEMO_LOG: '/chemo/log'
    }
  }
};
