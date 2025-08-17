import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { SleekDayDatePicker } from '@oncolife/ui-components';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  onDateSelect
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedDate) {
      // Convert dayjs to JavaScript Date, but keep the date part only
      // This prevents timezone issues by using the exact date the user selected
      const year = selectedDate.year();
      const month = selectedDate.month(); // 0-based
      const day = selectedDate.date();
      const date = new Date(year, month, day);
      onDateSelect(date);
      onClose();
    }
  };

  const handleDateChange = (date: Dayjs) => {
    console.log('CalendarModal: handleDateChange called with:', date.format('YYYY-MM-DD'));
    setSelectedDate(date);
    console.log('CalendarModal: selectedDate state updated');
  };

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal">
        <div className="calendar-modal-header">
          <h3>
            <Calendar size={20} style={{ marginRight: '8px' }} />
            Select Chemotherapy Date
          </h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <div className="calendar-modal-content">
          <p>When did you receive chemotherapy?</p>
          <div className="date-picker-container">
            <SleekDayDatePicker
              value={selectedDate}
              onChange={handleDateChange}
              maxDate={dayjs()}
              label="Select Date"
              fullWidth={true}
              placeholder="Choose chemotherapy date"
              disableBackdrop={true}
              usePortal={true}
            />
          </div>
        </div>
        
        <div className="calendar-modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!selectedDate}
            className="confirm-button"
          >
            Confirm Date
          </button>
        </div>
      </div>
    </div>
  );
}; 