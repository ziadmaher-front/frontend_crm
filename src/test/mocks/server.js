import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock data
const mockContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    title: 'Sales Manager',
    status: 'active',
    avatar: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0124',
    company: 'Tech Solutions',
    title: 'Product Manager',
    status: 'active',
    avatar: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const mockAccounts = [
  {
    id: '1',
    name: 'Acme Corp',
    industry: 'Technology',
    website: 'https://acme.com',
    phone: '+1-555-0100',
    email: 'info@acme.com',
    address: '123 Main St, City, State 12345',
    status: 'active',
    revenue: 1000000,
    employees: 50,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockDeals = [
  {
    id: '1',
    name: 'Enterprise Software License',
    amount: 50000,
    stage: 'proposal',
    probability: 75,
    closeDate: '2024-03-15',
    accountId: '1',
    contactId: '1',
    status: 'open',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockLeads = [
  {
    id: '1',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1-555-0125',
    company: 'Startup Inc',
    title: 'CEO',
    source: 'website',
    status: 'new',
    score: 85,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockTasks = [
  {
    id: '1',
    title: 'Follow up with John Doe',
    description: 'Call to discuss proposal',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-02-15',
    assignedTo: 'user1',
    contactId: '1',
    dealId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// API handlers
export const handlers = [
  // Contacts endpoints
  rest.get('/api/contacts', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1');
    const limit = parseInt(req.url.searchParams.get('limit') || '10');
    const search = req.url.searchParams.get('search') || '';
    
    let filteredContacts = mockContacts;
    
    if (search) {
      filteredContacts = mockContacts.filter(contact =>
        contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
        contact.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
    
    return res(
      ctx.status(200),
      ctx.json({
        data: paginatedContacts,
        pagination: {
          page,
          limit,
          total: filteredContacts.length,
          pages: Math.ceil(filteredContacts.length / limit),
        },
      })
    );
  }),

  rest.get('/api/contacts/:id', (req, res, ctx) => {
    const { id } = req.params;
    const contact = mockContacts.find(c => c.id === id);
    
    if (!contact) {
      return res(ctx.status(404), ctx.json({ error: 'Contact not found' }));
    }
    
    return res(ctx.status(200), ctx.json({ data: contact }));
  }),

  rest.post('/api/contacts', (req, res, ctx) => {
    const newContact = {
      id: String(mockContacts.length + 1),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockContacts.push(newContact);
    
    return res(ctx.status(201), ctx.json({ data: newContact }));
  }),

  rest.put('/api/contacts/:id', (req, res, ctx) => {
    const { id } = req.params;
    const contactIndex = mockContacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Contact not found' }));
    }
    
    mockContacts[contactIndex] = {
      ...mockContacts[contactIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    return res(ctx.status(200), ctx.json({ data: mockContacts[contactIndex] }));
  }),

  rest.delete('/api/contacts/:id', (req, res, ctx) => {
    const { id } = req.params;
    const contactIndex = mockContacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Contact not found' }));
    }
    
    mockContacts.splice(contactIndex, 1);
    
    return res(ctx.status(204));
  }),

  // Accounts endpoints
  rest.get('/api/accounts', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockAccounts }));
  }),

  rest.get('/api/accounts/:id', (req, res, ctx) => {
    const { id } = req.params;
    const account = mockAccounts.find(a => a.id === id);
    
    if (!account) {
      return res(ctx.status(404), ctx.json({ error: 'Account not found' }));
    }
    
    return res(ctx.status(200), ctx.json({ data: account }));
  }),

  // Deals endpoints
  rest.get('/api/deals', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockDeals }));
  }),

  rest.get('/api/deals/:id', (req, res, ctx) => {
    const { id } = req.params;
    const deal = mockDeals.find(d => d.id === id);
    
    if (!deal) {
      return res(ctx.status(404), ctx.json({ error: 'Deal not found' }));
    }
    
    return res(ctx.status(200), ctx.json({ data: deal }));
  }),

  // Leads endpoints
  rest.get('/api/leads', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockLeads }));
  }),

  rest.get('/api/leads/:id', (req, res, ctx) => {
    const { id } = req.params;
    const lead = mockLeads.find(l => l.id === id);
    
    if (!lead) {
      return res(ctx.status(404), ctx.json({ error: 'Lead not found' }));
    }
    
    return res(ctx.status(200), ctx.json({ data: lead }));
  }),

  // Tasks endpoints
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockTasks }));
  }),

  rest.get('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    const task = mockTasks.find(t => t.id === id);
    
    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }
    
    return res(ctx.status(200), ctx.json({ data: task }));
  }),

  // Dashboard stats
  rest.get('/api/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          totalContacts: mockContacts.length,
          totalAccounts: mockAccounts.length,
          totalDeals: mockDeals.length,
          totalLeads: mockLeads.length,
          totalTasks: mockTasks.length,
          revenue: mockDeals.reduce((sum, deal) => sum + deal.amount, 0),
          conversionRate: 0.25,
          averageDealSize: mockDeals.reduce((sum, deal) => sum + deal.amount, 0) / mockDeals.length,
        },
      })
    );
  }),

  // Error simulation endpoints
  rest.get('/api/error/500', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
  }),

  rest.get('/api/error/404', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: 'Not found' }));
  }),

  rest.get('/api/error/timeout', (req, res, ctx) => {
    return res(ctx.delay('infinite'));
  }),
];

// Create server instance
export const server = setupServer(...handlers);

// Export mock data for use in tests
export { mockContacts, mockAccounts, mockDeals, mockLeads, mockTasks };