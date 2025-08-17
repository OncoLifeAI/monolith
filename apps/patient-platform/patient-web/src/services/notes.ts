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

export const saveNewNotes = async (params: { content: string, title: string}) => {
  console.log('Saving note:', params);
  const body = {
    diary_entry: params.content,
    title: params.title,
  };
  console.log('Request body:', body);
  console.log('Posting to:', `${API_CONFIG.ENDPOINTS.NOTES}`);
  
  try {
    const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.NOTES}`, body);
    console.log('Save response:', response);
    return response.data;
  } catch (error) {
    console.error('Save request failed:', error);
    throw error;
  }
};

export const useSaveNewNotes = (year: number, month: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveNewNotes,
    onSuccess: (data) => {
      console.log('Note saved successfully:', data);
      // Invalidate and refetch notes for the current year/month
      queryClient.invalidateQueries({ queryKey: ['notes', year, month] });
    },
    onError: (error) => {
      console.error('Failed to save note to backend:', error);
    }
  });
};

export const updateNote = async (params: {noteId: string, diary_entry: string, title: string }) => {

  const body = {
    diary_entry: params.diary_entry,
    title: params.title,
  };

  const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.NOTES}/${params.noteId}`, body);
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

export const deleteNote = async (params: {noteId: string}) => {
  if (!params.noteId || params.noteId.trim() === '' || params.noteId === 'delete') {
    throw new Error('Invalid or missing note ID for deletion');
  }
  const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.NOTES}/${params.noteId}`);
  return response.data;
};

export const useDeleteNote = (year: number, month: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', year, month] });
    },
  });
};  