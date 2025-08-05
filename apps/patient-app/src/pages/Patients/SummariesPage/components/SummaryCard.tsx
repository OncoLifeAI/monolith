import React from 'react';
import { Button } from '@mui/material';
import type { Summary } from '@patient-portal/api-client';
import { formatTimeForDisplay } from '@patient-portal/utils-lib';
import { ArrowRight } from 'lucide-react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

const CardDate = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 12px;
`;

const CardContent = styled.div`
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FeelingBadge = styled.div<{ feeling: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props?.feeling?.toLowerCase()) {
      case 'very happy':
        return '#e8f5e8';
      case 'happy':
        return '#f0f8f0';
      case 'neutral':
        return '#f5f5f5';
      case 'sad':
        return '#fff3e0';
      case 'very sad':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props?.feeling?.toLowerCase()) {
      case 'very happy':
        return '#2e7d32';
      case 'happy':
        return '#388e3c';
      case 'neutral':
        return '#666';
      case 'sad':
        return '#f57c00';
      case 'very sad':
        return '#d32f2f';
      default:
        return '#666';
    }
  }};
`;

const ViewButton = styled(Button)`
  background-color: #007bff;
  color: white;
  
  &:hover {
    background-color: #0056b3;
  }
`;

interface SummaryCardProps {
  summary: Summary;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/summaries/${summary.uuid}`);
  };

  return (
    <Card onClick={handleClick}>
      <CardHeader>
        <div>
          <CardTitle>Conversation Summary</CardTitle>
          <CardDate>{formatTimeForDisplay(summary.created_at)}</CardDate>
        </div>
        <FeelingBadge feeling={summary.overall_feeling}>
          {summary.overall_feeling}
        </FeelingBadge>
      </CardHeader>
      
      <CardContent>
        {summary.longer_summary && summary.longer_summary.length > 200
          ? `${summary.longer_summary.substring(0, 200)}...`
          : summary.longer_summary}
      </CardContent>
      
      <CardFooter>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          {summary.symptom_list?.length || 0} symptoms • {summary.medication_list?.length || 0} medications
        </div>
        <ViewButton
          variant="contained"
          size="small"
          endIcon={<ArrowRight size={16} />}
        >
          View Details
        </ViewButton>
      </CardFooter>
    </Card>
  );
};

export default SummaryCard; 