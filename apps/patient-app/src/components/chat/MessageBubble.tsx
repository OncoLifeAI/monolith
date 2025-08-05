import React from 'react';
import styled from 'styled-components';
import type { Message } from '@patient-portal/common-types';
import { MessageType } from '@patient-portal/common-types';
import { formatTimeForDisplay } from '@patient-portal/utils-lib';
import { MultiSelectMessage } from './MultiSelectMessage';
import { FeelingSelector } from './FeelingSelector';

interface MessageBubbleProps {
  message: Message;
  onFeelingSelect?: (feeling: string) => void;
  onOptionSelect?: (option: string) => void;
  onMultiSelectChange?: (selectedOptions: string[]) => void;
  isLatestAssistantMessage?: boolean;
}

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: 8px 0;
`;

const Bubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${props => props.isUser ? '#007bff' : '#f1f3f4'};
  color: ${props => props.isUser ? 'white' : '#333'};
  word-wrap: break-word;
  position: relative;
`;

const TimeStamp = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
  text-align: right;
`;

const InteractiveContainer = styled.div`
  margin-top: 8px;
`;

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onFeelingSelect,
  onOptionSelect,
  onMultiSelectChange,
  isLatestAssistantMessage = false,
}) => {
  const isUser = message.sender === 'user';

  const shouldShowInteractiveElements = isLatestAssistantMessage && !isUser;

  const renderInteractiveElements = () => {
    switch (message.messageType) {
      case MessageType.TEXT:
        if (shouldShowInteractiveElements && message.structuredData?.options && (
          message.structuredData.options.length > 0
        )) {
          return (
            <InteractiveContainer>
              {message.structuredData.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => onOptionSelect?.(option)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    margin: '4px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {option}
                </button>
              ))}
            </InteractiveContainer>
          );
        }
        break;

      case MessageType.MULTI_SELECT:
        if (shouldShowInteractiveElements && message.structuredData) {
          return (
            <MultiSelectMessage
              message={message}
              onSelectionChange={onMultiSelectChange}
            />
          );
        }
        break;

      case MessageType.FEELING_SELECT:
        if (shouldShowInteractiveElements) {
          return (
            <FeelingSelector onSelectFeeling={onFeelingSelect || (() => {})} />
          );
        }
        break;

      case MessageType.FEELING_RESPONSE:
        return (
          <div style={{ fontStyle: 'italic', color: '#666' }}>
            Thank you for sharing your feeling!
          </div>
        );
    }
    return null;
  };

  return (
    <MessageContainer isUser={isUser}>
      <Bubble isUser={isUser}>
        <div>{message.content}</div>
        {renderInteractiveElements()}
        <TimeStamp>
          {formatTimeForDisplay(message.createdAt)}
        </TimeStamp>
      </Bubble>
    </MessageContainer>
  );
}; 