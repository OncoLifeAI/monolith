import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

interface LoginData {
  email: string;
  password: string;
}

interface CompleteNewPasswordData {
  email: string;
  newPassword: string;
}

interface CompleteNewPasswordResponse {
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
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user_status?: string;
    message?: string;
    session?: string;
    requiresPasswordChange?: boolean;
  };
}

const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data);
  return response.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {

      if (data.data?.session) {
        localStorage.setItem('authToken', data.data.session);
      }
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
    session: localStorage.getItem('authToken'),
  }
  const response = await apiClient.post<CompleteNewPasswordResponse>(API_CONFIG.ENDPOINTS.AUTH.COMPLETE_NEW_PASSWORD, newData);
  return response.data;
};

export const useCompleteNewPassword = () => {
  return useMutation({
    mutationFn: completeNewPassword,
    onSuccess: (data) => {
      if (data.data?.tokens) {
        localStorage.setItem('authToken', data.data.tokens.access_token);
        localStorage.setItem('refreshToken', data.data.tokens.refresh_token);
      }
    },
    onError: (error) => {
      console.error('New password reset error:', error);
    },
  });
};