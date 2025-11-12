import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Toaster component
const MockToaster = () => null;

// Create a custom render function that includes providers
const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
        <MockToaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Custom user event setup
export const user = userEvent.setup();

// Common test utilities
export const testUtils = {
  // Wait for element to appear
  waitForElement: async (selector, options = {}) => {
    return await waitFor(() => {
      const element = screen.getByTestId(selector);
      expect(element).toBeInTheDocument();
      return element;
    }, options);
  },

  // Wait for element to disappear
  waitForElementToBeRemoved: async (selector, options = {}) => {
    return await waitFor(() => {
      expect(screen.queryByTestId(selector)).not.toBeInTheDocument();
    }, options);
  },

  // Fill form field
  fillField: async (fieldName, value) => {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await user.clear(field);
    await user.type(field, value);
    return field;
  },

  // Select option from dropdown
  selectOption: async (selectName, optionText) => {
    const select = screen.getByLabelText(new RegExp(selectName, 'i'));
    await user.selectOptions(select, optionText);
    return select;
  },

  // Click button by text
  clickButton: async (buttonText) => {
    const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
    await user.click(button);
    return button;
  },

  // Submit form
  submitForm: async (formTestId = 'form') => {
    const form = screen.getByTestId(formTestId);
    fireEvent.submit(form);
    return form;
  },

  // Check if loading state is shown
  expectLoading: () => {
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  },

  // Check if error message is shown
  expectError: (errorMessage) => {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  },

  // Check if success message is shown
  expectSuccess: (successMessage) => {
    expect(screen.getByText(new RegExp(successMessage, 'i'))).toBeInTheDocument();
  },

  // Mock API response
  mockApiResponse: (data, status = 200) => {
    global.fetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
    });
  },

  // Mock API error
  mockApiError: (error, status = 500) => {
    global.fetch.mockRejectedValueOnce(new Error(error));
  },

  // Create mock contact
  createMockContact: (overrides = {}) => ({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    title: 'Sales Manager',
    status: 'active',
    ...overrides,
  }),

  // Create mock account
  createMockAccount: (overrides = {}) => ({
    id: '1',
    name: 'Acme Corp',
    industry: 'Technology',
    website: 'https://acme.com',
    phone: '+1-555-0100',
    email: 'info@acme.com',
    status: 'active',
    ...overrides,
  }),

  // Create mock deal
  createMockDeal: (overrides = {}) => ({
    id: '1',
    name: 'Enterprise Software License',
    amount: 50000,
    stage: 'proposal',
    probability: 75,
    closeDate: '2024-03-15',
    status: 'open',
    ...overrides,
  }),

  // Create mock lead
  createMockLead: (overrides = {}) => ({
    id: '1',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1-555-0125',
    company: 'Startup Inc',
    title: 'CEO',
    source: 'website',
    status: 'new',
    score: 85,
    ...overrides,
  }),

  // Create mock task
  createMockTask: (overrides = {}) => ({
    id: '1',
    title: 'Follow up with John Doe',
    description: 'Call to discuss proposal',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-02-15',
    assignedTo: 'user1',
    ...overrides,
  }),

  // Simulate keyboard navigation
  navigateWithKeyboard: async (key, times = 1) => {
    for (let i = 0; i < times; i++) {
      await user.keyboard(`{${key}}`);
    }
  },

  // Check accessibility
  checkAccessibility: (element) => {
    // Check for proper ARIA attributes
    if (element.getAttribute('role')) {
      expect(element).toHaveAttribute('role');
    }
    
    // Check for proper labeling
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
      const label = element.getAttribute('aria-label') || 
                   element.getAttribute('aria-labelledby') ||
                   screen.queryByLabelText(element.name);
      expect(label).toBeTruthy();
    }
    
    // Check for keyboard accessibility
    if (element.getAttribute('tabindex') !== '-1') {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    }
  },

  // Simulate mobile viewport
  setMobileViewport: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
    window.dispatchEvent(new Event('resize'));
  },

  // Simulate desktop viewport
  setDesktopViewport: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
    window.dispatchEvent(new Event('resize'));
  },

  // Mock intersection observer
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
    return mockIntersectionObserver;
  },

  // Mock resize observer
  mockResizeObserver: () => {
    const mockResizeObserver = jest.fn();
    mockResizeObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.ResizeObserver = mockResizeObserver;
    return mockResizeObserver;
  },

  // Create test query client
  createTestQueryClient: () => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  },

  // Wait for queries to settle
  waitForQueries: async (queryClient) => {
    await waitFor(() => {
      expect(queryClient.isFetching()).toBe(0);
    });
  },
};

// Custom matchers
expect.extend({
  toBeAccessible(received) {
    const pass = received.getAttribute('aria-label') || 
                 received.getAttribute('aria-labelledby') ||
                 received.getAttribute('role');
    
    if (pass) {
      return {
        message: () => `expected element not to be accessible`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be accessible (have aria-label, aria-labelledby, or role)`,
        pass: false,
      };
    }
  },
  
  toHaveLoadingState(received) {
    const hasLoadingText = received.textContent.includes('Loading') ||
                          received.textContent.includes('loading');
    const hasLoadingClass = received.className.includes('loading') ||
                           received.className.includes('spinner');
    const hasAriaLabel = received.getAttribute('aria-label')?.includes('loading');
    
    const pass = hasLoadingText || hasLoadingClass || hasAriaLabel;
    
    if (pass) {
      return {
        message: () => `expected element not to have loading state`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to have loading state`,
        pass: false,
      };
    }
  },
});

export default testUtils;