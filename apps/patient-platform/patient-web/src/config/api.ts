const BASE_URL = import.meta.env.VITE_API_BASE || '/api';

export const API_CONFIG = {
  BASE_URL,
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
    },
    PATIENT: {
      UPDATE_CONSENT: '/patient/update-consent'
    }
  }
};
