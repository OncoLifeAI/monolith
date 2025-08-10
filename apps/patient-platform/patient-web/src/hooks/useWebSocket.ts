import { useEffect, useRef, useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

export const useWebSocket = (
  chatUuid: string | null,
  onMessage: (message: any) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const onMessageCallback = useCallback(onMessage, [onMessage]);

  const connectWebSocket = useCallback(() => {
    if (!chatUuid) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setConnectionError("Authentication token not found.");
      return;
    }

    // Build WS URL from API base if absolute; else from same-origin + BASE_URL
    const base = API_CONFIG.BASE_URL;
    let wsUrl: string;

    if (/^https?:\/\//i.test(base)) {
      // Absolute API base → convert http(s) → ws(s)
      const wsBase = base.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
      wsUrl = `${wsBase.replace(/\/$/, '')}/chat/ws/${chatUuid}?token=${token}`;
    } else {
      // Relative API base → same-origin
      const { protocol, host } = window.location as any;
      const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
      const prefix = base === '/' ? '' : base.replace(/\/$/, '');
      wsUrl = `${wsProtocol}//${host}${prefix}/chat/ws/${chatUuid}?token=${token}`;
    }

    console.log('Connecting to WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established.');
      setIsConnected(true);
      setConnectionError(null);
      retryCountRef.current = 0; // Reset retry count on successful connection
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket raw message received:', data);
        if (data.type !== 'connection_established') {
            onMessageCallback(data);
        } else {
            console.log("System Message: Connection acknowledged. State:", data.chat_state);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket connection closed.', event.code, event.reason);
      setIsConnected(false);
      
      // Only retry if it's not a normal closure and we haven't exceeded max retries
      if (event.code !== 1000 && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`WebSocket connection failed, retrying... (${retryCountRef.current}/${maxRetries})`);
        retryTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 1000 * retryCountRef.current); // Exponential backoff
      }
    };

    wsRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      setConnectionError('WebSocket connection failed');
    };
  }, [chatUuid, onMessageCallback]);

  useEffect(() => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    if (!chatUuid) {
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    // Add a small delay to ensure authentication is complete
    const connectionTimeout = setTimeout(() => {
      connectWebSocket();
    }, 100); // Reduced from 500ms to 100ms

    return () => {
      clearTimeout(connectionTimeout);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [chatUuid, connectWebSocket]);

  const sendMessage = (content: string, message_type: 'text' | 'button_response' | 'multi_select_response' | 'feeling_response') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = {
        type: "user_message", // This is the wrapper type for the backend
        message_type: message_type,
        content: content,
      };
      console.log('Sending WebSocket message:', payload);
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.error("Cannot send message, WebSocket is not open. State:", wsRef.current?.readyState);
    }
  };

  return { isConnected, sendMessage, connectionError };
};