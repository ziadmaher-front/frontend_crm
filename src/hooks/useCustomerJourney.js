import { useState, useEffect, useCallback, useMemo } from 'react';
import customerJourneyIntelligence from '@/services/customerJourneyIntelligence';
import useEnhancedStore from '@/store/enhancedStore';

/**
 * Custom hook for Customer Journey Intelligence
 * Provides comprehensive customer journey analytics and insights
 */
export const useCustomerJourney = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [personalization, setPersonalization] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);

  const { data, setData, setLoading: setStoreLoading, setError: setStoreError } = useEnhancedStore();

  // Initialize Customer Journey Intelligence service
  const journeyService = useMemo(() => customerJourneyIntelligence, []);

  /**
   * Analyze customer journey for a specific customer
   */
  const analyzeCustomerJourney = useCallback(async (customerId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      setStoreLoading('customerJourney', true);

      const analysis = await journeyService.analyzeCustomerJourney(customerId, options);
      setJourneyData(analysis);
      
      // Store in enhanced store
      setData('customerJourneys', prev => ({
        ...prev,
        [customerId]: analysis
      }));

      return analysis;
    } catch (err) {
      const errorMessage = err.message || 'Failed to analyze customer journey';
      setError(errorMessage);
      setStoreError('customerJourney', errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setStoreLoading('customerJourney', false);
    }
  }, [journeyService, setData, setStoreLoading, setStoreError]);

  /**
   * Analyze multiple customers for cohort analysis
   */
  const analyzeCohort = useCallback(async (customerIds, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const cohortAnalysis = await journeyService.analyzeCohort(customerIds, options);
      setInsights(cohortAnalysis);

      return cohortAnalysis;
    } catch (err) {
      const errorMessage = err.message || 'Failed to analyze customer cohort';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  /**
   * Get real-time journey monitoring
   */
  const startRealTimeMonitoring = useCallback(async (customerId) => {
    try {
      setLoading(true);
      setError(null);

      const monitoring = await journeyService.getRealTimeMonitoring(customerId);
      setRealTimeMetrics(monitoring);

      return monitoring;
    } catch (err) {
      const errorMessage = err.message || 'Failed to start real-time monitoring';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  /**
   * Generate personalization strategy
   */
  const generatePersonalization = useCallback(async (customerId, context = {}) => {
    try {
      setLoading(true);
      setError(null);

      const strategy = await journeyService.generatePersonalizationStrategy(customerId, context);
      setPersonalization(strategy);

      return strategy;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate personalization strategy';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  /**
   * Get journey stage predictions
   */
  const predictNextStage = useCallback(async (customerId, currentStage) => {
    try {
      setLoading(true);
      setError(null);

      const predictions = await journeyService.predictNextStage(customerId, currentStage);
      return predictions;
    } catch (err) {
      const errorMessage = err.message || 'Failed to predict next stage';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  /**
   * Calculate journey metrics
   */
  const calculateJourneyMetrics = useCallback(async (journeyData) => {
    try {
      const metrics = await journeyService.calculateJourneyMetrics(journeyData);
      return metrics;
    } catch (err) {
      const errorMessage = err.message || 'Failed to calculate journey metrics';
      setError(errorMessage);
      throw err;
    }
  }, [journeyService]);

  /**
   * Get behavioral insights
   */
  const getBehavioralInsights = useCallback(async (customerId, timeframe = '30d') => {
    try {
      setLoading(true);
      setError(null);

      const behavioralData = {
        customerId,
        timeframe,
        interactions: data.interactions?.[customerId] || [],
        touchpoints: data.touchpoints?.[customerId] || []
      };

      const insights = await journeyService.analyzeBehavioralPatterns(behavioralData);
      return insights;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get behavioral insights';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyService, data]);

  /**
   * Optimize journey touchpoints
   */
  const optimizeTouchpoints = useCallback(async (journeyId, optimizationGoals = []) => {
    try {
      setLoading(true);
      setError(null);

      const optimization = await journeyService.optimizeTouchpoints(journeyId, optimizationGoals);
      return optimization;
    } catch (err) {
      const errorMessage = err.message || 'Failed to optimize touchpoints';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  /**
   * Get journey recommendations
   */
  const getJourneyRecommendations = useCallback(async (customerId, context = {}) => {
    try {
      setLoading(true);
      setError(null);

      const recommendations = await journeyService.getJourneyRecommendations(customerId, context);
      return recommendations;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get journey recommendations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setStoreError('customerJourney', null);
  }, [setStoreError]);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setJourneyData(null);
    setInsights(null);
    setPersonalization(null);
    setRealTimeMetrics(null);
    setError(null);
    setLoading(false);
  }, []);

  // Computed values
  const hasJourneyData = Boolean(journeyData);
  const hasInsights = Boolean(insights);
  const hasPersonalization = Boolean(personalization);
  const hasRealTimeData = Boolean(realTimeMetrics);

  return {
    // State
    loading,
    error,
    journeyData,
    insights,
    personalization,
    realTimeMetrics,

    // Computed
    hasJourneyData,
    hasInsights,
    hasPersonalization,
    hasRealTimeData,

    // Actions
    analyzeCustomerJourney,
    analyzeCohort,
    startRealTimeMonitoring,
    generatePersonalization,
    predictNextStage,
    calculateJourneyMetrics,
    getBehavioralInsights,
    optimizeTouchpoints,
    getJourneyRecommendations,
    clearError,
    reset,

    // Service instance for advanced usage
    journeyService
  };
};

export default useCustomerJourney;