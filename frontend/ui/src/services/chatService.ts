const API_BASE = 'http://localhost:3000/api/chat';

export const chatService = {
  getTodaySession: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/session/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch chat session');
    }
    return response.json();
  },

  startNewSession: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/session/new`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to start a new chat session');
    }
    return response.json();
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
  }
}; 