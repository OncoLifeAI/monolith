import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '@patient-portal/common-types';
import { MessageType } from '@patient-portal/common-types';
import { MessageInput, ThinkingBubble } from '@patient-portal/ui-components';
import { MessageBubble } from '../../../components/chat/MessageBubble';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { chatService } from '../../../services/chatService';
import { CalendarModal } from '../../../components/chat/CalendarModal';
import '../../../components/chat/Chat.css';

interface ChatSession {
  chatUuid: string;
  conversationState: string;
  messages?: Message[];
}

const ChatsPage: React.FC = () => {
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = (wsMessage: any) => {
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
            chatUuid: chatSession!.chatUuid,
            sender: 'assistant',
            messageType: MessageType.TEXT,
            content: wsMessage.content,
            createdAt: new Date().toISOString(),
          };
          return [...prevMessages, newMessage];
        }
      } else if (wsMessage.type === 'message_end') {
        setIsThinking(false);
        return prevMessages;
      } else if (wsMessage.id) {
        setIsThinking(false);
        
        // Check if this is a final summary message (indicates conversation completion)
        if (wsMessage.content && wsMessage.content.includes('Thank you for completing this chat!')) {
          // Update the chat session state to COMPLETED
          setChatSession(prev => prev ? { ...prev, conversationState: 'COMPLETED' } : null);
        }
        
        return [...prevMessages.filter(m => m.id !== -1 && m.id !== wsMessage.id), wsMessage];
      }
      return prevMessages;
    });
  };

  const { isConnected, sendMessage, connectionError } = useWebSocket(
    chatSession?.chatUuid || null,
    handleNewMessage
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTodaySession = async () => {
    try {
      setLoading(true);
      const response = await chatService.getTodaySession();
      const sessionData = (response as any).data;
      
      if (sessionData) {
        setChatSession(sessionData as ChatSession);
        setMessages((sessionData as ChatSession).messages || []);
      } else {
        // No session exists for today, create a new one
        await startNewSession();
      }
    } catch (error) {
      console.error('Error fetching today session:', error);
      // If there's an error, try to create a new session
      await startNewSession();
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = async () => {
    try {
      setLoading(true);
      const sessionData = await chatService.startNewSession();
      
      if (sessionData) {
        setChatSession(sessionData as ChatSession);
        setMessages((sessionData as ChatSession).messages || []);
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Failed to create chat session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySession();
  }, []);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: -1,
      chatUuid: chatSession!.chatUuid,
      sender: 'user',
      messageType: MessageType.TEXT,
      content: content,
      createdAt: new Date().toISOString(),
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
          const today = new Date();
          console.log('[CHEMO DEBUG] Today in user timezone:', today.toISOString().split('T')[0]);
          
          await chatService.logChemoDate(today);
          console.log('[CHEMO DEBUG] Successfully logged chemotherapy date for today');
        } catch (error) {
          console.error('[CHEMO DEBUG] Failed to log chemotherapy date:', error);
        }
      } else {
        console.log('[CHEMO DEBUG] Condition not met - not logging chemo date');
      }
    }

    // Regular message handling
    const userMessage: Message = {
      id: -1,
      chatUuid: chatSession!.chatUuid,
      sender: 'user',
      messageType: MessageType.BUTTON_RESPONSE,
      content: option,
      createdAt: new Date().toISOString(),
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
      chatUuid: chatSession!.chatUuid,
      sender: 'user',
      messageType: MessageType.MULTI_SELECT_RESPONSE,
      content: formattedSelections,
      createdAt: new Date().toISOString(),
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
                structuredData: {
                    ...newMessages[latestAssistantMsgIndex].structuredData,
                    selectedOptions: selections
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
      chatUuid: chatSession!.chatUuid,
      sender: 'user',
      messageType: MessageType.FEELING_RESPONSE,
      content: feeling,
      createdAt: new Date().toISOString(),
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
        chatUuid: chatSession!.chatUuid,
        sender: 'user',
        messageType: MessageType.BUTTON_RESPONSE,
        content: `Yes, I got chemotherapy on ${dateString}`,
        createdAt: new Date().toISOString(),
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
        chatUuid: chatSession!.chatUuid,
        sender: 'user',
        messageType: MessageType.BUTTON_RESPONSE,
        content: `Yes, I got chemotherapy on ${selectedDate.toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
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
    if (chatSession?.conversationState === 'COMPLETED' || chatSession?.conversationState === 'EMERGENCY') {
      return false;
    }
    
    if (!messages || messages.length === 0) return true;
    const lastMessage = messages[messages.length - 1];
    if (isThinking) return false;
    if (lastMessage.sender === 'user') return false;
    // Hide for any message type that expects a button/interactive response
    if ([MessageType.SINGLE_SELECT, MessageType.MULTI_SELECT, MessageType.FEELING_SELECT].includes(lastMessage.messageType)) {
      return false;
    }
    return lastMessage.messageType === MessageType.TEXT;
  };

  const latestAssistantMessage = messages.filter(m => m.sender === 'assistant').pop();
  
  if (loading) return <div className="loading">Loading chat...</div>;

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchTodaySession}>Retry</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>Chat with Ruby</span>
        <button onClick={startNewSession} className="new-conversation-button">
          <span className="new-conversation-icon">+</span>
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
            onOptionSelect={handleButtonClick}
            onMultiSelectChange={handleMultiSelectSubmit}
            onFeelingSelect={handleFeelingSelect}
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