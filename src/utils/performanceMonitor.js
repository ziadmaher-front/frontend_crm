/**
 * Enhanced Performance Monitoring System
 * Tracks application performance, identifies bottlenecks, and provides optimization insights
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      renderTime: 16, // 60fps target
      apiResponseTime: 1000, // 1 second
      bundleSize: 500 * 1024, // 500KB
      memoryUsage: 50 * 1024 * 1024, // 50MB
      cacheHitRate: 80, // 80%
    };
    this.isMonitoring = false;
    this.reportInterval = null;
    
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Initialize performance observers
    this.initializePerformanceObservers();
    
    // Initialize memory monitoring
    this.initializeMemoryMonitoring();
    
    // Initialize network monitoring
    this.initializeNetworkMonitoring();
    
    // Initialize render monitoring
    this.initializeRenderMonitoring();
    
    console.log('🚀 Performance monitoring initialized');
  }

  initializePerformanceObservers() {
    if (!window.PerformanceObserver) return;

    // Monitor navigation timing
    try {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('navigation', {
            type: entry.entryType,
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
          });
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navObserver);
    } catch (error) {
      console.warn('Navigation observer not supported:', error);
    }

    // Monitor resource loading
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('resource', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize || 0,
            type: this.getResourceType(entry.name),
            timestamp: Date.now(),
          });
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }

    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('longTask', {
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
          });
          
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }

    // Monitor layout shifts
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('layoutShift', {
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
            timestamp: Date.now(),
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('layout-shift', clsObserver);
    } catch (error) {
      console.warn('Layout shift observer not supported:', error);
    }
  }

  initializeMemoryMonitoring() {
    if (!performance.memory) return;

    const monitorMemory = () => {
      const memory = performance.memory;
      this.recordMetric('memory', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      });

      // Check for memory leaks
      if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
        console.warn(`⚠️ High memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    };

    // Monitor memory every 10 seconds
    setInterval(monitorMemory, 10000);
    monitorMemory(); // Initial measurement
  }

  initializeNetworkMonitoring() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric('api', {
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration,
          success: response.ok,
          timestamp: Date.now(),
        });

        // Check for slow API calls
        if (duration > this.thresholds.apiResponseTime) {
          console.warn(`⚠️ Slow API call: ${url} took ${duration.toFixed(2)}ms`);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric('api', {
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          duration,
          success: false,
          error: error.message,
          timestamp: Date.now(),
        });

        throw error;
      }
    };
  }

  initializeRenderMonitoring() {
    // Monitor React component renders
    let renderCount = 0;
    let renderStartTime = null;

    const measureRender = () => {
      if (renderStartTime) {
        const renderTime = performance.now() - renderStartTime;
        this.recordMetric('render', {
          duration: renderTime,
          count: renderCount,
          timestamp: Date.now(),
        });

        if (renderTime > this.thresholds.renderTime) {
          console.warn(`⚠️ Slow render: ${renderTime.toFixed(2)}ms`);
        }
      }
      
      renderStartTime = performance.now();
      renderCount++;
    };

    // Use requestAnimationFrame to measure render performance
    const scheduleRenderMeasurement = () => {
      requestAnimationFrame(() => {
        measureRender();
        scheduleRenderMeasurement();
      });
    };

    scheduleRenderMeasurement();
  }

  recordMetric(category, data) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, []);
    }
    
    const categoryMetrics = this.metrics.get(category);
    categoryMetrics.push(data);
    
    // Keep only last 100 entries per category to prevent memory leaks
    if (categoryMetrics.length > 100) {
      categoryMetrics.shift();
    }
  }

  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Generate reports every 30 seconds
    this.reportInterval = setInterval(() => {
      this.generatePerformanceReport();
    }, 30000);
    
    console.log('📊 Performance monitoring started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
    
    // Disconnect observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
    
    console.log('📊 Performance monitoring stopped');
  }

  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      details: this.generateDetailedMetrics(),
      recommendations: this.generateRecommendations(),
    };

    console.group('📊 Performance Report');
    console.log('Summary:', report.summary);
    console.log('Recommendations:', report.recommendations);
    console.groupEnd();

    return report;
  }

  generateSummary() {
    const summary = {};

    // API performance
    const apiMetrics = this.metrics.get('api') || [];
    if (apiMetrics.length > 0) {
      const avgResponseTime = apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length;
      const successRate = (apiMetrics.filter(m => m.success).length / apiMetrics.length) * 100;
      
      summary.api = {
        averageResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(successRate),
        totalRequests: apiMetrics.length,
      };
    }

    // Memory usage
    const memoryMetrics = this.metrics.get('memory') || [];
    if (memoryMetrics.length > 0) {
      const latestMemory = memoryMetrics[memoryMetrics.length - 1];
      summary.memory = {
        used: Math.round(latestMemory.used / 1024 / 1024), // MB
        total: Math.round(latestMemory.total / 1024 / 1024), // MB
        usage: Math.round((latestMemory.used / latestMemory.total) * 100), // %
      };
    }

    // Render performance
    const renderMetrics = this.metrics.get('render') || [];
    if (renderMetrics.length > 0) {
      const avgRenderTime = renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length;
      summary.render = {
        averageRenderTime: Math.round(avgRenderTime * 100) / 100,
        totalRenders: renderMetrics.reduce((sum, m) => sum + m.count, 0),
      };
    }

    // Resource loading
    const resourceMetrics = this.metrics.get('resource') || [];
    if (resourceMetrics.length > 0) {
      const totalSize = resourceMetrics.reduce((sum, m) => sum + (m.size || 0), 0);
      const avgLoadTime = resourceMetrics.reduce((sum, m) => sum + m.duration, 0) / resourceMetrics.length;
      
      summary.resources = {
        totalSize: Math.round(totalSize / 1024), // KB
        averageLoadTime: Math.round(avgLoadTime),
        totalResources: resourceMetrics.length,
      };
    }

    return summary;
  }

  generateDetailedMetrics() {
    const details = {};

    for (const [category, metrics] of this.metrics) {
      if (metrics.length === 0) continue;

      details[category] = {
        count: metrics.length,
        latest: metrics[metrics.length - 1],
        average: this.calculateAverage(metrics),
        trends: this.calculateTrends(metrics),
      };
    }

    return details;
  }

  calculateAverage(metrics) {
    if (metrics.length === 0) return null;

    const numericFields = ['duration', 'size', 'value', 'used', 'total'];
    const averages = {};

    for (const field of numericFields) {
      const values = metrics.map(m => m[field]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        averages[field] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    }

    return averages;
  }

  calculateTrends(metrics) {
    if (metrics.length < 2) return null;

    const recent = metrics.slice(-10); // Last 10 entries
    const older = metrics.slice(-20, -10); // Previous 10 entries

    if (older.length === 0) return null;

    const trends = {};
    const numericFields = ['duration', 'size', 'value', 'used'];

    for (const field of numericFields) {
      const recentAvg = this.calculateFieldAverage(recent, field);
      const olderAvg = this.calculateFieldAverage(older, field);

      if (recentAvg !== null && olderAvg !== null) {
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        trends[field] = {
          change: Math.round(change * 100) / 100,
          direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
        };
      }
    }

    return trends;
  }

  calculateFieldAverage(metrics, field) {
    const values = metrics.map(m => m[field]).filter(v => typeof v === 'number');
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
  }

  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();

    // API performance recommendations
    if (summary.api) {
      if (summary.api.averageResponseTime > this.thresholds.apiResponseTime) {
        recommendations.push({
          type: 'api',
          priority: 'high',
          message: `API response time is ${summary.api.averageResponseTime}ms. Consider implementing caching or optimizing backend queries.`,
        });
      }

      if (summary.api.successRate < 95) {
        recommendations.push({
          type: 'api',
          priority: 'high',
          message: `API success rate is ${summary.api.successRate}%. Investigate failing requests and implement better error handling.`,
        });
      }
    }

    // Memory recommendations
    if (summary.memory) {
      if (summary.memory.usage > 80) {
        recommendations.push({
          type: 'memory',
          priority: 'medium',
          message: `Memory usage is ${summary.memory.usage}%. Consider implementing memory optimization techniques.`,
        });
      }
    }

    // Render performance recommendations
    if (summary.render) {
      if (summary.render.averageRenderTime > this.thresholds.renderTime) {
        recommendations.push({
          type: 'render',
          priority: 'medium',
          message: `Average render time is ${summary.render.averageRenderTime}ms. Consider using React.memo, useMemo, or useCallback for optimization.`,
        });
      }
    }

    // Resource loading recommendations
    if (summary.resources) {
      if (summary.resources.totalSize > this.thresholds.bundleSize) {
        recommendations.push({
          type: 'bundle',
          priority: 'medium',
          message: `Bundle size is ${summary.resources.totalSize}KB. Consider code splitting and lazy loading.`,
        });
      }
    }

    // Long task recommendations
    const longTasks = this.metrics.get('longTask') || [];
    if (longTasks.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `${longTasks.length} long tasks detected. Consider breaking up heavy computations or using web workers.`,
      });
    }

    return recommendations;
  }

  getMetrics(category) {
    return this.metrics.get(category) || [];
  }

  clearMetrics(category) {
    if (category) {
      this.metrics.delete(category);
    } else {
      this.metrics.clear();
    }
  }

  exportMetrics() {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: Object.fromEntries(this.metrics),
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations(),
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({});
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  React.useEffect(() => {
    const updateMetrics = () => {
      const summary = performanceMonitor.generateSummary();
      setMetrics(summary);
    };

    if (isMonitoring) {
      performanceMonitor.startMonitoring();
      const interval = setInterval(updateMetrics, 5000);
      updateMetrics();

      return () => {
        clearInterval(interval);
        performanceMonitor.stopMonitoring();
      };
    }
  }, [isMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false),
    generateReport: () => performanceMonitor.generatePerformanceReport(),
    exportMetrics: () => performanceMonitor.exportMetrics(),
  };
};

export default performanceMonitor;