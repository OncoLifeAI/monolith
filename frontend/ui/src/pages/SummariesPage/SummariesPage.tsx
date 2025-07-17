import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Button } from 'react-bootstrap';
import { 
  Container, 
  Header, 
  Title, 
  Content, 
  PageHeader, 
  PageTitle, 
  DatePickerContainer, 
  NavigationContainer,
  DateNavigationGroup,
  NavigationButton,
  DateDisplayButton,
  LoadingContainer,
  ErrorContainer,
} from './SummariesPage.styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSummaries } from '../../restful/summaries';
import { SummaryGrid } from './components';
import dayjs, { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SummariesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useSummaries(
    selectedDate.year(), 
    selectedDate.month() + 1
  );

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate);
      setShowDatePicker(false);
    }
  };

  const goToPreviousMonth = () => {
    setSelectedDate(selectedDate.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setSelectedDate(selectedDate.add(1, 'month'));
  };

  const goToToday = () => {
    setSelectedDate(dayjs());
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleViewDetails = (summaryId: string) => {
    navigate(`/summaries/${summaryId}`);
  };

  const formatCurrentDate = (date: Dayjs) => {
    return date.format('MMMM YYYY');
  };

  return (
    <Container>
      <Header>
        <Title>Summaries</Title>
      </Header>
      
      <Content>
        <PageHeader>
          <PageTitle>
            Monthly Summaries
          </PageTitle>
          
          <NavigationContainer>
            <DateNavigationGroup>
              <NavigationButton onClick={goToPreviousMonth}>
                <ChevronLeft />
              </NavigationButton>
              
              <DatePickerContainer>
                {showDatePicker ? (
                  <DatePicker 
                    label="Select Month & Year"
                    views={['month', 'year']} 
                    value={selectedDate}
                    onChange={handleDateChange}
                    open={true}
                    onClose={() => setShowDatePicker(false)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          '& .MuiInputBase-root': {
                            height: '40px',
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '14px',
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <DateDisplayButton onClick={toggleDatePicker}>
                    <span>{formatCurrentDate(selectedDate)}</span>
                    <Calendar />
                  </DateDisplayButton>
                )}
              </DatePickerContainer>
              
              <NavigationButton onClick={goToNextMonth}>
                <ChevronRight />
              </NavigationButton>
            </DateNavigationGroup>
            
            <Button 
              variant="primary" 
              onClick={goToToday}
              size="sm"
            >
              Today
            </Button>
          </NavigationContainer>
        </PageHeader>

        {error && (
          <ErrorContainer>
            <strong>Error:</strong> {error.message || 'Failed to load summaries'}
          </ErrorContainer>
        )}

        {isLoading ? (
          <LoadingContainer>
            <CircularProgress size={48} />
          </LoadingContainer>
        ) : (
          <SummaryGrid 
            summaries={data || [] } 
            onViewDetails={handleViewDetails} 
          />
        )}
      </Content>
    </Container>
  );
};

export default SummariesPage; 