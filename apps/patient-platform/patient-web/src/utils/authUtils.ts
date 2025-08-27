/**
 * Authentication utilities for handling environment-based auth
 */

// Helper to determine if we should use localStorage (dev) or rely on cookies (prod)
export const shouldUseLocalStorage = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

// Helper to get auth headers based on environment
export const getAuthHeaders = (): Record<string, string> => {
  if (shouldUseLocalStorage()) {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  return {}; // No Authorization header in production (uses cookies)
};

// Helper to get auth token for WebSocket connections
export const getWebSocketToken = (): string | null => {
  if (shouldUseLocalStorage()) {
    return localStorage.getItem('authToken');
  }
  // In production, return a placeholder since auth is handled by cookies
  // The WebSocket connection will be authenticated via cookies on the server
  return 'ws-cookie-auth';
};

// Helper to check if user is authenticated based on environment
export const isAuthenticated = (): boolean => {
  if (shouldUseLocalStorage()) {
    return !!localStorage.getItem('authToken');
  }
  // In production, let API calls validate auth via cookies
  return true;
};
