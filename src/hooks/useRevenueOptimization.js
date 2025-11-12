// Revenue Optimization Hook
// React hook for integrating Intelligent Revenue Engine with UI components

import { useState, useCallback, useEffect, useMemo } from 'react';
import { intelligentRevenueEngine } from '../services/intelligentRevenueEngine';
import useEnhancedStore from '../store/enhancedStore';

export const useRevenueOptimization = () => {
  const store = useEnhancedStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState(new Map());

  // Get deals and related data from store
  const deals = store.data.deals || [];
  const customers = store.data.accounts || [];
  const historicalData = store.data.analytics?.revenue || [];

  // Clear error when component unmounts or data changes
  useEffect(() => {
    setError(null);
  }, [deals.length, customers.length]);

  // Memoized revenue metrics
  const revenueMetrics = useMemo(() => {
    const totalPipeline = deals.reduce((sum, deal) => sum + (deal.value || deal.amount || 0), 0);
    const weightedPipeline = deals.reduce((sum, deal) => 
      sum + (deal.value || deal.amount || 0) * (deal.probability || 0.5), 0
    );
    const averageDealSize = deals.length > 0 ? totalPipeline / deals.length : 0;
    const conversionRate = deals.filter(deal => deal.stage === 'closed-won').length / Math.max(deals.length, 1);

    return {
      totalPipeline,
      weightedPipeline,
      averageDealSize,
      conversionRate,
      dealCount: deals.length,
      activeDeals: deals.filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage)).length
    };
  }, [deals]);

  // Calculate optimal pricing for a deal
  const calculateOptimalPricing = useCallback(async (dealId, context = {}) => {
    const cacheKey = `pricing_${dealId}_${JSON.stringify(context)}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    setLoading(true);
    setError(null);

    try {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) {
        throw new Error('Deal not found');
      }

      // Get customer information for context
      const customer = customers.find(c => c.id === deal.account_id);
      const customerTier = customer?.tier || customer?.type || 'standard';

      const enhancedContext = {
        customerTier,
        ...context
      };

      const result = await intelligentRevenueEngine.calculateOptimalPricing(deal, enhancedContext);
      
      if (result.success) {
        // Cache the result for 5 minutes
        setCache(prev => new Map(prev.set(cacheKey, result)));
        setTimeout(() => {
          setCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(cacheKey);
            return newCache;
          });
        }, 5 * 60 * 1000);

        // Update store with pricing insights
        store.actions.updateItem('deals', dealId, {
          ...deal,
          pricing_analysis: result.data,
          last_pricing_update: new Date().toISOString()
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to calculate optimal pricing';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [deals, customers, cache, store.actions]);

  // Generate revenue forecast
  const generateRevenueForecast = useCallback(async (options = {}) => {
    const cacheKey = `forecast_${JSON.stringify(options)}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    setLoading(true);
    setError(null);

    try {
      const result = await intelligentRevenueEngine.generateRevenueForecast(
        deals,
        historicalData,
        options
      );

      if (result.success) {
        // Cache the result for 15 minutes
        setCache(prev => new Map(prev.set(cacheKey, result)));
        setTimeout(() => {
          setCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(cacheKey);
            return newCache;
          });
        }, 15 * 60 * 1000);

        // Update store with forecast data
        store.actions.setData('analytics', {
          ...store.data.analytics,
          revenue_forecast: result.data,
          last_forecast_update: new Date().toISOString()
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate revenue forecast';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [deals, historicalData, cache, store.actions, store.data.analytics]);

  // Optimize revenue strategy
  const optimizeRevenueStrategy = useCallback(async (targets, constraints = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await intelligentRevenueEngine.optimizeRevenueStrategy(
        deals,
        targets,
        constraints
      );

      if (result.success) {
        // Update store with optimization strategy
        store.actions.setData('analytics', {
          ...store.data.analytics,
          revenue_optimization: result.data,
          last_optimization_update: new Date().toISOString()
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to optimize revenue strategy';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [deals, store.actions, store.data.analytics]);

  // Optimize customer lifetime value
  const optimizeCustomerLifetimeValue = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);

    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const customerDeals = deals.filter(d => d.account_id === customerId);
      const customerInteractions = store.data.activities?.filter(a => a.account_id === customerId) || [];

      const result = await intelligentRevenueEngine.optimizeCustomerLifetimeValue(
        customer,
        customerDeals,
        customerInteractions
      );

      if (result.success) {
        // Update customer record with CLV optimization data
        store.actions.updateItem('accounts', customerId, {
          ...customer,
          clv_optimization: result.data,
          last_clv_update: new Date().toISOString()
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to optimize customer lifetime value';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [customers, deals, store.data.activities, store.actions]);

  // Get pricing recommendations for multiple deals
  const getBulkPricingRecommendations = useCallback(async (dealIds, context = {}) => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        dealIds.map(dealId => calculateOptimalPricing(dealId, context))
      );

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: true,
        data: {
          successful,
          failed,
          summary: {
            total: dealIds.length,
            processed: successful.length,
            failed: failed.length,
            totalOptimization: successful.reduce((sum, r) => {
              const current = r.data?.currentPrice || 0;
              const optimal = r.data?.optimalPrice || 0;
              return sum + (optimal - current);
            }, 0)
          }
        }
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to get bulk pricing recommendations';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [calculateOptimalPricing]);

  // Get revenue insights and alerts
  const getRevenueInsights = useCallback(() => {
    const insights = [];
    const alerts = [];

    // Pipeline health insights
    if (revenueMetrics.conversionRate < 0.2) {
      alerts.push({
        type: 'warning',
        category: 'conversion',
        message: 'Low conversion rate detected. Consider reviewing qualification process.',
        impact: 'high',
        recommendation: 'Implement better lead qualification and sales coaching.'
      });
    }

    if (revenueMetrics.averageDealSize < 10000) {
      insights.push({
        type: 'opportunity',
        category: 'deal_size',
        message: 'Average deal size is below target. Consider upselling strategies.',
        potential: 'medium',
        action: 'Focus on value-based selling and solution bundling.'
      });
    }

    // Seasonal insights
    const currentMonth = new Date().getMonth();
    if ([11, 0, 1].includes(currentMonth)) { // Q4/Q1 transition
      insights.push({
        type: 'seasonal',
        category: 'timing',
        message: 'End-of-year budget cycles may create pricing opportunities.',
        potential: 'high',
        action: 'Leverage budget urgency for premium pricing.'
      });
    }

    return {
      insights,
      alerts,
      metrics: revenueMetrics,
      recommendations: [
        ...insights.map(i => i.action),
        ...alerts.map(a => a.recommendation)
      ].filter(Boolean)
    };
  }, [revenueMetrics]);

  // Clear cache manually
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    // State
    loading,
    error,
    revenueMetrics,
    
    // Actions
    calculateOptimalPricing,
    generateRevenueForecast,
    optimizeRevenueStrategy,
    optimizeCustomerLifetimeValue,
    getBulkPricingRecommendations,
    
    // Insights
    getRevenueInsights,
    
    // Utilities
    clearCache,
    
    // Cache info
    cacheSize: cache.size
  };
};

export default useRevenueOptimization;