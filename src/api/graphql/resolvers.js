import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();

// Mock data - In a real app, this would come from a database
let contacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    status: 'QUALIFIED',
    tags: ['hot-lead', 'enterprise'],
    customFields: { budget: 50000, timeline: '3 months' },
    assignedToId: '1',
    companyId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@techcorp.com',
    phone: '+1-555-0124',
    status: 'CONTACTED',
    tags: ['warm-lead'],
    customFields: { source: 'website' },
    assignedToId: '2',
    companyId: '2',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-21')
  }
];

let companies = [
  {
    id: '1',
    name: 'Acme Corp',
    website: 'https://acme.com',
    industry: 'Technology',
    size: 'LARGE',
    revenue: 10000000,
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    },
    customFields: { founded: 2010 },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'TechCorp Inc',
    website: 'https://techcorp.com',
    industry: 'Software',
    size: 'MEDIUM',
    revenue: 5000000,
    address: {
      street: '456 Tech Ave',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      zipCode: '78701'
    },
    customFields: { employees: 150 },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18')
  }
];

let deals = [
  {
    id: '1',
    title: 'Enterprise Software License',
    value: 75000,
    currency: 'USD',
    stage: 'PROPOSAL',
    probability: 75,
    expectedCloseDate: new Date('2024-03-15'),
    contactId: '1',
    companyId: '1',
    assignedToId: '1',
    productIds: ['1', '2'],
    customFields: { dealSource: 'referral' },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '2',
    title: 'Consulting Services',
    value: 25000,
    currency: 'USD',
    stage: 'NEGOTIATION',
    probability: 60,
    expectedCloseDate: new Date('2024-02-28'),
    contactId: '2',
    companyId: '2',
    assignedToId: '2',
    productIds: ['3'],
    customFields: { duration: '6 months' },
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-23')
  }
];

let users = [
  {
    id: '1',
    email: 'admin@company.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    isActive: true,
    lastLogin: new Date('2024-01-25T10:30:00Z'),
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      notifications: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '2',
    email: 'sales@company.com',
    firstName: 'Sales',
    lastName: 'Rep',
    role: 'SALES_REP',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sales',
    isActive: true,
    lastLogin: new Date('2024-01-25T09:15:00Z'),
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        push: true,
        sms: true,
        inApp: true
      }
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-24')
  }
];

let activities = [
  {
    id: '1',
    type: 'CALL',
    subject: 'Follow-up call with John Doe',
    description: 'Discuss proposal details and timeline',
    dueDate: new Date('2024-01-26T14:00:00Z'),
    priority: 'HIGH',
    status: 'PENDING',
    contactId: '1',
    dealId: '1',
    assignedToId: '1',
    createdById: '1',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '2',
    type: 'EMAIL',
    subject: 'Send contract to Jane Smith',
    description: 'Send the updated contract with new terms',
    dueDate: new Date('2024-01-27T10:00:00Z'),
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    contactId: '2',
    dealId: '2',
    assignedToId: '2',
    createdById: '1',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-25')
  }
];

let products = [
  {
    id: '1',
    name: 'CRM Pro',
    description: 'Professional CRM solution',
    price: 99.99,
    currency: 'USD',
    category: 'Software',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Analytics Add-on',
    description: 'Advanced analytics module',
    price: 49.99,
    currency: 'USD',
    category: 'Add-on',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Consulting Hours',
    description: 'Professional consulting services',
    price: 150.00,
    currency: 'USD',
    category: 'Service',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05')
  }
];

let campaigns = [
  {
    id: '1',
    name: 'Q1 Product Launch',
    type: 'MULTI_CHANNEL',
    status: 'ACTIVE',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    budget: 50000,
    channels: ['EMAIL', 'LINKEDIN', 'PHONE'],
    targetIds: ['1', '2'],
    metrics: {
      sent: 1000,
      delivered: 950,
      opened: 380,
      clicked: 76,
      replied: 23,
      converted: 8,
      bounced: 50,
      unsubscribed: 12
    },
    createdById: '1',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-25')
  }
];

// Helper functions
const findById = (array, id) => array.find(item => item.id === id);
const findByIds = (array, ids) => array.filter(item => ids.includes(item.id));

const resolvers = {
  Query: {
    // User queries
    me: (parent, args, context) => {
      // In a real app, get user from context/token
      return users[0];
    },
    users: () => users,
    user: (parent, { id }) => findById(users, id),

    // Contact queries
    contacts: (parent, { first = 10, after, filter, sort }) => {
      let filteredContacts = [...contacts];
      
      if (filter) {
        if (filter.status) {
          filteredContacts = filteredContacts.filter(c => c.status === filter.status);
        }
        if (filter.assignedToId) {
          filteredContacts = filteredContacts.filter(c => c.assignedToId === filter.assignedToId);
        }
        if (filter.companyId) {
          filteredContacts = filteredContacts.filter(c => c.companyId === filter.companyId);
        }
        if (filter.tags && filter.tags.length > 0) {
          filteredContacts = filteredContacts.filter(c => 
            filter.tags.some(tag => c.tags.includes(tag))
          );
        }
      }

      if (sort) {
        filteredContacts.sort((a, b) => {
          let aVal, bVal;
          switch (sort.field) {
            case 'FIRST_NAME':
              aVal = a.firstName;
              bVal = b.firstName;
              break;
            case 'LAST_NAME':
              aVal = a.lastName;
              bVal = b.lastName;
              break;
            case 'CREATED_AT':
              aVal = a.createdAt;
              bVal = b.createdAt;
              break;
            default:
              aVal = a.updatedAt;
              bVal = b.updatedAt;
          }
          
          if (sort.order === 'DESC') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      const edges = filteredContacts.slice(0, first).map((contact, index) => ({
        node: contact,
        cursor: Buffer.from(`${index}`).toString('base64')
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: filteredContacts.length > first,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: filteredContacts.length
      };
    },
    contact: (parent, { id }) => findById(contacts, id),
    searchContacts: (parent, { query }) => {
      const searchTerm = query.toLowerCase();
      return contacts.filter(contact => 
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm)
      );
    },

    // Company queries
    companies: () => companies,
    company: (parent, { id }) => findById(companies, id),
    searchCompanies: (parent, { query }) => {
      const searchTerm = query.toLowerCase();
      return companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm) ||
        company.industry?.toLowerCase().includes(searchTerm)
      );
    },

    // Deal queries
    deals: (parent, { filter }) => {
      let filteredDeals = [...deals];
      
      if (filter) {
        if (filter.stage) {
          filteredDeals = filteredDeals.filter(d => d.stage === filter.stage);
        }
        if (filter.assignedToId) {
          filteredDeals = filteredDeals.filter(d => d.assignedToId === filter.assignedToId);
        }
        if (filter.minValue) {
          filteredDeals = filteredDeals.filter(d => d.value >= filter.minValue);
        }
        if (filter.maxValue) {
          filteredDeals = filteredDeals.filter(d => d.value <= filter.maxValue);
        }
      }
      
      return filteredDeals;
    },
    deal: (parent, { id }) => findById(deals, id),
    myDeals: (parent, args, context) => {
      // In a real app, get user ID from context
      const userId = '1';
      return deals.filter(deal => deal.assignedToId === userId);
    },

    // Product queries
    products: () => products,
    product: (parent, { id }) => findById(products, id),

    // Activity queries
    activities: () => activities,
    activity: (parent, { id }) => findById(activities, id),
    myActivities: (parent, args, context) => {
      const userId = '1';
      return activities.filter(activity => activity.assignedToId === userId);
    },
    upcomingActivities: () => {
      const now = new Date();
      return activities.filter(activity => 
        activity.dueDate && activity.dueDate > now && activity.status === 'PENDING'
      ).sort((a, b) => a.dueDate - b.dueDate);
    },

    // Campaign queries
    campaigns: () => campaigns,
    campaign: (parent, { id }) => findById(campaigns, id),
    myCampaigns: (parent, args, context) => {
      const userId = '1';
      return campaigns.filter(campaign => campaign.createdById === userId);
    },

    // Analytics queries
    salesMetrics: (parent, { startDate, endDate }) => {
      const totalRevenue = deals.reduce((sum, deal) => 
        deal.stage === 'CLOSED_WON' ? sum + deal.value : sum, 0
      );
      
      const totalDeals = deals.filter(deal => deal.stage === 'CLOSED_WON').length;
      const averageDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;
      
      const winRate = deals.length > 0 ? 
        (deals.filter(deal => deal.stage === 'CLOSED_WON').length / deals.length) * 100 : 0;

      const pipeline = [
        { stage: 'PROSPECTING', count: 5, value: 125000 },
        { stage: 'QUALIFICATION', count: 8, value: 200000 },
        { stage: 'PROPOSAL', count: 3, value: 150000 },
        { stage: 'NEGOTIATION', count: 2, value: 75000 },
        { stage: 'CLOSED_WON', count: totalDeals, value: totalRevenue },
        { stage: 'CLOSED_LOST', count: 1, value: 25000 }
      ];

      const topPerformers = users.map(user => ({
        user,
        revenue: Math.random() * 100000,
        deals: Math.floor(Math.random() * 20),
        activities: Math.floor(Math.random() * 50)
      }));

      return {
        totalRevenue,
        totalDeals,
        averageDealSize,
        winRate,
        salesCycle: 45, // days
        pipeline,
        topPerformers
      };
    },

    dashboardData: () => ({
      totalContacts: contacts.length,
      totalDeals: deals.length,
      totalRevenue: deals.reduce((sum, deal) => sum + deal.value, 0),
      activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
      recentActivities: activities.slice(0, 5)
    })
  },

  Mutation: {
    // Contact mutations
    createContact: (parent, { input }) => {
      const newContact = {
        id: String(contacts.length + 1),
        ...input,
        tags: input.tags || [],
        customFields: input.customFields || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      contacts.push(newContact);
      
      // Publish subscription
      pubsub.publish('CONTACT_UPDATED', { contactUpdated: newContact });
      
      return newContact;
    },

    updateContact: (parent, { id, input }) => {
      const contactIndex = contacts.findIndex(c => c.id === id);
      if (contactIndex === -1) throw new Error('Contact not found');
      
      contacts[contactIndex] = {
        ...contacts[contactIndex],
        ...input,
        updatedAt: new Date()
      };
      
      pubsub.publish('CONTACT_UPDATED', { contactUpdated: contacts[contactIndex] });
      
      return contacts[contactIndex];
    },

    deleteContact: (parent, { id }) => {
      const contactIndex = contacts.findIndex(c => c.id === id);
      if (contactIndex === -1) return false;
      
      contacts.splice(contactIndex, 1);
      return true;
    },

    // Deal mutations
    createDeal: (parent, { input }) => {
      const newDeal = {
        id: String(deals.length + 1),
        ...input,
        productIds: input.productIds || [],
        customFields: input.customFields || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      deals.push(newDeal);
      
      pubsub.publish('DEAL_UPDATED', { dealUpdated: newDeal });
      
      return newDeal;
    },

    updateDeal: (parent, { id, input }) => {
      const dealIndex = deals.findIndex(d => d.id === id);
      if (dealIndex === -1) throw new Error('Deal not found');
      
      deals[dealIndex] = {
        ...deals[dealIndex],
        ...input,
        updatedAt: new Date()
      };
      
      pubsub.publish('DEAL_UPDATED', { dealUpdated: deals[dealIndex] });
      
      return deals[dealIndex];
    },

    moveDealStage: (parent, { id, stage }) => {
      const dealIndex = deals.findIndex(d => d.id === id);
      if (dealIndex === -1) throw new Error('Deal not found');
      
      deals[dealIndex] = {
        ...deals[dealIndex],
        stage,
        updatedAt: new Date(),
        ...(stage === 'CLOSED_WON' || stage === 'CLOSED_LOST' ? 
          { actualCloseDate: new Date() } : {})
      };
      
      pubsub.publish('DEAL_UPDATED', { dealUpdated: deals[dealIndex] });
      
      return deals[dealIndex];
    },

    // Activity mutations
    createActivity: (parent, { input }) => {
      const newActivity = {
        id: String(activities.length + 1),
        ...input,
        status: 'PENDING',
        createdById: '1', // In real app, get from context
        createdAt: new Date(),
        updatedAt: new Date()
      };
      activities.push(newActivity);
      
      pubsub.publish('ACTIVITY_CREATED', { activityCreated: newActivity });
      
      return newActivity;
    },

    completeActivity: (parent, { id }) => {
      const activityIndex = activities.findIndex(a => a.id === id);
      if (activityIndex === -1) throw new Error('Activity not found');
      
      activities[activityIndex] = {
        ...activities[activityIndex],
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date()
      };
      
      return activities[activityIndex];
    }
  },

  Subscription: {
    contactUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['CONTACT_UPDATED']),
        (payload, variables) => {
          return !variables.id || payload.contactUpdated.id === variables.id;
        }
      )
    },

    dealUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['DEAL_UPDATED']),
        (payload, variables) => {
          return !variables.id || payload.dealUpdated.id === variables.id;
        }
      )
    },

    activityCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['ACTIVITY_CREATED']),
        (payload, variables) => {
          return !variables.assignedToId || 
                 payload.activityCreated.assignedToId === variables.assignedToId;
        }
      )
    }
  },

  // Type resolvers
  Contact: {
    company: (contact) => findById(companies, contact.companyId),
    assignedTo: (contact) => findById(users, contact.assignedToId),
    activities: (contact) => activities.filter(a => a.contactId === contact.id),
    deals: (contact) => deals.filter(d => d.contactId === contact.id)
  },

  Company: {
    contacts: (company) => contacts.filter(c => c.companyId === company.id),
    deals: (company) => deals.filter(d => d.companyId === company.id)
  },

  Deal: {
    contact: (deal) => findById(contacts, deal.contactId),
    company: (deal) => findById(companies, deal.companyId),
    assignedTo: (deal) => findById(users, deal.assignedToId),
    products: (deal) => findByIds(products, deal.productIds || []),
    activities: (deal) => activities.filter(a => a.dealId === deal.id)
  },

  Activity: {
    contact: (activity) => activity.contactId ? findById(contacts, activity.contactId) : null,
    deal: (activity) => activity.dealId ? findById(deals, activity.dealId) : null,
    assignedTo: (activity) => findById(users, activity.assignedToId),
    createdBy: (activity) => findById(users, activity.createdById)
  },

  Campaign: {
    targets: (campaign) => findByIds(contacts, campaign.targetIds || []),
    createdBy: (campaign) => findById(users, campaign.createdById)
  }
};

export default resolvers;