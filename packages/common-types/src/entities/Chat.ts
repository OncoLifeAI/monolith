import { ChatStatus } from '../enums/ChatStatus';

export interface Chat {
  id: string;
  chatUuid: string;
  patientId: string;
  doctorId?: string;
  status: ChatStatus;
  conversationState: string;
  isNewSession: boolean;
  createdAt: string;
  updatedAt: string;
} 