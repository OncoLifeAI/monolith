import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { X, User, Mail, Stethoscope, Building, Users } from 'lucide-react';
import styled from 'styled-components';
import { useAddPatient } from '@patient-portal/api-client';
import type { Patient } from '@patient-portal/api-client';
import { theme } from '@patient-portal/theme-lib';

// Styled components
const DialogTitleStyled = styled(DialogTitle)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
`;

const CloseButton = styled(Button)`
  min-width: auto;
  padding: 0.5rem;
  color: ${theme.colors.gray[500]};
  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

const FormGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FieldContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FieldLabel = styled(Typography)`
  font-weight: 500;
  color: ${theme.colors.gray[700]};
  font-size: 0.875rem;
`;

const ActionButton = styled(Button)`
  background-color: ${theme.colors.primary};
  color: white;
  &:hover {
    background-color: ${theme.colors.primary};
    opacity: 0.9;
  }
`;

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mrn: '',
    dateOfBirth: '',
    sex: '',
    race: '',
    phoneNumber: '',
    physician: '',
    diseaseType: '',
    associateClinic: '',
    treatmentType: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPatientMutation = useAddPatient();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mrn.trim()) newErrors.mrn = 'MRN is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.sex) newErrors.sex = 'Sex is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await addPatientMutation.mutateAsync(formData as Omit<Patient, 'id'>);
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mrn: '',
        dateOfBirth: '',
        sex: '',
        race: '',
        phoneNumber: '',
        physician: '',
        diseaseType: '',
        associateClinic: '',
        treatmentType: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitleStyled>
        <Typography variant="h6">Add New Patient</Typography>
        <CloseButton onClick={onClose} size="small">
          <X size={20} />
        </CloseButton>
      </DialogTitleStyled>

      <DialogContent>
        <FormGrid>
          <FieldContainer>
            <FieldLabel>First Name *</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              InputProps={{
                startAdornment: <User size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Last Name *</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              InputProps={{
                startAdornment: <User size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Email *</FieldLabel>
            <TextField
              fullWidth
              size="small"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: <Mail size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>MRN *</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.mrn}
              onChange={(e) => handleInputChange('mrn', e.target.value)}
              error={!!errors.mrn}
              helperText={errors.mrn}
              InputProps={{
                startAdornment: <Stethoscope size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Date of Birth *</FieldLabel>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth}
              InputLabelProps={{ shrink: true }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Sex *</FieldLabel>
            <FormControl fullWidth size="small" error={!!errors.sex}>
              <Select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Select Sex</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Race</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.race}
              onChange={(e) => handleInputChange('race', e.target.value)}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Phone Number</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Physician</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.physician}
              onChange={(e) => handleInputChange('physician', e.target.value)}
              InputProps={{
                startAdornment: <Stethoscope size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Disease Type</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.diseaseType}
              onChange={(e) => handleInputChange('diseaseType', e.target.value)}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Associate Clinic</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.associateClinic}
              onChange={(e) => handleInputChange('associateClinic', e.target.value)}
              InputProps={{
                startAdornment: <Building size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Treatment Type</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.treatmentType}
              onChange={(e) => handleInputChange('treatmentType', e.target.value)}
              InputProps={{
                startAdornment: <Users size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>
        </FormGrid>
      </DialogContent>

      <DialogActions sx={{ padding: '1rem 2rem 1.5rem' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <ActionButton
          variant="contained"
          onClick={handleSubmit}
          disabled={addPatientMutation.isPending}
        >
          {addPatientMutation.isPending ? 'Adding...' : 'Add Patient'}
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddPatientModal; 