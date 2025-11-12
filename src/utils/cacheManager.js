/**
 * Advanced Cache Manager
 * Provides multi-layer caching with intelligent cache strategies
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.sessionCache = sessionStorage;
    this.localCache = localStorage;
    this.indexedDBCache = null;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
    
    // Cache configuration
    this.config = {
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      maxMemoryItems: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSessionSize: 5 * 1024 * 1024, // 5MB
      maxLocalSize: 10 * 1024 * 1024, // 10MB
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      enableIndexedDB: true
    };

    this.initializeIndexedDB();
    this.startCleanupInterval();
  }

  /**
   * Initialize IndexedDB for large data caching
   */
  async initializeIndexedDB() {
    if (!this.config.enableIndexedDB || !window.indexedDB) return;

    try {
      const request = indexedDB.open('CRMCache', 1);
      
      request.onerror = () => {
        console.warn('IndexedDB initialization failed');
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.indexedDBCache = event.target.result;
      };
    } catch (error) {
      console.warn('IndexedDB not available:', error);
    }
  }

  /**
   * Generate cache key with namespace and version
   */
  generateKey(key, namespace = 'default', version = '1') {
    return `${namespace}:${version}:${key}`;
  }

  /**
   * Compress data if it exceeds threshold
   */
  compress(data) {
    if (!this.config.enableCompression) return data;
    
    const serialized = JSON.stringify(data);
    if (serialized.length < this.config.compressionThreshold) return data;

    try {
      // Simple compression using LZ-string or similar
      // For demo purposes, we'll use a basic compression simulation
      return {
        compressed: true,
        data: btoa(serialized), // Base64 encoding as compression simulation
        originalSize: serialized.length
      };
    } catch (error) {
      return data;
    }
  }

  /**
   * Decompress data if compressed
   */
  decompress(data) {
    if (!data || !data.compressed) return data;

    try {
      return JSON.parse(atob(data.data));
    } catch (error) {
      console.warn('Decompression failed:', error);
      return null;
    }
  }

  /**
   * Calculate data size in bytes
   */
  calculateSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Memory cache operations
   */
  setMemoryCache(key, data, ttl = this.config.defaultTTL) {
    const now = Date.now();
    const item = {
      data: this.compress(data),
      expiry: now + ttl,
      created: now,
      accessed: now,
      accessCount: 0,
      size: this.calculateSize(data)
    };

    // Check memory limits
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      this.evictLRU();
    }

    this.memoryCache.set(key, item);
  }

  getMemoryCache(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (item.expiry < now) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessed = now;
    item.accessCount++;
    
    return this.decompress(item.data);
  }

  /**
   * Session storage cache operations
   */
  setSessionCache(key, data, ttl = this.config.defaultTTL) {
    try {
      const item = {
        data: this.compress(data),
        expiry: Date.now() + ttl
      };
      
      this.sessionCache.setItem(key, JSON.stringify(item));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.clearExpiredSessionCache();
        try {
          this.sessionCache.setItem(key, JSON.stringify(item));
        } catch (retryError) {
          console.warn('Session cache full, unable to store:', key);
        }
      }
    }
  }

  getSessionCache(key) {
    try {
      const item = JSON.parse(this.sessionCache.getItem(key));
      if (!item) return null;

      if (item.expiry < Date.now()) {
        this.sessionCache.removeItem(key);
        return null;
      }

      return this.decompress(item.data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Local storage cache operations
   */
  setLocalCache(key, data, ttl = this.config.defaultTTL * 12) { // Longer TTL for local storage
    try {
      const item = {
        data: this.compress(data),
        expiry: Date.now() + ttl
      };
      
      this.localCache.setItem(key, JSON.stringify(item));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.clearExpiredLocalCache();
        try {
          this.localCache.setItem(key, JSON.stringify(item));
        } catch (retryError) {
          console.warn('Local cache full, unable to store:', key);
        }
      }
    }
  }

  getLocalCache(key) {
    try {
      const item = JSON.parse(this.localCache.getItem(key));
      if (!item) return null;

      if (item.expiry < Date.now()) {
        this.localCache.removeItem(key);
        return null;
      }

      return this.decompress(item.data);
    } catch (error) {
      return null;
    }
  }

  /**
   * IndexedDB cache operations
   */
  async setIndexedDBCache(key, data, ttl = this.config.defaultTTL * 24) { // Even longer TTL
    if (!this.indexedDBCache) return;

    try {
      const transaction = this.indexedDBCache.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const item = {
        key,
        data: this.compress(data),
        expiry: Date.now() + ttl,
        created: Date.now()
      };

      await store.put(item);
    } catch (error) {
      console.warn('IndexedDB cache write failed:', error);
    }
  }

  async getIndexedDBCache(key) {
    if (!this.indexedDBCache) return null;

    try {
      const transaction = this.indexedDBCache.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const item = request.result;
          if (!item) {
            resolve(null);
            return;
          }

          if (item.expiry < Date.now()) {
            // Clean up expired item
            const deleteTransaction = this.indexedDBCache.transaction(['cache'], 'readwrite');
            deleteTransaction.objectStore('cache').delete(key);
            resolve(null);
            return;
          }

          resolve(this.decompress(item.data));
        };

        request.onerror = () => resolve(null);
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Multi-layer cache get with fallback strategy
   */
  async get(key, namespace = 'default', version = '1') {
    const cacheKey = this.generateKey(key, namespace, version);
    this.cacheStats.totalRequests++;

    // Try memory cache first (fastest)
    let data = this.getMemoryCache(cacheKey);
    if (data !== null) {
      this.cacheStats.hits++;
      return data;
    }

    // Try session cache
    data = this.getSessionCache(cacheKey);
    if (data !== null) {
      this.cacheStats.hits++;
      // Promote to memory cache
      this.setMemoryCache(cacheKey, data);
      return data;
    }

    // Try local cache
    data = this.getLocalCache(cacheKey);
    if (data !== null) {
      this.cacheStats.hits++;
      // Promote to higher levels
      this.setMemoryCache(cacheKey, data);
      this.setSessionCache(cacheKey, data);
      return data;
    }

    // Try IndexedDB cache
    data = await this.getIndexedDBCache(cacheKey);
    if (data !== null) {
      this.cacheStats.hits++;
      // Promote to all higher levels
      this.setMemoryCache(cacheKey, data);
      this.setSessionCache(cacheKey, data);
      this.setLocalCache(cacheKey, data);
      return data;
    }

    this.cacheStats.misses++;
    return null;
  }

  /**
   * Multi-layer cache set
   */
  async set(key, data, options = {}) {
    const {
      namespace = 'default',
      version = '1',
      ttl = this.config.defaultTTL,
      layers = ['memory', 'session', 'local', 'indexeddb']
    } = options;

    const cacheKey = this.generateKey(key, namespace, version);
    const dataSize = this.calculateSize(data);

    // Determine appropriate cache layers based on data size and configuration
    if (layers.includes('memory') && dataSize < 1024 * 1024) { // < 1MB for memory
      this.setMemoryCache(cacheKey, data, ttl);
    }

    if (layers.includes('session') && dataSize < this.config.maxSessionSize / 10) {
      this.setSessionCache(cacheKey, data, ttl);
    }

    if (layers.includes('local') && dataSize < this.config.maxLocalSize / 10) {
      this.setLocalCache(cacheKey, data, ttl * 12);
    }

    if (layers.includes('indexeddb') && this.indexedDBCache) {
      await this.setIndexedDBCache(cacheKey, data, ttl * 24);
    }
  }

  /**
   * Cache with automatic fetching and refresh
   */
  async getOrFetch(key, fetchFunction, options = {}) {
    const {
      namespace = 'default',
      version = '1',
      ttl = this.config.defaultTTL,
      forceRefresh = false,
      backgroundRefresh = true
    } = options;

    if (!forceRefresh) {
      const cachedData = await this.get(key, namespace, version);
      if (cachedData !== null) {
        // Background refresh if enabled
        if (backgroundRefresh) {
          this.backgroundRefresh(key, fetchFunction, options);
        }
        return cachedData;
      }
    }

    try {
      const data = await fetchFunction();
      await this.set(key, data, { namespace, version, ttl });
      return data;
    } catch (error) {
      // Return stale data if available
      const staleData = await this.get(key, namespace, version);
      if (staleData !== null) {
        console.warn('Using stale cache data due to fetch error:', error);
        return staleData;
      }
      throw error;
    }
  }

  /**
   * Background refresh for cache warming
   */
  async backgroundRefresh(key, fetchFunction, options) {
    setTimeout(async () => {
      try {
        const data = await fetchFunction();
        await this.set(key, data, options);
      } catch (error) {
        console.warn('Background refresh failed:', error);
      }
    }, 0);
  }

  /**
   * LRU eviction for memory cache
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.memoryCache) {
      if (item.accessed < oldestTime) {
        oldestTime = item.accessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.cacheStats.evictions++;
    }
  }

  /**
   * Clear expired items from session cache
   */
  clearExpiredSessionCache() {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < this.sessionCache.length; i++) {
      const key = this.sessionCache.key(i);
      try {
        const item = JSON.parse(this.sessionCache.getItem(key));
        if (item && item.expiry && item.expiry < now) {
          keysToRemove.push(key);
        }
      } catch (error) {
        keysToRemove.push(key); // Remove invalid items
      }
    }

    keysToRemove.forEach(key => this.sessionCache.removeItem(key));
  }

  /**
   * Clear expired items from local cache
   */
  clearExpiredLocalCache() {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < this.localCache.length; i++) {
      const key = this.localCache.key(i);
      try {
        const item = JSON.parse(this.localCache.getItem(key));
        if (item && item.expiry && item.expiry < now) {
          keysToRemove.push(key);
        }
      } catch (error) {
        keysToRemove.push(key); // Remove invalid items
      }
    }

    keysToRemove.forEach(key => this.localCache.removeItem(key));
  }

  /**
   * Start periodic cleanup
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Cleanup expired items from all caches
   */
  cleanup() {
    const now = Date.now();

    // Clean memory cache
    for (const [key, item] of this.memoryCache) {
      if (item.expiry < now) {
        this.memoryCache.delete(key);
      }
    }

    // Clean session and local storage
    this.clearExpiredSessionCache();
    this.clearExpiredLocalCache();

    // Clean IndexedDB
    this.cleanupIndexedDB();
  }

  /**
   * Cleanup IndexedDB expired items
   */
  async cleanupIndexedDB() {
    if (!this.indexedDBCache) return;

    try {
      const transaction = this.indexedDBCache.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      const range = IDBKeyRange.upperBound(Date.now());
      
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn('IndexedDB cleanup failed:', error);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  invalidate(pattern, namespace = 'default') {
    const regex = new RegExp(pattern);
    const prefix = `${namespace}:`;

    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix) && regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from session storage
    for (let i = this.sessionCache.length - 1; i >= 0; i--) {
      const key = this.sessionCache.key(i);
      if (key && key.startsWith(prefix) && regex.test(key)) {
        this.sessionCache.removeItem(key);
      }
    }

    // Clear from local storage
    for (let i = this.localCache.length - 1; i >= 0; i--) {
      const key = this.localCache.key(i);
      if (key && key.startsWith(prefix) && regex.test(key)) {
        this.localCache.removeItem(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.cacheStats.totalRequests > 0 
      ? (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2)
      : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memoryItems: this.memoryCache.size,
      memorySize: Array.from(this.memoryCache.values())
        .reduce((total, item) => total + item.size, 0)
    };
  }

  /**
   * Clear all caches
   */
  clear() {
    this.memoryCache.clear();
    this.sessionCache.clear();
    this.localCache.clear();
    
    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction(['cache'], 'readwrite');
      transaction.objectStore('cache').clear();
    }

    // Reset stats
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;

// Export utility functions
export const cache = {
  get: (key, namespace, version) => cacheManager.get(key, namespace, version),
  set: (key, data, options) => cacheManager.set(key, data, options),
  getOrFetch: (key, fetchFn, options) => cacheManager.getOrFetch(key, fetchFn, options),
  invalidate: (pattern, namespace) => cacheManager.invalidate(pattern, namespace),
  clear: () => cacheManager.clear(),
  stats: () => cacheManager.getStats()
};