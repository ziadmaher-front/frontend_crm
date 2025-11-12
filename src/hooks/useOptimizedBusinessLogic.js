// Optimized Business Logic Hooks with Intelligent Caching
// Enhanced performance, reduced API calls, and better user experience

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiCacheService } from '@/services/aiCacheService';
import {
  contactService,
  dealService,
  leadService,
  accountService,
  taskService,
  analyticsService
} from '@/services';

// Cache configuration
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Optimized Entity Hook with React Query and AI Cache
export const useOptimizedEntity = (service, entityType, initialFilters = {}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(initialFilters);
  const [localData, setLocalData] = useState([]);
  const abortControllerRef = useRef();

  // Generate cache key
  const cacheKey = useMemo(() => 
    [entityType, 'list', JSON.stringify(filters)], 
    [entityType, filters]
  );

  // Optimized data fetching with caching
  const {
    data = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: cacheKey,
    queryFn: async ({ signal }) => {
      // Check AI cache first
      const cachedData = await aiCacheService.get(entityType, { filters });
      if (cachedData) {
        return cachedData;
      }

      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const result = await service.getAll({ filters, signal });
      if (result.success) {
        // Cache the result
        await aiCacheService.set(entityType, { filters }, result.data);
        return result.data;
      }
      throw new Error(result.error);
    },
    ...CACHE_CONFIG,
    enabled: true,
    onSuccess: (data) => {
      setLocalData(data);
    }
  });

  // Optimized create mutation
  const createMutation = useMutation({
    mutationFn: async (itemData) => {
      const result = await service.create(itemData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (newItem) => {
      // Optimistic update
      queryClient.setQueryData(cacheKey, (oldData = []) => [newItem, ...oldData]);
      
      // Update AI cache
      aiCacheService.set(entityType, { filters }, [newItem, ...data]);
      
      // Invalidate related queries
      queryClient.invalidateQueries([entityType]);
    },
    onError: (error) => {
      console.error(`Failed to create ${entityType}:`, error);
    }
  });

  // Optimized update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, itemData }) => {
      const result = await service.update(id, itemData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { id, data: result.data };
    },
    onSuccess: ({ id, data: updatedData }) => {
      // Optimistic update
      queryClient.setQueryData(cacheKey, (oldData = []) =>
        oldData.map(item => item.id === id ? { ...item, ...updatedData } : item)
      );
      
      // Update AI cache
      const updatedList = data.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      );
      aiCacheService.set(entityType, { filters }, updatedList);
      
      // Invalidate related queries
      queryClient.invalidateQueries([entityType, id]);
    }
  });

  // Optimized delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const result = await service.delete(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(cacheKey, (oldData = []) =>
        oldData.filter(item => item.id !== deletedId)
      );
      
      // Update AI cache
      const filteredList = data.filter(item => item.id !== deletedId);
      aiCacheService.set(entityType, { filters }, filteredList);
      
      // Remove from cache
      queryClient.removeQueries([entityType, deletedId]);
    }
  });

  // Batch operations for better performance
  const batchUpdate = useCallback(async (updates) => {
    const promises = updates.map(({ id, data }) => 
      updateMutation.mutateAsync({ id, itemData: data })
    );
    
    try {
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [updateMutation]);

  const batchDelete = useCallback(async (ids) => {
    const promises = ids.map(id => deleteMutation.mutateAsync(id));
    
    try {
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [deleteMutation]);

  // Intelligent search with debouncing
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered and searched data
  const processedData = useMemo(() => {
    let result = data;
    
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(query)
        )
      );
    }
    
    return result;
  }, [data, debouncedQuery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data: processedData,
    loading: isLoading,
    fetching: isFetching,
    error,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    
    // CRUD operations
    createItem: createMutation.mutate,
    updateItem: (id, itemData) => updateMutation.mutate({ id, itemData }),
    deleteItem: deleteMutation.mutate,
    
    // Batch operations
    batchUpdate,
    batchDelete,
    
    // Utility functions
    refresh: refetch,
    
    // Loading states
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    
    // Statistics
    totalCount: data.length,
    filteredCount: processedData.length
  };
};

// Optimized Contacts Hook
export const useOptimizedContacts = (initialFilters = {}) => {
  const entityHook = useOptimizedEntity(contactService, 'contacts', initialFilters);
  
  // Contact-specific operations with caching
  const searchContacts = useCallback(async (query) => {
    const cacheKey = `contacts_search_${query}`;
    const cached = await aiCacheService.get('contactSearch', { query });
    
    if (cached) {
      return cached;
    }
    
    const result = await contactService.searchByName(query);
    if (result.success) {
      await aiCacheService.set('contactSearch', { query }, result.data);
      return result.data;
    }
    return [];
  }, []);

  const getContactsByAccount = useCallback(async (accountId) => {
    const cacheKey = `contacts_by_account_${accountId}`;
    const cached = await aiCacheService.get('contactsByAccount', { accountId });
    
    if (cached) {
      return cached;
    }
    
    const result = await contactService.getByAccount(accountId);
    if (result.success) {
      await aiCacheService.set('contactsByAccount', { accountId }, result.data);
      return result.data;
    }
    return [];
  }, []);

  return {
    ...entityHook,
    searchContacts,
    getContactsByAccount
  };
};

// Optimized Deals Hook with Pipeline Intelligence
export const useOptimizedDeals = (initialFilters = {}) => {
  const entityHook = useOptimizedEntity(dealService, 'deals', initialFilters);
  const [pipelineData, setPipelineData] = useState({});
  const [revenueMetrics, setRevenueMetrics] = useState({});

  // Pipeline data with caching
  const { data: pipelineInfo } = useQuery({
    queryKey: ['deals', 'pipeline'],
    queryFn: async () => {
      const cached = await aiCacheService.get('dealsPipeline', {});
      if (cached) {
        return cached;
      }
      
      const result = await dealService.getPipelineData();
      if (result.success) {
        await aiCacheService.set('dealsPipeline', {}, result.data);
        return result.data;
      }
      return {};
    },
    ...CACHE_CONFIG,
    onSuccess: setPipelineData
  });

  // Revenue metrics with caching
  const { data: revenueInfo } = useQuery({
    queryKey: ['deals', 'revenue'],
    queryFn: async () => {
      const cached = await aiCacheService.get('dealsRevenue', {});
      if (cached) {
        return cached;
      }
      
      const result = await dealService.getRevenueMetrics();
      if (result.success) {
        await aiCacheService.set('dealsRevenue', {}, result.data);
        return result.data;
      }
      return {};
    },
    ...CACHE_CONFIG,
    onSuccess: setRevenueMetrics
  });

  const getDealsByStage = useCallback(async (stage) => {
    const cached = await aiCacheService.get('dealsByStage', { stage });
    if (cached) {
      return cached;
    }
    
    const result = await dealService.getByStage(stage);
    if (result.success) {
      await aiCacheService.set('dealsByStage', { stage }, result.data);
      return result.data;
    }
    return [];
  }, []);

  return {
    ...entityHook,
    pipelineData,
    revenueMetrics,
    getDealsByStage
  };
};

// Optimized Leads Hook with Scoring Intelligence
export const useOptimizedLeads = (initialFilters = {}) => {
  const entityHook = useOptimizedEntity(leadService, 'leads', initialFilters);

  const getLeadsByStatus = useCallback(async (status) => {
    const cached = await aiCacheService.get('leadsByStatus', { status });
    if (cached) {
      return cached;
    }
    
    const result = await leadService.getByStatus(status);
    if (result.success) {
      await aiCacheService.set('leadsByStatus', { status }, result.data);
      return result.data;
    }
    return [];
  }, []);

  const getLeadsBySource = useCallback(async (source) => {
    const cached = await aiCacheService.get('leadsBySource', { source });
    if (cached) {
      return cached;
    }
    
    const result = await leadService.getBySource(source);
    if (result.success) {
      await aiCacheService.set('leadsBySource', { source }, result.data);
      return result.data;
    }
    return [];
  }, []);

  const convertLead = useCallback(async (leadId, contactData = {}) => {
    const result = await leadService.convertLead(leadId, contactData);
    if (result.success) {
      // Invalidate related caches
      await aiCacheService.clear('leads');
      await aiCacheService.clear('contacts');
      await aiCacheService.clear('deals');
      
      return result.data;
    }
    throw new Error(result.error);
  }, []);

  return {
    ...entityHook,
    getLeadsByStatus,
    getLeadsBySource,
    convertLead
  };
};

// Optimized Tasks Hook
export const useOptimizedTasks = (initialFilters = {}) => {
  const entityHook = useOptimizedEntity(taskService, 'tasks', initialFilters);

  const getTasksByStatus = useCallback(async (status) => {
    const cached = await aiCacheService.get('tasksByStatus', { status });
    if (cached) {
      return cached;
    }
    
    const result = await taskService.getByStatus(status);
    if (result.success) {
      await aiCacheService.set('tasksByStatus', { status }, result.data);
      return result.data;
    }
    return [];
  }, []);

  const getOverdueTasks = useCallback(async () => {
    const cached = await aiCacheService.get('overdueTasks', {});
    if (cached) {
      return cached;
    }
    
    const result = await taskService.getOverdue();
    if (result.success) {
      await aiCacheService.set('overdueTasks', {}, result.data);
      return result.data;
    }
    return [];
  }, []);

  return {
    ...entityHook,
    getTasksByStatus,
    getOverdueTasks
  };
};

// Optimized Accounts Hook
export const useOptimizedAccounts = (initialFilters = {}) => {
  return useOptimizedEntity(accountService, 'accounts', initialFilters);
};

// Optimized Dashboard Analytics Hook
export const useOptimizedDashboardAnalytics = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: async () => {
      const cached = await aiCacheService.get('dashboardAnalytics', {});
      if (cached) {
        return cached;
      }
      
      const result = await analyticsService.getDashboardData();
      if (result.success) {
        await aiCacheService.set('dashboardAnalytics', {}, result.data);
        return result.data;
      }
      throw new Error(result.error);
    },
    ...CACHE_CONFIG,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return {
    data: data || {},
    loading: isLoading,
    error,
    refresh: refetch
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    apiCalls: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    const updateMetrics = async () => {
      const cacheStats = await aiCacheService.getAllStatistics();
      const totalHits = Object.values(cacheStats).reduce((sum, stat) => sum + stat.hits, 0);
      const totalRequests = Object.values(cacheStats).reduce((sum, stat) => sum + stat.hits + stat.misses, 0);
      
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0
      }));
    };

    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  return metrics;
};