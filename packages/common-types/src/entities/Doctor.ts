export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 