import { apiClient } from '../utils/apiClient';
import { useQuery } from '@tanstack/react-query';

export const fetchProfile = async () => {
  const response = await apiClient.get('/profile');
  return response.data;
};

export const useFetchProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: options?.enabled ?? true,
  });
};