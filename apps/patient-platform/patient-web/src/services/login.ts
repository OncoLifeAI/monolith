import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';
import { PATIENT_STORAGE_KEYS } from '../utils/storageKeys';

interface LoginData {
  email: string;
  password: string;
}

interface CompleteNewPasswordData {
  email: string;
  newPassword: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  email: string;
  confirmation_code: string;
  new_password: string;
}

export interface CompleteNewPasswordResponse {
  success: boolean;
  message: string;
  data?: {
  tokens?: {
      access_token: string;
      refresh_token: string;
      id_token: string;
      token_type: string;
    };
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
  };
}
export interface LoginResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    user_status?: string;
    message?: string;
    session?: string;
    requiresPasswordChange?: boolean;
    tokens?: {
      access_token: string;
      refresh_token: string;
      id_token: string;
      token_type: string;
    };
  };
}

const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data);
  return response.data;
};

// Helper to determine if we should use localStorage (dev) or rely on cookies (prod)
const shouldUseLocalStorage = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Only use localStorage in development
      if (shouldUseLocalStorage()) {
        if (data.data?.session) {
          localStorage.setItem(PATIENT_STORAGE_KEYS.authToken, data.data.session);
        }
        if (data.data?.tokens) {
          localStorage.setItem(PATIENT_STORAGE_KEYS.authToken, data.data.tokens.access_token);
          if (data.data.tokens.refresh_token) {
            localStorage.setItem(PATIENT_STORAGE_KEYS.refreshToken, data.data.tokens.refresh_token);
          }
        }
      }
      // In production, tokens are handled via HTTP-only cookies by the server
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

const completeNewPassword = async (data: CompleteNewPasswordData): Promise<CompleteNewPasswordResponse> => {
  const newData = {
    email: data?.email,
    new_password: data?.newPassword,
    session: shouldUseLocalStorage() ? localStorage.getItem(PATIENT_STORAGE_KEYS.authToken) : undefined,
  }
  const response = await apiClient.post<CompleteNewPasswordResponse>(API_CONFIG.ENDPOINTS.AUTH.COMPLETE_NEW_PASSWORD, newData);
  return response.data;
};

export const useCompleteNewPassword = () => {
  return useMutation({
    mutationFn: completeNewPassword,
    onSuccess: (data) => {
      // Only use localStorage in development
      if (shouldUseLocalStorage() && data.data?.tokens) {
        localStorage.setItem(PATIENT_STORAGE_KEYS.authToken, data.data.tokens.access_token);
        localStorage.setItem(PATIENT_STORAGE_KEYS.refreshToken, data.data.tokens.refresh_token);
      }
      // In production, tokens are handled via HTTP-only cookies by the server
    },
    onError: (error) => {
      console.error('New password reset error:', error);
    },
  });
};

interface LogoutResponse {
  success: boolean;
  message: string;
}

const logoutUser = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};


export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Always clear localStorage (for development and backward compatibility)
      localStorage.removeItem(PATIENT_STORAGE_KEYS.authToken);
      localStorage.removeItem(PATIENT_STORAGE_KEYS.refreshToken);
      // In production, cookies are cleared by the server
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
};

const forgotPassword = async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  return response.data;
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      console.log('Forgot password request sent successfully:', data.message);
    },
    onError: (error) => {
      console.error('Forgot password error:', error);
    },
  });
};

const resetPassword = async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, data);
  return response.data;
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      console.log('Password reset successfully:', data.message);
    },
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};