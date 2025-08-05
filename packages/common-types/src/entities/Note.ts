import { NoteStatus } from '../enums/NoteStatus';
import { Priority } from '../enums/Priority';

export interface Note {
  id: string;
  patientId: string;
  doctorId?: string;
  title: string;
  content: string;
  status: NoteStatus;
  priority: Priority;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
} 