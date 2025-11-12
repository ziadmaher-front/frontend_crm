// Advanced Performance Monitoring Hook
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUIStore } from '../../stores';

// Performance metrics collection
class PerformanceMetrics {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      fcp: 2500,      // First Contentful Paint
      lcp: 4000,      // Largest Contentful Paint
      fid: 100,       // First Input Delay
      cls: 0.1,       // Cumulative Layout Shift
      ttfb: 600,      // Time to First Byte
      renderTime: 16, // Target 60fps (16ms per frame)
      memoryUsage: 50 * 1024 * 1024, // 50MB
    };
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // Web Vitals
    this.observeWebVitals();
    
    // Memory usage
    this.observeMemoryUsage();
    
    // Network performance
    this.observeNetworkPerformance();
    
    // Custom metrics
    this.observeCustomMetrics();
  }

  observeWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('fcp', entry.startTime, {
                threshold: this.thresholds.fcp,
                unit: 'ms',
                type: 'web-vital'
              });
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.recordMetric('lcp', lastEntry.startTime, {
              threshold: this.thresholds.lcp,
              unit: 'ms',
              type: 'web-vital'
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime, {
              threshold: this.thresholds.fid,
              unit: 'ms',
              type: 'web-vital'
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('cls', clsValue, {
            threshold: this.thresholds.cls,
            unit: 'score',
            type: 'web-vital'
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  observeMemoryUsage() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        this.recordMetric('memoryUsage', memory.usedJSHeapSize, {
          threshold: this.thresholds.memoryUsage,
          unit: 'bytes',
          type: 'memory',
          additional: {
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
          }
        });
      };

      checkMemory();
      const memoryInterval = setInterval(checkMemory, 5000);
      this.observers.set('memory', { disconnect: () => clearInterval(memoryInterval) });
    }
  }

  observeNetworkPerformance() {
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordMetric('ttfb', entry.responseStart - entry.requestStart, {
                threshold: this.thresholds.ttfb,
                unit: 'ms',
                type: 'network'
              });
              
              this.recordMetric('domContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart, {
                unit: 'ms',
                type: 'network'
              });
              
              this.recordMetric('loadComplete', entry.loadEventEnd - entry.loadEventStart, {
                unit: 'ms',
                type: 'network'
              });
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }
    }
  }

  observeCustomMetrics() {
    // Component render time tracking
    this.renderTimes = new Map();
    this.componentCounts = new Map();
  }

  recordMetric(name, value, options = {}) {
    const timestamp = Date.now();
    const metric = {
      name,
      value,
      timestamp,
      ...options,
      isGood: options.threshold ? value <= options.threshold : true
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name);
    metrics.push(metric);

    // Keep only last 100 entries per metric
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Emit performance event
    this.emit('metric', metric);
  }

  startRenderMeasure(componentName) {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.recordMetric(`render_${componentName}`, renderTime, {
        threshold: this.thresholds.renderTime,
        unit: 'ms',
        type: 'render'
      });

      // Track component render count
      const currentCount = this.componentCounts.get(componentName) || 0;
      this.componentCounts.set(componentName, currentCount + 1);
    };
  }

  getMetrics(name) {
    return this.metrics.get(name) || [];
  }

  getAllMetrics() {
    const result = {};
    this.metrics.forEach((metrics, name) => {
      result[name] = metrics;
    });
    return result;
  }

  getAverageMetric(name, timeWindow = 60000) {
    const metrics = this.getMetrics(name);
    const now = Date.now();
    const recentMetrics = metrics.filter(m => now - m.timestamp <= timeWindow);
    
    if (recentMetrics.length === 0) return null;
    
    const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / recentMetrics.length;
  }

  getPerformanceScore() {
    const scores = {
      fcp: this.getLatestMetric('fcp'),
      lcp: this.getLatestMetric('lcp'),
      fid: this.getLatestMetric('fid'),
      cls: this.getLatestMetric('cls'),
    };

    let totalScore = 0;
    let validScores = 0;

    Object.entries(scores).forEach(([key, metric]) => {
      if (metric) {
        const score = metric.isGood ? 100 : Math.max(0, 100 - (metric.value / metric.threshold) * 50);
        totalScore += score;
        validScores++;
      }
    });

    return validScores > 0 ? Math.round(totalScore / validScores) : 0;
  }

  getLatestMetric(name) {
    const metrics = this.getMetrics(name);
    return metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  // Event emitter functionality
  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  on(event, callback) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  disconnect() {
    this.observers.forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers.clear();
    this.metrics.clear();
  }
}

// Singleton instance
let performanceMetrics = null;

export const usePerformanceMonitor = (options = {}) => {
  const {
    enabled = true,
    autoReport = true,
    reportInterval = 30000,
    componentName = null,
    trackRenders = false,
  } = options;

  const [metrics, setMetrics] = useState({});
  const [performanceScore, setPerformanceScore] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const reportIntervalRef = useRef(null);
  const renderMeasureRef = useRef(null);
  const { addNotification } = useUIStore();

  // Initialize performance metrics
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    if (!performanceMetrics) {
      performanceMetrics = new PerformanceMetrics();
    }

    setIsMonitoring(true);

    const handleMetric = (metric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: metric
      }));

      // Show warning for poor performance
      if (!metric.isGood && metric.type === 'web-vital') {
        addNotification({
          type: 'warning',
          title: 'Performance Warning',
          message: `${metric.name.toUpperCase()} is ${metric.value}${metric.unit}, which exceeds the recommended threshold of ${metric.threshold}${metric.unit}`,
          duration: 5000,
        });
      }
    };

    performanceMetrics.on('metric', handleMetric);

    return () => {
      performanceMetrics.off('metric', handleMetric);
      setIsMonitoring(false);
    };
  }, [enabled, addNotification]);

  // Auto-report performance
  useEffect(() => {
    if (!enabled || !autoReport || !performanceMetrics) return;

    const reportPerformance = () => {
      const score = performanceMetrics.getPerformanceScore();
      setPerformanceScore(score);
      
      const allMetrics = performanceMetrics.getAllMetrics();
      setMetrics(allMetrics);
    };

    reportPerformance();
    reportIntervalRef.current = setInterval(reportPerformance, reportInterval);

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [enabled, autoReport, reportInterval]);

  // Track component renders
  useEffect(() => {
    if (!enabled || !trackRenders || !componentName || !performanceMetrics) return;

    renderMeasureRef.current = performanceMetrics.startRenderMeasure(componentName);

    return () => {
      if (renderMeasureRef.current) {
        renderMeasureRef.current();
      }
    };
  });

  // Measure function performance
  const measureFunction = useCallback((fn, name) => {
    if (!enabled || !performanceMetrics) return fn();

    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    performanceMetrics.recordMetric(`function_${name}`, endTime - startTime, {
      unit: 'ms',
      type: 'function'
    });

    return result;
  }, [enabled]);

  // Measure async function performance
  const measureAsyncFunction = useCallback(async (fn, name) => {
    if (!enabled || !performanceMetrics) return await fn();

    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    performanceMetrics.recordMetric(`async_function_${name}`, endTime - startTime, {
      unit: 'ms',
      type: 'async-function'
    });

    return result;
  }, [enabled]);

  // Get specific metric
  const getMetric = useCallback((name) => {
    if (!performanceMetrics) return null;
    return performanceMetrics.getLatestMetric(name);
  }, []);

  // Get metric history
  const getMetricHistory = useCallback((name) => {
    if (!performanceMetrics) return [];
    return performanceMetrics.getMetrics(name);
  }, []);

  // Get average metric
  const getAverageMetric = useCallback((name, timeWindow) => {
    if (!performanceMetrics) return null;
    return performanceMetrics.getAverageMetric(name, timeWindow);
  }, []);

  // Record custom metric
  const recordMetric = useCallback((name, value, options) => {
    if (!enabled || !performanceMetrics) return;
    performanceMetrics.recordMetric(name, value, options);
  }, [enabled]);

  // Performance recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (metrics.fcp && metrics.fcp.value > 2500) {
      recs.push({
        type: 'fcp',
        severity: 'high',
        message: 'First Contentful Paint is slow. Consider optimizing critical resources.',
        suggestions: [
          'Minimize render-blocking resources',
          'Optimize images and fonts',
          'Use resource hints (preload, prefetch)',
        ]
      });
    }

    if (metrics.lcp && metrics.lcp.value > 4000) {
      recs.push({
        type: 'lcp',
        severity: 'high',
        message: 'Largest Contentful Paint is slow. Optimize your largest content element.',
        suggestions: [
          'Optimize images and media',
          'Improve server response times',
          'Use efficient loading strategies',
        ]
      });
    }

    if (metrics.cls && metrics.cls.value > 0.1) {
      recs.push({
        type: 'cls',
        severity: 'medium',
        message: 'Cumulative Layout Shift is high. Reduce unexpected layout shifts.',
        suggestions: [
          'Set dimensions for images and embeds',
          'Avoid inserting content above existing content',
          'Use CSS transforms for animations',
        ]
      });
    }

    if (metrics.memoryUsage && metrics.memoryUsage.additional?.percentage > 80) {
      recs.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected. Consider optimizing memory consumption.',
        suggestions: [
          'Remove unused variables and references',
          'Implement proper cleanup in useEffect',
          'Use React.memo and useMemo appropriately',
        ]
      });
    }

    return recs;
  }, [metrics]);

  return {
    // State
    metrics,
    performanceScore,
    isMonitoring,
    recommendations,
    
    // Methods
    measureFunction,
    measureAsyncFunction,
    recordMetric,
    getMetric,
    getMetricHistory,
    getAverageMetric,
    
    // Utilities
    enabled,
  };
};

export default usePerformanceMonitor;