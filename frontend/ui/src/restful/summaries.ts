import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

export interface Summary {
  uuid: string;
  overall_feeling: string;
  created_at: string;
  bulleted_summary: string;
  longer_summary: string;
  // Add other fields as needed
}

const fetchSummaries = async (year: number, month: number): Promise<Summary[]> => {
  const response = await apiClient.get<Summary[]>(
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
  // The API client returns { data: Summary }, so we unwrap it here.
  const response = await apiClient.get<Summary>(
    `${API_CONFIG.ENDPOINTS.SUMMARIES}/${summaryId}`
  );
  return response.data;
};

export const useSummaryDetails = (summaryId: string) => {
    return useQuery({
        queryKey: ['summaryDetails', summaryId],
        queryFn: () => fetchSummaryDetails(summaryId),
        enabled: !!summaryId,
    });
};