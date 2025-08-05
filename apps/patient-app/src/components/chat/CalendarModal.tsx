import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { X } from 'lucide-react';
import styled from 'styled-components';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
}

const ModalContent = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.25rem;
`;

const CloseButton = styled(Button)`
  min-width: auto;
  padding: 8px;
`;

const CalendarContainer = styled(Box)`
  margin-bottom: 16px;
`;

const ButtonContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  onDateSelect
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate.toDate());
      onClose();
      setSelectedDate(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedDate(null);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <Header>
          <Title>Select Chemotherapy Date</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>
        
        <CalendarContainer>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker
              value={selectedDate}
              onChange={handleDateChange}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        </CalendarContainer>
        
        <ButtonContainer>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirm}
            disabled={!selectedDate}
          >
            Confirm
          </Button>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
}; 