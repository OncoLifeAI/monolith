import React from 'react';
import {
  InformationGrid,
  InformationColumn,
  InputGroup,
  InputLabel,
  InputField,
  SectionTitle,
  SaveButton,
  CancelButton,
  ButtonGroup,
} from '../ProfilePage.styles';
import type { ProfileFormData } from '../types';

interface PersonalInformationProps {
  formData: ProfileFormData;
  isEditing: boolean;
  onFieldChange: (field: keyof ProfileFormData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  formData,
  isEditing,
  onFieldChange,
  onSave,
  onCancel,
}) => {
  const handleInputChange = (field: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFieldChange(field, e.target.value);
  };

  return (
    <div>
      <SectionTitle>Personal Information</SectionTitle>
      
      <InformationGrid>
        <InformationColumn>
          <InputGroup>
            <InputLabel>First Name</InputLabel>
            <InputField
              type="text"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
          
          <InputGroup>
            <InputLabel>Phone Number</InputLabel>
            <InputField
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
          
          <InputGroup>
            <InputLabel>Chemotherapy Day</InputLabel>
            <InputField
              type="text"
              value={formData.chemotherapyDay}
              onChange={handleInputChange('chemotherapyDay')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
        </InformationColumn>
        
        <InformationColumn>
          <InputGroup>
            <InputLabel>Last Name</InputLabel>
            <InputField
              type="text"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
          
          <InputGroup>
            <InputLabel>Date of Birth</InputLabel>
            <InputField
              type="text"
              value={formData.dateOfBirth}
              onChange={handleInputChange('dateOfBirth')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
          
          <InputGroup>
            <InputLabel>Reminder Time</InputLabel>
            <InputField
              type="text"
              value={formData.reminderTime}
              onChange={handleInputChange('reminderTime')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
        </InformationColumn>
        
        <InformationColumn>
          <InputGroup>
            <InputLabel>Email</InputLabel>
            <InputField
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
          
          <InputGroup>
            <InputLabel>Doctor</InputLabel>
            <InputField
              type="text"
              value={formData.doctor}
              onChange={handleInputChange('doctor')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
          
          <InputGroup>
            <InputLabel>Clinic</InputLabel>
            <InputField
              type="text"
              value={formData.clinic}
              onChange={handleInputChange('clinic')}
              disabled={!isEditing}
              isEditing={isEditing}
            />
          </InputGroup>
        </InformationColumn>
      </InformationGrid>
      
      {isEditing && (
        <ButtonGroup>
          <SaveButton onClick={onSave}>
            Save Changes
          </SaveButton>
          <CancelButton onClick={onCancel}>
            Cancel
          </CancelButton>
        </ButtonGroup>
      )}
    </div>
  );
};

export default PersonalInformation; 