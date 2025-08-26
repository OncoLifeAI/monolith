import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

// API response interfaces matching the backend
export interface ConversationSummary {
  bulleted_summary?: string;
  symptom_list?: string[];
}

export interface DashboardPatientInfo {
  patient_uuid: string;
  full_name: string;
  dob?: string; // date string
  mrn?: string;
  last_conversation: ConversationSummary;
}

export interface ApiDashboardResponse {
  patients: DashboardPatientInfo[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Legacy interface for UI compatibility
export interface PatientSummary {
  id: string;
  patientName: string;
  dateOfBirth: string;
  mrn: string;
  symptoms: string;
  summary: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'pending';
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardResponse {
  data: PatientSummary[];
  total: number;
  page: number;
  totalPages: number;
}

// Mock data for development
const mockPatientSummaries: PatientSummary[] = [
  {
    id: '1',
    patientName: 'John Doe',
    dateOfBirth: 'January 1, 2001',
    mrn: 'A123456',
    symptoms: 'Fatigue, weight loss, localized pain',
    summary: 'The patient is a diagnosed case of breast cancer, currently under chemotherapy treatment. Presenting symptoms included fatigue, weight loss, and localized pain in the right breast area.',
    lastUpdated: 'April 19, 2025',
    status: 'active',
    priority: 'high'
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    dateOfBirth: 'March 15, 1985',
    mrn: 'B789012',
    symptoms: 'Chest pain, shortness of breath',
    summary: 'Patient diagnosed with lung cancer, currently receiving radiotherapy. Experiencing chest pain and shortness of breath.',
    lastUpdated: 'April 18, 2025',
    status: 'active',
    priority: 'medium'
  },
  {
    id: '3',
    patientName: 'Robert Johnson',
    dateOfBirth: 'July 22, 1978',
    mrn: 'C345678',
    symptoms: 'Abdominal discomfort, changes in bowel habits',
    summary: 'Colon cancer diagnosis, post-surgical follow-up. Monitoring for any recurrence signs.',
    lastUpdated: 'April 17, 2025',
    status: 'active',
    priority: 'low'
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    dateOfBirth: 'November 8, 1992',
    mrn: 'D901234',
    symptoms: 'Headaches, vision changes',
    summary: 'Brain tumor case, currently under observation. Regular monitoring of neurological symptoms.',
    lastUpdated: 'April 16, 2025',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '5',
    patientName: 'Michael Brown',
    dateOfBirth: 'September 12, 1965',
    mrn: 'E567890',
    symptoms: 'Bone pain, fractures',
    summary: 'Multiple myeloma diagnosis, receiving targeted therapy. Managing bone pain and monitoring for fractures.',
    lastUpdated: 'April 15, 2025',
    status: 'active',
    priority: 'medium'
  },
  {
    id: '6',
    patientName: 'Emily Davis',
    dateOfBirth: 'February 28, 1989',
    mrn: 'F123789',
    symptoms: 'Skin lesions, itching',
    summary: 'Melanoma case, post-excision monitoring. Regular skin checks and follow-up appointments.',
    lastUpdated: 'April 14, 2025',
    status: 'active',
    priority: 'low'
  },
  {
    id: '7',
    patientName: 'David Miller',
    dateOfBirth: 'May 10, 1972',
    mrn: 'G456123',
    symptoms: 'Back pain, weakness in legs',
    summary: 'Spinal cord tumor, post-operative care. Physical therapy ongoing for mobility improvement.',
    lastUpdated: 'April 13, 2025',
    status: 'active',
    priority: 'medium'
  },
  {
    id: '8',
    patientName: 'Lisa Anderson',
    dateOfBirth: 'December 3, 1983',
    mrn: 'H789456',
    symptoms: 'Irregular periods, pelvic pain',
    summary: 'Ovarian cancer diagnosis, chemotherapy treatment. Monitoring for treatment response and side effects.',
    lastUpdated: 'April 12, 2025',
    status: 'active',
    priority: 'high'
  }
];

// Helper function to convert API response to UI format
const convertApiResponseToUIFormat = (apiResponse: ApiDashboardResponse): DashboardResponse => {
  const convertedPatients: PatientSummary[] = apiResponse.patients.map(patient => ({
    id: patient.patient_uuid,
    patientName: patient.full_name,
    dateOfBirth: patient.dob ? new Date(patient.dob).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'N/A',
    mrn: patient.mrn || 'N/A',
    symptoms: patient.last_conversation.symptom_list?.join(', ') || 'N/A',
    summary: patient.last_conversation.bulleted_summary || 'No summary available',
    lastUpdated: 'Recent', // TODO: Add last_updated field to API
    status: 'active' as const, // TODO: Add status field to API
    priority: 'medium' as const // TODO: Add priority field to API
  }));

  return {
    data: convertedPatients,
    total: apiResponse.total_count,
    page: apiResponse.page,
    totalPages: apiResponse.total_pages
  };
};

const fetchPatientSummaries = async (
  page: number = 1, 
  search: string = '', 
  filter: string = 'all'
): Promise<DashboardResponse> => {
  try {
    // TODO: For now using a mock staff_uuid - this should come from user context
    const staff_uuid = 'mock-staff-uuid-123';
    
    const params = new URLSearchParams({
      staff_uuid,
      page: page.toString(),
      page_size: '10' // Adjust as needed
    });

    console.log('Attempting to fetch dashboard data from API...');
    const response = await apiClient.get<{ success: boolean; data: ApiDashboardResponse }>(
      `${API_CONFIG.ENDPOINTS.DASHBOARD}?${params.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    console.log('Successfully fetched data from API:', response.data);
    const convertedResponse = convertApiResponseToUIFormat(response.data.data);
    
    // Apply client-side search filter (until API supports it)
    let filteredData = convertedResponse.data;
    if (search) {
      filteredData = filteredData.filter(patient => 
        patient.patientName.toLowerCase().includes(search.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      ...convertedResponse,
      data: filteredData
    };
    
  } catch (error) {
    console.warn('API not available or requires authentication, falling back to mock data:', error);
    // Fallback to mock data in case of error (API not ready, authentication issues, etc.)
    return fetchMockData(page, search, filter);
  }
};

// Fallback mock data function
const fetchMockData = async (
  page: number = 1, 
  search: string = '', 
  filter: string = 'all'
): Promise<DashboardResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filteredData = mockPatientSummaries;
  
  if (search) {
    filteredData = filteredData.filter(patient => 
      patient.patientName.toLowerCase().includes(search.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (filter && filter !== 'all') {
    filteredData = filteredData.filter(patient => patient.status === filter);
  }
  
  const itemsPerPage = 4;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: filteredData.length,
    page,
    totalPages: Math.ceil(filteredData.length / itemsPerPage)
  };
};

export const usePatientSummaries = (
  page: number = 1, 
  search: string = '', 
  filter: string = 'all'
) => {
  return useQuery({
    queryKey: ['patientSummaries', page, search, filter],
    queryFn: () => fetchPatientSummaries(page, search, filter),
  });
};

// Fetch individual patient details
const fetchPatientDetails = async (patientId: string): Promise<PatientSummary> => {
  // For now, return mock data
  // In production, this would be:
  // const response = await apiClient.get<PatientSummary>(
  //   `${API_CONFIG.ENDPOINTS.DASHBOARD}/patients/${patientId}`
  // );
  // return response.data;
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const patient = mockPatientSummaries.find(p => p.id === patientId);
  if (!patient) {
    throw new Error('Patient not found');
  }
  
  return patient;
};

export const usePatientDetails = (patientId: string) => {
  return useQuery({
    queryKey: ['patientDetails', patientId],
    queryFn: () => fetchPatientDetails(patientId),
    enabled: !!patientId,
  });
}; 