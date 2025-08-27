/**
 * Staff Service - Connected to Real API
 * 
 * This service connects to the real staff API endpoints at /staff/*
 * 
 * API endpoints are available in doctor-api and connected to frontend.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api';

// API response interfaces matching the backend
export interface ApiStaff {
  staff_uuid: string;
  first_name: string;
  last_name: string;
  email_address: string;
  role: string;
}

export interface ApiStaffResponse {
  staff: ApiStaff[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Frontend interface for UI compatibility
export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  clinicName?: string;
  npiNumber?: string;
}

export interface StaffListResponse {
  data: Staff[];
  total: number;
  page: number;
  page_size: number;
}

export interface AddStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  clinicName?: string;
  npiNumber?: string;
}

export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  clinicName?: string;
  npiNumber?: string;
}

// Convert API response to UI format
const convertApiResponseToUIFormat = (apiResponse: ApiStaffResponse): StaffListResponse => {
  const convertedData = apiResponse.staff.map(staff => ({
    id: staff.staff_uuid,
    firstName: staff.first_name || '',
    lastName: staff.last_name || '',
    email: staff.email_address || '',
    role: staff.role || '',
    clinicName: 'Default Clinic', // TODO: Get from API when available
    npiNumber: undefined // TODO: Get from API when available
  }));

  return {
    data: convertedData,
    total: apiResponse.total_count,
    page: apiResponse.page,
    page_size: apiResponse.page_size
  };
};

// Fetch staff from API
const fetchStaff = async (
  page: number = 1, 
  search: string = '',
  rowsPerPage: number = 10
): Promise<StaffListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: rowsPerPage.toString()
    });

    const url = `${API_CONFIG.ENDPOINTS.STAFF.LIST}?${params.toString()}`;
    console.log('🔍 Fetching staff from API:', url);
    
    const response = await apiClient.get<{ success: boolean; data: ApiStaffResponse }>(url);
    
    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    console.log('Successfully fetched staff from API:', response.data);
    const convertedResponse = convertApiResponseToUIFormat(response.data.data);
    
    // Apply client-side search filter (until API supports it)
    let filteredData = convertedResponse.data;
    if (search) {
      filteredData = filteredData.filter(staff => 
        staff.firstName.toLowerCase().includes(search.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(search.toLowerCase()) ||
        staff.email.toLowerCase().includes(search.toLowerCase()) ||
        staff.role.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      ...convertedResponse,
      data: filteredData
    };
    
  } catch (error) {
    console.error('Staff API error:', error);
    throw error;
  }
};

// Add new staff
const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<Staff> => {
  try {
    console.log('Adding new staff:', staffData);
    
    const response = await apiClient.post<{ success: boolean; data: any }>(
      API_CONFIG.ENDPOINTS.STAFF.CREATE,
      {
        email_address: staffData.email,
        first_name: staffData.firstName,
        last_name: staffData.lastName,
        role: staffData.role,
        npi_number: staffData.npiNumber,
        physician_uuid: 'mock-physician-uuid', // TODO: Get from context
        clinic_uuid: 'mock-clinic-uuid' // TODO: Get from context
      }
    );
    
    if (!response.data.success) {
      throw new Error('Failed to add staff');
    }
    
    console.log('Successfully added staff:', response.data);
    
    // Return the new staff with generated ID
    return {
      ...staffData,
      id: response.data.data.staff_uuid || 'new-staff-id'
    };
    
  } catch (error) {
    console.error('Add staff API error:', error);
    throw error;
  }
};

// Edit staff
const editStaff = async (staffId: string, staffData: Partial<Staff>): Promise<Staff> => {
  try {
    console.log('Editing staff:', staffId, staffData);
    
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `${API_CONFIG.ENDPOINTS.STAFF.UPDATE}/${staffId}`,
      {
        email_address: staffData.email,
        first_name: staffData.firstName,
        last_name: staffData.lastName,
        role: staffData.role,
        npi_number: staffData.npiNumber
      }
    );
    
    if (!response.data.success) {
      throw new Error('Failed to edit staff');
    }
    
    console.log('Successfully edited staff:', response.data);
    
    // Return the updated staff
    return {
      id: staffId,
      firstName: staffData.firstName || '',
      lastName: staffData.lastName || '',
      email: staffData.email || '',
      role: staffData.role || '',
      clinicName: staffData.clinicName,
      npiNumber: staffData.npiNumber
    };
    
  } catch (error) {
    console.error('Edit staff API error:', error);
    throw error;
  }
};

// React Query hooks
export const useStaff = (
  page: number = 1, 
  search: string = '',
  rowsPerPage: number = 10
) => {
  return useQuery({
    queryKey: ['staff', page, search, rowsPerPage],
    queryFn: () => fetchStaff(page, search, rowsPerPage),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addStaff,
    onSuccess: () => {
      // Invalidate and refetch staff list
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useEditStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ staffId, staffData }: { staffId: string; staffData: Partial<Staff> }) => 
      editStaff(staffId, staffData),
    onSuccess: () => {
      // Invalidate and refetch staff list
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}; 