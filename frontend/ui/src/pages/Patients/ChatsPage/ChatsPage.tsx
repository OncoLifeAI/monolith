import React, { useEffect, useState, useRef } from 'react';
import { MessageBubble } from '../../../components/chat/MessageBubble';
import { MessageInput } from '../../../components/chat/MessageInput';
import { ThinkingBubble } from '../../../components/chat/ThinkingBubble';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { chatService } from '../../../services/chatService';
import type { ChatSession, Message } from '../../../types/chat';
import '../../../components/chat/Chat.css';

const ChatsPage: React.FC = () => {
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, lastMessage, sendMessage, connectionError } = useWebSocket(
    chatSession?.chat_uuid || null
  );

  // Load today's session on component mount
  useEffect(() => {
    loadTodaySession();
  }, []);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      setIsThinking(false);
      setMessages(prev => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTodaySession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getTodaySession();
      // The actual session data is in the `data` property of the response
      const sessionData = response.data;
      setChatSession(sessionData);
      setMessages(sessionData.messages || []);
    } catch (error) {
      setError('Failed to load chat session');
      console.error('Failed to load chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (content: string) => {
    // Optimistically add the user's text message to the UI
    const userMessage: Message = {
      id: -1, // A temporary ID for the key, will be replaced by the server's ID
      chat_uuid: chatSession!.chat_uuid,
      sender: 'user',
      message_type: 'text', // This is a standard text message
      content: content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    if (isConnected) {
      setIsThinking(true);
      sendMessage(content);
    }
  };

  const handleButtonClick = (option: string) => {
    // Optimistically add the user's response to the UI
    const userMessage: Message = {
      id: -1, // A temporary ID for the key
      chat_uuid: chatSession!.chat_uuid,
      sender: 'user',
      message_type: 'button_response',
      content: option,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    if (isConnected) {
      setIsThinking(true);
      sendMessage(option);
    } else {
      console.log(`Button clicked with option: "${option}". Connection is NOT active.`);
    }
  };

  const handleMultiSelectSubmit = (selections: string[]) => {
    // Optimistically add the user's response to the UI
    const userMessage: Message = {
      id: -1, // A temporary ID for the key
      chat_uuid: chatSession!.chat_uuid,
      sender: 'user',
      message_type: 'multi_select_response',
      content: selections.join(', '),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    if (isConnected) {
      setIsThinking(true);
      const formattedSelections = selections.join(', ');
      sendMessage(formattedSelections);
    }
  };

  // Determine if text input should be shown
  const shouldShowTextInput = () => {
    if (messages.length === 0) return true;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === 'user') return false;
    
    return lastMessage.message_type === 'text';
  };

  // Get the latest assistant message for interactive elements
  const getLatestAssistantMessage = (): Message | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'assistant') {
        return messages[i];
      }
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={loadTodaySession}>Retry</button>
      </div>
    );
  }

  const latestAssistantMessage = getLatestAssistantMessage();

  return (
    <div className="chat-container">
      <div className="chat-header">
        Chat with Ruby
      </div>
      
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="connection-status">
          {connectionError ? connectionError : 'Connecting...'}
        </div>
      )}
      
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onButtonClick={handleButtonClick}
            onMultiSelectSubmit={handleMultiSelectSubmit}
            isLatestAssistantMessage={message.id === latestAssistantMessage?.id && !isThinking}
          />
        ))}
        {isThinking && <ThinkingBubble />}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={!isConnected || isThinking}
        shouldShow={shouldShowTextInput()}
      />
    </div>
  );
};

export default ChatsPage; 