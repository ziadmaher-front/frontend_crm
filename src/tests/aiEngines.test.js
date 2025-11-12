import AdvancedAIEngine from '../services/advancedAIEngine.js';
import IntelligentAutomationEngine from '../services/intelligentAutomationEngine.js';
import PredictiveCustomerJourneyEngine from '../services/predictiveCustomerJourney.js';
import EnhancedRevenueIntelligenceEngine from '../services/enhancedRevenueIntelligence.js';
import CollaborativeAIEngine from '../services/collaborativeAIEngine.js';

describe('AI Engines Integration Tests', () => {
  let advancedAI;
  let automationEngine;
  let customerJourneyEngine;
  let revenueEngine;
  let collaborativeEngine;

  beforeEach(() => {
    // Initialize all AI engines
    advancedAI = new AdvancedAIEngine();
    automationEngine = new IntelligentAutomationEngine();
    customerJourneyEngine = new PredictiveCustomerJourneyEngine();
    revenueEngine = new EnhancedRevenueIntelligenceEngine();
    collaborativeEngine = new CollaborativeAIEngine();
  });

  describe('AdvancedAIEngine', () => {
    it('should initialize with default configuration', () => {
      expect(advancedAI.config).toBeDefined();
      expect(advancedAI.config.models).toBeDefined();
      expect(advancedAI.config.ensemble).toBeDefined();
    });

    it('should calculate lead score using ensemble method', async () => {
      const mockLead = {
        id: 'lead-123',
        email: 'test@example.com',
        company: 'Test Corp',
        industry: 'Technology',
        revenue: 1000000,
        employees: 50,
        interactions: [
          { type: 'email_open', timestamp: Date.now() - 86400000 },
          { type: 'website_visit', timestamp: Date.now() - 43200000 }
        ]
      };

      const score = await advancedAI.calculateLeadScore(mockLead);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should predict deal outcome', async () => {
      const mockDeal = {
        id: 'deal-123',
        value: 50000,
        stage: 'proposal',
        probability: 0.7,
        daysInStage: 15,
        interactions: 5,
        competitorCount: 2
      };

      const prediction = await advancedAI.predictDealOutcome(mockDeal);
      expect(prediction).toHaveProperty('probability');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('factors');
    });
  });

  describe('IntelligentAutomationEngine', () => {
    it('should learn from user patterns', async () => {
      const mockPattern = {
        userId: 'user-123',
        action: 'send_follow_up_email',
        context: {
          leadStage: 'qualified',
          daysSinceLastContact: 3,
          leadScore: 85
        },
        timestamp: Date.now()
      };

      await automationEngine.learnFromPattern(mockPattern);
      const patterns = automationEngine.getLearnedPatterns('user-123');
      expect(patterns).toContain(mockPattern);
    });

    it('should suggest automations based on patterns', async () => {
      const mockContext = {
        userId: 'user-123',
        currentTask: 'lead_follow_up',
        leadData: {
          stage: 'qualified',
          score: 85,
          daysSinceLastContact: 3
        }
      };

      const suggestions = await automationEngine.suggestAutomations(mockContext);
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('PredictiveCustomerJourneyEngine', () => {
    it('should create customer journey', async () => {
      const mockCustomer = {
        id: 'customer-123',
        email: 'customer@example.com',
        industry: 'Technology',
        company_size: 'medium',
        current_stage: 'awareness'
      };

      const journey = await customerJourneyEngine.createCustomerJourney(mockCustomer);
      expect(journey).toHaveProperty('customerId');
      expect(journey).toHaveProperty('currentStage');
      expect(journey).toHaveProperty('predictedPath');
      expect(journey).toHaveProperty('personalizations');
    });

    it('should predict next stage', async () => {
      const mockJourney = {
        customerId: 'customer-123',
        currentStage: 'awareness',
        interactions: [
          { type: 'website_visit', timestamp: Date.now() - 86400000 },
          { type: 'content_download', timestamp: Date.now() - 43200000 }
        ]
      };

      const prediction = await customerJourneyEngine.predictNextStage(mockJourney);
      expect(prediction).toHaveProperty('nextStage');
      expect(prediction).toHaveProperty('probability');
      expect(prediction).toHaveProperty('timeToTransition');
    });
  });

  describe('EnhancedRevenueIntelligenceEngine', () => {
    it('should forecast revenue', async () => {
      const mockData = {
        historicalRevenue: [100000, 120000, 110000, 130000, 125000],
        pipeline: [
          { value: 50000, probability: 0.8, closeDate: '2024-02-15' },
          { value: 75000, probability: 0.6, closeDate: '2024-03-01' }
        ],
        marketFactors: {
          seasonality: 0.1,
          economicIndicator: 0.05,
          competitiveIndex: 0.8
        }
      };

      const forecast = await revenueEngine.forecastRevenue(mockData);
      expect(forecast).toHaveProperty('predictedRevenue');
      expect(forecast).toHaveProperty('confidence');
      expect(forecast).toHaveProperty('factors');
    });

    it('should optimize pricing', async () => {
      const mockProduct = {
        id: 'product-123',
        currentPrice: 1000,
        cost: 600,
        demand: 0.8,
        competition: [900, 1100, 950],
        customerSegment: 'enterprise'
      };

      const optimization = await revenueEngine.optimizePricing(mockProduct);
      expect(optimization).toHaveProperty('recommendedPrice');
      expect(optimization).toHaveProperty('expectedRevenue');
      expect(optimization).toHaveProperty('priceElasticity');
    });
  });

  describe('CollaborativeAIEngine', () => {
    it('should analyze team performance', async () => {
      const mockTeam = {
        id: 'team-123',
        members: [
          { id: 'user-1', role: 'sales_rep', performance: 0.85 },
          { id: 'user-2', role: 'sales_rep', performance: 0.92 },
          { id: 'user-3', role: 'manager', performance: 0.88 }
        ],
        metrics: {
          totalDeals: 50,
          closedDeals: 35,
          revenue: 500000,
          averageDealSize: 14285
        }
      };

      const analysis = await collaborativeEngine.analyzeTeamPerformance(mockTeam);
      expect(analysis).toHaveProperty('overallScore');
      expect(analysis).toHaveProperty('strengths');
      expect(analysis).toHaveProperty('improvements');
      expect(analysis).toHaveProperty('recommendations');
    });

    it('should optimize resource allocation', async () => {
      const mockResources = {
        team: 'team-123',
        availableMembers: [
          { id: 'user-1', skills: ['prospecting', 'closing'], availability: 0.8 },
          { id: 'user-2', skills: ['technical', 'demos'], availability: 0.9 }
        ],
        upcomingTasks: [
          { type: 'demo', priority: 'high', estimatedHours: 2 },
          { type: 'follow_up', priority: 'medium', estimatedHours: 1 }
        ]
      };

      const allocation = await collaborativeEngine.optimizeResourceAllocation(mockResources);
      expect(allocation).toHaveProperty('assignments');
      expect(allocation).toHaveProperty('efficiency');
      expect(allocation).toHaveProperty('recommendations');
    });
  });

  describe('Integration Tests', () => {
    it('should work together for comprehensive insights', async () => {
      // Test that all engines can work together
      const mockLead = {
        id: 'lead-123',
        email: 'test@example.com',
        company: 'Test Corp',
        industry: 'Technology'
      };

      // Get lead score from AI engine
      const leadScore = await advancedAI.calculateLeadScore(mockLead);
      expect(leadScore).toBeGreaterThan(0);

      // Create customer journey
      const journey = await customerJourneyEngine.createCustomerJourney(mockLead);
      expect(journey).toBeDefined();

      // Suggest automations
      const automations = await automationEngine.suggestAutomations({
        userId: 'user-123',
        leadData: { ...mockLead, score: leadScore }
      });
      expect(Array.isArray(automations)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Test error handling
      const invalidData = null;
      
      try {
        await advancedAI.calculateLeadScore(invalidData);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});