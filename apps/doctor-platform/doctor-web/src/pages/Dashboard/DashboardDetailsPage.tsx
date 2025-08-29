import React, { useState, useMemo } from 'react';
import {
  Container,
  Header,
  Title,
  Content,
  PageHeader,
  PageTitle
} from '@oncolife/ui-components';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Download, ArrowLeft, User } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import styled from 'styled-components';
import { theme } from '@oncolife/ui-components';
import { useLocation, useNavigate } from 'react-router-dom';

import SymptomLineChart from '../../components/SymptomLineChart';
import SymptomDataTable from '../../components/SymptomDataTable';
import {
  mockSymptomEntries,
  transformDataForChart,
  symptomOptions,
  numberToSeverity
} from '../../data';

// Styled components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ControlsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;



const SymptomSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SelectedSymptomsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  
  @media (min-width: 1200px) {
    align-items: flex-end;
    justify-content: flex-end;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  font-weight: 500;
`;

const PatientInfoBanner = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary || '#1976d2'});
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const PatientDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PatientName = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const PatientMeta = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const BackButton = styled(Button)`
  && {
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
    &:hover {
      border-color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;



const DashboardDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patientId = location.state?.patientId;
  
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs('2024-01-15'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs('2024-01-31'));
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['fever', 'pain']);
  const [severityRange, setSeverityRange] = useState<number[]>([0, 4]);

  // Mock patient data - in a real app, this would come from an API
  const getPatientInfo = (id: string) => {
    const mockPatients = {
      '1': { name: 'John Doe', mrn: 'MRN001', dob: '1985-03-15' },
      '2': { name: 'Jane Smith', mrn: 'MRN002', dob: '1990-07-22' },
      '3': { name: 'Mike Johnson', mrn: 'MRN003', dob: '1978-11-08' },
    };
    return mockPatients[id as keyof typeof mockPatients] || null;
  };

  const patientInfo = patientId ? getPatientInfo(patientId) : null;

  // Helper function to convert severity to numeric value
  const getSeverityValue = (severity: string): number => {
    switch (severity) {
      case 'symptom_relieved': return 0;
      case 'mild': return 1;
      case 'moderate': return 2;
      case 'severe': return 3;
      case 'very_severe': return 4;
      default: return 0;
    }
  };

  // Filter data based on selected criteria
  const filteredData = useMemo(() => {
    let filtered = mockSymptomEntries;

    // TODO: In a real application, filter by patientId when available
    // if (patientId) {
    //   filtered = filtered.filter(entry => entry.patientId === patientId);
    // }

    // Filter by date range
    if (startDate && endDate) {
      const startStr = startDate.format('YYYY-MM-DD');
      const endStr = endDate.format('YYYY-MM-DD');
      filtered = filtered.filter(entry => 
        entry.date >= startStr && entry.date <= endStr
      );
    }

    // Filter by selected symptoms
    if (selectedSymptoms.length > 0) {
      filtered = filtered.filter(entry =>
        selectedSymptoms.includes(entry.symptomName)
      );
    }

    // Filter by severity range
    filtered = filtered.filter(entry => {
      const severityValue = getSeverityValue(entry.severity);
      return severityValue >= severityRange[0] && severityValue <= severityRange[1];
    });

    return filtered;
  }, [startDate, endDate, selectedSymptoms, severityRange]);

  // Transform data for chart
  const chartData = useMemo(() => {
    // filteredData is already filtered by date range and severity, just transform for chart
    return transformDataForChart(filteredData, undefined, undefined, selectedSymptoms);
  }, [filteredData, selectedSymptoms]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = filteredData.length;
    const uniqueDates = new Set(filteredData.map(entry => entry.date)).size;
    const medicationHelped = filteredData.filter(entry => entry.medicationHelped).length;
    const helpRate = totalEntries > 0 ? Math.round((medicationHelped / totalEntries) * 100) : 0;

    return {
      totalEntries,
      uniqueDates,
      helpRate,
      avgSeverity: totalEntries > 0 
        ? (filteredData.reduce((sum, entry) => sum + getSeverityValue(entry.severity), 0) / totalEntries).toFixed(1)
        : '0'
    };
  }, [filteredData]);

  const handleSymptomChange = (event: any) => {
    const value = event.target.value;
    setSelectedSymptoms(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSymptomRemove = (symptomToRemove: string) => {
    setSelectedSymptoms(prev => prev.filter(symptom => symptom !== symptomToRemove));
  };



  const handleDownloadReport = () => {
    // Create CSV content
    const headers = ['Date', 'Symptom', 'Severity', 'Medication', 'Frequency', 'Helped'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(entry => [
        entry.date,
        entry.symptomName,
        entry.severity.replace('_', ' '),
        `"${entry.medicationName}"`,
        `"${entry.medicationFrequency}"`,
        entry.medicationHelped ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `symptom-report-${dayjs().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container>
        <Header>
          <Title>Dashboard Details</Title>
        </Header>

        <Content>
          <PageHeader>
            <PageTitle>
              {patientInfo 
                ? `Symptom Analysis - ${patientInfo.name}` 
                : 'Symptom Tracking & Analysis'
              }
            </PageTitle>
            {!patientInfo && (
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={20} />}
                onClick={() => navigate('/dashboard')}
                sx={{ marginLeft: 'auto' }}
              >
                Back to Dashboard
              </Button>
            )}
          </PageHeader>

          <DashboardContainer>
            {/* Patient Info Banner */}
            {patientInfo && (
              <PatientInfoBanner>
                <PatientDetails>
                  <User size={24} />
                  <div>
                    <PatientName>{patientInfo.name}</PatientName>
                    <PatientMeta>
                      MRN: {patientInfo.mrn} | DOB: {new Date(patientInfo.dob).toLocaleDateString()}
                    </PatientMeta>
                  </div>
                </PatientDetails>
                <BackButton
                  variant="outlined"
                  startIcon={<ArrowLeft size={20} />}
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </BackButton>
              </PatientInfoBanner>
            )}
            {/* Controls */}
            <ControlsContainer>
              <ControlsGrid>
                {/* Date Range */}
                <div>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Date Range
                  </Typography>
                  <DateRangeContainer>
                    <DatePicker
                      label="From"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{
                        textField: { size: 'small', sx: { minWidth: 140 } }
                      }}
                    />
                    <DatePicker
                      label="To"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{
                        textField: { size: 'small', sx: { minWidth: 140 } }
                      }}
                    />
                  </DateRangeContainer>
                </div>

                {/* Symptom Selection */}
                <SymptomSelectContainer>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Select Symptoms
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Symptoms</InputLabel>
                    <Select
                      multiple
                      value={selectedSymptoms}
                      onChange={handleSymptomChange}
                      label="Symptoms"
                      renderValue={(selected) => `${selected.length} selected`}
                    >
                      {symptomOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <SelectedSymptomsContainer>
                    {selectedSymptoms.map((symptom) => (
                      <Chip
                        key={symptom}
                        label={symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                        onDelete={() => handleSymptomRemove(symptom)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </SelectedSymptomsContainer>
                </SymptomSelectContainer>

                {/* Modern Severity Filter */}
                <div style={{ minWidth: '300px' }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ marginBottom: '1rem', color: theme.colors.gray[800] }}>
                    Severity Filter
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#fafbfc',
                    borderRadius: '12px',
                    border: `1px solid ${theme.colors.gray[200]}`,
                  }}>
                    {[
                      { value: 0, label: 'Relieved', color: '#059669', bgColor: '#ecfdf5' },
                      { value: 1, label: 'Mild', color: '#d97706', bgColor: '#fffbeb' },
                      { value: 2, label: 'Moderate', color: '#ea580c', bgColor: '#fff7ed' },
                      { value: 3, label: 'Severe', color: '#dc2626', bgColor: '#fef2f2' },
                      { value: 4, label: 'Critical', color: '#991b1b', bgColor: '#fef2f2' }
                    ].map((severity) => {
                      const isInRange = severity.value >= severityRange[0] && severity.value <= severityRange[1];
                      return (
                        <Box
                          key={severity.value}
                          onClick={() => {
                            if (isInRange) {
                              // If clicking on an edge, shrink range
                              if (severity.value === severityRange[0] && severityRange[0] < severityRange[1]) {
                                setSeverityRange([severityRange[0] + 1, severityRange[1]]);
                              } else if (severity.value === severityRange[1] && severityRange[0] < severityRange[1]) {
                                setSeverityRange([severityRange[0], severityRange[1] - 1]);
                              }
                            } else {
                              // Expand range to include this severity
                              setSeverityRange([
                                Math.min(severityRange[0], severity.value),
                                Math.max(severityRange[1], severity.value)
                              ]);
                            }
                          }}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '8px 4px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            backgroundColor: isInRange ? severity.color : 'white',
                            color: isInRange ? 'white' : severity.color,
                            border: `2px solid ${isInRange ? severity.color : theme.colors.gray[200]}`,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: isInRange ? 'transparent' : severity.bgColor,
                              opacity: isInRange ? 0 : 0.3,
                              transition: 'opacity 0.2s ease',
                            },
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${isInRange ? severity.color + '40' : 'rgba(0,0,0,0.1)'}`,
                              '&::before': {
                                opacity: isInRange ? 0 : 0.6,
                              }
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            }
                          }}
                        >
                          {/* Severity Icon/Indicator */}
                          <Box sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: isInRange ? 'rgba(255,255,255,0.3)' : severity.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: isInRange ? 'white' : 'white',
                            zIndex: 1,
                            position: 'relative'
                          }}>
                            {severity.value + 1}
                          </Box>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.65rem',
                              fontWeight: isInRange ? 600 : 500,
                              textAlign: 'center',
                              lineHeight: 1.2,
                              zIndex: 1,
                              position: 'relative'
                            }}
                          >
                            {severity.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  
                  {/* Modern Range Display */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginTop: '12px',
                    padding: '6px 12px',
                    backgroundColor: theme.colors.primary + '10',
                    borderRadius: '20px',
                    border: `1px solid ${theme.colors.primary}20`
                  }}>
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: theme.colors.primary,
                      textAlign: 'center'
                    }}>
                      Showing: {numberToSeverity[severityRange[0] as keyof typeof numberToSeverity]} → {numberToSeverity[severityRange[1] as keyof typeof numberToSeverity]}
                    </Typography>
                  </Box>
                </div>

                {/* Download Button */}
                <ActionButtonsContainer>
                  <div>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ marginBottom: '0.5rem' }}>
                      Export Data
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Download size={18} />}
                      onClick={handleDownloadReport}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      Download Report
                    </Button>
                  </div>
                </ActionButtonsContainer>
              </ControlsGrid>
            </ControlsContainer>

            {/* Statistics */}
            <StatsContainer>
              <StatCard>
                <StatValue>{stats.totalEntries}</StatValue>
                <StatLabel>Total Records</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.uniqueDates}</StatValue>
                <StatLabel>Days Tracked</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.helpRate}%</StatValue>
                <StatLabel>Medication Success Rate</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.avgSeverity}</StatValue>
                <StatLabel>Average Severity</StatLabel>
              </StatCard>
            </StatsContainer>

            {/* Chart */}
            <SymptomLineChart 
              data={chartData} 
              selectedSymptoms={selectedSymptoms}
            />

            {/* Data Table */}
            <SymptomDataTable data={filteredData} />
          </DashboardContainer>
        </Content>
      </Container>
    </LocalizationProvider>
  );
};

export default DashboardDetailsPage;
