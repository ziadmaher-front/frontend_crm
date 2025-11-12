// Advanced Contact Service with Business Logic
// Provides comprehensive contact management, analytics, and relationship tracking

import { base44 } from '@/api/base44Client';

class ContactService {
  constructor() {
    this.entity = base44.entities.Contact;
  }

  // ==================== CRUD Operations ====================

  async getAllContacts(options = {}) {
    try {
      const {
        searchTerm = '',
        filterAccount = '',
        filterOwner = '',
        filterJobTitle = '',
        filterDepartment = '',
        filterCountry = '',
        sortBy = 'created_date',
        sortOrder = 'desc',
        limit = null
      } = options;

      let contacts = await this.entity.list(`${sortOrder === 'desc' ? '-' : ''}${sortBy}`, limit);

      // Apply filters
      if (searchTerm) {
        contacts = this.searchContacts(contacts, searchTerm);
      }

      if (filterAccount) {
        contacts = contacts.filter(contact => contact.account_id === filterAccount);
      }

      if (filterOwner) {
        contacts = contacts.filter(contact => 
          contact.assigned_users?.includes(filterOwner)
        );
      }

      if (filterJobTitle) {
        contacts = contacts.filter(contact => 
          contact.job_title?.toLowerCase().includes(filterJobTitle.toLowerCase())
        );
      }

      if (filterDepartment) {
        contacts = contacts.filter(contact => 
          contact.department?.toLowerCase().includes(filterDepartment.toLowerCase())
        );
      }

      if (filterCountry) {
        contacts = contacts.filter(contact => 
          contact.country?.toLowerCase().includes(filterCountry.toLowerCase())
        );
      }

      return { success: true, data: contacts };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return { success: false, error: error.message };
    }
  }

  async getContactById(id) {
    try {
      const contacts = await this.entity.list();
      const contact = contacts.find(c => c.id === id);
      
      if (!contact) {
        throw new Error('Contact not found');
      }

      return { success: true, data: contact };
    } catch (error) {
      console.error('Error fetching contact:', error);
      return { success: false, error: error.message };
    }
  }

  async createContact(contactData) {
    try {
      // Validate required fields
      const validation = this.validateContactData(contactData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check for duplicate email
      const existingContacts = await this.entity.list();
      const duplicateEmail = existingContacts.find(c => 
        c.email && contactData.email && 
        c.email.toLowerCase() === contactData.email.toLowerCase()
      );

      if (duplicateEmail) {
        throw new Error('A contact with this email already exists');
      }

      // Process contact data
      const processedData = this.processContactData(contactData);
      
      const newContact = await this.entity.create(processedData);
      return { success: true, data: newContact };
    } catch (error) {
      console.error('Error creating contact:', error);
      return { success: false, error: error.message };
    }
  }

  async updateContact(id, contactData) {
    try {
      // Validate contact data
      const validation = this.validateContactData(contactData, id);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Process contact data
      const processedData = this.processContactData(contactData);
      
      const updatedContact = await this.entity.update(id, processedData);
      return { success: true, data: updatedContact };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteContact(id) {
    try {
      await this.entity.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Search and Filtering ====================

  searchContacts(contacts, searchTerm) {
    const term = searchTerm.toLowerCase();
    return contacts.filter(contact => 
      contact.first_name?.toLowerCase().includes(term) ||
      contact.last_name?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.job_title?.toLowerCase().includes(term) ||
      contact.department?.toLowerCase().includes(term) ||
      contact.phone?.includes(term) ||
      contact.mobile?.includes(term) ||
      contact.company_name?.toLowerCase().includes(term)
    );
  }

  async getContactsByAccount(accountId) {
    try {
      const contacts = await this.entity.list();
      const accountContacts = contacts.filter(contact => contact.account_id === accountId);
      return { success: true, data: accountContacts };
    } catch (error) {
      console.error('Error fetching contacts by account:', error);
      return { success: false, error: error.message };
    }
  }

  async getContactsByOwner(ownerId) {
    try {
      const contacts = await this.entity.list();
      const ownerContacts = contacts.filter(contact => 
        contact.assigned_users?.includes(ownerId)
      );
      return { success: true, data: ownerContacts };
    } catch (error) {
      console.error('Error fetching contacts by owner:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Analytics and Insights ====================

  async getContactAnalytics() {
    try {
      const contacts = await this.entity.list();
      
      const analytics = {
        totalContacts: contacts.length,
        contactsByAccount: this.groupContactsByAccount(contacts),
        contactsByJobTitle: this.groupContactsByJobTitle(contacts),
        contactsByDepartment: this.groupContactsByDepartment(contacts),
        contactsByCountry: this.groupContactsByCountry(contacts),
        contactsByOwner: this.groupContactsByOwner(contacts),
        recentContacts: this.getRecentContacts(contacts, 30),
        contactsWithoutAccount: contacts.filter(c => !c.account_id).length,
        contactsWithoutPhone: contacts.filter(c => !c.phone && !c.mobile).length,
        contactsWithoutEmail: contacts.filter(c => !c.email).length,
        engagementMetrics: this.calculateEngagementMetrics(contacts)
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error calculating contact analytics:', error);
      return { success: false, error: error.message };
    }
  }

  async getContactEngagementScore(contactId) {
    try {
      const contact = await this.getContactById(contactId);
      if (!contact.success) {
        throw new Error('Contact not found');
      }

      const score = this.calculateContactEngagementScore(contact.data);
      return { success: true, data: { contactId, score } };
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Relationship Management ====================

  async getContactRelationships(contactId) {
    try {
      // Get related deals, leads, and activities
      const [deals, leads, activities] = await Promise.all([
        base44.entities.Deal.list(),
        base44.entities.Lead.list(),
        // Activities would be fetched here if available
        Promise.resolve([])
      ]);

      const contactDeals = deals.filter(deal => deal.contact_id === contactId);
      const contactLeads = leads.filter(lead => lead.contact_id === contactId);

      return {
        success: true,
        data: {
          deals: contactDeals,
          leads: contactLeads,
          activities: activities,
          totalDealsValue: contactDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
          wonDealsValue: contactDeals
            .filter(deal => deal.stage === 'Won')
            .reduce((sum, deal) => sum + (deal.amount || 0), 0)
        }
      };
    } catch (error) {
      console.error('Error fetching contact relationships:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Bulk Operations ====================

  async bulkUpdateContacts(contactIds, updateData) {
    try {
      const results = [];
      
      for (const id of contactIds) {
        try {
          const result = await this.updateContact(id, updateData);
          results.push({ id, success: result.success, data: result.data });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount
          }
        }
      };
    } catch (error) {
      console.error('Error in bulk update:', error);
      return { success: false, error: error.message };
    }
  }

  async bulkDeleteContacts(contactIds) {
    try {
      const results = [];
      
      for (const id of contactIds) {
        try {
          await this.deleteContact(id);
          results.push({ id, success: true });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount
          }
        }
      };
    } catch (error) {
      console.error('Error in bulk delete:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Helper Methods ====================

  validateContactData(data, excludeId = null) {
    const errors = [];

    // Required fields validation
    if (!data.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!data.last_name?.trim()) {
      errors.push('Last name is required');
    }

    // Email validation
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone format');
    }

    if (data.mobile && !this.isValidPhone(data.mobile)) {
      errors.push('Invalid mobile format');
    }

    // LinkedIn URL validation
    if (data.linkedin_url && !this.isValidLinkedInUrl(data.linkedin_url)) {
      errors.push('Invalid LinkedIn URL format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  processContactData(data) {
    return {
      ...data,
      first_name: data.first_name?.trim(),
      last_name: data.last_name?.trim(),
      email: data.email?.toLowerCase().trim(),
      phone: this.formatPhone(data.phone),
      mobile: this.formatPhone(data.mobile),
      job_title: data.job_title?.trim(),
      department: data.department?.trim(),
      linkedin_url: this.formatLinkedInUrl(data.linkedin_url),
      full_name: `${data.first_name?.trim()} ${data.last_name?.trim()}`.trim()
    };
  }

  groupContactsByAccount(contacts) {
    return contacts.reduce((acc, contact) => {
      const accountId = contact.account_id || 'No Account';
      acc[accountId] = (acc[accountId] || 0) + 1;
      return acc;
    }, {});
  }

  groupContactsByJobTitle(contacts) {
    return contacts.reduce((acc, contact) => {
      const jobTitle = contact.job_title || 'No Job Title';
      acc[jobTitle] = (acc[jobTitle] || 0) + 1;
      return acc;
    }, {});
  }

  groupContactsByDepartment(contacts) {
    return contacts.reduce((acc, contact) => {
      const department = contact.department || 'No Department';
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {});
  }

  groupContactsByCountry(contacts) {
    return contacts.reduce((acc, contact) => {
      const country = contact.country || 'No Country';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
  }

  groupContactsByOwner(contacts) {
    return contacts.reduce((acc, contact) => {
      if (contact.assigned_users?.length) {
        contact.assigned_users.forEach(userId => {
          acc[userId] = (acc[userId] || 0) + 1;
        });
      } else {
        acc['Unassigned'] = (acc['Unassigned'] || 0) + 1;
      }
      return acc;
    }, {});
  }

  getRecentContacts(contacts, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return contacts.filter(contact => {
      const createdDate = new Date(contact.created_date);
      return createdDate >= cutoffDate;
    });
  }

  calculateEngagementMetrics(contacts) {
    const totalContacts = contacts.length;
    const contactsWithEmail = contacts.filter(c => c.email).length;
    const contactsWithPhone = contacts.filter(c => c.phone || c.mobile).length;
    const contactsWithLinkedIn = contacts.filter(c => c.linkedin_url).length;
    const contactsWithAccount = contacts.filter(c => c.account_id).length;

    return {
      emailCoverage: totalContacts > 0 ? (contactsWithEmail / totalContacts * 100).toFixed(1) : 0,
      phoneCoverage: totalContacts > 0 ? (contactsWithPhone / totalContacts * 100).toFixed(1) : 0,
      linkedInCoverage: totalContacts > 0 ? (contactsWithLinkedIn / totalContacts * 100).toFixed(1) : 0,
      accountAssociation: totalContacts > 0 ? (contactsWithAccount / totalContacts * 100).toFixed(1) : 0
    };
  }

  calculateContactEngagementScore(contact) {
    let score = 0;
    
    // Basic information completeness (40 points)
    if (contact.email) score += 10;
    if (contact.phone || contact.mobile) score += 10;
    if (contact.job_title) score += 5;
    if (contact.department) score += 5;
    if (contact.linkedin_url) score += 5;
    if (contact.account_id) score += 5;

    // Contact quality (30 points)
    if (contact.notes && contact.notes.length > 50) score += 10;
    if (contact.address && contact.city && contact.country) score += 10;
    if (contact.assigned_users?.length > 0) score += 10;

    // Relationship strength (30 points)
    // This would be enhanced with actual activity data
    if (contact.last_activity_date) {
      const daysSinceActivity = Math.floor(
        (new Date() - new Date(contact.last_activity_date)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceActivity <= 7) score += 30;
      else if (daysSinceActivity <= 30) score += 20;
      else if (daysSinceActivity <= 90) score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }

  // Validation helpers
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  isValidLinkedInUrl(url) {
    if (!url) return true; // Optional field
    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/;
    return linkedInRegex.test(url);
  }

  formatPhone(phone) {
    if (!phone) return phone;
    return phone.replace(/[\s\-\(\)]/g, '');
  }

  formatLinkedInUrl(url) {
    if (!url) return url;
    if (!url.startsWith('http')) {
      return `https://linkedin.com/in/${url}`;
    }
    return url;
  }

  // Sorting helpers
  sortContacts(contacts, sortBy, sortOrder = 'asc') {
    return [...contacts].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Convert to strings for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });
  }
}

// Export singleton instance
export const contactService = new ContactService();
export default contactService;