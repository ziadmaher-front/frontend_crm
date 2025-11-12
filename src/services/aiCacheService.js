// Advanced AI Caching Service
// Intelligent caching system for AI predictions, insights, and analytics

import { AIPerformanceConfig, performanceOptimizer } from '../config/aiPerformanceConfig.js';

class AICacheService {
  constructor(config = AIPerformanceConfig.cache) {
    this.config = config;
    this.caches = new Map();
    this.statistics = new Map();
    this.cleanupIntervals = new Map();
    
    this.initializeCaches();
    this.startCleanupScheduler();
  }

  initializeCaches() {
    // Initialize different cache types
    const cacheTypes = [
      'leadScoring',
      'dealPrediction',
      'customerBehavior',
      'revenueForecasting',
      'teamPerformance',
      'marketIntelligence',
      'automationRules',
      'insights',
      'patterns',
      'recommendations'
    ];

    cacheTypes.forEach(type => {
      this.caches.set(type, new Map());
      this.statistics.set(type, {
        hits: 0,
        misses: 0,
        sets: 0,
        evictions: 0,
        totalSize: 0,
        lastAccess: Date.now()
      });
    });
  }

  // Generate cache key from parameters
  generateKey(type, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${type}:${JSON.stringify(sortedParams)}`;
  }

  // Get cached value
  get(type, params) {
    const timer = performanceOptimizer.startTimer(`cache_get_${type}`);
    
    try {
      const cache = this.caches.get(type);
      if (!cache) {
        this.recordMiss(type);
        return null;
      }

      const key = this.generateKey(type, params);
      const cached = cache.get(key);

      if (!cached) {
        this.recordMiss(type);
        return null;
      }

      // Check TTL
      const ttl = this.config.ttl[type] || 5 * 60 * 1000;
      if (Date.now() - cached.timestamp > ttl) {
        cache.delete(key);
        this.recordMiss(type);
        return null;
      }

      // Update access time
      cached.lastAccess = Date.now();
      this.recordHit(type);
      
      return cached.data;
    } finally {
      timer.end();
    }
  }

  // Set cached value
  set(type, params, data) {
    const timer = performanceOptimizer.startTimer(`cache_set_${type}`);
    
    try {
      const cache = this.caches.get(type);
      if (!cache) return false;

      const key = this.generateKey(type, params);
      const maxSize = this.config.maxCacheSize[type] || 1000;

      // Check if cache is full and evict if necessary
      if (cache.size >= maxSize) {
        this.evictLRU(type);
      }

      const cacheEntry = {
        data,
        timestamp: Date.now(),
        lastAccess: Date.now(),
        accessCount: 0,
        size: this.calculateSize(data)
      };

      cache.set(key, cacheEntry);
      this.recordSet(type);
      
      return true;
    } finally {
      timer.end();
    }
  }

  // Calculate approximate size of data
  calculateSize(data) {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1; // Fallback size
    }
  }

  // Evict least recently used items
  evictLRU(type) {
    const cache = this.caches.get(type);
    if (!cache || cache.size === 0) return;

    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
      this.recordEviction(type);
    }
  }

  // Clear specific cache type
  clear(type) {
    const cache = this.caches.get(type);
    if (cache) {
      cache.clear();
      this.resetStatistics(type);
    }
  }

  // Clear all caches
  clearAll() {
    this.caches.forEach((cache, type) => {
      cache.clear();
      this.resetStatistics(type);
    });
  }

  // Invalidate cache based on conditions
  invalidate(type, condition) {
    const cache = this.caches.get(type);
    if (!cache) return;

    const keysToDelete = [];
    
    for (const [key, entry] of cache.entries()) {
      if (condition(key, entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      cache.delete(key);
      this.recordEviction(type);
    });
  }

  // Batch operations for better performance
  getBatch(requests) {
    const results = new Map();
    const timer = performanceOptimizer.startTimer('cache_get_batch');

    try {
      requests.forEach(({ type, params, id }) => {
        const result = this.get(type, params);
        results.set(id || this.generateKey(type, params), result);
      });

      return results;
    } finally {
      timer.end();
    }
  }

  setBatch(entries) {
    const timer = performanceOptimizer.startTimer('cache_set_batch');

    try {
      entries.forEach(({ type, params, data }) => {
        this.set(type, params, data);
      });
    } finally {
      timer.end();
    }
  }

  // Preload frequently used data
  preload(type, paramsList, dataLoader) {
    const timer = performanceOptimizer.startTimer(`cache_preload_${type}`);

    return Promise.all(
      paramsList.map(async (params) => {
        const existing = this.get(type, params);
        if (!existing) {
          try {
            const data = await dataLoader(params);
            this.set(type, params, data);
          } catch (error) {
            console.warn(`Preload failed for ${type}:`, error);
          }
        }
      })
    ).finally(() => timer.end());
  }

  // Warm up cache with common queries
  async warmUp(warmUpConfig) {
    const timer = performanceOptimizer.startTimer('cache_warmup');

    try {
      for (const [type, config] of Object.entries(warmUpConfig)) {
        if (config.enabled && config.queries) {
          await this.preload(type, config.queries, config.loader);
        }
      }
    } finally {
      timer.end();
    }
  }

  // Statistics and monitoring
  recordHit(type) {
    const stats = this.statistics.get(type);
    if (stats) {
      stats.hits++;
      stats.lastAccess = Date.now();
    }
  }

  recordMiss(type) {
    const stats = this.statistics.get(type);
    if (stats) {
      stats.misses++;
      stats.lastAccess = Date.now();
    }
  }

  recordSet(type) {
    const stats = this.statistics.get(type);
    if (stats) {
      stats.sets++;
    }
  }

  recordEviction(type) {
    const stats = this.statistics.get(type);
    if (stats) {
      stats.evictions++;
    }
  }

  resetStatistics(type) {
    const stats = this.statistics.get(type);
    if (stats) {
      Object.assign(stats, {
        hits: 0,
        misses: 0,
        sets: 0,
        evictions: 0,
        totalSize: 0,
        lastAccess: Date.now()
      });
    }
  }

  getStatistics(type) {
    const stats = this.statistics.get(type);
    if (!stats) return null;

    const cache = this.caches.get(type);
    const currentSize = cache ? cache.size : 0;
    const hitRate = stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses)) * 100 
      : 0;

    return {
      ...stats,
      currentSize,
      hitRate: Math.round(hitRate * 100) / 100,
      efficiency: hitRate > 70 ? 'High' : hitRate > 40 ? 'Medium' : 'Low'
    };
  }

  getAllStatistics() {
    const allStats = {};
    
    for (const type of this.caches.keys()) {
      allStats[type] = this.getStatistics(type);
    }

    return allStats;
  }

  // Cache optimization
  optimize() {
    const timer = performanceOptimizer.startTimer('cache_optimize');

    try {
      // Remove expired entries
      this.cleanupExpired();
      
      // Optimize cache sizes based on usage patterns
      this.optimizeSizes();
      
      // Defragment caches if needed
      this.defragment();
      
    } finally {
      timer.end();
    }
  }

  cleanupExpired() {
    for (const [type, cache] of this.caches.entries()) {
      const ttl = this.config.ttl[type] || 5 * 60 * 1000;
      const now = Date.now();
      const keysToDelete = [];

      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        cache.delete(key);
        this.recordEviction(type);
      });
    }
  }

  optimizeSizes() {
    // Analyze usage patterns and adjust cache sizes
    for (const [type, stats] of this.statistics.entries()) {
      const cache = this.caches.get(type);
      if (!cache) continue;

      const hitRate = stats.hits + stats.misses > 0 
        ? (stats.hits / (stats.hits + stats.misses)) * 100 
        : 0;

      // If hit rate is very low, reduce cache size
      if (hitRate < 20 && cache.size > 100) {
        const targetSize = Math.floor(cache.size * 0.7);
        this.reduceCacheSize(type, targetSize);
      }
    }
  }

  reduceCacheSize(type, targetSize) {
    const cache = this.caches.get(type);
    if (!cache || cache.size <= targetSize) return;

    // Sort by access frequency and remove least used
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount);

    const toRemove = cache.size - targetSize;
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      cache.delete(entries[i][0]);
      this.recordEviction(type);
    }
  }

  defragment() {
    // Recreate caches to optimize memory layout
    for (const [type, cache] of this.caches.entries()) {
      if (cache.size > 1000) {
        const entries = Array.from(cache.entries());
        cache.clear();
        entries.forEach(([key, value]) => cache.set(key, value));
      }
    }
  }

  // Cleanup scheduler
  startCleanupScheduler() {
    const interval = this.config.invalidation.scheduledCleanup || 24 * 60 * 60 * 1000;
    
    setInterval(() => {
      this.optimize();
    }, interval);
  }

  // Export/Import cache data
  exportCache(type) {
    const cache = this.caches.get(type);
    if (!cache) return null;

    return {
      type,
      entries: Array.from(cache.entries()),
      statistics: this.getStatistics(type),
      timestamp: Date.now()
    };
  }

  importCache(cacheData) {
    if (!cacheData || !cacheData.type) return false;

    const cache = this.caches.get(cacheData.type);
    if (!cache) return false;

    cache.clear();
    cacheData.entries.forEach(([key, value]) => {
      cache.set(key, value);
    });

    return true;
  }

  // Health check
  healthCheck() {
    const health = {
      status: 'healthy',
      caches: {},
      totalMemoryUsage: 0,
      issues: []
    };

    for (const [type, cache] of this.caches.entries()) {
      const stats = this.getStatistics(type);
      const maxSize = this.config.maxCacheSize[type] || 1000;
      
      health.caches[type] = {
        size: cache.size,
        maxSize,
        utilization: (cache.size / maxSize) * 100,
        hitRate: stats.hitRate,
        status: stats.hitRate > 50 ? 'good' : 'poor'
      };

      if (stats.hitRate < 30) {
        health.issues.push(`Low hit rate for ${type}: ${stats.hitRate}%`);
      }

      if (cache.size > maxSize * 0.9) {
        health.issues.push(`Cache ${type} is near capacity: ${cache.size}/${maxSize}`);
      }
    }

    if (health.issues.length > 0) {
      health.status = 'warning';
    }

    return health;
  }
}

// Create singleton instance
export const aiCacheService = new AICacheService();

// Cache decorators for easy integration
export function cached(type, ttl) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args) {
      const params = { args, context: this.constructor.name };
      
      // Try to get from cache
      const cached = aiCacheService.get(type, params);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      aiCacheService.set(type, params, result);
      
      return result;
    };

    return descriptor;
  };
}

// Cache middleware for API responses
export function cacheMiddleware(type, options = {}) {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode === 200 && options.cacheSuccessOnly !== false) {
        const params = {
          url: req.url,
          method: req.method,
          query: req.query,
          body: req.body
        };
        
        aiCacheService.set(type, params, data);
      }
      
      originalSend.call(this, data);
    };

    // Try to serve from cache
    const params = {
      url: req.url,
      method: req.method,
      query: req.query,
      body: req.body
    };

    const cached = aiCacheService.get(type, params);
    if (cached !== null) {
      return res.send(cached);
    }

    next();
  };
}

export default AICacheService;