import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      name: string;
      role: string;
    };
    token?: string;
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
      // Handle successful login
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};
