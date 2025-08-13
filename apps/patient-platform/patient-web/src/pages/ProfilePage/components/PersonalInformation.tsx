import React from 'react';
import styled from 'styled-components';
import {
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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: center;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

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

  const canEdit = (field: keyof ProfileFormData) =>
    isEditing && (field === 'phone_number' || field === 'chemotherapy_day' || field === 'reminder_time');

  return (
    <div>
      <SectionTitle>Personal Information</SectionTitle>
      <GridContainer>
        <InputGroup>
          <InputLabel>First Name</InputLabel>
          <InputField
            type="text"
            value={formData.first_name || ''}
            onChange={handleInputChange('first_name')}
            disabled={!canEdit('first_name')}
            isEditing={canEdit('first_name')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Last Name</InputLabel>
          <InputField
            type="text"
            value={formData.last_name || ''}
            onChange={handleInputChange('last_name')}
            disabled={!canEdit('last_name')}
            isEditing={canEdit('last_name')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Email</InputLabel>
          <InputField
            type="email"
            value={formData.email_address || ''}
            onChange={handleInputChange('email_address')}
            disabled={!canEdit('email_address')}
            isEditing={canEdit('email_address')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Phone Number</InputLabel>
          <InputField
            type="tel"
            value={formData.phone_number || ''}
            onChange={handleInputChange('phone_number')}
            disabled={!canEdit('phone_number')}
            isEditing={canEdit('phone_number')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Date of Birth</InputLabel>
          <InputField
            type="text"
            value={formData.date_of_birth || ''}
            onChange={handleInputChange('date_of_birth')}
            disabled={!canEdit('date_of_birth')}
            isEditing={canEdit('date_of_birth')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Chemotherapy Day</InputLabel>
          <InputField
            type="text"
            value={formData.chemotherapy_day || ''}
            onChange={handleInputChange('chemotherapy_day')}
            disabled={!canEdit('chemotherapy_day')}
            isEditing={canEdit('chemotherapy_day')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Reminder Time</InputLabel>
          <InputField
            type="time"
            value={formData.reminder_time || ''}
            onChange={handleInputChange('reminder_time')}
            disabled={!canEdit('reminder_time')}
            isEditing={canEdit('reminder_time')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Doctor</InputLabel>
          <InputField
            type="text"
            value={formData.doctor_name || ''}
            onChange={handleInputChange('doctor_name')}
            disabled={!canEdit('doctor_name')}
            isEditing={canEdit('doctor_name')}
          />
        </InputGroup>
        <InputGroup>
          <InputLabel>Clinic</InputLabel>
          <InputField
            type="text"
            value={formData.clinic_name || ''}
            onChange={handleInputChange('clinic_name')}
            disabled={!canEdit('clinic_name')}
            isEditing={canEdit('clinic_name')}
          />
        </InputGroup>
      </GridContainer>
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