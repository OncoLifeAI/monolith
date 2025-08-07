import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { MessageInput } from '../../components/chat/MessageInput';
import { ThinkingBubble } from '../../components/chat/ThinkingBubble';
import { CalendarModal } from '../../components/chat/CalendarModal';
import { useWebSocket } from '../../hooks/useWebSocket';
import { chatService } from '../../services/chatService';
import { getTodayInUserTimezone } from '@oncolife/shared-utils';
import type { ChatSession, Message } from '../../types/chat';
import '../../components/chat/Chat.css';

const ChatsPage: React.FC = () => {
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((wsMessage: any) => {
    console.log('Received WebSocket message:', wsMessage);

    setMessages(prevMessages => {
      if (wsMessage.type === 'message_chunk') {
        console.log('Processing message chunk:', wsMessage);
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
        console.log('Processing message end:', wsMessage);
        setIsThinking(false);
        return prevMessages;
      } else if (wsMessage.id) {
        console.log('Processing complete message:', wsMessage);
        setIsThinking(false);
        
        // Check if this is a final summary message (indicates conversation completion)
        if (wsMessage.content && wsMessage.content.includes('Thank you for completing this chat!')) {
          // Update the chat session state to COMPLETED
          setChatSession(prev => prev ? { ...prev, conversation_state: 'COMPLETED' } : null);
        }
        
        return [...prevMessages.filter(m => m.id !== -1 && m.id !== wsMessage.id), wsMessage];
      }
      console.log('No matching message type, returning previous messages');
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
      const sessionData = response.data.data;
      
      // Set chat session immediately to start WebSocket connection
      setChatSession(sessionData);
      
      // Set messages after session is set
      setMessages(sessionData.messages || []);
      
      // Stop loading once we have session data (don't wait for WebSocket)
      setLoading(false);
    } catch (error) {
      setError('Failed to load chat session');
      console.error('Failed to load chat session:', error);
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

  const handleButtonClick = async (option: string) => {
    // Handle special chemo date responses
    if (option === "I had it recently, but didn't record it") {
      setIsCalendarModalOpen(true);
      return;
    }

    if (option === "Yes" && messages.length > 0) {
      // Check if this is the first question about chemotherapy
      const lastMessage = messages[messages.length - 1];
      console.log('[CHEMO DEBUG] Last message content:', lastMessage.content);
      console.log('[CHEMO DEBUG] Checking if contains "chemotherapy today":', lastMessage.content.toLowerCase().includes('chemotherapy today'));
      console.log('[CHEMO DEBUG] Checking if contains "did you get chemotherapy":', lastMessage.content.toLowerCase().includes('did you get chemotherapy'));
      
      if (lastMessage.content.toLowerCase().includes('did you get chemotherapy')) {
        try {
          console.log('[CHEMO DEBUG] Attempting to log chemotherapy date for today');
          // Get today's date in user's timezone
          const todayInUserTz = getTodayInUserTimezone();
          console.log('[CHEMO DEBUG] Today in user timezone:', todayInUserTz.toISOString().split('T')[0]);
          
          const chemoResult = await chatService.logChemoDate(todayInUserTz);
          console.log('[CHEMO DEBUG] Successfully logged chemotherapy date for today:', chemoResult);
        } catch (error) {
          console.error('[CHEMO DEBUG] Failed to log chemotherapy date:', error);
          // Don't throw the error, just log it and continue with the chat
        }
      } else {
        console.log('[CHEMO DEBUG] Condition not met - not logging chemo date');
      }
    }

    // Regular message handling
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

  const handleFeelingSelect = (feeling: string) => {
    // Optimistically add the user's feeling selection as a message
    const userMessage: Message = {
      id: -1,
      chat_uuid: chatSession!.chat_uuid,
      sender: 'user',
      message_type: 'feeling_response',
      content: feeling,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Send the feeling to the backend
    if (isConnected) {
      setIsThinking(true);
      sendMessage(feeling, 'feeling_response');
    }
  };

  const handleCalendarDateSelect = async (selectedDate: Date) => {
    try {
      // Log the selected chemo date
      await chatService.logChemoDate(selectedDate);
      console.log('Logged chemotherapy date:', selectedDate);

      // Format the date for display in user's timezone
      const dateString = selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Create a message showing the selected date
      const userMessage: Message = {
        id: -1,
        chat_uuid: chatSession!.chat_uuid,
        sender: 'user',
        message_type: 'button_response',
        content: `Yes, I got chemotherapy on ${dateString}`,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      if (isConnected) {
        setIsThinking(true);
        sendMessage(`Yes, I got chemotherapy on ${dateString}`, 'button_response');
      }
    } catch (error) {
      console.error('Failed to log chemotherapy date:', error);
      // Still add the message even if logging fails
      const userMessage: Message = {
        id: -1,
        chat_uuid: chatSession!.chat_uuid,
        sender: 'user',
        message_type: 'button_response',
        content: `Yes, I got chemotherapy on ${selectedDate.toLocaleDateString()}`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      if (isConnected) {
        setIsThinking(true);
        sendMessage(`Yes, I got chemotherapy on ${selectedDate.toLocaleDateString()}`, 'button_response');
      }
    }
  };

  const shouldShowTextInput = () => {
    // Never show input if the conversation is over
    if (chatSession?.conversation_state === 'COMPLETED' || chatSession?.conversation_state === 'EMERGENCY') {
      return false;
    }
    
    if (!messages || messages.length === 0) return true;
    const lastMessage = messages[messages.length - 1];
    if (isThinking) return false;
    if (lastMessage.sender === 'user') return false;
    // Hide for any message type that expects a button/interactive response
    if (['single-select', 'multi-select', 'feeling-select'].includes(lastMessage.message_type)) {
      return false;
    }
    return lastMessage.message_type === 'text';
  };

  const shouldShowInteractiveElements = (message: Message, index: number): boolean => {
    // Only show interactive elements if this is an assistant message
    if (message.sender !== 'assistant') return false;
    
    // Check if there's a user message after this assistant message
    for (let i = index + 1; i < messages.length; i++) {
      if (messages[i].sender === 'user') {
        return false; // User has already responded, don't show buttons
      }
    }
    
    // This is the latest assistant message with no user response
    return true;
  };

  
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
        <span>Chat with Ruby</span>
        <button onClick={handleStartNewConversation} className="new-conversation-button">
          <span className="new-conversation-icon">+</span>
          New Conversation
        </button>
      </div>
      
      {!isConnected && (
        <div className="connection-status">
          {connectionError ? (
            <div className="connection-error">
              <span>⚠️ {connectionError}</span>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <div className="connection-loading">
              <span>Connecting to chat...</span>
            </div>
          )}
        </div>
      )}
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.id}-${message.content.length}`}
            message={message}
            onButtonClick={handleButtonClick}
            onMultiSelectSubmit={handleMultiSelectSubmit}
            onFeelingSelect={handleFeelingSelect}
            shouldShowInteractiveElements={shouldShowInteractiveElements(message, index)}
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

      {/* Calendar Modal for selecting chemo dates */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onDateSelect={handleCalendarDateSelect}
      />
    </div>
  );
};

export default ChatsPage; 