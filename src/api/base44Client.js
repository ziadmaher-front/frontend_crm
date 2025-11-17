// Standalone Mock Client for CRM Application
// This replaces Base44 SDK with local mock data and functionality

// API Base URL - uses environment variable or defaults to localhost:3000
const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    || 'http://localhost:3000';

// Log the API URL being used (helpful for debugging)
console.log('API Base URL configured:', API_BASE_URL);

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
      // Backend expects: first_name, last_name, phone, email, shipping_street, billing_city, account_name (all required strings)
      // Backend does NOT want: name, company, job_title, lead_source, status, lead_score, 
      // assigned_users, notes, qualification_status, created_date, last_activity_date, full_name, industry
      const transformedData = {
        // Required fields
        first_name: data.first_name || data.firstName || '',
        last_name: data.last_name || data.lastName || '',
        phone: data.phone || '',
        email: data.email || '',
        shipping_street: data.shipping_street || data.address || data.shipping_address || '',
        billing_city: data.billing_city || data.city || '',
        account_name: data.account_name || data.company || data.companyName || '',
      };
      
      // Ensure required fields are not empty (backend validation)
      if (!transformedData.first_name) {
        // Fallback: use email prefix if first_name is missing
        transformedData.first_name = data.email?.split('@')[0]?.split('.')[0] || 'Unknown';
      }
      
      if (!transformedData.last_name) {
        // Fallback: use email domain or default
        transformedData.last_name = data.email?.split('@')[0]?.split('.').slice(1).join(' ') || 'Lead';
      }
      
      if (!transformedData.phone) {
        transformedData.phone = '';
      }
      
      if (!transformedData.email) {
        transformedData.email = '';
      }
      
      if (!transformedData.shipping_street) {
        transformedData.shipping_street = '';
      }
      
      if (!transformedData.billing_city) {
        transformedData.billing_city = '';
      }
      
      if (!transformedData.account_name) {
        transformedData.account_name = '';
      }
      
      // Remove all fields that backend doesn't want
      // (We're only including the fields we want in transformedData above)

      const url = `${API_BASE_URL}/leads`;
      console.log('Creating lead at:', url, 'Token present:', !!token);
      console.log('Original data:', data);
      console.log('Transformed data:', transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

      const url = `${API_BASE_URL}/leads/${id}`;
      console.log('Updating lead at:', url, data);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
      // Optional: mobile_phone, account_name, department, territory, assistant_name, 
      // currency_code, mailing_street, mailing_city, mailing_state, mailing_zip, mailing_country
      const transformedData = {
        // Required fields
        first_name: data.first_name || data.firstName || '',
        last_name: data.last_name || data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        
        // Optional fields
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

      // IMPORTANT: Remove ownerId, owner_id, owner from data BEFORE transformation
      // Backend automatically sets ownerId from JWT token on creation
      const { ownerId, owner_id, owner, ...cleanData } = data;
      
      // Transform frontend data format to backend expected format
      // Backend expects: name, accountNumber, billing_street, billing_city (required)
      // Backend automatically sets: ownerId, createdById, modifiedById from JWT token
      // Optional: website, billing_state, billing_zip, billing_country, shipping_street, shipping_city, shipping_state, shipping_zip, shipping_country, parentAccountId
      // Note: phone is not in the schema
      const transformedData = {
        // Required fields
        name: cleanData.name || cleanData.company_name || '',
        accountNumber: cleanData.accountNumber || cleanData.account_number || '',
        billing_street: cleanData.billing_street || cleanData.billing_address || '',
        billing_city: cleanData.billing_city || '',
        
        // Optional fields (only include if they have values)
        website: cleanData.website || undefined,
        billing_state: cleanData.billing_state || cleanData.billingState || undefined,
        billing_zip: cleanData.billing_zip || cleanData.billingZip || cleanData.billing_zip_code || undefined,
        billing_country: cleanData.billing_country || cleanData.billingCountry || undefined,
        shipping_street: cleanData.shipping_street || cleanData.shipping_address || cleanData.shippingAddress || undefined,
        shipping_city: cleanData.shipping_city || cleanData.shippingCity || undefined,
        shipping_state: cleanData.shipping_state || cleanData.shippingState || undefined,
        shipping_zip: cleanData.shipping_zip || cleanData.shippingZip || cleanData.shipping_zip_code || undefined,
        shipping_country: cleanData.shipping_country || cleanData.shippingCountry || undefined,
        parentAccountId: cleanData.parentAccountId || cleanData.parent_account_id || cleanData.parentAccount || undefined,
        // Note: ownerId, createdById, modifiedById are set automatically by backend from JWT token
      };
      
      console.log('Account create - Original data keys:', Object.keys(data));
      console.log('Account create - Clean data keys (after removing ownerId):', Object.keys(cleanData));
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

      // Remove undefined fields and explicitly remove ownerId (backend sets it automatically)
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });

      // Explicitly remove ownerId if it exists (backend sets it from JWT token)
      delete transformedData.ownerId;
      delete transformedData.owner_id;
      delete transformedData.owner;

      const url = `${API_BASE_URL}/accounts`;
      console.log('Creating account at:', url, 'Token present:', !!token);
      console.log('Original data:', data);
      console.log('Transformed data (ownerId removed):', transformedData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
}

// Real API User Entity
class UserEntity {
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

// Mock client implementation
export const base44 = {
  entities: {
    Lead: new LeadEntity(),
    Contact: new ContactEntity(),
    Account: new AccountEntity(),
    Deal: new MockEntity('Deal', mockDeals),
    Task: new MockEntity('Task', mockTasks),
    Activity: new MockEntity('Activity', []),
    Quote: new MockEntity('Quote', []),
    Product: new MockEntity('Product', []),
    EmailTemplate: new MockEntity('EmailTemplate', []),
    Workflow: new MockEntity('Workflow', []),
    Note: new MockEntity('Note', []),
    Organization: new MockEntity('Organization', [{ id: '1', name: 'My Company', created_date: new Date().toISOString() }]),
    Campaign: new MockEntity('Campaign', []),
    ProductLine: new MockEntity('ProductLine', []),
    Manufacturer: new MockEntity('Manufacturer', []),
    PurchaseOrder: new MockEntity('PurchaseOrder', []),
    ManufacturerContact: new MockEntity('ManufacturerContact', []),
    QuoteTemplate: new MockEntity('QuoteTemplate', []),
    ApprovalWorkflow: new MockEntity('ApprovalWorkflow', []),
    ApprovalRequest: new MockEntity('ApprovalRequest', []),
    RFQ: new MockEntity('RFQ', []),
    QuoteSettings: new MockEntity('QuoteSettings', []),
    EntitySerializationSettings: new MockEntity('EntitySerializationSettings', []),
    Communication: new MockEntity('Communication', []),
    Document: new MockEntity('Document', []),
    Contract: new MockEntity('Contract', []),
    AutomationRule: new MockEntity('AutomationRule', []),
    Team: new MockEntity('Team', []),
    SalesTarget: new MockEntity('SalesTarget', []),
    Forecast: new MockEntity('Forecast', []),
    Integration: new MockEntity('Integration', []),
    SavedView: new MockEntity('SavedView', []),
    User: new UserEntity()
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
        // Backend expects: name (string) - does NOT accept company field
        // Frontend sends: firstName, lastName, companyName
        const requestBody = {
          // Combine firstName and lastName into name
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email?.split('@')[0] || '',
          email: userData.email,
          password: userData.password,
          workId: userData.workId,
          workLocation: userData.workLocation,
          role: userData.role,
          roleInCrm: userData.roleInCrm,
        };
        
        console.log('Original userData:', { ...userData, password: '***' });
        console.log('Transformed request body:', { ...requestBody, password: '***' });

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // If 401, token is invalid - throw error
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            throw new Error('Authentication token is invalid');
          }
          // For other errors, throw but don't clear token
          throw new Error(`Failed to fetch user data: ${response.status}`);
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
        console.error('Me endpoint error:', error);
        // Don't fallback to mock data - throw error so caller knows validation failed
        throw error;
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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
              headers: {
                'Authorization': `Bearer ${token}`,
              },
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
      async UploadFile(_params) {
        return { file_url: 'https://example.com/mock-file-' + generateId() };
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
  }
};

// Export for compatibility
export const base44Client = base44;
export default base44;
