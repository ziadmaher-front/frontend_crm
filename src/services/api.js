/**
 * Main API Service
 * Centralized API calls for the application
 */

// Prefer Vite env in browser, fallback to Node env in tests, then default
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    || 'http://localhost:3001/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error('API call failed:', error);
    return { error: error.message, success: false };
  }
};

// Dashboard API calls
export const getDashboardData = async () => {
  return apiCall('/dashboard');
};

// Reports API calls
export const getReportsData = async () => {
  return apiCall('/reports');
};

export const getSalesData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/sales${queryString ? `?${queryString}` : ''}`);
};

export const getLeadsData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/leads${queryString ? `?${queryString}` : ''}`);
};

export const getContactsData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/contacts${queryString ? `?${queryString}` : ''}`);
};

export const getTeamData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/team${queryString ? `?${queryString}` : ''}`);
};

export const getPredictiveData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/predictive${queryString ? `?${queryString}` : ''}`);
};

export const getRealTimeData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/realtime${queryString ? `?${queryString}` : ''}`);
};

// Export functionality
export const exportData = async (exportConfig) => {
  return apiCall('/export', {
    method: 'POST',
    body: JSON.stringify(exportConfig),
  });
};

// User management
export const getUserData = async (userId) => {
  return apiCall(`/users/${userId}`);
};

export const updateUserData = async (userId, userData) => {
  return apiCall(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// Settings
export const getSettings = async () => {
  return apiCall('/settings');
};

export const updateSettings = async (settings) => {
  return apiCall('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

export default {
  getDashboardData,
  getReportsData,
  getSalesData,
  getLeadsData,
  getContactsData,
  getTeamData,
  getPredictiveData,
  getRealTimeData,
  exportData,
  getUserData,
  updateUserData,
  getSettings,
  updateSettings,
};
