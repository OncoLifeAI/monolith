import { MessageType } from '../enums/MessageType';

export interface Message {
  id: number;
  chatUuid: string;
  sender: 'user' | 'assistant';
  messageType: MessageType;
  content: string;
  structuredData?: {
    options?: string[];
    selectedOptions?: string[];
    maxSelections?: number;
  };
  createdAt: string;
} 