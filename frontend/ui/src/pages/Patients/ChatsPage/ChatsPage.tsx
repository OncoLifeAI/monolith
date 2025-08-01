import React, { useEffect, useState, useRef, useCallback } from 'react';
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

  const handleNewMessage = useCallback((wsMessage: any) => {
    console.log('Received WebSocket message:', wsMessage);

    setMessages(prevMessages => {
      if (wsMessage.type === 'message_chunk') {
        setIsThinking(false);
        const messageIndex = prevMessages.findIndex(m => m.id === wsMessage.message_id);
        if (messageIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[messageIndex].content += wsMessage.content;
          return updatedMessages;
        } else {
          const newMessage: Message = {
            id: wsMessage.message_id,
            chat_uuid: chatSession!.chat_uuid,
            sender: 'assistant',
            message_type: 'text',
            content: wsMessage.content,
            created_at: new Date().toISOString(),
          };
          return [...prevMessages, newMessage];
        }
      } else if (wsMessage.type === 'message_end') {
        setIsThinking(false);
        return prevMessages;
      } else if (wsMessage.id) {
        setIsThinking(false);
        return [...prevMessages.filter(m => m.id !== -1 && m.id !== wsMessage.id), wsMessage];
      }
      return prevMessages;
    });
  }, [chatSession]);

  const { isConnected, sendMessage, connectionError } = useWebSocket(
    chatSession?.chat_uuid || null,
    handleNewMessage
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTodaySession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getTodaySession();
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

  useEffect(() => {
    loadTodaySession();
  }, []);

  const handleStartNewConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await chatService.startNewSession();
      setChatSession(sessionData);
      setMessages(sessionData.messages || []);
    } catch (error) {
      setError('Failed to start a new chat session');
      console.error('Failed to start a new chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: -1,
      chat_uuid: chatSession!.chat_uuid,
      sender: 'user',
      message_type: 'text',
      content: content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    if (isConnected) {
      setIsThinking(true);
      sendMessage(content, 'text');
    }
  };

  const handleButtonClick = (option: string) => {
    const userMessage: Message = {
      id: -1,
      chat_uuid: chatSession!.chat_uuid,
      sender: 'user',
      message_type: 'button_response',
      content: option,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    if (isConnected) {
      setIsThinking(true);
      sendMessage(option, 'button_response');
    }
  };

  const handleMultiSelectSubmit = (selections: string[]) => {
    const formattedSelections = selections.join(', ');
    const userMessage: Message = {
      id: -1,
      chat_uuid: chatSession!.chat_uuid,
      sender: 'user',
      message_type: 'multi_select_response',
      content: formattedSelections,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => {
        const newMessages = [...prev];
        let latestAssistantMsgIndex = -1;
        for (let i = newMessages.length - 1; i >= 0; i--) {
            if (newMessages[i].sender === 'assistant') {
                latestAssistantMsgIndex = i;
                break;
            }
        }
        
        if (latestAssistantMsgIndex > -1) {
            newMessages[latestAssistantMsgIndex] = {
                ...newMessages[latestAssistantMsgIndex],
                structured_data: {
                    ...newMessages[latestAssistantMsgIndex].structured_data,
                    selected_options: selections
                }
            };
        }
        return [...newMessages, userMessage];
    });

    if (isConnected) {
      setIsThinking(true);
      sendMessage(formattedSelections, 'multi_select_response');
    }
  };

  const shouldShowTextInput = () => {
    if (!messages || messages.length === 0) return true;
    const lastMessage = messages[messages.length - 1];
    if (isThinking) return false;
    if (lastMessage.sender === 'user') return false;
    return lastMessage.message_type === 'text';
  };

  const latestAssistantMessage = messages.filter(m => m.sender === 'assistant').pop();
  
  if (loading) return <div className="loading">Loading chat...</div>;

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={loadTodaySession}>Retry</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        Chat with Ruby
        <button onClick={handleStartNewConversation} className="new-chat-button">
          New Conversation
        </button>
      </div>
      
      {!isConnected && (
        <div className="connection-status">
          {connectionError ? connectionError : 'Connecting...'}
        </div>
      )}
      
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble
            key={`${message.id}-${message.content.length}`}
            message={message}
            onButtonClick={handleButtonClick}
            onMultiSelectSubmit={handleMultiSelectSubmit}
            isLatestAssistantMessage={message.id === latestAssistantMessage?.id}
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