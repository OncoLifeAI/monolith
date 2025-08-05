export interface Symptom {
  id: string;
  name: string;
  description?: string;
  severity: 'mild' | 'moderate' | 'severe';
  onsetDate: string;
  duration?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 