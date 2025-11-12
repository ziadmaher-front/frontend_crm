/**
 * Comprehensive Test Utilities
 * Provides testing helpers, mocks, and utilities for all advanced features
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../components/AccessibilityEnhancer';

// Test data generators
export const testDataGenerators = {
  // Generate mock dashboard metrics
  generateDashboardMetrics: (overrides = {}) => ({
    totalRevenue: 125000,
    totalDeals: 45,
    totalLeads: 128,
    totalContacts: 89,
    conversionRate: 35.2,
    avgDealSize: 2777.78,
    monthlyGrowth: 12.5,
    ...overrides
  }),

  // Generate mock sales data
  generateSalesData: (count = 12, overrides = {}) => {
    return Array.from({ length: count }, (_, index) => ({
      month: new Date(2024, index, 1).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.floor(Math.random() * 50000) + 20000,
      deals: Math.floor(Math.random() * 20) + 5,
      target: 45000,
      ...overrides
    }));
  },

  // Generate mock lead data
  generateLeadData: (count = 10, overrides = {}) => {
    const sources = ['Website', 'Email', 'Social Media', 'Referral', 'Cold Call'];
    const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'];
    
    return Array.from({ length: count }, (_, index) => ({
      id: `lead-${index + 1}`,
      name: `Lead ${index + 1}`,
      company: `Company ${index + 1}`,
      email: `lead${index + 1}@example.com`,
      phone: `+1-555-${String(index + 1).padStart(4, '0')}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      value: Math.floor(Math.random() * 10000) + 1000,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      ...overrides
    }));
  },

  // Generate mock contact data
  generateContactData: (count = 15, overrides = {}) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `contact-${index + 1}`,
      name: `Contact ${index + 1}`,
      email: `contact${index + 1}@example.com`,
      phone: `+1-555-${String(index + 1000).padStart(4, '0')}`,
      company: `Company ${index + 1}`,
      position: `Position ${index + 1}`,
      lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      ...overrides
    }));
  },

  // Generate mock team performance data
  generateTeamData: (count = 8, overrides = {}) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `rep-${index + 1}`,
      name: `Sales Rep ${index + 1}`,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      deals: Math.floor(Math.random() * 30) + 10,
      winRate: Math.floor(Math.random() * 40) + 60,
      target: 120000,
      ...overrides
    }));
  },

  // Generate mock predictive analytics data
  generatePredictiveData: (overrides = {}) => ({
    salesForecast: {
      nextMonth: Math.floor(Math.random() * 20000) + 80000,
      nextQuarter: Math.floor(Math.random() * 50000) + 200000,
      confidence: Math.floor(Math.random() * 20) + 80
    },
    churnPrediction: {
      riskScore: Math.floor(Math.random() * 30) + 10,
      atRiskCustomers: Math.floor(Math.random() * 10) + 5,
      recommendations: ['Increase engagement', 'Offer discount', 'Schedule call']
    },
    leadScoring: {
      averageScore: Math.floor(Math.random() * 30) + 70,
      hotLeads: Math.floor(Math.random() * 15) + 5,
      trends: 'increasing'
    },
    ...overrides
  }),

  // Generate mock real-time data
  generateRealTimeData: (overrides = {}) => ({
    liveUsers: Math.floor(Math.random() * 50) + 10,
    todayRevenue: Math.floor(Math.random() * 10000) + 5000,
    newLeads: Math.floor(Math.random() * 10) + 2,
    conversionRate: Math.floor(Math.random() * 10) + 25,
    recentActivities: Array.from({ length: 5 }, (_, i) => ({
      id: `activity-${i}`,
      type: ['deal_created', 'lead_converted', 'contact_added'][Math.floor(Math.random() * 3)],
      message: `Activity ${i + 1}`,
      timestamp: new Date(Date.now() - i * 60000)
    })),
    ...overrides
  })
};

// Mock API responses
export const mockApiResponses = {
  // Mock successful API response
  success: (data) => Promise.resolve({ data, status: 200, ok: true }),

  // Mock API error response
  error: (message = 'API Error', status = 500) => 
    Promise.reject({ message, status, response: { status } }),

  // Mock loading delay
  delayed: (data, delay = 1000) => 
    new Promise(resolve => setTimeout(() => resolve({ data, status: 200 }), delay)),

  // Mock network error
  networkError: () => Promise.reject(new Error('Network Error')),

  // Mock timeout error
  timeoutError: () => Promise.reject(new Error('Request Timeout'))
};

// Service mocks
export const mockServices = {
  // Mock reports service
  reportsService: {
    getDashboardMetrics: jest.fn(() => mockApiResponses.success(testDataGenerators.generateDashboardMetrics())),
    getSalesAnalytics: jest.fn(() => mockApiResponses.success(testDataGenerators.generateSalesData())),
    getLeadAnalytics: jest.fn(() => mockApiResponses.success(testDataGenerators.generateLeadData())),
    getContactAnalytics: jest.fn(() => mockApiResponses.success(testDataGenerators.generateContactData())),
    getTeamAnalytics: jest.fn(() => mockApiResponses.success(testDataGenerators.generateTeamData()))
  },

  // Mock real-time service
  realTimeService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    getMetrics: jest.fn(() => mockApiResponses.success(testDataGenerators.generateRealTimeData()))
  },

  // Mock predictive service
  predictiveService: {
    getSalesForecast: jest.fn(() => mockApiResponses.success(testDataGenerators.generatePredictiveData().salesForecast)),
    getChurnPrediction: jest.fn(() => mockApiResponses.success(testDataGenerators.generatePredictiveData().churnPrediction)),
    getLeadScoring: jest.fn(() => mockApiResponses.success(testDataGenerators.generatePredictiveData().leadScoring))
  },

  // Mock export service
  exportService: {
    exportToPDF: jest.fn(() => Promise.resolve()),
    exportToExcel: jest.fn(() => Promise.resolve()),
    exportToCSV: jest.fn(() => Promise.resolve())
  }
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    }),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient
  };
};

// Accessibility testing utilities
export const accessibilityTestUtils = {
  // Test keyboard navigation
  testKeyboardNavigation: async (element, keys = ['Tab', 'Enter', 'Escape']) => {
    const user = userEvent.setup();
    
    for (const key of keys) {
      await user.keyboard(`{${key}}`);
      // Add assertions based on expected behavior
    }
  },

  // Test screen reader announcements
  testScreenReaderAnnouncements: (element) => {
    const liveRegions = element.querySelectorAll('[aria-live]');
    return liveRegions.length > 0;
  },

  // Test ARIA attributes
  testAriaAttributes: (element, expectedAttributes = []) => {
    return expectedAttributes.every(attr => element.hasAttribute(attr));
  },

  // Test focus management
  testFocusManagement: async (triggerElement, expectedFocusElement) => {
    const user = userEvent.setup();
    await user.click(triggerElement);
    expect(expectedFocusElement).toHaveFocus();
  },

  // Test color contrast (simplified)
  testColorContrast: (element) => {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    
    // Simplified contrast check - in real tests, use proper contrast calculation
    return backgroundColor !== color;
  }
};

// Performance testing utilities
export const performanceTestUtils = {
  // Measure component render time
  measureRenderTime: async (renderFunction) => {
    const start = performance.now();
    await renderFunction();
    const end = performance.now();
    return end - start;
  },

  // Test lazy loading
  testLazyLoading: async (lazyComponent) => {
    const { container } = renderWithProviders(lazyComponent);
    
    // Check if loading state is shown initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  },

  // Test memory leaks (simplified)
  testMemoryLeaks: (component) => {
    const { unmount } = renderWithProviders(component);
    
    // Render and unmount multiple times
    for (let i = 0; i < 10; i++) {
      unmount();
      renderWithProviders(component);
    }
    
    // In real tests, check memory usage
    return true;
  }
};

// Chart testing utilities
export const chartTestUtils = {
  // Test chart data rendering
  testChartData: (chartContainer, expectedDataPoints) => {
    const dataElements = chartContainer.querySelectorAll('[data-testid*="chart-data"]');
    expect(dataElements).toHaveLength(expectedDataPoints);
  },

  // Test chart interactions
  testChartInteractions: async (chartContainer) => {
    const user = userEvent.setup();
    const interactiveElements = chartContainer.querySelectorAll('[role="button"], button');
    
    for (const element of interactiveElements) {
      await user.hover(element);
      await user.click(element);
    }
  },

  // Test chart responsiveness
  testChartResponsiveness: (chartContainer) => {
    const chart = chartContainer.querySelector('svg, canvas');
    expect(chart).toHaveStyle({ width: '100%' });
  }
};

// Form testing utilities
export const formTestUtils = {
  // Fill form with test data
  fillForm: async (formData) => {
    const user = userEvent.setup();
    
    for (const [fieldName, value] of Object.entries(formData)) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i')) || 
                   screen.getByPlaceholderText(new RegExp(fieldName, 'i'));
      
      if (field.type === 'checkbox' || field.type === 'radio') {
        if (value) await user.click(field);
      } else {
        await user.clear(field);
        await user.type(field, String(value));
      }
    }
  },

  // Test form validation
  testFormValidation: async (submitButton, expectedErrors) => {
    const user = userEvent.setup();
    await user.click(submitButton);
    
    for (const error of expectedErrors) {
      expect(screen.getByText(new RegExp(error, 'i'))).toBeInTheDocument();
    }
  },

  // Test form submission
  testFormSubmission: async (formData, submitButton, onSubmit) => {
    await formTestUtils.fillForm(formData);
    
    const user = userEvent.setup();
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining(formData));
    });
  }
};

// API testing utilities
export const apiTestUtils = {
  // Mock API call
  mockApiCall: (service, method, response) => {
    service[method].mockResolvedValue(response);
  },

  // Mock API error
  mockApiError: (service, method, error) => {
    service[method].mockRejectedValue(error);
  },

  // Test loading states
  testLoadingStates: async (component) => {
    const { container } = renderWithProviders(component);
    
    // Check initial loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  },

  // Test error states
  testErrorStates: async (component, errorMessage) => {
    const { container } = renderWithProviders(component);
    
    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  }
};

// Custom matchers for Jest
export const customMatchers = {
  // Check if element is accessible
  toBeAccessible: (element) => {
    const hasAriaLabel = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
    const hasRole = element.hasAttribute('role');
    const isFocusable = element.tabIndex >= 0 || ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase());
    
    return {
      pass: hasAriaLabel && (hasRole || isFocusable),
      message: () => `Expected element to be accessible`
    };
  },

  // Check if element is responsive
  toBeResponsive: (element) => {
    const styles = window.getComputedStyle(element);
    const hasFlexibleWidth = styles.width.includes('%') || styles.width === 'auto';
    const hasMaxWidth = styles.maxWidth !== 'none';
    
    return {
      pass: hasFlexibleWidth || hasMaxWidth,
      message: () => `Expected element to be responsive`
    };
  }
};

// Test setup helpers
export const testSetup = {
  // Setup before each test
  beforeEach: () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock window methods
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },

  // Setup after each test
  afterEach: () => {
    // Cleanup
    jest.restoreAllMocks();
  },

  // Mock intersection observer
  mockIntersectionObserver: () => {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  },

  // Mock resize observer
  mockResizeObserver: () => {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }
};

// High-level test functions
export const testAccessibility = async (element) => {
  const violations = [];
  
  // Check for basic accessibility requirements
  if (!element.hasAttribute('role') && !['main', 'nav', 'section', 'article'].includes(element.tagName.toLowerCase())) {
    violations.push('Missing role attribute');
  }
  
  // Check for keyboard navigation
  const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusableElements.length === 0) {
    violations.push('No focusable elements found');
  }
  
  return { violations };
};

export const testPerformance = async (renderFunction) => {
  const start = performance.now();
  await renderFunction();
  const end = performance.now();
  
  return {
    renderTime: end - start
  };
};

export const testResponsiveness = (element) => {
  const styles = window.getComputedStyle(element);
  const isResponsive = styles.maxWidth === '100%' || styles.width === '100%';
  
  return {
    isResponsive,
    styles: {
      width: styles.width,
      maxWidth: styles.maxWidth
    }
  };
};

// Mock data for tests
export const mockDashboardData = testDataGenerators.generateDashboardMetrics();

export const mockReportsData = {
  sales: testDataGenerators.generateSalesData(),
  leads: testDataGenerators.generateLeadData(),
  contacts: testDataGenerators.generateContactData(),
  team: testDataGenerators.generateTeamData(),
  predictive: testDataGenerators.generatePredictiveData(),
  realTime: testDataGenerators.generateRealTimeData()
};

export default {
  testDataGenerators,
  mockApiResponses,
  mockServices,
  renderWithProviders,
  testAccessibility,
  testPerformance,
  testResponsiveness,
  accessibilityTestUtils,
  performanceTestUtils,
  chartTestUtils,
  formTestUtils,
  apiTestUtils,
  customMatchers,
  testSetup
};