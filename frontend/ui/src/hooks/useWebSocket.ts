import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (chatUuid: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!chatUuid) return;
    
    const token = localStorage.getItem('authToken');
    const wsUrl = `ws://localhost:8000/chat/ws/${chatUuid}?token=${token}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Intercept and handle system messages, don't show them in the UI
      if (data.type === 'connection_established') {
        console.log('System Message:', data.content, 'State:', data.chat_state);
        return; // Don't pass this to the component state
      }
      setLastMessage(data);
    };
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
    };
    
    wsRef.current.onerror = () => {
      setConnectionError('WebSocket connection failed');
    };
    
    return () => {
      wsRef.current?.close();
    };
  }, [chatUuid]);

  const sendMessage = (message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Determine message type based on whether it came from a button or text input
      const isButtonResponse = ['Yes', 'No', "I had it recently, but didn't record it"].includes(message) || message.includes(',');

      const payload = {
        type: "user_message",
        message_type: isButtonResponse ? "button_response" : "text",
        content: message,
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  return { isConnected, lastMessage, sendMessage, connectionError };
}; 