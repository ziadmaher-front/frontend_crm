import { useState, useCallback, useEffect } from 'react';
import { predictiveLeadQualification } from '../services/predictiveLeadQualification';
import useEnhancedStore from '../store/enhancedStore';

/**
 * Custom hook for Predictive Lead Qualification functionality
 */
export const usePredictiveLeadQualification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Enhanced store integration
  const {
    leadQualificationData,
    setLeadQualificationData,
    qualificationHistory,
    setQualificationHistory,
    mlPredictions,
    setMLPredictions
  } = useEnhancedStore();

  /**
   * Qualify a single lead
   */
  const qualifyLead = useCallback(async (leadData, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await predictiveLeadQualification.qualifyLead(leadData, options);
      
      // Update store with qualification result
      setLeadQualificationData(prev => ({
        ...prev,
        [leadData.id]: result
      }));
      
      // Add to history
      setQualificationHistory(prev => [result, ...prev.slice(0, 99)]); // Keep last 100
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLeadQualificationData, setQualificationHistory]);

  /**
   * Qualify multiple leads in batch
   */
  const qualifyLeadsBatch = useCallback(async (leads, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await predictiveLeadQualification.qualifyLeadsBatch(leads, options);
      
      // Update store with batch results
      const qualificationMap = {};
      result.results.forEach(qualification => {
        qualificationMap[qualification.leadId] = qualification;
      });
      
      setLeadQualificationData(prev => ({
        ...prev,
        ...qualificationMap
      }));
      
      // Add batch results to history
      setQualificationHistory(prev => [...result.results, ...prev.slice(0, 50)]);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLeadQualificationData, setQualificationHistory]);

  /**
   * Update lead score in real-time
   */
  const updateLeadScoreRealTime = useCallback(async (leadId, newActivity) => {
    try {
      const update = await predictiveLeadQualification.updateLeadScoreRealTime(leadId, newActivity);
      
      // Update store with real-time changes
      setLeadQualificationData(prev => ({
        ...prev,
        [leadId]: {
          ...prev[leadId],
          ...update
        }
      }));
      
      return update;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [setLeadQualificationData]);

  /**
   * Predict conversion probability
   */
  const predictConversion = useCallback(async (leadData, timeframe = '30d') => {
    setLoading(true);
    setError(null);
    
    try {
      const prediction = await predictiveLeadQualification.predictConversion(leadData, timeframe);
      
      // Store ML predictions
      setMLPredictions(prev => ({
        ...prev,
        [leadData.id]: {
          ...prev[leadData.id],
          conversion: prediction
        }
      }));
      
      return prediction;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setMLPredictions]);

  /**
   * Generate nurturing strategy
   */
  const generateNurturingStrategy = useCallback(async (leadData, qualificationResult) => {
    setLoading(true);
    setError(null);
    
    try {
      const strategy = await predictiveLeadQualification.generateNurturingStrategy(leadData, qualificationResult);
      
      // Store nurturing strategies
      setLeadQualificationData(prev => ({
        ...prev,
        [leadData.id]: {
          ...prev[leadData.id],
          nurturingStrategy: strategy
        }
      }));
      
      return strategy;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLeadQualificationData]);

  /**
   * Get lead qualification analytics
   */
  const getQualificationAnalytics = useCallback(() => {
    const qualifications = Object.values(leadQualificationData);
    
    if (qualifications.length === 0) {
      return {
        totalLeads: 0,
        averageScore: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0 },
        conversionPredictions: { high: 0, medium: 0, low: 0 },
        trends: []
      };
    }

    const totalLeads = qualifications.length;
    const averageScore = qualifications.reduce((sum, q) => sum + q.scores.composite, 0) / totalLeads;
    
    const gradeDistribution = qualifications.reduce((acc, q) => {
      acc[q.qualification.grade] = (acc[q.qualification.grade] || 0) + 1;
      return acc;
    }, {});

    const conversionPredictions = qualifications.reduce((acc, q) => {
      const prob = q.predictions?.conversionProbability || 0;
      if (prob >= 70) acc.high++;
      else if (prob >= 40) acc.medium++;
      else acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    // Calculate trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQualifications = qualificationHistory.filter(q => 
      new Date(q.timestamp) >= thirtyDaysAgo
    );

    const trends = this.calculateQualificationTrends(recentQualifications);

    return {
      totalLeads,
      averageScore: Math.round(averageScore),
      gradeDistribution,
      conversionPredictions,
      trends,
      topPerformingCriteria: this.identifyTopCriteria(qualifications),
      improvementAreas: this.identifyImprovementAreas(qualifications)
    };
  }, [leadQualificationData, qualificationHistory]);

  /**
   * Get lead recommendations
   */
  const getLeadRecommendations = useCallback((leadId) => {
    const qualification = leadQualificationData[leadId];
    if (!qualification) return null;

    return {
      nextActions: qualification.nextActions,
      recommendations: qualification.recommendations,
      nurturingStrategy: qualification.nurturingStrategy,
      priority: qualification.qualification.priority,
      timeline: qualification.predictions?.timeToConversion
    };
  }, [leadQualificationData]);

  /**
   * Filter leads by qualification criteria
   */
  const filterLeadsByQualification = useCallback((criteria) => {
    const qualifications = Object.values(leadQualificationData);
    
    return qualifications.filter(q => {
      if (criteria.grade && q.qualification.grade !== criteria.grade) return false;
      if (criteria.minScore && q.scores.composite < criteria.minScore) return false;
      if (criteria.maxScore && q.scores.composite > criteria.maxScore) return false;
      if (criteria.priority && q.qualification.priority !== criteria.priority) return false;
      if (criteria.category && q.qualification.category !== criteria.category) return false;
      return true;
    });
  }, [leadQualificationData]);

  /**
   * Get qualification insights
   */
  const getQualificationInsights = useCallback(() => {
    const analytics = getQualificationAnalytics();
    const insights = [];

    // Score distribution insights
    if (analytics.gradeDistribution.A > analytics.totalLeads * 0.3) {
      insights.push({
        type: 'positive',
        title: 'High Quality Lead Pipeline',
        description: `${Math.round((analytics.gradeDistribution.A / analytics.totalLeads) * 100)}% of leads are Grade A`,
        impact: 'high'
      });
    }

    if (analytics.averageScore < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Average Lead Quality',
        description: `Average lead score is ${analytics.averageScore}. Consider reviewing lead sources.`,
        impact: 'high'
      });
    }

    // Conversion prediction insights
    const highConversionRate = analytics.conversionPredictions.high / analytics.totalLeads;
    if (highConversionRate > 0.4) {
      insights.push({
        type: 'positive',
        title: 'Strong Conversion Pipeline',
        description: `${Math.round(highConversionRate * 100)}% of leads have high conversion probability`,
        impact: 'medium'
      });
    }

    return insights;
  }, [getQualificationAnalytics]);

  /**
   * Export qualification data
   */
  const exportQualificationData = useCallback((format = 'json') => {
    const data = {
      qualifications: leadQualificationData,
      analytics: getQualificationAnalytics(),
      history: qualificationHistory.slice(0, 100), // Last 100 records
      exportDate: new Date().toISOString()
    };

    if (format === 'csv') {
      return this.convertToCSV(Object.values(leadQualificationData));
    }

    return JSON.stringify(data, null, 2);
  }, [leadQualificationData, getQualificationAnalytics, qualificationHistory]);

  // Helper methods
  const calculateQualificationTrends = (qualifications) => {
    // Group by day and calculate average scores
    const dailyScores = {};
    qualifications.forEach(q => {
      const date = new Date(q.timestamp).toDateString();
      if (!dailyScores[date]) {
        dailyScores[date] = { total: 0, count: 0 };
      }
      dailyScores[date].total += q.scores.composite;
      dailyScores[date].count++;
    });

    return Object.entries(dailyScores).map(([date, data]) => ({
      date,
      averageScore: Math.round(data.total / data.count),
      count: data.count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const identifyTopCriteria = (qualifications) => {
    // Analyze which criteria contribute most to high scores
    const criteriaImpact = {
      demographic: 0,
      behavioral: 0,
      intent: 0
    };

    qualifications.forEach(q => {
      if (q.scores.composite >= 80) {
        criteriaImpact.demographic += q.scores.demographic;
        criteriaImpact.behavioral += q.scores.behavioral;
        criteriaImpact.intent += q.scores.intent;
      }
    });

    return Object.entries(criteriaImpact)
      .sort(([,a], [,b]) => b - a)
      .map(([criteria, impact]) => ({ criteria, impact }));
  };

  const identifyImprovementAreas = (qualifications) => {
    // Identify areas where leads consistently score low
    const lowScoreAreas = {
      demographic: 0,
      behavioral: 0,
      intent: 0
    };

    qualifications.forEach(q => {
      if (q.scores.demographic < 50) lowScoreAreas.demographic++;
      if (q.scores.behavioral < 50) lowScoreAreas.behavioral++;
      if (q.scores.intent < 50) lowScoreAreas.intent++;
    });

    return Object.entries(lowScoreAreas)
      .filter(([, count]) => count > 0)
      .sort(([,a], [,b]) => b - a)
      .map(([area, count]) => ({
        area,
        count,
        percentage: Math.round((count / qualifications.length) * 100)
      }));
  };

  const convertToCSV = (qualifications) => {
    const headers = [
      'Lead ID', 'Timestamp', 'Composite Score', 'Demographic Score', 
      'Behavioral Score', 'Intent Score', 'Grade', 'Category', 'Priority',
      'Conversion Probability', 'Churn Risk'
    ];

    const rows = qualifications.map(q => [
      q.leadId,
      q.timestamp,
      q.scores.composite,
      q.scores.demographic,
      q.scores.behavioral,
      q.scores.intent,
      q.qualification.grade,
      q.qualification.category,
      q.qualification.priority,
      q.predictions?.conversionProbability || '',
      q.predictions?.churnRisk || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Initialize real-time updates
  useEffect(() => {
    // Set up real-time qualification monitoring
    const interval = setInterval(() => {
      // Check for leads that need re-qualification
      const staleLeads = Object.values(leadQualificationData).filter(q => {
        const lastUpdate = new Date(q.timestamp);
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        return hoursSinceUpdate > 24; // Re-qualify after 24 hours
      });

      if (staleLeads.length > 0) {
        console.log(`${staleLeads.length} leads need re-qualification`);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [leadQualificationData]);

  return {
    // State
    loading,
    error,
    leadQualificationData,
    qualificationHistory,
    mlPredictions,

    // Actions
    qualifyLead,
    qualifyLeadsBatch,
    updateLeadScoreRealTime,
    predictConversion,
    generateNurturingStrategy,

    // Analytics
    getQualificationAnalytics,
    getLeadRecommendations,
    filterLeadsByQualification,
    getQualificationInsights,

    // Utilities
    exportQualificationData,

    // Clear functions
    clearError: () => setError(null),
    clearData: () => {
      setLeadQualificationData({});
      setQualificationHistory([]);
      setMLPredictions({});
    }
  };
};