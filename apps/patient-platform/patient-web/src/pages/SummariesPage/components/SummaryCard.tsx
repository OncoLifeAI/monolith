import React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import type { Summary } from '../../../services/summaries';
import { formatDateForDisplay } from '@oncolife/shared-utils';

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    padding: 1.25rem;
    border-radius: 10px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  
  @media (hover: none) {
    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }
`;

const DateHeader = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 1rem 0;
  line-height: 1.3;
  
  @media (max-width: 767px) {
    font-size: 1.05rem;
    margin-bottom: 0.75rem;
  }
`;

const SummaryContent = styled.div`
  background: #F8F9FA;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  flex: 1;
  
  @media (max-width: 767px) {
    padding: 0.875rem;
    margin-bottom: 0.875rem;
  }
`;

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BulletItem = styled.li`
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
  color: #495057;
  font-size: 0.9rem;
  line-height: 1.4;

  @media (max-width: 767px) {
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 0.625rem;
  }

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.5rem;
    width: 6px;
    height: 6px;
    background-color: #007BFF;
    border-radius: 50%;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ViewDetailsButton = styled(Button)`
  width: 100%;
  border-radius: 8px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  
  @media (max-width: 767px) {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    border-radius: 6px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }
  
  @media (hover: none) {
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

interface SummaryCardProps {
  summary: Summary;
  onViewDetails: (summaryId: string) => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onViewDetails }) => {
  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  return (
    <Card>
      <DateHeader>{formatDate(summary.created_at)}</DateHeader>
      <SummaryContent>
        {summary?.bulleted_summary ? (
          <BulletList>
            {summary.bulleted_summary
              .split(/,\s*-/)
              .map((line, index) => (
                <BulletItem key={index}>{line.replace(/^\s*-?\s*/, '')}</BulletItem>
              ))}
          </BulletList>
        ) : (
          <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>No summary for today</div>
        )}
      </SummaryContent>
      {summary?.bulleted_summary && (
        <ViewDetailsButton 
          variant="primary" 
          onClick={() => onViewDetails(summary.uuid)}
        >
          View Details
        </ViewDetailsButton>
      )}
    </Card>
  );
};

export default SummaryCard; 