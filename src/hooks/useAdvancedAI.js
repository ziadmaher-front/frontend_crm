// Advanced AI Integration Hook
// Comprehensive hook for all AI services and intelligent features

import { useState, useEffect, useCallback, useRef } from 'react';
import AdvancedAIEngine from '../services/advancedAIEngine';
import IntelligentAutomationEngine from '../services/intelligentAutomationEngine';
import PredictiveCustomerJourneyEngine from '../services/predictiveCustomerJourney';
import EnhancedRevenueIntelligenceEngine from '../services/enhancedRevenueIntelligence';
import CollaborativeAIEngine from '../services/collaborativeAIEngine';

export const useAdvancedAI = () => {
  // AI Engine instances
  const [aiEngines, setAiEngines] = useState({
    advanced: null,
    automation: null,
    customerJourney: null,
    revenueIntelligence: null,
    collaborative: null
  });

  // AI state management
  const [aiState, setAiState] = useState({
    isInitialized: false,
    isLoading: false,
    error: null,
    activeProcesses: new Set(),
    insights: {},
    recommendations: {},
    predictions: {},
    automations: {},
    performance: {}
  });

  // AI configuration
  const [aiConfig, setAiConfig] = useState({
    enabledFeatures: {
      leadScoring: true,
      dealPrediction: true,
      customerBehavior: true,
      churnPrediction: true,
      revenueForecasting: true,
      automation: true,
      customerJourney: true,
      teamOptimization: true,
      marketIntelligence: true
    },
    updateIntervals: {
      insights: 300000, // 5 minutes
      predictions: 900000, // 15 minutes
      automations: 60000, // 1 minute
      performance: 1800000 // 30 minutes
    },
    thresholds: {
      confidence: 0.7,
      automation: 0.8,
      intervention: 0.6,
      alert: 0.9
    }
  });

  // Refs for intervals and cleanup
  const intervalsRef = useRef({});
  const processesRef = useRef(new Map());

  // Initialize AI engines
  const initializeAI = useCallback(async () => {
    try {
      setAiState(prev => ({ ...prev, isLoading: true, error: null }));

      // Initialize all AI engines
      const engines = {
        advanced: new AdvancedAIEngine(),
        automation: new IntelligentAutomationEngine(),
        customerJourney: new PredictiveCustomerJourneyEngine(),
        revenueIntelligence: new EnhancedRevenueIntelligenceEngine(),
        collaborative: new CollaborativeAIEngine()
      };

      // Wait for all engines to initialize
      await Promise.all([
        engines.advanced.initialize?.(),
        engines.automation.initialize?.(),
        engines.customerJourney.initialize?.(),
        engines.revenueIntelligence.initialize?.(),
        engines.collaborative.initialize?.()
      ]);

      setAiEngines(engines);
      setAiState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false
      }));

      // Start AI processes
      startAIProcesses(engines);

    } catch (error) {
      console.error('AI initialization error:', error);
      setAiState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, []);

  // Start AI background processes
  const startAIProcesses = useCallback((engines) => {
    // Insights update process
    if (aiConfig.enabledFeatures.leadScoring || aiConfig.enabledFeatures.dealPrediction) {
      intervalsRef.current.insights = setInterval(async () => {
        await updateAIInsights(engines);
      }, aiConfig.updateIntervals.insights);
    }

    // Predictions update process
    if (aiConfig.enabledFeatures.revenueForecasting || aiConfig.enabledFeatures.churnPrediction) {
      intervalsRef.current.predictions = setInterval(async () => {
        await updateAIPredictions(engines);
      }, aiConfig.updateIntervals.predictions);
    }

    // Automation process
    if (aiConfig.enabledFeatures.automation) {
      intervalsRef.current.automations = setInterval(async () => {
        await processAutomations(engines);
      }, aiConfig.updateIntervals.automations);
    }

    // Performance monitoring
    if (aiConfig.enabledFeatures.teamOptimization) {
      intervalsRef.current.performance = setInterval(async () => {
        await updatePerformanceMetrics(engines);
      }, aiConfig.updateIntervals.performance);
    }
  }, [aiConfig]);

  // Update AI insights
  const updateAIInsights = useCallback(async (engines) => {
    try {
      const insights = {};

      if (aiConfig.enabledFeatures.leadScoring && engines.advanced) {
        insights.leadScoring = await engines.advanced.generateLeadInsights();
      }

      if (aiConfig.enabledFeatures.dealPrediction && engines.advanced) {
        insights.dealPrediction = await engines.advanced.generateDealInsights();
      }

      if (aiConfig.enabledFeatures.customerBehavior && engines.advanced) {
        insights.customerBehavior = await engines.advanced.generateCustomerInsights();
      }

      if (aiConfig.enabledFeatures.marketIntelligence && engines.revenueIntelligence) {
        insights.marketIntelligence = await engines.revenueIntelligence.analyzeMarketSentiment();
      }

      setAiState(prev => ({
        ...prev,
        insights: { ...prev.insights, ...insights }
      }));

    } catch (error) {
      console.error('AI insights update error:', error);
    }
  }, [aiConfig.enabledFeatures]);

  // Update AI predictions
  const updateAIPredictions = useCallback(async (engines) => {
    try {
      const predictions = {};

      if (aiConfig.enabledFeatures.revenueForecasting && engines.revenueIntelligence) {
        predictions.revenue = await engines.revenueIntelligence.forecastRevenue();
      }

      if (aiConfig.enabledFeatures.churnPrediction && engines.advanced) {
        predictions.churn = await engines.advanced.predictChurn();
      }

      if (aiConfig.enabledFeatures.customerJourney && engines.customerJourney) {
        predictions.customerJourney = await engines.customerJourney.predictJourneyProgression();
      }

      setAiState(prev => ({
        ...prev,
        predictions: { ...prev.predictions, ...predictions }
      }));

    } catch (error) {
      console.error('AI predictions update error:', error);
    }
  }, [aiConfig.enabledFeatures]);

  // Process automations
  const processAutomations = useCallback(async (engines) => {
    try {
      if (!engines.automation) return;

      const automations = await engines.automation.processAutomations();
      
      setAiState(prev => ({
        ...prev,
        automations: { ...prev.automations, ...automations }
      }));

    } catch (error) {
      console.error('Automation processing error:', error);
    }
  }, []);

  // Update performance metrics
  const updatePerformanceMetrics = useCallback(async (engines) => {
    try {
      if (!engines.collaborative) return;

      const performance = await engines.collaborative.getCollaborativeAIAnalytics();
      
      setAiState(prev => ({
        ...prev,
        performance: { ...prev.performance, ...performance }
      }));

    } catch (error) {
      console.error('Performance metrics update error:', error);
    }
  }, []);

  // Lead scoring with advanced AI
  const scoreLeads = useCallback(async (leads) => {
    if (!aiEngines.advanced || !aiConfig.enabledFeatures.leadScoring) {
      return leads;
    }

    try {
      const processId = `lead_scoring_${Date.now()}`;
      setAiState(prev => ({
        ...prev,
        activeProcesses: new Set([...prev.activeProcesses, processId])
      }));

      const scoredLeads = await aiEngines.advanced.scoreLeads(leads);

      setAiState(prev => {
        const newProcesses = new Set(prev.activeProcesses);
        newProcesses.delete(processId);
        return { ...prev, activeProcesses: newProcesses };
      });

      return scoredLeads;

    } catch (error) {
      console.error('Lead scoring error:', error);
      return leads;
    }
  }, [aiEngines.advanced, aiConfig.enabledFeatures.leadScoring]);

  // Deal prediction with ensemble models
  const predictDeals = useCallback(async (deals) => {
    if (!aiEngines.advanced || !aiConfig.enabledFeatures.dealPrediction) {
      return deals;
    }

    try {
      const processId = `deal_prediction_${Date.now()}`;
      setAiState(prev => ({
        ...prev,
        activeProcesses: new Set([...prev.activeProcesses, processId])
      }));

      const predictions = await aiEngines.advanced.predictDeals(deals);

      setAiState(prev => {
        const newProcesses = new Set(prev.activeProcesses);
        newProcesses.delete(processId);
        return { ...prev, activeProcesses: newProcesses };
      });

      return predictions;

    } catch (error) {
      console.error('Deal prediction error:', error);
      return deals;
    }
  }, [aiEngines.advanced, aiConfig.enabledFeatures.dealPrediction]);

  // Customer journey optimization
  const optimizeCustomerJourney = useCallback(async (customerId, context = {}) => {
    if (!aiEngines.customerJourney || !aiConfig.enabledFeatures.customerJourney) {
      return null;
    }

    try {
      const processId = `journey_optimization_${Date.now()}`;
      setAiState(prev => ({
        ...prev,
        activeProcesses: new Set([...prev.activeProcesses, processId])
      }));

      const optimization = await aiEngines.customerJourney.optimizeCustomerJourney(customerId, context);

      setAiState(prev => {
        const newProcesses = new Set(prev.activeProcesses);
        newProcesses.delete(processId);
        return { ...prev, activeProcesses: newProcesses };
      });

      return optimization;

    } catch (error) {
      console.error('Customer journey optimization error:', error);
      return null;
    }
  }, [aiEngines.customerJourney, aiConfig.enabledFeatures.customerJourney]);

  // Revenue optimization
  const optimizeRevenue = useCallback(async (context = {}) => {
    if (!aiEngines.revenueIntelligence || !aiConfig.enabledFeatures.revenueForecasting) {
      return null;
    }

    try {
      const processId = `revenue_optimization_${Date.now()}`;
      setAiState(prev => ({
        ...prev,
        activeProcesses: new Set([...prev.activeProcesses, processId])
      }));

      const optimization = await aiEngines.revenueIntelligence.optimizeRevenue(context);

      setAiState(prev => {
        const newProcesses = new Set(prev.activeProcesses);
        newProcesses.delete(processId);
        return { ...prev, activeProcesses: newProcesses };
      });

      return optimization;

    } catch (error) {
      console.error('Revenue optimization error:', error);
      return null;
    }
  }, [aiEngines.revenueIntelligence, aiConfig.enabledFeatures.revenueForecasting]);

  // Team performance optimization
  const optimizeTeamPerformance = useCallback(async (teamId) => {
    if (!aiEngines.collaborative || !aiConfig.enabledFeatures.teamOptimization) {
      return null;
    }

    try {
      const processId = `team_optimization_${Date.now()}`;
      setAiState(prev => ({
        ...prev,
        activeProcesses: new Set([...prev.activeProcesses, processId])
      }));

      const optimization = await aiEngines.collaborative.analyzeTeamPerformance(teamId);

      setAiState(prev => {
        const newProcesses = new Set(prev.activeProcesses);
        newProcesses.delete(processId);
        return { ...prev, activeProcesses: newProcesses };
      });

      return optimization;

    } catch (error) {
      console.error('Team optimization error:', error);
      return null;
    }
  }, [aiEngines.collaborative, aiConfig.enabledFeatures.teamOptimization]);

  // Intelligent automation
  const createAutomation = useCallback(async (automationConfig) => {
    if (!aiEngines.automation || !aiConfig.enabledFeatures.automation) {
      return null;
    }

    try {
      const processId = `automation_creation_${Date.now()}`;
      setAiState(prev => ({
        ...prev,
        activeProcesses: new Set([...prev.activeProcesses, processId])
      }));

      const automation = await aiEngines.automation.createAutomation(automationConfig);

      setAiState(prev => {
        const newProcesses = new Set(prev.activeProcesses);
        newProcesses.delete(processId);
        return { ...prev, activeProcesses: newProcesses };
      });

      return automation;

    } catch (error) {
      console.error('Automation creation error:', error);
      return null;
    }
  }, [aiEngines.automation, aiConfig.enabledFeatures.automation]);

  // Get AI recommendations
  const getAIRecommendations = useCallback(async (context = {}) => {
    try {
      const recommendations = {};

      if (aiEngines.advanced && aiConfig.enabledFeatures.leadScoring) {
        recommendations.leads = await aiEngines.advanced.getLeadRecommendations(context);
      }

      if (aiEngines.revenueIntelligence && aiConfig.enabledFeatures.revenueForecasting) {
        recommendations.revenue = await aiEngines.revenueIntelligence.getRevenueRecommendations(context);
      }

      if (aiEngines.customerJourney && aiConfig.enabledFeatures.customerJourney) {
        recommendations.customerJourney = await aiEngines.customerJourney.getJourneyRecommendations(context);
      }

      if (aiEngines.collaborative && aiConfig.enabledFeatures.teamOptimization) {
        recommendations.team = await aiEngines.collaborative.getTeamRecommendations(context);
      }

      return recommendations;

    } catch (error) {
      console.error('AI recommendations error:', error);
      return {};
    }
  }, [aiEngines, aiConfig.enabledFeatures]);

  // Update AI configuration
  const updateAIConfig = useCallback((newConfig) => {
    setAiConfig(prev => ({
      ...prev,
      ...newConfig
    }));

    // Restart processes if needed
    if (aiState.isInitialized) {
      Object.values(intervalsRef.current).forEach(clearInterval);
      startAIProcesses(aiEngines);
    }
  }, [aiState.isInitialized, aiEngines, startAIProcesses]);

  // Get AI analytics
  const getAIAnalytics = useCallback(() => {
    const analytics = {
      totalProcesses: aiState.activeProcesses.size,
      insights: Object.keys(aiState.insights).length,
      predictions: Object.keys(aiState.predictions).length,
      automations: Object.keys(aiState.automations).length,
      performance: aiState.performance,
      uptime: aiState.isInitialized ? Date.now() - (aiState.initTime || Date.now()) : 0,
      errorRate: 0, // Calculate based on error tracking
      efficiency: 0 // Calculate based on performance metrics
    };

    return analytics;
  }, [aiState]);

  // Cleanup function
  const cleanup = useCallback(() => {
    Object.values(intervalsRef.current).forEach(clearInterval);
    processesRef.current.clear();
    setAiState(prev => ({
      ...prev,
      activeProcesses: new Set()
    }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAI();
    return cleanup;
  }, [initializeAI, cleanup]);

  // Return hook interface
  return {
    // State
    aiState,
    aiConfig,
    aiEngines,

    // Core AI functions
    scoreLeads,
    predictDeals,
    optimizeCustomerJourney,
    optimizeRevenue,
    optimizeTeamPerformance,
    createAutomation,
    getAIRecommendations,

    // Configuration
    updateAIConfig,

    // Analytics
    getAIAnalytics,

    // Utilities
    isAIReady: aiState.isInitialized && !aiState.isLoading,
    hasActiveProcesses: aiState.activeProcesses.size > 0,
    cleanup
  };
};

export default useAdvancedAI;