// Centralized Services Layer for CRM Application
// This provides a clean separation between business logic and UI components

import { base44 } from '@/api/base44Client';

// Base Service Class
class BaseService {
  constructor(entityName) {
    this.entity = base44.entities[entityName];
    this.entityName = entityName;
  }

  async getAll(options = {}) {
    try {
      const { sort = '-created_date', limit = null, filters = {} } = options;
      let data = await this.entity.list(sort, limit);
      
      // Apply filters
      if (Object.keys(filters).length > 0) {
        data = this.applyFilters(data, filters);
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getById(id) {
    try {
      const data = await this.entity.list();
      const item = data.find(item => item.id === id);
      if (!item) {
        throw new Error(`${this.entityName} not found`);
      }
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async create(data) {
    try {
      const result = await this.entity.create(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(id, data) {
    try {
      const result = await this.entity.update(id, data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(id) {
    try {
      await this.entity.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  applyFilters(data, filters) {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;
        
        const itemValue = item[key];
        if (typeof value === 'string') {
          return itemValue?.toLowerCase().includes(value.toLowerCase());
        }
        return itemValue === value;
      });
    });
  }
}

// Contact Service
class ContactService extends BaseService {
  constructor() {
    super('Contact');
  }

  async getByAccount(accountId) {
    try {
      const data = await this.entity.list();
      const contacts = data.filter(contact => contact.account_id === accountId);
      return { success: true, data: contacts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchByName(query) {
    try {
      const data = await this.entity.list();
      const contacts = data.filter(contact => 
        contact.name?.toLowerCase().includes(query.toLowerCase()) ||
        contact.email?.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, data: contacts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Deal Service
class DealService extends BaseService {
  constructor() {
    super('Deal');
  }

  async getByStage(stage) {
    try {
      const data = await this.entity.list();
      const deals = data.filter(deal => deal.stage === stage);
      return { success: true, data: deals };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPipelineData() {
    try {
      const data = await this.entity.list();
      const pipeline = data.reduce((acc, deal) => {
        const stage = deal.stage || 'Unknown';
        if (!acc[stage]) {
          acc[stage] = { count: 0, value: 0, deals: [] };
        }
        acc[stage].count++;
        acc[stage].value += deal.amount || 0;
        acc[stage].deals.push(deal);
        return acc;
      }, {});
      
      return { success: true, data: pipeline };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRevenueMetrics() {
    try {
      const data = await this.entity.list();
      const totalRevenue = data.reduce((sum, deal) => sum + (deal.amount || 0), 0);
      const avgDealSize = data.length > 0 ? totalRevenue / data.length : 0;
      const wonDeals = data.filter(deal => deal.stage === 'Won');
      const conversionRate = data.length > 0 ? (wonDeals.length / data.length) * 100 : 0;
      
      return {
        success: true,
        data: {
          totalRevenue,
          avgDealSize,
          conversionRate,
          totalDeals: data.length,
          wonDeals: wonDeals.length
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Lead Service
class LeadService extends BaseService {
  constructor() {
    super('Lead');
  }

  async getByStatus(status) {
    try {
      const data = await this.entity.list();
      const leads = data.filter(lead => lead.status === status);
      return { success: true, data: leads };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getBySource(source) {
    try {
      const data = await this.entity.list();
      const leads = data.filter(lead => lead.source === source);
      return { success: true, data: leads };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async convertToContact(leadId, contactData) {
    try {
      const leadResult = await this.getById(leadId);
      if (!leadResult.success) {
        throw new Error('Lead not found');
      }

      const lead = leadResult.data;
      
      // Create contact from lead
      const contactService = new ContactService();
      const contactResult = await contactService.create({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        ...contactData
      });

      if (!contactResult.success) {
        throw new Error('Failed to create contact');
      }

      // Update lead status
      await this.update(leadId, { status: 'Converted' });

      return { success: true, data: contactResult.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Account Service
class AccountService extends BaseService {
  constructor() {
    super('Account');
  }

  async getWithContacts(accountId) {
    try {
      const accountResult = await this.getById(accountId);
      if (!accountResult.success) {
        return accountResult;
      }

      const contactService = new ContactService();
      const contactsResult = await contactService.getByAccount(accountId);
      
      return {
        success: true,
        data: {
          ...accountResult.data,
          contacts: contactsResult.success ? contactsResult.data : []
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRevenueByIndustry() {
    try {
      const data = await this.entity.list();
      const revenueByIndustry = data.reduce((acc, account) => {
        const industry = account.industry || 'Unknown';
        if (!acc[industry]) {
          acc[industry] = 0;
        }
        acc[industry] += account.revenue || 0;
        return acc;
      }, {});
      
      return { success: true, data: revenueByIndustry };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Task Service
class TaskService extends BaseService {
  constructor() {
    super('Task');
  }

  async getByStatus(status) {
    try {
      const data = await this.entity.list();
      const tasks = data.filter(task => task.status === status);
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOverdueTasks() {
    try {
      const data = await this.entity.list();
      const now = new Date();
      const overdueTasks = data.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate < now && task.status !== 'Completed';
      });
      return { success: true, data: overdueTasks };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUpcomingTasks(days = 7) {
    try {
      const data = await this.entity.list();
      const now = new Date();
      const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const upcomingTasks = data.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate >= now && dueDate <= futureDate && task.status !== 'Completed';
      });
      
      return { success: true, data: upcomingTasks };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Analytics Service
class AnalyticsService {
  constructor() {
    this.contactService = new ContactService();
    this.dealService = new DealService();
    this.leadService = new LeadService();
    this.accountService = new AccountService();
    this.taskService = new TaskService();
  }

  async getDashboardMetrics() {
    try {
      const [contacts, deals, leads, accounts, tasks] = await Promise.all([
        this.contactService.getAll(),
        this.dealService.getAll(),
        this.leadService.getAll(),
        this.accountService.getAll(),
        this.taskService.getAll()
      ]);

      const revenueMetrics = await this.dealService.getRevenueMetrics();
      const overdueTasks = await this.taskService.getOverdueTasks();

      return {
        success: true,
        data: {
          totalContacts: contacts.success ? contacts.data.length : 0,
          totalDeals: deals.success ? deals.data.length : 0,
          totalLeads: leads.success ? leads.data.length : 0,
          totalAccounts: accounts.success ? accounts.data.length : 0,
          totalTasks: tasks.success ? tasks.data.length : 0,
          overdueTasks: overdueTasks.success ? overdueTasks.data.length : 0,
          revenue: revenueMetrics.success ? revenueMetrics.data : {}
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getActivityMetrics(period = 'month') {
    try {
      // This would typically involve more complex date filtering
      // For now, returning mock data structure
      return {
        success: true,
        data: {
          period,
          contactsCreated: 25,
          dealsCreated: 12,
          leadsConverted: 8,
          tasksCompleted: 45,
          revenueGenerated: 125000
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Import ReportsService
import { ReportsService, reportsService } from './reportsService';

// Export service instances
export const contactService = new ContactService();
export const dealService = new DealService();
export const leadService = new LeadService();
export const accountService = new AccountService();
export const taskService = new TaskService();
export const analyticsService = new AnalyticsService();
export { reportsService };

// Export service classes for custom instances
export {
  BaseService,
  ContactService,
  DealService,
  LeadService,
  AccountService,
  TaskService,
  AnalyticsService,
  ReportsService
};