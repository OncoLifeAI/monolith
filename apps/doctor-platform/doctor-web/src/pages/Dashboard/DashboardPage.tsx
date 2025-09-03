import React, { useState } from 'react';
import { 
  Container, 
  Header, 
  Title, 
  Content, 
  PageHeader, 
  PageTitle
} from '@oncolife/ui-components';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Pagination,
  CircularProgress,
  Typography
} from '@mui/material';
import { Search, Calendar, User, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '@oncolife/ui-components';
import { useNavigate } from 'react-router-dom';
import { usePatientSummaries } from '../../services/dashboard';

// Styled components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
  z-index: 1;
`;

const PatientCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  width: 100%;
  border: 2px solid transparent;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: ${theme.colors.primary};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PatientHeader = styled.div`
  background: #e3f2fd;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
`;

const ClickIndicator = styled.div`
  color: ${theme.colors.primary};
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  ${PatientCard}:hover & {
    opacity: 1;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
`;

const PatientName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${theme.colors.primary};
  font-size: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
`;

const PatientContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContentRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${theme.colors.gray[700]};
  min-width: 80px;
  font-size: 0.875rem;
`;

const Value = styled.span`
  color: ${theme.colors.gray[600]};
  font-size: 0.875rem;
  flex: 1;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
`;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { data, isLoading, error } = usePatientSummaries(page, search, filter);
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page when searching
  };
  
  const handleFilterChange = (event: any) => {
    setFilter(event.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handlePatientCardClick = (patientId: string, patientName: string) => {
    navigate(`/dashboard/${patientId}`, { state: { patientName } });
  };
  
  // Log data for debugging symptom/summary fields
  React.useEffect(() => {
    if (data) {
      console.debug('DashboardPage: received patient summaries', {
        count: data.data.length,
        first: data.data[0]
      });
    }
  }, [data]);
  
  return (
    <Container>
      <Header>
        <Title>Doctor Dashboard</Title>
      </Header>
      
      <Content>
        <PageHeader>
          <PageTitle>Patient Summaries</PageTitle>
          
          <ControlsContainer>
            <SearchContainer>
              <SearchIcon>
                <Search size={20} />
              </SearchIcon>
              <TextField
                fullWidth
                placeholder="Search by name..."
                value={search}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    paddingLeft: '40px',
                  }
                }}
              />
            </SearchContainer>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filter}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </ControlsContainer>
        </PageHeader>
        
        <DashboardContainer>
          {error && (
            <Typography color="error" variant="body2">
              Error loading patient summaries: {error.message || 'Please try again.'}
            </Typography>
          )}
          
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <div>
                {data?.data.map((patient) => (
                  <PatientCard 
                    key={patient.id} 
                    onClick={() => handlePatientCardClick(patient.id, patient.patientName)}
                  >
                    <PatientHeader>
                      <PatientInfo>
                        <PatientName>
                          <User size={16} />
                          Patient : {patient.patientName}
                        </PatientName>
                        <DetailItem>
                          <Calendar size={16} />
                          DOB : {patient.dateOfBirth}
                        </DetailItem>
                        <DetailItem>
                          <FileText size={16} />
                          MRN : {patient.mrn}
                        </DetailItem>
                        {/* Emergency indicator */}
                        {patient.last_conversation_state === 'EMERGENCY' ? (
                          <DetailItem style={{ color: '#dc2626' }}>
                            <AlertTriangle size={16} /> Emergency
                          </DetailItem>
                        ) : null}
                      </PatientInfo>
                      <ClickIndicator>
                        <ChevronRight size={20} />
                      </ClickIndicator>
                    </PatientHeader>
                    
                    <PatientContent>
                      <ContentRow>
                        <Label>Symptoms:</Label>
                        <Value>{patient.symptoms || 'N/A'}</Value>
                      </ContentRow>
                      <ContentRow>
                        <Label>Summary:</Label>
                        <Value>{patient.summary || 'N/A'}</Value>
                      </ContentRow>
                      {/* Removed Last Updated per request */}
                    </PatientContent>
                  </PatientCard>
                ))}
              </div>
              
              <PaginationContainer>
                <Pagination
                  count={data?.totalPages || 1}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  disabled={!data || data.totalPages <= 1}
                />
              </PaginationContainer>
            </>
          )}
        </DashboardContainer>
      </Content>
    </Container>
  );
};

export default DashboardPage; 