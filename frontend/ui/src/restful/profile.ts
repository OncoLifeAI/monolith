import { apiClient } from '../utils/apiClient';
import type { ProfileData, ProfileFormData } from '../pages/Patients/ProfilePage/types';
import { useQuery } from '@tanstack/react-query';

export const fetchProfile = async () => {
  const response = await apiClient.get('/profile');
  return response.data;
};

export const useFetchProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
};