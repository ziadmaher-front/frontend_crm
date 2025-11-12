import React, { Suspense, lazy, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Enhanced lazy loading wrapper with intersection observer and error boundaries
 */
const LazyLoadingWrapper = ({ 
  importFunc, 
  fallback = null, 
  errorFallback = null,
  threshold = 0.1,
  rootMargin = '50px',
  enableIntersectionObserver = true,
  skeletonRows = 3,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(!enableIntersectionObserver);
  const [hasError, setHasError] = useState(false);
  const [LazyComponent, setLazyComponent] = useState(null);

  useEffect(() => {
    if (!enableIntersectionObserver) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    const element = document.getElementById(props.id || 'lazy-wrapper');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, enableIntersectionObserver, props.id]);

  useEffect(() => {
    if (isVisible && !LazyComponent) {
      try {
        const Component = lazy(() => 
          importFunc().catch(err => {
            console.error('Failed to load lazy component:', err);
            setHasError(true);
            return { default: () => errorFallback || <DefaultErrorFallback /> };
          })
        );
        setLazyComponent(() => Component);
      } catch (error) {
        console.error('Error creating lazy component:', error);
        setHasError(true);
      }
    }
  }, [isVisible, LazyComponent, importFunc, errorFallback]);

  const DefaultLoadingFallback = () => (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading component...</span>
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const DefaultErrorFallback = () => (
    <Card className="w-full border-destructive">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="text-destructive text-sm font-medium mb-2">
            Failed to load component
          </div>
          <p className="text-xs text-muted-foreground">
            Please refresh the page or try again later
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (!isVisible) {
    return (
      <div 
        id={props.id || 'lazy-wrapper'} 
        className="min-h-[200px] flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-sm text-muted-foreground">Component loading...</div>
        </motion.div>
      </div>
    );
  }

  if (hasError) {
    return errorFallback || <DefaultErrorFallback />;
  }

  if (!LazyComponent) {
    return fallback || <DefaultLoadingFallback />;
  }

  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LazyComponent {...props} />
      </motion.div>
    </Suspense>
  );
};

/**
 * Higher-order component for creating lazy-loaded components
 */
export const withLazyLoading = (importFunc, options = {}) => {
  return (props) => (
    <LazyLoadingWrapper 
      importFunc={importFunc} 
      {...options} 
      {...props} 
    />
  );
};

/**
 * Hook for creating lazy components with caching
 */
export const useLazyComponent = (importFunc, dependencies = []) => {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadComponent = async () => {
      try {
        const module = await importFunc();
        if (isMounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { component, loading, error };
};

/**
 * Preloader for lazy components
 */
export const preloadComponent = (importFunc) => {
  return importFunc();
};

/**
 * Batch preloader for multiple components
 */
export const preloadComponents = (importFuncs) => {
  return Promise.all(importFuncs.map(importFunc => importFunc()));
};

export default LazyLoadingWrapper;