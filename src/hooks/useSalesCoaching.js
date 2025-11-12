import { useState, useCallback, useEffect } from 'react';
import { smartSalesCoaching } from '../services/smartSalesCoaching';
import useEnhancedStore from '../store/enhancedStore';

/**
 * Custom hook for Smart Sales Coaching System
 * Provides coaching insights, performance analytics, and skill development tracking
 */
export const useSalesCoaching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coachingData, setCoachingData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [teamAnalytics, setTeamAnalytics] = useState(null);
  const [realTimeCoaching, setRealTimeCoaching] = useState(null);

  const { setData, getData } = useEnhancedStore();

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Analyze sales rep performance
  const analyzePerformance = useCallback(async (repId, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await smartSalesCoaching.analyzePerformance(repId, options);
      setPerformanceData(analysis);
      
      // Store in enhanced store
      setData('salesCoaching', {
        ...getData('salesCoaching'),
        performance: {
          ...getData('salesCoaching')?.performance,
          [repId]: analysis
        }
      });

      return analysis;
    } catch (err) {
      setError(err.message || 'Failed to analyze performance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setData, getData]);

  // Generate coaching plan
  const generateCoachingPlan = useCallback(async (repId, focusAreas = []) => {
    setLoading(true);
    setError(null);

    try {
      const plan = await smartSalesCoaching.generateCoachingPlan(repId, focusAreas);
      setCoachingData(plan);
      
      // Store in enhanced store
      setData('salesCoaching', {
        ...getData('salesCoaching'),
        plans: {
          ...getData('salesCoaching')?.plans,
          [repId]: plan
        }
      });

      return plan;
    } catch (err) {
      setError(err.message || 'Failed to generate coaching plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setData, getData]);

  // Get real-time coaching assistance
  const getRealTimeCoaching = useCallback(async (context) => {
    setLoading(true);
    setError(null);

    try {
      const coaching = await smartSalesCoaching.getRealTimeCoaching(context);
      setRealTimeCoaching(coaching);
      
      return coaching;
    } catch (err) {
      setError(err.message || 'Failed to get real-time coaching');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze team performance
  const analyzeTeamPerformance = useCallback(async (teamId, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await smartSalesCoaching.analyzeTeamPerformance(teamId, options);
      setTeamAnalytics(analysis);
      
      // Store in enhanced store
      setData('salesCoaching', {
        ...getData('salesCoaching'),
        teamAnalytics: {
          ...getData('salesCoaching')?.teamAnalytics,
          [teamId]: analysis
        }
      });

      return analysis;
    } catch (err) {
      setError(err.message || 'Failed to analyze team performance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setData, getData]);

  // Track skill development
  const trackSkillDevelopment = useCallback(async (repId, skillAssessments) => {
    setLoading(true);
    setError(null);

    try {
      const tracking = await smartSalesCoaching.trackSkillDevelopment(repId, skillAssessments);
      
      // Update performance data with skill tracking
      setPerformanceData(prev => prev ? {
        ...prev,
        skillTracking: tracking
      } : null);

      // Store in enhanced store
      setData('salesCoaching', {
        ...getData('salesCoaching'),
        skillTracking: {
          ...getData('salesCoaching')?.skillTracking,
          [repId]: tracking
        }
      });

      return tracking;
    } catch (err) {
      setError(err.message || 'Failed to track skill development');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setData, getData]);

  // Get coaching recommendations
  const getCoachingRecommendations = useCallback(async (repId, currentMetrics) => {
    setLoading(true);
    setError(null);

    try {
      const recommendations = await smartSalesCoaching.getCoachingRecommendations(repId, currentMetrics);
      
      return recommendations;
    } catch (err) {
      setError(err.message || 'Failed to get coaching recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate coaching session
  const simulateCoachingSession = useCallback(async (repId, scenario) => {
    setLoading(true);
    setError(null);

    try {
      const session = await smartSalesCoaching.simulateCoachingSession(repId, scenario);
      
      return session;
    } catch (err) {
      setError(err.message || 'Failed to simulate coaching session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get performance benchmarks
  const getPerformanceBenchmarks = useCallback(async (role, region) => {
    setLoading(true);
    setError(null);

    try {
      const benchmarks = await smartSalesCoaching.getPerformanceBenchmarks(role, region);
      
      return benchmarks;
    } catch (err) {
      setError(err.message || 'Failed to get performance benchmarks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate skill assessment
  const generateSkillAssessment = useCallback(async (repId, skillAreas) => {
    setLoading(true);
    setError(null);

    try {
      const assessment = await smartSalesCoaching.generateSkillAssessment(repId, skillAreas);
      
      return assessment;
    } catch (err) {
      setError(err.message || 'Failed to generate skill assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = getData('salesCoaching');
    if (cachedData) {
      if (cachedData.performance) {
        // Load most recent performance data
        const performances = Object.values(cachedData.performance);
        if (performances.length > 0) {
          setPerformanceData(performances[performances.length - 1]);
        }
      }
      if (cachedData.plans) {
        // Load most recent coaching plan
        const plans = Object.values(cachedData.plans);
        if (plans.length > 0) {
          setCoachingData(plans[plans.length - 1]);
        }
      }
      if (cachedData.teamAnalytics) {
        // Load most recent team analytics
        const analytics = Object.values(cachedData.teamAnalytics);
        if (analytics.length > 0) {
          setTeamAnalytics(analytics[analytics.length - 1]);
        }
      }
    }
  }, [getData]);

  return {
    // State
    loading,
    error,
    coachingData,
    performanceData,
    teamAnalytics,
    realTimeCoaching,

    // Actions
    analyzePerformance,
    generateCoachingPlan,
    getRealTimeCoaching,
    analyzeTeamPerformance,
    trackSkillDevelopment,
    getCoachingRecommendations,
    simulateCoachingSession,
    getPerformanceBenchmarks,
    generateSkillAssessment,
    clearError
  };
};