import { base44 } from '@/api/base44Client';

/**
 * Enhanced Lead Service with advanced business logic
 * Provides comprehensive lead management, qualification, scoring, and analytics
 */
class LeadService {
  constructor() {
    this.entity = base44.entities.Lead;
    this.contactEntity = base44.entities.Contact;
    this.dealEntity = base44.entities.Deal;
    this.accountEntity = base44.entities.Account;
    this.userEntity = base44.entities.User;
  }

  // ==================== CRUD Operations ====================

  async getAllLeads(options = {}) {
    try {
      const { 
        sortBy = '-created_date', 
        filters = {}, 
        searchQuery = '',
        status = null,
        source = null,
        assignedUser = null,
        scoreRange = null,
        dateRange = null
      } = options;

      let leads = await this.entity.list(sortBy);

      // Apply filters
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        leads = leads.filter(lead => 
          (lead.first_name?.toLowerCase().includes(query)) ||
          (lead.last_name?.toLowerCase().includes(query)) ||
          (lead.email?.toLowerCase().includes(query)) ||
          (lead.company?.toLowerCase().includes(query)) ||
          (lead.phone?.includes(query))
        );
      }

      if (status && status !== 'all') {
        leads = leads.filter(lead => lead.status === status);
      }

      if (source && source !== 'all') {
        leads = leads.filter(lead => lead.lead_source === source);
      }

      if (assignedUser && assignedUser !== 'all') {
        leads = leads.filter(lead => 
          lead.assigned_users?.includes(assignedUser)
        );
      }

      if (scoreRange) {
        const [min, max] = scoreRange;
        leads = leads.filter(lead => {
          const score = lead.lead_score || 0;
          return score >= min && score <= max;
        });
      }

      if (dateRange) {
        const { startDate, endDate } = dateRange;
        leads = leads.filter(lead => {
          const leadDate = new Date(lead.created_date);
          return leadDate >= new Date(startDate) && leadDate <= new Date(endDate);
        });
      }

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          leads = leads.filter(lead => lead[key] === value);
        }
      });

      return { success: true, data: leads };
    } catch (error) {
      console.error('Error fetching leads:', error);
      return { success: false, error: error.message };
    }
  }

  async getLeadById(id) {
    try {
      const lead = await this.entity.get(id);
      return { success: true, data: lead };
    } catch (error) {
      console.error('Error fetching lead:', error);
      return { success: false, error: error.message };
    }
  }

  async createLead(leadData) {
    try {
      // Validate required fields
      const validation = this.validateLeadData(leadData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Calculate initial lead score
      const leadScore = this.calculateLeadScore(leadData);
      
      // Enrich lead data
      const enrichedData = await this.enrichLeadData({
        ...leadData,
        lead_score: leadScore,
        qualification_status: this.getQualificationStatus(leadScore),
        created_date: new Date().toISOString(),
        last_activity_date: new Date().toISOString()
      });

      const lead = await this.entity.create(enrichedData);
      
      // Auto-assign based on lead score and routing rules
      await this.autoAssignLead(lead.id, leadScore);

      return { success: true, data: lead };
    } catch (error) {
      console.error('Error creating lead:', error);
      return { success: false, error: error.message };
    }
  }

  async updateLead(id, updateData) {
    try {
      const existingLead = await this.entity.get(id);
      
      // Recalculate lead score if relevant data changed
      const scoreRelevantFields = ['company', 'job_title', 'lead_source', 'budget', 'timeline'];
      const shouldRecalculateScore = scoreRelevantFields.some(field => 
        updateData.hasOwnProperty(field)
      );

      if (shouldRecalculateScore) {
        const mergedData = { ...existingLead, ...updateData };
        updateData.lead_score = this.calculateLeadScore(mergedData);
        updateData.qualification_status = this.getQualificationStatus(updateData.lead_score);
      }

      updateData.last_activity_date = new Date().toISOString();

      const lead = await this.entity.update(id, updateData);
      return { success: true, data: lead };
    } catch (error) {
      console.error('Error updating lead:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteLead(id) {
    try {
      await this.entity.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting lead:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Lead Qualification & Scoring ====================

  calculateLeadScore(leadData) {
    let score = 0;
    const weights = {
      company: 20,
      jobTitle: 15,
      leadSource: 10,
      budget: 25,
      timeline: 15,
      engagement: 15
    };

    // Company scoring
    if (leadData.company) {
      if (leadData.company_size) {
        if (leadData.company_size === 'Enterprise (1000+)') score += weights.company;
        else if (leadData.company_size === 'Large (200-999)') score += weights.company * 0.8;
        else if (leadData.company_size === 'Medium (50-199)') score += weights.company * 0.6;
        else if (leadData.company_size === 'Small (10-49)') score += weights.company * 0.4;
        else score += weights.company * 0.2;
      } else {
        score += weights.company * 0.5; // Default if company exists but size unknown
      }
    }

    // Job title scoring
    if (leadData.job_title) {
      const decisionMakerTitles = ['ceo', 'cto', 'cfo', 'president', 'director', 'vp', 'head'];
      const influencerTitles = ['manager', 'lead', 'senior', 'principal'];
      
      const title = leadData.job_title.toLowerCase();
      if (decisionMakerTitles.some(t => title.includes(t))) {
        score += weights.jobTitle;
      } else if (influencerTitles.some(t => title.includes(t))) {
        score += weights.jobTitle * 0.7;
      } else {
        score += weights.jobTitle * 0.3;
      }
    }

    // Lead source scoring
    if (leadData.lead_source) {
      const sourceScores = {
        'Referral': 1.0,
        'Partner': 0.9,
        'Direct': 0.8,
        'Website': 0.7,
        'LinkedIn': 0.6,
        'Email Campaign': 0.5,
        'Social Media': 0.4,
        'Advertisement': 0.3,
        'Cold Call': 0.2
      };
      score += weights.leadSource * (sourceScores[leadData.lead_source] || 0.3);
    }

    // Budget scoring
    if (leadData.budget) {
      const budget = parseFloat(leadData.budget);
      if (budget >= 100000) score += weights.budget;
      else if (budget >= 50000) score += weights.budget * 0.8;
      else if (budget >= 25000) score += weights.budget * 0.6;
      else if (budget >= 10000) score += weights.budget * 0.4;
      else score += weights.budget * 0.2;
    }

    // Timeline scoring
    if (leadData.timeline) {
      const timelineScores = {
        'Immediate (< 1 month)': 1.0,
        'Short-term (1-3 months)': 0.8,
        'Medium-term (3-6 months)': 0.6,
        'Long-term (6+ months)': 0.3,
        'Just researching': 0.1
      };
      score += weights.timeline * (timelineScores[leadData.timeline] || 0.3);
    }

    // Engagement scoring
    const engagementScore = this.calculateEngagementScore(leadData);
    score += weights.engagement * engagementScore;

    return Math.min(Math.round(score), 100);
  }

  calculateEngagementScore(leadData) {
    let engagementScore = 0;
    
    // Email engagement
    if (leadData.email_opens > 0) engagementScore += 0.2;
    if (leadData.email_clicks > 0) engagementScore += 0.3;
    if (leadData.email_replies > 0) engagementScore += 0.4;

    // Website engagement
    if (leadData.website_visits > 0) engagementScore += 0.2;
    if (leadData.page_views > 5) engagementScore += 0.2;
    if (leadData.time_on_site > 300) engagementScore += 0.3; // 5+ minutes

    // Content engagement
    if (leadData.content_downloads > 0) engagementScore += 0.3;
    if (leadData.webinar_attendance) engagementScore += 0.4;

    // Social engagement
    if (leadData.social_engagement > 0) engagementScore += 0.2;

    return Math.min(engagementScore, 1.0);
  }

  getQualificationStatus(score) {
    if (score >= 80) return 'Hot';
    if (score >= 60) return 'Warm';
    if (score >= 40) return 'Cold';
    return 'Unqualified';
  }

  async qualifyLead(leadId, qualificationData) {
    try {
      const { data: lead } = await this.getLeadById(leadId);
      if (!lead) {
        return { success: false, error: 'Lead not found' };
      }

      const qualificationScore = this.calculateQualificationScore(qualificationData);
      const updatedData = {
        ...qualificationData,
        qualification_score: qualificationScore,
        qualification_status: this.getQualificationStatus(qualificationScore),
        qualification_date: new Date().toISOString(),
        status: qualificationScore >= 60 ? 'Qualified' : 'Unqualified'
      };

      return await this.updateLead(leadId, updatedData);
    } catch (error) {
      console.error('Error qualifying lead:', error);
      return { success: false, error: error.message };
    }
  }

  calculateQualificationScore(qualificationData) {
    const criteria = {
      budget_confirmed: qualificationData.budget_confirmed ? 25 : 0,
      authority_confirmed: qualificationData.authority_confirmed ? 25 : 0,
      need_identified: qualificationData.need_identified ? 25 : 0,
      timeline_confirmed: qualificationData.timeline_confirmed ? 25 : 0
    };

    return Object.values(criteria).reduce((sum, score) => sum + score, 0);
  }

  // ==================== Lead Conversion ====================

  async convertToContact(leadId, contactData = {}) {
    try {
      const { data: lead } = await this.getLeadById(leadId);
      if (!lead) {
        return { success: false, error: 'Lead not found' };
      }

      // Create contact from lead data
      const contactPayload = {
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        mobile: lead.mobile,
        job_title: lead.job_title,
        company: lead.company,
        linkedin_url: lead.linkedin_url,
        lead_source: lead.lead_source,
        assigned_users: lead.assigned_users,
        notes: `Converted from lead: ${lead.serial_number || lead.id}`,
        ...contactData
      };

      const contact = await this.contactEntity.create(contactPayload);

      // Update lead status
      await this.updateLead(leadId, { 
        status: 'Converted',
        converted_date: new Date().toISOString(),
        converted_to_contact_id: contact.id
      });

      return { success: true, data: { lead, contact } };
    } catch (error) {
      console.error('Error converting lead to contact:', error);
      return { success: false, error: error.message };
    }
  }

  async convertToDeal(leadId, dealData) {
    try {
      const { data: lead } = await this.getLeadById(leadId);
      if (!lead) {
        return { success: false, error: 'Lead not found' };
      }

      // Create deal from lead data
      const dealPayload = {
        deal_name: dealData.deal_name || `Deal - ${lead.company}`,
        account_id: dealData.account_id,
        stage: dealData.stage || 'Prospecting',
        probability: dealData.probability || 10,
        amount: dealData.amount || 0,
        expected_close_date: dealData.expected_close_date,
        assigned_users: lead.assigned_users,
        lead_source: lead.lead_source,
        notes: `Converted from lead: ${lead.serial_number || lead.id}`,
        ...dealData
      };

      const deal = await this.dealEntity.create(dealPayload);

      // Update lead status
      await this.updateLead(leadId, { 
        status: 'Converted',
        converted_date: new Date().toISOString(),
        converted_to_deal_id: deal.id
      });

      return { success: true, data: { lead, deal } };
    } catch (error) {
      console.error('Error converting lead to deal:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Lead Analytics ====================

  async getLeadAnalytics(dateRange = null) {
    try {
      const { data: leads } = await this.getAllLeads();
      
      let filteredLeads = leads;
      if (dateRange) {
        const { startDate, endDate } = dateRange;
        filteredLeads = leads.filter(lead => {
          const leadDate = new Date(lead.created_date);
          return leadDate >= new Date(startDate) && leadDate <= new Date(endDate);
        });
      }

      const analytics = {
        totalLeads: filteredLeads.length,
        leadsByStatus: this.groupBy(filteredLeads, 'status'),
        leadsBySource: this.groupBy(filteredLeads, 'lead_source'),
        leadsByScore: this.getScoreDistribution(filteredLeads),
        conversionMetrics: this.calculateConversionMetrics(filteredLeads),
        qualificationMetrics: this.calculateQualificationMetrics(filteredLeads),
        sourcePerformance: this.calculateSourcePerformance(filteredLeads),
        timeToConversion: this.calculateTimeToConversion(filteredLeads),
        leadVelocity: this.calculateLeadVelocity(filteredLeads),
        topPerformers: this.getTopPerformingLeads(filteredLeads)
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error calculating lead analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Lead Assignment & Routing ====================

  async autoAssignLead(leadId, leadScore) {
    try {
      const routingRules = await this.getRoutingRules();
      const assignment = this.determineAssignment(leadScore, routingRules);
      
      if (assignment.assignee) {
        await this.updateLead(leadId, {
          assigned_users: [assignment.assignee],
          assignment_reason: assignment.reason,
          priority: assignment.priority
        });
      }

      return { success: true, data: assignment };
    } catch (error) {
      console.error('Error auto-assigning lead:', error);
      return { success: false, error: error.message };
    }
  }

  determineAssignment(leadScore, routingRules = []) {
    // Default routing logic
    if (leadScore >= 80) {
      return {
        assignee: 'senior-sales-rep',
        reason: 'High-value lead requires experienced rep',
        priority: 'immediate',
        followUpTime: '1 hour'
      };
    } else if (leadScore >= 60) {
      return {
        assignee: 'sales-rep',
        reason: 'Qualified lead for standard follow-up',
        priority: 'high',
        followUpTime: '4 hours'
      };
    } else if (leadScore >= 40) {
      return {
        assignee: 'inside-sales',
        reason: 'Nurturing required before sales engagement',
        priority: 'medium',
        followUpTime: '24 hours'
      };
    } else {
      return {
        assignee: 'marketing',
        reason: 'Lead needs further qualification',
        priority: 'low',
        followUpTime: '1 week'
      };
    }
  }

  async getRoutingRules() {
    // This would typically come from a database or configuration
    return [
      {
        condition: { score: { min: 80 } },
        assignment: { team: 'senior-sales', priority: 'immediate' }
      },
      {
        condition: { score: { min: 60 } },
        assignment: { team: 'sales', priority: 'high' }
      }
    ];
  }

  // ==================== Bulk Operations ====================

  async bulkUpdateLeads(leadIds, updateData) {
    try {
      const results = [];
      for (const id of leadIds) {
        const result = await this.updateLead(id, updateData);
        results.push({ id, ...result });
      }
      return { success: true, data: results };
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      return { success: false, error: error.message };
    }
  }

  async bulkDeleteLeads(leadIds) {
    try {
      const results = [];
      for (const id of leadIds) {
        const result = await this.deleteLead(id);
        results.push({ id, ...result });
      }
      return { success: true, data: results };
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Helper Methods ====================

  validateLeadData(leadData) {
    const errors = [];
    
    if (!leadData.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(leadData.email)) {
      errors.push('Invalid email format');
    }

    if (!leadData.first_name && !leadData.last_name) {
      errors.push('At least first name or last name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async enrichLeadData(leadData) {
    // This could integrate with external services for data enrichment
    const enriched = { ...leadData };
    
    // Add computed fields
    if (leadData.first_name && leadData.last_name) {
      enriched.full_name = `${leadData.first_name} ${leadData.last_name}`;
    }

    // Add industry classification based on company
    if (leadData.company && !leadData.industry) {
      enriched.industry = this.classifyIndustry(leadData.company);
    }

    return enriched;
  }

  classifyIndustry(company) {
    // Simple industry classification logic
    const companyLower = company.toLowerCase();
    
    if (companyLower.includes('tech') || companyLower.includes('software')) {
      return 'Technology';
    } else if (companyLower.includes('bank') || companyLower.includes('financial')) {
      return 'Financial Services';
    } else if (companyLower.includes('health') || companyLower.includes('medical')) {
      return 'Healthcare';
    } else if (companyLower.includes('retail') || companyLower.includes('store')) {
      return 'Retail';
    }
    
    return 'Other';
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'Unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  getScoreDistribution(leads) {
    const distribution = {
      'Hot (80-100)': 0,
      'Warm (60-79)': 0,
      'Cold (40-59)': 0,
      'Unqualified (0-39)': 0
    };

    leads.forEach(lead => {
      const score = lead.lead_score || 0;
      if (score >= 80) distribution['Hot (80-100)']++;
      else if (score >= 60) distribution['Warm (60-79)']++;
      else if (score >= 40) distribution['Cold (40-59)']++;
      else distribution['Unqualified (0-39)']++;
    });

    return distribution;
  }

  calculateConversionMetrics(leads) {
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
    
    return {
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(2) : 0,
      qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads * 100).toFixed(2) : 0,
      totalConverted: convertedLeads,
      totalQualified: qualifiedLeads
    };
  }

  calculateQualificationMetrics(leads) {
    const qualifiedLeads = leads.filter(lead => lead.qualification_score > 0);
    const avgQualificationScore = qualifiedLeads.length > 0 
      ? (qualifiedLeads.reduce((sum, lead) => sum + (lead.qualification_score || 0), 0) / qualifiedLeads.length).toFixed(1)
      : 0;

    return {
      totalQualified: qualifiedLeads.length,
      averageQualificationScore: avgQualificationScore,
      qualificationRate: leads.length > 0 ? (qualifiedLeads.length / leads.length * 100).toFixed(2) : 0
    };
  }

  calculateSourcePerformance(leads) {
    const sourceStats = {};
    
    leads.forEach(lead => {
      const source = lead.lead_source || 'Unknown';
      if (!sourceStats[source]) {
        sourceStats[source] = {
          total: 0,
          converted: 0,
          qualified: 0,
          avgScore: 0,
          totalScore: 0
        };
      }
      
      sourceStats[source].total++;
      sourceStats[source].totalScore += (lead.lead_score || 0);
      
      if (lead.status === 'Converted') sourceStats[source].converted++;
      if (lead.status === 'Qualified') sourceStats[source].qualified++;
    });

    // Calculate averages and rates
    Object.keys(sourceStats).forEach(source => {
      const stats = sourceStats[source];
      stats.avgScore = (stats.totalScore / stats.total).toFixed(1);
      stats.conversionRate = ((stats.converted / stats.total) * 100).toFixed(2);
      stats.qualificationRate = ((stats.qualified / stats.total) * 100).toFixed(2);
      delete stats.totalScore; // Remove intermediate calculation
    });

    return sourceStats;
  }

  calculateTimeToConversion(leads) {
    const convertedLeads = leads.filter(lead => 
      lead.status === 'Converted' && lead.converted_date && lead.created_date
    );

    if (convertedLeads.length === 0) return { averageDays: 0, medianDays: 0 };

    const conversionTimes = convertedLeads.map(lead => {
      const created = new Date(lead.created_date);
      const converted = new Date(lead.converted_date);
      return Math.ceil((converted - created) / (1000 * 60 * 60 * 24)); // Days
    });

    const averageDays = (conversionTimes.reduce((sum, days) => sum + days, 0) / conversionTimes.length).toFixed(1);
    const sortedTimes = conversionTimes.sort((a, b) => a - b);
    const medianDays = sortedTimes[Math.floor(sortedTimes.length / 2)];

    return { averageDays, medianDays };
  }

  calculateLeadVelocity(leads) {
    // Calculate leads created in the last 30 days vs previous 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentLeads = leads.filter(lead => 
      new Date(lead.created_date) >= thirtyDaysAgo
    ).length;

    const previousLeads = leads.filter(lead => {
      const date = new Date(lead.created_date);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    const velocityChange = previousLeads > 0 
      ? (((recentLeads - previousLeads) / previousLeads) * 100).toFixed(2)
      : 0;

    return {
      recentLeads,
      previousLeads,
      velocityChange: parseFloat(velocityChange)
    };
  }

  getTopPerformingLeads(leads, limit = 10) {
    return leads
      .filter(lead => lead.lead_score > 0)
      .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))
      .slice(0, limit)
      .map(lead => ({
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        company: lead.company,
        score: lead.lead_score,
        status: lead.status,
        source: lead.lead_source
      }));
  }
}

// Create and export singleton instance
const leadService = new LeadService();
export default leadService;