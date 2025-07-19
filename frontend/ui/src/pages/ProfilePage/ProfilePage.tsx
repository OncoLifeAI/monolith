import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import {
  ProfileContainer,
  ProfileHeader as ProfileHeaderStyled,
  ProfileTitle,
  ProfileContent,
  ProfileCard,
  LoadingContainer,
  ErrorContainer,
} from './ProfilePage.styles';
import { ProfileHeader, PersonalInformation } from './components';
import type { ProfileData, ProfileFormData } from './types';

// Mock data - replace with actual API call
const mockProfileData: ProfileData = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'Jondoe34@gmail.com',
  phoneNumber: '+93 30974743348',
  dateOfBirth: '17 January, 2001',
  doctor: 'Dermatologist',
  clinic: 'Health care center',
  chemotherapyDay: 'Thursday',
  reminderTime: '6:00 PM',
  profileImage: undefined, // Add profile image URL when available
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfile(mockProfileData);
        setFormData({
          firstName: mockProfileData.firstName,
          lastName: mockProfileData.lastName,
          email: mockProfileData.email,
          phoneNumber: mockProfileData.phoneNumber,
          dateOfBirth: mockProfileData.dateOfBirth,
          doctor: mockProfileData.doctor,
          clinic: mockProfileData.clinic,
          chemotherapyDay: mockProfileData.chemotherapyDay,
          reminderTime: mockProfileData.reminderTime,
        });
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleEditImage = () => {
    // TODO: Implement image upload functionality
    console.log('Edit image clicked');
  };

  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save profile data
      console.log('Saving profile data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (profile && formData) {
        setProfile({
          ...profile,
          ...formData,
        });
      }
      
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile data');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        doctor: profile.doctor,
        clinic: profile.clinic,
        chemotherapyDay: profile.chemotherapyDay,
        reminderTime: profile.reminderTime,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <ProfileContainer>
        <ProfileHeaderStyled>
          <ProfileTitle>Profile</ProfileTitle>
        </ProfileHeaderStyled>
        <LoadingContainer>
          <CircularProgress size={48} />
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  if (error) {
    return (
      <ProfileContainer>
        <ProfileHeaderStyled>
          <ProfileTitle>Profile</ProfileTitle>
        </ProfileHeaderStyled>
        <ProfileContent>
          <ErrorContainer>
            <strong>Error:</strong> {error}
          </ErrorContainer>
        </ProfileContent>
      </ProfileContainer>
    );
  }

  if (!profile || !formData) {
    return (
      <ProfileContainer>
        <ProfileHeaderStyled>
          <ProfileTitle>Profile</ProfileTitle>
        </ProfileHeaderStyled>
        <ProfileContent>
          <ErrorContainer>
            <strong>Error:</strong> No profile data available
          </ErrorContainer>
        </ProfileContent>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeaderStyled>
        <ProfileTitle>Profile</ProfileTitle>
      </ProfileHeaderStyled>
      
      <ProfileContent>
        <ProfileCard>
          <ProfileHeader
            profile={profile}
            onEditProfile={handleEditProfile}
            onEditImage={handleEditImage}
          />
          
          <PersonalInformation
            formData={formData}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </ProfileCard>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default ProfilePage; 