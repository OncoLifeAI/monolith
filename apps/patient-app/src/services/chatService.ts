import { apiClient, API_CONFIG } from '@patient-portal/api-client';

// Simple timezone function
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const chatService = {
  // Get today's chat session
  async getTodaySession() {
    const timezone = getUserTimezone();
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CHAT}/session/today?timezone=${encodeURIComponent(timezone)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching today session:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(chatUuid: string, content: string) {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.CHAT}/message`, {
        chat_uuid: chatUuid,
        content,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Create a new chat session
  async startNewSession() {
    const timezone = getUserTimezone();
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.CHAT}/session/new?timezone=${encodeURIComponent(timezone)}`);
      return response.data;
    } catch (error) {
      console.error('Error creating new session:', error);
      throw error;
    }
  },

  // Log chemo-related data
  async logChemoDate(data: any) {
    try {
      console.log('[CHEMO DEBUG] API URL:', `${API_CONFIG.ENDPOINTS.CHAT}/chemo/log`);
      console.log('[CHEMO DEBUG] Data being sent:', data);
      
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.CHAT}/chemo/log`, data);
      return response.data;
    } catch (error) {
      console.error('Error logging chemo date:', error);
      throw error;
    }
  },
}; 