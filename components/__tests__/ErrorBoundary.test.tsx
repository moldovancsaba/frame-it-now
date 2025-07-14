import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock console.error to prevent error logs during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    const ThrowError = (): never => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText(/something went wrong/i)).toBeInTheDocument();
    expect(getByText(/reload page/i)).toBeInTheDocument();
  });

  it('calls error logging service when error occurs', () => {
    const mockLogError = jest.fn();
    const ThrowError = (): never => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary onError={mockLogError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('resets error state when try again is clicked', () => {
    const mockNavigation = {
      reload: jest.fn()
    };
    const ThrowError = (): never => {
      throw new Error('Test error');
    };
    const { getByText } = render(
      <ErrorBoundary navigation={mockNavigation}>
        <ThrowError />
      </ErrorBoundary>
    );

    const tryAgainButton = getByText(/reload page/i);
    tryAgainButton.click();

    // Verify reload was called
    expect(mockNavigation.reload).toHaveBeenCalled();
  });
});
