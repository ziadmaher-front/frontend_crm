import { useState, useEffect, useCallback, useRef } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errorCount: 0,
    fps: 0
  });

  const startTime = useRef(Date.now());
  const renderStartTime = useRef(Date.now());
  const frameCount = useRef(0);
  const lastFrameTime = useRef(Date.now());

  // Measure page load time
  useEffect(() => {
    const handleLoad = () => {
      const loadTime = Date.now() - startTime.current;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Measure render time
  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  });

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, []);

  // Monitor FPS
  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++;
      const now = Date.now();
      const delta = now - lastFrameTime.current;
      
      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        setMetrics(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastFrameTime.current = now;
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }, []);

  // Monitor network requests
  const trackNetworkRequest = useCallback(() => {
    setMetrics(prev => ({ ...prev, networkRequests: prev.networkRequests + 1 }));
  }, []);

  // Track errors
  const trackError = useCallback(() => {
    setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
  }, []);

  return {
    metrics,
    trackNetworkRequest,
    trackError
  };
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    const visible = items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));

    setVisibleItems(visible);
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    handleScroll
  };
};

// Debounce hook for performance optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance optimization
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Lazy loading hook for images and components
export const useLazyLoading = (ref, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, hasLoaded, options]);

  return { isVisible, hasLoaded };
};

// Memory management hook
export const useMemoryManagement = () => {
  const cleanupFunctions = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
};

// Cache hook for expensive computations
export const useCache = (key, computeFn, dependencies = []) => {
  const cache = useRef(new Map());
  const [value, setValue] = useState(null);

  useEffect(() => {
    const cacheKey = JSON.stringify({ key, dependencies });
    
    if (cache.current.has(cacheKey)) {
      setValue(cache.current.get(cacheKey));
    } else {
      const computed = computeFn();
      cache.current.set(cacheKey, computed);
      setValue(computed);
      
      // Limit cache size
      if (cache.current.size > 100) {
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }
    }
  }, [key, computeFn, ...dependencies]);

  return value;
};

// Bundle size optimization utilities
export const loadChunk = async (chunkName) => {
  try {
    const module = await import(/* webpackChunkName: "[request]" */ `../components/${chunkName}`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load chunk: ${chunkName}`, error);
    return null;
  }
};

// Performance optimization utilities
export const performanceUtils = {
  // Measure function execution time
  measureTime: (fn, label) => {
    return (...args) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      console.log(`${label} took ${end - start} milliseconds`);
      return result;
    };
  },

  // Batch DOM updates
  batchUpdates: (updates) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },

  // Optimize images
  optimizeImage: (src, width, height, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = src;
    });
  },

  // Preload critical resources
  preloadResource: (url, type = 'script') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  },

  // Service worker registration
  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
  }
};

export default {
  usePerformanceMonitor,
  useVirtualScrolling,
  useDebounce,
  useThrottle,
  useLazyLoading,
  useMemoryManagement,
  useCache,
  loadChunk,
  performanceUtils
};