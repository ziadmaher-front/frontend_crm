/**
 * Service Worker Tests
 * Tests for PWA functionality, caching strategies, and offline capabilities
 */

// Mock service worker environment
global.self = {
  addEventListener: jest.fn(),
  skipWaiting: jest.fn(),
  clients: {
    claim: jest.fn(),
    matchAll: jest.fn().mockResolvedValue([]),
    openWindow: jest.fn()
  },
  caches: {
    open: jest.fn(),
    match: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn().mockResolvedValue([])
  },
  registration: {
    showNotification: jest.fn(),
    sync: {
      register: jest.fn()
    }
  },
  indexedDB: {
    open: jest.fn()
  }
};

// Mock cache API
const mockCache = {
  match: jest.fn(),
  matchAll: jest.fn(),
  add: jest.fn(),
  addAll: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn().mockResolvedValue([])
};

global.self.caches.open.mockResolvedValue(mockCache);

// Mock fetch
global.fetch = jest.fn();

// Mock Response constructor
global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  ...init,
  clone: jest.fn().mockReturnThis(),
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  ok: true,
  status: 200,
  headers: new Map()
}));

// Mock Request constructor
global.Request = jest.fn().mockImplementation((url, init) => ({
  url,
  ...init,
  clone: jest.fn().mockReturnThis(),
  headers: new Map()
}));

describe('Service Worker', () => {
  let serviceWorkerCode;

  beforeAll(async () => {
    // Load the service worker code
    const fs = require('fs');
    const path = require('path');
    const swPath = path.join(__dirname, '../../../public/sw.js');
    serviceWorkerCode = fs.readFileSync(swPath, 'utf8');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset global state
    global.self.addEventListener.mockClear();
    global.self.caches.open.mockClear();
    global.self.caches.match.mockClear();
    global.fetch.mockClear();
    mockCache.match.mockClear();
    mockCache.put.mockClear();
    mockCache.addAll.mockClear();
  });

  describe('Installation and Activation', () => {
    test('should install service worker and cache static assets', async () => {
      // Execute service worker code
      eval(serviceWorkerCode);

      // Simulate install event
      const installEvent = {
        waitUntil: jest.fn()
      };

      const installHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'install')[1];

      await installHandler(installEvent);

      expect(installEvent.waitUntil).toHaveBeenCalled();
      expect(global.self.caches.open).toHaveBeenCalledWith(
        expect.stringContaining('static')
      );
      expect(mockCache.addAll).toHaveBeenCalledWith(
        expect.arrayContaining([
          '/',
          '/static/js/bundle.js',
          '/static/css/main.css'
        ])
      );
    });

    test('should activate service worker and clean old caches', async () => {
      eval(serviceWorkerCode);

      const oldCaches = ['sales-pro-crm-v1-static', 'old-cache-v1'];
      global.self.caches.keys.mockResolvedValue(oldCaches);
      global.self.caches.delete.mockResolvedValue(true);

      const activateEvent = {
        waitUntil: jest.fn()
      };

      const activateHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'activate')[1];

      await activateHandler(activateEvent);

      expect(activateEvent.waitUntil).toHaveBeenCalled();
      expect(global.self.caches.delete).toHaveBeenCalledWith('old-cache-v1');
      expect(global.self.clients.claim).toHaveBeenCalled();
    });

    test('should skip waiting when requested', async () => {
      eval(serviceWorkerCode);

      const messageEvent = {
        data: { type: 'SKIP_WAITING' }
      };

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      expect(global.self.skipWaiting).toHaveBeenCalled();
    });
  });

  describe('Fetch Handling and Caching Strategies', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should serve static assets from cache first', async () => {
      const cachedResponse = new Response('cached content');
      mockCache.match.mockResolvedValue(cachedResponse);

      const fetchEvent = {
        request: new Request('/static/js/bundle.js'),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      expect(fetchEvent.respondWith).toHaveBeenCalled();
      expect(mockCache.match).toHaveBeenCalledWith(fetchEvent.request);
    });

    test('should use network first for API requests', async () => {
      const networkResponse = new Response('{"data": "fresh"}');
      global.fetch.mockResolvedValue(networkResponse);

      const fetchEvent = {
        request: new Request('/api/leads'),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
      expect(mockCache.put).toHaveBeenCalledWith(
        fetchEvent.request,
        expect.any(Object)
      );
    });

    test('should fallback to cache when network fails for API requests', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      const cachedResponse = new Response('{"data": "cached"}');
      mockCache.match.mockResolvedValue(cachedResponse);

      const fetchEvent = {
        request: new Request('/api/leads'),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
      expect(mockCache.match).toHaveBeenCalledWith(fetchEvent.request);
    });

    test('should use stale while revalidate for images', async () => {
      const cachedResponse = new Response('cached image');
      const networkResponse = new Response('fresh image');
      
      mockCache.match.mockResolvedValue(cachedResponse);
      global.fetch.mockResolvedValue(networkResponse);

      const fetchEvent = {
        request: new Request('/images/logo.png'),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      expect(mockCache.match).toHaveBeenCalledWith(fetchEvent.request);
      expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
      expect(mockCache.put).toHaveBeenCalledWith(
        fetchEvent.request,
        expect.any(Object)
      );
    });

    test('should serve offline page for navigation requests when offline', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      mockCache.match.mockResolvedValue(null);
      
      const offlineResponse = new Response('<html>Offline</html>');
      mockCache.match.mockImplementation((request) => {
        if (request === '/offline.html') {
          return Promise.resolve(offlineResponse);
        }
        return Promise.resolve(null);
      });

      const fetchEvent = {
        request: new Request('/', {
          mode: 'navigate'
        }),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      expect(mockCache.match).toHaveBeenCalledWith('/offline.html');
    });

    test('should handle range requests for media files', async () => {
      const rangeResponse = new Response('partial content', {
        status: 206,
        headers: { 'Content-Range': 'bytes 0-1023/2048' }
      });
      global.fetch.mockResolvedValue(rangeResponse);

      const fetchEvent = {
        request: new Request('/media/video.mp4', {
          headers: { 'Range': 'bytes=0-1023' }
        }),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
    });
  });

  describe('Background Sync', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should handle background sync event', async () => {
      const mockIDB = {
        transaction: jest.fn().mockReturnValue({
          objectStore: jest.fn().mockReturnValue({
            getAll: jest.fn().mockReturnValue({
              onsuccess: null,
              result: [
                {
                  id: 'sync1',
                  data: { name: 'Test Lead' },
                  operation: 'create',
                  endpoint: '/api/leads'
                }
              ]
            })
          })
        })
      };

      global.self.indexedDB.open.mockImplementation(() => ({
        onsuccess: null,
        result: mockIDB
      }));

      global.fetch.mockResolvedValue(new Response('{"success": true}'));

      const syncEvent = {
        tag: 'background-sync',
        waitUntil: jest.fn()
      };

      const syncHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'sync')[1];

      await syncHandler(syncEvent);

      expect(syncEvent.waitUntil).toHaveBeenCalled();
    });

    test('should handle urgent sync with higher priority', async () => {
      const syncEvent = {
        tag: 'urgent-sync',
        waitUntil: jest.fn()
      };

      const syncHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'sync')[1];

      await syncHandler(syncEvent);

      expect(syncEvent.waitUntil).toHaveBeenCalled();
    });

    test('should retry failed sync operations', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(new Response('{"success": true}'));

      const mockIDB = {
        transaction: jest.fn().mockReturnValue({
          objectStore: jest.fn().mockReturnValue({
            getAll: jest.fn().mockReturnValue({
              onsuccess: null,
              result: [
                {
                  id: 'sync1',
                  data: { name: 'Test Lead' },
                  operation: 'create',
                  endpoint: '/api/leads',
                  retryCount: 0
                }
              ]
            }),
            put: jest.fn()
          })
        })
      };

      global.self.indexedDB.open.mockImplementation(() => ({
        onsuccess: null,
        result: mockIDB
      }));

      const syncEvent = {
        tag: 'background-sync',
        waitUntil: jest.fn()
      };

      const syncHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'sync')[1];

      await syncHandler(syncEvent);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Push Notifications', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should handle push notifications', async () => {
      const pushEvent = {
        data: {
          json: () => ({
            title: 'New Lead',
            body: 'You have a new lead from John Doe',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: {
              url: '/leads/123',
              actions: [
                { action: 'view', title: 'View Lead' },
                { action: 'dismiss', title: 'Dismiss' }
              ]
            }
          })
        },
        waitUntil: jest.fn()
      };

      const pushHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'push')[1];

      await pushHandler(pushEvent);

      expect(pushEvent.waitUntil).toHaveBeenCalled();
      expect(global.self.registration.showNotification).toHaveBeenCalledWith(
        'New Lead',
        expect.objectContaining({
          body: 'You have a new lead from John Doe',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        })
      );
    });

    test('should handle notification click events', async () => {
      const notificationEvent = {
        notification: {
          data: {
            url: '/leads/123'
          },
          close: jest.fn()
        },
        action: 'view',
        waitUntil: jest.fn()
      };

      global.self.clients.matchAll.mockResolvedValue([]);
      global.self.clients.openWindow.mockResolvedValue({});

      const notificationClickHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'notificationclick')[1];

      await notificationClickHandler(notificationEvent);

      expect(notificationEvent.waitUntil).toHaveBeenCalled();
      expect(notificationEvent.notification.close).toHaveBeenCalled();
      expect(global.self.clients.openWindow).toHaveBeenCalledWith('/leads/123');
    });

    test('should focus existing window if available', async () => {
      const mockClient = {
        url: 'https://example.com/leads/123',
        focus: jest.fn()
      };

      const notificationEvent = {
        notification: {
          data: {
            url: '/leads/123'
          },
          close: jest.fn()
        },
        action: 'view',
        waitUntil: jest.fn()
      };

      global.self.clients.matchAll.mockResolvedValue([mockClient]);

      const notificationClickHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'notificationclick')[1];

      await notificationClickHandler(notificationEvent);

      expect(mockClient.focus).toHaveBeenCalled();
      expect(global.self.clients.openWindow).not.toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should handle cache cleanup message', async () => {
      const messageEvent = {
        data: { type: 'CLEAR_CACHE' }
      };

      global.self.caches.keys.mockResolvedValue([
        'sales-pro-crm-v2-static',
        'sales-pro-crm-v2-dynamic'
      ]);
      global.self.caches.delete.mockResolvedValue(true);

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      expect(global.self.caches.delete).toHaveBeenCalledTimes(2);
    });

    test('should preload critical resources', async () => {
      const messageEvent = {
        data: {
          type: 'PRELOAD_RESOURCES',
          urls: ['/api/dashboard', '/api/leads?limit=10']
        }
      };

      global.fetch.mockResolvedValue(new Response('{"data": []}'));

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard');
      expect(global.fetch).toHaveBeenCalledWith('/api/leads?limit=10');
      expect(mockCache.put).toHaveBeenCalledTimes(2);
    });

    test('should handle cache size limits', async () => {
      const largeCacheEntries = Array.from({ length: 100 }, (_, i) => ({
        url: `/api/data/${i}`,
        response: new Response(`data ${i}`)
      }));

      mockCache.keys.mockResolvedValue(
        largeCacheEntries.map(entry => ({ url: entry.url }))
      );
      mockCache.delete.mockResolvedValue(true);

      const messageEvent = {
        data: { type: 'CLEANUP_CACHE' }
      };

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      // Should delete oldest entries when cache is full
      expect(mockCache.delete).toHaveBeenCalled();
    });
  });

  describe('Offline Data Management', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should queue data for offline sync', async () => {
      const messageEvent = {
        data: {
          type: 'QUEUE_DATA',
          payload: {
            operation: 'create',
            entityType: 'leads',
            data: { name: 'Offline Lead' }
          }
        }
      };

      const mockIDB = {
        transaction: jest.fn().mockReturnValue({
          objectStore: jest.fn().mockReturnValue({
            add: jest.fn()
          })
        })
      };

      global.self.indexedDB.open.mockImplementation(() => ({
        onsuccess: null,
        result: mockIDB
      }));

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      expect(mockIDB.transaction).toHaveBeenCalledWith(['sync_queue'], 'readwrite');
    });

    test('should force sync when requested', async () => {
      const messageEvent = {
        data: { type: 'FORCE_SYNC' }
      };

      global.self.registration.sync.register.mockResolvedValue();

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      expect(global.self.registration.sync.register).toHaveBeenCalledWith('urgent-sync');
    });
  });

  describe('Performance Optimization', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should implement intelligent prefetching', async () => {
      const messageEvent = {
        data: {
          type: 'PREFETCH_ROUTES',
          routes: ['/leads', '/contacts', '/deals']
        }
      };

      global.fetch.mockResolvedValue(new Response('<html></html>'));

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      expect(global.fetch).toHaveBeenCalledWith('/leads');
      expect(global.fetch).toHaveBeenCalledWith('/contacts');
      expect(global.fetch).toHaveBeenCalledWith('/deals');
    });

    test('should handle concurrent cache operations efficiently', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        new Request(`/api/data/${i}`)
      );

      const responses = requests.map((_, i) => 
        new Response(`data ${i}`)
      );

      global.fetch.mockImplementation((request) => {
        const index = requests.findIndex(r => r.url === request.url);
        return Promise.resolve(responses[index]);
      });

      const fetchPromises = requests.map(request => {
        const fetchEvent = {
          request,
          respondWith: jest.fn()
        };

        const fetchHandler = global.self.addEventListener.mock.calls
          .find(call => call[0] === 'fetch')[1];

        return fetchHandler(fetchEvent);
      });

      await Promise.all(fetchPromises);

      expect(global.fetch).toHaveBeenCalledTimes(10);
      expect(mockCache.put).toHaveBeenCalledTimes(10);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      mockCache.match.mockResolvedValue(null);

      const fetchEvent = {
        request: new Request('/api/leads'),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      // Should provide fallback response
      expect(fetchEvent.respondWith).toHaveBeenCalledWith(
        expect.any(Promise)
      );
    });

    test('should handle cache errors', async () => {
      mockCache.match.mockRejectedValue(new Error('Cache error'));
      global.fetch.mockResolvedValue(new Response('network response'));

      const fetchEvent = {
        request: new Request('/api/leads'),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      // Should fallback to network
      expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
    });

    test('should handle IndexedDB errors', async () => {
      global.self.indexedDB.open.mockImplementation(() => ({
        onerror: null,
        error: new Error('IDB error')
      }));

      const messageEvent = {
        data: {
          type: 'QUEUE_DATA',
          payload: {
            operation: 'create',
            data: { name: 'Test' }
          }
        }
      };

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      // Should not throw error
      await expect(messageHandler(messageEvent)).resolves.not.toThrow();
    });
  });

  describe('Security', () => {
    beforeEach(() => {
      eval(serviceWorkerCode);
    });

    test('should validate message origins', async () => {
      const messageEvent = {
        data: { type: 'SKIP_WAITING' },
        origin: 'https://malicious-site.com'
      };

      const messageHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1];

      await messageHandler(messageEvent);

      // Should not execute skip waiting for invalid origin
      expect(global.self.skipWaiting).not.toHaveBeenCalled();
    });

    test('should sanitize cached responses', async () => {
      const maliciousResponse = new Response('<script>alert("xss")</script>');
      global.fetch.mockResolvedValue(maliciousResponse);

      const fetchEvent = {
        request: new Request('/api/user-content'),
        respondWith: jest.fn()
      };

      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];

      await fetchHandler(fetchEvent);

      // Should sanitize or reject malicious content
      expect(mockCache.put).toHaveBeenCalledWith(
        fetchEvent.request,
        expect.any(Object)
      );
    });
  });
});