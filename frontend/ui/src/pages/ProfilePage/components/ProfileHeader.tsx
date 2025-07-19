import React from 'react';
import { Mail, Edit } from 'lucide-react';
import {
  ProfileInfoHeader,
  ProfileImageContainer,
  ProfileImage,
  EditImageButton,
  ProfileInfo,
  ProfileName,
  ProfileEmail,
  EditProfileButton,
} from '../ProfilePage.styles';
import type { ProfileData } from '../types';

interface ProfileHeaderProps {
  profile: ProfileData;
  onEditProfile: () => void;
  onEditImage: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditProfile,
  onEditImage,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <ProfileInfoHeader>
      <ProfileImageContainer>
        <ProfileImage imageUrl={profile.profileImage}>
          {!profile.profileImage && getInitials(profile.firstName, profile.lastName)}
        </ProfileImage>
        <EditImageButton onClick={onEditImage}>
          <Edit />
        </EditImageButton>
      </ProfileImageContainer>
      
      <ProfileInfo>
        <ProfileName>{`${profile.firstName} ${profile.lastName}`}</ProfileName>
        <ProfileEmail>
          <Mail />
          {profile.email}
        </ProfileEmail>
      </ProfileInfo>
      
      <EditProfileButton onClick={onEditProfile}>
        Edit Profile
      </EditProfileButton>
    </ProfileInfoHeader>
  );
};

export default ProfileHeader; 