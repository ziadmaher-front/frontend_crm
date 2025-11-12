// AI-Powered Features for Sales Pro CRM
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateMockData } from '../data/mockData';

// AI Lead Scoring Algorithm
export const useAILeadScoring = () => {
  const [scoringModel, setScoringModel] = useState({
    companySize: { weight: 0.25, thresholds: { '1000+': 100, '201-1000': 80, '51-200': 60, '11-50': 40, '1-10': 20 } },
    revenue: { weight: 0.3, thresholds: { high: 100, medium: 70, low: 40 } },
    industry: { weight: 0.2, preferred: ['Technology', 'Finance', 'Healthcare'] },
    source: { weight: 0.15, quality: { 'Referral': 100, 'Partner': 90, 'Website': 70, 'Social Media': 50 } },
    engagement: { weight: 0.1, activities: ['Email Open', 'Website Visit', 'Content Download'] }
  });

  const calculateLeadScore = useCallback((lead) => {
    let totalScore = 0;

    // Company size scoring
    const sizeScore = scoringModel.companySize.thresholds[lead.employees] || 20;
    totalScore += (sizeScore * scoringModel.companySize.weight);

    // Revenue scoring
    let revenueScore = 40; // default
    if (lead.revenue > 5000000) revenueScore = 100;
    else if (lead.revenue > 1000000) revenueScore = 70;
    else if (lead.revenue > 500000) revenueScore = 50;
    totalScore += (revenueScore * scoringModel.revenue.weight);

    // Industry scoring
    const industryScore = scoringModel.industry.preferred.includes(lead.industry) ? 100 : 50;
    totalScore += (industryScore * scoringModel.industry.weight);

    // Source scoring
    const sourceScore = scoringModel.source.quality[lead.source] || 30;
    totalScore += (sourceScore * scoringModel.source.weight);

    // Engagement scoring (simulated)
    const engagementScore = Math.random() * 100; // In real app, this would be based on actual engagement data
    totalScore += (engagementScore * scoringModel.engagement.weight);

    return Math.min(Math.round(totalScore), 100);
  }, [scoringModel]);

  const scoreLeads = useMutation({
    mutationFn: async (leads) => {
      return leads.map(lead => ({
        ...lead,
        aiScore: calculateLeadScore(lead),
        scoringFactors: {
          companySize: scoringModel.companySize.thresholds[lead.employees] || 20,
          revenue: lead.revenue > 5000000 ? 100 : lead.revenue > 1000000 ? 70 : 50,
          industry: scoringModel.industry.preferred.includes(lead.industry) ? 100 : 50,
          source: scoringModel.source.quality[lead.source] || 30
        }
      }));
    }
  });

  return {
    scoringModel,
    setScoringModel,
    calculateLeadScore,
    scoreLeads
  };
};

// AI Deal Insights and Risk Analysis
export const useAIDealInsights = () => {
  const analyzeDeals = useMutation({
    mutationFn: async (deals) => {
      return deals.map(deal => {
        const insights = [];
        const risks = [];
        let riskScore = 0;

        // Time in stage analysis
        const daysInStage = Math.floor((new Date() - new Date(deal.updatedAt)) / (1000 * 60 * 60 * 24));
        if (daysInStage > 30) {
          riskScore += 25;
          risks.push('Deal stagnant in current stage');
          insights.push(`Deal has been in ${deal.stage} for ${daysInStage} days`);
        }

        // Close date analysis
        const daysToClose = Math.floor((new Date(deal.expectedCloseDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysToClose < 0) {
          riskScore += 35;
          risks.push('Past expected close date');
        } else if (daysToClose < 7) {
          insights.push('Deal closing soon - ensure all requirements met');
        }

        // Deal size vs probability mismatch
        if (deal.amount > 100000 && deal.probability < 50) {
          riskScore += 20;
          risks.push('High-value deal with low probability');
        }

        // Stage vs probability alignment
        const stageExpectedProbability = {
          'Prospecting': 15, 'Qualification': 30, 'Needs Analysis': 45,
          'Proposal': 65, 'Negotiation': 85, 'Closed Won': 100, 'Closed Lost': 0
        };
        const expectedProb = stageExpectedProbability[deal.stage] || 50;
        if (Math.abs(deal.probability - expectedProb) > 25) {
          riskScore += 15;
          risks.push('Probability misaligned with stage');
        }

        // Generate recommendations
        const recommendations = [];
        if (riskScore > 50) {
          recommendations.push('Schedule immediate deal review');
          recommendations.push('Validate deal qualification criteria');
        }
        if (daysInStage > 21) {
          recommendations.push('Identify blockers and create action plan');
        }
        if (daysToClose < 14 && deal.stage !== 'Negotiation') {
          recommendations.push('Accelerate deal progression');
        }

        // Predict close probability using AI factors
        let aiProbability = deal.probability;
        if (riskScore > 40) aiProbability = Math.max(aiProbability - 20, 10);
        if (daysInStage > 45) aiProbability = Math.max(aiProbability - 15, 5);
        if (daysToClose < 0) aiProbability = Math.max(aiProbability - 30, 5);

        return {
          ...deal,
          aiInsights: {
            riskScore: Math.min(riskScore, 100),
            riskLevel: riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low',
            insights,
            risks,
            recommendations,
            aiProbability: Math.round(aiProbability),
            daysInStage,
            daysToClose,
            analyzedAt: new Date()
          }
        };
      });
    }
  });

  const predictRevenue = useCallback((deals, timeframe = 'quarter') => {
    const now = new Date();
    let endDate = new Date();
    
    if (timeframe === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (timeframe === 'quarter') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (timeframe === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const relevantDeals = deals.filter(deal => {
      const closeDate = new Date(deal.expectedCloseDate);
      return closeDate >= now && closeDate <= endDate && !deal.stage.includes('Closed');
    });

    const predictions = {
      conservative: 0,
      likely: 0,
      optimistic: 0,
      dealCount: relevantDeals.length
    };

    relevantDeals.forEach(deal => {
      const baseAmount = deal.amount;
      const probability = deal.aiInsights?.aiProbability || deal.probability;
      
      predictions.conservative += baseAmount * Math.max(probability - 20, 0) / 100;
      predictions.likely += baseAmount * probability / 100;
      predictions.optimistic += baseAmount * Math.min(probability + 15, 100) / 100;
    });

    return {
      timeframe,
      predictions: {
        conservative: Math.round(predictions.conservative),
        likely: Math.round(predictions.likely),
        optimistic: Math.round(predictions.optimistic)
      },
      dealCount: predictions.dealCount,
      confidence: relevantDeals.length > 0 ? Math.min(85 + (relevantDeals.length * 2), 95) : 0
    };
  }, []);

  return {
    analyzeDeals,
    predictRevenue
  };
};

// AI-Powered Sales Forecasting
export const useSalesForecasting = () => {
  const [forecastModel, setForecastModel] = useState({
    seasonality: true,
    trendAnalysis: true,
    historicalWeight: 0.7,
    pipelineWeight: 0.3
  });

  const generateForecast = useMutation({
    mutationFn: async ({ deals, historicalData, timeframe = 6 }) => {
      // Simulate historical revenue data
      const monthlyRevenue = [];
      const now = new Date();
      
      for (let i = 12; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthDeals = deals.filter(deal => {
          if (deal.actualCloseDate) {
            const closeDate = new Date(deal.actualCloseDate);
            return closeDate.getMonth() === date.getMonth() && 
                   closeDate.getFullYear() === date.getFullYear() &&
                   deal.stage === 'Closed Won';
          }
          return false;
        });
        
        const revenue = monthDeals.reduce((sum, deal) => sum + deal.amount, 0);
        monthlyRevenue.push({
          month: date.toISOString().slice(0, 7),
          revenue,
          dealCount: monthDeals.length
        });
      }

      // Calculate trend
      const recentRevenue = monthlyRevenue.slice(-6).map(m => m.revenue);
      const avgRecent = recentRevenue.reduce((sum, r) => sum + r, 0) / recentRevenue.length;
      const olderRevenue = monthlyRevenue.slice(0, 6).map(m => m.revenue);
      const avgOlder = olderRevenue.reduce((sum, r) => sum + r, 0) / olderRevenue.length;
      const trendGrowth = avgOlder > 0 ? ((avgRecent - avgOlder) / avgOlder) * 100 : 0;

      // Generate forecast for next months
      const forecast = [];
      for (let i = 1; i <= timeframe; i++) {
        const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        
        // Base forecast on historical average with trend
        let baseForecast = avgRecent;
        if (forecastModel.trendAnalysis) {
          baseForecast *= (1 + (trendGrowth / 100) * i * 0.1);
        }

        // Apply seasonality (simplified)
        if (forecastModel.seasonality) {
          const month = forecastDate.getMonth();
          const seasonalMultiplier = [0.9, 0.85, 1.1, 1.15, 1.2, 1.1, 0.95, 0.9, 1.05, 1.2, 1.25, 1.3][month];
          baseForecast *= seasonalMultiplier;
        }

        // Pipeline contribution
        const pipelineDeals = deals.filter(deal => {
          const closeDate = new Date(deal.expectedCloseDate);
          return closeDate.getMonth() === forecastDate.getMonth() && 
                 closeDate.getFullYear() === forecastDate.getFullYear() &&
                 !deal.stage.includes('Closed');
        });

        const pipelineRevenue = pipelineDeals.reduce((sum, deal) => {
          return sum + (deal.amount * (deal.probability / 100));
        }, 0);

        const finalForecast = (baseForecast * forecastModel.historicalWeight) + 
                             (pipelineRevenue * forecastModel.pipelineWeight);

        forecast.push({
          month: forecastDate.toISOString().slice(0, 7),
          forecast: Math.round(finalForecast),
          confidence: Math.max(60 - (i * 5), 30), // Confidence decreases over time
          pipelineContribution: Math.round(pipelineRevenue),
          historicalBase: Math.round(baseForecast),
          dealCount: pipelineDeals.length
        });
      }

      return {
        historical: monthlyRevenue,
        forecast,
        trends: {
          growth: Math.round(trendGrowth * 100) / 100,
          avgMonthlyRevenue: Math.round(avgRecent),
          seasonalityDetected: forecastModel.seasonality
        },
        model: forecastModel
      };
    }
  });

  return {
    forecastModel,
    setForecastModel,
    generateForecast
  };
};

// AI Conversation Intelligence
export const useConversationAI = () => {
  const [conversations, setConversations] = useState([]);

  const analyzeConversation = useMutation({
    mutationFn: async (conversationText) => {
      // Simulate AI analysis of conversation
      const words = conversationText.toLowerCase().split(' ');
      
      // Sentiment analysis (simplified)
      const positiveWords = ['great', 'excellent', 'perfect', 'love', 'amazing', 'fantastic', 'yes', 'definitely'];
      const negativeWords = ['bad', 'terrible', 'hate', 'no', 'never', 'problem', 'issue', 'concern'];
      
      const positiveCount = words.filter(word => positiveWords.includes(word)).length;
      const negativeCount = words.filter(word => negativeWords.includes(word)).length;
      
      let sentiment = 'neutral';
      if (positiveCount > negativeCount) sentiment = 'positive';
      else if (negativeCount > positiveCount) sentiment = 'negative';

      // Extract key topics
      const businessTopics = ['budget', 'timeline', 'decision', 'approval', 'contract', 'price', 'cost'];
      const detectedTopics = words.filter(word => businessTopics.includes(word));

      // Intent detection
      const buyingSignals = ['buy', 'purchase', 'implement', 'start', 'proceed', 'move forward'];
      const objections = ['expensive', 'costly', 'think about', 'consider', 'maybe', 'not sure'];
      
      const hasBuyingSignals = words.some(word => buyingSignals.includes(word));
      const hasObjections = words.some(word => objections.includes(word));

      let intent = 'information_gathering';
      if (hasBuyingSignals) intent = 'ready_to_buy';
      else if (hasObjections) intent = 'has_concerns';

      // Generate insights
      const insights = [];
      if (sentiment === 'positive') insights.push('Customer shows positive engagement');
      if (hasBuyingSignals) insights.push('Strong buying signals detected');
      if (hasObjections) insights.push('Address customer concerns about pricing/timeline');
      if (detectedTopics.includes('budget')) insights.push('Budget discussion - qualify financial capacity');
      if (detectedTopics.includes('timeline')) insights.push('Timeline mentioned - understand urgency');

      // Recommended actions
      const actions = [];
      if (intent === 'ready_to_buy') actions.push('Send proposal or contract');
      if (intent === 'has_concerns') actions.push('Schedule follow-up to address concerns');
      if (detectedTopics.includes('decision')) actions.push('Identify decision makers and process');

      return {
        sentiment,
        confidence: Math.random() * 30 + 70, // 70-100% confidence
        topics: detectedTopics,
        intent,
        insights,
        recommendedActions: actions,
        keyPhrases: [...new Set([...buyingSignals, ...objections].filter(phrase => 
          conversationText.toLowerCase().includes(phrase)
        ))],
        analyzedAt: new Date()
      };
    }
  });

  const generateFollowUp = useMutation({
    mutationFn: async ({ conversationAnalysis, customerName, dealContext }) => {
      const { sentiment, intent, topics } = conversationAnalysis;
      
      let template = '';
      
      if (intent === 'ready_to_buy') {
        template = `Hi ${customerName},\n\nThank you for our positive conversation today. Based on our discussion, I'm excited to move forward with the next steps.\n\nI'll prepare the proposal we discussed and send it over by [DATE]. This will include:\n- [SPECIFIC SOLUTIONS DISCUSSED]\n- Implementation timeline\n- Investment details\n\nIs there anything specific you'd like me to include or any questions before I send this over?\n\nBest regards,\n[YOUR NAME]`;
      } else if (intent === 'has_concerns') {
        template = `Hi ${customerName},\n\nThank you for taking the time to discuss your needs today. I understand you have some considerations around [SPECIFIC CONCERNS].\n\nI'd like to schedule a brief follow-up call to address these points and ensure we're providing the best solution for your situation.\n\nWould [SUGGESTED TIME] work for a 15-minute conversation?\n\nBest regards,\n[YOUR NAME]`;
      } else {
        template = `Hi ${customerName},\n\nThank you for our conversation today. I found our discussion about [TOPICS] very insightful.\n\nBased on what we covered, I think the next step would be to [NEXT ACTION]. I'll [SPECIFIC COMMITMENT] and follow up with you by [DATE].\n\nPlease let me know if you have any questions in the meantime.\n\nBest regards,\n[YOUR NAME]`;
      }

      return {
        template,
        suggestedSubject: `Follow-up: ${dealContext?.name || 'Our conversation today'}`,
        priority: intent === 'ready_to_buy' ? 'high' : 'medium',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        generatedAt: new Date()
      };
    }
  });

  return {
    conversations,
    setConversations,
    analyzeConversation,
    generateFollowUp
  };
};

// Export all AI features
export default {
  useAILeadScoring,
  useAIDealInsights,
  useSalesForecasting,
  useConversationAI
};