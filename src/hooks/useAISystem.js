// AI System Integration Hook
// Provides React components with easy access to AI system capabilities

import { useState, useEffect, useCallback, useRef } from 'react';
import aiSystemIntegration from '../services/aiSystemIntegration.js';

/**
 * Custom hook for AI System Integration
 * Provides state management and real-time updates for AI system status and operations
 */
export const useAISystem = (options = {}) => {
  const [systemStatus, setSystemStatus] = useState({
    isReady: false,
    status: 'initializing',
    engines: {},
    performance: {},
    cache: {},
    lastUpdated: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  
  const eventListenersRef = useRef(new Map());
  const requestQueueRef = useRef([]);
  const isInitializedRef = useRef(false);

  // Configuration options
  const config = {
    autoRefresh: options.autoRefresh !== false,
    refreshInterval: options.refreshInterval || 5000,
    enableRealTimeUpdates: options.enableRealTimeUpdates !== false,
    ...options
  };

  /**
   * Initialize AI system and setup event listeners
   */
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait for system initialization if not ready
        if (!aiSystemIntegration.isReady()) {
          await new Promise((resolve) => {
            const checkReady = () => {
              if (aiSystemIntegration.isReady()) {
                resolve();
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          });
        }

        // Setup event listeners
        setupEventListeners();

        // Get initial status
        const status = aiSystemIntegration.getSystemStatus();
        setSystemStatus({
          isReady: aiSystemIntegration.isReady(),
          ...status
        });

        isInitializedRef.current = true;
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to initialize AI system hook:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeSystem();

    // Cleanup on unmount
    return () => {
      cleanupEventListeners();
    };
  }, []);

  /**
   * Setup real-time event listeners
   */
  const setupEventListeners = useCallback(() => {
    if (!config.enableRealTimeUpdates) return;

    const listeners = [
      {
        event: 'system:initialized',
        handler: () => {
          setSystemStatus(prev => ({
            ...prev,
            isReady: true,
            status: 'healthy'
          }));
        }
      },
      {
        event: 'health:check',
        handler: (healthData) => {
          setSystemStatus(prev => ({
            ...prev,
            ...healthData,
            isReady: aiSystemIntegration.isReady()
          }));
        }
      },
      {
        event: 'metrics:collected',
        handler: (metricsData) => {
          setMetrics(metricsData);
          setSystemStatus(prev => ({
            ...prev,
            performance: metricsData
          }));
        }
      },
      {
        event: 'request:success',
        handler: (data) => {
          // Update success metrics
          setMetrics(prev => ({
            ...prev,
            lastSuccessfulRequest: data
          }));
        }
      },
      {
        event: 'request:error',
        handler: (data) => {
          // Update error metrics
          setMetrics(prev => ({
            ...prev,
            lastError: data
          }));
        }
      },
      {
        event: 'system:optimized',
        handler: () => {
          // Refresh status after optimization
          refreshSystemStatus();
        }
      }
    ];

    // Register listeners
    listeners.forEach(({ event, handler }) => {
      aiSystemIntegration.on(event, handler);
      eventListenersRef.current.set(event, handler);
    });
  }, [config.enableRealTimeUpdates]);

  /**
   * Cleanup event listeners
   */
  const cleanupEventListeners = useCallback(() => {
    // Note: In a real implementation, you'd need an off method in aiSystemIntegration
    eventListenersRef.current.clear();
  }, []);

  /**
   * Auto-refresh system status
   */
  useEffect(() => {
    if (!config.autoRefresh || !isInitializedRef.current) return;

    const interval = setInterval(() => {
      refreshSystemStatus();
    }, config.refreshInterval);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshInterval]);

  /**
   * Refresh system status
   */
  const refreshSystemStatus = useCallback(async () => {
    try {
      const status = aiSystemIntegration.getSystemStatus();
      setSystemStatus({
        isReady: aiSystemIntegration.isReady(),
        ...status
      });
    } catch (err) {
      console.error('Failed to refresh system status:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Process AI request
   */
  const processRequest = useCallback(async (type, data, requestOptions = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await aiSystemIntegration.processRequest(type, data, requestOptions);
      
      setIsLoading(false);
      return result;

    } catch (err) {
      console.error('AI request failed:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Process batch requests
   */
  const processBatch = useCallback(async (requests, batchOptions = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await aiSystemIntegration.processBatch(requests, batchOptions);
      
      setIsLoading(false);
      return result;

    } catch (err) {
      console.error('Batch processing failed:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Get specific engine
   */
  const getEngine = useCallback((engineName) => {
    return aiSystemIntegration.getEngine(engineName);
  }, []);

  /**
   * Optimize system
   */
  const optimizeSystem = useCallback(async () => {
    try {
      setIsLoading(true);
      await aiSystemIntegration.optimizeSystem();
      await refreshSystemStatus();
      setIsLoading(false);
    } catch (err) {
      console.error('System optimization failed:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [refreshSystemStatus]);

  /**
   * Perform health check
   */
  const performHealthCheck = useCallback(async () => {
    try {
      await aiSystemIntegration.performHealthCheck();
      await refreshSystemStatus();
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message);
    }
  }, [refreshSystemStatus]);

  // Convenience methods for common AI operations
  const aiOperations = {
    // Lead operations
    scoreLead: useCallback((leadData, options) => 
      processRequest('lead:score', leadData, options), [processRequest]),
    
    qualifyLead: useCallback((leadData, options) => 
      processRequest('lead:qualify', leadData, options), [processRequest]),
    
    enrichLead: useCallback((leadData, options) => 
      processRequest('lead:enrich', leadData, options), [processRequest]),

    // Deal operations
    predictDeal: useCallback((dealData, options) => 
      processRequest('deal:predict', dealData, options), [processRequest]),
    
    optimizeDeal: useCallback((dealData, options) => 
      processRequest('deal:optimize', dealData, options), [processRequest]),
    
    forecastDeal: useCallback((dealData, options) => 
      processRequest('deal:forecast', dealData, options), [processRequest]),

    // Customer operations
    analyzeCustomer: useCallback((customerData, options) => 
      processRequest('customer:analyze', customerData, options), [processRequest]),
    
    mapCustomerJourney: useCallback((customerData, options) => 
      processRequest('customer:journey', customerData, options), [processRequest]),
    
    segmentCustomer: useCallback((customerData, options) => 
      processRequest('customer:segment', customerData, options), [processRequest]),

    // Automation operations
    triggerAutomation: useCallback((automationData, options) => 
      processRequest('automation:trigger', automationData, options), [processRequest]),
    
    executeWorkflow: useCallback((workflowData, options) => 
      processRequest('automation:workflow', workflowData, options), [processRequest]),

    // Team operations
    generateTeamInsights: useCallback((teamData, options) => 
      processRequest('team:insights', teamData, options), [processRequest]),
    
    getTeamRecommendations: useCallback((teamData, options) => 
      processRequest('team:recommendations', teamData, options), [processRequest]),

    // Revenue operations
    forecastRevenue: useCallback((revenueData, options) => 
      processRequest('revenue:forecast', revenueData, options), [processRequest]),
    
    optimizeRevenue: useCallback((revenueData, options) => 
      processRequest('revenue:optimize', revenueData, options), [processRequest]),
    
    analyzeRevenue: useCallback((revenueData, options) => 
      processRequest('revenue:analyze', revenueData, options), [processRequest])
  };

  return {
    // System state
    systemStatus,
    isLoading,
    error,
    metrics,
    isReady: systemStatus.isReady,

    // Core operations
    processRequest,
    processBatch,
    getEngine,

    // System management
    refreshSystemStatus,
    optimizeSystem,
    performHealthCheck,

    // Convenience operations
    ...aiOperations,

    // Utilities
    clearError: useCallback(() => setError(null), []),
    
    // Advanced features
    getEngineStatus: useCallback((engineName) => 
      systemStatus.engines?.[engineName] || {}, [systemStatus.engines]),
    
    getCacheStats: useCallback(() => 
      systemStatus.cache || {}, [systemStatus.cache]),
    
    getPerformanceMetrics: useCallback(() => 
      systemStatus.performance || {}, [systemStatus.performance])
  };
};

/**
 * Hook for specific AI engine access
 */
export const useAIEngine = (engineName, options = {}) => {
  const aiSystem = useAISystem(options);
  const [engine, setEngine] = useState(null);
  const [engineStatus, setEngineStatus] = useState({});

  useEffect(() => {
    if (aiSystem.isReady) {
      const engineInstance = aiSystem.getEngine(engineName);
      setEngine(engineInstance);
      setEngineStatus(aiSystem.getEngineStatus(engineName));
    }
  }, [aiSystem.isReady, engineName, aiSystem]);

  return {
    engine,
    engineStatus,
    isReady: aiSystem.isReady && engine !== null,
    ...aiSystem
  };
};

/**
 * Hook for AI performance monitoring
 */
export const useAIPerformance = (options = {}) => {
  const aiSystem = useAISystem({
    ...options,
    enableRealTimeUpdates: true,
    autoRefresh: true,
    refreshInterval: options.refreshInterval || 2000
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);
  const maxHistoryLength = options.maxHistoryLength || 50;

  // Track performance history
  useEffect(() => {
    if (aiSystem.metrics && Object.keys(aiSystem.metrics).length > 0) {
      setPerformanceHistory(prev => {
        const newHistory = [...prev, {
          timestamp: new Date(),
          ...aiSystem.metrics
        }];
        
        // Keep only recent history
        return newHistory.slice(-maxHistoryLength);
      });
    }
  }, [aiSystem.metrics, maxHistoryLength]);

  return {
    ...aiSystem,
    performanceHistory,
    currentMetrics: aiSystem.metrics,
    clearHistory: useCallback(() => setPerformanceHistory([]), [])
  };
};

export default useAISystem;