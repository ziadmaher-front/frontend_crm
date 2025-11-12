// Enhanced Service Worker for Sales Pro CRM
// Provides advanced PWA capabilities including intelligent caching, background sync, and offline-first architecture

const VERSION = '3.0.0';
const CACHE_PREFIX = 'sales-pro-enhanced';

const CACHE_NAMES = {
  static: `${CACHE_PREFIX}-static-v${VERSION}`,
  dynamic: `${CACHE_PREFIX}-dynamic-v${VERSION}`,
  api: `${CACHE_PREFIX}-api-v${VERSION}`,
  images: `${CACHE_PREFIX}-images-v${VERSION}`,
  fonts: `${CACHE_PREFIX}-fonts-v${VERSION}`,
  critical: `${CACHE_PREFIX}-critical-v${VERSION}`
};

// Cache configuration
const CACHE_CONFIG = {
  static: {
    strategy: 'cache-first',
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
  },
  dynamic: {
    strategy: 'stale-while-revalidate',
    maxEntries: 50,
    maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
  },
  api: {
    strategy: 'network-first',
    maxEntries: 200,
    maxAgeSeconds: 5 * 60 // 5 minutes
  },
  images: {
    strategy: 'cache-first',
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
  },
  fonts: {
    strategy: 'cache-first',
    maxEntries: 20,
    maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
  },
  critical: {
    strategy: 'cache-only',
    maxEntries: 20,
    maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
  }
};

// Static resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/assets/css/main.css',
  '/assets/js/main.js'
];

// API endpoints patterns
const API_PATTERNS = {
  leads: /\/api\/leads/,
  contacts: /\/api\/contacts/,
  deals: /\/api\/deals/,
  activities: /\/api\/activities/,
  dashboard: /\/api\/dashboard/,
  analytics: /\/api\/analytics/,
  reports: /\/api\/reports/,
  auth: /\/api\/auth/,
  sync: /\/api\/sync/
};

// Background sync tags
const SYNC_TAGS = {
  LEAD_SYNC: 'lead-sync',
  CONTACT_SYNC: 'contact-sync',
  DEAL_SYNC: 'deal-sync',
  ACTIVITY_SYNC: 'activity-sync',
  FILE_UPLOAD: 'file-upload',
  ANALYTICS_SYNC: 'analytics-sync'
};

// Advanced Cache Manager
class EnhancedCacheManager {
  static async openCache(name) {
    return await caches.open(name);
  }

  static async addToCache(cacheName, request, response, config = {}) {
    try {
      const cache = await this.openCache(cacheName);
      
      // Clone response before caching
      const responseClone = response.clone();
      
      // Add timestamp and metadata
      const responseWithMetadata = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cached-at': Date.now().toString(),
          'sw-cache-version': VERSION
        }
      });
      
      await cache.put(request, responseWithMetadata);
      
      // Cleanup old entries if needed
      await this.cleanupCache(cacheName, config.maxEntries);
      
      return response;
    } catch (error) {
      console.error('Failed to add to cache:', error);
      return response;
    }
  }

  static async getFromCache(cacheName, request, config = {}) {
    try {
      const cache = await this.openCache(cacheName);
      const response = await cache.match(request);
      
      if (response) {
        // Check if cached response is still valid
        const cachedAt = response.headers.get('sw-cached-at');
        const maxAge = config.maxAgeSeconds * 1000;
        
        if (cachedAt && maxAge && (Date.now() - parseInt(cachedAt)) > maxAge) {
          await cache.delete(request);
          return null;
        }
        
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get from cache:', error);
      return null;
    }
  }

  static async cleanupCache(cacheName, maxEntries = 100) {
    try {
      const cache = await this.openCache(cacheName);
      const keys = await cache.keys();
      
      if (keys.length > maxEntries) {
        // Sort by cached timestamp and remove oldest entries
        const keysWithTimestamp = await Promise.all(
          keys.map(async (key) => {
            const response = await cache.match(key);
            const cachedAt = response?.headers.get('sw-cached-at') || '0';
            return { key, timestamp: parseInt(cachedAt) };
          })
        );
        
        keysWithTimestamp.sort((a, b) => a.timestamp - b.timestamp);
        const keysToDelete = keysWithTimestamp.slice(0, keys.length - maxEntries);
        
        await Promise.all(keysToDelete.map(({ key }) => cache.delete(key)));
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  static async deleteFromCache(cacheName, request) {
    try {
      const cache = await this.openCache(cacheName);
      return await cache.delete(request);
    } catch (error) {
      console.error('Failed to delete from cache:', error);
      return false;
    }
  }
}

// Network utilities
class NetworkManager {
  static async fetchWithTimeout(request, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(request, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async fetchWithRetry(request, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetchWithTimeout(request);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  static isOnline() {
    return navigator.onLine;
  }
}

// Background sync manager
class BackgroundSyncManager {
  static async registerSync(tag) {
    try {
      await self.registration.sync.register(tag);
      console.log('Background sync registered:', tag);
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }

  static async handleSync(tag) {
    console.log('Handling background sync:', tag);
    
    try {
      switch (tag) {
        case SYNC_TAGS.LEAD_SYNC:
          await this.syncLeads();
          break;
        case SYNC_TAGS.CONTACT_SYNC:
          await this.syncContacts();
          break;
        case SYNC_TAGS.DEAL_SYNC:
          await this.syncDeals();
          break;
        case SYNC_TAGS.ACTIVITY_SYNC:
          await this.syncActivities();
          break;
        case SYNC_TAGS.FILE_UPLOAD:
          await this.syncFileUploads();
          break;
        case SYNC_TAGS.ANALYTICS_SYNC:
          await this.syncAnalytics();
          break;
        default:
          console.log('Unknown sync tag:', tag);
      }
      
      // Notify clients of successful sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            tag: tag,
            success: true
          });
        });
      });
      
    } catch (error) {
      console.error('Sync failed:', error);
      
      // Notify clients of failed sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            tag: tag,
            success: false,
            error: error.message
          });
        });
      });
    }
  }

  static async syncLeads() {
    // Implementation for syncing leads
    const response = await NetworkManager.fetchWithRetry('/api/sync/leads');
    return response.json();
  }

  static async syncContacts() {
    // Implementation for syncing contacts
    const response = await NetworkManager.fetchWithRetry('/api/sync/contacts');
    return response.json();
  }

  static async syncDeals() {
    // Implementation for syncing deals
    const response = await NetworkManager.fetchWithRetry('/api/sync/deals');
    return response.json();
  }

  static async syncActivities() {
    // Implementation for syncing activities
    const response = await NetworkManager.fetchWithRetry('/api/sync/activities');
    return response.json();
  }

  static async syncFileUploads() {
    // Implementation for syncing file uploads
    const response = await NetworkManager.fetchWithRetry('/api/sync/files');
    return response.json();
  }

  static async syncAnalytics() {
    // Implementation for syncing analytics data
    const response = await NetworkManager.fetchWithRetry('/api/sync/analytics');
    return response.json();
  }
}

// Push notification manager
class PushNotificationManager {
  static async handlePush(event) {
    try {
      const data = event.data ? event.data.json() : {};
      
      const options = {
        body: data.body || 'New notification from Sales Pro CRM',
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/badge-72x72.svg',
        image: data.image,
        data: data.data || {},
        actions: data.actions || [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/view-icon.svg'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/dismiss-icon.svg'
          }
        ],
        tag: data.tag || 'default',
        renotify: true,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: data.vibrate || [200, 100, 200]
      };
      
      await self.registration.showNotification(data.title || 'Sales Pro CRM', options);
      
      // Track notification analytics
      await this.trackNotification(data);
      
    } catch (error) {
      console.error('Failed to handle push notification:', error);
    }
  }

  static async handleNotificationClick(event) {
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    try {
      if (action === 'view' || !action) {
        // Open the app or focus existing window
        const urlToOpen = data.url || '/';
        
        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        // Check if app is already open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      }
      
      // Handle other actions
      if (action === 'dismiss') {
        // Just close the notification (already done above)
        return;
      }
      
      // Track notification interaction
      await this.trackNotificationInteraction(action, data);
      
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  }

  static async trackNotification(data) {
    try {
      await fetch('/api/analytics/notification-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notification_received',
          data: data,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to track notification:', error);
    }
  }

  static async trackNotificationInteraction(action, data) {
    try {
      await fetch('/api/analytics/notification-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notification_interaction',
          action: action,
          data: data,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to track notification interaction:', error);
    }
  }
}

// Cache strategy implementations
const cacheStrategies = {
  async cacheFirst(request, cacheName, config) {
    const cachedResponse = await EnhancedCacheManager.getFromCache(cacheName, request, config);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await NetworkManager.fetchWithTimeout(request);
      if (networkResponse.ok) {
        await EnhancedCacheManager.addToCache(cacheName, request, networkResponse, config);
      }
      return networkResponse;
    } catch (error) {
      // Return offline fallback if available
      return await this.getOfflineFallback(request);
    }
  },

  async networkFirst(request, cacheName, config) {
    try {
      const networkResponse = await NetworkManager.fetchWithTimeout(request);
      if (networkResponse.ok) {
        await EnhancedCacheManager.addToCache(cacheName, request, networkResponse, config);
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await EnhancedCacheManager.getFromCache(cacheName, request, config);
      if (cachedResponse) {
        return cachedResponse;
      }
      return await this.getOfflineFallback(request);
    }
  },

  async staleWhileRevalidate(request, cacheName, config) {
    const cachedResponse = await EnhancedCacheManager.getFromCache(cacheName, request, config);
    
    // Always try to fetch from network in background
    const networkResponsePromise = NetworkManager.fetchWithTimeout(request)
      .then(response => {
        if (response.ok) {
          EnhancedCacheManager.addToCache(cacheName, request, response, config);
        }
        return response;
      })
      .catch(error => {
        console.error('Background fetch failed:', error);
      });
    
    // Return cached response immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Wait for network response if no cache
    try {
      return await networkResponsePromise;
    } catch (error) {
      return await this.getOfflineFallback(request);
    }
  },

  async cacheOnly(request, cacheName, config) {
    const cachedResponse = await EnhancedCacheManager.getFromCache(cacheName, request, config);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Not found in cache', { status: 404 });
  },

  async getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // Return generic offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
};

// Request classification
function classifyRequest(request) {
  const url = new URL(request.url);
  
  // Static resources
  if (url.pathname.match(/\.(js|css|html|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
      return { type: 'fonts', cacheName: CACHE_NAMES.fonts };
    }
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
      return { type: 'images', cacheName: CACHE_NAMES.images };
    }
    return { type: 'static', cacheName: CACHE_NAMES.static };
  }
  
  // API requests
  for (const [name, pattern] of Object.entries(API_PATTERNS)) {
    if (pattern.test(url.pathname)) {
      return { type: 'api', cacheName: CACHE_NAMES.api, apiType: name };
    }
  }
  
  // Critical resources
  if (STATIC_RESOURCES.includes(url.pathname)) {
    return { type: 'critical', cacheName: CACHE_NAMES.critical };
  }
  
  // Dynamic content
  return { type: 'dynamic', cacheName: CACHE_NAMES.dynamic };
}

// Service Worker Event Handlers

// Install event
self.addEventListener('install', (event) => {
  console.log('Enhanced Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      EnhancedCacheManager.openCache(CACHE_NAMES.critical)
        .then(cache => cache.addAll(STATIC_RESOURCES)),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Enhanced Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith(CACHE_PREFIX) && !Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Classify request and apply appropriate strategy
  const classification = classifyRequest(request);
  const config = CACHE_CONFIG[classification.type];
  const strategy = cacheStrategies[config.strategy];
  
  if (strategy) {
    event.respondWith(
      strategy(request, classification.cacheName, config)
        .catch(error => {
          console.error('Cache strategy failed:', error);
          return cacheStrategies.getOfflineFallback(request);
        })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  event.waitUntil(BackgroundSyncManager.handleSync(event.tag));
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push event received');
  event.waitUntil(PushNotificationManager.handlePush(event));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click event');
  event.waitUntil(PushNotificationManager.handleNotificationClick(event));
});

// Message event
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(
        Promise.all(
          data.urls.map(url => 
            EnhancedCacheManager.addToCache(CACHE_NAMES.dynamic, new Request(url), fetch(url))
          )
        )
      );
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(data.cacheName || CACHE_NAMES.dynamic)
      );
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        (async () => {
          const cacheStatus = {};
          for (const [name, cacheName] of Object.entries(CACHE_NAMES)) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            cacheStatus[name] = keys.length;
          }
          
          event.ports[0].postMessage({
            type: 'CACHE_STATUS',
            status: cacheStatus
          });
        })()
      );
      break;
      
    default:
      console.log('Unknown message type:', data.type);
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Enhanced Service Worker loaded successfully');