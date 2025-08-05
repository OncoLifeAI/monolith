import { TreatmentStatus } from '../enums/TreatmentStatus';

export interface Treatment {
  id: string;
  patientId: string;
  doctorId: string;
  name: string;
  description: string;
  status: TreatmentStatus;
  startDate: string;
  endDate?: string;
  medications?: string[];
  instructions?: string;
  createdAt: string;
  updatedAt: string;
} 