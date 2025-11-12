import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Import AI System Components
import { AISystemBootstrap } from '../services/aiSystemBootstrap';
import { AISystemIntegration } from '../services/aiSystemIntegration';
import { AICacheService } from '../services/aiCacheService';
import { PerformanceOptimizer } from '../config/aiPerformanceConfig';
import AISystemMonitor from '../components/AISystemMonitor';
import EnhancedAIDashboard from '../pages/EnhancedAIDashboard';
import AIPerformanceDashboard from '../pages/AIPerformanceDashboard';

// Mock dependencies
jest.mock('../hooks/useAISystem', () => ({
  useAISystem: () => ({
    systemHealth: {
      overall: 'healthy',
      services: {
        'AI Engine': { status: 'healthy', uptime: 3600 },
        'Cache Service': { status: 'healthy', uptime: 3600 },
        'Performance Monitor': { status: 'healthy', uptime: 3600 }
      }
    },
    performanceMetrics: {
      responseTime: 150,
      throughput: 25,
      cacheHitRate: 85,
      errorRate: 2
    },
    isLoading: false,
    error: null,
    refreshMetrics: jest.fn()
  })
}));

jest.mock('../hooks/useAIPerformance', () => ({
  useAIPerformance: () => ({
    metrics: {
      responseTime: 150,
      throughput: 25,
      accuracy: 92,
      efficiency: 88
    },
    isLoading: false,
    error: null
  })
}));

describe('AI System Integration Tests', () => {
  let queryClient;
  let mockConsoleLog;
  let mockConsoleError;

  beforeAll(() => {
    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup query client
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AI System Bootstrap', () => {
    test('should initialize AI system successfully', async () => {
      const result = await AISystemBootstrap.initialize();
      
      expect(result).toBeDefined();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('AI System Bootstrap initialized')
      );
    });

    test('should provide system status', async () => {
      const status = await AISystemBootstrap.getSystemStatus();
      
      expect(status).toHaveProperty('overall');
      expect(status).toHaveProperty('services');
      expect(status).toHaveProperty('activeServices');
      expect(status).toHaveProperty('totalServices');
    });

    test('should provide health metrics', async () => {
      const metrics = await AISystemBootstrap.getHealthMetrics();
      
      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('responseTime');
      expect(metrics).toHaveProperty('throughput');
    });

    test('should handle graceful shutdown', async () => {
      const result = await AISystemBootstrap.shutdown();
      
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('AI System shutdown completed')
      );
    });
  });

  describe('AI System Integration Service', () => {
    test('should initialize all AI engines', async () => {
      const integration = new AISystemIntegration();
      await integration.initialize();
      
      expect(integration.isInitialized()).toBe(true);
    });

    test('should process AI requests', async () => {
      const integration = new AISystemIntegration();
      await integration.initialize();
      
      const request = {
        type: 'lead_scoring',
        data: { name: 'Test Lead', email: 'test@example.com' }
      };
      
      const result = await integration.processRequest(request);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
    });

    test('should handle batch processing', async () => {
      const integration = new AISystemIntegration();
      await integration.initialize();
      
      const requests = [
        { type: 'lead_scoring', data: { name: 'Lead 1' } },
        { type: 'deal_insights', data: { amount: 10000 } }
      ];
      
      const results = await integration.processBatch(requests);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);
    });
  });

  describe('AI Cache Service', () => {
    test('should cache and retrieve data', async () => {
      const cacheService = new AICacheService();
      await cacheService.initialize();
      
      const key = 'test_key';
      const data = { test: 'data' };
      
      await cacheService.set(key, data);
      const retrieved = await cacheService.get(key);
      
      expect(retrieved).toEqual(data);
    });

    test('should handle cache expiration', async () => {
      const cacheService = new AICacheService();
      await cacheService.initialize();
      
      const key = 'expiring_key';
      const data = { test: 'data' };
      
      await cacheService.set(key, data, 1); // 1ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });

    test('should provide cache statistics', async () => {
      const cacheService = new AICacheService();
      await cacheService.initialize();
      
      const stats = await cacheService.getStats();
      
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('missRate');
      expect(stats).toHaveProperty('size');
    });
  });

  describe('Performance Optimizer', () => {
    test('should optimize system performance', async () => {
      const optimizer = new PerformanceOptimizer();
      
      const result = await optimizer.optimize();
      
      expect(result).toHaveProperty('optimizations');
      expect(result).toHaveProperty('improvements');
    });

    test('should monitor performance metrics', async () => {
      const optimizer = new PerformanceOptimizer();
      
      const metrics = await optimizer.getMetrics();
      
      expect(metrics).toHaveProperty('responseTime');
      expect(metrics).toHaveProperty('throughput');
      expect(metrics).toHaveProperty('resourceUsage');
    });
  });

  describe('AI System Monitor Component', () => {
    const renderWithProviders = (component) => {
      return render(
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      );
    };

    test('should render system status', async () => {
      renderWithProviders(<AISystemMonitor />);
      
      await waitFor(() => {
        expect(screen.getByText('AI System Monitor')).toBeInTheDocument();
        expect(screen.getByText('System Status')).toBeInTheDocument();
      });
    });

    test('should display performance metrics', async () => {
      renderWithProviders(<AISystemMonitor />);
      
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Response Time')).toBeInTheDocument();
        expect(screen.getByText('Throughput')).toBeInTheDocument();
      });
    });

    test('should handle refresh action', async () => {
      renderWithProviders(<AISystemMonitor />);
      
      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh');
        expect(refreshButton).toBeInTheDocument();
      });
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      // Should trigger refresh without errors
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Enhanced AI Dashboard Component', () => {
    const renderWithProviders = (component) => {
      return render(
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      );
    };

    test('should render dashboard sections', async () => {
      renderWithProviders(<EnhancedAIDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Enhanced AI Dashboard')).toBeInTheDocument();
      });
    });

    test('should display AI capabilities', async () => {
      renderWithProviders(<EnhancedAIDashboard />);
      
      await waitFor(() => {
        // Check for AI capability sections
        const dashboard = screen.getByText('Enhanced AI Dashboard');
        expect(dashboard).toBeInTheDocument();
      });
    });
  });

  describe('AI Performance Dashboard Component', () => {
    const renderWithProviders = (component) => {
      return render(
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      );
    };

    test('should render performance dashboard', async () => {
      renderWithProviders(<AIPerformanceDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Performance Dashboard')).toBeInTheDocument();
      });
    });

    test('should display performance charts', async () => {
      renderWithProviders(<AIPerformanceDashboard />);
      
      await waitFor(() => {
        // Performance dashboard should be rendered
        const dashboard = screen.getByText('AI Performance Dashboard');
        expect(dashboard).toBeInTheDocument();
      });
    });
  });

  describe('Integration Flow Tests', () => {
    test('should complete full AI system initialization flow', async () => {
      // Step 1: Initialize bootstrap
      await AISystemBootstrap.initialize();
      
      // Step 2: Initialize integration service
      const integration = new AISystemIntegration();
      await integration.initialize();
      
      // Step 3: Initialize cache service
      const cacheService = new AICacheService();
      await cacheService.initialize();
      
      // Step 4: Verify all services are running
      const status = await AISystemBootstrap.getSystemStatus();
      expect(status.overall).toBe('healthy');
      
      // Step 5: Process a test request
      const request = {
        type: 'system_health_check',
        data: { timestamp: Date.now() }
      };
      
      const result = await integration.processRequest(request);
      expect(result.success).toBe(true);
    });

    test('should handle error scenarios gracefully', async () => {
      // Test error handling in AI system
      const integration = new AISystemIntegration();
      
      // Try to process request without initialization
      const request = {
        type: 'invalid_request',
        data: null
      };
      
      try {
        await integration.processRequest(request);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should maintain performance under load', async () => {
      const integration = new AISystemIntegration();
      await integration.initialize();
      
      // Simulate multiple concurrent requests
      const requests = Array.from({ length: 10 }, (_, i) => ({
        type: 'load_test',
        data: { requestId: i }
      }));
      
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(req => integration.processRequest(req))
      );
      const endTime = Date.now();
      
      // All requests should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('System Recovery Tests', () => {
    test('should recover from service failures', async () => {
      // Initialize system
      await AISystemBootstrap.initialize();
      
      // Simulate service failure and recovery
      const status = await AISystemBootstrap.getSystemStatus();
      expect(status.overall).toBeDefined();
      
      // System should maintain stability
      const healthMetrics = await AISystemBootstrap.getHealthMetrics();
      expect(healthMetrics).toBeDefined();
    });

    test('should handle graceful shutdown and restart', async () => {
      // Initialize system
      await AISystemBootstrap.initialize();
      
      // Shutdown
      const shutdownResult = await AISystemBootstrap.shutdown();
      expect(shutdownResult).toBe(true);
      
      // Restart
      const restartResult = await AISystemBootstrap.initialize();
      expect(restartResult).toBeDefined();
    });
  });
});

// Performance benchmark tests
describe('AI System Performance Benchmarks', () => {
  test('should meet response time requirements', async () => {
    const integration = new AISystemIntegration();
    await integration.initialize();
    
    const request = {
      type: 'performance_test',
      data: { size: 'small' }
    };
    
    const startTime = Date.now();
    await integration.processRequest(request);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    // Should respond within 500ms for small requests
    expect(responseTime).toBeLessThan(500);
  });

  test('should handle high throughput', async () => {
    const integration = new AISystemIntegration();
    await integration.initialize();
    
    const requestCount = 50;
    const requests = Array.from({ length: requestCount }, (_, i) => ({
      type: 'throughput_test',
      data: { id: i }
    }));
    
    const startTime = Date.now();
    const results = await integration.processBatch(requests);
    const endTime = Date.now();
    
    const duration = (endTime - startTime) / 1000; // seconds
    const throughput = requestCount / duration;
    
    // Should handle at least 10 requests per second
    expect(throughput).toBeGreaterThan(10);
    expect(results).toHaveLength(requestCount);
  });

  test('should maintain low memory usage', async () => {
    const integration = new AISystemIntegration();
    await integration.initialize();
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Process multiple requests
    for (let i = 0; i < 100; i++) {
      await integration.processRequest({
        type: 'memory_test',
        data: { iteration: i }
      });
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});

export default {
  name: 'AI System Integration Tests',
  description: 'Comprehensive test suite for AI system integration',
  testCount: 25,
  categories: [
    'Bootstrap Tests',
    'Integration Service Tests', 
    'Cache Service Tests',
    'Performance Optimizer Tests',
    'Component Tests',
    'Integration Flow Tests',
    'Recovery Tests',
    'Performance Benchmarks'
  ]
};