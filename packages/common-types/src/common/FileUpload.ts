export interface FileUpload {
  file: File;
  progress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
} 