// Intelligent Recommendations Hook with AI-Powered Suggestions
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import { useNotifications } from '../useNotifications';
import { useOptimizedQuery } from '../performance/useOptimizedQuery';

// Recommendation Engine with ML-based Suggestions
class RecommendationEngine {
  constructor() {
    this.recommendationTypes = {
      LEAD_NURTURING: 'lead_nurturing',
      SALES_ACTION: 'sales_action',
      DEAL_OPTIMIZATION: 'deal_optimization',
      CUSTOMER_RETENTION: 'customer_retention',
      PROCESS_IMPROVEMENT: 'process_improvement',
      CONTENT_SUGGESTION: 'content_suggestion',
      TIMING_OPTIMIZATION: 'timing_optimization',
      RESOURCE_ALLOCATION: 'resource_allocation',
    };
    
    this.priorityLevels = {
      CRITICAL: { level: 1, label: 'Critical', color: 'red' },
      HIGH: { level: 2, label: 'High', color: 'orange' },
      MEDIUM: { level: 3, label: 'Medium', color: 'yellow' },
      LOW: { level: 4, label: 'Low', color: 'blue' },
      INFO: { level: 5, label: 'Info', color: 'gray' },
    };
    
    this.confidenceLevels = {
      VERY_HIGH: 0.9,
      HIGH: 0.75,
      MEDIUM: 0.6,
      LOW: 0.4,
      VERY_LOW: 0.2,
    };
  }

  // Generate comprehensive recommendations
  generateRecommendations(data) {
    const recommendations = [];
    
    // Lead nurturing recommendations
    if (data.leads) {
      recommendations.push(...this.generateLeadNurturingRecommendations(data.leads, data.interactions));
    }
    
    // Sales action recommendations
    if (data.deals) {
      recommendations.push(...this.generateSalesActionRecommendations(data.deals, data.activities));
    }
    
    // Deal optimization recommendations
    if (data.deals && data.pipeline) {
      recommendations.push(...this.generateDealOptimizationRecommendations(data.deals, data.pipeline));
    }
    
    // Customer retention recommendations
    if (data.customers) {
      recommendations.push(...this.generateCustomerRetentionRecommendations(data.customers, data.interactions));
    }
    
    // Process improvement recommendations
    if (data.analytics) {
      recommendations.push(...this.generateProcessImprovementRecommendations(data.analytics));
    }
    
    // Content suggestions
    if (data.leads && data.content) {
      recommendations.push(...this.generateContentSuggestions(data.leads, data.content));
    }
    
    // Timing optimization
    if (data.activities) {
      recommendations.push(...this.generateTimingOptimizationRecommendations(data.activities));
    }
    
    // Resource allocation
    if (data.team && data.workload) {
      recommendations.push(...this.generateResourceAllocationRecommendations(data.team, data.workload));
    }
    
    // Sort by priority and confidence
    return recommendations
      .sort((a, b) => {
        if (a.priority.level !== b.priority.level) {
          return a.priority.level - b.priority.level;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 50); // Limit to top 50 recommendations
  }

  // Lead nurturing recommendations
  generateLeadNurturingRecommendations(leads, interactions = []) {
    const recommendations = [];
    
    leads.forEach(lead => {
      const leadInteractions = interactions.filter(i => i.leadId === lead.id);
      const lastInteraction = this.getLastInteraction(leadInteractions);
      const daysSinceLastContact = this.getDaysSinceLastContact(lastInteraction);
      
      // Cold lead re-engagement
      if (daysSinceLastContact > 30) {
        recommendations.push({
          id: `cold-lead-${lead.id}`,
          type: this.recommendationTypes.LEAD_NURTURING,
          title: 'Re-engage Cold Lead',
          description: `${lead.name} hasn't been contacted in ${daysSinceLastContact} days. Consider re-engagement campaign.`,
          priority: this.priorityLevels.HIGH,
          confidence: 0.8,
          leadId: lead.id,
          leadName: lead.name,
          actions: [
            { type: 'send_email', label: 'Send Re-engagement Email' },
            { type: 'schedule_call', label: 'Schedule Follow-up Call' },
            { type: 'send_content', label: 'Share Relevant Content' },
          ],
          expectedImpact: 'Medium',
          estimatedEffort: 'Low',
          deadline: this.getRecommendationDeadline(7),
        });
      }
      
      // High-value lead prioritization
      if (lead.estimatedValue > 50000 && lead.score > 70) {
        recommendations.push({
          id: `high-value-lead-${lead.id}`,
          type: this.recommendationTypes.LEAD_NURTURING,
          title: 'Prioritize High-Value Lead',
          description: `${lead.name} is a high-value lead (${lead.estimatedValue}) with good engagement. Fast-track this opportunity.`,
          priority: this.priorityLevels.CRITICAL,
          confidence: 0.9,
          leadId: lead.id,
          leadName: lead.name,
          actions: [
            { type: 'schedule_demo', label: 'Schedule Product Demo' },
            { type: 'assign_senior_rep', label: 'Assign Senior Sales Rep' },
            { type: 'create_proposal', label: 'Prepare Custom Proposal' },
          ],
          expectedImpact: 'High',
          estimatedEffort: 'Medium',
          deadline: this.getRecommendationDeadline(3),
        });
      }
      
      // Lead qualification needed
      if (!lead.qualified && leadInteractions.length > 3) {
        recommendations.push({
          id: `qualify-lead-${lead.id}`,
          type: this.recommendationTypes.LEAD_NURTURING,
          title: 'Lead Qualification Required',
          description: `${lead.name} has shown interest but needs qualification. Determine fit and budget.`,
          priority: this.priorityLevels.MEDIUM,
          confidence: 0.7,
          leadId: lead.id,
          leadName: lead.name,
          actions: [
            { type: 'qualification_call', label: 'Schedule Qualification Call' },
            { type: 'send_survey', label: 'Send Qualification Survey' },
            { type: 'research_company', label: 'Research Company Background' },
          ],
          expectedImpact: 'Medium',
          estimatedEffort: 'Low',
          deadline: this.getRecommendationDeadline(5),
        });
      }
    });
    
    return recommendations;
  }

  // Sales action recommendations
  generateSalesActionRecommendations(deals, activities = []) {
    const recommendations = [];
    
    deals.forEach(deal => {
      const dealActivities = activities.filter(a => a.dealId === deal.id);
      const lastActivity = this.getLastActivity(dealActivities);
      const daysSinceLastActivity = this.getDaysSinceLastContact(lastActivity);
      
      // Stalled deal intervention
      if (deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && daysSinceLastActivity > 14) {
        recommendations.push({
          id: `stalled-deal-${deal.id}`,
          type: this.recommendationTypes.SALES_ACTION,
          title: 'Revive Stalled Deal',
          description: `Deal "${deal.name}" has been inactive for ${daysSinceLastActivity} days. Take action to move it forward.`,
          priority: this.priorityLevels.HIGH,
          confidence: 0.85,
          dealId: deal.id,
          dealName: deal.name,
          dealValue: deal.value,
          actions: [
            { type: 'follow_up_call', label: 'Schedule Follow-up Call' },
            { type: 'send_proposal', label: 'Send Updated Proposal' },
            { type: 'schedule_meeting', label: 'Schedule Decision Maker Meeting' },
          ],
          expectedImpact: 'High',
          estimatedEffort: 'Medium',
          deadline: this.getRecommendationDeadline(3),
        });
      }
      
      // Close date approaching
      if (deal.expectedCloseDate && this.isCloseDateApproaching(deal.expectedCloseDate)) {
        const daysUntilClose = this.getDaysUntilCloseDate(deal.expectedCloseDate);
        recommendations.push({
          id: `close-date-${deal.id}`,
          type: this.recommendationTypes.SALES_ACTION,
          title: 'Close Date Approaching',
          description: `Deal "${deal.name}" is expected to close in ${daysUntilClose} days. Ensure all requirements are met.`,
          priority: this.priorityLevels.HIGH,
          confidence: 0.8,
          dealId: deal.id,
          dealName: deal.name,
          dealValue: deal.value,
          actions: [
            { type: 'review_requirements', label: 'Review Closing Requirements' },
            { type: 'prepare_contract', label: 'Prepare Final Contract' },
            { type: 'schedule_closing_call', label: 'Schedule Closing Call' },
          ],
          expectedImpact: 'High',
          estimatedEffort: 'High',
          deadline: this.getRecommendationDeadline(daysUntilClose - 1),
        });
      }
      
      // Upsell opportunity
      if (deal.stage === 'closed-won' && this.hasUpsellPotential(deal, dealActivities)) {
        recommendations.push({
          id: `upsell-${deal.id}`,
          type: this.recommendationTypes.SALES_ACTION,
          title: 'Upsell Opportunity Identified',
          description: `Customer "${deal.customerName}" may be ready for additional products or services.`,
          priority: this.priorityLevels.MEDIUM,
          confidence: 0.6,
          dealId: deal.id,
          dealName: deal.name,
          dealValue: deal.value,
          actions: [
            { type: 'analyze_usage', label: 'Analyze Product Usage' },
            { type: 'identify_needs', label: 'Identify Additional Needs' },
            { type: 'present_options', label: 'Present Upsell Options' },
          ],
          expectedImpact: 'Medium',
          estimatedEffort: 'Medium',
          deadline: this.getRecommendationDeadline(14),
        });
      }
    });
    
    return recommendations;
  }

  // Deal optimization recommendations
  generateDealOptimizationRecommendations(deals, pipeline) {
    const recommendations = [];
    
    // Pipeline bottleneck analysis
    const stageAnalysis = this.analyzePipelineStages(deals);
    Object.entries(stageAnalysis).forEach(([stage, analysis]) => {
      if (analysis.conversionRate < 0.3 && analysis.dealCount > 5) {
        recommendations.push({
          id: `bottleneck-${stage}`,
          type: this.recommendationTypes.DEAL_OPTIMIZATION,
          title: `Pipeline Bottleneck in ${stage}`,
          description: `${stage} stage has low conversion rate (${(analysis.conversionRate * 100).toFixed(1)}%). Review and optimize this stage.`,
          priority: this.priorityLevels.HIGH,
          confidence: 0.8,
          stage,
          dealCount: analysis.dealCount,
          conversionRate: analysis.conversionRate,
          actions: [
            { type: 'analyze_stage', label: 'Analyze Stage Requirements' },
            { type: 'train_team', label: 'Provide Stage-Specific Training' },
            { type: 'update_process', label: 'Update Stage Process' },
          ],
          expectedImpact: 'High',
          estimatedEffort: 'High',
          deadline: this.getRecommendationDeadline(14),
        });
      }
    });
    
    // Deal velocity optimization
    const slowDeals = deals.filter(deal => this.isDealMovingSlowly(deal));
    if (slowDeals.length > 0) {
      recommendations.push({
        id: 'deal-velocity-optimization',
        type: this.recommendationTypes.DEAL_OPTIMIZATION,
        title: 'Improve Deal Velocity',
        description: `${slowDeals.length} deals are moving slowly through the pipeline. Focus on acceleration tactics.`,
        priority: this.priorityLevels.MEDIUM,
        confidence: 0.7,
        affectedDeals: slowDeals.length,
        actions: [
          { type: 'identify_blockers', label: 'Identify Deal Blockers' },
          { type: 'streamline_process', label: 'Streamline Approval Process' },
          { type: 'increase_touchpoints', label: 'Increase Customer Touchpoints' },
        ],
        expectedImpact: 'Medium',
        estimatedEffort: 'Medium',
        deadline: this.getRecommendationDeadline(10),
      });
    }
    
    return recommendations;
  }

  // Customer retention recommendations
  generateCustomerRetentionRecommendations(customers, interactions = []) {
    const recommendations = [];
    
    customers.forEach(customer => {
      const customerInteractions = interactions.filter(i => i.customerId === customer.id);
      const churnRisk = this.calculateChurnRisk(customer, customerInteractions);
      
      if (churnRisk > 0.7) {
        recommendations.push({
          id: `churn-risk-${customer.id}`,
          type: this.recommendationTypes.CUSTOMER_RETENTION,
          title: 'High Churn Risk Customer',
          description: `${customer.name} shows high churn risk (${(churnRisk * 100).toFixed(1)}%). Immediate intervention required.`,
          priority: this.priorityLevels.CRITICAL,
          confidence: 0.85,
          customerId: customer.id,
          customerName: customer.name,
          churnRisk,
          actions: [
            { type: 'schedule_check_in', label: 'Schedule Health Check Call' },
            { type: 'offer_support', label: 'Offer Additional Support' },
            { type: 'provide_training', label: 'Provide Product Training' },
          ],
          expectedImpact: 'High',
          estimatedEffort: 'High',
          deadline: this.getRecommendationDeadline(2),
        });
      }
      
      // Expansion opportunity
      if (this.hasExpansionOpportunity(customer, customerInteractions)) {
        recommendations.push({
          id: `expansion-${customer.id}`,
          type: this.recommendationTypes.CUSTOMER_RETENTION,
          title: 'Customer Expansion Opportunity',
          description: `${customer.name} shows potential for account expansion. Consider upsell or cross-sell.`,
          priority: this.priorityLevels.MEDIUM,
          confidence: 0.6,
          customerId: customer.id,
          customerName: customer.name,
          actions: [
            { type: 'analyze_usage', label: 'Analyze Product Usage' },
            { type: 'identify_opportunities', label: 'Identify Expansion Opportunities' },
            { type: 'present_options', label: 'Present Expansion Options' },
          ],
          expectedImpact: 'Medium',
          estimatedEffort: 'Medium',
          deadline: this.getRecommendationDeadline(21),
        });
      }
    });
    
    return recommendations;
  }

  // Process improvement recommendations
  generateProcessImprovementRecommendations(analytics) {
    const recommendations = [];
    
    // Low conversion rates
    if (analytics.conversionRate < 0.15) {
      recommendations.push({
        id: 'improve-conversion-rate',
        type: this.recommendationTypes.PROCESS_IMPROVEMENT,
        title: 'Improve Lead Conversion Rate',
        description: `Current conversion rate is ${(analytics.conversionRate * 100).toFixed(1)}%. Industry average is 15-20%.`,
        priority: this.priorityLevels.HIGH,
        confidence: 0.8,
        currentRate: analytics.conversionRate,
        actions: [
          { type: 'analyze_funnel', label: 'Analyze Conversion Funnel' },
          { type: 'improve_qualification', label: 'Improve Lead Qualification' },
          { type: 'optimize_messaging', label: 'Optimize Sales Messaging' },
        ],
        expectedImpact: 'High',
        estimatedEffort: 'High',
        deadline: this.getRecommendationDeadline(30),
      });
    }
    
    // Long sales cycle
    if (analytics.avgSalesCycle > 90) {
      recommendations.push({
        id: 'reduce-sales-cycle',
        type: this.recommendationTypes.PROCESS_IMPROVEMENT,
        title: 'Reduce Sales Cycle Length',
        description: `Average sales cycle is ${analytics.avgSalesCycle} days. Consider process optimization.`,
        priority: this.priorityLevels.MEDIUM,
        confidence: 0.7,
        currentCycle: analytics.avgSalesCycle,
        actions: [
          { type: 'streamline_process', label: 'Streamline Sales Process' },
          { type: 'automate_tasks', label: 'Automate Routine Tasks' },
          { type: 'improve_handoffs', label: 'Improve Team Handoffs' },
        ],
        expectedImpact: 'Medium',
        estimatedEffort: 'High',
        deadline: this.getRecommendationDeadline(45),
      });
    }
    
    return recommendations;
  }

  // Content suggestions
  generateContentSuggestions(leads, content) {
    const recommendations = [];
    
    // Analyze lead interests and suggest relevant content
    const contentGaps = this.identifyContentGaps(leads, content);
    
    contentGaps.forEach(gap => {
      recommendations.push({
        id: `content-gap-${gap.topic}`,
        type: this.recommendationTypes.CONTENT_SUGGESTION,
        title: `Create Content for ${gap.topic}`,
        description: `${gap.leadCount} leads are interested in ${gap.topic} but no relevant content exists.`,
        priority: this.priorityLevels.MEDIUM,
        confidence: 0.6,
        topic: gap.topic,
        leadCount: gap.leadCount,
        actions: [
          { type: 'create_blog_post', label: 'Create Blog Post' },
          { type: 'create_whitepaper', label: 'Create Whitepaper' },
          { type: 'create_case_study', label: 'Create Case Study' },
        ],
        expectedImpact: 'Medium',
        estimatedEffort: 'High',
        deadline: this.getRecommendationDeadline(21),
      });
    });
    
    return recommendations;
  }

  // Timing optimization recommendations
  generateTimingOptimizationRecommendations(activities) {
    const recommendations = [];
    
    const timingAnalysis = this.analyzeActivityTiming(activities);
    
    if (timingAnalysis.optimalTimes.length > 0) {
      recommendations.push({
        id: 'optimize-contact-timing',
        type: this.recommendationTypes.TIMING_OPTIMIZATION,
        title: 'Optimize Contact Timing',
        description: `Analysis shows better response rates at specific times. Adjust outreach schedule.`,
        priority: this.priorityLevels.LOW,
        confidence: 0.6,
        optimalTimes: timingAnalysis.optimalTimes,
        actions: [
          { type: 'schedule_calls', label: 'Schedule Calls at Optimal Times' },
          { type: 'automate_emails', label: 'Automate Email Timing' },
          { type: 'update_cadence', label: 'Update Follow-up Cadence' },
        ],
        expectedImpact: 'Low',
        estimatedEffort: 'Low',
        deadline: this.getRecommendationDeadline(14),
      });
    }
    
    return recommendations;
  }

  // Resource allocation recommendations
  generateResourceAllocationRecommendations(team, workload) {
    const recommendations = [];
    
    const workloadAnalysis = this.analyzeTeamWorkload(team, workload);
    
    // Overloaded team members
    workloadAnalysis.overloaded.forEach(member => {
      recommendations.push({
        id: `workload-${member.id}`,
        type: this.recommendationTypes.RESOURCE_ALLOCATION,
        title: `Redistribute Workload for ${member.name}`,
        description: `${member.name} is handling ${member.dealCount} deals (${member.workloadPercentage}% capacity). Consider redistribution.`,
        priority: this.priorityLevels.HIGH,
        confidence: 0.8,
        teamMemberId: member.id,
        teamMemberName: member.name,
        workloadPercentage: member.workloadPercentage,
        actions: [
          { type: 'redistribute_deals', label: 'Redistribute Some Deals' },
          { type: 'provide_support', label: 'Provide Additional Support' },
          { type: 'automate_tasks', label: 'Automate Routine Tasks' },
        ],
        expectedImpact: 'Medium',
        estimatedEffort: 'Medium',
        deadline: this.getRecommendationDeadline(7),
      });
    });
    
    return recommendations;
  }

  // Helper methods
  getLastInteraction(interactions) {
    if (!interactions || interactions.length === 0) return null;
    return interactions.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
  }

  getLastActivity(activities) {
    if (!activities || activities.length === 0) return null;
    return activities.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
  }

  getDaysSinceLastContact(lastContact) {
    if (!lastContact) return Infinity;
    const now = new Date();
    const lastDate = new Date(lastContact.date);
    return Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  }

  isCloseDateApproaching(closeDate, threshold = 7) {
    const now = new Date();
    const close = new Date(closeDate);
    const daysUntilClose = Math.floor((close - now) / (1000 * 60 * 60 * 24));
    return daysUntilClose <= threshold && daysUntilClose >= 0;
  }

  getDaysUntilCloseDate(closeDate) {
    const now = new Date();
    const close = new Date(closeDate);
    return Math.floor((close - now) / (1000 * 60 * 60 * 24));
  }

  hasUpsellPotential(deal, activities) {
    // Simple heuristic: customer is active and deal was closed recently
    const closeDate = new Date(deal.closedDate);
    const now = new Date();
    const daysSinceClosed = Math.floor((now - closeDate) / (1000 * 60 * 60 * 24));
    
    const recentActivities = activities.filter(a => 
      new Date(a.date) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    );
    
    return daysSinceClosed > 90 && daysSinceClosed < 365 && recentActivities.length > 2;
  }

  analyzePipelineStages(deals) {
    const stageAnalysis = {};
    
    deals.forEach(deal => {
      if (!stageAnalysis[deal.stage]) {
        stageAnalysis[deal.stage] = {
          dealCount: 0,
          totalValue: 0,
          wonDeals: 0,
        };
      }
      
      stageAnalysis[deal.stage].dealCount++;
      stageAnalysis[deal.stage].totalValue += deal.value || 0;
      
      if (deal.stage === 'closed-won') {
        stageAnalysis[deal.stage].wonDeals++;
      }
    });
    
    // Calculate conversion rates
    Object.keys(stageAnalysis).forEach(stage => {
      const analysis = stageAnalysis[stage];
      analysis.conversionRate = analysis.dealCount > 0 ? analysis.wonDeals / analysis.dealCount : 0;
      analysis.avgDealValue = analysis.dealCount > 0 ? analysis.totalValue / analysis.dealCount : 0;
    });
    
    return stageAnalysis;
  }

  isDealMovingSlowly(deal) {
    if (!deal.createdDate) return false;
    
    const now = new Date();
    const created = new Date(deal.createdDate);
    const daysInPipeline = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    
    // Consider a deal slow if it's been in pipeline for more than 60 days
    // and not in final stages
    return daysInPipeline > 60 && 
           !['closed-won', 'closed-lost'].includes(deal.stage);
  }

  calculateChurnRisk(customer, interactions) {
    // Simple churn risk calculation
    let risk = 0;
    
    const lastInteraction = this.getLastInteraction(interactions);
    const daysSinceLastContact = this.getDaysSinceLastContact(lastInteraction);
    
    // Days since last contact
    if (daysSinceLastContact > 90) risk += 0.4;
    else if (daysSinceLastContact > 60) risk += 0.3;
    else if (daysSinceLastContact > 30) risk += 0.2;
    
    // Support tickets
    const supportTickets = interactions.filter(i => i.type === 'support').length;
    if (supportTickets > 5) risk += 0.3;
    else if (supportTickets > 2) risk += 0.2;
    
    // Usage decline (if available)
    if (customer.usageDecline) risk += 0.3;
    
    return Math.min(1, risk);
  }

  hasExpansionOpportunity(customer, interactions) {
    // Simple expansion opportunity detection
    const recentInteractions = interactions.filter(i => {
      const interactionDate = new Date(i.date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return interactionDate >= thirtyDaysAgo;
    });
    
    const positiveInteractions = recentInteractions.filter(i => 
      i.sentiment === 'positive' || i.type === 'feature_request'
    );
    
    return positiveInteractions.length > 2 && customer.healthScore > 0.7;
  }

  identifyContentGaps(leads, content) {
    const leadInterests = {};
    const contentTopics = new Set(content.map(c => c.topic));
    
    // Analyze lead interests
    leads.forEach(lead => {
      if (lead.interests && Array.isArray(lead.interests)) {
        lead.interests.forEach(interest => {
          if (!leadInterests[interest]) {
            leadInterests[interest] = 0;
          }
          leadInterests[interest]++;
        });
      }
    });
    
    // Find gaps
    const gaps = [];
    Object.entries(leadInterests).forEach(([topic, count]) => {
      if (!contentTopics.has(topic) && count >= 3) {
        gaps.push({ topic, leadCount: count });
      }
    });
    
    return gaps.sort((a, b) => b.leadCount - a.leadCount);
  }

  analyzeActivityTiming(activities) {
    const hourlySuccess = {};
    const dayOfWeekSuccess = {};
    
    activities.forEach(activity => {
      if (activity.successful) {
        const date = new Date(activity.date);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        
        hourlySuccess[hour] = (hourlySuccess[hour] || 0) + 1;
        dayOfWeekSuccess[dayOfWeek] = (dayOfWeekSuccess[dayOfWeek] || 0) + 1;
      }
    });
    
    // Find optimal times
    const optimalHours = Object.entries(hourlySuccess)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    const optimalDays = Object.entries(dayOfWeekSuccess)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day));
    
    return {
      optimalTimes: optimalHours.map(hour => `${hour}:00`),
      optimalDays: optimalDays.map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]),
    };
  }

  analyzeTeamWorkload(team, workload) {
    const analysis = {
      overloaded: [],
      underutilized: [],
      balanced: [],
    };
    
    team.forEach(member => {
      const memberWorkload = workload.find(w => w.memberId === member.id);
      if (!memberWorkload) return;
      
      const workloadPercentage = (memberWorkload.currentDeals / memberWorkload.capacity) * 100;
      
      if (workloadPercentage > 90) {
        analysis.overloaded.push({
          ...member,
          workloadPercentage,
          dealCount: memberWorkload.currentDeals,
        });
      } else if (workloadPercentage < 60) {
        analysis.underutilized.push({
          ...member,
          workloadPercentage,
          dealCount: memberWorkload.currentDeals,
        });
      } else {
        analysis.balanced.push({
          ...member,
          workloadPercentage,
          dealCount: memberWorkload.currentDeals,
        });
      }
    });
    
    return analysis;
  }

  getRecommendationDeadline(days) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toISOString();
  }
}

// Singleton recommendation engine
const recommendationEngine = new RecommendationEngine();

export const useRecommendations = (options = {}) => {
  const {
    enableAutoRefresh = true,
    refreshInterval = 600000, // 10 minutes
    maxRecommendations = 50,
    minConfidence = 0.4,
    enableNotifications = true,
  } = options;

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addNotification } = useNotifications();

  // Get comprehensive recommendations
  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    refetch: refetchRecommendations,
  } = useOptimizedQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      const [
        leads,
        deals,
        customers,
        interactions,
        activities,
        analytics,
        content,
        team,
        workload,
      ] = await Promise.all([
        queryClient.getQueryData(['leads']) || [],
        queryClient.getQueryData(['deals']) || [],
        queryClient.getQueryData(['contacts']) || [],
        queryClient.getQueryData(['interactions']) || [],
        queryClient.getQueryData(['activities']) || [],
        queryClient.getQueryData(['analytics']) || {},
        queryClient.getQueryData(['content']) || [],
        queryClient.getQueryData(['team']) || [],
        queryClient.getQueryData(['workload']) || [],
      ]);

      const data = {
        leads,
        deals,
        customers,
        interactions,
        activities,
        analytics,
        content,
        team,
        workload,
      };

      const allRecommendations = recommendationEngine.generateRecommendations(data);
      
      // Filter by confidence and limit
      return allRecommendations
        .filter(rec => rec.confidence >= minConfidence)
        .slice(0, maxRecommendations);
    },
    staleTime: refreshInterval,
    enableIntelligentCaching: true,
  });

  // Get recommendations by type
  const getRecommendationsByType = useCallback((type) => {
    if (!recommendations) return [];
    return recommendations.filter(rec => rec.type === type);
  }, [recommendations]);

  // Get recommendations by priority
  const getRecommendationsByPriority = useCallback((priority) => {
    if (!recommendations) return [];
    return recommendations.filter(rec => rec.priority.label === priority);
  }, [recommendations]);

  // Get high-priority recommendations
  const getHighPriorityRecommendations = useCallback(() => {
    if (!recommendations) return [];
    return recommendations.filter(rec => 
      rec.priority.level <= 2 // Critical and High priority
    );
  }, [recommendations]);

  // Mark recommendation as completed
  const markRecommendationCompleted = useMutation({
    mutationFn: async ({ recommendationId, completedAction, notes }) => {
      // In a real app, this would update the backend
      const updatedRecommendations = recommendations.map(rec => 
        rec.id === recommendationId 
          ? { 
              ...rec, 
              completed: true, 
              completedAt: new Date().toISOString(),
              completedAction,
              notes,
            }
          : rec
      );
      
      queryClient.setQueryData(['recommendations', user?.id], updatedRecommendations);
      
      return { recommendationId, completedAction, notes };
    },
    onSuccess: (data) => {
      if (enableNotifications) {
        addNotification({
          type: 'success',
          title: 'Recommendation Completed',
          message: `Action "${data.completedAction}" has been marked as completed.`,
        });
      }
    },
  });

  // Dismiss recommendation
  const dismissRecommendation = useMutation({
    mutationFn: async ({ recommendationId, reason }) => {
      const updatedRecommendations = recommendations.filter(rec => 
        rec.id !== recommendationId
      );
      
      queryClient.setQueryData(['recommendations', user?.id], updatedRecommendations);
      
      return { recommendationId, reason };
    },
    onSuccess: (data) => {
      if (enableNotifications) {
        addNotification({
          type: 'info',
          title: 'Recommendation Dismissed',
          message: 'Recommendation has been dismissed.',
        });
      }
    },
  });

  // Recommendation analytics
  const recommendationAnalytics = useMemo(() => {
    if (!recommendations) return null;

    const total = recommendations.length;
    const byType = recommendations.reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1;
      return acc;
    }, {});
    
    const byPriority = recommendations.reduce((acc, rec) => {
      acc[rec.priority.label] = (acc[rec.priority.label] || 0) + 1;
      return acc;
    }, {});
    
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / total;
    
    const completed = recommendations.filter(rec => rec.completed).length;
    const completionRate = total > 0 ? completed / total : 0;

    return {
      total,
      byType,
      byPriority,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      completed,
      completionRate: Math.round(completionRate * 100) / 100,
      highPriority: (byPriority.Critical || 0) + (byPriority.High || 0),
    };
  }, [recommendations]);

  return {
    // Data
    recommendations: recommendations || [],
    recommendationAnalytics,
    
    // Loading states
    isLoading: recommendationsLoading,
    
    // Methods
    getRecommendationsByType,
    getRecommendationsByPriority,
    getHighPriorityRecommendations,
    
    // Mutations
    markCompleted: markRecommendationCompleted.mutate,
    dismiss: dismissRecommendation.mutate,
    isMarkingCompleted: markRecommendationCompleted.isPending,
    isDismissing: dismissRecommendation.isPending,
    
    // Refresh
    refetchRecommendations,
    
    // Configuration
    enabled: {
      autoRefresh: enableAutoRefresh,
      notifications: enableNotifications,
    },
    
    // Settings
    maxRecommendations,
    minConfidence,
    
    // Engine access
    recommendationEngine,
  };
};

export default useRecommendations;