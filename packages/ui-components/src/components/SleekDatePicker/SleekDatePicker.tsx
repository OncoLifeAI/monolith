import React, { useState, useRef, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import {
  DatePickerContainer,
  DateDisplayButton,
  DropdownContainer,
  DropdownHeader,
  YearSelector,
  YearButton,
  YearGrid,
  MonthGrid,
  MonthButton,
  NavigationButton,
  CloseButton,
  Backdrop
} from './SleekDatePicker.styles';

interface SleekDatePickerProps {
  value: Dayjs | null;
  onChange: (date: Dayjs) => void;
  label?: string;
  fullWidth?: boolean;
  placeholder?: string;
  maxDate?: Dayjs;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const SleekDatePicker: React.FC<SleekDatePickerProps> = ({
  value,
  onChange,
  label = 'Select Month & Year',
  fullWidth = false,
  placeholder,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'months' | 'years'>('months');
  const [displayYear, setDisplayYear] = useState(value?.year() || new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDisplayDate = (date: Dayjs) => {
    return date.format('MMMM YYYY');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setDisplayYear(value?.year() || new Date().getFullYear());
      setViewMode('months');
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = dayjs().month(monthIndex).year(displayYear).date(1);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setDisplayYear(year);
    setViewMode('months');
  };

  const handlePrevYear = () => {
    setDisplayYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setDisplayYear(prev => prev + 1);
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 20;
    const endYear = currentYear + 20;
    const years = [];
    
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    
    return years;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedMonth = value && value.year() === displayYear ? value.month() : -1;

  return (
    <>
      {isOpen && <Backdrop onClick={() => setIsOpen(false)} />}
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

        {isOpen && (
          <DropdownContainer>
            <DropdownHeader>
              <NavigationButton onClick={handlePrevYear} disabled={viewMode === 'years'}>
                <ChevronLeft size={16} />
              </NavigationButton>
              
              <YearSelector onClick={() => setViewMode(viewMode === 'months' ? 'years' : 'months')}>
                <span>{displayYear}</span>
                {viewMode === 'months' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </YearSelector>
              
              <NavigationButton onClick={handleNextYear} disabled={viewMode === 'years'}>
                <ChevronRight size={16} />
              </NavigationButton>
            </DropdownHeader>

            {viewMode === 'months' ? (
              <MonthGrid>
                {months.map((month, index) => {
                  const isDisabled = maxDate && dayjs().month(index).year(displayYear).isAfter(maxDate, 'month');
                  return (
                    <MonthButton
                      key={month}
                      onClick={() => !isDisabled && handleMonthSelect(index)}
                      $isSelected={selectedMonth === index}
                      $isCurrent={new Date().getMonth() === index && new Date().getFullYear() === displayYear}
                      $isDisabled={isDisabled}
                    >
                      {month}
                    </MonthButton>
                  );
                })}
              </MonthGrid>
            ) : (
              <YearGrid>
                {generateYearRange().map(year => (
                  <YearButton
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    $isSelected={year === displayYear}
                    $isCurrent={year === new Date().getFullYear()}
                  >
                    {year}
                  </YearButton>
                ))}
              </YearGrid>
            )}
          </DropdownContainer>
        )}
      </DatePickerContainer>
    </>
  );
};

export default SleekDatePicker;
