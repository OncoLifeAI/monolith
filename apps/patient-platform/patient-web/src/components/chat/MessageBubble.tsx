import React from 'react';
import type { Message } from '../../types/chat';
import { MultiSelectMessage } from './MultiSelectMessage';
import { FeelingSelector } from './FeelingSelector';
import { formatTimeForDisplay } from '@oncolife/shared-utils';
import './FeelingSelector.css';

// Import feeling images
import VeryHappy from '../../assets/VeryHappy.png';
import Happy from '../../assets/Happy.png';
import Neutral from '../../assets/Neutral.png';
import Sad from '../../assets/Sad.png';
import VerySad from '../../assets/VerySad.png';

interface MessageBubbleProps {
  message: Message;
  onButtonClick?: (option: string) => void;
  onMultiSelectSubmit?: (selections: string[]) => void;
  onFeelingSelect?: (feeling: string) => void;
  shouldShowInteractiveElements?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onButtonClick, 
  onMultiSelectSubmit,
  onFeelingSelect,
  shouldShowInteractiveElements = false
}) => {
  const isUser = message.sender === 'user';
  
  // Create feeling image mapping
  const feelingImages: { [key: string]: string } = {
    'Very Happy': VeryHappy,
    'Happy': Happy,
    'Neutral': Neutral,
    'Sad': Sad,
    'Very Sad': VerySad,
  };
  
  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'single-select':
      case 'button_prompt': // Backwards compatibility
        return (
          <>
            <div className="message-content">{message.content}</div>
            {shouldShowInteractiveElements && message.structured_data?.options && (
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
      case 'multi-select':
        return (
          <>
            <div className="message-content">{message.content}</div>
            {shouldShowInteractiveElements && (
              <MultiSelectMessage
                message={message}
                onSubmitSelections={onMultiSelectSubmit || (() => {})}
              />
            )}
          </>
        );
      case 'feeling-select':
        return (
          <>
            <div className="message-content">{message.content}</div>
            {shouldShowInteractiveElements && (
              <FeelingSelector onSelectFeeling={onFeelingSelect || (() => {})} />
            )}
          </>
        );
      case 'feeling_response':
      case 'feeling-response': {
        // For feeling responses (underscore or hyphen), render the face image only
          const imageSrc = feelingImages[message.content];
        if (imageSrc) {
          return (
            <div className="feeling-response-display">
              <img src={imageSrc} alt={message.content} className="feeling-response-image" />
            </div>
          );
        }
        // Fallback to text if image not found
        return <div className="message-content">{message.content}</div>;
      }
      case 'text':
      case 'button_response':
      case 'multi_select_response':
      default:
        const isHtml = /<\/?[a-z][\s\S]*>/i.test(message.content);
        return isHtml ? (
          <div
            className="message-content"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        ) : (
          <div className="message-content">{message.content}</div>
        );
    }
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      {renderMessageContent()}
      <div className="message-time">
        {formatTimeForDisplay(message.created_at)}
      </div>
    </div>
  );
}; 