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

// Removed mock data - now using real API data

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
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: '10' // Adjust as needed
    });

    console.log('Fetching dashboard data from API...');
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
    console.error('Dashboard API error:', error);
    throw error; // Let the UI handle the error instead of falling back to mock data
  }
};

// Removed mock data function - now using real API only

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

// Patient details functionality removed - not currently needed
// Can be added back when individual patient detail views are implemented 