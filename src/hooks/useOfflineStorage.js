import { useState, useEffect } from 'react';

// IndexedDB wrapper for offline storage
class OfflineStorage {
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
        if (!db.objectStoreNames.contains('leads')) {
          const leadsStore = db.createObjectStore('leads', { keyPath: 'id' });
          leadsStore.createIndex('status', 'status', { unique: false });
          leadsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('contacts')) {
          const contactsStore = db.createObjectStore('contacts', { keyPath: 'id' });
          contactsStore.createIndex('company', 'company', { unique: false });
        }

        if (!db.objectStoreNames.contains('accounts')) {
          const accountsStore = db.createObjectStore('accounts', { keyPath: 'id' });
          accountsStore.createIndex('industry', 'industry', { unique: false });
        }

        if (!db.objectStoreNames.contains('deals')) {
          const dealsStore = db.createObjectStore('deals', { keyPath: 'id' });
          dealsStore.createIndex('stage', 'stage', { unique: false });
        }

        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id' });
          activitiesStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async get(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set(storeName, data) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async delete(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clear(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addToPendingSync(operation, data) {
    const syncItem = {
      operation,
      data,
      timestamp: Date.now(),
      retries: 0
    };
    
    return this.set('pendingSync', syncItem);
  }

  async getPendingSync() {
    return this.getAll('pendingSync');
  }

  async removePendingSync(id) {
    return this.delete('pendingSync', id);
  }
}

// Custom hook for offline storage
export const useOfflineStorage = () => {
  const [storage] = useState(() => new OfflineStorage());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize storage
    storage.init();

    // Check pending sync items
    const checkPendingSync = async () => {
      try {
        const pending = await storage.getPendingSync();
        setPendingSyncCount(pending.length);
      } catch (error) {
        console.error('Error checking pending sync:', error);
      }
    };

    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [storage]);

  const saveOffline = async (storeName, data) => {
    try {
      await storage.set(storeName, data);
      
      // Add to pending sync if offline
      if (!isOnline) {
        await storage.addToPendingSync('save', { storeName, data });
        setPendingSyncCount(prev => prev + 1);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving offline:', error);
      return false;
    }
  };

  const getOffline = async (storeName, key = null) => {
    try {
      if (key) {
        return await storage.get(storeName, key);
      } else {
        return await storage.getAll(storeName);
      }
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  };

  const deleteOffline = async (storeName, key) => {
    try {
      await storage.delete(storeName, key);
      
      // Add to pending sync if offline
      if (!isOnline) {
        await storage.addToPendingSync('delete', { storeName, key });
        setPendingSyncCount(prev => prev + 1);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting offline:', error);
      return false;
    }
  };

  const syncPendingData = async () => {
    if (!isOnline) return false;

    try {
      const pendingItems = await storage.getPendingSync();
      
      for (const item of pendingItems) {
        try {
          // Here you would implement the actual sync logic
          // For now, we'll just remove the item from pending sync
          await storage.removePendingSync(item.id);
          setPendingSyncCount(prev => prev - 1);
        } catch (error) {
          console.error('Error syncing item:', error);
          // Increment retry count
          item.retries = (item.retries || 0) + 1;
          if (item.retries < 3) {
            await storage.set('pendingSync', item);
          } else {
            // Remove after 3 failed attempts
            await storage.removePendingSync(item.id);
            setPendingSyncCount(prev => prev - 1);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing pending data:', error);
      return false;
    }
  };

  const clearOfflineData = async (storeName) => {
    try {
      await storage.clear(storeName);
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  };

  return {
    isOnline,
    pendingSyncCount,
    saveOffline,
    getOffline,
    deleteOffline,
    syncPendingData,
    clearOfflineData,
    storage
  };
};

export default useOfflineStorage;