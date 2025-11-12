/**
 * Advanced Code Splitting Utilities
 * Provides intelligent code splitting with preloading and chunk optimization
 */

import { lazy, Suspense } from 'react';

class CodeSplittingManager {
  constructor() {
    this.loadedChunks = new Set();
    this.preloadedChunks = new Set();
    this.loadingChunks = new Map();
    this.chunkPriorities = new Map();
    this.userInteractionData = {
      routes: new Map(),
      components: new Map(),
      features: new Map()
    };
    
    this.config = {
      preloadDelay: 2000, // 2 seconds
      maxConcurrentLoads: 3,
      enablePredictiveLoading: true,
      enableIntersectionPreload: true,
      enableHoverPreload: true,
      chunkRetryAttempts: 3,
      chunkRetryDelay: 1000
    };

    this.initializeIntersectionObserver();
    this.trackUserInteractions();
  }

  /**
   * Create a lazy component with enhanced loading strategies
   */
  createLazyComponent(importFunction, options = {}) {
    const {
      fallback = null,
      preload = false,
      priority = 'normal',
      retryAttempts = this.config.chunkRetryAttempts,
      onError = null,
      chunkName = null
    } = options;

    // Enhanced import function with retry logic
    const enhancedImport = async () => {
      let attempts = 0;
      
      while (attempts < retryAttempts) {
        try {
          const module = await importFunction();
          
          if (chunkName) {
            this.loadedChunks.add(chunkName);
            this.recordChunkLoad(chunkName, true);
          }
          
          return module;
        } catch (error) {
          attempts++;
          
          if (attempts >= retryAttempts) {
            if (onError) {
              onError(error);
            }
            throw new Error(`Failed to load chunk after ${retryAttempts} attempts: ${error.message}`);
          }
          
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, this.config.chunkRetryDelay * Math.pow(2, attempts - 1))
          );
        }
      }
    };

    const LazyComponent = lazy(enhancedImport);

    // Set priority for preloading decisions
    if (chunkName && priority) {
      this.chunkPriorities.set(chunkName, priority);
    }

    // Preload if requested
    if (preload) {
      this.preloadChunk(enhancedImport, chunkName);
    }

    return LazyComponent;
  }

  /**
   * Preload a chunk
   */
  async preloadChunk(importFunction, chunkName = null) {
    const key = chunkName || importFunction.toString();
    
    if (this.preloadedChunks.has(key) || this.loadedChunks.has(key)) {
      return;
    }

    if (this.loadingChunks.has(key)) {
      return this.loadingChunks.get(key);
    }

    const loadPromise = importFunction().catch(error => {
      console.warn(`Preload failed for chunk ${key}:`, error);
      this.loadingChunks.delete(key);
    });

    this.loadingChunks.set(key, loadPromise);
    
    try {
      await loadPromise;
      this.preloadedChunks.add(key);
      this.loadingChunks.delete(key);
      
      if (chunkName) {
        this.recordChunkLoad(chunkName, false);
      }
    } catch (error) {
      // Error already handled above
    }
  }

  /**
   * Preload chunks based on route prediction
   */
  predictivePreload(currentRoute) {
    if (!this.config.enablePredictiveLoading) return;

    const routeData = this.userInteractionData.routes.get(currentRoute);
    if (!routeData) return;

    // Get most likely next routes
    const nextRoutes = Array.from(routeData.transitions.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)
      .map(([route]) => route);

    // Preload chunks for predicted routes
    nextRoutes.forEach(route => {
      const chunkName = this.getChunkNameForRoute(route);
      if (chunkName && this.chunkPriorities.get(chunkName) !== 'low') {
        setTimeout(() => {
          this.preloadChunk(this.getImportFunctionForRoute(route), chunkName);
        }, this.config.preloadDelay);
      }
    });
  }

  /**
   * Initialize intersection observer for viewport-based preloading
   */
  initializeIntersectionObserver() {
    if (!this.config.enableIntersectionPreload || !window.IntersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const chunkName = entry.target.dataset.preloadChunk;
            if (chunkName) {
              this.preloadChunk(
                this.getImportFunctionForChunk(chunkName),
                chunkName
              );
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }

  /**
   * Track user interactions for predictive loading
   */
  trackUserInteractions() {
    // Track route transitions
    let previousRoute = window.location.pathname;
    
    const trackRouteChange = () => {
      const currentRoute = window.location.pathname;
      if (currentRoute !== previousRoute) {
        this.recordRouteTransition(previousRoute, currentRoute);
        this.predictivePreload(currentRoute);
        previousRoute = currentRoute;
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', trackRouteChange);
    
    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      trackRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      trackRouteChange();
    };

    // Track component interactions
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-component]');
      if (target) {
        this.recordComponentInteraction(target.dataset.component);
      }
    });

    // Track hover events for preloading
    if (this.config.enableHoverPreload) {
      document.addEventListener('mouseenter', (event) => {
        const target = event.target.closest('[data-preload-on-hover]');
        if (target) {
          const chunkName = target.dataset.preloadOnHover;
          this.preloadChunk(
            this.getImportFunctionForChunk(chunkName),
            chunkName
          );
        }
      }, true);
    }
  }

  /**
   * Record route transition for predictive analysis
   */
  recordRouteTransition(fromRoute, toRoute) {
    if (!this.userInteractionData.routes.has(fromRoute)) {
      this.userInteractionData.routes.set(fromRoute, {
        visits: 0,
        transitions: new Map(),
        lastVisit: Date.now()
      });
    }

    const routeData = this.userInteractionData.routes.get(fromRoute);
    routeData.visits++;
    routeData.lastVisit = Date.now();

    if (!routeData.transitions.has(toRoute)) {
      routeData.transitions.set(toRoute, { count: 0, lastTransition: Date.now() });
    }

    const transitionData = routeData.transitions.get(toRoute);
    transitionData.count++;
    transitionData.lastTransition = Date.now();
  }

  /**
   * Record component interaction
   */
  recordComponentInteraction(componentName) {
    if (!this.userInteractionData.components.has(componentName)) {
      this.userInteractionData.components.set(componentName, {
        interactions: 0,
        lastInteraction: Date.now()
      });
    }

    const componentData = this.userInteractionData.components.get(componentName);
    componentData.interactions++;
    componentData.lastInteraction = Date.now();
  }

  /**
   * Record chunk load performance
   */
  recordChunkLoad(chunkName, wasPreloaded) {
    const loadTime = performance.now();
    
    if (!this.chunkLoadStats) {
      this.chunkLoadStats = new Map();
    }

    if (!this.chunkLoadStats.has(chunkName)) {
      this.chunkLoadStats.set(chunkName, {
        loads: 0,
        preloads: 0,
        totalLoadTime: 0,
        averageLoadTime: 0
      });
    }

    const stats = this.chunkLoadStats.get(chunkName);
    
    if (wasPreloaded) {
      stats.preloads++;
    } else {
      stats.loads++;
      stats.totalLoadTime += loadTime;
      stats.averageLoadTime = stats.totalLoadTime / stats.loads;
    }
  }

  /**
   * Get chunk name for route (to be implemented based on routing setup)
   */
  getChunkNameForRoute(route) {
    // This would be implemented based on your routing configuration
    const routeChunkMap = {
      '/dashboard': 'dashboard',
      '/contacts': 'contacts',
      '/deals': 'deals',
      '/reports': 'reports',
      '/settings': 'settings'
    };
    
    return routeChunkMap[route];
  }

  /**
   * Get import function for route (to be implemented based on routing setup)
   */
  getImportFunctionForRoute(route) {
    // This would return the appropriate import function for the route
    const routeImportMap = {
      '/dashboard': () => import('../pages/Dashboard'),
      '/contacts': () => import('../pages/Contacts'),
      '/deals': () => import('../pages/Deals'),
      '/reports': () => import('../pages/Reports'),
      '/settings': () => import('../pages/Settings')
    };
    
    return routeImportMap[route];
  }

  /**
   * Get import function for chunk name
   */
  getImportFunctionForChunk(chunkName) {
    // This would return the appropriate import function for the chunk
    const chunkImportMap = {
      'dashboard': () => import('../pages/Dashboard'),
      'contacts': () => import('../pages/Contacts'),
      'deals': () => import('../pages/Deals'),
      'reports': () => import('../pages/Reports'),
      'settings': () => import('../pages/Settings'),
      'ai-features': () => import('../components/AIFeatures'),
      'analytics': () => import('../components/Analytics'),
      'automation': () => import('../components/Automation')
    };
    
    return chunkImportMap[chunkName];
  }

  /**
   * Preload critical chunks based on user behavior
   */
  preloadCriticalChunks() {
    const criticalChunks = ['dashboard', 'contacts'];
    
    criticalChunks.forEach(chunkName => {
      setTimeout(() => {
        this.preloadChunk(
          this.getImportFunctionForChunk(chunkName),
          chunkName
        );
      }, 1000);
    });
  }

  /**
   * Preload chunks based on time of day or user patterns
   */
  intelligentPreload() {
    const hour = new Date().getHours();
    let chunksToPreload = [];

    // Business hours - preload work-related chunks
    if (hour >= 9 && hour <= 17) {
      chunksToPreload = ['deals', 'contacts', 'reports'];
    }
    // Evening - preload dashboard and analytics
    else if (hour >= 18 && hour <= 22) {
      chunksToPreload = ['dashboard', 'analytics'];
    }

    chunksToPreload.forEach(chunkName => {
      if (this.chunkPriorities.get(chunkName) !== 'low') {
        setTimeout(() => {
          this.preloadChunk(
            this.getImportFunctionForChunk(chunkName),
            chunkName
          );
        }, Math.random() * 5000); // Random delay to spread load
      }
    });
  }

  /**
   * Get loading statistics
   */
  getLoadingStats() {
    return {
      loadedChunks: Array.from(this.loadedChunks),
      preloadedChunks: Array.from(this.preloadedChunks),
      currentlyLoading: Array.from(this.loadingChunks.keys()),
      chunkStats: this.chunkLoadStats ? Object.fromEntries(this.chunkLoadStats) : {},
      userInteractionData: {
        routes: Object.fromEntries(this.userInteractionData.routes),
        components: Object.fromEntries(this.userInteractionData.components)
      }
    };
  }

  /**
   * Optimize chunk loading based on network conditions
   */
  adaptToNetworkConditions() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Adjust preloading strategy based on connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.config.maxConcurrentLoads = 1;
        this.config.preloadDelay = 5000;
        this.config.enablePredictiveLoading = false;
      } else if (connection.effectiveType === '3g') {
        this.config.maxConcurrentLoads = 2;
        this.config.preloadDelay = 3000;
      } else if (connection.effectiveType === '4g') {
        this.config.maxConcurrentLoads = 3;
        this.config.preloadDelay = 2000;
        this.config.enablePredictiveLoading = true;
      }

      // Listen for connection changes
      connection.addEventListener('change', () => {
        this.adaptToNetworkConditions();
      });
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// Create singleton instance
const codeSplittingManager = new CodeSplittingManager();

// Initialize network adaptation
codeSplittingManager.adaptToNetworkConditions();

// Preload critical chunks after initial load
setTimeout(() => {
  codeSplittingManager.preloadCriticalChunks();
}, 2000);

// Start intelligent preloading
setTimeout(() => {
  codeSplittingManager.intelligentPreload();
}, 5000);

export default codeSplittingManager;

// Export utility functions
export const createLazyComponent = (importFn, options) => 
  codeSplittingManager.createLazyComponent(importFn, options);

export const preloadChunk = (importFn, chunkName) => 
  codeSplittingManager.preloadChunk(importFn, chunkName);

export const withPreload = (Component, chunkName) => {
  return (props) => {
    // Add preload attributes for hover and intersection preloading
    const enhancedProps = {
      ...props,
      'data-preload-chunk': chunkName,
      'data-preload-on-hover': chunkName
    };

    return <Component {...enhancedProps} />;
  };
};

// Enhanced Suspense wrapper with loading states
export const SuspenseWithFallback = ({ 
  children, 
  fallback = null, 
  errorFallback = null,
  chunkName = null 
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError && errorFallback) {
    return errorFallback;
  }

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      {chunkName && (
        <span className="ml-2 text-sm text-muted-foreground">
          Loading {chunkName}...
        </span>
      )}
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <ErrorBoundary onError={() => setHasError(true)}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chunk loading error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600">
          <p>Failed to load component. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}