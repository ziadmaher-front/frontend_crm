/**
 * Debug Test - Simple test to isolate Jest issues
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Debug Test', () => {
  test('basic React rendering works', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('can import AccessibilityProvider', async () => {
    const { AccessibilityProvider } = await import('../components/AccessibilityEnhancer');
    expect(AccessibilityProvider).toBeDefined();
  });

  test('can import App component', async () => {
    const App = await import('../App');
    expect(App.default).toBeDefined();
  });
});