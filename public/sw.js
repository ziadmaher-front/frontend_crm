// Advanced Service Worker for Sales Pro CRM
const VERSION = '2.0.0';
const CACHE_NAMES = {
  static: `sales-pro-static-v${VERSION}`,
  dynamic: `sales-pro-dynamic-v${VERSION}`,
  api: `sales-pro-api-v${VERSION}`,
  images: `sales-pro-images-v${VERSION}`
};

// Cache strategies configuration
const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first',
  images: 'cache-first',
  dynamic: 'stale-while-revalidate'
};

// Static resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/leads/,
  /\/api\/contacts/,
  /\/api\/deals/,
  /\/api\/activities/,
  /\/api\/dashboard/
];

// Advanced caching utilities
class CacheManager {
  static async openCache(name) {
    return await caches.open(name);
  }

  static async addToCache(cacheName, request, response) {
    const cache = await this.openCache(cacheName);
    await cache.put(request, response.clone());
    return response;
  }

  static async getFromCache(cacheName, request) {
    const cache = await this.openCache(cacheName);
    return await cache.match(request);
  }

  static async deleteFromCache(cacheName, request) {
    const cache = await this.openCache(cacheName);
    return await cache.delete(request);
  }

  static async cleanupCache(cacheName, maxEntries = 100) {
    const cache = await this.openCache(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      const keysToDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
  }
}

// Network utilities
class NetworkManager {
  static isOnline() {
    return navigator.onLine;
  }

  static async fetchWithTimeout(request, timeout = 5000) {
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

  static async fetchWithRetry(request, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetchWithTimeout(request);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      CacheManager.openCache(CACHE_NAMES.static)
        .then(cache => cache.addAll(STATIC_CACHE_URLS)),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
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

// Advanced fetch handler with multiple strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (isStaticResource(request)) {
    event.respondWith(handleStaticResource(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicResource(request));
  }
});

// Resource type detection
function isStaticResource(request) {
  const url = new URL(request.url);
  return STATIC_CACHE_URLS.some(staticUrl => url.pathname === staticUrl) ||
         url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/);
}

// Cache-first strategy for static resources
async function handleStaticResource(request) {
  try {
    const cachedResponse = await CacheManager.getFromCache(CACHE_NAMES.static, request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await NetworkManager.fetchWithTimeout(request);
    if (networkResponse.ok) {
      await CacheManager.addToCache(CACHE_NAMES.static, request, networkResponse);
    }
    return networkResponse;
  } catch (error) {
    console.error('Static resource fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy for API requests
async function handleAPIRequest(request) {
  try {
    const networkResponse = await NetworkManager.fetchWithTimeout(request, 3000);
    if (networkResponse.ok) {
      await CacheManager.addToCache(CACHE_NAMES.api, request, networkResponse);
      await CacheManager.cleanupCache(CACHE_NAMES.api, 50);
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for API request');
    const cachedResponse = await CacheManager.getFromCache(CACHE_NAMES.api, request);
    
    if (cachedResponse) {
      // Add offline indicator header
      const response = cachedResponse.clone();
      response.headers.set('X-Served-From', 'cache');
      return response;
    }
    
    // Return offline response for critical API endpoints
    return createOfflineAPIResponse(request);
  }
}

// Cache-first strategy for images
async function handleImageRequest(request) {
  try {
    const cachedResponse = await CacheManager.getFromCache(CACHE_NAMES.images, request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await NetworkManager.fetchWithTimeout(request);
    if (networkResponse.ok) {
      await CacheManager.addToCache(CACHE_NAMES.images, request, networkResponse);
      await CacheManager.cleanupCache(CACHE_NAMES.images, 100);
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder image for failed image requests
    return createPlaceholderImage();
  }
}

// Stale-while-revalidate strategy for dynamic content
async function handleDynamicResource(request) {
  const cachedResponse = await CacheManager.getFromCache(CACHE_NAMES.dynamic, request);
  
  const networkPromise = NetworkManager.fetchWithTimeout(request)
    .then(response => {
      if (response.ok) {
        CacheManager.addToCache(CACHE_NAMES.dynamic, request, response);
        CacheManager.cleanupCache(CACHE_NAMES.dynamic, 75);
      }
      return response;
    })
    .catch(() => null);

  return cachedResponse || await networkPromise || new Response('Offline', { status: 503 });
}

// Helper functions for offline responses
function createOfflineAPIResponse(request) {
  const url = new URL(request.url);
  
  // Return appropriate offline responses based on endpoint
  if (url.pathname.includes('/api/dashboard')) {
    return new Response(JSON.stringify({
      offline: true,
      message: 'Dashboard data unavailable offline',
      cachedData: null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Served-From': 'offline' }
    });
  }
  
  return new Response(JSON.stringify({
    offline: true,
    message: 'Data unavailable offline'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

function createPlaceholderImage() {
  // Return a simple SVG placeholder
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">
        Image Unavailable
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// Enhanced background sync with intelligent queuing
class OfflineDataManager {
  static async queueData(data) {
    const db = await this.openDB();
    const transaction = db.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    
    await store.add({
      id: Date.now(),
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      priority: data.priority || 'normal'
    });
  }

  static async getQueuedData() {
    const db = await this.openDB();
    const transaction = db.transaction(['offline_queue'], 'readonly');
    const store = transaction.objectStore('offline_queue');
    return await store.getAll();
  }

  static async removeFromQueue(id) {
    const db = await this.openDB();
    const transaction = db.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    await store.delete(id);
  }

  static async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SalesProCRM', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offline_queue')) {
          const store = db.createObjectStore('offline_queue', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('priority', 'priority');
        }
      };
    });
  }
}

// Background sync event handler
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  } else if (event.tag === 'urgent-sync') {
    event.waitUntil(performUrgentSync());
  }
});

async function performBackgroundSync() {
  try {
    const queuedData = await OfflineDataManager.getQueuedData();
    console.log(`Processing ${queuedData.length} queued items`);
    
    for (const item of queuedData) {
      try {
        await syncItemToServer(item);
        await OfflineDataManager.removeFromQueue(item.id);
        console.log('Successfully synced item:', item.id);
      } catch (error) {
        console.error('Failed to sync item:', item.id, error);
        // Implement retry logic with exponential backoff
        if (item.retryCount < 3) {
          item.retryCount++;
          // Re-queue with updated retry count
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function performUrgentSync() {
  // Handle urgent sync operations (e.g., critical data updates)
  const urgentData = await OfflineDataManager.getQueuedData();
  const urgentItems = urgentData.filter(item => item.priority === 'urgent');
  
  for (const item of urgentItems) {
    try {
      await syncItemToServer(item);
      await OfflineDataManager.removeFromQueue(item.id);
    } catch (error) {
      console.error('Urgent sync failed for item:', item.id, error);
    }
  }
}

async function syncItemToServer(item) {
  const { data } = item;
  
  const response = await NetworkManager.fetchWithRetry(data.url, {
    method: data.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...data.headers
    },
    body: JSON.stringify(data.payload)
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
}

// Enhanced push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let notificationData = {
    title: 'Sales Pro CRM',
    body: 'New notification',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg'
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || Date.now(),
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-192x192.svg'
      }
    ],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no existing window/tab, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Handle dismiss action (analytics, etc.)
    console.log('Notification dismissed');
  }
});

// Periodic background sync for data freshness
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'data-refresh') {
    event.waitUntil(refreshCriticalData());
  }
});

async function refreshCriticalData() {
  try {
    // Refresh critical data in the background
    const criticalEndpoints = [
      '/api/dashboard/summary',
      '/api/notifications/unread',
      '/api/tasks/urgent'
    ];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await NetworkManager.fetchWithTimeout(endpoint);
        if (response.ok) {
          await CacheManager.addToCache(CACHE_NAMES.api, endpoint, response);
        }
      } catch (error) {
        console.log(`Failed to refresh ${endpoint}:`, error);
      }
    }
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'QUEUE_DATA':
      OfflineDataManager.queueData(payload);
      break;
      
    case 'FORCE_SYNC':
      self.registration.sync.register('background-sync');
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('All caches cleared');
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Advanced Service Worker loaded successfully');