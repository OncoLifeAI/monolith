import type { Message } from '@patient-portal/common-types';
import { MultiSelectMessage } from './MultiSelectMessage';
import { FeelingSelector } from './FeelingSelector';
import { formatTimeForDisplay } from '@patient-portal/utils-lib';
import './FeelingSelector.css';

interface MessageBubbleProps {
  message: Message;
  onOptionSelect?: (option: string) => void;
  onMultiSelectSubmit?: (selections: string[]) => void;
  onFeelingSelect?: (feeling: string) => void;
  shouldShowInteractiveElements?: boolean;
}

export const MessageBubble = ({
  message,
  onOptionSelect,
  onFeelingSelect,
  onMultiSelectSubmit,
  shouldShowInteractiveElements = true,
}: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'single-select':
      case 'button_prompt': // Backwards compatibility
        return (
          <>
            <div className="message-content">{message.content}</div>
            {shouldShowInteractiveElements && message.structuredData?.options && (
              <div className="button-options">
                {message.structuredData.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => onOptionSelect?.(option)}
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
      case 'text':
      case 'button_response':
      case 'multi_select_response':
      case 'feeling_response':
      default:
        // For feeling_response, render the image instead of text
        if (message.messageType === 'feeling_response') {
          const feelingImages: { [key: string]: string } = {
            'Very Happy': '/src/assets/VeryHappy.png',
            'Happy': '/src/assets/Happy.png',
            'Neutral': '/src/assets/Neutral.png',
            'Sad': '/src/assets/Sad.png',
            'Very Sad': '/src/assets/VerySad.png',
          };
          const imageSrc = feelingImages[message.content];
          return (
            <div className="feeling-response-image">
              <img src={imageSrc} alt={message.content} style={{ width: '60px', height: '60px' }}/>
            </div>
          );
        }
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
        {formatTimeForDisplay(message.createdAt)}
      </div>
    </div>
  );
}; 