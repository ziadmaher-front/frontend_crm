// Enhanced Progressive Web App Service
// Provides advanced PWA features including offline-first architecture, background sync, push notifications, and mobile optimization

export class EnhancedPWAService {
  constructor() {
    this.isInstalled = false;
    this.deferredPrompt = null;
    this.serviceWorker = null;
    this.offlineStorage = new Map();
    this.syncQueue = [];
    this.networkStatus = 'online';
    this.installPromptShown = false;
    this.updateAvailable = false;
    this.pushSubscription = null;
    this.backgroundSyncTags = new Set();
    this.offlineActions = new Map();
    this.cacheStrategies = new Map();
    this.deviceCapabilities = {};
    this.performanceMetrics = {
      cacheHitRate: 0,
      offlineUsage: 0,
      syncSuccess: 0,
      loadTimes: []
    };
    
    this.initializeEnhancedPWA();
  }

  // Initialize enhanced PWA functionality
  async initializeEnhancedPWA() {
    try {
      await this.registerServiceWorker();
      await this.setupOfflineStorage();
      await this.initializePushNotifications();
      await this.setupBackgroundSync();
      await this.detectDeviceCapabilities();
      await this.setupNetworkMonitoring();
      await this.initializeCacheStrategies();
      await this.setupPerformanceMonitoring();
      
      console.log('Enhanced PWA initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Enhanced PWA:', error);
    }
  }

  // Register and manage service worker
  async registerServiceWorker() {
    // Avoid registering service workers during development to prevent Vite dev-server interference
    if (import.meta?.env?.DEV) {
      console.log('[EnhancedPWA] Skipping service worker registration in development');
      return null;
    }
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/enhanced-sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        
        this.serviceWorker = registration;
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.emit('update-available', { registration });
            }
          });
        });
        
        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
        // Check for existing service worker
        if (registration.active) {
          this.emit('service-worker-ready');
        }
        
        return registration;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        throw error;
      }
    }
  }

  // Setup offline storage with IndexedDB
  async setupOfflineStorage() {
    try {
      // Initialize IndexedDB for offline data
      const dbRequest = indexedDB.open('SalesProOfflineDB', 2);
      
      dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('leads')) {
          const leadsStore = db.createObjectStore('leads', { keyPath: 'id' });
          leadsStore.createIndex('status', 'status', { unique: false });
          leadsStore.createIndex('lastModified', 'lastModified', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('contacts')) {
          const contactsStore = db.createObjectStore('contacts', { keyPath: 'id' });
          contactsStore.createIndex('company', 'company', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('deals')) {
          const dealsStore = db.createObjectStore('deals', { keyPath: 'id' });
          dealsStore.createIndex('stage', 'stage', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id' });
          activitiesStore.createIndex('type', 'type', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('offlineActions')) {
          db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      return new Promise((resolve, reject) => {
        dbRequest.onsuccess = () => {
          this.offlineDB = dbRequest.result;
          resolve(this.offlineDB);
        };
        dbRequest.onerror = () => reject(dbRequest.error);
      });
    } catch (error) {
      console.error('Failed to setup offline storage:', error);
      throw error;
    }
  }

  // Initialize push notifications
  async initializePushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted' && this.serviceWorker) {
          const subscription = await this.serviceWorker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || 'demo-key')
          });
          
          this.pushSubscription = subscription;
          
          // Send subscription to server
          await this.sendSubscriptionToServer(subscription);
          
          return subscription;
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    }
  }

  // Setup background sync
  async setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        // Register background sync tags
        const syncTags = ['lead-sync', 'contact-sync', 'deal-sync', 'activity-sync', 'file-upload'];
        
        for (const tag of syncTags) {
          this.backgroundSyncTags.add(tag);
        }
        
        // Listen for sync events
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SYNC_COMPLETE') {
            this.handleSyncComplete(event.data.tag, event.data.success);
          }
        });
        
        return true;
      } catch (error) {
        console.error('Failed to setup background sync:', error);
        return false;
      }
    }
  }

  // Detect device capabilities
  async detectDeviceCapabilities() {
    this.deviceCapabilities = {
      // Network capabilities
      connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
      onLine: navigator.onLine,
      
      // Device features
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator,
      vibration: 'vibrate' in navigator,
      battery: 'getBattery' in navigator,
      
      // Storage capabilities
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,
      
      // PWA features
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      
      // Device info
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      
      // Screen info
      screen: {
        width: screen.width,
        height: screen.height,
        orientation: screen.orientation?.type || 'unknown'
      },
      
      // Performance capabilities
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: navigator.deviceMemory || 'unknown'
    };
    
    // Get battery info if available
    if (this.deviceCapabilities.battery) {
      try {
        const battery = await navigator.getBattery();
        this.deviceCapabilities.batteryLevel = battery.level;
        this.deviceCapabilities.charging = battery.charging;
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
    
    return this.deviceCapabilities;
  }

  // Setup network monitoring
  setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.networkStatus = 'online';
      this.emit('network-status-change', { status: 'online' });
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.networkStatus = 'offline';
      this.emit('network-status-change', { status: 'offline' });
    });
    
    // Monitor connection changes
    if (this.deviceCapabilities.connection) {
      this.deviceCapabilities.connection.addEventListener('change', () => {
        const connection = this.deviceCapabilities.connection;
        this.emit('connection-change', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      });
    }
  }

  // Initialize cache strategies
  async initializeCacheStrategies() {
    this.cacheStrategies.set('static', 'cache-first');
    this.cacheStrategies.set('api', 'network-first');
    this.cacheStrategies.set('images', 'cache-first');
    this.cacheStrategies.set('dynamic', 'stale-while-revalidate');
    this.cacheStrategies.set('critical', 'cache-only');
  }

  // Setup performance monitoring
  setupPerformanceMonitoring() {
    // Monitor cache performance
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('cache')) {
            this.performanceMetrics.loadTimes.push(entry.duration);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  // Offline data management
  async saveOfflineData(storeName, data) {
    try {
      if (!this.offlineDB) {
        await this.setupOfflineStorage();
      }
      
      const transaction = this.offlineDB.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      if (Array.isArray(data)) {
        for (const item of data) {
          await store.put({ ...item, lastModified: Date.now(), offline: true });
        }
      } else {
        await store.put({ ...data, lastModified: Date.now(), offline: true });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  async getOfflineData(storeName, query = null) {
    try {
      if (!this.offlineDB) {
        return [];
      }
      
      const transaction = this.offlineDB.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (query) {
        const index = store.index(query.index);
        return await index.getAll(query.value);
      } else {
        return await store.getAll();
      }
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return [];
    }
  }

  // Queue actions for background sync
  async queueOfflineAction(action) {
    try {
      const actionWithId = {
        ...action,
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };
      
      this.offlineActions.set(actionWithId.id, actionWithId);
      
      // Save to IndexedDB
      if (this.offlineDB) {
        const transaction = this.offlineDB.transaction(['offlineActions'], 'readwrite');
        const store = transaction.objectStore('offlineActions');
        await store.add(actionWithId);
      }
      
      // Register for background sync
      if (this.serviceWorker && 'sync' in window.ServiceWorkerRegistration.prototype) {
        await this.serviceWorker.sync.register(action.syncTag || 'default-sync');
      }
      
      return actionWithId.id;
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      return null;
    }
  }

  // Process sync queue when online
  async processSyncQueue() {
    if (this.networkStatus !== 'online') {
      return;
    }
    
    try {
      const actions = Array.from(this.offlineActions.values());
      
      for (const action of actions) {
        try {
          await this.executeOfflineAction(action);
          this.offlineActions.delete(action.id);
          
          // Remove from IndexedDB
          if (this.offlineDB) {
            const transaction = this.offlineDB.transaction(['offlineActions'], 'readwrite');
            const store = transaction.objectStore('offlineActions');
            await store.delete(action.id);
          }
        } catch (error) {
          action.retryCount++;
          if (action.retryCount >= action.maxRetries) {
            console.error('Max retries reached for action:', action);
            this.offlineActions.delete(action.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to process sync queue:', error);
    }
  }

  // Execute offline action
  async executeOfflineAction(action) {
    const { type, data, endpoint, method = 'POST' } = action;
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Install app prompt
  async showInstallPrompt() {
    if (this.deferredPrompt && !this.installPromptShown) {
      this.installPromptShown = true;
      
      try {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          this.isInstalled = true;
          this.emit('app-installed');
        }
        
        this.deferredPrompt = null;
        return outcome;
      } catch (error) {
        console.error('Install prompt failed:', error);
        return 'dismissed';
      }
    }
  }

  // Update service worker
  async updateServiceWorker() {
    if (this.serviceWorker && this.updateAvailable) {
      try {
        const newWorker = this.serviceWorker.waiting;
        if (newWorker) {
          newWorker.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to update service worker:', error);
      }
    }
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.emit('cache-updated', data);
        break;
      case 'SYNC_COMPLETE':
        this.handleSyncComplete(data.tag, data.success);
        break;
      case 'PUSH_RECEIVED':
        this.emit('push-received', data);
        break;
      case 'OFFLINE_FALLBACK':
        this.emit('offline-fallback', data);
        break;
      default:
        console.log('Unknown service worker message:', data);
    }
  }

  // Handle sync completion
  handleSyncComplete(tag, success) {
    this.performanceMetrics.syncSuccess += success ? 1 : 0;
    this.emit('sync-complete', { tag, success });
  }

  // Utility methods
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Event emitter functionality
  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  on(event, callback) {
    if (!this.listeners) {
      this.listeners = {};
    }
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      averageLoadTime: this.performanceMetrics.loadTimes.length > 0 
        ? this.performanceMetrics.loadTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.loadTimes.length 
        : 0,
      cacheSize: this.offlineActions.size,
      networkStatus: this.networkStatus,
      deviceCapabilities: this.deviceCapabilities
    };
  }

  // Check if app is installed
  isAppInstalled() {
    return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
  }

  // Get offline status
  isOffline() {
    return this.networkStatus === 'offline';
  }

  // Clear offline data
  async clearOfflineData(storeName = null) {
    try {
      if (!this.offlineDB) {
        return;
      }
      
      if (storeName) {
        const transaction = this.offlineDB.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.clear();
      } else {
        // Clear all stores
        const storeNames = ['leads', 'contacts', 'deals', 'activities', 'syncQueue', 'offlineActions'];
        for (const name of storeNames) {
          const transaction = this.offlineDB.transaction([name], 'readwrite');
          const store = transaction.objectStore(name);
          await store.clear();
        }
      }
      
      this.offlineActions.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const enhancedPWAService = new EnhancedPWAService();
