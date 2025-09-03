import React, { useMemo, useState, useEffect } from 'react';
import {
  Container,
  Header,
  Title,
  Content,
  PageHeader,
  PageTitle
} from '@oncolife/ui-components';
import {
  Button,
  Slider,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Download, ArrowLeft } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

import SymptomLineChart from '../../components/SymptomLineChart';
import { apiClient } from '../../utils/apiClient';
import { API_CONFIG } from '../../config/api';
import { useParams } from 'react-router-dom';

// Styled components

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 2rem;
  min-height: 100vh;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Sidebar = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
  min-width: 260px;
`;

const SidebarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const GraphContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SymptomDropdown = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop),
})<{ isOpen: boolean }>`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #374151;
  
  &:hover {
    border-color: #9ca3af;
  }
`;

const SymptomDropdownContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop),
})<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SymptomDropdownContainer = styled.div`
  position: relative;
`;

const SymptomOption = styled.div`
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f9fafb;
  }
`;

const SeveritySliderContainer = styled.div`
  margin: 1rem 0;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
`;



const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 360px;
  display: flex;
  flex-direction: column;
`;

const TableTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  padding: 1.5rem 1.5rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-y: auto;
  flex: 1 1 auto;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
  font-size: 0.875rem;
`;

// Unused styled components removed



type Conversation = {
  conversation_uuid: string;
  conversation_date: string; // YYYY-MM-DD
  symptom_list?: string[];
  severity_list?: Record<string, string>;
  medication_list?: { medicationName: string; symptom: string; cadence: string; response: string }[];
  conversation_state: string;
  overall_feeling?: string | null;
};

type ConversationsApi = {
  patient_uuid: string;
  date_range_start: string;
  date_range_end: string;
  total_conversations: number;
  conversations: Conversation[];
};

const DashboardDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = useParams<{ patientId: string }>();
  
  // Get patient name from navigation state
  const patientName = location.state?.patientName || 'Unknown Patient';
  
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severityRange, setSeverityRange] = useState<number[]>([1, 3]); // Mild to Severe
  const [isSymptomDropdownOpen, setIsSymptomDropdownOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);

  const fetchConversations = async () => {
    if (!patientId || !startDate || !endDate) return;
    try {
      setLoadingConversations(true);
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');
      const res = await apiClient.get<{ success: boolean; data: ConversationsApi }>(
        `${API_CONFIG.ENDPOINTS.PATIENT_DASHBOARD}/${patientId}/conversations?start_date=${start}&end_date=${end}`
      );
      const api = res.data.data;
      setConversations(api.conversations || []);
    } catch (e: any) {
      console.error('Failed to load conversations:', e);
    } finally {
      setLoadingConversations(false);
    }
  };

  const getSeverityValue = (severity: string): number => {
    const s = severity.toLowerCase();
    if (s.includes('very')) return 4;
    if (s.includes('critical')) return 4;
    if (s.includes('severe')) return 3;
    if (s.includes('moderate')) return 2;
    if (s.includes('mild')) return 1;
    if (s.includes('relieved') || s.includes('present')) return 0;
    return 0;
  };

  // Build chart series from conversations.severity_list
  const chartSeries = useMemo(() => {
    // Filters applied ONLY to graph as per spec
    if (!startDate || !endDate) return [] as { symptom: string; color: string; points: { date: string; value: number }[] }[];
      const startStr = startDate.format('YYYY-MM-DD');
      const endStr = endDate.format('YYYY-MM-DD');

    // Fixed palette (updated per request) in exact order of assignment
    const colorPalette = [
      '#DC143C', // Crimson
      '#4682B4', // Steel Blue
      '#DAA520', // Goldenrod
      '#800080', // Purple
      '#FF8C00', // Dark Orange
      '#4B0082', // Indigo
      '#228B22', // Forest Green
      '#C71585', // Medium Violet Red
      '#40E0D0', // Turquoise
      '#8B4513', // Saddle Brown
      '#4169E1', // Royal Blue
      '#556B2F', // Olive Green
      '#FF6F61', // Coral
      '#6A5ACD', // Slate Blue
      '#008080', // Teal
      '#708090'  // Slate Gray
    ];
    const symptomToSeries: Record<string, { symptom: string; color: string; points: { date: string; value: number }[] }> = {};

    conversations
      .filter(c => c.conversation_date >= startStr && c.conversation_date <= endStr)
      .forEach(c => {
        const sev = c.severity_list || {};
        Object.entries(sev).forEach(([symptom, severity]) => {
          if (selectedSymptoms.length > 0 && !selectedSymptoms.includes(symptom)) return;
          if (!symptomToSeries[symptom]) {
            const color = colorPalette[Object.keys(symptomToSeries).length % colorPalette.length];
            symptomToSeries[symptom] = { symptom, color, points: [] };
          }
          const value = getSeverityValue(severity || '');
          // Severity slider should NOT filter the graph per spec; always push
          symptomToSeries[symptom].points.push({ date: c.conversation_date, value });
        });
      });

    // Sort points by date
    Object.values(symptomToSeries).forEach(s => s.points.sort((a, b) => a.date.localeCompare(b.date)));
    return Object.values(symptomToSeries);
  }, [conversations, startDate, endDate, selectedSymptoms, severityRange]);

  // Get symptoms available in the selected date range
  const availableSymptoms = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const start = startDate.format('YYYY-MM-DD');
    const end = endDate.format('YYYY-MM-DD');
    
    const filteredConversations = conversations.filter(c => {
      const convDate = c.conversation_date;
      return convDate >= start && convDate <= end;
    });
    
    return Array.from(new Set(filteredConversations.flatMap(c => Object.keys(c.severity_list || {}))));
  }, [conversations, startDate, endDate]);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, startDate, endDate]);

  // Auto-load all symptoms when available symptoms change
  useEffect(() => {
    if (availableSymptoms.length > 0) {
      setSelectedSymptoms(availableSymptoms); // Load ALL symptoms by default
    }
  }, [availableSymptoms]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-symptom-dropdown]')) {
        setIsSymptomDropdownOpen(false);
      }
    };

    if (isSymptomDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSymptomDropdownOpen]);
  const handleAllSymptomsToggle = () => {
    if (selectedSymptoms.length === availableSymptoms.length) {
      setSelectedSymptoms([]); // Deselect all
    } else {
      setSelectedSymptoms(availableSymptoms); // Select all
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const getSymptomDisplayText = () => {
    if (selectedSymptoms.length === 0) return 'No symptoms selected';
    if (selectedSymptoms.length === availableSymptoms.length) return 'All Symptoms';
    return `${selectedSymptoms.length} selected`;
  };



  const handleDownloadReport = () => {
    const headers = ['Date', 'Symptom', 'Severity', 'Medication', 'Frequency', 'Helped'];
    const rows: string[] = [headers.join(',')];
    conversations.forEach(c => {
      const meds = c.medication_list && c.medication_list.length > 0 ? c.medication_list : [
        { medicationName: 'Anti-diarrheal', symptom: 'Diarrhea', cadence: 'As prescribed', response: 'Yes' }
      ];
      meds.forEach(m => {
        const severityStr = (c.severity_list && (m.symptom in c.severity_list)) ? (c.severity_list as any)[m.symptom] : 'mild';
        rows.push([
          c.conversation_date,
          m.symptom,
          String(severityStr).replace('_', ' '),
          `"${m.medicationName}"`,
          `"${m.cadence}"`,
          m.response
        ].join(','));
      });
    });
    const csvContent = rows.join('\n');
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
          <Title>Patient Dashboard</Title>
        </Header>

        <Content>
          <PageHeader>
            <PageTitle>{patientName}</PageTitle>
            <Box sx={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<Download size={16} />}
                onClick={handleDownloadReport}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Download Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={20} />}
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Box>
          </PageHeader>

          <MainContent>
            {/* Left Sidebar - Filters */}
            <Sidebar>
              <SidebarTitle>Filters</SidebarTitle>
              
                {/* Date Range */}
              <FilterSection>
                <FilterLabel>Start Date:</FilterLabel>
                  <DateRangeContainer>
                    <DatePicker
                      label="From"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{
                      textField: { 
                        size: 'small', 
                        fullWidth: true,
                        sx: { 
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.875rem'
                          }
                        }
                      }
                    }}
                  />
                </DateRangeContainer>
                
                <FilterLabel style={{ marginTop: '0.75rem' }}>End Date:</FilterLabel>
                <DateRangeContainer>
                    <DatePicker
                      label="To"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{
                      textField: { 
                        size: 'small', 
                        fullWidth: true,
                        sx: { 
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.875rem'
                          }
                        }
                      }
                      }}
                    />
                  </DateRangeContainer>
              </FilterSection>

                            {/* Symptom Type */}
              <FilterSection>
                <FilterLabel>Symptom Type:</FilterLabel>
                <SymptomDropdownContainer data-symptom-dropdown>
                  <SymptomDropdown 
                    isOpen={isSymptomDropdownOpen}
                    onClick={() => setIsSymptomDropdownOpen(!isSymptomDropdownOpen)}
                  >
                    <span>{getSymptomDisplayText()}</span>
                    <span style={{ transform: isSymptomDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </SymptomDropdown>
                  <SymptomDropdownContent isOpen={isSymptomDropdownOpen}>
                    <SymptomOption>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSymptoms.length === availableSymptoms.length}
                            indeterminate={selectedSymptoms.length > 0 && selectedSymptoms.length < availableSymptoms.length}
                            onChange={handleAllSymptomsToggle}
                        size="small"
                          />
                        }
                        label="All Symptoms"
                        sx={{ margin: 0, fontSize: '0.875rem' }}
                      />
                    </SymptomOption>
                    {availableSymptoms.map((symptom) => (
                      <SymptomOption key={symptom}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedSymptoms.includes(symptom)}
                              onChange={() => handleSymptomToggle(symptom)}
                              size="small"
                            />
                          }
                          label={symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                          sx={{ margin: 0, fontSize: '0.875rem' }}
                        />
                      </SymptomOption>
                    ))}
                  </SymptomDropdownContent>
                </SymptomDropdownContainer>
              </FilterSection>

                            {/* Overall Severity */}
              <FilterSection>
                <FilterLabel>Overall Severity:</FilterLabel>
                <SeveritySliderContainer>
                  <SliderLabel>
                    <span>Mild</span>
                    <span>Severe</span>
                  </SliderLabel>
                  <Slider
                    value={severityRange}
                    onChange={(_, newValue) => setSeverityRange(newValue as number[])}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => {
                      const labels = ['Relieved', 'Mild', 'Moderate', 'Severe', 'Critical'];
                      return labels[value] || '';
                    }}
                    min={1}
                    max={3}
                    step={1}
                    marks={[
                      { value: 1, label: 'Mild' },
                      { value: 2, label: 'Moderate' },
                      { value: 3, label: 'Severe' }
                    ]}
                          sx={{
                      color: '#0284c7',
                      '& .MuiSlider-thumb': {
                        height: 20,
                        width: 20,
                        backgroundColor: '#0284c7',
                        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                          boxShadow: '0px 0px 0px 8px rgba(2, 132, 199, 0.16)',
                        },
                      },
                      '& .MuiSlider-track': {
                        height: 6,
                        backgroundColor: '#0284c7',
                      },
                      '& .MuiSlider-rail': {
                        height: 6,
                        backgroundColor: '#e2e8f0',
                      },
                      '& .MuiSlider-mark': {
                        backgroundColor: '#64748b',
                        height: 8,
                        width: 8,
                        borderRadius: '50%',
                        '&.MuiSlider-markActive': {
                          backgroundColor: '#0284c7',
                        },
                      },
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginTop: '0.5rem',
                      },
                    }}
                  />
                </SeveritySliderContainer>
              </FilterSection>


            </Sidebar>

                        {/* Right Content Area */}
            <div>
              {/* Graph */}
              <GraphContainer>
                {loadingConversations ? (
                  <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    Loading chart…
                  </div>
                ) : (
                  <SymptomLineChart series={chartSeries} />
                )}
              </GraphContainer>

              {/* Medications Table */}
              <TableContainer>
                <TableTitle>Medications</TableTitle>
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Symptom Name</TableHeader>
                      <TableHeader>Severity</TableHeader>
                      <TableHeader>Medication Name</TableHeader>
                      <TableHeader>Medication Frequency</TableHeader>
                      <TableHeader>Medication Helped?</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.flatMap(c => {
                      const meds = c.medication_list && c.medication_list.length > 0 ? c.medication_list : [];
                      const fallback = meds.length === 0 ? [
                        { medicationName: 'Anti-diarrheal', symptom: 'Diarrhea', cadence: 'As prescribed', response: 'Yes' }
                      ] : meds;
                      return fallback.map((m, idx) => {
                        const severityStr = (c.severity_list && (m.symptom in c.severity_list)) ? (c.severity_list as any)[m.symptom] : 'mild';
                        const sevVal = getSeverityValue(String(severityStr));
                        if (sevVal < severityRange[0] || sevVal > severityRange[1]) return null;
                        return (
                          <tr key={`${c.conversation_uuid}-${idx}`}>
                            <TableCell>{new Date(c.conversation_date).toLocaleDateString()}</TableCell>
                            <TableCell style={{ textTransform: 'capitalize' }}>{m.symptom}</TableCell>
                            <TableCell style={{ textTransform: 'capitalize' }}>{String(severityStr)}</TableCell>
                            <TableCell>{m.medicationName}</TableCell>
                            <TableCell>{m.cadence}</TableCell>
                            <TableCell>{m.response}</TableCell>
                          </tr>
                        );
                      }).filter(Boolean);
                    })}
                  </tbody>
                </Table>
              </TableContainer>
                  </div>
          </MainContent>
        </Content>
      </Container>
    </LocalizationProvider>
  );
};

export default DashboardDetailsPage;
