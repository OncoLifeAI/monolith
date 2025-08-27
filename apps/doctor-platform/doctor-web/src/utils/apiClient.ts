import axios from 'axios';
import { API_CONFIG } from '../config/api.js';
import { DOCTOR_STORAGE_KEYS } from './storageKeys';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(DOCTOR_STORAGE_KEYS.authToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
