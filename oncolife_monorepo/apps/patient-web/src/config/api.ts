export const API_CONFIG = {
  BASE_URL: '/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/login',
      SIGNUP: '/signup',
      COMPLETE_NEW_PASSWORD: '/complete-new-password',
      LOGOUT: '/logout'
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
