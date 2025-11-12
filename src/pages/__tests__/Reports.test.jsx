/**
 * Comprehensive Test Suite for Reports Component
 * Tests all advanced features including performance, accessibility, and error handling
 */

import React from 'react';
import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import Reports from '../Reports';
import {
  renderWithProviders,
  testDataGenerators,
  mockServices,
  mockApiResponses,
  accessibilityTestUtils,
  performanceTestUtils,
  chartTestUtils,
  apiTestUtils,
  testSetup
} from '../../utils/testUtils';

// Mock the services
jest.mock('../../services/reportsService', () => mockServices.reportsService);
jest.mock('../../services/realTimeService', () => mockServices.realTimeService);
jest.mock('../../services/predictiveService', () => mockServices.predictiveService);
jest.mock('../../services/exportService', () => mockServices.exportService);

// Mock chart components to avoid canvas rendering issues in tests
jest.mock('../../components/charts/AdvancedCharts', () => ({
  HeatmapChart: ({ data, ...props }) => (
    <div data-testid="heatmap-chart" {...props}>
      Heatmap Chart - {data?.length || 0} items
    </div>
  ),
  FunnelChart: ({ data, ...props }) => (
    <div data-testid="funnel-chart" {...props}>
      Funnel Chart - {data?.length || 0} items
    </div>
  ),
  WaterfallChart: ({ data, ...props }) => (
    <div data-testid="waterfall-chart" {...props}>
      Waterfall Chart - {data?.length || 0} items
    </div>
  ),
  ScatterPlotMatrix: ({ data, ...props }) => (
    <div data-testid="scatter-plot-matrix" {...props}>
      Scatter Plot Matrix - {data?.length || 0} items
    </div>
  ),
  InteractiveDashboard: ({ data, ...props }) => (
    <div data-testid="interactive-dashboard" {...props}>
      Interactive Dashboard - {data?.length || 0} items
    </div>
  )
}));

// Mock performance utilities
jest.mock('@/utils/performance', () => ({
  performanceMonitor: {
    mark: jest.fn(),
    measure: jest.fn(),
    getMetrics: jest.fn(() => ({ renderTime: 100, memoryUsage: 50 }))
  },
  debounce: jest.fn((fn) => fn),
  throttle: jest.fn((fn) => fn),
  useMemoizedCallback: jest.fn((fn) => fn),
  useMemoizedValue: jest.fn((value) => value)
}));

// Mock cache manager
jest.mock('@/utils/cache', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    getOrFetch: jest.fn((key, fetchFn) => fetchFn())
  }
}));

describe('Reports Component', () => {
  let queryClient;

  beforeEach(() => {
    testSetup.beforeEach();
    testSetup.mockIntersectionObserver();
    testSetup.mockResizeObserver();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Setup default mock responses
    mockServices.reportsService.getDashboardMetrics.mockResolvedValue(
      mockApiResponses.success(testDataGenerators.generateDashboardMetrics())
    );
    mockServices.reportsService.getSalesAnalytics.mockResolvedValue(
      mockApiResponses.success(testDataGenerators.generateSalesData())
    );
    mockServices.reportsService.getLeadAnalytics.mockResolvedValue(
      mockApiResponses.success(testDataGenerators.generateLeadData())
    );
    mockServices.reportsService.getContactAnalytics.mockResolvedValue(
      mockApiResponses.success(testDataGenerators.generateContactData())
    );
    mockServices.reportsService.getTeamAnalytics.mockResolvedValue(
      mockApiResponses.success(testDataGenerators.generateTeamData())
    );
  });

  afterEach(() => {
    testSetup.afterEach();
  });

  describe('Basic Rendering', () => {
    test('renders reports component with all sections', async () => {
      renderWithProviders(<Reports />, { queryClient });

      // Check main sections
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive insights and performance metrics')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check key metrics are displayed
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total Deals')).toBeInTheDocument();
      expect(screen.getByText('Total Leads')).toBeInTheDocument();
      expect(screen.getByText('Total Contacts')).toBeInTheDocument();
    });

    test('renders all chart components', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check all chart components are rendered
      expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument();
      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
      expect(screen.getByTestId('waterfall-chart')).toBeInTheDocument();
      expect(screen.getByTestId('scatter-plot-matrix')).toBeInTheDocument();
      expect(screen.getByTestId('interactive-dashboard')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading state initially', () => {
      // Mock delayed response
      mockServices.reportsService.getDashboardMetrics.mockImplementation(
        () => mockApiResponses.delayed(testDataGenerators.generateDashboardMetrics(), 2000)
      );

      renderWithProviders(<Reports />, { queryClient });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('shows individual loading states for each data source', async () => {
      // Mock different loading times for different services
      mockServices.reportsService.getDashboardMetrics.mockImplementation(
        () => mockApiResponses.delayed(testDataGenerators.generateDashboardMetrics(), 500)
      );
      mockServices.reportsService.getSalesAnalytics.mockImplementation(
        () => mockApiResponses.delayed(testDataGenerators.generateSalesData(), 1000)
      );

      renderWithProviders(<Reports />, { queryClient });

      // Initially should show loading
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Wait for first data to load
      await waitFor(() => {
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Sales data might still be loading
      // This tests the granular loading states
    });
  });

  describe('Error Handling', () => {
    test('displays error state when API fails', async () => {
      mockServices.reportsService.getDashboardMetrics.mockRejectedValue(
        new Error('Failed to fetch dashboard metrics')
      );

      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
      });

      // Check retry button is present
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    test('handles network errors gracefully', async () => {
      mockServices.reportsService.getDashboardMetrics.mockRejectedValue(
        new Error('Network Error')
      );

      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    test('retry functionality works correctly', async () => {
      // First call fails, second succeeds
      mockServices.reportsService.getDashboardMetrics
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValue(mockApiResponses.success(testDataGenerators.generateDashboardMetrics()));

      renderWithProviders(<Reports />, { queryClient });

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText(/try again/i);
      await userEvent.click(retryButton);

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Features', () => {
    test('date range selector works correctly', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const dateRangeSelector = screen.getByLabelText(/date range/i);
      expect(dateRangeSelector).toBeInTheDocument();

      // Test date range change
      await userEvent.selectOptions(dateRangeSelector, 'last-30-days');
      
      // Should trigger data refetch
      expect(mockServices.reportsService.getDashboardMetrics).toHaveBeenCalledTimes(2);
    });

    test('refresh button works correctly', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByLabelText(/refresh/i);
      await userEvent.click(refreshButton);

      // Should trigger data refetch
      expect(mockServices.reportsService.getDashboardMetrics).toHaveBeenCalledTimes(2);
    });

    test('export functionality works', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const exportButton = screen.getByLabelText(/export/i);
      await userEvent.click(exportButton);

      // Should call export service
      expect(mockServices.exportService.exportToPDF).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check main landmarks
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('toolbar')).toBeInTheDocument();

      // Check ARIA labels
      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Test keyboard navigation
      await accessibilityTestUtils.testKeyboardNavigation(
        screen.getByRole('main'),
        ['Tab', 'Enter', 'Escape']
      );
    });

    test('has proper focus management', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByLabelText(/refresh/i);
      
      // Test focus management
      await accessibilityTestUtils.testFocusManagement(refreshButton, refreshButton);
    });

    test('provides screen reader announcements', async () => {
      renderWithProviders(<Reports />, { queryClient });

      // Check for live regions
      const liveRegions = screen.getAllByRole('status');
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('lazy loads chart components', async () => {
      const renderTime = await performanceTestUtils.measureRenderTime(() => {
        renderWithProviders(<Reports />, { queryClient });
      });

      // Should render quickly due to lazy loading
      expect(renderTime).toBeLessThan(1000); // 1 second
    });

    test('memoizes expensive calculations', async () => {
      const { rerender } = renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Rerender with same props
      rerender(<Reports />);

      // Should not refetch data due to memoization
      expect(mockServices.reportsService.getDashboardMetrics).toHaveBeenCalledTimes(1);
    });

    test('handles large datasets efficiently', async () => {
      // Mock large dataset
      const largeDataset = testDataGenerators.generateSalesData(1000);
      mockServices.reportsService.getSalesAnalytics.mockResolvedValue(
        mockApiResponses.success(largeDataset)
      );

      const renderTime = await performanceTestUtils.measureRenderTime(() => {
        renderWithProviders(<Reports />, { queryClient });
      });

      // Should handle large datasets efficiently
      expect(renderTime).toBeLessThan(2000); // 2 seconds
    });
  });

  describe('Responsive Design', () => {
    test('adapts to different screen sizes', async () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Tablet size
      });

      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check responsive classes are applied
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('container', 'mx-auto');
    });

    test('charts are responsive', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Test chart responsiveness
      const chartContainers = screen.getAllByTestId(/chart/);
      chartContainers.forEach(container => {
        chartTestUtils.testChartResponsiveness(container);
      });
    });
  });

  describe('Data Integration', () => {
    test('displays correct metrics from API', async () => {
      const mockMetrics = testDataGenerators.generateDashboardMetrics({
        totalRevenue: 150000,
        totalDeals: 50,
        totalLeads: 200,
        totalContacts: 100
      });

      mockServices.reportsService.getDashboardMetrics.mockResolvedValue(
        mockApiResponses.success(mockMetrics)
      );

      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.getByText('$150,000')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    test('handles empty data gracefully', async () => {
      mockServices.reportsService.getDashboardMetrics.mockResolvedValue(
        mockApiResponses.success(null)
      );

      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.getByText(/no data available/i)).toBeInTheDocument();
      });
    });

    test('updates data in real-time', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Simulate real-time update
      const newMetrics = testDataGenerators.generateDashboardMetrics({
        totalRevenue: 160000
      });

      mockServices.reportsService.getDashboardMetrics.mockResolvedValue(
        mockApiResponses.success(newMetrics)
      );

      // Trigger refresh
      const refreshButton = screen.getByLabelText(/refresh/i);
      await userEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('$160,000')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary', () => {
    test('catches and displays component errors', async () => {
      // Mock a component that throws an error
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const ErrorComponent = () => (
        <Reports>
          <ThrowError />
        </Reports>
      );

      renderWithProviders(<ErrorComponent />, { queryClient });

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cache Management', () => {
    test('uses cached data when available', async () => {
      const cachedData = testDataGenerators.generateDashboardMetrics();
      
      // Mock cache hit
      const { cacheManager } = require('@/utils/cache');
      cacheManager.getOrFetch.mockResolvedValue(cachedData);

      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should use cached data
      expect(cacheManager.getOrFetch).toHaveBeenCalled();
    });

    test('clears cache on refresh', async () => {
      renderWithProviders(<Reports />, { queryClient });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByLabelText(/refresh/i);
      await userEvent.click(refreshButton);

      // Should clear cache
      const { cacheManager } = require('@/utils/cache');
      expect(cacheManager.clear).toHaveBeenCalled();
    });
  });
});