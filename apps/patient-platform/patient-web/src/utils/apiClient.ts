import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { PATIENT_STORAGE_KEYS } from './storageKeys';

// Helper to determine if we should use localStorage (dev) or rely on cookies (prod)
const shouldUseLocalStorage = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true, // Always include cookies for production
  timeout: 30000
});

// Request interceptor to add auth token only in development
apiClient.interceptors.request.use((config) => {
  // Only add Authorization header in development (localStorage)
  if (shouldUseLocalStorage()) {
    const token = localStorage.getItem(PATIENT_STORAGE_KEYS.authToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  // In production, authentication is handled via HTTP-only cookies automatically
  return config;
});
