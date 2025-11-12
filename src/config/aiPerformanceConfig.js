// AI Performance Optimization Configuration
// Advanced caching, batching, and performance tuning for AI engines

export const AIPerformanceConfig = {
  // Caching Configuration
  cache: {
    // Cache sizes (number of items)
    maxCacheSize: {
      predictions: 5000,
      insights: 3000,
      patterns: 2000,
      recommendations: 1000,
      analytics: 1500
    },
    
    // Cache TTL (Time To Live) in milliseconds
    ttl: {
      leadScoring: 5 * 60 * 1000,      // 5 minutes
      dealPrediction: 10 * 60 * 1000,  // 10 minutes
      customerBehavior: 15 * 60 * 1000, // 15 minutes
      revenueForecasting: 30 * 60 * 1000, // 30 minutes
      teamPerformance: 20 * 60 * 1000,  // 20 minutes
      marketIntelligence: 60 * 60 * 1000 // 1 hour
    },
    
    // Cache invalidation strategies
    invalidation: {
      onDataUpdate: true,
      onModelRetrain: true,
      onConfigChange: true,
      scheduledCleanup: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Batch Processing Configuration
  batching: {
    // Batch sizes for different operations
    batchSizes: {
      leadScoring: 50,
      dealPrediction: 25,
      customerAnalysis: 30,
      automationTriggers: 100,
      reportGeneration: 20
    },
    
    // Batch processing intervals (milliseconds)
    intervals: {
      insights: 30 * 1000,      // 30 seconds
      predictions: 60 * 1000,   // 1 minute
      automations: 45 * 1000,   // 45 seconds
      analytics: 120 * 1000,    // 2 minutes
      notifications: 15 * 1000  // 15 seconds
    },
    
    // Maximum wait time before forcing batch processing
    maxWaitTime: {
      critical: 5 * 1000,       // 5 seconds
      high: 15 * 1000,          // 15 seconds
      medium: 30 * 1000,        // 30 seconds
      low: 60 * 1000            // 1 minute
    }
  },

  // Model Performance Configuration
  models: {
    // Confidence thresholds for different models
    confidenceThresholds: {
      leadScoring: 0.75,
      dealPrediction: 0.80,
      churnPrediction: 0.85,
      revenueForecasting: 0.70,
      sentimentAnalysis: 0.65
    },
    
    // Model ensemble weights
    ensembleWeights: {
      gradientBoosting: 0.35,
      randomForest: 0.25,
      neuralNetwork: 0.25,
      svm: 0.15
    },
    
    // Model retraining configuration
    retraining: {
      interval: 7 * 24 * 60 * 60 * 1000, // 7 days
      minDataPoints: 1000,
      accuracyThreshold: 0.85,
      autoRetrain: true
    }
  },

  // Resource Management
  resources: {
    // Memory management
    memory: {
      maxHeapSize: '512MB',
      gcInterval: 5 * 60 * 1000, // 5 minutes
      memoryThreshold: 0.85      // 85% memory usage threshold
    },
    
    // CPU management
    cpu: {
      maxConcurrentOperations: 10,
      priorityQueue: true,
      loadBalancing: true
    },
    
    // Network optimization
    network: {
      connectionPoolSize: 20,
      requestTimeout: 30 * 1000, // 30 seconds
      retryAttempts: 3,
      backoffStrategy: 'exponential'
    }
  },

  // Performance Monitoring
  monitoring: {
    // Metrics collection intervals
    metricsInterval: 60 * 1000, // 1 minute
    
    // Performance thresholds
    thresholds: {
      responseTime: 2000,        // 2 seconds
      throughput: 100,           // operations per minute
      errorRate: 0.01,           // 1% error rate
      memoryUsage: 0.85,         // 85% memory usage
      cpuUsage: 0.80             // 80% CPU usage
    },
    
    // Alert configuration
    alerts: {
      enabled: true,
      channels: ['console', 'log'],
      severity: {
        critical: ['responseTime', 'errorRate'],
        warning: ['memoryUsage', 'cpuUsage'],
        info: ['throughput']
      }
    }
  },

  // Optimization Strategies
  optimization: {
    // Lazy loading configuration
    lazyLoading: {
      enabled: true,
      chunkSize: 1000,
      preloadThreshold: 0.8
    },
    
    // Data compression
    compression: {
      enabled: true,
      algorithm: 'gzip',
      level: 6
    },
    
    // Query optimization
    queries: {
      indexing: true,
      caching: true,
      pagination: {
        defaultSize: 50,
        maxSize: 500
      }
    }
  },

  // Feature Flags for Performance Testing
  features: {
    enableAdvancedCaching: true,
    enableBatchProcessing: true,
    enableModelOptimization: true,
    enableResourceMonitoring: true,
    enablePerformanceLogging: true,
    enableAutoScaling: false, // For future cloud deployment
    enableDistributedProcessing: false // For future scaling
  },

  // Development and Debug Configuration
  debug: {
    // Use Vite's env flags in browser; fallback to Node in tests
    enabled: (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.DEV !== 'undefined')
      ? import.meta.env.DEV
      : (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development'),
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    performanceLogging: true,
    cacheStatistics: true,
    modelMetrics: true
  }
};

// Performance Utilities
export class PerformanceOptimizer {
  constructor(config = AIPerformanceConfig) {
    this.config = config;
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  // Cache management utilities
  createCache(type) {
    const maxSize = this.config.cache.maxCacheSize[type] || 1000;
    const ttl = this.config.cache.ttl[type] || 5 * 60 * 1000;
    
    return new Map();
  }

  // Performance measurement
  startTimer(operation) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(operation, duration);
        return duration;
      }
    };
  }

  recordMetric(operation, value) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation).push({
      value,
      timestamp: Date.now()
    });
  }

  getMetrics(operation) {
    return this.metrics.get(operation) || [];
  }

  getAverageMetric(operation) {
    const metrics = this.getMetrics(operation);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Memory management
  checkMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      return used / total;
    }
    return 0;
  }

  // Batch processing utilities
  createBatchProcessor(type, processor) {
    const batchSize = this.config.batching.batchSizes[type] || 50;
    const interval = this.config.batching.intervals[type] || 60000;
    
    let batch = [];
    let timer = null;

    const processBatch = async () => {
      if (batch.length === 0) return;
      
      const currentBatch = [...batch];
      batch = [];
      
      try {
        await processor(currentBatch);
      } catch (error) {
        console.error(`Batch processing error for ${type}:`, error);
      }
    };

    return {
      add: (item) => {
        batch.push(item);
        
        if (batch.length >= batchSize) {
          if (timer) clearTimeout(timer);
          processBatch();
        } else if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            processBatch();
          }, interval);
        }
      },
      flush: processBatch,
      size: () => batch.length
    };
  }

  // Resource monitoring
  startResourceMonitoring() {
    if (!this.config.monitoring.enabled) return;

    const interval = this.config.monitoring.metricsInterval;
    
    setInterval(() => {
      const memoryUsage = this.checkMemoryUsage();
      const timestamp = Date.now();
      
      this.recordMetric('memoryUsage', memoryUsage);
      
      // Check thresholds and trigger alerts
      if (memoryUsage > this.config.monitoring.thresholds.memoryUsage) {
        this.triggerAlert('warning', 'High memory usage detected', { memoryUsage });
      }
    }, interval);
  }

  triggerAlert(severity, message, data = {}) {
    if (!this.config.monitoring.alerts.enabled) return;

    const alert = {
      severity,
      message,
      data,
      timestamp: Date.now()
    };

    if (this.config.monitoring.alerts.channels.includes('console')) {
      console.warn(`[AI Performance Alert - ${severity.toUpperCase()}]`, message, data);
    }

    if (this.config.monitoring.alerts.channels.includes('log')) {
      // Log to file or external service
      this.logAlert(alert);
    }
  }

  logAlert(alert) {
    // Implementation for logging alerts to file or external service
    // This could be extended to integrate with monitoring services
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export configuration presets
export const PerformancePresets = {
  development: {
    ...AIPerformanceConfig,
    debug: { ...AIPerformanceConfig.debug, enabled: true, logLevel: 'debug' },
    cache: { ...AIPerformanceConfig.cache, maxCacheSize: { ...AIPerformanceConfig.cache.maxCacheSize, predictions: 1000 } }
  },
  
  production: {
    ...AIPerformanceConfig,
    debug: { ...AIPerformanceConfig.debug, enabled: false, logLevel: 'error' },
    cache: { ...AIPerformanceConfig.cache, maxCacheSize: { ...AIPerformanceConfig.cache.maxCacheSize, predictions: 10000 } }
  },
  
  testing: {
    ...AIPerformanceConfig,
    debug: { ...AIPerformanceConfig.debug, enabled: true, logLevel: 'info' },
    cache: { ...AIPerformanceConfig.cache, maxCacheSize: { ...AIPerformanceConfig.cache.maxCacheSize, predictions: 100 } }
  }
};

export default AIPerformanceConfig;
