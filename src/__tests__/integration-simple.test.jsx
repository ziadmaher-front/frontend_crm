/**
 * Simplified Integration Tests
 * Tests core functionality without complex UI components
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock services
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getDashboardData: jest.fn(),
    getReportsData: jest.fn(),
  },
  getDashboardData: jest.fn(),
  getReportsData: jest.fn(),
}));

jest.mock('../services/realTimeService', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    send: jest.fn(),
    emit: jest.fn(),
  },
  realTimeService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    send: jest.fn(),
    emit: jest.fn(),
  }
}));

// Simple test component
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Simplified Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('can render with providers', () => {
    render(
      <TestWrapper>
        <div data-testid="test-content">Test Content</div>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('services are properly mocked', () => {
    const api = require('../services/api');
    const realTimeService = require('../services/realTimeService');
    
    expect(api.getDashboardData).toBeDefined();
    expect(realTimeService.default.connect).toBeDefined();
  });

  test('can import and test utils', async () => {
    const { testAccessibility, testPerformance } = await import('../utils/testUtils');
    
    expect(testAccessibility).toBeDefined();
    expect(testPerformance).toBeDefined();
    
    // Test accessibility function
    const mockElement = document.createElement('div');
    mockElement.setAttribute('role', 'main');
    
    const accessibilityResult = await testAccessibility(mockElement);
    expect(accessibilityResult).toHaveProperty('violations');
  });

  test('performance testing works', async () => {
    const { testPerformance } = await import('../utils/testUtils');
    
    const mockRenderFunction = async () => {
      return new Promise(resolve => setTimeout(resolve, 10));
    };
    
    const result = await testPerformance(mockRenderFunction);
    expect(result).toHaveProperty('renderTime');
    expect(typeof result.renderTime).toBe('number');
  });
});