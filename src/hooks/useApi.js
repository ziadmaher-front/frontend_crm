// Modern API Hook with Advanced Features
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore, useUIStore } from '@/stores';
import { apiClient } from '@/services/api';
import { useNotifications } from './useNotifications';
import { useOnlineStatus } from './useOnlineStatus';

// Cache implementation
class APICache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new APICache();

// Request queue for offline support
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  add(request) {
    this.queue.push(request);
    this.process();
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      try {
        await request.execute();
        request.onSuccess?.();
      } catch (error) {
        request.onError?.(error);
      }
    }
    
    this.processing = false;
  }

  clear() {
    this.queue = [];
  }
}

const requestQueue = new RequestQueue();

export const useApi = (options = {}) => {
  const {
    baseURL = '',
    defaultHeaders = {},
    enableCache = true,
    enableOptimisticUpdates = true,
    enableOfflineQueue = true,
    retryAttempts = 3,
    retryDelay = 1000,
    timeout = 30000,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuthStore();
  const { addNotification } = useNotifications();
  const { isOnline } = useOnlineStatus();
  const abortControllerRef = useRef(null);

  // Request interceptor
  const createRequest = useCallback((config) => {
    const headers = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers,
    };

    return {
      ...config,
      headers,
      timeout,
      baseURL: baseURL || config.baseURL,
    };
  }, [token, defaultHeaders, baseURL, timeout]);

  // Response interceptor
  const handleResponse = useCallback(async (response, config) => {
    if (response.status === 401) {
      logout();
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'Your session has expired. Please log in again.',
      });
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Cache successful GET requests
    if (enableCache && config.method === 'GET') {
      const cacheKey = `${config.url}?${new URLSearchParams(config.params || {})}`;
      apiCache.set(cacheKey, data);
    }

    return data;
  }, [logout, addNotification, enableCache]);

  // Retry logic
  const executeWithRetry = useCallback(async (requestFn, attempts = retryAttempts) => {
    try {
      return await requestFn();
    } catch (error) {
      if (attempts > 0 && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry(requestFn, attempts - 1);
      }
      throw error;
    }
  }, [retryAttempts, retryDelay]);

  // Main request function
  const request = useCallback(async (config) => {
    // Check cache for GET requests
    if (enableCache && config.method === 'GET') {
      const cacheKey = `${config.url}?${new URLSearchParams(config.params || {})}`;
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Handle offline requests
    if (!isOnline && enableOfflineQueue) {
      return new Promise((resolve, reject) => {
        requestQueue.add({
          execute: () => request({ ...config, _skipOfflineCheck: true }),
          onSuccess: () => resolve(),
          onError: reject,
        });
      });
    }

    setLoading(true);
    setError(null);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const requestConfig = createRequest({
      ...config,
      signal: abortControllerRef.current.signal,
    });

    try {
      const response = await executeWithRetry(async () => {
        return await fetch(`${requestConfig.baseURL}${requestConfig.url}`, {
          method: requestConfig.method || 'GET',
          headers: requestConfig.headers,
          body: requestConfig.data ? JSON.stringify(requestConfig.data) : undefined,
          signal: requestConfig.signal,
        });
      });

      const data = await handleResponse(response, requestConfig);
      setLoading(false);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setLoading(false);
        
        addNotification({
          type: 'error',
          title: 'Request Failed',
          message: err.message,
        });
      }
      throw err;
    }
  }, [
    enableCache,
    isOnline,
    enableOfflineQueue,
    createRequest,
    executeWithRetry,
    handleResponse,
    addNotification,
  ]);

  // HTTP methods
  const get = useCallback((url, params = {}, config = {}) => {
    return request({
      method: 'GET',
      url,
      params,
      ...config,
    });
  }, [request]);

  const post = useCallback((url, data = {}, config = {}) => {
    return request({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }, [request]);

  const put = useCallback((url, data = {}, config = {}) => {
    return request({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }, [request]);

  const patch = useCallback((url, data = {}, config = {}) => {
    return request({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }, [request]);

  const del = useCallback((url, config = {}) => {
    return request({
      method: 'DELETE',
      url,
      ...config,
    });
  }, [request]);

  // Optimistic updates
  const optimisticUpdate = useCallback(async (
    updateFn,
    requestFn,
    rollbackFn
  ) => {
    if (!enableOptimisticUpdates) {
      return await requestFn();
    }

    // Apply optimistic update
    updateFn();

    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      // Rollback on error
      rollbackFn();
      throw error;
    }
  }, [enableOptimisticUpdates]);

  // Batch requests
  const batch = useCallback(async (requests) => {
    const promises = requests.map(req => request(req));
    return await Promise.allSettled(promises);
  }, [request]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cache management
  const clearCache = useCallback((pattern) => {
    if (pattern) {
      apiCache.invalidatePattern(pattern);
    } else {
      apiCache.clear();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    // State
    loading,
    error,
    
    // HTTP methods
    get,
    post,
    put,
    patch,
    delete: del,
    request,
    
    // Advanced features
    optimisticUpdate,
    batch,
    cancel,
    clearCache,
    
    // Utilities
    isOnline,
  };
};

export default useApi;