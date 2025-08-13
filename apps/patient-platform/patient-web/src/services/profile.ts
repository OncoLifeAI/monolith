import { apiClient } from '../utils/apiClient';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

const PROFILE_CACHE_KEY = 'profileCache';

export interface Profile {
  first_name?: string;
  last_name?: string;
  email_address?: string;
  [key: string]: any;
}

export const fetchProfile = async (): Promise<Profile> => {
  const response = await apiClient.get('/profile');
  return response.data as Profile;
};

export const useFetchProfile = (options?: { enabled?: boolean }) =>
  useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data: Profile) => {
      try {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
      } catch {}
    }
  } as UseQueryOptions<Profile>);

export const getCachedProfile = (): Profile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
};