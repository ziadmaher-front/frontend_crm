// Standalone Mock Client for CRM Application
// This replaces Base44 SDK with local mock data and functionality

// Helper to normalize API URL (remove trailing slash)
const normalizeApiUrl = (url) => {
  if (!url) return '';
  return url.toString().replace(/\/+$/, ''); // Remove trailing slashes
};

// API Base URL - uses environment variable or defaults to ngrok URL
const API_BASE_URL = normalizeApiUrl(
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    || 'https://superaqueous-nonunanimously-nestor.ngrok-free.dev'
);

// Log the API URL being used (helpful for debugging)
console.log('API Base URL configured:', API_BASE_URL);

// Test backend connectivity on load (non-blocking)
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      const testUrl = `${API_BASE_URL}/health`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });
      if (response.ok) {
        console.log('✅ Backend connection test: SUCCESS');
      } else {
        console.warn('⚠️ Backend connection test: Server returned', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Backend connection test: FAILED -', error.message);
      console.warn('Please ensure:');
      console.warn('1. Backend is running on', API_BASE_URL);
      console.warn('2. CORS is enabled on the backend');
      console.warn('3. Network connectivity is available');
    }
  }, 1000);
}

// Helper function to get authentication token
function getAuthToken() {
  // Try localStorage first (most reliable)
  let token = localStorage.getItem('authToken');
  
  // If token exists, return it
  if (token) {
    return token;
  }
  
  // If no token in localStorage, log debug info
  console.warn('Token not found in localStorage. Checking auth state...', {
    localStorageKeys: Object.keys(localStorage),
    hasAuthStorage: !!localStorage.getItem('auth-storage'),
  });
  
  // Try to get from persisted auth storage (Zustand persist)
  try {
    const persistedAuth = localStorage.getItem('auth-storage');
    if (persistedAuth) {
      const parsed = JSON.parse(persistedAuth);
      if (parsed?.state?.token) {
        token = parsed.state.token;
        // Sync to authToken key for consistency
        localStorage.setItem('authToken', token);
        console.log('Retrieved token from persisted auth storage');
        return token;
      }
    }
  } catch (e) {
    console.debug('Could not parse persisted auth storage:', e);
  }
  
  return null;
}

// Helper function to get default headers including ngrok skip warning
function getDefaultHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning page
    ...customHeaders,
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Mock data generators
const generateId = () => Math.random().toString(36).substr(2, 9);

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@company.com', role: 'Sales Manager' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'Sales Rep' },
  { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'Account Manager' }
];

const mockLeads = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', status: 'New', source: 'Website', created_date: new Date().toISOString() },
  { id: '2', name: 'Tech Solutions', email: 'info@techsol.com', status: 'Qualified', source: 'Referral', created_date: new Date().toISOString() }
];

const mockContacts = [
  { id: '1', name: 'Sarah Wilson', email: 'sarah@acme.com', phone: '+1234567890', account_id: '1', created_date: new Date().toISOString() },
  { id: '2', name: 'Tom Brown', email: 'tom@techsol.com', phone: '+1987654321', account_id: '2', created_date: new Date().toISOString() }
];

const mockAccounts = [
  { id: '1', name: 'Acme Corporation', industry: 'Technology', revenue: 1000000, created_date: new Date().toISOString() },
  { id: '2', name: 'Tech Solutions Inc', industry: 'Software', revenue: 500000, created_date: new Date().toISOString() }
];

const mockDeals = [
  { id: '1', name: 'Acme Software License', amount: 50000, stage: 'Proposal', account_id: '1', created_date: new Date().toISOString() },
  { id: '2', name: 'Tech Consulting Project', amount: 25000, stage: 'Negotiation', account_id: '2', created_date: new Date().toISOString() }
];

const mockTasks = [
  { id: '1', title: 'Follow up with Acme', description: 'Call to discuss proposal', due_date: new Date().toISOString(), status: 'Open', created_date: new Date().toISOString() },
  { id: '2', title: 'Prepare demo for Tech Solutions', description: 'Create custom demo', due_date: new Date().toISOString(), status: 'In Progress', created_date: new Date().toISOString() }
];

// Mock entity class
class MockEntity {
  constructor(name, data) {
    this.name = name;
    this.data = [...data];
  }

  async list(sort = '', limit = null) {
    let result = [...this.data];
    if (sort.startsWith('-')) {
      const field = sort.substring(1);
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }
    if (limit) result = result.slice(0, limit);
    return result;
  }

  async get(id) {
    const item = this.data.find(entry => entry.id === id);
    if (!item) {
      const error = new Error(`${this.name} with id ${id} not found`);
      error.status = 404;
      throw error;
    }
    return item;
  }

  async create(data) {
    const newItem = { ...data, id: generateId(), created_date: new Date().toISOString() };
    this.data.push(newItem);
    return newItem;
  }

  async update(id, data) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...data, updated_date: new Date().toISOString() };
      return this.data[index];
    }
    throw new Error('Item not found');
  }

  async delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
      return true;
    }
    throw new Error('Item not found');
  }
}

// Real API Lead Entity
class LeadEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return mockLeads;
      }

      const url = `${API_BASE_URL}/leads`;
      console.log('Fetching leads from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch leads: ${response.status}`;
        console.error('Failed to fetch leads:', errorMessage);
        throw new Error(errorMessage);
      }

      let leads = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(leads)) {
        leads = leads.data || leads.leads || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        leads.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        leads.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        leads = leads.slice(0, limit);
      }

      console.log(`Fetched ${leads.length} leads from backend`);
      return leads;
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Fallback to mock data if API fails
      console.warn('Falling back to mock leads data');
      return mockLeads;
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        const mockLead = mockLeads.find(l => l.id === id);
        if (mockLead) {
          return mockLead;
        }
        throw new Error('No authentication token found and no mock data available');
      }

      const url = `${API_BASE_URL}/leads/${id}`;
      console.log('Fetching lead from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error(`Lead with id ${id} not found`);
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch lead: ${response.status}`;
        throw new Error(errorMessage);
      }

      const lead = await response.json();
      console.log('Fetched lead from backend:', lead);
      return lead;
    } catch (error) {
      console.error('Error fetching lead:', error);
      // Fallback to mock data if API fails
      const mockLead = mockLeads.find(l => l.id === id);
      if (mockLead) {
        console.warn('Falling back to mock lead data');
        return mockLead;
      }
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found. Current localStorage:', {
          hasAuthToken: !!localStorage.getItem('authToken'),
          allKeys: Object.keys(localStorage),
        });
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format to backend expected format
      // Backend expects: salutation, first_name, last_name, phone, email, shipping_street, billing_city,
      // accountId, product_name, currency_code, employee_co, hq_code, billing_amount, exchange_rate,
      // shipping_street_2, shipping_city, shipping_state, shipping_country, shipping_zip_code,
      // billing_street, billing_street_2, billing_state, billing_country, billing_zip_code, ownerId
      const transformedData = {
        salutation: data.salutation || data.title || undefined,
        first_name: data.first_name || data.firstName || '',
        last_name: data.last_name || data.lastName || '',
        phone: data.phone || '',
        email: data.email || '',
        shipping_street: data.shipping_street || data.address || data.shipping_address || '',
        shipping_street_2: data.shipping_street_2 || data.shipping_address_2 || undefined,
        shipping_city: data.shipping_city || undefined,
        shipping_state: data.shipping_state || undefined,
        shipping_country: data.shipping_country || undefined,
        shipping_zip_code: data.shipping_zip_code || data.shipping_zip || undefined,
        billing_city: data.billing_city || data.city || '',
        billing_street: data.billing_street || undefined,
        billing_street_2: data.billing_street_2 || data.billing_address_2 || undefined,
        billing_state: data.billing_state || undefined,
        billing_country: data.billing_country || undefined,
        billing_zip_code: data.billing_zip_code || data.billing_zip || undefined,
        accountId: data.accountId || data.account_id || data.account || undefined,
        product_name: data.product_name || data.product || undefined,
        currency_code: data.currency_code || data.currency || 'USD',
        employee_co: data.employee_co || data.employee_company || undefined,
        hq_code: data.hq_code || data.headquarters_code || undefined,
        billing_amount: data.billing_amount ? parseFloat(data.billing_amount) : undefined,
        exchange_rate: data.exchange_rate ? parseFloat(data.exchange_rate) : 1.0,
        ownerId: data.ownerId || data.owner_id || data.owner || undefined,
      };

      // Remove undefined and empty string fields (but keep 0 values for amounts)
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || (transformedData[key] === '' && key !== 'billing_amount' && key !== 'exchange_rate')) {
          delete transformedData[key];
        }
      });
      
      // Convert empty strings to undefined for UUID fields
      if (transformedData.accountId === '') {
        transformedData.accountId = undefined;
      }
      if (transformedData.ownerId === '') {
        transformedData.ownerId = undefined;
      }
      
      // Remove undefined UUID fields
      if (transformedData.accountId === undefined) {
        delete transformedData.accountId;
      }
      if (transformedData.ownerId === undefined) {
        delete transformedData.ownerId;
      }
      
      // Explicitly remove account_name if it exists (backend doesn't accept it)
      delete transformedData.account_name;
      delete transformedData.account;
      delete transformedData.company;
      delete transformedData.companyName;

      const url = `${API_BASE_URL}/leads`;
      console.log('Creating lead at:', url, 'Token present:', !!token);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create lead: ${response.status}`;
        console.error('Failed to create lead:', errorMessage);
        throw new Error(errorMessage);
      }

      const lead = await response.json();
      console.log('Created lead:', lead);
      return lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format to backend expected format
      // Backend expects: salutation, first_name, last_name, phone, email, shipping_street, billing_city,
      // accountId, product_name, currency_code, employee_co, hq_code, billing_amount, exchange_rate,
      // shipping_street_2, shipping_city, shipping_state, shipping_country, shipping_zip_code,
      // billing_street, billing_street_2, billing_state, billing_country, billing_zip_code, ownerId
      const transformedData = {
        salutation: data.salutation || data.title || undefined,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        email: data.email || '',
        shipping_street: data.shipping_street || data.address || '',
        shipping_street_2: data.shipping_street_2 || data.shipping_address_2 || undefined,
        shipping_city: data.shipping_city || undefined,
        shipping_state: data.shipping_state || undefined,
        shipping_country: data.shipping_country || undefined,
        shipping_zip_code: data.shipping_zip_code || data.shipping_zip || undefined,
        billing_city: data.billing_city || data.city || '',
        billing_street: data.billing_street || undefined,
        billing_street_2: data.billing_street_2 || data.billing_address_2 || undefined,
        billing_state: data.billing_state || undefined,
        billing_country: data.billing_country || undefined,
        billing_zip_code: data.billing_zip_code || data.billing_zip || undefined,
        accountId: data.accountId || data.account_id || data.account || undefined,
        product_name: data.product_name || data.product || undefined,
        currency_code: data.currency_code || data.currency || 'USD',
        employee_co: data.employee_co || data.employee_company || undefined,
        hq_code: data.hq_code || data.headquarters_code || undefined,
        billing_amount: data.billing_amount ? parseFloat(data.billing_amount) : undefined,
        exchange_rate: data.exchange_rate ? parseFloat(data.exchange_rate) : 1.0,
        ownerId: data.ownerId || data.owner_id || data.owner || undefined,
      };

      // Remove undefined and empty string fields (but keep 0 values for amounts)
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || (transformedData[key] === '' && key !== 'billing_amount' && key !== 'exchange_rate')) {
          delete transformedData[key];
        }
      });

      const url = `${API_BASE_URL}/leads/${id}`;
      console.log('Updating lead at:', url);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update lead: ${response.status}`;
        console.error('Failed to update lead:', errorMessage);
        throw new Error(errorMessage);
      }

      const lead = await response.json();
      console.log('Updated lead:', lead);
      return lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/leads/${id}`;
      console.log('Deleting lead at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete lead: ${response.status}`;
        console.error('Failed to delete lead:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted lead:', id);
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/leads/bulk`;
      console.log('Bulk updating leads at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: updateFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update leads: ${response.status}`;
        console.error('Failed to bulk update leads:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk updated leads:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/leads/bulk-delete`;
      console.log('Bulk deleting leads at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete leads: ${response.status}`;
        console.error('Failed to bulk delete leads:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk deleted leads:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      throw error;
    }
  }
}

// Real API Contact Entity
class ContactEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return mockContacts;
      }

      const url = `${API_BASE_URL}/contacts`;
      console.log('Fetching contacts from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch contacts: ${response.status}`;
        console.error('Failed to fetch contacts:', errorMessage);
        throw new Error(errorMessage);
      }

      let contacts = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(contacts)) {
        contacts = contacts.data || contacts.contacts || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        contacts.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        contacts.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        contacts = contacts.slice(0, limit);
      }

      console.log(`Fetched ${contacts.length} contacts from backend`);
      return contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Fallback to mock data on error
      return mockContacts;
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        const contact = mockContacts.find(c => c.id === id);
        if (contact) return contact;
        throw new Error('Contact not found');
      }

      const url = `${API_BASE_URL}/contacts/${id}`;
      console.log('Fetching contact from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Contact not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch contact: ${response.status}`;
        throw new Error(errorMessage);
      }

      const contact = await response.json();
      console.log('Fetched contact:', contact);
      return contact;
    } catch (error) {
      console.error('Error fetching contact:', error);
      // Fallback to mock data
      const mockContact = mockContacts.find(c => c.id === id);
      if (mockContact) {
        return mockContact;
      }
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found. Current localStorage:', {
          hasAuthToken: !!localStorage.getItem('authToken'),
          allKeys: Object.keys(localStorage),
        });
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format to backend expected format
      // Backend expects: first_name, last_name, email, phone (required)
      // Optional: mobile_phone, accountId (UUID), department, territory, assistant_name, 
      // currency_code, mailing_street, mailing_city, mailing_state, mailing_zip, mailing_country, ownerId (UUID)
      // Note: accountId is UUID linking to Account, NOT account_name string
      const transformedData = {
        // Required fields
        first_name: data.first_name || data.firstName || '',
        last_name: data.last_name || data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        
        // Optional fields
        mobile_phone: data.mobile_phone || data.mobile || '',
        accountId: data.accountId || data.account_id || data.account || undefined, // UUID, not account_name
        department: data.department || '',
        territory: data.territory || '',
        assistant_name: data.assistant_name || data.assistant || '',
        currency_code: data.currency_code || data.currency || '',
        mailing_street: data.mailing_street || data.address || data.street || '',
        mailing_city: data.mailing_city || data.city || '',
        mailing_state: data.mailing_state || data.state || '',
        mailing_zip: data.mailing_zip || data.zip || data.postal_code || '',
        mailing_country: data.mailing_country || data.country || '',
        ownerId: data.ownerId || data.owner_id || data.owner || undefined, // UUID
      };
      
      // Convert empty strings to undefined for UUID fields
      if (transformedData.accountId === '') {
        transformedData.accountId = undefined;
      }
      if (transformedData.ownerId === '') {
        transformedData.ownerId = undefined;
      }
      
      // Remove undefined and empty string fields (except required ones)
      Object.keys(transformedData).forEach(key => {
        if (key !== 'first_name' && key !== 'last_name' && key !== 'email' && key !== 'phone' && 
            (transformedData[key] === undefined || transformedData[key] === '')) {
          delete transformedData[key];
        }
      });
      
      // Explicitly remove account_name if it exists (backend doesn't accept it)
      delete transformedData.account_name;
      delete transformedData.account;
      delete transformedData.company;
      delete transformedData.companyName;
      
      // Ensure required fields are not empty (backend validation)
      if (!transformedData.first_name) {
        transformedData.first_name = data.email?.split('@')[0]?.split('.')[0] || 'Unknown';
      }
      
      if (!transformedData.last_name) {
        transformedData.last_name = data.email?.split('@')[0]?.split('.').slice(1).join(' ') || 'Contact';
      }
      
      if (!transformedData.email) {
        transformedData.email = '';
      }
      
      if (!transformedData.phone) {
        transformedData.phone = '';
      }

      const url = `${API_BASE_URL}/contacts`;
      console.log('Creating contact at:', url, 'Token present:', !!token);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create contact: ${response.status}`;
        console.error('Failed to create contact:', errorMessage);
        throw new Error(errorMessage);
      }

      const contact = await response.json();
      console.log('Created contact:', contact);
      return contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format to backend expected format (same as create)
      const transformedData = {
        first_name: data.first_name || data.firstName || '',
        last_name: data.last_name || data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile_phone: data.mobile_phone || data.mobile || '',
        account_name: data.account_name || data.account || '',
        department: data.department || '',
        territory: data.territory || '',
        assistant_name: data.assistant_name || data.assistant || '',
        currency_code: data.currency_code || data.currency || '',
        mailing_street: data.mailing_street || data.address || data.street || '',
        mailing_city: data.mailing_city || data.city || '',
        mailing_state: data.mailing_state || data.state || '',
        mailing_zip: data.mailing_zip || data.zip || data.postal_code || '',
        mailing_country: data.mailing_country || data.country || '',
      };

      const url = `${API_BASE_URL}/contacts/${id}`;
      console.log('Updating contact at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update contact: ${response.status}`;
        console.error('Failed to update contact:', errorMessage);
        throw new Error(errorMessage);
      }

      const contact = await response.json();
      console.log('Updated contact:', contact);
      return contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/contacts/${id}`;
      console.log('Deleting contact at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete contact: ${response.status}`;
        console.error('Failed to delete contact:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted contact:', id);
      return { success: true, id };
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/contacts/bulk`;
      console.log('Bulk updating contacts at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: updateFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update contacts: ${response.status}`;
        console.error('Failed to bulk update contacts:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk updated contacts:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/contacts/bulk-delete`;
      console.log('Bulk deleting contacts at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete contacts: ${response.status}`;
        console.error('Failed to bulk delete contacts:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk deleted contacts:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting contacts:', error);
      throw error;
    }
  }
}

// Real API Account Entity
class AccountEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return mockAccounts;
      }

      const url = `${API_BASE_URL}/accounts`;
      console.log('Fetching accounts from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch accounts: ${response.status}`;
        console.error('Failed to fetch accounts:', errorMessage);
        throw new Error(errorMessage);
      }

      let accounts = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(accounts)) {
        accounts = accounts.data || accounts.accounts || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        accounts.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        accounts.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        accounts = accounts.slice(0, limit);
      }

      console.log(`Fetched ${accounts.length} accounts from backend`);
      return accounts;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // Fallback to mock data on error
      return mockAccounts;
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        const account = mockAccounts.find(a => a.id === id);
        if (account) return account;
        throw new Error('Account not found');
      }

      const url = `${API_BASE_URL}/accounts/${id}`;
      console.log('Fetching account from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Account not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch account: ${response.status}`;
        console.error('Failed to fetch account:', errorMessage);
        throw new Error(errorMessage);
      }

      const account = await response.json();
      console.log('Fetched account:', account);
      return account;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found. Current localStorage:', {
          hasAuthToken: !!localStorage.getItem('authToken'),
          allKeys: Object.keys(localStorage),
        });
        throw new Error('No authentication token found. Please log in again.');
      }

      // Include ownerId if provided (backend accepts it for account creation)
      // Clean up any duplicate owner fields
      const { owner_id, owner, ...cleanData } = data;
      
      // Transform frontend data format to backend expected format
      // Backend expects: name, accountNumber, phone, website, billing_street, billing_city, billing_state, billing_zip, billing_country
      // shipping_street, shipping_city, shipping_state, shipping_zip, shipping_country, userIds (array), parentAccountId
      // Backend automatically sets: createdById, modifiedById from JWT token
      const transformedData = {
        // Required fields
        name: cleanData.name || cleanData.company_name || '',
        accountNumber: cleanData.accountNumber || cleanData.account_number || undefined,
        phone: cleanData.phone || undefined,
        website: cleanData.website || undefined,
        billing_street: cleanData.billing_street || cleanData.billing_address || '',
        billing_city: cleanData.billing_city || '',
        
        // Optional fields (only include if they have values)
        billing_state: cleanData.billing_state || cleanData.billingState || undefined,
        billing_zip: cleanData.billing_zip || cleanData.billingZip || cleanData.billing_zip_code || undefined,
        billing_country: cleanData.billing_country || cleanData.billingCountry || undefined,
        shipping_street: cleanData.shipping_street || cleanData.shipping_address || cleanData.shippingAddress || undefined,
        shipping_city: cleanData.shipping_city || cleanData.shippingCity || undefined,
        shipping_state: cleanData.shipping_state || cleanData.shippingState || undefined,
        shipping_zip: cleanData.shipping_zip || cleanData.shippingZip || cleanData.shipping_zip_code || undefined,
        shipping_country: cleanData.shipping_country || cleanData.shippingCountry || undefined,
        userIds: Array.isArray(cleanData.userIds) && cleanData.userIds.length > 0 ? cleanData.userIds : undefined,
        parentAccountId: cleanData.parentAccountId || cleanData.parent_account_id || cleanData.parentAccount || undefined,
        // Note: createdById, modifiedById are set automatically by backend from JWT token
      };
      
      console.log('Account create - Original data keys:', Object.keys(data));
      console.log('Account create - Clean data keys:', Object.keys(cleanData));
      console.log('Account create - Transformed data keys:', Object.keys(transformedData));
      
      // Ensure required fields are not empty (backend validation)
      if (!transformedData.name) {
        throw new Error('Account name is required');
      }
      
      if (!transformedData.accountNumber) {
        // Generate a default account number if not provided
        transformedData.accountNumber = `ACC-${Date.now()}`;
      }
      
      if (!transformedData.billing_street) {
        transformedData.billing_street = '';
      }
      
      if (!transformedData.billing_city) {
        transformedData.billing_city = '';
      }

      // Validate website is a valid URL if provided
      if (transformedData.website) {
        try {
          new URL(transformedData.website);
        } catch (e) {
          // If not a valid URL, try to fix it
          if (!transformedData.website.startsWith('http://') && !transformedData.website.startsWith('https://')) {
            transformedData.website = 'https://' + transformedData.website;
          }
          // Validate again
          try {
            new URL(transformedData.website);
          } catch (e2) {
            throw new Error('Website must be a valid URL');
          }
        }
      }

      // Remove undefined and empty fields (but keep userIds array if it has items)
      Object.keys(transformedData).forEach(key => {
        if (key === 'userIds') {
          // Keep userIds only if it's a non-empty array
          if (!Array.isArray(transformedData[key]) || transformedData[key].length === 0) {
            delete transformedData[key];
          }
        } else if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });

      // Clean up any duplicate owner fields (for backward compatibility)
      delete transformedData.owner_id;
      delete transformedData.owner;
      delete transformedData.ownerId;

      const url = `${API_BASE_URL}/accounts`;
      console.log('Creating account at:', url, 'Token present:', !!token);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create account: ${response.status}`;
        console.error('Failed to create account:', errorMessage);
        throw new Error(errorMessage);
      }

      const account = await response.json();
      console.log('Created account:', account);
      return account;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format to backend expected format
      // Note: phone is not in the schema, ownerId can be updated
      const transformedData = {
        name: data.name || data.company_name || undefined,
        accountNumber: data.accountNumber || data.account_number || undefined,
        billing_street: data.billing_street || data.billing_address || undefined,
        billing_city: data.billing_city || undefined,
        ownerId: data.ownerId || data.owner_id || data.owner || undefined,
        website: data.website || undefined,
        billing_state: data.billing_state || data.billingState || undefined,
        billing_zip: data.billing_zip || data.billingZip || data.billing_zip_code || undefined,
        billing_country: data.billing_country || data.billingCountry || undefined,
        shipping_street: data.shipping_street || data.shipping_address || data.shippingAddress || undefined,
        shipping_city: data.shipping_city || data.shippingCity || undefined,
        shipping_state: data.shipping_state || data.shippingState || undefined,
        shipping_zip: data.shipping_zip || data.shippingZip || data.shipping_zip_code || undefined,
        shipping_country: data.shipping_country || data.shippingCountry || undefined,
        parentAccountId: data.parentAccountId || data.parent_account_id || data.parentAccount || undefined,
      };

      // Get current user ID for modifiedById if not provided
      try {
        const currentUser = await this.getCurrentUser();
        if (currentUser?.id && !transformedData.modifiedById) {
          transformedData.modifiedById = currentUser.id;
        }
      } catch (e) {
        console.warn('Could not get current user for account update:', e);
      }

      // Remove undefined fields
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });

      const url = `${API_BASE_URL}/accounts/${id}`;
      console.log('Updating account at:', url);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update account: ${response.status}`;
        console.error('Failed to update account:', errorMessage);
        throw new Error(errorMessage);
      }

      const account = await response.json();
      console.log('Updated account:', account);
      return account;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/accounts/${id}`;
      console.log('Deleting account at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete account: ${response.status}`;
        console.error('Failed to delete account:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted account:', id);
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (response.ok) {
        const user = await response.json();
        return user;
      }
      return null;
    } catch (error) {
      console.warn('Could not fetch current user:', error);
      return null;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/accounts/bulk`;
      console.log('Bulk updating accounts at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: updateFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update accounts: ${response.status}`;
        console.error('Failed to bulk update accounts:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk updated accounts:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating accounts:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/accounts/bulk-delete`;
      console.log('Bulk deleting accounts at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete accounts: ${response.status}`;
        console.error('Failed to bulk delete accounts:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk deleted accounts:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting accounts:', error);
      throw error;
    }
  }
}

// Real API Deal Entity
class DealEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return mockDeals;
      }

      const url = `${API_BASE_URL}/deals`;
      console.log('Fetching deals from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch deals: ${response.status}`;
        console.error('Failed to fetch deals:', errorMessage);
        throw new Error(errorMessage);
      }

      let deals = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(deals)) {
        deals = deals.data || deals.deals || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        deals.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        deals.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        deals = deals.slice(0, limit);
      }

      console.log(`Fetched ${deals.length} deals from backend`);
      return deals;
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Fallback to mock data on error
      return mockDeals;
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        const deal = mockDeals.find(d => d.id === id);
        if (deal) return deal;
        throw new Error('Deal not found');
      }

      const url = `${API_BASE_URL}/deals/${id}`;
      console.log('Fetching deal from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Deal not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch deal: ${response.status}`;
        throw new Error(errorMessage);
      }

      const deal = await response.json();
      console.log('Fetched deal:', deal);
      return deal;
    } catch (error) {
      console.error('Error fetching deal:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Handle owner_email -> ownerId conversion
      let ownerId = data.ownerId || data.owner_id;
      if (!ownerId && data.owner_email) {
        try {
          // Try to get current user first
          const currentUserResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
        headers: getDefaultHeaders(),
          });
          if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            if (currentUser.email === data.owner_email) {
              ownerId = currentUser.id;
            } else {
              // Try to fetch users and find by email
              const usersResponse = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
        headers: getDefaultHeaders(),
              });
              if (usersResponse.ok) {
                const users = await usersResponse.json();
                const userArray = Array.isArray(users) ? users : (users.data || []);
                const matchingUser = userArray.find(u => u.email === data.owner_email);
                if (matchingUser) {
                  ownerId = matchingUser.id;
                }
              }
            }
          }
        } catch (e) {
          console.warn('Could not convert owner_email to ownerId:', e);
        }
      }

      // Transform frontend data format to backend expected format
      // Backend expects: name, accountId, ownerId, leadId OR contactId (mutually exclusive)
      // Optional: amount, currency, type, stage, probability, closingDate, leadSource, description, campaignSource, quote, boxFolderId
      const transformedData = {
        // Required fields
        name: data.name || data.deal_name || '',
        accountId: data.accountId || data.account_id || undefined,
        ownerId: ownerId,
        // Either leadId OR contactId (mutually exclusive)
        leadId: data.leadId || data.lead_id || undefined,
        contactId: data.contactId || data.contact_id || undefined,
        // Optional fields
        amount: data.amount ? parseFloat(data.amount) : undefined,
        currency: data.currency || undefined,
        type: data.type || data.deal_type || undefined,
        stage: data.stage || undefined,
        probability: data.probability ? parseInt(data.probability) : undefined,
        closingDate: data.closingDate || data.expected_close_date || data.expectedCloseDate || undefined,
        leadSource: data.leadSource || data.lead_source || undefined,
        description: data.description || undefined,
        campaignSource: data.campaignSource || data.campaign_source || undefined,
        quote: data.quote || undefined,
        boxFolderId: data.boxFolderId || data.box_folder_id || undefined,
      };

      // Validate required fields
      if (!transformedData.name) {
        throw new Error('Deal name is required');
      }
      if (!transformedData.accountId) {
        throw new Error('Account ID is required');
      }
      if (!transformedData.ownerId) {
        throw new Error('Owner ID is required. Please select an owner.');
      }
      if (!transformedData.leadId && !transformedData.contactId) {
        throw new Error('Either Lead ID or Contact ID is required');
      }
      if (transformedData.leadId && transformedData.contactId) {
        throw new Error('Cannot specify both Lead ID and Contact ID (mutually exclusive)');
      }

      // Remove undefined fields
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });

      // Ensure leadId or contactId is set (not both)
      if (transformedData.leadId && transformedData.contactId) {
        // If both are provided, prefer leadId
        delete transformedData.contactId;
      }

      const url = `${API_BASE_URL}/deals`;
      console.log('Creating deal at:', url);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create deal: ${response.status}`;
        console.error('Failed to create deal:', errorMessage);
        throw new Error(errorMessage);
      }

      const deal = await response.json();
      console.log('Created deal:', deal);
      return deal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Handle owner_email -> ownerId conversion
      let ownerId = data.ownerId || data.owner_id;
      if (!ownerId && data.owner_email) {
        try {
          // Try to get current user first
          const currentUserResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
        headers: getDefaultHeaders(),
          });
          if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            if (currentUser.email === data.owner_email) {
              ownerId = currentUser.id;
            } else {
              // Try to fetch users and find by email
              const usersResponse = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
        headers: getDefaultHeaders(),
              });
              if (usersResponse.ok) {
                const users = await usersResponse.json();
                const userArray = Array.isArray(users) ? users : (users.data || []);
                const matchingUser = userArray.find(u => u.email === data.owner_email);
                if (matchingUser) {
                  ownerId = matchingUser.id;
                }
              }
            }
          }
        } catch (e) {
          console.warn('Could not convert owner_email to ownerId:', e);
        }
      }

      // Transform frontend data format to backend expected format
      // All fields are optional for update
      const transformedData = {
        name: data.name || data.deal_name || undefined,
        accountId: data.accountId || data.account_id || undefined,
        ownerId: ownerId,
        leadId: data.leadId || data.lead_id || undefined,
        contactId: data.contactId || data.contact_id || undefined,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        currency: data.currency || undefined,
        type: data.type || data.deal_type || undefined,
        stage: data.stage || undefined,
        probability: data.probability ? parseInt(data.probability) : undefined,
        closingDate: data.closingDate || data.expected_close_date || data.expectedCloseDate || undefined,
        leadSource: data.leadSource || data.lead_source || undefined,
        description: data.description || undefined,
        campaignSource: data.campaignSource || data.campaign_source || undefined,
        quote: data.quote || undefined,
        boxFolderId: data.boxFolderId || data.box_folder_id || undefined,
      };

      // Remove undefined and empty fields
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });

      // Handle switching from leadId to contactId (or vice versa)
      // If setting one, explicitly set the other to null
      if (transformedData.leadId !== undefined && transformedData.contactId === undefined) {
        // If leadId is being set, ensure contactId is null
        transformedData.contactId = null;
      }
      if (transformedData.contactId !== undefined && transformedData.leadId === undefined) {
        // If contactId is being set, ensure leadId is null
        transformedData.leadId = null;
      }

      const url = `${API_BASE_URL}/deals/${id}`;
      console.log('Updating deal at:', url);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update deal: ${response.status}`;
        console.error('Failed to update deal:', errorMessage);
        throw new Error(errorMessage);
      }

      const deal = await response.json();
      console.log('Updated deal:', deal);
      return deal;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/deals/${id}`;
      console.log('Deleting deal at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete deal: ${response.status}`;
        console.error('Failed to delete deal:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted deal:', id);
      return true;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/deals/bulk`;
      console.log('Bulk updating deals at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: updateFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update deals: ${response.status}`;
        console.error('Failed to bulk update deals:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk updated deals:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating deals:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/deals/bulk-delete`;
      console.log('Bulk deleting deals at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete deals: ${response.status}`;
        console.error('Failed to bulk delete deals:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk deleted deals:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting deals:', error);
      throw error;
    }
  }
}

// Real API Task Entity
class TaskEntity {
  // Helper to convert frontend status to backend status
  _convertStatusToBackend(status) {
    const statusMap = {
      'Not Started': 'not started',
      'In Progress': 'in progress',
      'Completed': 'completed',
      'Deferred': 'deferred',
    };
    return statusMap[status] || status?.toLowerCase() || 'not started';
  }

  // Helper to convert backend status to frontend status
  _convertStatusToFrontend(status) {
    const statusMap = {
      'not started': 'Not Started',
      'in progress': 'In Progress',
      'completed': 'Completed',
      'deferred': 'Deferred',
    };
    return statusMap[status] || status || 'Not Started';
  }

  async list(page = 1, limit = 100) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return mockTasks;
      }

      // Build URL with pagination
      const url = new URL(`${API_BASE_URL}/tasks`);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', Math.min(limit, 100).toString()); // Max 100 per backend

      console.log('Fetching tasks from:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch tasks: ${response.status}`;
        console.error('Failed to fetch tasks:', errorMessage);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      // Backend returns { data: [], total, page, lastPage }
      let tasks = [];
      if (Array.isArray(responseData)) {
        tasks = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        tasks = responseData.data;
      } else {
        tasks = [];
      }

      // Convert backend status to frontend format for display
      tasks = tasks.map(task => ({
        ...task,
        status: this._convertStatusToFrontend(task.status),
        // Map field names for frontend compatibility
        title: task.subject || task.title,
        due_date: task.dueDate || task.due_date,
      }));

      console.log(`Fetched ${tasks.length} tasks from backend (page ${page}, limit ${limit})`);
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to mock data on error
      return mockTasks;
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        const task = mockTasks.find(t => t.id === id);
        if (task) return task;
        throw new Error('Task not found');
      }

      const url = `${API_BASE_URL}/tasks/${id}`;
      console.log('Fetching task from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Task not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch task: ${response.status}`;
        throw new Error(errorMessage);
      }

      const task = await response.json();
      console.log('Fetched task:', task);
      
      // Convert backend response to frontend format
      return {
        ...task,
        status: this._convertStatusToFrontend(task.status),
        title: task.subject || task.title,
        due_date: task.dueDate || task.due_date,
      };
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Get current user for ownerId if not provided
      let ownerId = data.ownerId;
      if (!ownerId) {
        try {
          // Try to get from auth.me() first
          const currentUser = await base44.auth.me();
          console.log('Current user from auth.me():', currentUser);
          if (currentUser?.id) {
            ownerId = currentUser.id;
            console.log('Using ownerId from auth.me():', ownerId);
          }
        } catch (e) {
          console.warn('Could not get current user from auth.me():', e);
          
          // Try to get from localStorage auth storage (Zustand persist)
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const parsed = JSON.parse(authStorage);
              const storedUser = parsed?.state?.user;
              if (storedUser?.id) {
                ownerId = storedUser.id;
                console.log('Using ownerId from localStorage auth-storage:', ownerId);
              }
            }
          } catch (storageError) {
            console.warn('Could not get user from localStorage:', storageError);
          }
        }
      }

      if (!ownerId) {
        console.error('No ownerId found. Available data:', {
          dataOwnerId: data.ownerId,
          hasToken: !!token,
        });
        throw new Error('ownerId is required. Please ensure you are logged in and try refreshing the page.');
      }
      
      console.log('Using ownerId for task creation:', ownerId);

      // Transform frontend data format to backend expected format
      const requestBody = {
        ownerId: ownerId,
        subject: data.subject || data.title || '',
        // Optional fields
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.due_date && { dueDate: data.due_date }),
        ...(data.description && { description: data.description }),
        ...(data.notes && { notes: data.notes }),
        ...(data.links && Array.isArray(data.links) && { links: data.links }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: this._convertStatusToBackend(data.status) }),
        ...(data.rfqId && { rfqId: data.rfqId }),
        ...(data.currency && { currency: data.currency }),
        ...(data.exchangeRate !== undefined && { exchangeRate: data.exchangeRate }),
        ...(data.closedTime && { closedTime: data.closedTime }),
      };

      const url = `${API_BASE_URL}/tasks`;
      console.log('Creating task at:', url);
      console.log('Task data (transformed):', { ...requestBody, ownerId: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create task: ${response.status}`;
        console.error('Failed to create task:', errorMessage, errorData);
        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      }

      const task = await response.json();
      console.log('Created task:', task);
      
      // Convert backend response to frontend format
      return {
        ...task,
        status: this._convertStatusToFrontend(task.status),
        title: task.subject || task.title,
        due_date: task.dueDate || task.due_date,
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format to backend expected format
      const requestBody = {};
      
      // Map frontend fields to backend fields
      if (data.subject !== undefined || data.title !== undefined) {
        requestBody.subject = data.subject || data.title;
      }
      if (data.dueDate !== undefined || data.due_date !== undefined) {
        requestBody.dueDate = data.dueDate || data.due_date;
      }
      if (data.description !== undefined) {
        requestBody.description = data.description;
      }
      if (data.notes !== undefined) {
        requestBody.notes = data.notes;
      }
      if (data.links !== undefined) {
        requestBody.links = Array.isArray(data.links) ? data.links : [];
      }
      if (data.priority !== undefined) {
        requestBody.priority = data.priority;
      }
      if (data.status !== undefined) {
        requestBody.status = this._convertStatusToBackend(data.status);
      }
      if (data.rfqId !== undefined) {
        requestBody.rfqId = data.rfqId;
      }
      if (data.currency !== undefined) {
        requestBody.currency = data.currency;
      }
      if (data.exchangeRate !== undefined) {
        requestBody.exchangeRate = data.exchangeRate;
      }
      if (data.closedTime !== undefined) {
        requestBody.closedTime = data.closedTime;
      }
      if (data.ownerId !== undefined) {
        requestBody.ownerId = data.ownerId;
      }

      const url = `${API_BASE_URL}/tasks/${id}`;
      console.log('Updating task at:', url);
      console.log('Task data (transformed):', requestBody);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update task: ${response.status}`;
        console.error('Failed to update task:', errorMessage, errorData);
        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      }

      const task = await response.json();
      console.log('Updated task:', task);
      
      // Convert backend response to frontend format
      return {
        ...task,
        status: this._convertStatusToFrontend(task.status),
        title: task.subject || task.title,
        due_date: task.dueDate || task.due_date,
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform updateFields to backend format
      const transformedFields = {};
      if (updateFields.status !== undefined) {
        transformedFields.status = this._convertStatusToBackend(updateFields.status);
      }
      if (updateFields.priority !== undefined) {
        transformedFields.priority = updateFields.priority;
      }
      if (updateFields.dueDate !== undefined || updateFields.due_date !== undefined) {
        transformedFields.dueDate = updateFields.dueDate || updateFields.due_date;
      }
      if (updateFields.notes !== undefined) {
        transformedFields.notes = updateFields.notes;
      }
      if (updateFields.closedTime !== undefined) {
        transformedFields.closedTime = updateFields.closedTime;
      }
      // Add other fields as needed
      Object.keys(updateFields).forEach(key => {
        if (!['status', 'priority', 'dueDate', 'due_date', 'notes', 'closedTime'].includes(key)) {
          transformedFields[key] = updateFields[key];
        }
      });

      const url = `${API_BASE_URL}/tasks/bulk`;
      console.log('Bulk updating tasks at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: transformedFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update tasks: ${response.status}`;
        console.error('Failed to bulk update tasks:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk update result:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/tasks/bulk-delete`;
      console.log('Bulk deleting tasks at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete tasks: ${response.status}`;
        console.error('Failed to bulk delete tasks:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk delete result:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/tasks/${id}`;
      console.log('Deleting task at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete task: ${response.status}`;
        console.error('Failed to delete task:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted task:', id);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

// Real API Integration Entity
class IntegrationEntity {
  async list() {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, returning empty array');
        return [];
      }

      const url = `${API_BASE_URL}/api/integrations`;
      console.log('Fetching integrations from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Integrations endpoint not found (404), returning empty array');
          return [];
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch integrations: ${response.status}`;
        console.error('Failed to fetch integrations:', errorMessage);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      let integrations = [];
      if (Array.isArray(responseData)) {
        integrations = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        integrations = responseData.data;
      }

      console.log(`Fetched ${integrations.length} integrations from backend`);
      return integrations;
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/api/integrations/${id}`;
      console.log('Fetching integration from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Integration not found');
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch integration: ${response.status}`;
        throw new Error(errorMessage);
      }

      const integration = await response.json();
      console.log('Fetched integration:', integration);
      return integration;
    } catch (error) {
      console.error('Error fetching integration:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const requestBody = {
        integration_type: data.integration_type || data.integrationType,
        provider: data.provider,
        auth_type: data.auth_type || data.authType || 'oauth2',
        status: data.status || 'Active',
        settings: data.settings || {},
        ...(data.access_token && { access_token: data.access_token }),
        ...(data.refresh_token && { refresh_token: data.refresh_token }),
        ...(data.token_expires_at && { token_expires_at: data.token_expires_at }),
        ...(data.connected_email && { connected_email: data.connected_email }),
        ...(data.sync_enabled !== undefined && { sync_enabled: data.sync_enabled }),
        ...(data.sync_direction && { sync_direction: data.sync_direction }),
      };

      const url = `${API_BASE_URL}/api/integrations`;
      console.log('Creating integration at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create integration: ${response.status}`;
        console.error('Failed to create integration:', errorMessage, errorData);
        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      }

      const integration = await response.json();
      console.log('Created integration:', integration);
      return integration;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const requestBody = {};
      
      if (data.status !== undefined) requestBody.status = data.status;
      if (data.settings !== undefined) requestBody.settings = data.settings;
      if (data.sync_enabled !== undefined) requestBody.sync_enabled = data.sync_enabled;
      if (data.sync_direction !== undefined) requestBody.sync_direction = data.sync_direction;
      if (data.last_sync_date !== undefined) requestBody.last_sync_date = data.last_sync_date;
      if (data.access_token !== undefined) requestBody.access_token = data.access_token;
      if (data.refresh_token !== undefined) requestBody.refresh_token = data.refresh_token;
      if (data.token_expires_at !== undefined) requestBody.token_expires_at = data.token_expires_at;

      const url = `${API_BASE_URL}/api/integrations/${id}`;
      console.log('Updating integration at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update integration: ${response.status}`;
        console.error('Failed to update integration:', errorMessage);
        throw new Error(errorMessage);
      }

      const integration = await response.json();
      console.log('Updated integration:', integration);
      return integration;
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/api/integrations/${id}`;
      console.log('Deleting integration at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete integration: ${response.status}`;
        console.error('Failed to delete integration:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted integration:', id);
      return true;
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/api/integrations/bulk`;
      console.log('Bulk updating integrations at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: updateFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update integrations: ${response.status}`;
        console.error('Failed to bulk update integrations:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk update result:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating integrations:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/api/integrations/bulk-delete`;
      console.log('Bulk deleting integrations at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete integrations: ${response.status}`;
        console.error('Failed to bulk delete integrations:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk delete result:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting integrations:', error);
      throw error;
    }
  }
}

// Real API User Entity
class UserEntity {
  // Fetch users from account creation form endpoint
  async getAccountCreationFormUsers() {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found for account creation form users');
        return [];
      }

      const url = `${API_BASE_URL}/orchestrator/account-creation-form/`;
      console.log('Fetching account creation form users from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch users: ${response.status}`;
        console.error('Failed to fetch account creation form users:', errorMessage);
        throw new Error(errorMessage);
      }

      const users = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(users)) {
        return users.owners || users.data || users.users || [];
      }

      console.log(`Fetched ${users.length} users from account creation form endpoint`);
      return users;
    } catch (error) {
      console.error('Error fetching account creation form users:', error);
      return []; // Return empty array on error
    }
  }

  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return mockUsers;
      }

      const url = `${API_BASE_URL}/users`;
      console.log('Fetching users from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch users: ${response.status}`;
        console.error('Failed to fetch users:', errorMessage, 'Response status:', response.status);
        // Don't throw error, return empty array instead of mock data
        return [];
      }

      let users = await response.json();
      console.log('Raw users response:', users);
      
      // Handle array or object response
      if (!Array.isArray(users)) {
        users = users.data || users.users || [];
      }
      
      console.log('Processed users array:', users);

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        users.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        users.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        users = users.slice(0, limit);
      }

      console.log(`Fetched ${users.length} users from backend`);
      if (users.length === 0) {
        console.warn('No users returned from backend. Check if /users endpoint exists.');
      }
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array instead of mock data to avoid confusion
      console.warn('Returning empty array instead of mock data. Users endpoint may not be available.');
      return [];
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        const user = mockUsers.find(u => u.id === id);
        if (user) return user;
        throw new Error('User not found');
      }

      const url = `${API_BASE_URL}/users/${id}`;
      console.log('Fetching user from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('User not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch user: ${response.status}`;
        console.error('Failed to fetch user:', errorMessage);
        throw new Error(errorMessage);
      }

      const user = await response.json();
      console.log('Fetched user:', user);
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

// Real API RFQ Entity
class RFQEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return [];
      }

      const url = `${API_BASE_URL}/rfqs`;
      console.log('Fetching RFQs from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch RFQs: ${response.status}`;
        console.error('Failed to fetch RFQs:', errorMessage);
        throw new Error(errorMessage);
      }

      let rfqs = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(rfqs)) {
        rfqs = rfqs.data || rfqs.rfqs || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        rfqs.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        rfqs.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        rfqs = rfqs.slice(0, limit);
      }

      console.log(`Fetched ${rfqs.length} RFQs from backend`);
      return rfqs;
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      return [];
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/rfqs/${id}`;
      console.log('Fetching RFQ from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('RFQ not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch RFQ: ${response.status}`;
        throw new Error(errorMessage);
      }

      const rfq = await response.json();
      console.log('Fetched RFQ from backend:', rfq);
      return rfq;
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format (snake_case) to backend expected format (camelCase)
      // Backend expects: rfqName, rfqNumber, accountId, contactId OR leadId (exactly one), 
      // lineItems, currency (required)
      // Optional: vendors, paymentTerms, additionalNotes, status
      // Note: requestedBy is auto-set from JWT token
      
      // Get line items from data
      const rawLineItems = data.line_items || data.lineItems || [];
      console.log('RFQ Create - Raw line items:', rawLineItems);
      console.log('RFQ Create - Line items type:', Array.isArray(rawLineItems));
      console.log('RFQ Create - Line items length:', rawLineItems.length);
      
      // Validate contactId/leadId - exactly one must be provided
      const contactId = data.contact_id || data.contactId || '';
      const leadId = data.lead_id || data.leadId || '';
      if (!contactId && !leadId) {
        throw new Error('Either contactId or leadId must be provided');
      }
      if (contactId && leadId) {
        throw new Error('Please provide either contactId OR leadId, not both');
      }
      
      // Validate currency - only EGP, USD, or AED
      const currency = data.currency || 'USD';
      const validCurrencies = ['EGP', 'USD', 'AED'];
      if (!validCurrencies.includes(currency)) {
        throw new Error(`Currency must be one of: ${validCurrencies.join(', ')}`);
      }
      
      // Validate status - only COMPLETED or SUBMITTED
      const status = data.status || 'SUBMITTED';
      const validStatuses = ['COMPLETED', 'SUBMITTED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }
      
      const transformedData = {
        // Required fields
        rfqName: (data.rfq_name || data.rfqName || '').trim(),
        rfqNumber: (data.rfq_number || data.rfqNumber || '').trim(), // User-provided, required
        accountId: data.account_id || data.accountId || '',
        currency: currency,
        status: status,
        lineItems: rawLineItems.map(item => ({
          productId: item.product_id || item.productId, // Required in line items
          productName: item.product_name || item.productName || '',
          productCode: item.product_code || item.productCode || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          listPrice: item.list_price || item.listPrice || 0,
          requestedDiscountPercent: item.requested_discount_percent || item.requestedDiscountPercent || 0,
          requestedDiscountReason: item.requested_discount_reason || item.requestedDiscountReason || '',
          approvedDiscountPercent: item.approved_discount_percent || item.approvedDiscountPercent || 0,
          unitPrice: item.unit_price || item.unitPrice || 0,
          total: item.total || 0,
        })),
        
        // Optional fields
        contactId: contactId || undefined,
        leadId: leadId || undefined,
        vendors: data.vendors || undefined,
        paymentTerms: data.payment_terms || data.paymentTerms || undefined,
        additionalNotes: data.additional_notes || data.additionalNotes || undefined,
      };

      // Remove undefined and empty string fields (except required ones)
      Object.keys(transformedData).forEach(key => {
        if (key !== 'rfqName' && key !== 'rfqNumber' && key !== 'accountId' && 
            key !== 'currency' && key !== 'status' && key !== 'lineItems' && 
            (transformedData[key] === undefined || transformedData[key] === '')) {
          delete transformedData[key];
        }
      });

      // Clean lineItems - remove undefined/empty fields but keep required fields
      transformedData.lineItems = transformedData.lineItems.map(item => {
        const cleanItem = {};
        Object.keys(item).forEach(key => {
          // Keep the value if it's not undefined and not empty string
          // But allow 0, false, and null for some fields
          if (item[key] !== undefined) {
            if (key === 'quantity') {
              // Quantity is required, ensure it's a number (can be 0)
              cleanItem[key] = Number(item[key]) || 0;
            } else if (key === 'listPrice' || key === 'unitPrice' || key === 'total') {
              // Price fields can be 0
              cleanItem[key] = item[key] !== '' ? (Number(item[key]) || 0) : undefined;
            } else if (key === 'requestedDiscountPercent' || key === 'approvedDiscountPercent') {
              // Discount can be 0
              cleanItem[key] = item[key] !== '' ? (Number(item[key]) || 0) : undefined;
            } else if (item[key] !== '') {
              // For other fields, keep if not empty string
              cleanItem[key] = item[key];
            }
          }
        });
        
        // Ensure quantity is always present and is a number
        if (cleanItem.quantity === undefined) {
          cleanItem.quantity = 0;
        } else {
          cleanItem.quantity = Number(cleanItem.quantity) || 0;
        }
        
        // Ensure productId is present (required for line item)
        if (!cleanItem.productId) {
          console.warn('RFQ Create - Line item missing productId:', item);
        }
        
        return cleanItem;
      }).filter(item => {
        // Filter out items that don't have a productId and quantity > 0
        return item.productId && item.quantity > 0;
      });
      
      console.log('RFQ Create - Cleaned line items:', transformedData.lineItems);
      console.log('RFQ Create - Cleaned line items count:', transformedData.lineItems.length);

      // Validate required fields AFTER cleaning line items
      if (!transformedData.rfqName) {
        throw new Error('RFQ name is required');
      }
      if (!transformedData.rfqNumber) {
        throw new Error('RFQ number (quotation code) is required');
      }
      if (!transformedData.accountId) {
        throw new Error('Account ID is required');
      }
      // contactId/leadId validation already done above
      if (!transformedData.currency) {
        throw new Error('Currency is required');
      }
      
      // Validate line items AFTER cleaning (to ensure valid items remain)
      if (!transformedData.lineItems || !Array.isArray(transformedData.lineItems) || transformedData.lineItems.length === 0) {
        console.error('RFQ Create - Validation failed: No valid line items found');
        console.error('RFQ Create - Original data:', data);
        console.error('RFQ Create - Raw line items:', rawLineItems);
        throw new Error('At least one line item with product name and quantity > 0 is required. Please add products to the RFQ.');
      }

      const url = `${API_BASE_URL}/rfqs`;
      console.log('Creating RFQ at:', url, 'Token present:', !!token);
      console.log('Original RFQ data:', data);
      console.log('Transformed RFQ data:', transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create RFQ: ${response.status}`;
        console.error('Failed to create RFQ:', errorMessage);
        throw new Error(errorMessage);
      }

      const rfq = await response.json();
      console.log('Created RFQ:', rfq);
      return rfq;
    } catch (error) {
      console.error('Error creating RFQ:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format (snake_case) to backend expected format (camelCase)
      // Backend expects: rfqName, rfqNumber, accountId, contactId OR leadId (exactly one), 
      // lineItems, currency, status (required)
      // Optional: vendors, paymentTerms, additionalNotes
      const transformedData = {};
      
      // Map all possible fields
      if (data.rfq_name !== undefined || data.rfqName !== undefined) {
        transformedData.rfqName = data.rfq_name || data.rfqName;
      }
      if (data.rfq_number !== undefined || data.rfqNumber !== undefined) {
        transformedData.rfqNumber = data.rfq_number || data.rfqNumber;
      }
      if (data.account_id !== undefined || data.accountId !== undefined) {
        transformedData.accountId = data.account_id || data.accountId;
      }
      if (data.contact_id !== undefined || data.contactId !== undefined) {
        transformedData.contactId = data.contact_id || data.contactId;
      }
      if (data.lead_id !== undefined || data.leadId !== undefined) {
        transformedData.leadId = data.lead_id || data.leadId;
      }
      if (data.currency !== undefined) {
        // Validate currency - only EGP, USD, or AED
        const validCurrencies = ['EGP', 'USD', 'AED'];
        if (validCurrencies.includes(data.currency)) {
          transformedData.currency = data.currency;
        }
      }
      if (data.status !== undefined) {
        // Validate status - only COMPLETED or SUBMITTED
        const validStatuses = ['COMPLETED', 'SUBMITTED'];
        if (validStatuses.includes(data.status)) {
          transformedData.status = data.status;
        }
      }
      if (data.line_items !== undefined || data.lineItems !== undefined) {
        transformedData.lineItems = (data.line_items || data.lineItems || []).map(item => ({
          productId: item.product_id || item.productId, // Required in line items
          productName: item.product_name || item.productName || '',
          productCode: item.product_code || item.productCode || '',
          description: item.description || '',
          quantity: Number(item.quantity) || 0,
          listPrice: item.list_price || item.listPrice || 0,
          requestedDiscountPercent: item.requested_discount_percent || item.requestedDiscountPercent || 0,
          requestedDiscountReason: item.requested_discount_reason || item.requestedDiscountReason || '',
          approvedDiscountPercent: item.approved_discount_percent || item.approvedDiscountPercent || 0,
          unitPrice: item.unit_price || item.unitPrice || 0,
          total: item.total || 0,
        })).map(item => {
          const cleanItem = {};
          Object.keys(item).forEach(key => {
            if (item[key] !== undefined && item[key] !== '') {
              cleanItem[key] = item[key];
            }
          });
          return cleanItem;
        });
      }
      if (data.vendors !== undefined) {
        transformedData.vendors = data.vendors;
      }
      if (data.payment_terms !== undefined || data.paymentTerms !== undefined) {
        transformedData.paymentTerms = data.payment_terms || data.paymentTerms;
      }
      if (data.additional_notes !== undefined || data.additionalNotes !== undefined) {
        transformedData.additionalNotes = data.additional_notes || data.additionalNotes;
      }
      if (data.submitted_date !== undefined || data.submittedDate !== undefined) {
        transformedData.submittedDate = data.submitted_date || data.submittedDate;
      }
      if (data.generated_quote_id !== undefined || data.generatedQuoteId !== undefined) {
        transformedData.generatedQuoteId = data.generated_quote_id || data.generatedQuoteId;
      }

      // Remove undefined and empty string fields
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });

      const url = `${API_BASE_URL}/rfqs/${id}`;
      console.log('Updating RFQ at:', url);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update RFQ: ${response.status}`;
        console.error('Failed to update RFQ:', errorMessage);
        throw new Error(errorMessage);
      }

      const rfq = await response.json();
      console.log('Updated RFQ:', rfq);
      return rfq;
    } catch (error) {
      console.error('Error updating RFQ:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/rfqs/${id}`;
      console.log('Deleting RFQ at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete RFQ: ${response.status}`;
        console.error('Failed to delete RFQ:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted RFQ:', id);
      return true;
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      throw error;
    }
  }
}

// Real API Quote Entity
class QuoteEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return [];
      }

      const url = `${API_BASE_URL}/quotes`;
      console.log('Fetching quotes from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch quotes: ${response.status}`;
        console.error('Failed to fetch quotes:', errorMessage);
        throw new Error(errorMessage);
      }

      let quotes = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(quotes)) {
        quotes = quotes.data || quotes.quotes || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        quotes.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        quotes.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        quotes = quotes.slice(0, limit);
      }

      console.log(`Fetched ${quotes.length} quotes from backend`);
      return quotes;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quotes/${id}`;
      console.log('Fetching quote from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Quote not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch quote: ${response.status}`;
        throw new Error(errorMessage);
      }

      const quote = await response.json();
      console.log('Fetched quote from backend:', quote);
      return quote;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quotes`;
      console.log('Creating quote at:', url, 'Token present:', !!token);
      console.log('Quote data:', data);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create quote: ${response.status}`;
        console.error('Failed to create quote:', errorMessage);
        throw new Error(errorMessage);
      }

      const quote = await response.json();
      console.log('Created quote:', quote);
      return quote;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quotes/${id}`;
      console.log('Updating quote at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update quote: ${response.status}`;
        console.error('Failed to update quote:', errorMessage);
        throw new Error(errorMessage);
      }

      const quote = await response.json();
      console.log('Updated quote:', quote);
      return quote;
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quotes/${id}`;
      console.log('Deleting quote at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete quote: ${response.status}`;
        console.error('Failed to delete quote:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted quote:', id);
      return true;
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  }
}

// Real API Product Entity
class ProductEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return [];
      }

      const url = `${API_BASE_URL}/products`;
      console.log('Fetching products from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch products: ${response.status}`;
        console.error('Failed to fetch products:', errorMessage);
        throw new Error(errorMessage);
      }

      let products = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(products)) {
        products = products.data || products.products || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        products.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        products.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        products = products.slice(0, limit);
      }

      console.log(`Fetched ${products.length} products from backend`);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/products/${id}`;
      console.log('Fetching product from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Product not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch product: ${response.status}`;
        throw new Error(errorMessage);
      }

      const product = await response.json();
      console.log('Fetched product from backend:', product);
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format (snake_case) to backend expected format (camelCase)
      // Backend expects: productName, productCode, unitPrice (required)
      // Optional: manufacturerId (UUID), description, productLine (string)
      // Backend does NOT accept: category, costPrice, currency, unitOfMeasure, stockQuantity, reorderLevel, isActive, taxApplicable
      const transformedData = {
        // Required fields
        productName: (data.product_name || data.productName || '').trim(),
        productCode: (data.product_code || data.productCode || '').trim(),
        unitPrice: Number(data.unit_price || data.unitPrice || 0),
        
        // Optional fields (only these are accepted by backend)
        manufacturerId: data.manufacturer_id || data.manufacturerId || undefined,
        description: data.description || undefined,
        productLine: data.productLine || data.product_line || undefined,
      };

      // Remove undefined and empty string fields
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });

      // Validate required fields
      if (!transformedData.productName) {
        throw new Error('Product name is required');
      }
      if (!transformedData.productCode) {
        throw new Error('Product code is required');
      }
      if (transformedData.unitPrice === undefined || transformedData.unitPrice === null) {
        throw new Error('Unit price is required');
      }

      const url = `${API_BASE_URL}/products`;
      console.log('Creating product at:', url, transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create product: ${response.status}`;
        console.error('Failed to create product:', errorMessage);
        throw new Error(errorMessage);
      }

      const product = await response.json();
      console.log('Created product:', product);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format (snake_case) to backend expected format (camelCase)
      // Backend only accepts: productName, productCode, unitPrice, manufacturerId, description, productLine
      // Backend does NOT accept: category, costPrice, currency, unitOfMeasure, stockQuantity, reorderLevel, isActive, taxApplicable
      const transformedData = {};
      
      if (data.product_name !== undefined || data.productName !== undefined) {
        transformedData.productName = (data.product_name || data.productName || '').trim();
      }
      if (data.product_code !== undefined || data.productCode !== undefined) {
        transformedData.productCode = (data.product_code || data.productCode || '').trim();
      }
      if (data.unit_price !== undefined || data.unitPrice !== undefined) {
        transformedData.unitPrice = Number(data.unit_price || data.unitPrice || 0);
      }
      if (data.manufacturer_id !== undefined || data.manufacturerId !== undefined) {
        transformedData.manufacturerId = data.manufacturer_id || data.manufacturerId || undefined;
      }
      if (data.description !== undefined) {
        transformedData.description = data.description || undefined;
      }
      if (data.productLine !== undefined || data.product_line !== undefined) {
        transformedData.productLine = data.productLine || data.product_line || undefined;
      }

      // Remove undefined and empty string fields
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });

      const url = `${API_BASE_URL}/products/${id}`;
      console.log('Updating product at:', url, transformedData);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update product: ${response.status}`;
        console.error('Failed to update product:', errorMessage);
        throw new Error(errorMessage);
      }

      const product = await response.json();
      console.log('Updated product:', product);
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }
}

// Real API Manufacturer Entity
class ManufacturerEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return [];
      }

      const url = `${API_BASE_URL}/manufacturers`;
      console.log('Fetching manufacturers from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch manufacturers: ${response.status}`;
        console.error('Failed to fetch manufacturers:', errorMessage);
        throw new Error(errorMessage);
      }

      let manufacturers = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(manufacturers)) {
        manufacturers = manufacturers.data || manufacturers.manufacturers || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        manufacturers.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        manufacturers.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        manufacturers = manufacturers.slice(0, limit);
      }

      console.log(`Fetched ${manufacturers.length} manufacturers from backend`);
      return manufacturers;
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      return [];
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/manufacturers/${id}`;
      console.log('Fetching manufacturer from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Manufacturer not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch manufacturer: ${response.status}`;
        throw new Error(errorMessage);
      }

      const manufacturer = await response.json();
      console.log('Fetched manufacturer from backend:', manufacturer);
      return manufacturer;
    } catch (error) {
      console.error('Error fetching manufacturer:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format (snake_case) to backend expected format (camelCase)
      // Backend expects: companyName (required), productLines (optional string array), isActive (optional boolean)
      const transformedData = {
        companyName: (data.company_name || data.companyName || '').trim(),
        productLines: data.productLines || data.product_lines || [],
        isActive: data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true),
      };

      // Validate required fields
      if (!transformedData.companyName) {
        throw new Error('Company name is required');
      }

      // Remove empty arrays
      if (transformedData.productLines.length === 0) {
        delete transformedData.productLines;
      }

      const url = `${API_BASE_URL}/manufacturers`;
      console.log('Creating manufacturer at:', url, transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create manufacturer: ${response.status}`;
        console.error('Failed to create manufacturer:', errorMessage);
        throw new Error(errorMessage);
      }

      const manufacturer = await response.json();
      console.log('Created manufacturer:', manufacturer);
      return manufacturer;
    } catch (error) {
      console.error('Error creating manufacturer:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Transform frontend data format (snake_case) to backend expected format (camelCase)
      const transformedData = {};
      
      if (data.company_name !== undefined || data.companyName !== undefined) {
        transformedData.companyName = (data.company_name || data.companyName || '').trim();
      }
      if (data.productLines !== undefined || data.product_lines !== undefined) {
        transformedData.productLines = data.productLines || data.product_lines || [];
      }
      if (data.is_active !== undefined || data.isActive !== undefined) {
        transformedData.isActive = data.is_active !== undefined ? data.is_active : data.isActive;
      }

      // Remove empty arrays
      if (transformedData.productLines && transformedData.productLines.length === 0) {
        delete transformedData.productLines;
      }

      const url = `${API_BASE_URL}/manufacturers/${id}`;
      console.log('Updating manufacturer at:', url, transformedData);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update manufacturer: ${response.status}`;
        console.error('Failed to update manufacturer:', errorMessage);
        throw new Error(errorMessage);
      }

      const manufacturer = await response.json();
      console.log('Updated manufacturer:', manufacturer);
      return manufacturer;
    } catch (error) {
      console.error('Error updating manufacturer:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/manufacturers/${id}`;
      console.log('Deleting manufacturer at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete manufacturer: ${response.status}`;
        console.error('Failed to delete manufacturer:', errorMessage);
        throw new Error(errorMessage);
      }

      // Backend returns 204 No Content, so no body to parse
      console.log('Deleted manufacturer:', id);
      return true;
    } catch (error) {
      console.error('Error deleting manufacturer:', error);
      throw error;
    }
  }
}

// ProductLine entity removed - product lines are now hardcoded strings: "pathology", "molecular Biology", "life sciences"

// Real API QuoteTemplate Entity
class QuoteTemplateEntity {
  async list(sort = '', limit = null) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found, falling back to mock data');
        return [];
      }

      const url = `${API_BASE_URL}/quote-templates`;
      console.log('Fetching quote templates from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch quote templates: ${response.status}`;
        console.error('Failed to fetch quote templates:', errorMessage);
        throw new Error(errorMessage);
      }

      let templates = await response.json();
      
      // Handle array or object response
      if (!Array.isArray(templates)) {
        templates = templates.data || templates.templates || [];
      }

      // Apply sorting if needed
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        templates.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(bVal) - new Date(aVal);
          }
          return bVal > aVal ? 1 : -1;
        });
      } else if (sort) {
        const field = sort;
        templates.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (field.includes('date') || field.includes('Date')) {
            return new Date(aVal) - new Date(bVal);
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply limit if specified
      if (limit) {
        templates = templates.slice(0, limit);
      }

      console.log(`Fetched ${templates.length} quote templates from backend`);
      return templates;
    } catch (error) {
      console.error('Error fetching quote templates:', error);
      return [];
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quote-templates/${id}`;
      console.log('Fetching quote template from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error('Quote template not found');
          error.status = 404;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch quote template: ${response.status}`;
        throw new Error(errorMessage);
      }

      const template = await response.json();
      console.log('Fetched quote template from backend:', template);
      return template;
    } catch (error) {
      console.error('Error fetching quote template:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quote-templates`;
      console.log('Creating quote template at:', url, 'Token present:', !!token);
      console.log('Template data:', data);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create quote template: ${response.status}`;
        console.error('Failed to create quote template:', errorMessage);
        throw new Error(errorMessage);
      }

      const template = await response.json();
      console.log('Created quote template:', template);
      return template;
    } catch (error) {
      console.error('Error creating quote template:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quote-templates/${id}`;
      console.log('Updating quote template at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update quote template: ${response.status}`;
        console.error('Failed to update quote template:', errorMessage);
        throw new Error(errorMessage);
      }

      const template = await response.json();
      console.log('Updated quote template:', template);
      return template;
    } catch (error) {
      console.error('Error updating quote template:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/quote-templates/${id}`;
      console.log('Deleting quote template at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete quote template: ${response.status}`;
        console.error('Failed to delete quote template:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Deleted quote template:', id);
      return true;
    } catch (error) {
      console.error('Error deleting quote template:', error);
      throw error;
    }
  }
}

// Role Entity - matches backend API
class RoleEntity {
  async list() {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/roles`;
      console.log('Fetching roles from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch roles: ${response.status}`;
        console.error('Failed to fetch roles:', errorMessage);
        throw new Error(errorMessage);
      }

      const roles = await response.json();
      console.log(`Fetched ${Array.isArray(roles) ? roles.length : 1} role(s) from backend`);
      return roles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/roles/${id}`;
      console.log('Fetching role from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch role: ${response.status}`;
        console.error('Failed to fetch role:', errorMessage);
        throw new Error(errorMessage);
      }

      const role = await response.json();
      console.log('Fetched role:', role);
      return role;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/roles`;
      console.log('Creating role at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create role: ${response.status}`;
        console.error('Failed to create role:', errorMessage);
        throw new Error(errorMessage);
      }

      const role = await response.json();
      console.log('Created role:', role);
      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/roles/${id}`;
      console.log('Updating role at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update role: ${response.status}`;
        console.error('Failed to update role:', errorMessage);
        throw new Error(errorMessage);
      }

      const role = await response.json();
      console.log('Updated role:', role);
      return role;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/roles/${id}`;
      console.log('Deleting role at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete role: ${response.status}`;
        console.error('Failed to delete role:', errorMessage);
        throw new Error(errorMessage);
      }

      const role = await response.json();
      console.log('Deleted role:', role);
      return role;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/roles/bulk`;
      console.log('Bulk updating roles at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: updateFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update roles: ${response.status}`;
        console.error('Failed to bulk update roles:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk updated roles:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating roles:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/roles/bulk-delete`;
      console.log('Bulk deleting roles at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete roles: ${response.status}`;
        console.error('Failed to bulk delete roles:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk deleted roles:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting roles:', error);
      throw error;
    }
  }
}

class ProfileEntity {
  async list() {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/profiles`;
      console.log('Fetching profiles from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch profiles: ${response.status}`;
        console.error('Failed to fetch profiles:', errorMessage);
        throw new Error(errorMessage);
      }

      const profiles = await response.json();
      console.log(`Fetched ${Array.isArray(profiles) ? profiles.length : 1} profile(s) from backend`);
      return profiles;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  }

  async get(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/profiles/${id}`;
      console.log('Fetching profile from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch profile: ${response.status}`;
        console.error('Failed to fetch profile:', errorMessage);
        throw new Error(errorMessage);
      }

      const profile = await response.json();
      console.log('Fetched profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/profiles`;
      console.log('Creating profile at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create profile: ${response.status}`;
        console.error('Failed to create profile:', errorMessage);
        throw new Error(errorMessage);
      }

      const profile = await response.json();
      console.log('Created profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/profiles/${id}`;
      console.log('Updating profile at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to update profile: ${response.status}`;
        console.error('Failed to update profile:', errorMessage);
        throw new Error(errorMessage);
      }

      const profile = await response.json();
      console.log('Updated profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/profiles/${id}`;
      console.log('Deleting profile at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to delete profile: ${response.status}`;
        console.error('Failed to delete profile:', errorMessage);
        throw new Error(errorMessage);
      }

      const profile = await response.json();
      console.log('Deleted profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  async bulkUpdate(ids, updateFields) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/profiles/bulk`;
      console.log('Bulk updating profiles at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          ids: ids,
          updateFields: updateFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk update profiles: ${response.status}`;
        console.error('Failed to bulk update profiles:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk updated profiles:', result);
      return result;
    } catch (error) {
      console.error('Error bulk updating profiles:', error);
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = `${API_BASE_URL}/profiles/bulk-delete`;
      console.log('Bulk deleting profiles at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to bulk delete profiles: ${response.status}`;
        console.error('Failed to bulk delete profiles:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Bulk deleted profiles:', result);
      return result;
    } catch (error) {
      console.error('Error bulk deleting profiles:', error);
      throw error;
    }
  }
}

// Mock client implementation
export const base44 = {
  entities: {
    Lead: new LeadEntity(),
    Contact: new ContactEntity(),
    Account: new AccountEntity(),
    Deal: new DealEntity(),
    Task: new TaskEntity(),
    Activity: new MockEntity('Activity', []),
    Quote: new QuoteEntity(),
    Product: new ProductEntity(),
    EmailTemplate: new MockEntity('EmailTemplate', []),
    Workflow: new MockEntity('Workflow', []),
    Note: new MockEntity('Note', []),
    Organization: new MockEntity('Organization', [{ id: '1', name: 'My Company', created_date: new Date().toISOString() }]),
    Campaign: new MockEntity('Campaign', []),
    Manufacturer: new ManufacturerEntity(),
    PurchaseOrder: new MockEntity('PurchaseOrder', []),
    ManufacturerContact: new MockEntity('ManufacturerContact', []),
    QuoteTemplate: new QuoteTemplateEntity(),
    ApprovalWorkflow: new MockEntity('ApprovalWorkflow', []),
    ApprovalRequest: new MockEntity('ApprovalRequest', []),
    RFQ: new RFQEntity(),
    QuoteSettings: new MockEntity('QuoteSettings', []),
    EntitySerializationSettings: new MockEntity('EntitySerializationSettings', []),
    Communication: new MockEntity('Communication', []),
    Document: new MockEntity('Document', []),
    Contract: new MockEntity('Contract', []),
    AutomationRule: new MockEntity('AutomationRule', []),
    Team: new MockEntity('Team', []),
    SalesTarget: new MockEntity('SalesTarget', []),
    Forecast: new MockEntity('Forecast', []),
    Integration: new IntegrationEntity(),
    SavedView: new MockEntity('SavedView', []),
    User: new UserEntity(),
    Role: new RoleEntity(),
    Profile: new ProfileEntity()
  },

  auth: {
    async login(credentials) {
      try {
        const url = `${API_BASE_URL}/auth/login`;
        console.log('Logging in at:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        console.log('Login response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `Login failed with status ${response.status}`;
          console.error('Login failed:', errorMessage, errorData);
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Login success:', { ...data, token: data.token || data.access_token || data.accessToken ? '***' : undefined });
        
        // Get token from various possible fields (accessToken, access_token, or token)
        const authToken = data.accessToken || data.access_token || data.token;
        
        // Store token in localStorage for future requests
        if (authToken) {
          localStorage.setItem('authToken', authToken);
        }

        // Return in the format expected by the store
        return {
          user: {
            id: data.user?.id || data.userId || data.user?.sub,
            name: data.user?.name || `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.user?.email?.split('@')[0] || '',
            full_name: data.user?.full_name || data.user?.name || `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.user?.email?.split('@')[0] || '',
            email: data.user?.email || credentials.email,
            role: data.user?.role || 'Sales Rep',
            company: data.user?.company || data.user?.companyName,
            ...data.user,
          },
          token: authToken,
          permissions: data.permissions || data.user?.permissions || ['read:leads', 'write:leads', 'read:deals', 'write:deals'],
        };
      } catch (error) {
        console.error('Login error:', error);
        
        // Provide more helpful error messages
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error(
            `Cannot connect to backend. Please check:\n` +
            `1. Backend is running on ${API_BASE_URL}\n` +
            `2. CORS is enabled on the backend\n` +
            `3. Network connectivity`
          );
        }
        
        throw error;
      }
    },

    async register(userData) {
      try {
        const url = `${API_BASE_URL}/auth/register`;
        console.log('Registering user at:', url);
        
        // Transform frontend data format to backend expected format
        // Backend expects: name, email, password, profileId, role (string), workId, workLocation
        // role is a legacy string field (role name), not roleId
        const requestBody = {
          // Combine firstName and lastName into name
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email?.split('@')[0] || '',
          email: userData.email,
          password: userData.password,
          profileId: userData.profileId,
          role: userData.role || userData.roleName || 'Employee', // Legacy role field (string name)
          workId: userData.workId,
          workLocation: userData.workLocation,
          // Optional fields
          ...(userData.timezone && { timezone: userData.timezone }),
          ...(userData.department && { department: userData.department }),
          ...(userData.deptManager && { deptManager: userData.deptManager }),
          ...(userData.birthday && { birthday: userData.birthday }),
        };
        
        console.log('Original userData:', { ...userData, password: '***' });
        console.log('Transformed request body:', { ...requestBody, password: '***' });

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `Registration failed with status ${response.status}`;
          console.error('Registration failed:', errorMessage, errorData);
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Registration success:', data);

        // Get token from various possible fields (accessToken, access_token, or token)
        const authToken = data.accessToken || data.access_token || data.token;
        
        // Store token in localStorage
        if (authToken) {
          localStorage.setItem('authToken', authToken);
        }

        // Return in the format expected by the store
        return {
          user: {
            id: data.user?.id || data.userId || data.user?.sub,
            name: data.user?.name || `${data.user?.firstName || userData.firstName} ${data.user?.lastName || userData.lastName}`.trim() || data.user?.email?.split('@')[0] || '',
            full_name: data.user?.full_name || data.user?.name || `${data.user?.firstName || userData.firstName} ${data.user?.lastName || userData.lastName}`.trim() || data.user?.email?.split('@')[0] || '',
            email: data.user?.email || userData.email,
            role: data.user?.role || 'Sales Rep',
            company: data.user?.company || data.user?.companyName || userData.companyName,
            ...data.user,
          },
          token: authToken,
          permissions: data.permissions || data.user?.permissions || ['read:leads', 'write:leads', 'read:deals', 'write:deals'],
        };
      } catch (error) {
        console.error('Registration error:', error);
        
        // Provide more helpful error messages
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error(
            `Cannot connect to backend. Please check:\n` +
            `1. Backend is running on ${API_BASE_URL}\n` +
            `2. CORS is enabled on the backend\n` +
            `3. Network connectivity`
          );
        }
        
        throw error;
      }
    },

    async me() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
        headers: getDefaultHeaders(),
        });

        if (!response.ok) {
          // If 401, token is invalid - throw error
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            throw new Error('Authentication token is invalid');
          }
          // If 404, endpoint doesn't exist - return null instead of throwing
          // This allows the app to continue working even if the endpoint isn't implemented
          if (response.status === 404) {
            // Only log warning once per session to reduce console noise
            if (!window._authMe404Warned) {
              console.warn('Auth /me endpoint not found (404). This is expected if the backend endpoint is not implemented. The app will continue to work normally.');
              window._authMe404Warned = true;
            }
            return null;
          }
          // For other errors, return null instead of throwing to prevent crashes
          // Only log warning once per session
          if (!window._authMeErrorWarned) {
            console.warn(`Auth /me endpoint returned ${response.status}. Returning null.`);
            window._authMeErrorWarned = true;
          }
          return null;
        }

        const data = await response.json();
        
        return {
          id: data.id || data.userId,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          full_name: data.full_name || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          role: data.role,
          company: data.company || data.companyName,
          ...data,
        };
      } catch (error) {
        // If it's a 404, we already handled it above, but catch any other errors
        // For network errors or other issues, log but don't crash the app
        if (error.message && error.message.includes('404')) {
          console.warn('Auth /me endpoint not found. Returning null.');
          return null;
        }
        console.error('Me endpoint error:', error);
        // Return null instead of throwing to prevent app crashes
        // Callers should handle null gracefully
        return null;
      }
    },

    async updateMe(data) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'PUT', // or PATCH, depending on your backend
        headers: getDefaultHeaders(),
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update user data');
        }

        const updatedData = await response.json();
        return {
          ...updatedData,
          full_name: updatedData.full_name || updatedData.name || `${updatedData.firstName || ''} ${updatedData.lastName || ''}`.trim(),
        };
      } catch (error) {
        console.error('Update me error:', error);
        // Fallback to mock update
        return { ...mockUsers[0], ...data };
      }
    },

    async logout() {
      try {
        const token = localStorage.getItem('authToken');
        
        // Call backend logout endpoint if it exists
        if (token) {
          try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: getDefaultHeaders(),
            });
          } catch (err) {
            // Ignore logout endpoint errors
            console.warn('Logout endpoint error:', err);
          }
        }
        
        // Clear local token
        localStorage.removeItem('authToken');
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('authToken');
        return true;
      }
    }
  },

  integrations: {
    Core: {
      async InvokeLLM(params) {
        return { response: 'Mock AI response for: ' + params.prompt };
      },
      async SendEmail(_params) {
        return { success: true, message_id: generateId() };
      },
      async UploadFile(params) {
        try {
          const token = getAuthToken();
          
          if (!token) {
            throw new Error('No authentication token found. Please log in again.');
          }

          if (!params || !params.file) {
            throw new Error('File is required for upload');
          }

          const formData = new FormData();
          formData.append('file', params.file);

          const url = `${API_BASE_URL}/upload`;
          console.log('Uploading file to:', url);

          // For FormData, we need to let browser set Content-Type with boundary
          const headers = getDefaultHeaders();
          delete headers['Content-Type']; // Remove Content-Type for FormData
          
          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || errorData.error || `Failed to upload file: ${response.status}`;
            console.error('Failed to upload file:', errorMessage);
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log('File uploaded successfully:', data);
          return { file_url: data.file_url || data.url || data.fileUrl };
        } catch (error) {
          console.error('Error uploading file:', error);
          throw error;
        }
      },
      async GenerateImage(_params) {
        return { image_url: 'https://example.com/mock-image-' + generateId() };
      },
      async ExtractDataFromUploadedFile(_params) {
        return { extracted_data: { text: 'Mock extracted text' } };
      },
      async CreateFileSignedUrl(_params) {
        return { signed_url: 'https://example.com/signed-' + generateId() };
      },
      async UploadPrivateFile(_params) {
        return { file_url: 'https://example.com/private-file-' + generateId() };
      }
    }
  },

  orchestrator: {
    async getRegisterFormOptions() {
      try {
        const token = getAuthToken();
        const url = `${API_BASE_URL}/orchestrator/register-form`;
        console.log('Fetching register form options from:', url, { hasToken: !!token });

        // Use getDefaultHeaders which handles token automatically
        // But allow request without token for registration
        const headers = token ? getDefaultHeaders() : { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        };

        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        console.log('Register form options response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `Failed to fetch register form options: ${response.status}`;
          console.error('Failed to fetch register form options:', errorMessage, errorData);
          
          // If 401/403, try to provide helpful message
          if (response.status === 401 || response.status === 403) {
            console.warn('Authentication may be required for register form options');
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Fetched register form options - Full response:', JSON.stringify(data, null, 2));
        console.log('Profiles array:', data.profiles);
        console.log('Roles array:', data.roles);
        
        // Validate response structure
        if (!data) {
          console.warn('No data in response');
          return { profiles: [], roles: [] };
        }
        
        // Check if profiles and roles exist
        if (!data.profiles && !data.roles) {
          console.warn('Unexpected response structure - no profiles or roles:', data);
          return { profiles: [], roles: [] };
        }
        
        const profiles = Array.isArray(data.profiles) ? data.profiles : [];
        const roles = Array.isArray(data.roles) ? data.roles : [];
        
        console.log(`Processed ${profiles.length} profiles and ${roles.length} roles`);
        
        return {
          profiles,
          roles,
        };
      } catch (error) {
        console.error('Error fetching register form options:', error);
        throw error;
      }
    },

    async getDealFormOptions() {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const url = `${API_BASE_URL}/orchestrator/deal-form`;
        const startTime = performance.now();
        console.log('Fetching deal form options from:', url);

        const response = await fetch(url, {
          method: 'GET',
        headers: getDefaultHeaders(),
        });

        const fetchTime = performance.now() - startTime;
        console.log(`Deal form options fetch took ${fetchTime.toFixed(2)}ms`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `Failed to fetch deal form options: ${response.status}`;
          console.error('Failed to fetch deal form options:', errorMessage);
          throw new Error(errorMessage);
        }

        const parseStartTime = performance.now();
        const data = await response.json();
        const parseTime = performance.now() - parseStartTime;
        console.log(`Deal form options JSON parse took ${parseTime.toFixed(2)}ms`);
        console.log('Fetched deal form options:', {
          accountsCount: data.accounts?.length || 0,
          contactsCount: data.contacts?.length || 0,
          leadsCount: data.leads?.length || 0,
          usersCount: data.users?.length || 0,
        });
        
        // Backend returns: { leads: [{id, name}], contacts: [{id, name}], accounts: [{id, name, accountNumber}], users: [{id, name, email}] }
        // Map users to owners
        const owners = Array.isArray(data.owners) 
          ? data.owners 
          : (Array.isArray(data.users) ? data.users : []);
        
        const result = {
          accounts: Array.isArray(data.accounts) ? data.accounts : [],
          contacts: Array.isArray(data.contacts) ? data.contacts : [],
          leads: Array.isArray(data.leads) ? data.leads : [],
          owners: owners,
        };
        
        const totalTime = performance.now() - startTime;
        console.log(`Total deal form options processing took ${totalTime.toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        console.error('Error fetching deal form options:', error);
        throw error;
      }
    },

    // Integration OAuth Endpoints
    async initiateOAuth(provider, integrationType) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        // Convert provider key to backend slug format
        // Try multiple formats: google, google-calendar, GOOGLE_CALENDAR
        let providerSlug = provider.toLowerCase().replace(/_/g, '-');
        
        // Try simpler format for common providers
        if (provider === 'GOOGLE_CALENDAR' || provider === 'GMAIL') {
          providerSlug = 'google';
        } else if (provider === 'OUTLOOK_CALENDAR' || provider === 'OUTLOOK') {
          providerSlug = 'microsoft';
        }
        
        const url = `${API_BASE_URL}/api/integrations/oauth/${providerSlug}/authorize?type=${integrationType.toLowerCase()}`;
        console.log('Initiating OAuth flow:', { url, provider, providerSlug, integrationType });

        const response = await fetch(url, {
          method: 'GET',
          headers: getDefaultHeaders(),
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Try alternative URL formats
            const alternativeUrls = [
              `${API_BASE_URL}/integrations/oauth/${providerSlug}/authorize?type=${integrationType.toLowerCase()}`,
              `${API_BASE_URL}/api/integrations/oauth/${provider.toLowerCase()}/authorize?type=${integrationType.toLowerCase()}`,
              `${API_BASE_URL}/orchestrator/integrations/oauth/${providerSlug}/authorize?type=${integrationType.toLowerCase()}`,
            ];
            
            console.warn(`OAuth endpoint not found at ${url}. Tried:`, url);
            console.warn('Alternative URLs that might work:', alternativeUrls);
            
            throw new Error(`OAuth endpoint not found. The backend endpoint ${url} is not implemented. Please ensure your backend has the integration OAuth endpoints configured. Expected endpoint: GET /api/integrations/oauth/:provider/authorize`);
          }
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `OAuth initiation failed: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('OAuth flow initiated:', data);
        return data;
      } catch (error) {
        console.error('Error initiating OAuth flow:', error);
        throw error;
      }
    },

    async handleOAuthCallback(provider, code, state) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        // Convert provider key to backend slug format
        let providerSlug = provider.toLowerCase().replace(/_/g, '-');
        
        // Try simpler format for common providers
        if (provider === 'GOOGLE_CALENDAR' || provider === 'GMAIL') {
          providerSlug = 'google';
        } else if (provider === 'OUTLOOK_CALENDAR' || provider === 'OUTLOOK') {
          providerSlug = 'microsoft';
        }
        
        const url = `${API_BASE_URL}/api/integrations/oauth/${providerSlug}/callback`;
        console.log('Handling OAuth callback:', { url, provider, providerSlug });

        const response = await fetch(url, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('OAuth callback endpoint not available. Please contact your administrator.');
          }
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `OAuth callback failed: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('OAuth callback handled:', data);
        return data;
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        throw error;
      }
    },

    async refreshIntegrationToken(integrationId) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const url = `${API_BASE_URL}/api/integrations/${integrationId}/refresh`;
        console.log('Refreshing integration token:', { url, integrationId });

        const response = await fetch(url, {
          method: 'POST',
          headers: getDefaultHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `Token refresh failed: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Token refreshed:', data);
        return data;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    },

    async syncIntegration(integrationId) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const url = `${API_BASE_URL}/api/integrations/${integrationId}/sync`;
        console.log('Syncing integration:', { url, integrationId });

        const response = await fetch(url, {
          method: 'POST',
          headers: getDefaultHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `Sync failed: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Integration synced:', data);
        return data;
      } catch (error) {
        console.error('Error syncing integration:', error);
        throw error;
      }
    },

    async testIntegration(integrationId) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const url = `${API_BASE_URL}/api/integrations/${integrationId}/test`;
        console.log('Testing integration:', { url, integrationId });

        const response = await fetch(url, {
          method: 'POST',
          headers: getDefaultHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `Test failed: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Integration test result:', data);
        return data;
      } catch (error) {
        console.error('Error testing integration:', error);
        throw error;
      }
    },

    async convertLeadToContact(leadId) {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        if (!leadId) {
          throw new Error('Lead ID is required for conversion');
        }

        // Validate lead ID format (should be UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(leadId)) {
          console.warn('Lead ID does not match UUID format:', leadId);
        }

        const url = `${API_BASE_URL}/orchestrator/leads/${leadId}/convert-to-contact`;
        console.log('Converting lead to contact:', {
          url,
          leadId,
          method: 'PATCH',
          hasToken: !!token,
        });

        const response = await fetch(url, {
          method: 'PATCH',
        headers: getDefaultHeaders(),
        });

        console.log('Conversion response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
          let errorData;
          const contentType = response.headers.get('content-type');
          let responseText = '';
          
          try {
            // First, get the raw response text
            responseText = await response.clone().text();
            console.error('Raw error response text:', responseText);
            
            if (contentType && contentType.includes('application/json')) {
              errorData = await response.json();
              console.error('Parsed error response JSON:', JSON.stringify(errorData, null, 2));
            } else {
              errorData = { message: responseText || `HTTP ${response.status}: ${response.statusText}` };
            }
          } catch (e) {
            console.error('Error parsing error response:', e);
            errorData = { 
              message: responseText || `HTTP ${response.status}: ${response.statusText}`,
              rawError: e.message,
              rawResponse: responseText.substring(0, 500), // First 500 chars
            };
          }
          
          // Try to extract more detailed error information
          const errorMessage = errorData.message || 
                              errorData.error || 
                              errorData.details ||
                              errorData.statusCode ||
                              (Array.isArray(errorData) ? errorData.join(', ') : null) ||
                              (typeof errorData === 'string' ? errorData : null) ||
                              `Failed to convert lead to contact: ${response.status} ${response.statusText}`;
          
          console.error('Failed to convert lead to contact - Full Error Details:', {
            status: response.status,
            statusText: response.statusText,
            errorData: JSON.stringify(errorData, null, 2),
            rawResponse: responseText.substring(0, 1000),
            leadId,
            url,
            contentType,
          });
          
          throw new Error(errorMessage);
        }

        const contact = await response.json();
        console.log('Converted lead to contact successfully:', contact);
        return contact;
      } catch (error) {
        console.error('Error converting lead to contact:', {
          error,
          message: error.message,
          stack: error.stack,
          leadId,
          errorType: error.constructor.name,
        });
        throw error;
      }
    },
  }
};

// Export for compatibility
export const base44Client = base44;
export default base44;
