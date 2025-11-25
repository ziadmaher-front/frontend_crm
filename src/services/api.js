/**
 * Main API Service
 * Centralized API calls for the application
 */

// Prefer Vite env in browser, fallback to Node env in tests, then default
// Helper to normalize API URL (remove trailing slash)
const normalizeApiUrl = (url) => {
  if (!url) return '';
  return url.toString().replace(/\/+$/, ''); // Remove trailing slashes
};

const API_BASE_URL = normalizeApiUrl(
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    || 'https://superaqueous-nonunanimously-nestor.ngrok-free.dev'
);

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  // Ensure endpoint starts with / and API_BASE_URL doesn't end with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning page
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('API Call:', { url, method: config.method || 'GET' });
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorText: errorText.substring(0, 500),
      });
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    // Enhanced error logging
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - Cannot connect to backend:', {
        url,
        error: error.message,
        apiBaseUrl: API_BASE_URL,
        possibleCauses: [
          'Backend server is not running',
          'CORS is not enabled on backend',
          'Network connectivity issues',
          'ngrok tunnel might be down',
        ],
      });
    } else {
      console.error('API call failed:', {
        url,
        error: error.message,
        stack: error.stack,
      });
    }
    return { error: error.message, success: false };
  }
};

// Test backend connectivity
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    return { 
      connected: response.ok, 
      status: response.status,
      message: response.ok ? 'Backend is reachable' : `Backend returned status ${response.status}`
    };
  } catch (error) {
    return { 
      connected: false, 
      error: error.message,
      message: 'Cannot connect to backend. Please check: 1. Backend is running, 2. CORS is enabled, 3. Network connectivity'
    };
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
