export interface Staff {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 