import { getUserTimezone } from '@oncolife/shared-utils';

const API_BASE = '/api/chat';

export const chatService = {
  getTodaySession: async () => {
    const token = localStorage.getItem('authToken');
    const timezone = getUserTimezone();
    try {
      const response = await fetch(`${API_BASE}/session/today?timezone=${encodeURIComponent(timezone)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat session');
      }

      const data = await response.json();
      return { success: true, status: response.status, data };
    } catch (error) {
      console.error('Failed to fetch chat session:', error);
      throw error;
    }
  },

  sendMessage: async (chatUuid: string, content: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chat_uuid: chatUuid, content })
    });
    return response.json();
  },

  startNewSession: async () => {
    const token = localStorage.getItem('authToken');
    const timezone = getUserTimezone();
    const response = await fetch(`${API_BASE}/session/new?timezone=${encodeURIComponent(timezone)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to start a new chat session');
    }
    const data = await response.json();
    return data;
  },

  logChemoDate: async (chemoDate: Date) => {
    const token = localStorage.getItem('authToken');
    const timezone = getUserTimezone();
    try {
      const response = await fetch(`${API_BASE}/chemo/log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chemo_date: chemoDate.toISOString().split('T')[0],
          timezone: timezone
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('Failed to log chemotherapy date');
      }

      const result = await response.json();
      if (result.error || result.success === false) {
        throw new Error(result.error?.details || 'Failed to log chemotherapy date');
      }

      return result;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
};
