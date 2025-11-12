/**
 * Integration Tests
 * Tests the complete application flow with all advanced features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccessibilityProvider } from '../components/AccessibilityEnhancer';
import App from '../App';
import Dashboard from '../pages/Dashboard';
import Reports from '../pages/Reports';
import { 
  mockDashboardData, 
  mockReportsData, 
  mockApiResponses,
  renderWithProviders,
  testAccessibility,
  testPerformance,
  testResponsiveness
} from '../utils/testUtils';

// Mock services with proper module factory functions
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getDashboardData: jest.fn(),
    getReportsData: jest.fn(),
    getSalesData: jest.fn(),
    getLeadsData: jest.fn(),
    getContactsData: jest.fn(),
    getTeamData: jest.fn(),
    getPredictiveData: jest.fn(),
    getRealTimeData: jest.fn(),
    exportData: jest.fn()
  },
  getDashboardData: jest.fn(),
  getReportsData: jest.fn(),
  getSalesData: jest.fn(),
  getLeadsData: jest.fn(),
  getContactsData: jest.fn(),
  getTeamData: jest.fn(),
  getPredictiveData: jest.fn(),
  getRealTimeData: jest.fn(),
  exportData: jest.fn()
}));

jest.mock('../services/realTimeService', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn()
  },
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  send: jest.fn()
}));

jest.mock('../services/predictiveService', () => ({
  __esModule: true,
  default: {
    getPredictions: jest.fn(),
    getForecasts: jest.fn(),
    getRecommendations: jest.fn()
  },
  getPredictions: jest.fn(),
  getForecasts: jest.fn(),
  getRecommendations: jest.fn()
}));

describe('Integration Tests', () => {
  let queryClient;
  let user;

  beforeAll(() => {
    // Setup React Query client for testing
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    const api = require('../services/api');
    api.getDashboardData.mockResolvedValue(mockApiResponses.success(mockDashboardData));
    api.getReportsData.mockResolvedValue(mockApiResponses.success(mockReportsData));
    api.getSalesData.mockResolvedValue(mockApiResponses.success(mockReportsData.sales));
    api.getLeadsData.mockResolvedValue(mockApiResponses.success(mockReportsData.leads));
    api.getContactsData.mockResolvedValue(mockApiResponses.success(mockReportsData.contacts));
    api.getTeamData.mockResolvedValue(mockApiResponses.success(mockReportsData.team));
    api.getPredictiveData.mockResolvedValue(mockApiResponses.success(mockReportsData.predictive));
    api.getRealTimeData.mockResolvedValue(mockApiResponses.success(mockReportsData.realTime));
  });

  describe('Complete Application Flow', () => {
    test('renders full application with all features', async () => {
      const { container } = renderWithProviders(<App />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify main navigation is present
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Verify accessibility features are available
      expect(container.querySelector('[data-accessibility-provider]')).toBeInTheDocument();
      
      // Test performance
      const performanceResults = await testPerformance(() => 
        renderWithProviders(<App />)
      );
      expect(performanceResults.renderTime).toBeLessThan(1000);
    });

    test('dashboard integration with all advanced features', async () => {
      renderWithProviders(<Dashboard />);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Test real-time updates
      const realTimeService = require('../services/realTimeService');
      expect(realTimeService.subscribe).toHaveBeenCalled();

      // Test predictive analytics
      await waitFor(() => {
        expect(screen.getByText(/predictive/i)).toBeInTheDocument();
      });

      // Test interactive charts
      const chartElements = screen.getAllByRole('img', { hidden: true });
      expect(chartElements.length).toBeGreaterThan(0);

      // Test accessibility
      const accessibilityResults = await testAccessibility(screen.getByRole('main'));
      expect(accessibilityResults.violations).toHaveLength(0);
    });

    test('reports page with advanced charts and features', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);
      
      // Wait for all charts to load
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Test advanced chart components
      await waitFor(() => {
        expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument();
        expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
        expect(screen.getByTestId('waterfall-chart')).toBeInTheDocument();
        expect(screen.getByTestId('scatter-plot-matrix')).toBeInTheDocument();
      });

      // Test chart interactions
      const heatmapChart = screen.getByTestId('heatmap-chart');
      fireEvent.mouseOver(heatmapChart);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Test export functionality
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);
      
      const api = require('../services/api');
      expect(api.exportData).toHaveBeenCalled();
    });
  });

  describe('Accessibility Integration', () => {
    test('keyboard navigation throughout application', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);
      
      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');
      
      // Test skip links
      const skipLink = screen.getByText(/skip to main content/i);
      await user.click(skipLink);
      expect(document.activeElement).toHaveAttribute('role', 'main');
    });

    test('screen reader announcements', async () => {
      const { container } = renderWithProviders(<Dashboard />);
      
      // Wait for live region to be populated
      await waitFor(() => {
        const liveRegion = container.querySelector('[aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
      });
    });

    test('high contrast mode integration', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <AccessibilityProvider>
          <Dashboard />
        </AccessibilityProvider>
      );
      
      // Toggle high contrast
      const highContrastButton = screen.getByRole('button', { name: /high contrast/i });
      await user.click(highContrastButton);
      
      expect(container.firstChild).toHaveClass('high-contrast');
    });
  });

  describe('Performance Integration', () => {
    test('lazy loading of chart components', async () => {
      const { container } = renderWithProviders(<Reports />);
      
      // Initially should show loading states
      expect(screen.getAllByText(/loading/i)).toHaveLength(4);
      
      // Wait for charts to load progressively
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      }, { timeout: 15000 });
      
      // Verify all charts are rendered
      expect(container.querySelectorAll('[data-chart-loaded="true"]')).toHaveLength(4);
    });

    test('data caching and optimization', async () => {
      const api = require('../services/api');
      
      // First render
      renderWithProviders(<Dashboard />);
      await waitFor(() => {
        expect(api.getDashboardData).toHaveBeenCalledTimes(1);
      });
      
      // Second render should use cache
      renderWithProviders(<Dashboard />);
      await waitFor(() => {
        expect(api.getDashboardData).toHaveBeenCalledTimes(1); // Still 1, using cache
      });
    });

    test('memory leak prevention', async () => {
      const { unmount } = renderWithProviders(<Reports />);
      
      // Simulate component lifecycle
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });
      
      // Unmount and verify cleanup
      unmount();
      
      const realTimeService = require('../services/realTimeService');
      expect(realTimeService.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Responsive Design Integration', () => {
    test('mobile layout adaptation', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      const { container } = renderWithProviders(<Dashboard />);
      
      await waitFor(() => {
        expect(container.querySelector('.mobile-layout')).toBeInTheDocument();
      });
    });

    test('tablet layout adaptation', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      const { container } = renderWithProviders(<Reports />);
      
      await waitFor(() => {
        expect(container.querySelector('.tablet-layout')).toBeInTheDocument();
      });
    });

    test('chart responsiveness', async () => {
      renderWithProviders(<Reports />);
      
      // Wait for charts to load
      await waitFor(() => {
        expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument();
      });
      
      // Simulate resize
      fireEvent(window, new Event('resize'));
      
      // Verify charts adapt
      await waitFor(() => {
        const chart = screen.getByTestId('heatmap-chart');
        expect(chart).toHaveAttribute('data-responsive', 'true');
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('graceful API error handling', async () => {
      const user = userEvent.setup();
      const api = require('../services/api');
      api.getDashboardData.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      });
      
      // Test retry functionality
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(api.getDashboardData).toHaveBeenCalledTimes(2);
    });

    test('chart error boundaries', async () => {
      // Mock chart component to throw error
      jest.doMock('../components/charts/HeatmapChart', () => {
        return function ErrorChart() {
          throw new Error('Chart rendering error');
        };
      });
      
      renderWithProviders(<Reports />);
      
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Validation Integration', () => {
    test('input sanitization across forms', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);
      
      // Navigate to a form (assuming there's a contact form)
      const formInput = screen.getByRole('textbox', { name: /email/i });
      
      // Test malicious input
      await user.type(formInput, '<script>alert("xss")</script>test@example.com');
      
      // Verify sanitization
      expect(formInput.value).toBe('test@example.com');
    });

    test('API data validation', async () => {
      const api = require('../services/api');
      
      // Mock malicious API response
      api.getDashboardData.mockResolvedValue({
        data: {
          metrics: '<script>alert("xss")</script>',
          sales: 'DROP TABLE users;'
        }
      });
      
      renderWithProviders(<Dashboard />);
      
      await waitFor(() => {
        // Verify data is sanitized before rendering
        expect(screen.queryByText(/script/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/DROP TABLE/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-time Features Integration', () => {
    test('WebSocket connection and updates', async () => {
      const realTimeService = require('../services/realTimeService');
      
      renderWithProviders(<Dashboard />);
      
      // Verify WebSocket subscription
      expect(realTimeService.subscribe).toHaveBeenCalled();
      
      // Simulate real-time update
      const updateCallback = realTimeService.subscribe.mock.calls[0][1];
      updateCallback({
        type: 'SALES_UPDATE',
        data: { newSale: { id: 1, amount: 1000 } }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/new sale/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export and Reporting Integration', () => {
    test('comprehensive data export', async () => {
      const user = userEvent.setup();
      const api = require('../services/api');
      api.exportData.mockResolvedValue({
        data: 'exported-data-url'
      });
      
      renderWithProviders(<Reports />);
      
      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });
      
      // Test export functionality
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);
      
      // Verify export options
      expect(screen.getByText(/export format/i)).toBeInTheDocument();
      
      // Select CSV export
      const csvOption = screen.getByRole('radio', { name: /csv/i });
      await user.click(csvOption);
      
      const confirmButton = screen.getByRole('button', { name: /confirm export/i });
      await user.click(confirmButton);
      
      expect(api.exportData).toHaveBeenCalledWith({
        format: 'csv',
        data: expect.any(Object)
      });
    });
  });
});