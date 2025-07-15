import React from 'react';
import { defaultNavigation, Navigation } from '../utils/navigation';

export interface CameraError extends Error {
  type: 'permission' | 'device' | 'initialization' | 'unknown';
  retry?: () => Promise<void>;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((props: { error: Error }) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Navigation service */
  navigation?: Navigation;
  /** Optional handler for camera-specific errors */
  onCameraError?: (error: CameraError) => void;
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
  private isCameraError(error: Error): error is CameraError {
    return 'type' in error && (
      (error as CameraError).type === 'permission' ||
      (error as CameraError).type === 'device' ||
      (error as CameraError).type === 'initialization' ||
      (error as CameraError).type === 'unknown'
    );
  }
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
    
    // Handle camera-specific errors
    if (this.isCameraError(error)) {
      this.props.onCameraError?.(error);
    }
    
    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({ error: this.state.error! });
        }
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
