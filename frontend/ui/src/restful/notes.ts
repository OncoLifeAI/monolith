import { apiClient } from "../utils/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const saveNewNotes = async (params: { content: string}) => {
  const body = {
    diary_entry: params.content,
  };
  const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.NOTES}`, body);
  return response.data;
};

export const useSaveNewNotes = (year: number, month: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveNewNotes,
    onSuccess: () => {
      // Invalidate and refetch notes for the current year/month
      queryClient.invalidateQueries({ queryKey: ['notes', year, month] });
    },
  });
};

export const updateNote = async (params: {noteId: string, diary_entry: string}) => {

  const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.NOTES}/${params.noteId}`, params);
  return response.data;
};

export const useUpdateNote = (year: number, month: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', year, month] });
    },
  });
};  