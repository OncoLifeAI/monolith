import { getUserTimezone } from '@oncolife/shared-utils';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

export const chatService = {
  getTodaySession: async () => {
    const timezone = getUserTimezone();
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.CHAT.SESSION_TODAY}?timezone=${encodeURIComponent(timezone)}`
    );
    return { success: true, status: response.status, data: response.data };
  },

  sendMessage: async (chatUuid: string, content: string) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CHAT.MESSAGE, {
      chat_uuid: chatUuid,
      content,
    });
    return response.data;
  },

  startNewSession: async () => {
    const timezone = getUserTimezone();
    const response = await apiClient.post(
      `${API_CONFIG.ENDPOINTS.CHAT.SESSION_NEW}?timezone=${encodeURIComponent(timezone)}`
    );
    return response.data;
  },

  logChemoDate: async (chemoDate: Date) => {
    const timezone = getUserTimezone();
    // Format date in local timezone to prevent timezone conversion issues
    const year = chemoDate.getFullYear();
    const month = String(chemoDate.getMonth() + 1).padStart(2, '0');
    const day = String(chemoDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CHAT.CHEMO_LOG, {
      chemo_date: dateString,
      timezone,
    });
    return response.data;
  },
};
