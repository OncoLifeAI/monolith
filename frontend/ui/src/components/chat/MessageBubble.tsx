import React from 'react';
import type { Message } from '../../types/chat';
import { MultiSelectMessage } from './MultiSelectMessage';

interface MessageBubbleProps {
  message: Message;
  onButtonClick?: (option: string) => void;
  onMultiSelectSubmit?: (selections: string[]) => void;
  isLatestAssistantMessage?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onButtonClick, 
  onMultiSelectSubmit,
  isLatestAssistantMessage = false
}) => {
  const isUser = message.sender === 'user';
  
  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'button_prompt':
        return (
          <>
            <div className="message-content">{message.content}</div>
            {/* Only show buttons for the latest assistant message */}
            {isLatestAssistantMessage && message.structured_data?.options && (
              <div className="button-options">
                {message.structured_data.options.map((option, index) => (
                  <button 
                    key={index} 
                    onClick={() => onButtonClick?.(option)}
                    className="option-button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </>
        );
      
      case 'multi_select':
        return (
          <>
            <div className="message-content">{message.content}</div>
            {/* Only show multi-select for the latest assistant message */}
            {isLatestAssistantMessage && (
              <MultiSelectMessage
                message={message}
                onSubmitSelections={onMultiSelectSubmit || (() => {})}
              />
            )}
          </>
        );
      
      case 'text':
      default:
        return <div className="message-content">{message.content}</div>;
    }
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      {renderMessageContent()}
      <div className="message-time">
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}; 