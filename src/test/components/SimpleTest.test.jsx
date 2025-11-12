import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple component for testing
const SimpleComponent = ({ message }) => {
  return <div data-testid="simple-message">{message}</div>;
};

describe('Simple Test', () => {
  it('renders a simple message', () => {
    render(<SimpleComponent message="Hello World" />);
    expect(screen.getByTestId('simple-message')).toHaveTextContent('Hello World');
  });

  it('performs basic math', () => {
    expect(2 + 2).toBe(4);
  });

  it('checks array operations', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});