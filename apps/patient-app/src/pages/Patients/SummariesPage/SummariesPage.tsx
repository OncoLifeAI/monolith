import React, { useState } from 'react';
import { Container, Header, Title, Content } from '@patient-portal/ui-components';
import { useSummaries } from '@patient-portal/api-client';
import { SummaryGrid } from './components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageHeader = styled.div`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 24px;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
`;

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const DateNavigationGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
    border-color: #007bff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #666;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 24px;
`;

const CircularProgress = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SummariesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const navigate = useNavigate();

  const { data: summariesResponse, isLoading, error } = useSummaries(selectedDate.year(), selectedDate.month() + 1);
  const summaries = summariesResponse?.data || [];

  const goToPreviousMonth = () => {
    setSelectedDate(selectedDate.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setSelectedDate(selectedDate.add(1, 'month'));
  };

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Summaries</Title>
        </Header>
        <Content>
          <ErrorContainer>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#495057' }}>Error Loading Summaries</h3>
            <p style={{ margin: 0 }}>
              There was an error loading the summaries. Please try again.
            </p>
          </ErrorContainer>
        </Content>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Summaries</Title>
        </Header>
        <Content>
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>Conversation Summaries</PageTitle>
        <NavigationContainer>
          <DateNavigationGroup>
            <NavigationButton onClick={goToPreviousMonth}>
              <ChevronLeft size={20} />
            </NavigationButton>
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '6px',
              fontWeight: '500',
              color: '#333'
            }}>
              {selectedDate.format('MMMM YYYY')}
            </div>
            <NavigationButton onClick={goToNextMonth}>
              <ChevronRight size={20} />
            </NavigationButton>
          </DateNavigationGroup>
          <Button onClick={() => navigate('/chats')}>
            Start New Chat
          </Button>
        </NavigationContainer>
      </PageHeader>
      
      <Content>
        <SummaryGrid summaries={summaries} />
      </Content>
    </Container>
  );
};

export default SummariesPage; 