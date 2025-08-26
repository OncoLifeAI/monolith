import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

interface SignUpData {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

interface SignUpResponse {
  success: boolean;
  message: string;
  data?: {
    message: string;
    email: string;
    user_status: string;
    staff_uuid: string;
  };
}

const signUpUser = async (data: SignUpData): Promise<SignUpResponse> => {
  const response = await apiClient.post<SignUpResponse>(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {...data, role: 'doctor'});
  return response.data;
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: signUpUser,
    onSuccess: (data) => {
      // Handle successful signup - doctor signup doesn't return tokens
      console.log('Doctor signup successful:', data);
    },
    onError: (error) => {
      console.error('Signup error:', error);
    },
  });
};
