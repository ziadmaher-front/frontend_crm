import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from './useNotifications';

// IndexedDB utilities for offline storage
class OfflineDB {
  constructor(dbName = 'SalesProCRM', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for different data types
        const stores = [
          'leads', 'contacts', 'deals', 'activities', 'tasks',
          'sync_queue', 'conflict_resolution', 'metadata'
        ];
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp');
            store.createIndex('lastModified', 'lastModified');
            store.createIndex('syncStatus', 'syncStatus');
          }
        });
      };
    });
  }

  async get(storeName, id) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName, filter = null) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let results = request.result;
        if (filter) {
          results = results.filter(filter);
        }
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...data,
        lastModified: new Date().toISOString(),
        syncStatus: 'pending'
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Conflict resolution strategies
const CONFLICT_RESOLUTION_STRATEGIES = {
  CLIENT_WINS: 'client_wins',
  SERVER_WINS: 'server_wins',
  MERGE: 'merge',
  MANUAL: 'manual'
};

// Sync status types
const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
  ERROR: 'error'
};

// Advanced offline sync engine
class OfflineSyncEngine {
  constructor(db, apiClient, notifications) {
    this.db = db;
    this.apiClient = apiClient;
    this.notifications = notifications;
    this.syncInProgress = false;
    this.conflictResolver = new ConflictResolver();
  }

  async queueForSync(storeName, data, operation = 'upsert') {
    const syncItem = {
      id: `${storeName}_${data.id}_${Date.now()}`,
      storeName,
      operation,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      priority: data.priority || 'normal'
    };

    await this.db.put('sync_queue', syncItem);
    
    // Trigger background sync if service worker is available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('background-sync');
      });
    }

    return syncItem;
  }

  async performSync() {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    
    try {
      const queuedItems = await this.db.getAll('sync_queue');
      const sortedItems = this.prioritizeSync(queuedItems);
      
      console.log(`Starting sync of ${sortedItems.length} items`);
      
      for (const item of sortedItems) {
        try {
          await this.syncItem(item);
          await this.db.delete('sync_queue', item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          await this.handleSyncError(item, error);
        }
      }
      
      this.notifications.success('Data synchronized successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifications.error('Synchronization failed');
    } finally {
      this.syncInProgress = false;
    }
  }

  prioritizeSync(items) {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    return items.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  }

  async syncItem(item) {
    const { storeName, operation, data } = item;
    
    switch (operation) {
      case 'create':
        return await this.syncCreate(storeName, data);
      case 'update':
        return await this.syncUpdate(storeName, data);
      case 'delete':
        return await this.syncDelete(storeName, data);
      case 'upsert':
      default:
        return await this.syncUpsert(storeName, data);
    }
  }

  async syncCreate(storeName, data) {
    const response = await this.apiClient.post(`/api/${storeName}`, data);
    
    if (response.ok) {
      const serverData = await response.json();
      await this.db.put(storeName, { ...serverData, syncStatus: SYNC_STATUS.SYNCED });
      return serverData;
    }
    
    throw new Error(`Create failed: ${response.status} ${response.statusText}`);
  }

  async syncUpdate(storeName, data) {
    try {
      const response = await this.apiClient.put(`/api/${storeName}/${data.id}`, data);
      
      if (response.ok) {
        const serverData = await response.json();
        await this.db.put(storeName, { ...serverData, syncStatus: SYNC_STATUS.SYNCED });
        return serverData;
      }
      
      if (response.status === 409) {
        // Conflict detected
        const serverData = await response.json();
        await this.handleConflict(storeName, data, serverData);
        return;
      }
      
      throw new Error(`Update failed: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (error.name === 'NetworkError' || !navigator.onLine) {
        // Keep in queue for later sync
        throw error;
      }
      
      // Handle other errors
      throw error;
    }
  }

  async syncDelete(storeName, data) {
    const response = await this.apiClient.delete(`/api/${storeName}/${data.id}`);
    
    if (response.ok || response.status === 404) {
      await this.db.delete(storeName, data.id);
      return;
    }
    
    throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
  }

  async syncUpsert(storeName, data) {
    // Try update first, then create if not found
    try {
      return await this.syncUpdate(storeName, data);
    } catch (error) {
      if (error.message.includes('404')) {
        return await this.syncCreate(storeName, data);
      }
      throw error;
    }
  }

  async handleConflict(storeName, localData, serverData) {
    const conflict = {
      id: `conflict_${storeName}_${localData.id}_${Date.now()}`,
      storeName,
      localData,
      serverData,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    await this.db.put('conflict_resolution', conflict);
    
    // Auto-resolve based on strategy
    const strategy = await this.getConflictStrategy(storeName);
    const resolved = await this.conflictResolver.resolve(conflict, strategy);
    
    if (resolved) {
      await this.db.put(storeName, { ...resolved, syncStatus: SYNC_STATUS.SYNCED });
      await this.db.delete('conflict_resolution', conflict.id);
    } else {
      // Manual resolution required
      this.notifications.warning(`Conflict detected in ${storeName}. Manual resolution required.`);
    }
  }

  async getConflictStrategy(storeName) {
    // Get user preference or default strategy
    const metadata = await this.db.get('metadata', `conflict_strategy_${storeName}`);
    return metadata?.strategy || CONFLICT_RESOLUTION_STRATEGIES.MERGE;
  }

  async handleSyncError(item, error) {
    item.retryCount = (item.retryCount || 0) + 1;
    item.lastError = error.message;
    item.lastRetry = new Date().toISOString();

    if (item.retryCount < 3) {
      // Re-queue with exponential backoff
      setTimeout(async () => {
        await this.db.put('sync_queue', item);
      }, Math.pow(2, item.retryCount) * 1000);
    } else {
      // Move to error state
      item.syncStatus = SYNC_STATUS.ERROR;
      await this.db.put('sync_queue', item);
      this.notifications.error(`Failed to sync ${item.storeName} after 3 attempts`);
    }
  }
}

// Conflict resolution utility
class ConflictResolver {
  async resolve(conflict, strategy) {
    const { localData, serverData } = conflict;

    switch (strategy) {
      case CONFLICT_RESOLUTION_STRATEGIES.CLIENT_WINS:
        return localData;
        
      case CONFLICT_RESOLUTION_STRATEGIES.SERVER_WINS:
        return serverData;
        
      case CONFLICT_RESOLUTION_STRATEGIES.MERGE:
        return this.mergeData(localData, serverData);
        
      case CONFLICT_RESOLUTION_STRATEGIES.MANUAL:
      default:
        return null; // Requires manual resolution
    }
  }

  mergeData(localData, serverData) {
    // Intelligent merge based on timestamps and field types
    const merged = { ...serverData };
    
    Object.keys(localData).forEach(key => {
      if (key === 'id' || key === 'createdAt') {
        // Keep server values for these fields
        return;
      }
      
      if (key === 'lastModified' || key === 'updatedAt') {
        // Use the latest timestamp
        merged[key] = new Date(localData[key]) > new Date(serverData[key]) 
          ? localData[key] 
          : serverData[key];
        return;
      }
      
      // For other fields, prefer local changes if they're more recent
      if (localData.lastModified && serverData.lastModified) {
        if (new Date(localData.lastModified) > new Date(serverData.lastModified)) {
          merged[key] = localData[key];
        }
      } else if (localData[key] !== undefined && localData[key] !== null) {
        merged[key] = localData[key];
      }
    });
    
    return merged;
  }
}

// Main hook
export const useOfflineSync = (options = {}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [pendingItems, setPendingItems] = useState(0);
  const [conflicts, setConflicts] = useState([]);
  
  const dbRef = useRef(null);
  const syncEngineRef = useRef(null);
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  // Initialize offline database
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = new OfflineDB();
        await db.init();
        dbRef.current = db;
        
        syncEngineRef.current = new OfflineSyncEngine(
          db,
          options.apiClient || window.fetch,
          notifications
        );
        
        // Load initial state
        await updatePendingCount();
        await updateConflicts();
      } catch (error) {
        console.error('Failed to initialize offline DB:', error);
        notifications.error('Failed to initialize offline storage');
      }
    };

    initDB();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      if (syncEngineRef.current) {
        syncEngineRef.current.performSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = useCallback(async () => {
    if (!dbRef.current) return;
    
    try {
      const queuedItems = await dbRef.current.getAll('sync_queue');
      setPendingItems(queuedItems.length);
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }, []);

  const updateConflicts = useCallback(async () => {
    if (!dbRef.current) return;
    
    try {
      const conflictItems = await dbRef.current.getAll('conflict_resolution', 
        item => item.status === 'pending'
      );
      setConflicts(conflictItems);
    } catch (error) {
      console.error('Failed to update conflicts:', error);
    }
  }, []);

  // Store data offline
  const storeOffline = useCallback(async (storeName, data, operation = 'upsert') => {
    if (!dbRef.current || !syncEngineRef.current) {
      throw new Error('Offline storage not initialized');
    }

    try {
      // Store locally
      await dbRef.current.put(storeName, data);
      
      // Queue for sync
      await syncEngineRef.current.queueForSync(storeName, data, operation);
      
      // Update UI state
      await updatePendingCount();
      
      // Invalidate related queries
      queryClient.invalidateQueries(storeName);
      
      return data;
    } catch (error) {
      console.error('Failed to store offline:', error);
      throw error;
    }
  }, [queryClient, updatePendingCount]);

  // Get data from offline storage
  const getOffline = useCallback(async (storeName, id = null) => {
    if (!dbRef.current) {
      throw new Error('Offline storage not initialized');
    }

    try {
      if (id) {
        return await dbRef.current.get(storeName, id);
      } else {
        return await dbRef.current.getAll(storeName);
      }
    } catch (error) {
      console.error('Failed to get offline data:', error);
      throw error;
    }
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    if (!syncEngineRef.current) {
      throw new Error('Sync engine not initialized');
    }

    setSyncStatus('syncing');
    
    try {
      await syncEngineRef.current.performSync();
      await updatePendingCount();
      await updateConflicts();
      setSyncStatus('completed');
    } catch (error) {
      setSyncStatus('error');
      throw error;
    }
  }, [updatePendingCount, updateConflicts]);

  // Resolve conflict
  const resolveConflict = useCallback(async (conflictId, resolution) => {
    if (!dbRef.current || !syncEngineRef.current) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const conflict = await dbRef.current.get('conflict_resolution', conflictId);
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      // Apply resolution
      await dbRef.current.put(conflict.storeName, resolution);
      await dbRef.current.delete('conflict_resolution', conflictId);
      
      // Update UI state
      await updateConflicts();
      
      notifications.success('Conflict resolved successfully');
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      notifications.error('Failed to resolve conflict');
      throw error;
    }
  }, [notifications, updateConflicts]);

  // Clear offline data
  const clearOfflineData = useCallback(async (storeName = null) => {
    if (!dbRef.current) {
      throw new Error('Offline storage not initialized');
    }

    try {
      if (storeName) {
        await dbRef.current.clear(storeName);
      } else {
        const stores = ['leads', 'contacts', 'deals', 'activities', 'tasks'];
        await Promise.all(stores.map(store => dbRef.current.clear(store)));
      }
      
      await updatePendingCount();
      queryClient.clear();
      
      notifications.success('Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      notifications.error('Failed to clear offline data');
      throw error;
    }
  }, [queryClient, notifications, updatePendingCount]);

  return {
    // State
    isOnline,
    syncStatus,
    pendingItems,
    conflicts,
    
    // Actions
    storeOffline,
    getOffline,
    forceSync,
    resolveConflict,
    clearOfflineData,
    
    // Utilities
    db: dbRef.current,
    syncEngine: syncEngineRef.current
  };
};

export default useOfflineSync;