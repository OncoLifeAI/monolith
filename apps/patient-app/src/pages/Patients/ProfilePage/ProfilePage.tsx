import React, { useState, useEffect } from 'react';
import { Container, Header, Title, Content } from '@patient-portal/ui-components';
import { useFetchProfile } from '@patient-portal/api-client';
import type { ProfileData } from '@patient-portal/common-types';
import { PersonalInformation, ProfileHeader } from './components';

const ProfilePage: React.FC = () => {
  const { data: profileData, isLoading: isProfileLoading } = useFetchProfile();
  const profile = (profileData as any)?.data || null;
  const [formData, setFormData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileData) {
      setFormData(profileData as ProfileData);
    }
  }, [profileData]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleEditImage = () => {
    // TODO: Implement image upload functionality
    console.log('Edit image clicked');
  };

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
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
      
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile data');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email_address: profile.email_address || '',
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth || '',
        chemotherapy_day: profile.chemotherapy_day || '',
        reminder_time: profile.reminder_time || '',
        doctor_name: profile.doctor_name || '',
        clinic_name: profile.clinic_name || '',
      });
    }
    setIsEditing(false);
  };

  if (isProfileLoading) {
    return (
      <Container>
        <Header>
          <Title>Profile</Title>
        </Header>
        <Content>
          {profile && (
            <ProfileHeader
              profile={profile}
              onEditProfile={handleEditProfile}
              onEditImage={handleEditImage}
            />
          )}
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Profile</Title>
        </Header>
        <Content>
          {profile && (
            <ProfileHeader
              profile={profile}
              onEditProfile={handleEditProfile}
              onEditImage={handleEditImage}
            />
          )}
        </Content>
      </Container>
    );
  }

  if (!profile || !formData) {
    return (
      <Container>
        <Header>
          <Title>Profile</Title>
        </Header>
        <Content>
          <div>Loading profile...</div>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Profile</Title>
      </Header>
      
      <Content>
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
      </Content>
    </Container>
  );
};

export default ProfilePage; 