import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

export interface Summary {
  uuid: string;
  overall_feeling: string;
  created_at: string;
  bulleted_summary: string;
  longer_summary: string;
  symptom_list?: string[];
  severity_list?: { [key: string]: any };
  medication_list?: any[];
  // Add other fields as needed
}

const fetchSummaries = async (year: number, month: number): Promise<{data:Summary[]}> => {
  const response = await apiClient.get<{data:Summary[]}>(
    `${API_CONFIG.ENDPOINTS.SUMMARIES}/${year}/${month}`
  );
  return response.data;
};

export const useSummaries = (year: number, month: number) => {
  return useQuery({
    queryKey: ['summaries', year, month],
    queryFn: () => fetchSummaries(year, month),
    enabled: !!year && !!month,
  });
};


const fetchSummaryDetails = async (summaryId: string): Promise<Summary> => {
  try {
    // The API client returns { data: { data: Summary } }, so we need to access the nested data
    const response = await apiClient.get<{ data: Summary }>(
    `${API_CONFIG.ENDPOINTS.SUMMARIES}/${summaryId}`
  );
    
    // Return the nested data
    return response.data.data;
  } catch (error) {
    console.error('Summary Details API Error:', error);
    throw error;
  }
};

export const useSummaryDetails = (summaryId: string) => {
    return useQuery({
        queryKey: ['summaryDetails', summaryId],
        queryFn: () => fetchSummaryDetails(summaryId),
        enabled: !!summaryId,
    });
};