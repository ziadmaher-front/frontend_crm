import React, { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy loaded page components
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
export const LazyContacts = lazy(() => import('@/pages/Contacts'));
export const LazyAccounts = lazy(() => import('@/pages/Accounts'));
export const LazyDeals = lazy(() => import('@/pages/Deals'));
export const LazyLeads = lazy(() => import('@/pages/Leads'));
export const LazyTasks = lazy(() => import('@/pages/Tasks'));
export const LazyReports = lazy(() => import('@/pages/Reports'));
export const LazySettings = lazy(() => import('@/pages/Settings'));

// Lazy loaded modal components
export const LazyContactModal = lazy(() => import('@/components/modals/ContactModal'));
export const LazyAccountModal = lazy(() => import('@/components/modals/AccountModal'));
export const LazyDealModal = lazy(() => import('@/components/modals/DealModal'));
export const LazyLeadModal = lazy(() => import('@/components/modals/LeadModal'));
export const LazyTaskModal = lazy(() => import('@/components/modals/TaskModal'));

// Loading fallback components
export const PageLoadingFallback = ({ className }) => (
  <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

export const ModalLoadingFallback = ({ className }) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <div className="text-center space-y-2">
      <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
      <p className="text-xs text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const ComponentLoadingFallback = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

// Error boundary for lazy loaded components
export class LazyLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy load error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Failed to load component</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    There was an error loading this component. Please try again.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy wrapper component with error boundary and loading state
export const LazyWrapper = ({ 
  component: Component, 
  fallback = <PageLoadingFallback />, 
  errorFallback,
  ...props 
}) => (
  <LazyLoadErrorBoundary>
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  </LazyLoadErrorBoundary>
);

// Intersection Observer based lazy loading for images
export const LazyImage = ({ 
  src, 
  alt, 
  className, 
  placeholder, 
  onLoad, 
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {!isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {!isLoaded && isInView && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};

// Lazy loading for lists with intersection observer
export const LazyList = ({ 
  items, 
  renderItem, 
  loadMore, 
  hasMore, 
  loading, 
  className,
  threshold = 0.8 
}) => {
  const [visibleItems, setVisibleItems] = useState(items.slice(0, 10));
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setVisibleItems(items.slice(0, Math.max(10, visibleItems.length)));
  }, [items]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore?.();
        }
      },
      { threshold }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore, threshold]);

  return (
    <div className={cn('space-y-4', className)}>
      {visibleItems.map((item, index) => (
        <div key={item.id || index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          ) : (
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Progressive loading for data tables
export const LazyDataTable = ({ 
  data, 
  columns, 
  pageSize = 50, 
  className 
}) => {
  const [visibleRows, setVisibleRows] = useState(pageSize);
  const tableRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleRows < data.length) {
          setVisibleRows(prev => Math.min(prev + pageSize, data.length));
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = tableRef.current?.querySelector('[data-sentinel]');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [visibleRows, data.length, pageSize]);

  const visibleData = data.slice(0, visibleRows);

  return (
    <div ref={tableRef} className={cn('overflow-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th key={column.key} className="text-left p-2 font-medium">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleData.map((row, index) => (
            <tr key={row.id || index} className="border-b hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="p-2">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
          {visibleRows < data.length && (
            <tr data-sentinel>
              <td colSpan={columns.length} className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Code splitting utility for dynamic imports
export const createLazyComponent = (importFunc, fallback) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <LazyLoadErrorBoundary>
      <Suspense fallback={fallback || <ComponentLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

// Preload utility for better UX
export const preloadComponent = (importFunc) => {
  const componentImport = importFunc();
  return componentImport;
};

// Route-based code splitting helper
export const createLazyRoute = (importFunc) => {
  return createLazyComponent(importFunc, <PageLoadingFallback />);
};

// Modal lazy loading with preloading on hover
export const LazyModal = ({ 
  isOpen, 
  onClose, 
  importFunc, 
  preloadOnHover = true,
  triggerElement,
  ...props 
}) => {
  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadComponent = useCallback(async () => {
    if (Component) return;
    
    setIsLoading(true);
    try {
      const module = await importFunc();
      setComponent(() => module.default);
    } catch (error) {
      console.error('Failed to load modal component:', error);
    } finally {
      setIsLoading(false);
    }
  }, [importFunc, Component]);

  useEffect(() => {
    if (isOpen) {
      loadComponent();
    }
  }, [isOpen, loadComponent]);

  const handleMouseEnter = useCallback(() => {
    if (preloadOnHover && !Component) {
      loadComponent();
    }
  }, [preloadOnHover, Component, loadComponent]);

  if (!isOpen) {
    return triggerElement ? (
      <div onMouseEnter={handleMouseEnter}>
        {triggerElement}
      </div>
    ) : null;
  }

  if (isLoading || !Component) {
    return <ModalLoadingFallback />;
  }

  return <Component isOpen={isOpen} onClose={onClose} {...props} />;
};

// PropTypes definitions
PageLoadingFallback.propTypes = {
  className: PropTypes.string,
};

ModalLoadingFallback.propTypes = {
  className: PropTypes.string,
};

ComponentLoadingFallback.propTypes = {
  className: PropTypes.string,
};

LazyWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  errorFallback: PropTypes.node,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

LazyList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  overscan: PropTypes.number,
  className: PropTypes.string,
};

LazyDataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
};

LazyModal.propTypes = {
  componentPath: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  triggerElement: PropTypes.node,
  preload: PropTypes.bool,
};

export default {
  LazyWrapper,
  LazyImage,
  LazyList,
  LazyDataTable,
  LazyModal,
  createLazyComponent,
  createLazyRoute,
  preloadComponent,
  PageLoadingFallback,
  ModalLoadingFallback,
  ComponentLoadingFallback,
  LazyLoadErrorBoundary,
};