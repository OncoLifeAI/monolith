/**
 * Patient Service - Connected to Real API
 * 
 * This service connects to the real patient API endpoints at /patients/*
 * 
 * API endpoints are available in doctor-api and connected to frontend.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

// API response interfaces matching the backend
export interface ApiPatient {
  uuid: string;
  mrn: string;
  first_name: string;
  last_name: string;
  email: string;
  dob?: string;
  sex?: string;
}

export interface ApiPatientsResponse {
  patients: ApiPatient[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Frontend interface for UI compatibility
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mrn: string;
  dateOfBirth: string;
  sex: 'Male' | 'Female' | 'Other';
  race: string;
  phoneNumber: string;
  physician: string;
  diseaseType: string;
  associateClinic: string;
  treatmentType: string;
}

export interface PatientsResponse {
  data: Patient[];
  total: number;
  page: number;
  totalPages: number;
}

// Helper function to convert API response to UI format
const convertApiResponseToUIFormat = (apiResponse: ApiPatientsResponse): PatientsResponse => {
  const convertedPatients: Patient[] = apiResponse.patients.map(patient => ({
    id: patient.uuid,
    firstName: patient.first_name,
    lastName: patient.last_name,
    email: patient.email,
    mrn: patient.mrn,
    dateOfBirth: patient.dob ? new Date(patient.dob).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'N/A',
    sex: (patient.sex as 'Male' | 'Female' | 'Other') || 'Other',
    race: 'N/A', // Not available in API response
    phoneNumber: 'N/A', // Not available in API response
    physician: 'N/A', // Not available in API response
    diseaseType: 'N/A', // Not available in API response
    associateClinic: 'N/A', // Not available in API response
    treatmentType: 'N/A' // Not available in API response
  }));

  return {
    data: convertedPatients,
    total: apiResponse.total_count,
    page: apiResponse.page,
    totalPages: apiResponse.total_pages
  };
};

// Fetch patients from API
const fetchPatients = async (
  page: number = 1, 
  search: string = '',
  rowsPerPage: number = 10
): Promise<PatientsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: rowsPerPage.toString()
    });

    const url = `${API_CONFIG.ENDPOINTS.PATIENTS.LIST}?${params.toString()}`;
    console.log('🔍 Fetching patients from API:', url);
    console.log('🔍 API_CONFIG.ENDPOINTS.PATIENTS.LIST:', API_CONFIG.ENDPOINTS.PATIENTS.LIST);
    
    const response = await apiClient.get<{ success: boolean; data: ApiPatientsResponse }>(url);
    
    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    console.log('Successfully fetched patients from API:', response.data);
    const convertedResponse = convertApiResponseToUIFormat(response.data.data);
    
    // Apply client-side search filter (until API supports it)
    let filteredData = convertedResponse.data;
    if (search) {
      filteredData = filteredData.filter(patient => 
        patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
        patient.email.toLowerCase().includes(search.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      ...convertedResponse,
      data: filteredData
    };
    
  } catch (error) {
    console.error('Patients API error:', error);
    throw error;
  }
};

// React Query hook for fetching patients
export const usePatients = (
  page: number = 1, 
  search: string = '',
  rowsPerPage: number = 10
) => {
  return useQuery({
    queryKey: ['patients', page, search, rowsPerPage],
    queryFn: () => fetchPatients(page, search, rowsPerPage),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });
};

// Add patient mutation
const addPatient = async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
  try {
    console.log('Adding new patient:', patientData);
    
    const response = await apiClient.post<{ success: boolean; data: any }>(
      API_CONFIG.ENDPOINTS.PATIENTS.CREATE,
      {
        email_address: patientData.email,
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        sex: patientData.sex,
        dob: patientData.dateOfBirth,
        mrn: patientData.mrn,
        ethnicity: patientData.race,
        phone_number: patientData.phoneNumber,
        disease_type: patientData.diseaseType,
        treatment_type: patientData.treatmentType,
        physician_uuid: 'mock-physician-uuid', // TODO: Get from context
        clinic_uuid: 'mock-clinic-uuid' // TODO: Get from context
      }
    );
    
    if (!response.data.success) {
      throw new Error('Failed to add patient');
    }
    
    console.log('Successfully added patient:', response.data);
    
    // Return the new patient with generated ID
    return {
      ...patientData,
      id: response.data.data.patient_uuid || 'new-patient-id'
    };
    
  } catch (error) {
    console.error('Add patient API error:', error);
    throw error;
  }
};

export const useAddPatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addPatient,
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Add patient error:', error);
    },
  });
};

// Edit patient mutation
const editPatient = async ({ id, ...patientData }: Partial<Patient> & { id: string }): Promise<Patient> => {
  try {
    console.log('Editing patient:', id, patientData);
    
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `${API_CONFIG.ENDPOINTS.PATIENTS.UPDATE}/${id}`,
      {
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        sex: patientData.sex,
        dob: patientData.dateOfBirth,
        ethnicity: patientData.race,
        phone_number: patientData.phoneNumber,
        disease_type: patientData.diseaseType,
        treatment_type: patientData.treatmentType
      }
    );
    
    if (!response.data.success) {
      throw new Error('Failed to edit patient');
    }
    
    console.log('Successfully edited patient:', response.data);
    
    // Return the updated patient
    return {
      id,
      ...patientData
    } as Patient;
    
  } catch (error) {
    console.error('Edit patient API error:', error);
    throw error;
  }
};

export const useEditPatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: editPatient,
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Edit patient error:', error);
    },
  });
};

// Delete patient mutation
const deletePatient = async (patientId: string): Promise<void> => {
  try {
    console.log('Deleting patient:', patientId);
    
    const response = await apiClient.delete<{ success: boolean }>(
      `${API_CONFIG.ENDPOINTS.PATIENTS.DELETE}/${patientId}`
    );
    
    if (!response.data.success) {
      throw new Error('Failed to delete patient');
    }
    
    console.log('Successfully deleted patient:', patientId);
    
  } catch (error) {
    console.error('Delete patient API error:', error);
    throw error;
  }
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Delete patient error:', error);
    },
  });
};
