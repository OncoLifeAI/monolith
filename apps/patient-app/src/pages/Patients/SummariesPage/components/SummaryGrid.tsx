import React from 'react';
import type { Summary } from '@patient-portal/api-client';
import SummaryCard from './SummaryCard';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  padding: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #666;
`;

interface SummaryGridProps {
  summaries: Summary[];
}

const SummaryGrid: React.FC<SummaryGridProps> = ({ summaries }) => {
  if (!summaries || summaries.length === 0) {
    return (
      <EmptyState>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <h3 style={{ marginBottom: '0.5rem', color: '#495057' }}>No Summaries Available</h3>
        <p style={{ margin: 0 }}>
          Summaries will appear here after you complete chat conversations.
        </p>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      {summaries.map((summary) => (
        <SummaryCard key={summary.uuid} summary={summary} />
      ))}
    </GridContainer>
  );
};

export default SummaryGrid; 