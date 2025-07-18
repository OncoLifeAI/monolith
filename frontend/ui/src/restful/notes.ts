import { apiClient } from "../utils/apiClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_CONFIG } from "../config/api";

export const fetchNotes = async (year: number, month: number) => {
  const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.NOTES}/${year}/${month}`);
  return response.data;
};

export const useFetchNotes = (year: number, month: number) => {
  return useQuery({
    queryKey: ['notes', year, month],
    queryFn: () => fetchNotes(year, month),
    enabled: !!year && !!month,
  });
};

export const saveNewNotes = async (params: {year: number, month: number, title: string, content: string}) => {
  const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.NOTES}`, params);
  return response.data;
};

export const useSaveNewNotes = () => {
  return useMutation({
    mutationFn: saveNewNotes,
  });
};

export const updateNote = async (params: {noteId: string, title: string, content: string}) => {
  const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.NOTES}/${params.noteId}`, params);
  return response.data;
};

export const useUpdateNote = () => {
  return useMutation({
    mutationFn: updateNote,
  });
};  