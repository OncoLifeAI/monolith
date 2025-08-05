import React, { useState, useEffect } from 'react';
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
import { X, User, Mail, Stethoscope, Building } from 'lucide-react';
import styled from 'styled-components';
import { useUpdateStaff } from '@patient-portal/api-client';
import type { Staff } from '@patient-portal/api-client';
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

interface EditStaffModalProps {
  open: boolean;
  staff: Staff;
  onClose: () => void;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({ open, staff, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    clinicName: '',
    npiNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateStaffMutation = useUpdateStaff();

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        email: staff.email || '',
        role: staff.role || '',
        clinicName: staff.clinicName || '',
        npiNumber: staff.npiNumber || ''
      });
    }
  }, [staff]);

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
    if (!formData.role.trim()) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await updateStaffMutation.mutateAsync({
        id: staff.id,
        data: formData
      });
      onClose();
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitleStyled>
        <Typography variant="h6">Edit Staff</Typography>
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
            <FieldLabel>Role *</FieldLabel>
            <FormControl fullWidth size="small" error={!!errors.role}>
              <Select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="Doctor">Doctor</MenuItem>
                <MenuItem value="Nurse">Nurse</MenuItem>
                <MenuItem value="Administrator">Administrator</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
              </Select>
            </FormControl>
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Clinic Name</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.clinicName}
              onChange={(e) => handleInputChange('clinicName', e.target.value)}
              InputProps={{
                startAdornment: <Building size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>NPI Number</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={formData.npiNumber}
              onChange={(e) => handleInputChange('npiNumber', e.target.value)}
              InputProps={{
                startAdornment: <Stethoscope size={16} style={{ marginRight: 8, color: theme.colors.gray[400] }} />
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
          disabled={updateStaffMutation.isPending}
        >
          {updateStaffMutation.isPending ? 'Updating...' : 'Update Staff'}
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditStaffModal; 