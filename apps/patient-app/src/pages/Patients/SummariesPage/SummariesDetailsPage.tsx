import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSummaryDetails } from '@patient-portal/api-client';
import { formatTimeForDisplay } from '@patient-portal/utils-lib';
import { ArrowLeft, Calendar, FileText, List } from 'lucide-react';
import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 24px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 1rem;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const BackButtonIcon = styled.div`
  display: flex;
  align-items: center;
`;

const BackButtonText = styled.span`
  font-weight: 500;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
`;

const TitleSpacer = styled.div`
  flex: 1;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const DetailedSummaryContainer = styled.div`
  grid-column: 1;
`;

const QuickSummaryContainer = styled.div`
  grid-column: 2;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

const DetailedSummaryText = styled.div`
  color: #555;
  line-height: 1.8;
  font-size: 1rem;
`;

const QuickSummaryContent = styled.div`
  color: #555;
  line-height: 1.6;
`;

const AdditionalInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const InfoCardTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const SymptomsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SymptomTag = styled.span`
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const MedicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MedicationItem = styled.div`
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #555;
`;

const SummaryHeaderCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SummaryHeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.875rem;
`;

const DateIcon = styled.div`
  display: flex;
  align-items: center;
`;

const DateText = styled.span`
  font-weight: 500;
`;

const FeelingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const FeelingImage = styled.img`
  width: 24px;
  height: 24px;
`;

const FeelingText = styled.span`
  font-weight: 600;
`;

const getFeelingData = (feeling: string) => {
  const feelingMap: { [key: string]: { image: string; color: string } } = {
    'Very Happy': { image: '/VeryHappy.png', color: 'background-color: #4caf50; color: white;' },
    'Happy': { image: '/Happy.png', color: 'background-color: #8bc34a; color: white;' },
    'Neutral': { image: '/Neutral.png', color: 'background-color: #ff9800; color: white;' },
    'Sad': { image: '/Sad.png', color: 'background-color: #ff5722; color: white;' },
    'Very Sad': { image: '/VerySad.png', color: 'background-color: #f44336; color: white;' },
  };
  return feelingMap[feeling] || { image: '/Neutral.png', color: 'background-color: #ff9800; color: white;' };
};


const SummariesDetailsPage: React.FC = () => {
  const { summaryId } = useParams<{ summaryId: string }>();
  const navigate = useNavigate();
  const { data: summary, isLoading, error } = useSummaryDetails(summaryId || '');

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderBottom: '2px solid #007bff',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#666', fontSize: '1.125rem' }}>Loading summary details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
            Unable to Load Summary
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            There was an error loading the summary details. Please try again.
          </p>
          <button 
            onClick={() => navigate('/summaries')} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Summaries
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', color: '#ccc' }}>📄</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
            Summary Not Found
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            The requested summary could not be found.
          </p>
          <button 
            onClick={() => navigate('/summaries')} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Summaries
          </button>
        </div>
      </div>
    );
  }

  return (
    <Page>
      {/* Header */}
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/summaries')}>
            <BackButtonIcon>
              <ArrowLeft size={22} />
            </BackButtonIcon>
            <BackButtonText>Back to Summaries</BackButtonText>
          </BackButton>
          <PageTitle>Conversation Summary</PageTitle>
          <TitleSpacer />
        </HeaderContent>
      </Header>

      {/* Content */}
      <Content>
        {/* Summary Header Card */}
        <SummaryHeaderCard>
          <SummaryHeaderContent>
            <DateContainer>
              <DateIcon>
                <Calendar size={24} />
              </DateIcon>
              <DateText>{formatTimeForDisplay(summary.created_at)}</DateText>
            </DateContainer>
            {summary.overall_feeling && (
              <FeelingContainer style={{ backgroundColor: getFeelingData(summary.overall_feeling).color.split(';')[0].split(':')[1], color: getFeelingData(summary.overall_feeling).color.split(';')[1].split(':')[1] }}>
                <FeelingImage 
                  src={getFeelingData(summary.overall_feeling).image} 
                  alt={summary.overall_feeling}
                />
                <FeelingText>Overall Feeling: {summary.overall_feeling}</FeelingText>
              </FeelingContainer>
            )}
          </SummaryHeaderContent>
        </SummaryHeaderCard>

        {/* Main Content Grid */}
        <MainGrid>
          {/* Detailed Summary - Takes up more space */}
          <DetailedSummaryContainer>
            <Card>
              <CardHeader>
                <CardIcon style={{ color: '#1976D2' }}>
                  <FileText size={28} />
                </CardIcon>
                <CardTitle>Detailed Summary</CardTitle>
              </CardHeader>
              <DetailedSummaryText>
                <p>
                  {summary.longer_summary || 'No detailed summary available.'}
                </p>
              </DetailedSummaryText>
            </Card>
          </DetailedSummaryContainer>

          {/* Quick Summary Sidebar */}
          <QuickSummaryContainer>
            {summary.bulleted_summary && (
              <Card>
                <CardHeader>
                  <CardIcon style={{ color: '#388E3C' }}>
                    <List size={28} />
                  </CardIcon>
                  <CardTitle>Quick Summary</CardTitle>
                </CardHeader>
                <QuickSummaryContent 
                  dangerouslySetInnerHTML={{ __html: summary.bulleted_summary }}
                />
              </Card>
            )}
          </QuickSummaryContainer>
        </MainGrid>

        {/* Additional Information Cards */}
        {(summary.symptom_list || summary.medication_list) && (
          <AdditionalInfoGrid>
            {/* Symptoms Card */}
            {summary.symptom_list && summary.symptom_list.length > 0 && (
              <Card>
                <InfoCardTitle>Reported Symptoms</InfoCardTitle>
                <SymptomsList>
                  {summary.symptom_list.map((symptom: string, index: number) => (
                    <SymptomTag key={index}>
                      {symptom}
                    </SymptomTag>
                  ))}
                </SymptomsList>
              </Card>
            )}

            {/* Medications Card */}
            {summary.medication_list && summary.medication_list.length > 0 && (
              <Card>
                <InfoCardTitle>Medications Discussed</InfoCardTitle>
                <MedicationsList>
                  {summary.medication_list.map((medication: any, index: number) => (
                    <MedicationItem key={index}>
                      {typeof medication === 'string' ? medication : JSON.stringify(medication)}
                    </MedicationItem>
                  ))}
                </MedicationsList>
              </Card>
            )}
          </AdditionalInfoGrid>
        )}
      </Content>
    </Page>
  );
};

export default SummariesDetailsPage;
