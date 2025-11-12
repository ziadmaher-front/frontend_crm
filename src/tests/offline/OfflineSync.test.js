import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOfflineSync } from '../../hooks/useOfflineSync';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

const mockIDBDatabase = {
  createObjectStore: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
  version: 1
};

const mockIDBTransaction = {
  objectStore: jest.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null
};

const mockIDBObjectStore = {
  add: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  createIndex: jest.fn()
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null
};

// Setup IndexedDB mocks
global.indexedDB = mockIndexedDB;
global.IDBDatabase = jest.fn(() => mockIDBDatabase);
global.IDBTransaction = jest.fn(() => mockIDBTransaction);
global.IDBObjectStore = jest.fn(() => mockIDBObjectStore);
global.IDBRequest = jest.fn(() => mockIDBRequest);

// Mock notifications hook
jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    showNotification: jest.fn(),
    showError: jest.fn(),
    showSuccess: jest.fn()
  })
}));

// Mock online/offline status
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

describe('useOfflineSync', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    // Reset mocks
    jest.clearAllMocks();

    // Setup successful IndexedDB operations
    mockIndexedDB.open.mockImplementation(() => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        request.result = mockIDBDatabase;
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    });

    mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
    mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);

    // Setup successful store operations
    const createSuccessfulRequest = (result = null) => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        request.result = result;
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    };

    mockIDBObjectStore.put.mockImplementation(() => createSuccessfulRequest());
    mockIDBObjectStore.get.mockImplementation(() => createSuccessfulRequest(null));
    mockIDBObjectStore.getAll.mockImplementation(() => createSuccessfulRequest([]));
    mockIDBObjectStore.delete.mockImplementation(() => createSuccessfulRequest());
    mockIDBObjectStore.clear.mockImplementation(() => createSuccessfulRequest());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize offline database successfully', async () => {
      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(mockIndexedDB.open).toHaveBeenCalledWith('SalesProCRM_Offline', 1);
    });

    test('should handle database initialization failure', async () => {
      mockIndexedDB.open.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onerror) request.onerror(new Error('DB Init Failed'));
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(false);
      });
    });

    test('should detect online/offline status changes', async () => {
      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      expect(result.current.isOnline).toBe(true);

      // Simulate going offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      // Simulate going online
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: true });
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });
    });
  });

  describe('Offline Data Storage', () => {
    test('should store data offline successfully', async () => {
      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const testData = {
        id: 'lead123',
        name: 'Test Lead',
        email: 'test@example.com'
      };

      await act(async () => {
        await result.current.storeOffline('leads', testData);
      });

      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'lead123',
          data: testData,
          timestamp: expect.any(Number),
          synced: false
        })
      );
    });

    test('should retrieve offline data successfully', async () => {
      const testData = {
        id: 'lead123',
        data: { name: 'Test Lead', email: 'test@example.com' },
        timestamp: Date.now(),
        synced: false
      };

      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = testData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      let retrievedData;
      await act(async () => {
        retrievedData = await result.current.getOffline('leads', 'lead123');
      });

      expect(retrievedData).toEqual(testData.data);
    });

    test('should handle storage errors gracefully', async () => {
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onerror) request.onerror(new Error('Storage failed'));
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const testData = { id: 'lead123', name: 'Test Lead' };

      await act(async () => {
        try {
          await result.current.storeOffline('leads', testData);
        } catch (error) {
          expect(error.message).toBe('Storage failed');
        }
      });
    });
  });

  describe('Synchronization', () => {
    test('should sync offline data when online', async () => {
      // Mock fetch for API calls
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const offlineData = [
        {
          id: 'lead123',
          data: { name: 'Test Lead 1' },
          timestamp: Date.now() - 1000,
          synced: false,
          operation: 'create'
        },
        {
          id: 'lead124',
          data: { name: 'Test Lead 2' },
          timestamp: Date.now(),
          synced: false,
          operation: 'update'
        }
      ];

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = offlineData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.forceSync();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({ synced: true })
      );
    });

    test('should handle sync conflicts', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          error: 'Conflict',
          serverData: { name: 'Server Lead', version: 2 }
        })
      });

      const conflictData = {
        id: 'lead123',
        data: { name: 'Client Lead', version: 1 },
        timestamp: Date.now(),
        synced: false,
        operation: 'update'
      };

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = [conflictData];
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.forceSync();
      });

      // Should store conflict for manual resolution
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringContaining('conflict_'),
          clientData: conflictData.data,
          serverData: { name: 'Server Lead', version: 2 },
          status: 'pending'
        })
      );
    });

    test('should retry failed sync operations', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      const offlineData = [{
        id: 'lead123',
        data: { name: 'Test Lead' },
        timestamp: Date.now(),
        synced: false,
        operation: 'create',
        retryCount: 0
      }];

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = offlineData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.forceSync();
      });

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test('should prioritize urgent sync items', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const offlineData = [
        {
          id: 'lead123',
          data: { name: 'Normal Lead' },
          priority: 'normal',
          timestamp: Date.now() - 2000,
          synced: false,
          operation: 'create'
        },
        {
          id: 'lead124',
          data: { name: 'Urgent Lead' },
          priority: 'urgent',
          timestamp: Date.now() - 1000,
          synced: false,
          operation: 'create'
        }
      ];

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = offlineData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.forceSync();
      });

      // Verify urgent item was synced first
      const fetchCalls = global.fetch.mock.calls;
      expect(fetchCalls[0][1].body).toContain('Urgent Lead');
      expect(fetchCalls[1][1].body).toContain('Normal Lead');
    });
  });

  describe('Conflict Resolution', () => {
    test('should resolve conflicts with client wins strategy', async () => {
      const conflictId = 'conflict_123';
      const conflictData = {
        id: conflictId,
        entityType: 'leads',
        entityId: 'lead123',
        clientData: { name: 'Client Lead', version: 1 },
        serverData: { name: 'Server Lead', version: 2 },
        status: 'pending',
        timestamp: Date.now()
      };

      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = conflictData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.resolveConflict(conflictId, 'client_wins');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/leads/lead123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(conflictData.clientData)
        })
      );
    });

    test('should resolve conflicts with server wins strategy', async () => {
      const conflictId = 'conflict_123';
      const conflictData = {
        id: conflictId,
        entityType: 'leads',
        entityId: 'lead123',
        clientData: { name: 'Client Lead', version: 1 },
        serverData: { name: 'Server Lead', version: 2 },
        status: 'pending',
        timestamp: Date.now()
      };

      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = conflictData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.resolveConflict(conflictId, 'server_wins');
      });

      // Should update local data with server data
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'lead123',
          data: conflictData.serverData,
          synced: true
        })
      );
    });

    test('should resolve conflicts with merge strategy', async () => {
      const conflictId = 'conflict_123';
      const conflictData = {
        id: conflictId,
        entityType: 'leads',
        entityId: 'lead123',
        clientData: { name: 'Client Lead', email: 'client@example.com' },
        serverData: { name: 'Server Lead', phone: '+1234567890' },
        status: 'pending',
        timestamp: Date.now()
      };

      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = conflictData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.resolveConflict(conflictId, 'merge');
      });

      // Should merge client and server data
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/leads/lead123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            name: 'Client Lead',
            email: 'client@example.com',
            phone: '+1234567890'
          })
        })
      );
    });
  });

  describe('Data Management', () => {
    test('should clear offline data', async () => {
      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.clearOfflineData();
      });

      expect(mockIDBObjectStore.clear).toHaveBeenCalledTimes(8); // All object stores
    });

    test('should get sync statistics', async () => {
      const offlineData = [
        { synced: false, priority: 'urgent' },
        { synced: false, priority: 'normal' },
        { synced: true, priority: 'normal' }
      ];

      const conflicts = [
        { status: 'pending' },
        { status: 'resolved' }
      ];

      mockIDBObjectStore.getAll.mockImplementation((storeName) => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (storeName === 'conflict_resolution') {
            request.result = conflicts;
          } else {
            request.result = offlineData;
          }
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.syncStats).toEqual({
        pendingSync: 2,
        urgentSync: 1,
        pendingConflicts: 1,
        lastSyncTime: expect.any(Number)
      });
    });
  });

  describe('Background Sync', () => {
    test('should register for background sync when going offline', async () => {
      // Mock service worker registration
      global.navigator.serviceWorker = {
        ready: Promise.resolve({
          sync: {
            register: jest.fn().mockResolvedValue()
          }
        })
      };

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Store some data while offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });

      const testData = { id: 'lead123', name: 'Offline Lead' };

      await act(async () => {
        await result.current.storeOffline('leads', testData);
      });

      const registration = await global.navigator.serviceWorker.ready;
      expect(registration.sync.register).toHaveBeenCalledWith('background-sync');
    });

    test('should handle background sync events', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const offlineData = [{
        id: 'lead123',
        data: { name: 'Background Sync Lead' },
        timestamp: Date.now(),
        synced: false,
        operation: 'create'
      }];

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = offlineData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Simulate background sync event
      await act(async () => {
        await result.current.forceSync();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/leads'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Background Sync Lead' })
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors during sync', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const offlineData = [{
        id: 'lead123',
        data: { name: 'Test Lead' },
        timestamp: Date.now(),
        synced: false,
        operation: 'create',
        retryCount: 0
      }];

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = offlineData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.forceSync();
      });

      // Should increment retry count
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          retryCount: 1,
          lastError: 'Network error'
        })
      );
    });

    test('should handle quota exceeded errors', async () => {
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          if (request.onerror) request.onerror(error);
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const testData = { id: 'lead123', name: 'Test Lead' };

      await act(async () => {
        try {
          await result.current.storeOffline('leads', testData);
        } catch (error) {
          expect(error.name).toBe('QuotaExceededError');
        }
      });
    });
  });

  describe('Performance', () => {
    test('should batch sync operations efficiently', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const offlineData = Array.from({ length: 100 }, (_, i) => ({
        id: `lead${i}`,
        data: { name: `Lead ${i}` },
        timestamp: Date.now() - i,
        synced: false,
        operation: 'create'
      }));

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = offlineData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const startTime = Date.now();

      await act(async () => {
        await result.current.forceSync();
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (batched operations)
      expect(duration).toBeLessThan(5000);
      expect(global.fetch).toHaveBeenCalledTimes(100);
    });

    test('should limit concurrent sync operations', async () => {
      let concurrentCalls = 0;
      let maxConcurrentCalls = 0;

      global.fetch = jest.fn().mockImplementation(() => {
        concurrentCalls++;
        maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
        
        return new Promise(resolve => {
          setTimeout(() => {
            concurrentCalls--;
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true })
            });
          }, 100);
        });
      });

      const offlineData = Array.from({ length: 20 }, (_, i) => ({
        id: `lead${i}`,
        data: { name: `Lead ${i}` },
        timestamp: Date.now() - i,
        synced: false,
        operation: 'create'
      }));

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = offlineData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const { result } = renderHook(() => useOfflineSync(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.forceSync();
      });

      // Should limit concurrent operations (default: 5)
      expect(maxConcurrentCalls).toBeLessThanOrEqual(5);
    });
  });
});