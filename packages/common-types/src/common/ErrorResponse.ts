export interface ErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: any;
} 