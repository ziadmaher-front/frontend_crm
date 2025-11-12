// AI System Integration Service
// Comprehensive orchestration and management of all AI engines and capabilities

import { aiCacheService } from './aiCacheService.js';
import { performanceOptimizer, AIPerformanceConfig } from '../config/aiPerformanceConfig.js';
import AdvancedAIEngine from './advancedAIEngine.js';
import IntelligentAutomationEngine from './intelligentAutomationEngine.js';
import PredictiveCustomerJourneyEngine from './predictiveCustomerJourney.js';
import EnhancedRevenueIntelligenceEngine from './enhancedRevenueIntelligence.js';
import CollaborativeAIEngine from './collaborativeAIEngine.js';

/**
 * AI System Integration Service
 * Provides unified access to all AI capabilities with intelligent orchestration
 */
class AISystemIntegration {
  constructor() {
    this.engines = new Map();
    this.isInitialized = false;
    this.systemHealth = {
      status: 'initializing',
      engines: {},
      performance: {},
      lastCheck: null
    };
    this.eventListeners = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
    
    // Initialize performance monitoring
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      engineUtilization: {},
      cacheEfficiency: 0
    };
    
    this.initialize();
  }

  /**
   * Initialize all AI engines and system components
   */
  async initialize() {
    try {
      console.log('🚀 Initializing AI System Integration...');
      
      // Initialize cache service
      await aiCacheService.initialize();
      
      // Initialize performance optimizer
      performanceOptimizer.initialize();
      
      // Initialize AI engines
      await this.initializeEngines();
      
      // Setup system monitoring
      this.setupSystemMonitoring();
      
      // Setup event handling
      this.setupEventHandling();
      
      this.isInitialized = true;
      this.systemHealth.status = 'healthy';
      
      console.log('✅ AI System Integration initialized successfully');
      this.emit('system:initialized', { timestamp: new Date() });
      
    } catch (error) {
      console.error('❌ Failed to initialize AI System Integration:', error);
      this.systemHealth.status = 'error';
      throw error;
    }
  }

  /**
   * Initialize all AI engines
   */
  async initializeEngines() {
    const engineConfigs = [
      {
        name: 'advanced',
        class: AdvancedAIEngine,
        config: AIPerformanceConfig.engines.advanced
      },
      {
        name: 'automation',
        class: IntelligentAutomationEngine,
        config: AIPerformanceConfig.engines.automation
      },
      {
        name: 'customerJourney',
        class: PredictiveCustomerJourneyEngine,
        config: AIPerformanceConfig.engines.customerJourney
      },
      {
        name: 'revenue',
        class: EnhancedRevenueIntelligenceEngine,
        config: AIPerformanceConfig.engines.revenue
      },
      {
        name: 'collaborative',
        class: CollaborativeAIEngine,
        config: AIPerformanceConfig.engines.collaborative
      }
    ];

    for (const engineConfig of engineConfigs) {
      try {
        console.log(`Initializing ${engineConfig.name} engine...`);
        
        const engine = new engineConfig.class(engineConfig.config);
        await engine.initialize?.();
        
        this.engines.set(engineConfig.name, engine);
        this.systemHealth.engines[engineConfig.name] = 'healthy';
        this.performanceMetrics.engineUtilization[engineConfig.name] = 0;
        
        console.log(`✅ ${engineConfig.name} engine initialized`);
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${engineConfig.name} engine:`, error);
        this.systemHealth.engines[engineConfig.name] = 'error';
      }
    }
  }

  /**
   * Setup system monitoring and health checks
   */
  setupSystemMonitoring() {
    // Health check interval
    setInterval(() => {
      this.performHealthCheck();
    }, AIPerformanceConfig.monitoring.healthCheckInterval);

    // Performance metrics collection
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, AIPerformanceConfig.monitoring.metricsInterval);

    // Cache optimization
    setInterval(() => {
      this.optimizeSystem();
    }, AIPerformanceConfig.optimization.cacheOptimizationInterval);
  }

  /**
   * Setup event handling system
   */
  setupEventHandling() {
    // Engine event forwarding
    for (const [name, engine] of this.engines) {
      if (engine.on) {
        engine.on('*', (event, data) => {
          this.emit(`engine:${name}:${event}`, data);
        });
      }
    }
  }

  /**
   * Unified AI processing with intelligent routing
   */
  async processRequest(type, data, options = {}) {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      // Validate request
      if (!this.isInitialized) {
        throw new Error('AI System not initialized');
      }

      // Route request to appropriate engine
      const result = await this.routeRequest(type, data, options);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(true, responseTime);
      
      // Emit success event
      this.emit('request:success', { type, responseTime, result });
      
      return result;
      
    } catch (error) {
      // Update error metrics
      this.updatePerformanceMetrics(false, Date.now() - startTime);
      
      // Emit error event
      this.emit('request:error', { type, error: error.message });
      
      throw error;
    }
  }

  /**
   * Intelligent request routing
   */
  async routeRequest(type, data, options) {
    const routingMap = {
      // Lead processing
      'lead:score': 'advanced',
      'lead:qualify': 'advanced',
      'lead:enrich': 'advanced',
      
      // Deal processing
      'deal:predict': 'advanced',
      'deal:optimize': 'revenue',
      'deal:forecast': 'revenue',
      
      // Customer analysis
      'customer:analyze': 'advanced',
      'customer:journey': 'customerJourney',
      'customer:segment': 'customerJourney',
      
      // Automation
      'automation:trigger': 'automation',
      'automation:workflow': 'automation',
      'automation:schedule': 'automation',
      
      // Collaboration
      'team:insights': 'collaborative',
      'team:recommendations': 'collaborative',
      'team:performance': 'collaborative',
      
      // Revenue intelligence
      'revenue:forecast': 'revenue',
      'revenue:optimize': 'revenue',
      'revenue:analyze': 'revenue'
    };

    const engineName = routingMap[type];
    if (!engineName) {
      throw new Error(`Unknown request type: ${type}`);
    }

    const engine = this.engines.get(engineName);
    if (!engine) {
      throw new Error(`Engine not available: ${engineName}`);
    }

    // Update engine utilization
    this.performanceMetrics.engineUtilization[engineName]++;

    // Process request based on type
    return await this.executeEngineMethod(engine, type, data, options);
  }

  /**
   * Execute specific engine method
   */
  async executeEngineMethod(engine, type, data, options) {
    const methodMap = {
      'lead:score': 'calculateAdvancedLeadScore',
      'lead:qualify': 'qualifyLead',
      'lead:enrich': 'enrichLeadData',
      'deal:predict': 'dealPrediction',
      'deal:optimize': 'optimizeDeal',
      'customer:analyze': 'analyzeCustomerBehavior',
      'automation:trigger': 'triggerAutomation',
      'automation:workflow': 'executeWorkflow',
      'team:insights': 'generateTeamInsights',
      'revenue:forecast': 'forecastRevenue'
    };

    const methodName = methodMap[type];
    if (!methodName || typeof engine[methodName] !== 'function') {
      throw new Error(`Method not available: ${methodName} on engine`);
    }

    return await engine[methodName](data, options);
  }

  /**
   * Batch processing with intelligent load balancing
   */
  async processBatch(requests, options = {}) {
    const batchSize = options.batchSize || AIPerformanceConfig.batchProcessing.defaultBatchSize;
    const maxConcurrency = options.maxConcurrency || AIPerformanceConfig.batchProcessing.maxConcurrency;
    
    const results = [];
    const errors = [];
    
    // Process in chunks
    for (let i = 0; i < requests.length; i += batchSize) {
      const chunk = requests.slice(i, i + batchSize);
      
      // Process chunk with concurrency limit
      const chunkPromises = chunk.map(async (request, index) => {
        try {
          const result = await this.processRequest(request.type, request.data, request.options);
          return { index: i + index, result, success: true };
        } catch (error) {
          return { index: i + index, error: error.message, success: false };
        }
      });
      
      // Wait for chunk completion
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      // Collect results
      chunkResults.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            results.push(result.value);
          } else {
            errors.push(result.value);
          }
        } else {
          errors.push({ error: result.reason.message, success: false });
        }
      });
      
      // Throttle between chunks
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, AIPerformanceConfig.batchProcessing.throttleDelay));
      }
    }
    
    return {
      results,
      errors,
      totalProcessed: requests.length,
      successCount: results.length,
      errorCount: errors.length,
      successRate: (results.length / requests.length) * 100
    };
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    return {
      ...this.systemHealth,
      performance: this.performanceMetrics,
      engines: Object.fromEntries(
        Array.from(this.engines.entries()).map(([name, engine]) => [
          name,
          {
            status: this.systemHealth.engines[name],
            performance: engine.getPerformanceMetrics?.() || {},
            health: engine.getHealthStatus?.() || {}
          }
        ])
      ),
      cache: aiCacheService.getStatistics(),
      lastUpdated: new Date()
    };
  }

  /**
   * Perform system health check
   */
  async performHealthCheck() {
    try {
      const healthResults = {};
      
      // Check each engine
      for (const [name, engine] of this.engines) {
        try {
          const health = await engine.healthCheck?.() || { status: 'unknown' };
          healthResults[name] = health.status;
        } catch (error) {
          healthResults[name] = 'error';
        }
      }
      
      // Check cache service
      const cacheHealth = aiCacheService.healthCheck();
      
      // Update system health
      this.systemHealth = {
        status: Object.values(healthResults).every(status => status === 'healthy') ? 'healthy' : 'degraded',
        engines: healthResults,
        cache: cacheHealth,
        lastCheck: new Date()
      };
      
      this.emit('health:check', this.systemHealth);
      
    } catch (error) {
      console.error('Health check failed:', error);
      this.systemHealth.status = 'error';
    }
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    // Calculate cache efficiency
    const cacheStats = aiCacheService.getStatistics();
    const totalHits = Object.values(cacheStats).reduce((sum, stat) => sum + (stat.hits || 0), 0);
    const totalRequests = Object.values(cacheStats).reduce((sum, stat) => sum + (stat.hits || 0) + (stat.misses || 0), 0);
    
    this.performanceMetrics.cacheEfficiency = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
    
    // Update average response time
    if (this.performanceMetrics.totalRequests > 0) {
      // This would be calculated from actual response times in a real implementation
      this.performanceMetrics.averageResponseTime = this.calculateAverageResponseTime();
    }
    
    this.emit('metrics:collected', this.performanceMetrics);
  }

  /**
   * Optimize system performance
   */
  async optimizeSystem() {
    try {
      // Optimize cache
      await aiCacheService.optimize();
      
      // Optimize engines
      for (const [name, engine] of this.engines) {
        if (engine.optimize) {
          await engine.optimize();
        }
      }
      
      // Run performance optimizer
      performanceOptimizer.optimize();
      
      this.emit('system:optimized', { timestamp: new Date() });
      
    } catch (error) {
      console.error('System optimization failed:', error);
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(success, responseTime) {
    if (success) {
      this.performanceMetrics.successfulRequests++;
    } else {
      this.performanceMetrics.failedRequests++;
    }
    
    // Update average response time (simple moving average)
    const totalRequests = this.performanceMetrics.successfulRequests + this.performanceMetrics.failedRequests;
    this.performanceMetrics.averageResponseTime = 
      (this.performanceMetrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    // In a real implementation, this would use actual response time data
    return this.performanceMetrics.averageResponseTime || 0;
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event listener error for ${event}:`, error);
      }
    });
  }

  /**
   * Shutdown system gracefully
   */
  async shutdown() {
    try {
      console.log('🔄 Shutting down AI System Integration...');
      
      // Stop processing
      this.isProcessing = false;
      
      // Shutdown engines
      for (const [name, engine] of this.engines) {
        if (engine.shutdown) {
          await engine.shutdown();
        }
      }
      
      // Shutdown cache service
      await aiCacheService.shutdown();
      
      // Clear event listeners
      this.eventListeners.clear();
      
      this.isInitialized = false;
      this.systemHealth.status = 'shutdown';
      
      console.log('✅ AI System Integration shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  /**
   * Get engine by name
   */
  getEngine(name) {
    return this.engines.get(name);
  }

  /**
   * Get all engines
   */
  getAllEngines() {
    return Object.fromEntries(this.engines);
  }

  /**
   * Check if system is ready
   */
  isReady() {
    return this.isInitialized && this.systemHealth.status === 'healthy';
  }
}

// Create singleton instance
const aiSystemIntegration = new AISystemIntegration();

export default aiSystemIntegration;
export { AISystemIntegration };