import React, { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Container, Header, Title, Content } from '@patient-portal/ui-components';
import { Search, User, Calendar, FileText } from 'lucide-react';
import styled from 'styled-components';
import { usePatientSummaries } from '@patient-portal/api-client';
import { theme } from '@patient-portal/theme-lib';

// Styled components
const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;

const SearchField = styled(TextField)`
  flex: 1;
  max-width: 300px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: 0.875rem;
`;

const TableContainerStyled = styled(TableContainer)`
  margin-top: 1rem;
`;

const StatusChip = styled(Chip)<{ status: string }>`
  background-color: ${props => {
    switch (props.status) {
      case 'Active': return theme.colors.success;
      case 'Inactive': return theme.colors.error;
      default: return theme.colors.gray[400];
    }
  }};
  color: white;
  font-weight: 500;
`;

const DashboardPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rowsPerPage] = useState(10);

  const { data: patientSummaries, isLoading, error } = usePatientSummaries(
    page,
    searchTerm,
    statusFilter === 'all' ? '' : statusFilter
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Dashboard</Title>
        </Header>
        <Content>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Dashboard</Title>
        </Header>
        <Content>
          <Typography color="error">Error loading dashboard data</Typography>
        </Content>
      </Container>
    );
  }

  const totalPatients = patientSummaries?.total || 0;
  const activePatients = patientSummaries?.data?.filter(p => p.status === 'active').length || 0;
  const recentPatients = patientSummaries?.data?.filter(p => {
    const createdAt = new Date(p.lastUpdated);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt > weekAgo;
  }).length || 0;

  return (
    <Container>
      <Header>
        <Title>Dashboard</Title>
      </Header>
      <Content>
        <StatsGrid>
          <StatCard>
            <StatValue>{totalPatients}</StatValue>
            <StatLabel>Total Patients</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{activePatients}</StatValue>
            <StatLabel>Active Patients</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{recentPatients}</StatValue>
            <StatLabel>New This Week</StatLabel>
          </StatCard>
        </StatsGrid>

        <SearchContainer>
          <SearchField
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <FilterContainer>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </FilterContainer>
        </SearchContainer>

        <TableContainerStyled>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>MRN</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patientSummaries?.data?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <User size={16} />
                      {patient.patientName}
                    </Box>
                  </TableCell>
                  <TableCell>{patient.mrn}</TableCell>
                  <TableCell>
                    <StatusChip 
                      label={patient.status} 
                      status={patient.status}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Calendar size={16} />
                      {new Date(patient.lastUpdated).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <FileText size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainerStyled>

        {patientSummaries && patientSummaries.total > rowsPerPage && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(patientSummaries.total / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Content>
    </Container>
  );
};

export default DashboardPage; 