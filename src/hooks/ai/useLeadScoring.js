// Advanced Lead Scoring Hook with ML-based Scoring
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import { useNotifications } from '../useNotifications';
import { useOptimizedQuery } from '../performance/useOptimizedQuery';

// Lead Scoring Engine with ML Algorithms
class LeadScoringEngine {
  constructor() {
    this.scoringModels = new Map();
    this.behavioralWeights = {
      emailEngagement: 0.15,
      websiteActivity: 0.20,
      socialMedia: 0.10,
      contentDownloads: 0.15,
      eventAttendance: 0.10,
      demoRequests: 0.30,
    };
    
    this.demographicWeights = {
      companySize: 0.25,
      industry: 0.20,
      jobTitle: 0.25,
      budget: 0.30,
    };
    
    this.firmographicWeights = {
      revenue: 0.30,
      employees: 0.25,
      location: 0.15,
      technology: 0.30,
    };
  }

  // Main lead scoring function
  scoreLead(lead, interactions = [], historicalData = []) {
    const behavioralScore = this.calculateBehavioralScore(lead, interactions);
    const demographicScore = this.calculateDemographicScore(lead);
    const firmographicScore = this.calculateFirmographicScore(lead);
    const engagementScore = this.calculateEngagementScore(interactions);
    const intentScore = this.calculateBuyingIntentScore(lead, interactions);
    const fitScore = this.calculateIdealCustomerFitScore(lead, historicalData);
    
    // Weighted composite score
    const compositeScore = (
      behavioralScore * 0.25 +
      demographicScore * 0.15 +
      firmographicScore * 0.20 +
      engagementScore * 0.20 +
      intentScore * 0.15 +
      fitScore * 0.05
    );

    const normalizedScore = Math.min(100, Math.max(0, compositeScore));
    
    return {
      totalScore: Math.round(normalizedScore),
      grade: this.getLeadGrade(normalizedScore),
      priority: this.getLeadPriority(normalizedScore),
      breakdown: {
        behavioral: Math.round(behavioralScore),
        demographic: Math.round(demographicScore),
        firmographic: Math.round(firmographicScore),
        engagement: Math.round(engagementScore),
        intent: Math.round(intentScore),
        fit: Math.round(fitScore),
      },
      recommendations: this.generateScoringRecommendations(normalizedScore, {
        behavioral: behavioralScore,
        demographic: demographicScore,
        firmographic: firmographicScore,
        engagement: engagementScore,
        intent: intentScore,
        fit: fitScore,
      }),
      nextBestActions: this.suggestNextBestActions(lead, normalizedScore, interactions),
    };
  }

  // Behavioral scoring based on lead activities
  calculateBehavioralScore(lead, interactions) {
    let score = 0;
    const activities = interactions.filter(i => i.leadId === lead.id);
    
    // Email engagement
    const emailActivities = activities.filter(a => a.type === 'email');
    const emailEngagementRate = this.calculateEmailEngagementRate(emailActivities);
    score += emailEngagementRate * this.behavioralWeights.emailEngagement * 100;
    
    // Website activity
    const websiteActivities = activities.filter(a => a.type === 'website');
    const websiteScore = this.calculateWebsiteActivityScore(websiteActivities);
    score += websiteScore * this.behavioralWeights.websiteActivity;
    
    // Social media engagement
    const socialActivities = activities.filter(a => a.type === 'social');
    const socialScore = Math.min(50, socialActivities.length * 5);
    score += socialScore * this.behavioralWeights.socialMedia;
    
    // Content downloads
    const contentDownloads = activities.filter(a => a.type === 'download');
    const contentScore = Math.min(80, contentDownloads.length * 10);
    score += contentScore * this.behavioralWeights.contentDownloads;
    
    // Event attendance
    const eventActivities = activities.filter(a => a.type === 'event');
    const eventScore = Math.min(60, eventActivities.length * 15);
    score += eventScore * this.behavioralWeights.eventAttendance;
    
    // Demo requests
    const demoRequests = activities.filter(a => a.type === 'demo');
    const demoScore = Math.min(100, demoRequests.length * 25);
    score += demoScore * this.behavioralWeights.demoRequests;
    
    return Math.min(100, score);
  }

  // Demographic scoring
  calculateDemographicScore(lead) {
    let score = 0;
    
    // Company size scoring
    const companySizeScore = this.getCompanySizeScore(lead.companySize);
    score += companySizeScore * this.demographicWeights.companySize;
    
    // Industry scoring
    const industryScore = this.getIndustryScore(lead.industry);
    score += industryScore * this.demographicWeights.industry;
    
    // Job title scoring
    const jobTitleScore = this.getJobTitleScore(lead.jobTitle);
    score += jobTitleScore * this.demographicWeights.jobTitle;
    
    // Budget scoring
    const budgetScore = this.getBudgetScore(lead.budget);
    score += budgetScore * this.demographicWeights.budget;
    
    return Math.min(100, score);
  }

  // Firmographic scoring
  calculateFirmographicScore(lead) {
    let score = 0;
    
    // Company revenue
    const revenueScore = this.getRevenueScore(lead.companyRevenue);
    score += revenueScore * this.firmographicWeights.revenue;
    
    // Number of employees
    const employeeScore = this.getEmployeeScore(lead.companyEmployees);
    score += employeeScore * this.firmographicWeights.employees;
    
    // Geographic location
    const locationScore = this.getLocationScore(lead.location);
    score += locationScore * this.firmographicWeights.location;
    
    // Technology stack
    const technologyScore = this.getTechnologyScore(lead.technologyStack);
    score += technologyScore * this.firmographicWeights.technology;
    
    return Math.min(100, score);
  }

  // Engagement scoring based on interaction patterns
  calculateEngagementScore(interactions) {
    if (!interactions || interactions.length === 0) return 0;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Recent interactions (last 30 days)
    const recentInteractions = interactions.filter(i => 
      new Date(i.date) >= thirtyDaysAgo
    );
    
    // Frequency score
    const frequencyScore = Math.min(50, recentInteractions.length * 2);
    
    // Recency score
    const lastInteraction = Math.max(...interactions.map(i => new Date(i.date).getTime()));
    const daysSinceLastInteraction = (now.getTime() - lastInteraction) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 50 - daysSinceLastInteraction);
    
    // Diversity score (different types of interactions)
    const interactionTypes = new Set(interactions.map(i => i.type));
    const diversityScore = Math.min(30, interactionTypes.size * 5);
    
    // Quality score (high-value interactions)
    const highValueInteractions = interactions.filter(i => 
      ['demo', 'proposal', 'meeting', 'call'].includes(i.type)
    );
    const qualityScore = Math.min(40, highValueInteractions.length * 8);
    
    return frequencyScore + recencyScore + diversityScore + qualityScore;
  }

  // Buying intent scoring
  calculateBuyingIntentScore(lead, interactions) {
    let intentScore = 0;
    
    // High-intent keywords in communications
    const highIntentKeywords = [
      'budget', 'purchase', 'buy', 'implement', 'solution',
      'pricing', 'quote', 'proposal', 'contract', 'timeline'
    ];
    
    const communications = interactions.filter(i => 
      i.type === 'email' || i.type === 'call' || i.type === 'meeting'
    );
    
    communications.forEach(comm => {
      if (comm.content) {
        const keywordMatches = highIntentKeywords.filter(keyword =>
          comm.content.toLowerCase().includes(keyword)
        );
        intentScore += keywordMatches.length * 5;
      }
    });
    
    // Specific high-intent actions
    const demoRequests = interactions.filter(i => i.type === 'demo').length;
    const proposalRequests = interactions.filter(i => i.type === 'proposal').length;
    const pricingInquiries = interactions.filter(i => 
      i.type === 'inquiry' && i.subject?.toLowerCase().includes('pricing')
    ).length;
    
    intentScore += demoRequests * 20;
    intentScore += proposalRequests * 25;
    intentScore += pricingInquiries * 15;
    
    // Urgency indicators
    if (lead.timeline && lead.timeline.toLowerCase().includes('urgent')) {
      intentScore += 20;
    }
    
    if (lead.decisionTimeframe && lead.decisionTimeframe <= 30) {
      intentScore += 15;
    }
    
    return Math.min(100, intentScore);
  }

  // Ideal Customer Profile (ICP) fit scoring
  calculateIdealCustomerFitScore(lead, historicalData) {
    if (!historicalData || historicalData.length === 0) return 50; // Default score
    
    // Analyze successful customers to create ICP
    const successfulCustomers = historicalData.filter(c => c.status === 'won');
    if (successfulCustomers.length === 0) return 50;
    
    let fitScore = 0;
    let factors = 0;
    
    // Industry fit
    const industryMatches = successfulCustomers.filter(c => c.industry === lead.industry).length;
    const industryFit = industryMatches / successfulCustomers.length;
    fitScore += industryFit * 25;
    factors++;
    
    // Company size fit
    const sizeMatches = successfulCustomers.filter(c => 
      this.isSimilarCompanySize(c.companySize, lead.companySize)
    ).length;
    const sizeFit = sizeMatches / successfulCustomers.length;
    fitScore += sizeFit * 25;
    factors++;
    
    // Job title fit
    const titleMatches = successfulCustomers.filter(c => 
      this.isSimilarJobTitle(c.jobTitle, lead.jobTitle)
    ).length;
    const titleFit = titleMatches / successfulCustomers.length;
    fitScore += titleFit * 25;
    factors++;
    
    // Budget fit
    const budgetMatches = successfulCustomers.filter(c => 
      this.isSimilarBudget(c.budget, lead.budget)
    ).length;
    const budgetFit = budgetMatches / successfulCustomers.length;
    fitScore += budgetFit * 25;
    factors++;
    
    return factors > 0 ? fitScore : 50;
  }

  // Helper methods for scoring components
  getCompanySizeScore(size) {
    const sizeMap = {
      'startup': 20,
      'small': 40,
      'medium': 70,
      'large': 90,
      'enterprise': 100,
    };
    return sizeMap[size?.toLowerCase()] || 30;
  }

  getIndustryScore(industry) {
    // High-value industries for typical B2B SaaS
    const highValueIndustries = [
      'technology', 'finance', 'healthcare', 'manufacturing',
      'professional services', 'retail', 'education'
    ];
    
    return highValueIndustries.includes(industry?.toLowerCase()) ? 80 : 40;
  }

  getJobTitleScore(title) {
    if (!title) return 20;
    
    const titleLower = title.toLowerCase();
    
    // Decision makers
    if (titleLower.includes('ceo') || titleLower.includes('founder') || 
        titleLower.includes('president') || titleLower.includes('owner')) {
      return 100;
    }
    
    // C-level executives
    if (titleLower.includes('cto') || titleLower.includes('cfo') || 
        titleLower.includes('cmo') || titleLower.includes('coo')) {
      return 90;
    }
    
    // VPs and Directors
    if (titleLower.includes('vp') || titleLower.includes('vice president') ||
        titleLower.includes('director')) {
      return 80;
    }
    
    // Managers
    if (titleLower.includes('manager') || titleLower.includes('head of')) {
      return 60;
    }
    
    // Individual contributors
    return 30;
  }

  getBudgetScore(budget) {
    if (!budget) return 20;
    
    if (budget >= 100000) return 100;
    if (budget >= 50000) return 80;
    if (budget >= 25000) return 60;
    if (budget >= 10000) return 40;
    return 20;
  }

  getRevenueScore(revenue) {
    if (!revenue) return 30;
    
    if (revenue >= 100000000) return 100; // $100M+
    if (revenue >= 50000000) return 90;   // $50M+
    if (revenue >= 10000000) return 80;   // $10M+
    if (revenue >= 5000000) return 70;    // $5M+
    if (revenue >= 1000000) return 60;    // $1M+
    return 40;
  }

  getEmployeeScore(employees) {
    if (!employees) return 30;
    
    if (employees >= 1000) return 100;
    if (employees >= 500) return 90;
    if (employees >= 100) return 80;
    if (employees >= 50) return 70;
    if (employees >= 10) return 60;
    return 40;
  }

  getLocationScore(location) {
    // High-value markets
    const highValueLocations = [
      'united states', 'canada', 'united kingdom', 'germany',
      'france', 'australia', 'japan', 'singapore'
    ];
    
    return highValueLocations.some(loc => 
      location?.toLowerCase().includes(loc)
    ) ? 80 : 50;
  }

  getTechnologyScore(techStack) {
    if (!techStack || !Array.isArray(techStack)) return 40;
    
    // Technologies that indicate good fit
    const goodFitTech = [
      'salesforce', 'hubspot', 'marketo', 'pardot',
      'aws', 'azure', 'google cloud', 'slack', 'microsoft teams'
    ];
    
    const matches = techStack.filter(tech =>
      goodFitTech.some(goodTech => 
        tech.toLowerCase().includes(goodTech)
      )
    );
    
    return Math.min(100, 40 + matches.length * 10);
  }

  calculateEmailEngagementRate(emailActivities) {
    if (emailActivities.length === 0) return 0;
    
    const opens = emailActivities.filter(a => a.action === 'open').length;
    const clicks = emailActivities.filter(a => a.action === 'click').length;
    const replies = emailActivities.filter(a => a.action === 'reply').length;
    
    const totalEmails = emailActivities.filter(a => a.action === 'sent').length || 1;
    
    const openRate = opens / totalEmails;
    const clickRate = clicks / totalEmails;
    const replyRate = replies / totalEmails;
    
    return (openRate * 0.3 + clickRate * 0.4 + replyRate * 0.3);
  }

  calculateWebsiteActivityScore(websiteActivities) {
    if (websiteActivities.length === 0) return 0;
    
    let score = 0;
    
    // Page views
    const pageViews = websiteActivities.filter(a => a.action === 'page_view').length;
    score += Math.min(30, pageViews * 2);
    
    // Time on site
    const avgTimeOnSite = websiteActivities.reduce((sum, a) => 
      sum + (a.timeOnSite || 0), 0) / websiteActivities.length;
    score += Math.min(25, avgTimeOnSite / 60 * 5); // 5 points per minute
    
    // High-value pages
    const highValuePages = ['pricing', 'demo', 'contact', 'features'];
    const highValueViews = websiteActivities.filter(a =>
      highValuePages.some(page => a.page?.toLowerCase().includes(page))
    ).length;
    score += highValueViews * 8;
    
    return Math.min(100, score);
  }

  getLeadGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }

  getLeadPriority(score) {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    if (score >= 40) return 'cold';
    return 'unqualified';
  }

  generateScoringRecommendations(totalScore, breakdown) {
    const recommendations = [];
    
    if (totalScore >= 80) {
      recommendations.push({
        type: 'action',
        priority: 'high',
        message: 'High-quality lead! Schedule a demo or call immediately.',
        action: 'schedule_demo',
      });
    } else if (totalScore >= 60) {
      recommendations.push({
        type: 'nurture',
        priority: 'medium',
        message: 'Good potential. Continue nurturing with targeted content.',
        action: 'send_content',
      });
    } else if (totalScore >= 40) {
      recommendations.push({
        type: 'qualify',
        priority: 'low',
        message: 'Needs more qualification. Gather additional information.',
        action: 'qualify_lead',
      });
    } else {
      recommendations.push({
        type: 'disqualify',
        priority: 'low',
        message: 'Consider disqualifying or moving to long-term nurture.',
        action: 'disqualify',
      });
    }
    
    // Specific recommendations based on breakdown
    if (breakdown.engagement < 30) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Low engagement. Try different communication channels.',
        action: 'vary_outreach',
      });
    }
    
    if (breakdown.intent < 20) {
      recommendations.push({
        type: 'intent',
        priority: 'medium',
        message: 'Low buying intent. Focus on education and value proposition.',
        action: 'educate',
      });
    }
    
    return recommendations;
  }

  suggestNextBestActions(lead, score, interactions) {
    const actions = [];
    
    if (score >= 80) {
      actions.push(
        { action: 'schedule_demo', priority: 1, reason: 'High-quality lead ready for demo' },
        { action: 'send_proposal', priority: 2, reason: 'Prepare proposal for qualified lead' },
        { action: 'connect_sales', priority: 3, reason: 'Connect with senior sales rep' }
      );
    } else if (score >= 60) {
      actions.push(
        { action: 'schedule_call', priority: 1, reason: 'Good lead needs qualification call' },
        { action: 'send_case_study', priority: 2, reason: 'Share relevant success stories' },
        { action: 'invite_webinar', priority: 3, reason: 'Invite to educational webinar' }
      );
    } else if (score >= 40) {
      actions.push(
        { action: 'send_content', priority: 1, reason: 'Nurture with educational content' },
        { action: 'social_connect', priority: 2, reason: 'Connect on social media' },
        { action: 'survey', priority: 3, reason: 'Send qualification survey' }
      );
    } else {
      actions.push(
        { action: 'email_sequence', priority: 1, reason: 'Add to nurture email sequence' },
        { action: 'retarget_ads', priority: 2, reason: 'Add to retargeting campaign' },
        { action: 'long_term_nurture', priority: 3, reason: 'Move to long-term nurture' }
      );
    }
    
    return actions;
  }

  // Similarity helper methods
  isSimilarCompanySize(size1, size2) {
    const sizeOrder = ['startup', 'small', 'medium', 'large', 'enterprise'];
    const index1 = sizeOrder.indexOf(size1?.toLowerCase());
    const index2 = sizeOrder.indexOf(size2?.toLowerCase());
    
    return Math.abs(index1 - index2) <= 1;
  }

  isSimilarJobTitle(title1, title2) {
    if (!title1 || !title2) return false;
    
    const level1 = this.getJobLevel(title1);
    const level2 = this.getJobLevel(title2);
    
    return level1 === level2;
  }

  getJobLevel(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('ceo') || titleLower.includes('founder') || 
        titleLower.includes('president')) return 'executive';
    if (titleLower.includes('cto') || titleLower.includes('cfo') || 
        titleLower.includes('cmo')) return 'c-level';
    if (titleLower.includes('vp') || titleLower.includes('director')) return 'senior';
    if (titleLower.includes('manager')) return 'manager';
    return 'individual';
  }

  isSimilarBudget(budget1, budget2) {
    if (!budget1 || !budget2) return false;
    
    const ratio = Math.max(budget1, budget2) / Math.min(budget1, budget2);
    return ratio <= 2; // Within 2x of each other
  }
}

// Singleton scoring engine
const scoringEngine = new LeadScoringEngine();

export const useLeadScoring = (options = {}) => {
  const {
    autoScore = true,
    enableBatchScoring = true,
    enableRealTimeScoring = true,
    scoringThreshold = 60,
    refreshInterval = 300000, // 5 minutes
  } = options;

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addNotification } = useNotifications();

  // Score individual lead
  const scoreLead = useCallback(async (leadId) => {
    try {
      const leads = await queryClient.getQueryData(['leads']) || [];
      const interactions = await queryClient.getQueryData(['activities']) || [];
      const historicalData = await queryClient.getQueryData(['analytics', 'conversions']) || [];
      
      const lead = leads.find(l => l.id === leadId);
      if (!lead) throw new Error('Lead not found');
      
      const leadInteractions = interactions.filter(i => i.leadId === leadId);
      const scoring = scoringEngine.scoreLead(lead, leadInteractions, historicalData);
      
      // Cache the scoring result
      queryClient.setQueryData(['lead-scoring', leadId], scoring);
      
      return scoring;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Scoring Error',
        message: `Failed to score lead: ${error.message}`,
      });
      throw error;
    }
  }, [queryClient, addNotification]);

  // Batch score all leads
  const {
    data: leadScores,
    isLoading: scoresLoading,
    refetch: refetchScores,
  } = useOptimizedQuery({
    queryKey: ['lead-scoring', 'batch', user?.id],
    queryFn: async () => {
      const leads = await queryClient.getQueryData(['leads']) || [];
      const interactions = await queryClient.getQueryData(['activities']) || [];
      const historicalData = await queryClient.getQueryData(['analytics', 'conversions']) || [];
      
      const scores = leads.map(lead => {
        const leadInteractions = interactions.filter(i => i.leadId === lead.id);
        const scoring = scoringEngine.scoreLead(lead, leadInteractions, historicalData);
        
        return {
          leadId: lead.id,
          leadName: lead.name,
          leadEmail: lead.email,
          ...scoring,
        };
      });
      
      return scores.sort((a, b) => b.totalScore - a.totalScore);
    },
    enabled: enableBatchScoring,
    staleTime: refreshInterval,
    enableIntelligentCaching: true,
  });

  // Get high-scoring leads
  const getHighScoringLeads = useCallback((threshold = scoringThreshold) => {
    if (!leadScores) return [];
    
    return leadScores
      .filter(score => score.totalScore >= threshold)
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [leadScores, scoringThreshold]);

  // Get leads by grade
  const getLeadsByGrade = useCallback((grade) => {
    if (!leadScores) return [];
    
    return leadScores.filter(score => score.grade === grade);
  }, [leadScores]);

  // Get leads by priority
  const getLeadsByPriority = useCallback((priority) => {
    if (!leadScores) return [];
    
    return leadScores.filter(score => score.priority === priority);
  }, [leadScores]);

  // Scoring analytics
  const scoringAnalytics = useMemo(() => {
    if (!leadScores) return null;
    
    const totalLeads = leadScores.length;
    const avgScore = leadScores.reduce((sum, score) => sum + score.totalScore, 0) / totalLeads;
    
    const gradeDistribution = leadScores.reduce((dist, score) => {
      dist[score.grade] = (dist[score.grade] || 0) + 1;
      return dist;
    }, {});
    
    const priorityDistribution = leadScores.reduce((dist, score) => {
      dist[score.priority] = (dist[score.priority] || 0) + 1;
      return dist;
    }, {});
    
    const scoreRanges = {
      'A+ (90-100)': leadScores.filter(s => s.totalScore >= 90).length,
      'A (80-89)': leadScores.filter(s => s.totalScore >= 80 && s.totalScore < 90).length,
      'B (60-79)': leadScores.filter(s => s.totalScore >= 60 && s.totalScore < 80).length,
      'C (40-59)': leadScores.filter(s => s.totalScore >= 40 && s.totalScore < 60).length,
      'D (0-39)': leadScores.filter(s => s.totalScore < 40).length,
    };
    
    return {
      totalLeads,
      avgScore: Math.round(avgScore),
      gradeDistribution,
      priorityDistribution,
      scoreRanges,
      highQualityLeads: leadScores.filter(s => s.totalScore >= 80).length,
      qualifiedLeads: leadScores.filter(s => s.totalScore >= 60).length,
    };
  }, [leadScores]);

  // Update lead score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async ({ leadId, manualAdjustment, reason }) => {
      const currentScore = await scoreLead(leadId);
      const adjustedScore = {
        ...currentScore,
        totalScore: Math.min(100, Math.max(0, currentScore.totalScore + manualAdjustment)),
        manualAdjustment,
        adjustmentReason: reason,
        adjustedAt: new Date().toISOString(),
        adjustedBy: user?.id,
      };
      
      queryClient.setQueryData(['lead-scoring', leadId], adjustedScore);
      return adjustedScore;
    },
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        title: 'Score Updated',
        message: `Lead score updated to ${data.totalScore}`,
      });
      queryClient.invalidateQueries(['lead-scoring', 'batch']);
    },
  });

  // Bulk score update
  const bulkUpdateScores = useCallback(async (leadIds) => {
    try {
      const results = await Promise.all(
        leadIds.map(leadId => scoreLead(leadId))
      );
      
      addNotification({
        type: 'success',
        title: 'Bulk Scoring Complete',
        message: `Updated scores for ${results.length} leads`,
      });
      
      queryClient.invalidateQueries(['lead-scoring', 'batch']);
      return results;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Bulk Scoring Failed',
        message: error.message,
      });
      throw error;
    }
  }, [scoreLead, addNotification, queryClient]);

  return {
    // Data
    leadScores,
    scoringAnalytics,
    
    // Loading states
    isLoading: scoresLoading,
    
    // Methods
    scoreLead,
    getHighScoringLeads,
    getLeadsByGrade,
    getLeadsByPriority,
    bulkUpdateScores,
    
    // Mutations
    updateScore: updateScoreMutation.mutate,
    isUpdatingScore: updateScoreMutation.isPending,
    
    // Refresh
    refetchScores,
    
    // Configuration
    enabled: {
      autoScore,
      batchScoring: enableBatchScoring,
      realTimeScoring: enableRealTimeScoring,
    },
    
    // Settings
    scoringThreshold,
    
    // Engine access (for advanced usage)
    scoringEngine,
  };
};

export default useLeadScoring;