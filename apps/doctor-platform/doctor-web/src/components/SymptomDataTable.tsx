import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography
} from '@mui/material';
import { CheckCircle, XCircle } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '@oncolife/ui-components';
import type { SymptomEntry } from '../data';

interface SymptomDataTableProps {
  data: SymptomEntry[];
}

const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableTitle = styled.div`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  
  h3 {
    margin: 0;
    color: ${theme.colors.gray[800]};
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const StyledTableContainer = styled(TableContainer)`
  max-height: 600px;
`;

const StyledTableCell = styled(TableCell)`
  &.MuiTableCell-head {
    background-color: ${theme.colors.gray[100]};
    font-weight: 600;
    color: ${theme.colors.gray[800]};
    border-bottom: 2px solid ${theme.colors.gray[200]};
  }
  
  &.MuiTableCell-body {
    border-bottom: 1px solid ${theme.colors.gray[100]};
  }
`;

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'symptom_relieved':
      return { bg: '#dcfce7', color: '#166534' }; // green
    case 'mild':
      return { bg: '#fef3c7', color: '#92400e' }; // yellow
    case 'moderate':
      return { bg: '#fed7aa', color: '#c2410c' }; // orange
    case 'severe':
      return { bg: '#fecaca', color: '#dc2626' }; // red
    case 'very_severe':
      return { bg: '#fca5a5', color: '#991b1b' }; // dark red
    default:
      return { bg: '#f3f4f6', color: '#374151' };
  }
};

const formatSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'symptom_relieved':
      return 'Symptom Relieved';
    case 'mild':
      return 'Mild';
    case 'moderate':
      return 'Moderate';
    case 'severe':
      return 'Severe';
    case 'very_severe':
      return 'Very Severe';
    default:
      return severity;
  }
};

const formatSymptomName = (symptom: string) => {
  return symptom.charAt(0).toUpperCase() + symptom.slice(1);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const SymptomDataTable: React.FC<SymptomDataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <TableWrapper>
        <TableTitle>
          <h3>Symptom & Medication Details</h3>
        </TableTitle>
        <div style={{ padding: '2rem', textAlign: 'center', color: theme.colors.gray[500] }}>
          No data available for the selected criteria.
        </div>
      </TableWrapper>
    );
  }

  // Sort data by date (most recent first)
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <TableWrapper>
      <TableTitle>
        <h3>Symptom & Medication Details</h3>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: '0.5rem' }}>
          {data.length} record{data.length !== 1 ? 's' : ''} found
        </Typography>
      </TableTitle>
      
      <StyledTableContainer component={Paper} elevation={0}>
        <Table stickyHeader aria-label="symptom data table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Symptom</StyledTableCell>
              <StyledTableCell>Severity</StyledTableCell>
              <StyledTableCell>Medication</StyledTableCell>
              <StyledTableCell>Frequency</StyledTableCell>
              <StyledTableCell align="center">Helped?</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => {
              const severityColors = getSeverityColor(row.severity);
              return (
                <TableRow 
                  key={row.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.colors.gray[50] 
                    } 
                  }}
                >
                  <StyledTableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(row.date)}
                    </Typography>
                  </StyledTableCell>
                  
                  <StyledTableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {formatSymptomName(row.symptomName)}
                    </Typography>
                  </StyledTableCell>
                  
                  <StyledTableCell>
                    <Chip
                      label={formatSeverityLabel(row.severity)}
                      size="small"
                      sx={{
                        backgroundColor: severityColors.bg,
                        color: severityColors.color,
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </StyledTableCell>
                  
                  <StyledTableCell>
                    <Typography variant="body2">
                      {row.medicationName}
                    </Typography>
                  </StyledTableCell>
                  
                  <StyledTableCell>
                    <Typography variant="body2">
                      {row.medicationFrequency}
                    </Typography>
                  </StyledTableCell>
                  
                  <StyledTableCell align="center">
                    {row.medicationHelped ? (
                      <CheckCircle 
                        size={20} 
                        color="#059669" 
                        title="Medication helped"
                      />
                    ) : (
                      <XCircle 
                        size={20} 
                        color="#dc2626" 
                        title="Medication did not help"
                      />
                    )}
                  </StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableWrapper>
  );
};

export default SymptomDataTable;
