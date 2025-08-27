const { apiClient } = require('../config/axios.config');

const api = {
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: null,
        error: {
          message: error.response?.data?.detail || error.message || 'Request failed',
          code: error.response?.status || 500,
          details: error.response?.data || error.message
        }
      };
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: null,
        error: {
          message: error.response?.data?.detail || error.message || 'Request failed',
          code: error.response?.status || 500,
          details: error.response?.data || error.message
        }
      };
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: null,
        error: {
          message: error.response?.data?.detail || error.message || 'Request failed',
          code: error.response?.status || 500,
          details: error.response?.data || error.message
        }
      };
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: null,
        error: {
          message: error.response?.data?.detail || error.message || 'Request failed',
          code: error.response?.status || 500,
          details: error.response?.data || error.message
        }
      };
    }
  },

  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.patch(url, data, config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: null,
        error: {
          message: error.response?.data?.detail || error.message || 'Request failed',
          code: error.response?.status || 500,
          details: error.response?.data || error.message
        }
      };
    }
  },
};

// Helper to get auth token from either headers or cookies
const getAuthToken = (req) => {
  // In development, prefer Authorization header (localStorage)
  if (process.env.NODE_ENV === 'development') {
    if (req.headers.authorization) {
      return req.headers.authorization;
    }
  }
  
  // In production, prefer cookies over headers
  if (process.env.NODE_ENV === 'production') {
    if (req.cookies?.authToken) {
      return `Bearer ${req.cookies.authToken}`;
    }
    if (req.cookies?.sessionToken) {
      return `Bearer ${req.cookies.sessionToken}`;
    }
  }
  
  // Fallback to Authorization header (for backward compatibility)
  if (req.headers.authorization) {
    return req.headers.authorization;
  }
  
  return null;
};

// Helper to always include Authorization from headers or cookies
const getWithAuth = async (url, req, res) => {
  const config = {};
  const authToken = getAuthToken(req);
  if (authToken) {
    config.headers = { Authorization: authToken };
  }
  return api.get(url, config);
};

const postWithAuth = async (url, data, req, res) => {
  const config = {};
  const authToken = getAuthToken(req);
  if (authToken) {
    config.headers = { Authorization: authToken };
  }
  return api.post(url, data, config);
};

const updateWithAuth = async (url, data, req, res) => {
  const config = {};
  const authToken = getAuthToken(req);
  if (authToken) {
    config.headers = { Authorization: authToken };
  }
  return api.patch(url, data, config);
};

const deleteWithAuth = async (url, req, res) => {
  const config = {};
  const authToken = getAuthToken(req);
  if (authToken) {
    config.headers = { Authorization: authToken };
  }
  return api.delete(url, config);
};

module.exports = {
  api,
  getWithAuth,
  postWithAuth,
  updateWithAuth,
  deleteWithAuth,
}; 