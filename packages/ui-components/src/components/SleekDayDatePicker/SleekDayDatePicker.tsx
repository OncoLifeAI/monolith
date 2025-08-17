import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DatePickerContainer,
  DateDisplayButton,
  DropdownContainer,
  PortalDropdownContainer,
  DropdownHeader,
  CalendarGrid,
  DayButton,
  NavigationButton,
  MonthYearSelector,
  Backdrop,
  MobileBackdrop
} from './SleekDayDatePicker.styles';

interface SleekDayDatePickerProps {
  value: Dayjs | null;
  onChange: (date: Dayjs) => void;
  label?: string;
  fullWidth?: boolean;
  placeholder?: string;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  disableBackdrop?: boolean; // When true, won't render backdrop (useful for modals)
  dropdownPosition?: 'auto' | 'top' | 'bottom'; // Control dropdown positioning
  usePortal?: boolean; // When true, renders dropdown in a portal above everything
}

const SleekDayDatePicker: React.FC<SleekDayDatePickerProps> = ({
  value,
  onChange,
  label = 'Select Date',
  fullWidth = false,
  placeholder,
  maxDate,
  minDate,
  disableBackdrop = false,
  dropdownPosition = 'auto',
  usePortal = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || dayjs());

  // Update viewDate when value prop changes
  useEffect(() => {
    if (value) {
      setViewDate(value);
    }
  }, [value]);
  const [actualDropdownPosition, setActualDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalDropdownRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatDisplayDate = (date: Dayjs) => {
    return date.format('MMMM D, YYYY');
  };

  const calculateDropdownPosition = () => {
    if (dropdownPosition !== 'auto') {
      return dropdownPosition;
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If there's not enough space below (less than 400px for calendar) and more space above, show on top
      if (spaceBelow < 400 && spaceAbove > spaceBelow) {
        return 'top';
      }
    }
    
    return 'bottom';
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setViewDate(value || dayjs());
      
      if (usePortal && containerRef.current) {
        // Calculate absolute position for portal
        const rect = containerRef.current.getBoundingClientRect();
        setPortalPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
      
      // Calculate position when opening
      const position = calculateDropdownPosition();
      setActualDropdownPosition(position);
    }
  };

  const handleDaySelect = (day: number) => {
    console.log('SleekDayDatePicker: handleDaySelect called with day:', day);
    const newDate = viewDate.date(day);
    console.log('SleekDayDatePicker: newDate created:', newDate.format('YYYY-MM-DD'));
    
    // Check if the date is within bounds
    if (maxDate && newDate.isAfter(maxDate, 'day')) {
      console.log('SleekDayDatePicker: date is after maxDate, returning');
      return;
    }
    if (minDate && newDate.isBefore(minDate, 'day')) {
      console.log('SleekDayDatePicker: date is before minDate, returning');
      return;
    }
    
    console.log('SleekDayDatePicker: calling onChange with:', newDate.format('YYYY-MM-DD'));
    onChange(newDate);
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => prev.add(1, 'month'));
  };

  const generateCalendarDays = () => {
    const startOfMonth = viewDate.startOf('month');
    const endOfMonth = viewDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');
    
    const days = [];
    let current = startOfWeek;
    
    while (current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }
    
    return days;
  };

  const isDayDisabled = (day: Dayjs) => {
    if (maxDate && day.isAfter(maxDate, 'day')) return true;
    if (minDate && day.isBefore(minDate, 'day')) return true;
    return false;
  };

  const isDayInCurrentMonth = (day: Dayjs) => {
    return day.month() === viewDate.month();
  };

  const isDaySelected = (day: Dayjs) => {
    return value && day.isSame(value, 'day');
  };

  const isDayToday = (day: Dayjs) => {
    return day.isSame(dayjs(), 'day');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking inside the container (date picker button)
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside the portal dropdown (when using portal)
      if (usePortal && portalDropdownRef.current && portalDropdownRef.current.contains(target)) {
        return;
      }
      
      // Close if clicking outside both the container and portal dropdown
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const renderCalendarContent = () => (
    <>
      <DropdownHeader>
        <NavigationButton onClick={handlePrevMonth}>
          <ChevronLeft size={16} />
        </NavigationButton>
        
        <MonthYearSelector>
          <span>{viewDate.format('MMMM YYYY')}</span>
        </MonthYearSelector>
        
        <NavigationButton onClick={handleNextMonth}>
          <ChevronRight size={16} />
        </NavigationButton>
      </DropdownHeader>

      <CalendarGrid>
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="week-day-header">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {generateCalendarDays().map((day, index) => (
          <DayButton
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              console.log('SleekDayDatePicker: Day clicked:', day.date(), 'isInCurrentMonth:', isDayInCurrentMonth(day), 'isDisabled:', isDayDisabled(day));
              if (isDayInCurrentMonth(day) && !isDayDisabled(day)) {
                handleDaySelect(day.date());
              }
            }}
            $isSelected={isDaySelected(day) || false}
            $isToday={isDayToday(day)}
            $isDisabled={isDayDisabled(day) || !isDayInCurrentMonth(day)}
            $isInCurrentMonth={isDayInCurrentMonth(day)}
          >
            {day.date()}
          </DayButton>
        ))}
      </CalendarGrid>
    </>
  );

  return (
    <>
      {isOpen && !disableBackdrop && <Backdrop onClick={() => setIsOpen(false)} />}
      <DatePickerContainer ref={containerRef} $fullWidth={fullWidth}>
        <DateDisplayButton 
          onClick={handleToggle} 
          $fullWidth={fullWidth}
          $isOpen={isOpen}
        >
          <div className="date-content">
            {label && <span className="label">{label}</span>}
            <span className="date-text">
              {!value ? (placeholder || 'Select Date') : formatDisplayDate(value)}
            </span>
          </div>
          <div className="icon-container">
            <Calendar size={18} />
            <ChevronDown 
              size={16} 
              className={`chevron ${isOpen ? 'open' : ''}`}
            />
          </div>
        </DateDisplayButton>

        {isOpen && !usePortal && (
          <DropdownContainer $position={actualDropdownPosition}>
            {renderCalendarContent()}
          </DropdownContainer>
        )}
      </DatePickerContainer>
      
      {/* Portal dropdown */}
      {isOpen && usePortal && createPortal(
        <>
          {isMobile && <MobileBackdrop onClick={() => setIsOpen(false)} />}
          <PortalDropdownContainer ref={portalDropdownRef} $position={portalPosition}>
            {renderCalendarContent()}
          </PortalDropdownContainer>
        </>,
        document.body
      )}
    </>
  );
};

export default SleekDayDatePicker;
