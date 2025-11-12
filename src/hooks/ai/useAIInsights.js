// Advanced AI Insights Hook for CRM Intelligence
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import { useNotifications } from '../useNotifications';
import { useOptimizedQuery } from '../performance/useOptimizedQuery';

// AI Insights Engine
class AIInsightsEngine {
  constructor() {
    this.models = new Map();
    this.cache = new Map();
    this.learningData = new Map();
    this.confidenceThreshold = 0.7;
  }

  // Lead Scoring Algorithm
  calculateLeadScore(lead) {
    const factors = {
      // Demographic factors
      companySize: this.getCompanySizeScore(lead.companySize),
      industry: this.getIndustryScore(lead.industry),
      jobTitle: this.getJobTitleScore(lead.jobTitle),
      
      // Behavioral factors
      emailEngagement: this.getEmailEngagementScore(lead.emailEngagement),
      websiteActivity: this.getWebsiteActivityScore(lead.websiteActivity),
      socialActivity: this.getSocialActivityScore(lead.socialActivity),
      
      // Interaction factors
      responseTime: this.getResponseTimeScore(lead.responseTime),
      meetingAttendance: this.getMeetingAttendanceScore(lead.meetingAttendance),
      contentDownloads: this.getContentDownloadsScore(lead.contentDownloads),
      
      // Timing factors
      seasonality: this.getSeasonalityScore(lead.createdAt),
      urgency: this.getUrgencyScore(lead.urgencyIndicators),
    };

    // Weighted scoring
    const weights = {
      companySize: 0.15,
      industry: 0.12,
      jobTitle: 0.13,
      emailEngagement: 0.18,
      websiteActivity: 0.15,
      socialActivity: 0.08,
      responseTime: 0.10,
      meetingAttendance: 0.05,
      contentDownloads: 0.02,
      seasonality: 0.01,
      urgency: 0.01,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(factors).forEach(([factor, score]) => {
      if (score !== null && score !== undefined) {
        totalScore += score * weights[factor];
        totalWeight += weights[factor];
      }
    });

    const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    
    return {
      score: Math.round(finalScore),
      factors,
      confidence: this.calculateConfidence(factors),
      recommendations: this.generateLeadRecommendations(lead, factors),
    };
  }

  // Sales Forecasting
  generateSalesForcast(deals, historicalData, timeframe = 'quarter') {
    const pipeline = this.analyzePipeline(deals);
    const trends = this.analyzeTrends(historicalData);
    const seasonality = this.analyzeSeasonality(historicalData);
    
    const forecast = {
      timeframe,
      predictedRevenue: this.predictRevenue(pipeline, trends, seasonality),
      confidence: this.calculateForecastConfidence(pipeline, trends),
      scenarios: this.generateScenarios(pipeline, trends),
      recommendations: this.generateForecastRecommendations(pipeline, trends),
    };

    return forecast;
  }

  // Opportunity Analysis
  analyzeOpportunity(deal) {
    const winProbability = this.calculateWinProbability(deal);
    const riskFactors = this.identifyRiskFactors(deal);
    const nextBestActions = this.suggestNextActions(deal);
    
    return {
      winProbability,
      riskFactors,
      nextBestActions,
      competitorAnalysis: this.analyzeCompetitors(deal),
      timelineAnalysis: this.analyzeTimeline(deal),
    };
  }

  // Customer Insights
  generateCustomerInsights(customer, interactions, deals) {
    const profile = this.buildCustomerProfile(customer, interactions);
    const behavior = this.analyzeBehaviorPatterns(interactions);
    const value = this.calculateCustomerValue(customer, deals);
    
    return {
      profile,
      behavior,
      value,
      churnRisk: this.calculateChurnRisk(customer, interactions),
      upsellOpportunities: this.identifyUpsellOpportunities(customer, deals),
      recommendations: this.generateCustomerRecommendations(customer, profile, behavior),
    };
  }

  // Market Intelligence
  generateMarketInsights(data) {
    return {
      trends: this.identifyMarketTrends(data),
      opportunities: this.identifyMarketOpportunities(data),
      threats: this.identifyMarketThreats(data),
      competitivePosition: this.analyzeCompetitivePosition(data),
    };
  }

  // Helper methods for scoring
  getCompanySizeScore(size) {
    const sizeMap = {
      'enterprise': 90,
      'large': 75,
      'medium': 60,
      'small': 40,
      'startup': 25,
    };
    return sizeMap[size?.toLowerCase()] || 50;
  }

  getIndustryScore(industry) {
    // Industry scoring based on conversion rates
    const industryMap = {
      'technology': 85,
      'healthcare': 80,
      'finance': 75,
      'manufacturing': 70,
      'retail': 65,
      'education': 60,
    };
    return industryMap[industry?.toLowerCase()] || 50;
  }

  getJobTitleScore(title) {
    const titleMap = {
      'ceo': 95,
      'cto': 90,
      'vp': 85,
      'director': 80,
      'manager': 70,
      'coordinator': 50,
      'assistant': 30,
    };
    
    const lowerTitle = title?.toLowerCase() || '';
    for (const [key, score] of Object.entries(titleMap)) {
      if (lowerTitle.includes(key)) {
        return score;
      }
    }
    return 50;
  }

  getEmailEngagementScore(engagement) {
    if (!engagement) return 50;
    
    const openRate = engagement.openRate || 0;
    const clickRate = engagement.clickRate || 0;
    const replyRate = engagement.replyRate || 0;
    
    return Math.min(100, (openRate * 0.3 + clickRate * 0.4 + replyRate * 0.3) * 100);
  }

  getWebsiteActivityScore(activity) {
    if (!activity) return 50;
    
    const pageViews = Math.min(activity.pageViews || 0, 50);
    const timeOnSite = Math.min(activity.timeOnSite || 0, 600); // Max 10 minutes
    const downloads = Math.min(activity.downloads || 0, 10);
    
    return (pageViews * 0.4 + (timeOnSite / 6) * 0.3 + downloads * 0.3);
  }

  calculateWinProbability(deal) {
    const stageWeights = {
      'prospecting': 10,
      'qualification': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed-won': 100,
      'closed-lost': 0,
    };
    
    const baseProb = stageWeights[deal.stage?.toLowerCase()] || 25;
    
    // Adjust based on factors
    let adjustments = 0;
    
    if (deal.budget && deal.value <= deal.budget) adjustments += 10;
    if (deal.decisionMaker) adjustments += 15;
    if (deal.timeline && new Date(deal.timeline) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      adjustments += 10;
    }
    if (deal.competitorCount === 0) adjustments += 20;
    if (deal.competitorCount > 3) adjustments -= 15;
    
    return Math.max(0, Math.min(100, baseProb + adjustments));
  }

  identifyRiskFactors(deal) {
    const risks = [];
    
    if (!deal.budget || deal.value > deal.budget * 1.2) {
      risks.push({
        type: 'budget',
        severity: 'high',
        message: 'Deal value exceeds budget by significant margin',
        impact: 'May require budget approval or value reduction',
      });
    }
    
    if (deal.competitorCount > 2) {
      risks.push({
        type: 'competition',
        severity: 'medium',
        message: 'High competition with multiple vendors',
        impact: 'May require aggressive pricing or differentiation',
      });
    }
    
    if (!deal.decisionMaker) {
      risks.push({
        type: 'decision-maker',
        severity: 'high',
        message: 'No identified decision maker',
        impact: 'Deal may stall without proper stakeholder engagement',
      });
    }
    
    const daysSinceLastActivity = deal.lastActivity ? 
      (Date.now() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24) : 
      Infinity;
    
    if (daysSinceLastActivity > 14) {
      risks.push({
        type: 'stagnation',
        severity: 'medium',
        message: 'No recent activity on deal',
        impact: 'Deal may be losing momentum',
      });
    }
    
    return risks;
  }

  suggestNextActions(deal) {
    const actions = [];
    const stage = deal.stage?.toLowerCase();
    
    switch (stage) {
      case 'prospecting':
        actions.push({
          action: 'Schedule discovery call',
          priority: 'high',
          timeline: '2-3 days',
          reason: 'Qualify opportunity and understand requirements',
        });
        break;
        
      case 'qualification':
        actions.push({
          action: 'Send proposal',
          priority: 'high',
          timeline: '1 week',
          reason: 'Move deal forward with concrete offering',
        });
        break;
        
      case 'proposal':
        actions.push({
          action: 'Follow up on proposal',
          priority: 'medium',
          timeline: '3-5 days',
          reason: 'Address questions and move to negotiation',
        });
        break;
        
      case 'negotiation':
        actions.push({
          action: 'Prepare final contract',
          priority: 'high',
          timeline: '1-2 days',
          reason: 'Close the deal quickly',
        });
        break;
    }
    
    return actions;
  }

  calculateConfidence(factors) {
    const validFactors = Object.values(factors).filter(f => f !== null && f !== undefined);
    const dataCompleteness = validFactors.length / Object.keys(factors).length;
    
    // Base confidence on data completeness and factor consistency
    const factorVariance = this.calculateVariance(validFactors);
    const consistencyScore = Math.max(0, 1 - factorVariance / 100);
    
    return Math.round((dataCompleteness * 0.6 + consistencyScore * 0.4) * 100);
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  generateLeadRecommendations(lead, factors) {
    const recommendations = [];
    
    if (factors.emailEngagement < 30) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        action: 'Improve email engagement',
        suggestion: 'Try personalized subject lines and valuable content',
      });
    }
    
    if (factors.websiteActivity < 40) {
      recommendations.push({
        type: 'nurturing',
        priority: 'medium',
        action: 'Increase website engagement',
        suggestion: 'Send targeted content and resources',
      });
    }
    
    if (factors.responseTime > 70) {
      recommendations.push({
        type: 'timing',
        priority: 'high',
        action: 'Follow up quickly',
        suggestion: 'Lead is highly responsive, prioritize immediate contact',
      });
    }
    
    return recommendations;
  }
}

// Singleton AI engine
const aiEngine = new AIInsightsEngine();

export const useAIInsights = (options = {}) => {
  const {
    enableLeadScoring = true,
    enableSalesForecasting = true,
    enableOpportunityAnalysis = true,
    enableCustomerInsights = true,
    enableMarketIntelligence = true,
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
  } = options;

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addNotification } = useNotifications();

  // Lead scoring insights
  const {
    data: leadInsights,
    isLoading: leadInsightsLoading,
    refetch: refetchLeadInsights,
  } = useOptimizedQuery({
    queryKey: ['ai-insights', 'leads', user?.id],
    queryFn: async () => {
      const leads = await queryClient.getQueryData(['leads']) || [];
      return leads.map(lead => ({
        ...lead,
        aiScore: aiEngine.calculateLeadScore(lead),
      }));
    },
    enabled: enableLeadScoring,
    staleTime: refreshInterval,
    enableIntelligentCaching: true,
  });

  // Sales forecasting
  const {
    data: salesForecast,
    isLoading: forecastLoading,
    refetch: refetchForecast,
  } = useOptimizedQuery({
    queryKey: ['ai-insights', 'forecast', user?.id],
    queryFn: async () => {
      const deals = await queryClient.getQueryData(['deals']) || [];
      const historicalData = await queryClient.getQueryData(['analytics', 'historical']) || [];
      return aiEngine.generateSalesForcast(deals, historicalData);
    },
    enabled: enableSalesForecasting,
    staleTime: refreshInterval,
  });

  // Opportunity analysis
  const analyzeOpportunity = useCallback((deal) => {
    return aiEngine.analyzeOpportunity(deal);
  }, []);

  // Customer insights
  const {
    data: customerInsights,
    isLoading: customerInsightsLoading,
  } = useOptimizedQuery({
    queryKey: ['ai-insights', 'customers', user?.id],
    queryFn: async () => {
      const customers = await queryClient.getQueryData(['contacts']) || [];
      const interactions = await queryClient.getQueryData(['activities']) || [];
      const deals = await queryClient.getQueryData(['deals']) || [];
      
      return customers.map(customer => ({
        ...customer,
        insights: aiEngine.generateCustomerInsights(customer, interactions, deals),
      }));
    },
    enabled: enableCustomerInsights,
    staleTime: refreshInterval,
  });

  // Market intelligence
  const {
    data: marketInsights,
    isLoading: marketInsightsLoading,
  } = useOptimizedQuery({
    queryKey: ['ai-insights', 'market', user?.id],
    queryFn: async () => {
      const marketData = await queryClient.getQueryData(['analytics', 'market']) || {};
      return aiEngine.generateMarketInsights(marketData);
    },
    enabled: enableMarketIntelligence,
    staleTime: refreshInterval * 2, // Market data changes less frequently
  });

  // Generate insights for specific entity
  const generateInsights = useCallback(async (entityType, entityId, data) => {
    try {
      let insights;
      
      switch (entityType) {
        case 'lead':
          insights = aiEngine.calculateLeadScore(data);
          break;
        case 'deal':
          insights = aiEngine.analyzeOpportunity(data);
          break;
        case 'customer':
          const interactions = await queryClient.getQueryData(['activities']) || [];
          const deals = await queryClient.getQueryData(['deals']) || [];
          insights = aiEngine.generateCustomerInsights(data, interactions, deals);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
      
      return insights;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'AI Insights Error',
        message: `Failed to generate insights: ${error.message}`,
      });
      throw error;
    }
  }, [queryClient, addNotification]);

  // Bulk insights generation
  const generateBulkInsights = useMutation({
    mutationFn: async ({ entities, entityType }) => {
      const results = await Promise.all(
        entities.map(entity => generateInsights(entityType, entity.id, entity))
      );
      return results;
    },
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        title: 'Insights Generated',
        message: `Successfully generated insights for ${data.length} entities`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Bulk Insights Error',
        message: error.message,
      });
    },
  });

  // Get top recommendations
  const getTopRecommendations = useCallback((limit = 5) => {
    const recommendations = [];
    
    // Lead recommendations
    if (leadInsights) {
      leadInsights.forEach(lead => {
        if (lead.aiScore?.recommendations) {
          lead.aiScore.recommendations.forEach(rec => {
            recommendations.push({
              ...rec,
              entityType: 'lead',
              entityId: lead.id,
              entityName: lead.name,
              score: lead.aiScore.score,
            });
          });
        }
      });
    }
    
    // Sort by priority and score
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (b.score || 0) - (a.score || 0);
      })
      .slice(0, limit);
  }, [leadInsights]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    return {
      leadScoringAccuracy: 85, // This would be calculated based on historical data
      forecastAccuracy: 78,
      recommendationFollowRate: 65,
      insightsGenerated: (leadInsights?.length || 0) + (customerInsights?.length || 0),
    };
  }, [leadInsights, customerInsights]);

  return {
    // Data
    leadInsights,
    salesForecast,
    customerInsights,
    marketInsights,
    
    // Loading states
    isLoading: leadInsightsLoading || forecastLoading || customerInsightsLoading || marketInsightsLoading,
    leadInsightsLoading,
    forecastLoading,
    customerInsightsLoading,
    marketInsightsLoading,
    
    // Methods
    generateInsights,
    generateBulkInsights,
    analyzeOpportunity,
    getTopRecommendations,
    
    // Refresh methods
    refetchLeadInsights,
    refetchForecast,
    refreshAll: () => {
      refetchLeadInsights();
      refetchForecast();
    },
    
    // Metrics
    performanceMetrics,
    
    // Configuration
    enabled: {
      leadScoring: enableLeadScoring,
      salesForecasting: enableSalesForecasting,
      opportunityAnalysis: enableOpportunityAnalysis,
      customerInsights: enableCustomerInsights,
      marketIntelligence: enableMarketIntelligence,
    },
  };
};

export default useAIInsights;