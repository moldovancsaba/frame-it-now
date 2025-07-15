import { ErrorInfo } from 'react';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { errorLoggingService } from '../../utils/errorHandling';
import { recoverFromError } from '../../utils/errorHandling';

// Define camera-specific error types
export enum CameraErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  STREAM_ERROR = 'STREAM_ERROR'
}

export interface CameraError extends Error {
  type: CameraErrorType;
  originalError?: Error;
}

/**
 * CameraErrorBoundary - Specialized error boundary for handling camera-related errors
 * Extends the base ErrorBoundary to provide camera-specific error handling capabilities
 */
export class CameraErrorBoundary extends ErrorBoundary {
  /**
   * Handles camera-specific errors with specialized recovery logic for each error type
   * @param error The camera error to handle
   */
  async handleCameraError(error: CameraError): Promise<void> {
    // Log the error using our error logging service
    // Log the error using our error logging service
    void errorLoggingService.logError({
      timestamp: new Date().toISOString(),
      type: error.type.toString(),
      message: error.message,
      context: {
        component: this.constructor.name,
        originalError: error.originalError
      }
    });

    // Update error state for rendering fallback UI
    this.setState({
      hasError: true,
      error: error
    });

    // Attempt recovery based on error type
    const recovered = await recoverFromError(error);
    if (recovered) {
      this.setState({ hasError: false, error: null });
    }
  }

  /**
   * Override of componentDidCatch to handle camera-specific errors
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if ('type' in error && Object.values(CameraErrorType).includes(error.type as CameraErrorType)) {
      void this.handleCameraError(error as CameraError);
    } else {
      // Fall back to base error handling for non-camera errors
      super.componentDidCatch(error, errorInfo);
    }
  }
}
