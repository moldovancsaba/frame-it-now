import React from 'react';
import { defaultNavigation, Navigation } from '../utils/navigation';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Navigation service */
  navigation?: Navigation;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback && typeof this.props.fallback !== 'boolean') {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-container">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <details className="whitespace-pre-wrap mt-3">
            {this.state.error?.toString()}
          </details>
          <button
onClick={() => (this.props.navigation ?? defaultNavigation).reload()}
            className="btn btn-primary mt-4"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
