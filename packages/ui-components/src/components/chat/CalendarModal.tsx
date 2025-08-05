import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';

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
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedDate) {
      const date = new Date(selectedDate.toISOString());
      onDateSelect(date);
      onClose();
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal">
        <div className="calendar-modal-header">
          <h3>Select Date</h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <div className="calendar-modal-content">
          <div className="calendar-icon">
            <Calendar size={24} />
          </div>
          <div className="date-input-container">
            <input
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(e.target.value ? dayjs(e.target.value) : null)}
              max={getMaxDate()}
              className="date-input"
            />
          </div>
          <div className="calendar-modal-actions">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSubmit} className="submit-button" disabled={!selectedDate}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 