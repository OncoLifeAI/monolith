import React from 'react';
import { Dayjs } from 'dayjs';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface DatePickerProps {
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  label?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, disabled = false }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDatePicker
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </LocalizationProvider>
  );
};

export default DatePicker; 