export interface Summary {
  id: string;
  patientId: string;
  title: string;
  content: string;
  summaryType: string;
  date: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
} 