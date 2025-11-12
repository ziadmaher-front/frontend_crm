// Advanced Customer Journey Intelligence
// AI-powered customer journey analysis, behavioral insights, and personalization engine

import { format, differenceInDays, differenceInHours, addDays, subDays } from 'date-fns';

class CustomerJourneyIntelligence {
  constructor() {
    this.journeyStages = [
      'awareness',
      'interest',
      'consideration',
      'intent',
      'evaluation',
      'purchase',
      'onboarding',
      'adoption',
      'expansion',
      'advocacy',
      'renewal',
      'churn_risk'
    ];

    this.touchpointTypes = [
      'website_visit',
      'email_open',
      'email_click',
      'content_download',
      'demo_request',
      'trial_signup',
      'sales_call',
      'proposal_sent',
      'contract_signed',
      'support_ticket',
      'feature_usage',
      'billing_event',
      'renewal_discussion'
    ];

    this.behavioralPatterns = new Map();
    this.personalizationRules = new Map();
    this.predictiveModels = new Map();
    
    // Journey scoring weights
    this.scoringWeights = {
      recency: 0.3,
      frequency: 0.25,
      engagement: 0.2,
      progression: 0.15,
      value: 0.1
    };

    // Personalization segments
    this.segments = {
      'high_value_prospect': {
        criteria: { deal_value: { min: 50000 }, engagement_score: { min: 0.7 } },
        strategy: 'premium_experience'
      },
      'technical_evaluator': {
        criteria: { demo_requests: { min: 2 }, technical_content: { min: 3 } },
        strategy: 'technical_focus'
      },
      'budget_conscious': {
        criteria: { pricing_page_visits: { min: 5 }, discount_inquiries: { min: 1 } },
        strategy: 'value_proposition'
      },
      'decision_maker': {
        criteria: { executive_content: { min: 2 }, business_case_downloads: { min: 1 } },
        strategy: 'executive_engagement'
      }
    };
  }

  // Comprehensive Journey Analysis
  async analyzeCustomerJourney(customer, touchpoints, deals, interactions) {
    try {
      // Preprocess and enrich data
      const enrichedData = this.enrichJourneyData(customer, touchpoints, deals, interactions);
      
      // Identify current journey stage
      const currentStage = this.identifyJourneyStage(enrichedData);
      
      // Calculate journey metrics
      const journeyMetrics = this.calculateJourneyMetrics(enrichedData);
      
      // Analyze behavioral patterns
      const behavioralInsights = this.analyzeBehavioralPatterns(enrichedData);
      
      // Predict next actions and timeline
      const predictions = await this.predictNextActions(enrichedData, currentStage);
      
      // Generate personalization recommendations
      const personalization = this.generatePersonalizationStrategy(enrichedData, behavioralInsights);
      
      // Identify optimization opportunities
      const optimizations = this.identifyJourneyOptimizations(enrichedData, currentStage);
      
      // Calculate journey health score
      const healthScore = this.calculateJourneyHealthScore(enrichedData, journeyMetrics);
      
      return {
        success: true,
        data: {
          customer: enrichedData.customer,
          currentStage,
          journeyMetrics,
          behavioralInsights,
          predictions,
          personalization,
          optimizations,
          healthScore,
          timeline: this.generateJourneyTimeline(enrichedData),
          riskFactors: this.identifyRiskFactors(enrichedData),
          nextBestActions: this.recommendNextBestActions(enrichedData, currentStage)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Multi-Customer Journey Analytics
  async analyzeCohortJourneys(customers, touchpoints, deals, interactions, cohortCriteria = {}) {
    try {
      const {
        segmentBy = 'acquisition_date',
        timeframe = 90,
        includeChurnPrediction = true,
        includeValuePrediction = true
      } = cohortCriteria;

      // Group customers into cohorts
      const cohorts = this.createCohorts(customers, segmentBy, timeframe);
      
      // Analyze each cohort
      const cohortAnalyses = await Promise.all(
        cohorts.map(async (cohort) => {
          const cohortTouchpoints = touchpoints.filter(t => 
            cohort.customers.some(c => c.id === t.customer_id)
          );
          const cohortDeals = deals.filter(d => 
            cohort.customers.some(c => c.id === d.account_id)
          );
          const cohortInteractions = interactions.filter(i => 
            cohort.customers.some(c => c.id === i.account_id)
          );

          return this.analyzeCohortJourney(cohort, cohortTouchpoints, cohortDeals, cohortInteractions);
        })
      );

      // Generate comparative insights
      const comparativeInsights = this.generateComparativeInsights(cohortAnalyses);
      
      // Identify best practices
      const bestPractices = this.identifyBestPractices(cohortAnalyses);
      
      return {
        success: true,
        data: {
          cohorts: cohortAnalyses,
          comparativeInsights,
          bestPractices,
          recommendations: this.generateCohortRecommendations(cohortAnalyses)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Real-time Journey Monitoring
  async monitorJourneyInRealTime(customerId, recentTouchpoints, threshold = 24) {
    try {
      // Get recent activity within threshold hours
      const cutoffTime = new Date(Date.now() - threshold * 60 * 60 * 1000);
      const recentActivity = recentTouchpoints.filter(t => 
        new Date(t.timestamp) > cutoffTime && t.customer_id === customerId
      );

      if (recentActivity.length === 0) {
        return { success: true, data: { alerts: [], recommendations: [] } };
      }

      // Analyze activity patterns
      const activityAnalysis = this.analyzeRecentActivity(recentActivity);
      
      // Generate real-time alerts
      const alerts = this.generateRealTimeAlerts(activityAnalysis);
      
      // Generate immediate action recommendations
      const recommendations = this.generateImmediateRecommendations(activityAnalysis);
      
      // Calculate urgency score
      const urgencyScore = this.calculateUrgencyScore(activityAnalysis);
      
      return {
        success: true,
        data: {
          customerId,
          recentActivity: activityAnalysis,
          alerts,
          recommendations,
          urgencyScore,
          suggestedActions: this.suggestImmediateActions(activityAnalysis, urgencyScore)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Journey Stage Identification
  identifyJourneyStage(enrichedData) {
    const { touchpoints, deals, interactions, customer } = enrichedData;
    
    // Stage identification logic based on touchpoints and behaviors
    const stageScores = {};
    
    // Initialize all stages with base scores
    this.journeyStages.forEach(stage => {
      stageScores[stage] = 0;
    });

    // Analyze touchpoints for stage indicators
    touchpoints.forEach(touchpoint => {
      switch (touchpoint.type) {
        case 'website_visit':
          stageScores.awareness += 1;
          break;
        case 'content_download':
          stageScores.interest += 2;
          break;
        case 'demo_request':
          stageScores.consideration += 3;
          break;
        case 'trial_signup':
          stageScores.intent += 4;
          break;
        case 'proposal_sent':
          stageScores.evaluation += 3;
          break;
        case 'contract_signed':
          stageScores.purchase += 5;
          break;
        case 'feature_usage':
          stageScores.adoption += 2;
          break;
        case 'support_ticket':
          stageScores.onboarding += 1;
          break;
      }
    });

    // Analyze deals for stage context
    deals.forEach(deal => {
      if (deal.stage === 'closed-won') {
        stageScores.purchase += 5;
        stageScores.onboarding += 3;
      } else if (deal.stage === 'proposal') {
        stageScores.evaluation += 4;
      } else if (deal.stage === 'negotiation') {
        stageScores.intent += 3;
      }
    });

    // Find the stage with highest score
    const topStage = Object.entries(stageScores)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      current: topStage[0],
      confidence: Math.min(topStage[1] / 10, 1),
      allScores: stageScores,
      progression: this.calculateStageProgression(stageScores)
    };
  }

  // Journey Metrics Calculation
  calculateJourneyMetrics(enrichedData) {
    const { touchpoints, deals, interactions, customer } = enrichedData;
    
    const metrics = {
      totalTouchpoints: touchpoints.length,
      uniqueChannels: new Set(touchpoints.map(t => t.channel)).size,
      journeyDuration: this.calculateJourneyDuration(touchpoints),
      engagementScore: this.calculateEngagementScore(touchpoints, interactions),
      velocityScore: this.calculateVelocityScore(touchpoints, deals),
      conversionProbability: this.calculateConversionProbability(enrichedData),
      timeToConversion: this.estimateTimeToConversion(enrichedData),
      dropoffRisk: this.calculateDropoffRisk(enrichedData)
    };

    return metrics;
  }

  // Behavioral Pattern Analysis
  analyzeBehavioralPatterns(enrichedData) {
    const { touchpoints, interactions } = enrichedData;
    
    const patterns = {
      preferredChannels: this.identifyPreferredChannels(touchpoints),
      contentPreferences: this.identifyContentPreferences(touchpoints),
      engagementTiming: this.analyzeEngagementTiming(touchpoints),
      interactionPatterns: this.analyzeInteractionPatterns(interactions),
      decisionMakingStyle: this.identifyDecisionMakingStyle(enrichedData),
      riskTolerance: this.assessRiskTolerance(enrichedData),
      buyingSignals: this.identifyBuyingSignals(enrichedData)
    };

    return patterns;
  }

  // Predictive Analytics
  async predictNextActions(enrichedData, currentStage) {
    const predictions = {
      nextLikelyActions: this.predictNextLikelyActions(enrichedData, currentStage),
      timeToNextAction: this.predictTimeToNextAction(enrichedData),
      conversionProbability: this.predictConversionProbability(enrichedData),
      churnRisk: this.predictChurnRisk(enrichedData),
      valueProjection: this.predictCustomerValue(enrichedData),
      optimalTiming: this.predictOptimalTiming(enrichedData)
    };

    return predictions;
  }

  // Personalization Strategy Generation
  generatePersonalizationStrategy(enrichedData, behavioralInsights) {
    const { customer } = enrichedData;
    
    // Identify customer segment
    const segment = this.identifyCustomerSegment(enrichedData, behavioralInsights);
    
    // Generate personalized recommendations
    const strategy = {
      segment,
      contentRecommendations: this.generateContentRecommendations(segment, behavioralInsights),
      channelPreferences: this.generateChannelStrategy(behavioralInsights),
      messagingStrategy: this.generateMessagingStrategy(segment, behavioralInsights),
      timingOptimization: this.generateTimingStrategy(behavioralInsights),
      experienceCustomization: this.generateExperienceCustomization(segment)
    };

    return strategy;
  }

  // Helper Methods
  enrichJourneyData(customer, touchpoints, deals, interactions) {
    return {
      customer: {
        ...customer,
        firstTouchpoint: touchpoints.length > 0 ? 
          touchpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0] : null,
        lastTouchpoint: touchpoints.length > 0 ? 
          touchpoints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] : null
      },
      touchpoints: touchpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
      deals: deals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      interactions: interactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    };
  }

  calculateJourneyDuration(touchpoints) {
    if (touchpoints.length < 2) return 0;
    
    const first = new Date(touchpoints[0].timestamp);
    const last = new Date(touchpoints[touchpoints.length - 1].timestamp);
    
    return differenceInDays(last, first);
  }

  calculateEngagementScore(touchpoints, interactions) {
    let score = 0;
    
    // Weight different touchpoint types
    touchpoints.forEach(tp => {
      switch (tp.type) {
        case 'website_visit': score += 1; break;
        case 'email_open': score += 2; break;
        case 'email_click': score += 3; break;
        case 'content_download': score += 5; break;
        case 'demo_request': score += 8; break;
        case 'trial_signup': score += 10; break;
        default: score += 1;
      }
    });

    // Add interaction engagement
    interactions.forEach(interaction => {
      score += interaction.duration ? Math.min(interaction.duration / 60, 10) : 2;
    });

    return Math.min(score / 100, 1); // Normalize to 0-1
  }

  calculateVelocityScore(touchpoints, deals) {
    if (touchpoints.length < 2) return 0;
    
    const duration = this.calculateJourneyDuration(touchpoints);
    const touchpointFrequency = touchpoints.length / Math.max(duration, 1);
    
    // Higher frequency = higher velocity
    return Math.min(touchpointFrequency / 2, 1);
  }

  identifyPreferredChannels(touchpoints) {
    const channelCounts = {};
    touchpoints.forEach(tp => {
      channelCounts[tp.channel] = (channelCounts[tp.channel] || 0) + 1;
    });

    return Object.entries(channelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([channel, count]) => ({ channel, count, percentage: count / touchpoints.length }));
  }

  identifyContentPreferences(touchpoints) {
    const contentTypes = {};
    touchpoints.forEach(tp => {
      if (tp.content_type) {
        contentTypes[tp.content_type] = (contentTypes[tp.content_type] || 0) + 1;
      }
    });

    return Object.entries(contentTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  analyzeEngagementTiming(touchpoints) {
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);

    touchpoints.forEach(tp => {
      const date = new Date(tp.timestamp);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    });

    return {
      preferredHours: hourCounts.map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count).slice(0, 3),
      preferredDays: dayCounts.map((count, day) => ({ day, count }))
        .sort((a, b) => b.count - a.count).slice(0, 3)
    };
  }

  predictNextLikelyActions(enrichedData, currentStage) {
    const stageTransitions = {
      awareness: ['interest', 'consideration'],
      interest: ['consideration', 'intent'],
      consideration: ['intent', 'evaluation'],
      intent: ['evaluation', 'purchase'],
      evaluation: ['purchase', 'consideration'],
      purchase: ['onboarding', 'adoption'],
      onboarding: ['adoption', 'expansion'],
      adoption: ['expansion', 'advocacy'],
      expansion: ['advocacy', 'renewal'],
      advocacy: ['renewal', 'expansion'],
      renewal: ['expansion', 'advocacy']
    };

    const possibleNext = stageTransitions[currentStage.current] || [];
    
    return possibleNext.map(stage => ({
      stage,
      probability: Math.random() * 0.5 + 0.3, // Simulate probability
      timeframe: Math.floor(Math.random() * 30) + 7 // 7-37 days
    }));
  }

  calculateConversionProbability(enrichedData) {
    const { touchpoints, deals, customer } = enrichedData;
    
    let probability = 0.1; // Base probability
    
    // Increase based on engagement
    probability += Math.min(touchpoints.length * 0.02, 0.3);
    
    // Increase based on deal stage
    deals.forEach(deal => {
      switch (deal.stage) {
        case 'proposal': probability += 0.2; break;
        case 'negotiation': probability += 0.3; break;
        case 'closed-won': probability = 1.0; break;
      }
    });

    // Increase based on high-value touchpoints
    const highValueTouchpoints = touchpoints.filter(tp => 
      ['demo_request', 'trial_signup', 'proposal_sent'].includes(tp.type)
    );
    probability += highValueTouchpoints.length * 0.1;

    return Math.min(probability, 1.0);
  }

  identifyCustomerSegment(enrichedData, behavioralInsights) {
    const { customer, deals } = enrichedData;
    
    // Calculate segment scores
    const segmentScores = {};
    
    Object.entries(this.segments).forEach(([segmentName, segmentConfig]) => {
      let score = 0;
      const criteria = segmentConfig.criteria;
      
      // Check deal value criteria
      if (criteria.deal_value) {
        const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        if (totalValue >= (criteria.deal_value.min || 0)) {
          score += 1;
        }
      }
      
      // Check engagement criteria
      if (criteria.engagement_score) {
        const engagementScore = behavioralInsights.engagementScore || 0;
        if (engagementScore >= (criteria.engagement_score.min || 0)) {
          score += 1;
        }
      }
      
      segmentScores[segmentName] = score;
    });
    
    // Find best matching segment
    const bestSegment = Object.entries(segmentScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      name: bestSegment[0],
      score: bestSegment[1],
      strategy: this.segments[bestSegment[0]].strategy
    };
  }

  generateContentRecommendations(segment, behavioralInsights) {
    const recommendations = [];
    
    switch (segment.strategy) {
      case 'premium_experience':
        recommendations.push(
          { type: 'executive_brief', priority: 'high' },
          { type: 'custom_demo', priority: 'high' },
          { type: 'roi_calculator', priority: 'medium' }
        );
        break;
      case 'technical_focus':
        recommendations.push(
          { type: 'technical_documentation', priority: 'high' },
          { type: 'api_guide', priority: 'high' },
          { type: 'integration_examples', priority: 'medium' }
        );
        break;
      case 'value_proposition':
        recommendations.push(
          { type: 'pricing_guide', priority: 'high' },
          { type: 'cost_comparison', priority: 'high' },
          { type: 'value_case_study', priority: 'medium' }
        );
        break;
      default:
        recommendations.push(
          { type: 'product_overview', priority: 'medium' },
          { type: 'customer_testimonial', priority: 'medium' }
        );
    }
    
    return recommendations;
  }

  generateNextBestActions(enrichedData, currentStage) {
    const actions = [];
    
    switch (currentStage.current) {
      case 'awareness':
        actions.push(
          { action: 'Send educational content', priority: 'high', timeline: '1-2 days' },
          { action: 'Schedule discovery call', priority: 'medium', timeline: '3-5 days' }
        );
        break;
      case 'consideration':
        actions.push(
          { action: 'Offer product demo', priority: 'high', timeline: '1-3 days' },
          { action: 'Share case studies', priority: 'medium', timeline: '2-4 days' }
        );
        break;
      case 'evaluation':
        actions.push(
          { action: 'Send proposal', priority: 'high', timeline: '1-2 days' },
          { action: 'Schedule stakeholder meeting', priority: 'high', timeline: '3-7 days' }
        );
        break;
      default:
        actions.push(
          { action: 'Follow up with personalized message', priority: 'medium', timeline: '2-3 days' }
        );
    }
    
    return actions;
  }
}

// Export singleton instance
export const customerJourneyIntelligence = new CustomerJourneyIntelligence();
export default customerJourneyIntelligence;