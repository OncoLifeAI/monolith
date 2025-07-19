import { apiClient } from '../utils/apiClient';
import type { ProfileData, ProfileFormData } from '../pages/ProfilePage/types';

export const useProfile = () => {
  const getProfile = async (): Promise<ProfileData> => {
    try {
      const response = await apiClient.get('/profile');
      return response.data as ProfileData;
    } catch (error) {
      throw new Error('Failed to fetch profile data');
    }
  };

  const updateProfile = async (profileData: ProfileFormData): Promise<ProfileData> => {
    try {
      const response = await apiClient.put('/profile', profileData);
      return response.data as ProfileData;
    } catch (error) {
      throw new Error('Failed to update profile data');
    }
  };

  const uploadProfileImage = async (file: File): Promise<{ imageUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.post('/profile/image', formData);
      
      return response.data as { imageUrl: string };
    } catch (error) {
      throw new Error('Failed to upload profile image');
    }
  };

  return {
    getProfile,
    updateProfile,
    uploadProfileImage,
  };
}; 