import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
