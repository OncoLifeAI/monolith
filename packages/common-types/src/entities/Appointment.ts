import { AppointmentStatus } from '../enums/AppointmentStatus';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 