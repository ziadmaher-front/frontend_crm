// Smart Sales Coaching System
// AI-powered sales performance analysis, coaching recommendations, and skill development

import { format, differenceInDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

class SmartSalesCoaching {
  constructor() {
    this.performanceMetrics = [
      'conversion_rate',
      'average_deal_size',
      'sales_cycle_length',
      'activity_volume',
      'pipeline_velocity',
      'win_rate',
      'quota_attainment',
      'customer_satisfaction'
    ];

    this.skillAreas = [
      'prospecting',
      'qualification',
      'discovery',
      'presentation',
      'objection_handling',
      'negotiation',
      'closing',
      'relationship_building',
      'product_knowledge',
      'industry_expertise'
    ];

    this.coachingFrameworks = {
      'SPIN': {
        name: 'SPIN Selling',
        focus: ['discovery', 'qualification'],
        techniques: ['situation_questions', 'problem_questions', 'implication_questions', 'need_payoff_questions']
      },
      'CHALLENGER': {
        name: 'Challenger Sale',
        focus: ['presentation', 'objection_handling'],
        techniques: ['teach', 'tailor', 'take_control']
      },
      'SANDLER': {
        name: 'Sandler Selling',
        focus: ['qualification', 'closing'],
        techniques: ['pain_funnel', 'budget_qualification', 'decision_process']
      },
      'CONSULTATIVE': {
        name: 'Consultative Selling',
        focus: ['discovery', 'relationship_building'],
        techniques: ['needs_analysis', 'solution_design', 'value_demonstration']
      }
    };

    this.benchmarks = {
      conversion_rate: { excellent: 0.25, good: 0.15, average: 0.10, poor: 0.05 },
      win_rate: { excellent: 0.30, good: 0.20, average: 0.15, poor: 0.10 },
      quota_attainment: { excellent: 1.20, good: 1.00, average: 0.80, poor: 0.60 },
      activity_volume: { excellent: 50, good: 35, average: 25, poor: 15 }
    };
  }

  // Comprehensive Performance Analysis
  async analyzePerformance(salesperson, deals, activities, timeframe = 90) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeframe * 24 * 60 * 60 * 1000);

      // Filter data by timeframe
      const periodDeals = deals.filter(deal => 
        new Date(deal.created_at) >= startDate && new Date(deal.created_at) <= endDate
      );
      const periodActivities = activities.filter(activity => 
        new Date(activity.created_at) >= startDate && new Date(activity.created_at) <= endDate
      );

      // Calculate performance metrics
      const metrics = this.calculatePerformanceMetrics(salesperson, periodDeals, periodActivities);
      
      // Benchmark against standards
      const benchmarkAnalysis = this.benchmarkPerformance(metrics);
      
      // Identify strengths and weaknesses
      const strengthsWeaknesses = this.identifyStrengthsWeaknesses(metrics, benchmarkAnalysis);
      
      // Analyze trends
      const trends = await this.analyzeTrends(salesperson, deals, activities, timeframe);
      
      // Generate skill assessment
      const skillAssessment = this.assessSkills(periodDeals, periodActivities, metrics);
      
      // Calculate overall performance score
      const performanceScore = this.calculatePerformanceScore(metrics, benchmarkAnalysis);
      
      return {
        success: true,
        data: {
          salesperson,
          timeframe,
          metrics,
          benchmarkAnalysis,
          strengthsWeaknesses,
          trends,
          skillAssessment,
          performanceScore,
          improvementAreas: this.identifyImprovementAreas(strengthsWeaknesses, skillAssessment),
          coachingPriorities: this.determineCoachingPriorities(strengthsWeaknesses, skillAssessment)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Personalized Coaching Recommendations
  async generateCoachingPlan(performanceAnalysis, learningPreferences = {}) {
    try {
      const { strengthsWeaknesses, skillAssessment, improvementAreas } = performanceAnalysis.data;
      
      // Identify primary coaching framework
      const recommendedFramework = this.selectCoachingFramework(improvementAreas, skillAssessment);
      
      // Generate specific coaching actions
      const coachingActions = this.generateCoachingActions(improvementAreas, recommendedFramework);
      
      // Create learning path
      const learningPath = this.createLearningPath(improvementAreas, learningPreferences);
      
      // Set goals and milestones
      const goals = this.setPerformanceGoals(performanceAnalysis.data.metrics, improvementAreas);
      
      // Generate practice scenarios
      const practiceScenarios = this.generatePracticeScenarios(improvementAreas, skillAssessment);
      
      // Create accountability measures
      const accountabilityMeasures = this.createAccountabilityMeasures(goals, coachingActions);
      
      return {
        success: true,
        data: {
          recommendedFramework,
          coachingActions,
          learningPath,
          goals,
          practiceScenarios,
          accountabilityMeasures,
          timeline: this.createCoachingTimeline(coachingActions, goals),
          resources: this.recommendResources(improvementAreas, learningPreferences)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Real-time Coaching Assistance
  async provideRealTimeCoaching(context) {
    try {
      const {
        dealStage,
        customerProfile,
        interactionHistory,
        currentChallenge,
        timeConstraints
      } = context;

      // Analyze current situation
      const situationAnalysis = this.analyzeSituation(context);
      
      // Generate immediate recommendations
      const immediateRecommendations = this.generateImmediateRecommendations(situationAnalysis);
      
      // Provide conversation starters
      const conversationStarters = this.generateConversationStarters(situationAnalysis);
      
      // Suggest objection handling strategies
      const objectionStrategies = this.suggestObjectionStrategies(situationAnalysis);
      
      // Recommend next steps
      const nextSteps = this.recommendNextSteps(situationAnalysis);
      
      return {
        success: true,
        data: {
          situationAnalysis,
          immediateRecommendations,
          conversationStarters,
          objectionStrategies,
          nextSteps,
          confidenceBooster: this.generateConfidenceBooster(situationAnalysis),
          keyTalkingPoints: this.generateKeyTalkingPoints(situationAnalysis)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Team Performance Analysis
  async analyzeTeamPerformance(team, deals, activities, timeframe = 90) {
    try {
      // Analyze individual performances
      const individualAnalyses = await Promise.all(
        team.map(member => this.analyzePerformance(member, deals, activities, timeframe))
      );

      // Calculate team metrics
      const teamMetrics = this.calculateTeamMetrics(individualAnalyses);
      
      // Identify top performers
      const topPerformers = this.identifyTopPerformers(individualAnalyses);
      
      // Identify coaching opportunities
      const coachingOpportunities = this.identifyTeamCoachingOpportunities(individualAnalyses);
      
      // Generate team development plan
      const teamDevelopmentPlan = this.generateTeamDevelopmentPlan(coachingOpportunities);
      
      // Create peer learning opportunities
      const peerLearning = this.createPeerLearningOpportunities(topPerformers, coachingOpportunities);
      
      return {
        success: true,
        data: {
          team,
          individualAnalyses,
          teamMetrics,
          topPerformers,
          coachingOpportunities,
          teamDevelopmentPlan,
          peerLearning,
          teamGoals: this.setTeamGoals(teamMetrics),
          competitionIdeas: this.generateTeamCompetitions(teamMetrics)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Performance Metrics Calculation
  calculatePerformanceMetrics(salesperson, deals, activities) {
    const totalDeals = deals.length;
    const wonDeals = deals.filter(deal => deal.stage === 'closed-won');
    const lostDeals = deals.filter(deal => deal.stage === 'closed-lost');
    const activeDeals = deals.filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage));

    const metrics = {
      // Conversion metrics
      conversion_rate: totalDeals > 0 ? wonDeals.length / totalDeals : 0,
      win_rate: (wonDeals.length + lostDeals.length) > 0 ? wonDeals.length / (wonDeals.length + lostDeals.length) : 0,
      
      // Deal metrics
      average_deal_size: wonDeals.length > 0 ? 
        wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0) / wonDeals.length : 0,
      total_revenue: wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
      
      // Activity metrics
      activity_volume: activities.length,
      calls_made: activities.filter(a => a.type === 'call').length,
      emails_sent: activities.filter(a => a.type === 'email').length,
      meetings_held: activities.filter(a => a.type === 'meeting').length,
      
      // Pipeline metrics
      pipeline_value: activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
      pipeline_count: activeDeals.length,
      
      // Timing metrics
      average_sales_cycle: this.calculateAverageSalesCycle(wonDeals),
      
      // Quota metrics (assuming quota is stored in salesperson object)
      quota_attainment: salesperson.quota ? 
        wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0) / salesperson.quota : 0
    };

    return metrics;
  }

  // Benchmark Performance
  benchmarkPerformance(metrics) {
    const analysis = {};
    
    Object.entries(this.benchmarks).forEach(([metric, benchmarks]) => {
      const value = metrics[metric] || 0;
      let rating = 'poor';
      
      if (value >= benchmarks.excellent) rating = 'excellent';
      else if (value >= benchmarks.good) rating = 'good';
      else if (value >= benchmarks.average) rating = 'average';
      
      analysis[metric] = {
        value,
        rating,
        benchmarks,
        percentile: this.calculatePercentile(value, benchmarks)
      };
    });
    
    return analysis;
  }

  // Identify Strengths and Weaknesses
  identifyStrengthsWeaknesses(metrics, benchmarkAnalysis) {
    const strengths = [];
    const weaknesses = [];
    
    Object.entries(benchmarkAnalysis).forEach(([metric, analysis]) => {
      if (analysis.rating === 'excellent' || analysis.rating === 'good') {
        strengths.push({
          metric,
          rating: analysis.rating,
          value: analysis.value,
          description: this.getMetricDescription(metric, 'strength')
        });
      } else if (analysis.rating === 'poor') {
        weaknesses.push({
          metric,
          rating: analysis.rating,
          value: analysis.value,
          description: this.getMetricDescription(metric, 'weakness'),
          improvementPotential: this.calculateImprovementPotential(analysis)
        });
      }
    });
    
    return { strengths, weaknesses };
  }

  // Skill Assessment
  assessSkills(deals, activities, metrics) {
    const skillScores = {};
    
    this.skillAreas.forEach(skill => {
      skillScores[skill] = this.calculateSkillScore(skill, deals, activities, metrics);
    });
    
    return {
      scores: skillScores,
      topSkills: Object.entries(skillScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([skill, score]) => ({ skill, score })),
      developmentAreas: Object.entries(skillScores)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 3)
        .map(([skill, score]) => ({ skill, score }))
    };
  }

  // Calculate Skill Score
  calculateSkillScore(skill, deals, activities, metrics) {
    let score = 0.5; // Base score
    
    switch (skill) {
      case 'prospecting':
        score = Math.min(activities.filter(a => a.type === 'call').length / 30, 1);
        break;
      case 'qualification':
        score = metrics.conversion_rate * 2; // Higher conversion suggests better qualification
        break;
      case 'discovery':
        score = Math.min(activities.filter(a => a.type === 'meeting').length / 10, 1);
        break;
      case 'presentation':
        score = Math.min(activities.filter(a => a.type === 'demo').length / 5, 1);
        break;
      case 'negotiation':
        score = metrics.average_deal_size > 25000 ? 0.8 : 0.4;
        break;
      case 'closing':
        score = metrics.win_rate;
        break;
      default:
        score = 0.5 + (Math.random() * 0.3); // Simulate score for other skills
    }
    
    return Math.min(Math.max(score, 0), 1);
  }

  // Generate Coaching Actions
  generateCoachingActions(improvementAreas, framework) {
    const actions = [];
    
    improvementAreas.forEach(area => {
      switch (area.metric || area.skill) {
        case 'conversion_rate':
        case 'qualification':
          actions.push({
            area: 'qualification',
            action: 'Practice BANT qualification framework',
            framework: framework.name,
            priority: 'high',
            timeframe: '2 weeks',
            resources: ['qualification_checklist', 'bant_guide']
          });
          break;
        case 'win_rate':
        case 'closing':
          actions.push({
            area: 'closing',
            action: 'Role-play objection handling scenarios',
            framework: framework.name,
            priority: 'high',
            timeframe: '1 week',
            resources: ['objection_handling_guide', 'closing_techniques']
          });
          break;
        case 'activity_volume':
        case 'prospecting':
          actions.push({
            area: 'prospecting',
            action: 'Implement daily prospecting routine',
            framework: framework.name,
            priority: 'medium',
            timeframe: '1 week',
            resources: ['prospecting_templates', 'call_scripts']
          });
          break;
        default:
          actions.push({
            area: area.metric || area.skill,
            action: `Focus on improving ${area.metric || area.skill}`,
            framework: framework.name,
            priority: 'medium',
            timeframe: '2 weeks',
            resources: ['general_sales_training']
          });
      }
    });
    
    return actions;
  }

  // Generate Practice Scenarios
  generatePracticeScenarios(improvementAreas, skillAssessment) {
    const scenarios = [];
    
    improvementAreas.forEach(area => {
      const skill = area.metric || area.skill;
      
      switch (skill) {
        case 'qualification':
          scenarios.push({
            title: 'Qualifying a Budget-Conscious Prospect',
            description: 'Practice qualifying a prospect who seems interested but hesitant about budget',
            skills: ['qualification', 'objection_handling'],
            difficulty: 'medium',
            duration: '15 minutes'
          });
          break;
        case 'closing':
          scenarios.push({
            title: 'Closing with Multiple Stakeholders',
            description: 'Navigate a closing conversation with multiple decision makers',
            skills: ['closing', 'negotiation', 'relationship_building'],
            difficulty: 'hard',
            duration: '20 minutes'
          });
          break;
        case 'prospecting':
          scenarios.push({
            title: 'Cold Calling C-Level Executives',
            description: 'Practice opening conversations with senior executives',
            skills: ['prospecting', 'presentation'],
            difficulty: 'hard',
            duration: '10 minutes'
          });
          break;
      }
    });
    
    return scenarios;
  }

  // Helper Methods
  calculateAverageSalesCycle(wonDeals) {
    if (wonDeals.length === 0) return 0;
    
    const cycles = wonDeals.map(deal => {
      const created = new Date(deal.created_at);
      const closed = new Date(deal.close_date || deal.updated_at);
      return differenceInDays(closed, created);
    });
    
    return cycles.reduce((sum, cycle) => sum + cycle, 0) / cycles.length;
  }

  calculatePercentile(value, benchmarks) {
    if (value >= benchmarks.excellent) return 90;
    if (value >= benchmarks.good) return 70;
    if (value >= benchmarks.average) return 50;
    return 25;
  }

  getMetricDescription(metric, type) {
    const descriptions = {
      conversion_rate: {
        strength: 'Excellent at converting leads into opportunities',
        weakness: 'Needs improvement in lead conversion and qualification'
      },
      win_rate: {
        strength: 'Strong closing skills and deal management',
        weakness: 'Struggles with closing deals and overcoming objections'
      },
      activity_volume: {
        strength: 'Highly active with consistent outreach efforts',
        weakness: 'Low activity levels affecting pipeline generation'
      }
    };
    
    return descriptions[metric]?.[type] || `${type} in ${metric}`;
  }

  selectCoachingFramework(improvementAreas, skillAssessment) {
    // Simple framework selection logic
    const weakSkills = skillAssessment.developmentAreas.map(area => area.skill);
    
    if (weakSkills.includes('discovery') || weakSkills.includes('qualification')) {
      return this.coachingFrameworks.SPIN;
    } else if (weakSkills.includes('objection_handling') || weakSkills.includes('presentation')) {
      return this.coachingFrameworks.CHALLENGER;
    } else if (weakSkills.includes('closing') || weakSkills.includes('negotiation')) {
      return this.coachingFrameworks.SANDLER;
    } else {
      return this.coachingFrameworks.CONSULTATIVE;
    }
  }

  createLearningPath(improvementAreas, preferences) {
    const path = [];
    
    improvementAreas.forEach((area, index) => {
      path.push({
        week: index + 1,
        focus: area.metric || area.skill,
        activities: [
          'Read relevant materials',
          'Practice with role-play',
          'Apply in real situations',
          'Review and reflect'
        ],
        resources: this.getResourcesForArea(area.metric || area.skill),
        assessment: `Week ${index + 1} skill assessment`
      });
    });
    
    return path;
  }

  getResourcesForArea(area) {
    const resources = {
      qualification: ['BANT Framework Guide', 'Qualification Checklist', 'Discovery Questions Bank'],
      closing: ['Closing Techniques Handbook', 'Objection Handling Scripts', 'Negotiation Tactics'],
      prospecting: ['Cold Calling Scripts', 'Email Templates', 'Social Selling Guide'],
      presentation: ['Demo Best Practices', 'Storytelling Techniques', 'Visual Aids Guide']
    };
    
    return resources[area] || ['General Sales Training Materials'];
  }
}

// Export singleton instance
export const smartSalesCoaching = new SmartSalesCoaching();
export default smartSalesCoaching;