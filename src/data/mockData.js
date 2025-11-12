// Enhanced Mock Data for Sales Pro CRM
// This provides realistic, interconnected data for development and testing

import { faker } from '@faker-js/faker';

// Generate consistent IDs
const generateId = () => faker.string.uuid();

// Industries and company types
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Education', 'Real Estate', 'Consulting', 'Media', 'Transportation'
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

const LEAD_SOURCES = [
  'Website', 'Social Media', 'Email Campaign', 'Referral', 'Cold Call',
  'Trade Show', 'Partner', 'Advertisement', 'Content Marketing', 'SEO'
];

const DEAL_STAGES = [
  'Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 
  'Negotiation', 'Closed Won', 'Closed Lost'
];

const TASK_TYPES = [
  'Call', 'Email', 'Meeting', 'Demo', 'Follow-up', 'Proposal', 'Contract Review'
];

const CONTACT_ROLES = [
  'CEO', 'CTO', 'VP Sales', 'Marketing Director', 'IT Manager', 
  'Procurement Manager', 'Decision Maker', 'Influencer', 'End User'
];

// Generate Accounts/Companies
export const generateAccounts = (count = 50) => {
  return Array.from({ length: count }, () => {
    const id = generateId();
    const name = faker.company.name();
    const industry = faker.helpers.arrayElement(INDUSTRIES);
    const size = faker.helpers.arrayElement(COMPANY_SIZES);
    const revenue = faker.number.int({ min: 100000, max: 50000000 });
    
    return {
      id,
      name,
      industry,
      size,
      revenue,
      website: faker.internet.url(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      description: faker.company.catchPhrase(),
      employees: faker.number.int({ min: 10, max: 10000 }),
      founded: faker.date.past({ years: 30 }).getFullYear(),
      tags: faker.helpers.arrayElements(['Enterprise', 'SMB', 'Startup', 'Fortune 500'], { min: 1, max: 3 }),
      status: faker.helpers.arrayElement(['Active', 'Inactive', 'Prospect']),
      owner: faker.person.fullName(),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 }),
      customFields: {
        priority: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
        segment: faker.helpers.arrayElement(['Enterprise', 'Mid-Market', 'SMB']),
        region: faker.helpers.arrayElement(['North', 'South', 'East', 'West', 'International'])
      }
    };
  });
};

// Generate Contacts
export const generateContacts = (accounts, count = 150) => {
  return Array.from({ length: count }, () => {
    const id = generateId();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const account = faker.helpers.arrayElement(accounts);
    const role = faker.helpers.arrayElement(CONTACT_ROLES);
    
    return {
      id,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      mobile: faker.phone.number(),
      title: role,
      department: faker.helpers.arrayElement(['Sales', 'Marketing', 'IT', 'Finance', 'Operations']),
      accountId: account.id,
      accountName: account.name,
      linkedIn: faker.internet.url(),
      twitter: `@${faker.internet.username()}`,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      birthday: faker.date.birthdate(),
      notes: faker.lorem.paragraph(),
      tags: faker.helpers.arrayElements(['Decision Maker', 'Influencer', 'Champion', 'Blocker'], { min: 1, max: 2 }),
      status: faker.helpers.arrayElement(['Active', 'Inactive', 'Do Not Contact']),
      leadSource: faker.helpers.arrayElement(LEAD_SOURCES),
      owner: faker.person.fullName(),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 }),
      lastContactDate: faker.date.recent({ days: 60 }),
      customFields: {
        decisionMakingPower: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
        budget: faker.helpers.arrayElement(['$10K-50K', '$50K-100K', '$100K-500K', '$500K+']),
        timeline: faker.helpers.arrayElement(['Immediate', '1-3 months', '3-6 months', '6+ months'])
      }
    };
  });
};

// Generate Leads
export const generateLeads = (count = 100) => {
  return Array.from({ length: count }, () => {
    const id = generateId();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const company = faker.company.name();
    
    return {
      id,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      company,
      title: faker.person.jobTitle(),
      industry: faker.helpers.arrayElement(INDUSTRIES),
      source: faker.helpers.arrayElement(LEAD_SOURCES),
      status: faker.helpers.arrayElement(['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted']),
      score: faker.number.int({ min: 0, max: 100 }),
      website: faker.internet.url(),
      employees: faker.helpers.arrayElement(COMPANY_SIZES),
      revenue: faker.number.int({ min: 100000, max: 10000000 }),
      notes: faker.lorem.paragraph(),
      tags: faker.helpers.arrayElements(['Hot', 'Warm', 'Cold', 'MQL', 'SQL'], { min: 1, max: 3 }),
      owner: faker.person.fullName(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
      lastContactDate: faker.date.recent({ days: 30 }),
      customFields: {
        budget: faker.helpers.arrayElement(['$10K-50K', '$50K-100K', '$100K-500K', '$500K+']),
        timeline: faker.helpers.arrayElement(['Immediate', '1-3 months', '3-6 months', '6+ months']),
        painPoints: faker.helpers.arrayElements([
          'Cost Reduction', 'Efficiency', 'Scalability', 'Integration', 'Security'
        ], { min: 1, max: 3 })
      }
    };
  });
};

// Generate Deals
export const generateDeals = (accounts, contacts, count = 75) => {
  return Array.from({ length: count }, () => {
    const id = generateId();
    const account = faker.helpers.arrayElement(accounts);
    const contact = contacts.find(c => c.accountId === account.id) || faker.helpers.arrayElement(contacts);
    const stage = faker.helpers.arrayElement(DEAL_STAGES);
    const amount = faker.number.int({ min: 5000, max: 500000 });
    const probability = stage === 'Closed Won' ? 100 : 
                      stage === 'Closed Lost' ? 0 :
                      faker.number.int({ min: 10, max: 90 });
    
    return {
      id,
      name: `${account.name} - ${faker.commerce.productName()}`,
      accountId: account.id,
      accountName: account.name,
      contactId: contact.id,
      contactName: contact.name,
      amount,
      stage,
      probability,
      expectedCloseDate: faker.date.future({ years: 1 }),
      actualCloseDate: stage.includes('Closed') ? faker.date.recent({ days: 30 }) : null,
      source: faker.helpers.arrayElement(LEAD_SOURCES),
      type: faker.helpers.arrayElement(['New Business', 'Existing Business', 'Renewal']),
      description: faker.lorem.paragraph(),
      competitorInfo: faker.helpers.arrayElements([
        'Salesforce', 'HubSpot', 'Microsoft', 'Oracle', 'SAP'
      ], { min: 0, max: 2 }),
      tags: faker.helpers.arrayElements(['Enterprise', 'Strategic', 'Competitive', 'Urgent'], { min: 1, max: 2 }),
      owner: faker.person.fullName(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
      customFields: {
        dealSize: amount > 100000 ? 'Large' : amount > 50000 ? 'Medium' : 'Small',
        priority: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
        region: faker.helpers.arrayElement(['North', 'South', 'East', 'West']),
        products: faker.helpers.arrayElements([
          'CRM Platform', 'Analytics Suite', 'Integration Package', 'Training Services'
        ], { min: 1, max: 3 })
      }
    };
  });
};

// Generate Tasks
export const generateTasks = (deals, contacts, count = 200) => {
  return Array.from({ length: count }, () => {
    const id = generateId();
    const type = faker.helpers.arrayElement(TASK_TYPES);
    const deal = faker.helpers.maybe(() => faker.helpers.arrayElement(deals), { probability: 0.7 });
    const contact = faker.helpers.maybe(() => faker.helpers.arrayElement(contacts), { probability: 0.8 });
    const dueDate = faker.date.future({ days: 30 });
    const isOverdue = faker.helpers.maybe(() => true, { probability: 0.2 });
    
    return {
      id,
      subject: `${type} - ${deal ? deal.name : contact ? contact.name : faker.company.name()}`,
      description: faker.lorem.paragraph(),
      type,
      status: faker.helpers.arrayElement(['Not Started', 'In Progress', 'Completed', 'Cancelled']),
      priority: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
      dueDate: isOverdue ? faker.date.past({ days: 7 }) : dueDate,
      completedDate: faker.helpers.maybe(() => faker.date.recent({ days: 7 }), { probability: 0.3 }),
      dealId: deal?.id,
      dealName: deal?.name,
      contactId: contact?.id,
      contactName: contact?.name,
      accountId: contact?.accountId,
      accountName: contact?.accountName,
      assignedTo: faker.person.fullName(),
      createdBy: faker.person.fullName(),
      estimatedHours: faker.number.int({ min: 1, max: 8 }),
      actualHours: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 }), { probability: 0.4 }),
      tags: faker.helpers.arrayElements(['Follow-up', 'Demo', 'Proposal', 'Contract'], { min: 0, max: 2 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
      customFields: {
        outcome: faker.helpers.maybe(() => faker.helpers.arrayElement([
          'Successful', 'Needs Follow-up', 'No Response', 'Rescheduled'
        ]), { probability: 0.5 }),
        nextAction: faker.helpers.arrayElement([
          'Send Proposal', 'Schedule Demo', 'Follow Up', 'Close Deal'
        ])
      }
    };
  });
};

// Generate Activities
export const generateActivities = (deals, contacts, count = 300) => {
  return Array.from({ length: count }, () => {
    const id = generateId();
    const type = faker.helpers.arrayElement(['Call', 'Email', 'Meeting', 'Note', 'Task']);
    const deal = faker.helpers.maybe(() => faker.helpers.arrayElement(deals), { probability: 0.6 });
    const contact = faker.helpers.maybe(() => faker.helpers.arrayElement(contacts), { probability: 0.8 });
    
    return {
      id,
      subject: `${type} - ${deal ? deal.name : contact ? contact.name : 'General Activity'}`,
      description: faker.lorem.paragraph(),
      type,
      status: faker.helpers.arrayElement(['Completed', 'Scheduled', 'Cancelled']),
      startDate: faker.date.recent({ days: 30 }),
      endDate: faker.date.recent({ days: 30 }),
      duration: faker.number.int({ min: 15, max: 120 }), // minutes
      dealId: deal?.id,
      dealName: deal?.name,
      contactId: contact?.id,
      contactName: contact?.name,
      accountId: contact?.accountId,
      accountName: contact?.accountName,
      owner: faker.person.fullName(),
      location: faker.helpers.maybe(() => faker.location.city(), { probability: 0.3 }),
      outcome: faker.helpers.arrayElement(['Positive', 'Neutral', 'Negative', 'No Response']),
      nextSteps: faker.lorem.sentence(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 })
    };
  });
};

// Generate complete dataset with relationships
export const generateMockData = () => {
  console.log('Generating comprehensive mock data...');
  
  const accounts = generateAccounts(50);
  const contacts = generateContacts(accounts, 150);
  const leads = generateLeads(100);
  const deals = generateDeals(accounts, contacts, 75);
  const tasks = generateTasks(deals, contacts, 200);
  const activities = generateActivities(deals, contacts, 300);
  
  console.log('Mock data generated:', {
    accounts: accounts.length,
    contacts: contacts.length,
    leads: leads.length,
    deals: deals.length,
    tasks: tasks.length,
    activities: activities.length
  });
  
  return {
    accounts,
    contacts,
    leads,
    deals,
    tasks,
    activities,
    // Metadata
    metadata: {
      generated: new Date().toISOString(),
      version: '2.0',
      totalRecords: accounts.length + contacts.length + leads.length + deals.length + tasks.length + activities.length
    }
  };
};

// Export individual generators for testing
export {
  INDUSTRIES,
  COMPANY_SIZES,
  LEAD_SOURCES,
  DEAL_STAGES,
  TASK_TYPES,
  CONTACT_ROLES
};