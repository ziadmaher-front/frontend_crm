// Standalone Mock Client for CRM Application
// This replaces Base44 SDK with local mock data and functionality

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

// Mock client implementation
export const base44 = {
  entities: {
    Lead: new MockEntity('Lead', mockLeads),
    Contact: new MockEntity('Contact', mockContacts),
    Account: new MockEntity('Account', mockAccounts),
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
    User: new MockEntity('User', mockUsers)
  },

  auth: {
    async me() {
      return mockUsers[0];
    },
    async updateMe(data) {
      return { ...mockUsers[0], ...data };
    },
    async logout() {
      return true;
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
