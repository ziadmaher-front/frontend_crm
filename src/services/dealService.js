import { base44 } from '@/api/base44Client';

export class DealService {
  // Basic CRUD operations
  static async getDeals(filters = {}) {
    try {
      const deals = await base44.entities.Deal.list('-created_date');
      return this.processDealsData(deals, filters);
    } catch (error) {
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }
  }

  static async getDeal(id) {
    try {
      const deal = await base44.entities.Deal.get(id);
      return this.processDealData(deal);
    } catch (error) {
      throw new Error(`Failed to fetch deal: ${error.message}`);
    }
  }

  static async createDeal(dealData) {
    try {
      const validatedData = this.validateDealData(dealData);
      const processedData = this.processDealData(validatedData);
      return await base44.entities.Deal.create(processedData);
    } catch (error) {
      throw new Error(`Failed to create deal: ${error.message}`);
    }
  }

  static async updateDeal(id, dealData) {
    try {
      const validatedData = this.validateDealData(dealData);
      const processedData = this.processDealData(validatedData);
      return await base44.entities.Deal.update(id, processedData);
    } catch (error) {
      throw new Error(`Failed to update deal: ${error.message}`);
    }
  }

  static async deleteDeal(id) {
    try {
      return await base44.entities.Deal.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete deal: ${error.message}`);
    }
  }

  // Pipeline Management
  static async getPipelineData() {
    try {
      const deals = await base44.entities.Deal.list();
      const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
      
      const pipeline = stages.map(stage => {
        const stageDeals = deals.filter(deal => deal.stage === stage);
        const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
        const avgDealSize = stageDeals.length > 0 ? totalValue / stageDeals.length : 0;
        
        return {
          stage,
          count: stageDeals.length,
          totalValue,
          avgDealSize,
          deals: stageDeals,
          conversionRate: this.calculateStageConversionRate(deals, stage)
        };
      });

      return {
        pipeline,
        totalDeals: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
        metrics: this.calculatePipelineMetrics(deals)
      };
    } catch (error) {
      throw new Error(`Failed to fetch pipeline data: ${error.message}`);
    }
  }

  static async moveDealToStage(dealId, newStage, reason = '') {
    try {
      const deal = await this.getDeal(dealId);
      const oldStage = deal.stage;
      
      // Update deal stage
      const updatedDeal = await this.updateDeal(dealId, {
        ...deal,
        stage: newStage,
        stage_changed_date: new Date().toISOString(),
        stage_change_reason: reason
      });

      // Log stage change activity
      await this.logStageChangeActivity(dealId, oldStage, newStage, reason);
      
      return updatedDeal;
    } catch (error) {
      throw new Error(`Failed to move deal to stage: ${error.message}`);
    }
  }

  // Analytics and Forecasting
  static async getDealAnalytics(timeframe = 'month') {
    try {
      const deals = await base44.entities.Deal.list();
      const now = new Date();
      const startDate = this.getTimeframeStartDate(now, timeframe);
      
      const filteredDeals = deals.filter(deal => 
        new Date(deal.created_date) >= startDate
      );

      return {
        totalDeals: filteredDeals.length,
        totalValue: filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
        avgDealSize: filteredDeals.length > 0 ? 
          filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / filteredDeals.length : 0,
        winRate: this.calculateWinRate(filteredDeals),
        avgSalesCycle: this.calculateAvgSalesCycle(filteredDeals),
        conversionRates: this.calculateConversionRates(filteredDeals),
        topPerformers: this.getTopPerformers(filteredDeals),
        dealsBySource: this.groupDealsBySource(filteredDeals),
        monthlyTrends: this.calculateMonthlyTrends(deals)
      };
    } catch (error) {
      throw new Error(`Failed to fetch deal analytics: ${error.message}`);
    }
  }

  static async getForecast(period = 'quarter') {
    try {
      const deals = await base44.entities.Deal.list();
      const openDeals = deals.filter(deal => 
        !['Closed Won', 'Closed Lost'].includes(deal.stage)
      );

      const forecastData = {
        bestCase: 0,
        mostLikely: 0,
        worstCase: 0,
        committed: 0,
        pipeline: 0
      };

      openDeals.forEach(deal => {
        const amount = deal.amount || 0;
        const probability = (deal.probability || 0) / 100;
        
        forecastData.pipeline += amount;
        forecastData.bestCase += amount;
        forecastData.mostLikely += amount * probability;
        
        if (probability >= 0.9) {
          forecastData.committed += amount;
        }
        
        if (probability >= 0.5) {
          forecastData.worstCase += amount * 0.5;
        }
      });

      return {
        ...forecastData,
        dealCount: openDeals.length,
        avgDealSize: openDeals.length > 0 ? forecastData.pipeline / openDeals.length : 0,
        forecastAccuracy: await this.calculateForecastAccuracy(period)
      };
    } catch (error) {
      throw new Error(`Failed to generate forecast: ${error.message}`);
    }
  }

  // Deal Filtering and Search
  static async searchDeals(query, filters = {}) {
    try {
      const deals = await base44.entities.Deal.list();
      let filteredDeals = deals;

      // Text search
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredDeals = filteredDeals.filter(deal =>
          deal.deal_name?.toLowerCase().includes(searchTerm) ||
          deal.description?.toLowerCase().includes(searchTerm) ||
          deal.next_step?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply filters
      if (filters.stage) {
        filteredDeals = filteredDeals.filter(deal => deal.stage === filters.stage);
      }
      
      if (filters.owner_email) {
        filteredDeals = filteredDeals.filter(deal => deal.owner_email === filters.owner_email);
      }
      
      if (filters.account_id) {
        filteredDeals = filteredDeals.filter(deal => deal.account_id === filters.account_id);
      }
      
      if (filters.minAmount) {
        filteredDeals = filteredDeals.filter(deal => (deal.amount || 0) >= filters.minAmount);
      }
      
      if (filters.maxAmount) {
        filteredDeals = filteredDeals.filter(deal => (deal.amount || 0) <= filters.maxAmount);
      }
      
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        filteredDeals = filteredDeals.filter(deal => {
          const dealDate = new Date(deal.expected_close_date || deal.created_date);
          return dealDate >= new Date(start) && dealDate <= new Date(end);
        });
      }

      return filteredDeals;
    } catch (error) {
      throw new Error(`Failed to search deals: ${error.message}`);
    }
  }

  // Business Logic Helpers
  static validateDealData(data) {
    const errors = [];

    if (!data.deal_name?.trim()) {
      errors.push('Deal name is required');
    }

    if (!data.stage) {
      errors.push('Deal stage is required');
    }

    if (data.amount && data.amount < 0) {
      errors.push('Deal amount cannot be negative');
    }

    if (data.probability && (data.probability < 0 || data.probability > 100)) {
      errors.push('Probability must be between 0 and 100');
    }

    if (data.expected_close_date) {
      const closeDate = new Date(data.expected_close_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (closeDate < today && !['Closed Won', 'Closed Lost'].includes(data.stage)) {
        errors.push('Expected close date cannot be in the past for open deals');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return data;
  }

  static processDealData(data) {
    return {
      ...data,
      amount: parseFloat(data.amount) || 0,
      probability: parseInt(data.probability) || 0,
      created_date: data.created_date || new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
  }

  static processDealsData(deals, filters = {}) {
    let processedDeals = deals.map(deal => this.processDealData(deal));
    
    // Apply any additional processing based on filters
    if (filters.sortBy) {
      processedDeals = this.sortDeals(processedDeals, filters.sortBy, filters.sortOrder);
    }
    
    return processedDeals;
  }

  static sortDeals(deals, sortBy, order = 'desc') {
    return deals.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'amount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (sortBy.includes('date')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Analytics Helpers
  static calculateStageConversionRate(deals, stage) {
    const stageIndex = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].indexOf(stage);
    if (stageIndex === 0) return 100;
    
    const previousStage = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'][stageIndex - 1];
    const previousStageDeals = deals.filter(deal => deal.stage === previousStage).length;
    const currentStageDeals = deals.filter(deal => deal.stage === stage).length;
    
    return previousStageDeals > 0 ? (currentStageDeals / previousStageDeals) * 100 : 0;
  }

  static calculateWinRate(deals) {
    const closedDeals = deals.filter(deal => ['Closed Won', 'Closed Lost'].includes(deal.stage));
    const wonDeals = deals.filter(deal => deal.stage === 'Closed Won');
    return closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
  }

  static calculateAvgSalesCycle(deals) {
    const closedDeals = deals.filter(deal => 
      ['Closed Won', 'Closed Lost'].includes(deal.stage) && 
      deal.created_date && deal.updated_date
    );
    
    if (closedDeals.length === 0) return 0;
    
    const totalDays = closedDeals.reduce((sum, deal) => {
      const start = new Date(deal.created_date);
      const end = new Date(deal.updated_date);
      return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / closedDeals.length);
  }

  static calculateConversionRates(deals) {
    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];
    const rates = {};
    
    stages.forEach(stage => {
      const stageDeals = deals.filter(deal => deal.stage === stage);
      const wonFromStage = deals.filter(deal => 
        deal.stage === 'Closed Won' && deal.previous_stage === stage
      );
      rates[stage] = stageDeals.length > 0 ? (wonFromStage.length / stageDeals.length) * 100 : 0;
    });
    
    return rates;
  }

  static getTopPerformers(deals) {
    const performerStats = {};
    
    deals.forEach(deal => {
      if (!deal.owner_email) return;
      
      if (!performerStats[deal.owner_email]) {
        performerStats[deal.owner_email] = {
          totalDeals: 0,
          totalValue: 0,
          wonDeals: 0,
          wonValue: 0
        };
      }
      
      performerStats[deal.owner_email].totalDeals++;
      performerStats[deal.owner_email].totalValue += deal.amount || 0;
      
      if (deal.stage === 'Closed Won') {
        performerStats[deal.owner_email].wonDeals++;
        performerStats[deal.owner_email].wonValue += deal.amount || 0;
      }
    });
    
    return Object.entries(performerStats)
      .map(([email, stats]) => ({
        owner_email: email,
        ...stats,
        winRate: stats.totalDeals > 0 ? (stats.wonDeals / stats.totalDeals) * 100 : 0,
        avgDealSize: stats.totalDeals > 0 ? stats.totalValue / stats.totalDeals : 0
      }))
      .sort((a, b) => b.wonValue - a.wonValue)
      .slice(0, 10);
  }

  static groupDealsBySource(deals) {
    const sources = {};
    
    deals.forEach(deal => {
      const source = deal.lead_source || 'Unknown';
      if (!sources[source]) {
        sources[source] = { count: 0, value: 0 };
      }
      sources[source].count++;
      sources[source].value += deal.amount || 0;
    });
    
    return sources;
  }

  static calculateMonthlyTrends(deals) {
    const trends = {};
    
    deals.forEach(deal => {
      const date = new Date(deal.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trends[monthKey]) {
        trends[monthKey] = { count: 0, value: 0, won: 0, wonValue: 0 };
      }
      
      trends[monthKey].count++;
      trends[monthKey].value += deal.amount || 0;
      
      if (deal.stage === 'Closed Won') {
        trends[monthKey].won++;
        trends[monthKey].wonValue += deal.amount || 0;
      }
    });
    
    return Object.entries(trends)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  static calculatePipelineMetrics(deals) {
    const openDeals = deals.filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage));
    const closedDeals = deals.filter(deal => ['Closed Won', 'Closed Lost'].includes(deal.stage));
    
    return {
      totalPipelineValue: openDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
      avgDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / deals.length : 0,
      winRate: this.calculateWinRate(deals),
      avgSalesCycle: this.calculateAvgSalesCycle(closedDeals),
      dealsClosingThisMonth: this.getDealsClosingThisMonth(openDeals).length,
      overdueDeals: this.getOverdueDeals(openDeals).length
    };
  }

  static getDealsClosingThisMonth(deals) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return deals.filter(deal => {
      if (!deal.expected_close_date) return false;
      const closeDate = new Date(deal.expected_close_date);
      return closeDate >= startOfMonth && closeDate <= endOfMonth;
    });
  }

  static getOverdueDeals(deals) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return deals.filter(deal => {
      if (!deal.expected_close_date) return false;
      const closeDate = new Date(deal.expected_close_date);
      return closeDate < today;
    });
  }

  static getTimeframeStartDate(endDate, timeframe) {
    const date = new Date(endDate);
    
    switch (timeframe) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
    
    return date;
  }

  static async logStageChangeActivity(dealId, oldStage, newStage, reason) {
    try {
      await base44.entities.Activity.create({
        activity_type: 'Note',
        subject: `Deal stage changed from ${oldStage} to ${newStage}`,
        description: reason || `Deal moved to ${newStage} stage`,
        deal_id: dealId,
        status: 'Completed',
        activity_date: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log stage change activity:', error);
    }
  }

  static async calculateForecastAccuracy(period) {
    // This would typically compare previous forecasts with actual results
    // For now, return a placeholder value
    return 85; // 85% accuracy
  }
}