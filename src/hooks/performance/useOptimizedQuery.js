// Advanced Optimized Query Hook with Smart Caching and Prefetching
import { useQuery, useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDebounce } from '../useDebounce';
import { useOnlineStatus } from '../useOnlineStatus';
import { usePerformanceMonitor } from './usePerformanceMonitor';

// Query cache with intelligent eviction
class IntelligentQueryCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.accessTimes = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.hitCount = 0;
    this.missCount = 0;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.missCount++;
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.missCount++;
      return null;
    }

    this.accessTimes.set(key, now);
    this.hitCount++;
    return item.data;
  }

  set(key, data) {
    const now = Date.now();
    
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
    });
    this.accessTimes.set(key, now);
  }

  evictLeastRecentlyUsed() {
    let oldestKey = null;
    let oldestTime = Infinity;

    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
    }
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Global cache instance
const queryCache = new IntelligentQueryCache();

// Smart prefetching strategy
class PrefetchStrategy {
  constructor() {
    this.prefetchQueue = new Set();
    this.prefetchHistory = new Map();
    this.userBehaviorPatterns = new Map();
  }

  shouldPrefetch(queryKey, userAction) {
    const keyString = JSON.stringify(queryKey);
    
    // Don't prefetch if recently prefetched
    const lastPrefetch = this.prefetchHistory.get(keyString);
    if (lastPrefetch && Date.now() - lastPrefetch < 30000) { // 30 seconds
      return false;
    }

    // Learn from user behavior
    const pattern = this.userBehaviorPatterns.get(userAction) || new Set();
    if (pattern.has(keyString)) {
      return true;
    }

    // Default prefetch conditions
    return this.prefetchQueue.has(keyString);
  }

  addToPrefetchQueue(queryKey) {
    this.prefetchQueue.add(JSON.stringify(queryKey));
  }

  recordUserAction(action, queryKey) {
    const keyString = JSON.stringify(queryKey);
    const pattern = this.userBehaviorPatterns.get(action) || new Set();
    pattern.add(keyString);
    this.userBehaviorPatterns.set(action, pattern);
  }

  markPrefetched(queryKey) {
    const keyString = JSON.stringify(queryKey);
    this.prefetchHistory.set(keyString, Date.now());
    this.prefetchQueue.delete(keyString);
  }
}

const prefetchStrategy = new PrefetchStrategy();

export const useOptimizedQuery = (options = {}) => {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = false,
    refetchOnReconnect = true,
    retry = 3,
    retryDelay = (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Advanced options
    enableIntelligentCaching = true,
    enablePrefetching = true,
    enableOptimisticUpdates = true,
    enableBackgroundRefetch = true,
    enablePerformanceTracking = true,
    prefetchTriggers = ['hover', 'focus'],
    optimisticUpdateKey = null,
    
    // Pagination options
    enableInfiniteQuery = false,
    getNextPageParam = null,
    getPreviousPageParam = null,
    
    // Search/filter options
    searchTerm = '',
    filters = {},
    debounceMs = 300,
    
    // Performance options
    enableVirtualization = false,
    pageSize = 20,
    
    ...restOptions
  } = options;

  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const { measureAsyncFunction, recordMetric } = usePerformanceMonitor({
    enabled: enablePerformanceTracking,
  });

  // Debounced search and filters
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const debouncedFilters = useDebounce(filters, debounceMs);

  // State for optimizations
  const [prefetchedQueries, setPrefetchedQueries] = useState(new Set());
  const [optimisticData, setOptimisticData] = useState(null);
  const prefetchTimeoutRef = useRef(null);

  // Enhanced query key with search and filters
  const enhancedQueryKey = useMemo(() => {
    const baseKey = Array.isArray(queryKey) ? queryKey : [queryKey];
    return [
      ...baseKey,
      { 
        search: debouncedSearchTerm, 
        filters: debouncedFilters,
        pageSize: enableInfiniteQuery ? pageSize : undefined,
      }
    ].filter(Boolean);
  }, [queryKey, debouncedSearchTerm, debouncedFilters, enableInfiniteQuery, pageSize]);

  // Enhanced query function with performance tracking and caching
  const enhancedQueryFn = useCallback(async (context) => {
    const cacheKey = JSON.stringify(enhancedQueryKey);
    
    // Check intelligent cache first
    if (enableIntelligentCaching) {
      const cachedData = queryCache.get(cacheKey);
      if (cachedData) {
        recordMetric?.('query_cache_hit', 1, { type: 'cache' });
        return cachedData;
      }
    }

    // Measure query performance
    const result = await measureAsyncFunction?.(
      () => queryFn(context),
      `query_${cacheKey.slice(0, 50)}`
    ) || await queryFn(context);

    // Cache the result
    if (enableIntelligentCaching && result) {
      queryCache.set(cacheKey, result);
      recordMetric?.('query_cache_miss', 1, { type: 'cache' });
    }

    return result;
  }, [enhancedQueryKey, queryFn, enableIntelligentCaching, measureAsyncFunction, recordMetric]);

  // Main query or infinite query
  const queryResult = enableInfiniteQuery
    ? useInfiniteQuery({
        queryKey: enhancedQueryKey,
        queryFn: enhancedQueryFn,
        enabled: enabled && isOnline,
        staleTime,
        cacheTime,
        refetchOnWindowFocus,
        refetchOnReconnect,
        retry,
        retryDelay,
        getNextPageParam,
        getPreviousPageParam,
        ...restOptions,
      })
    : useQuery({
        queryKey: enhancedQueryKey,
        queryFn: enhancedQueryFn,
        enabled: enabled && isOnline,
        staleTime,
        cacheTime,
        refetchOnWindowFocus,
        refetchOnReconnect,
        retry,
        retryDelay,
        ...restOptions,
      });

  // Prefetching logic
  const prefetchQuery = useCallback((prefetchKey, prefetchFn) => {
    if (!enablePrefetching || !isOnline) return;

    const keyString = JSON.stringify(prefetchKey);
    if (prefetchedQueries.has(keyString)) return;

    if (prefetchStrategy.shouldPrefetch(prefetchKey, 'manual')) {
      queryClient.prefetchQuery({
        queryKey: prefetchKey,
        queryFn: prefetchFn || enhancedQueryFn,
        staleTime: staleTime / 2, // Shorter stale time for prefetched data
      });

      setPrefetchedQueries(prev => new Set(prev).add(keyString));
      prefetchStrategy.markPrefetched(prefetchKey);
    }
  }, [enablePrefetching, isOnline, prefetchedQueries, queryClient, enhancedQueryFn, staleTime]);

  // Auto-prefetch related queries
  useEffect(() => {
    if (!enablePrefetching || !queryResult.data) return;

    // Prefetch next page for infinite queries
    if (enableInfiniteQuery && queryResult.hasNextPage && !queryResult.isFetchingNextPage) {
      prefetchTimeoutRef.current = setTimeout(() => {
        queryResult.fetchNextPage();
      }, 1000);
    }

    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [enablePrefetching, queryResult.data, enableInfiniteQuery, queryResult.hasNextPage, queryResult.isFetchingNextPage, queryResult.fetchNextPage]);

  // Optimistic updates
  const optimisticUpdate = useCallback((updateFn, rollbackFn) => {
    if (!enableOptimisticUpdates) return;

    const previousData = queryClient.getQueryData(enhancedQueryKey);
    const optimisticData = updateFn(previousData);
    
    setOptimisticData(optimisticData);
    queryClient.setQueryData(enhancedQueryKey, optimisticData);

    return {
      rollback: () => {
        queryClient.setQueryData(enhancedQueryKey, previousData);
        setOptimisticData(null);
        rollbackFn?.(previousData);
      }
    };
  }, [enableOptimisticUpdates, queryClient, enhancedQueryKey]);

  // Background refetch
  useEffect(() => {
    if (!enableBackgroundRefetch || !queryResult.data) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && isOnline) {
        queryResult.refetch();
      }
    }, staleTime);

    return () => clearInterval(interval);
  }, [enableBackgroundRefetch, queryResult.data, queryResult.refetch, staleTime, isOnline]);

  // Mutation with optimistic updates
  const createOptimisticMutation = useCallback((mutationOptions) => {
    return useMutation({
      ...mutationOptions,
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: enhancedQueryKey });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(enhancedQueryKey);

        // Optimistically update
        if (mutationOptions.optimisticUpdate) {
          const optimisticData = mutationOptions.optimisticUpdate(previousData, variables);
          queryClient.setQueryData(enhancedQueryKey, optimisticData);
        }

        // Call original onMutate
        await mutationOptions.onMutate?.(variables);

        return { previousData };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        if (context?.previousData) {
          queryClient.setQueryData(enhancedQueryKey, context.previousData);
        }
        mutationOptions.onError?.(err, variables, context);
      },
      onSettled: (data, error, variables, context) => {
        // Refetch after mutation
        queryClient.invalidateQueries({ queryKey: enhancedQueryKey });
        mutationOptions.onSettled?.(data, error, variables, context);
      },
    });
  }, [queryClient, enhancedQueryKey]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!enablePerformanceTracking) return null;

    return {
      cacheStats: queryCache.getStats(),
      queryTime: queryResult.dataUpdatedAt ? Date.now() - queryResult.dataUpdatedAt : 0,
      isStale: queryResult.isStale,
      isFetching: queryResult.isFetching,
      fetchStatus: queryResult.fetchStatus,
    };
  }, [enablePerformanceTracking, queryResult]);

  // Enhanced data with virtualization support
  const processedData = useMemo(() => {
    let data = optimisticData || queryResult.data;
    
    if (enableInfiniteQuery && data?.pages) {
      data = data.pages.flatMap(page => page.data || page);
    }

    if (enableVirtualization && Array.isArray(data)) {
      return {
        items: data,
        totalCount: data.length,
        pageSize,
      };
    }

    return data;
  }, [optimisticData, queryResult.data, enableInfiniteQuery, enableVirtualization, pageSize]);

  return {
    // Core query result
    ...queryResult,
    data: processedData,
    
    // Enhanced features
    prefetchQuery,
    optimisticUpdate,
    createOptimisticMutation,
    
    // Performance metrics
    performanceMetrics,
    
    // Utilities
    isOptimistic: !!optimisticData,
    enhancedQueryKey,
    
    // Search and filter state
    searchTerm: debouncedSearchTerm,
    filters: debouncedFilters,
    
    // Cache management
    clearCache: () => queryCache.clear(),
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey: enhancedQueryKey }),
    
    // Prefetch management
    addToPrefetchQueue: (key) => prefetchStrategy.addToPrefetchQueue(key),
    recordUserAction: (action) => prefetchStrategy.recordUserAction(action, enhancedQueryKey),
  };
};

export default useOptimizedQuery;