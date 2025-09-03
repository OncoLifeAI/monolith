import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

// API response interfaces matching the backend
export interface ConversationSummary {
  bulleted_summary?: string;
  symptom_list?: string[];
  conversation_state?: string;
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
  last_conversation_state?: string;
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
  console.debug('dashboard.ts: raw API response', apiResponse);
  const convertedPatients: PatientSummary[] = apiResponse.patients.map(patient => ({
    id: patient.patient_uuid,
    patientName: patient.full_name,
    dateOfBirth: patient.dob ? new Date(patient.dob).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'N/A',
    mrn: patient.mrn || 'N/A',
    symptoms: patient.last_conversation?.symptom_list?.length ? patient.last_conversation.symptom_list.join(', ') : 'N/A',
    summary: patient.last_conversation?.bulleted_summary?.trim() || 'No summary available',
    lastUpdated: '',
    status: 'active' as const, // TODO: Add status field to API
    priority: 'medium' as const, // TODO: Add priority field to API
    last_conversation_state: patient.last_conversation?.conversation_state
  }));

  return {
    data: convertedPatients,
    total: apiResponse.total_count,
    page: apiResponse.page,
    totalPages: apiResponse.total_pages
  };
};

const fetchPatientSummaries = async (
  page: number = 1
): Promise<DashboardResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: '10' // Adjust as needed
    });

    const response = await apiClient.get<{ success: boolean; data: ApiDashboardResponse }>(
      `${API_CONFIG.ENDPOINTS.DASHBOARD}?${params.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    const convertedResponse = convertApiResponseToUIFormat(response.data.data);
    return convertedResponse;
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    throw error; // Let the UI handle the error instead of falling back to mock data
  }
};

// Removed mock data function - now using real API only

export const usePatientSummaries = (
  page: number = 1, 
  search: string = '', 
  _filter: string = 'all'
) => {
  return useQuery({
    // Only key by page so typing in search does NOT refetch
    queryKey: ['patientSummaries', page],
    queryFn: () => fetchPatientSummaries(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (React Query v5)
    refetchOnWindowFocus: false,
    // Apply client-side filtering on cached data
    select: (resp: DashboardResponse): DashboardResponse => {
      let filtered = resp.data;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.patientName.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q)
        );
      }
      // Placeholder for future status filtering
      // if (filter !== 'all') filtered = ...
      return { ...resp, data: filtered };
    }
  });
};

// Patient details functionality removed - not currently needed
// Can be added back when individual patient detail views are implemented 