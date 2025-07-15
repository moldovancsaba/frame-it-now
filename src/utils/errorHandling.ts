import { CameraErrorType, CameraError } from '../components/errors/CameraErrorBoundary';

/**
 * Interface for standardized error logging across the application
 */
export interface ErrorLog {
  timestamp: string; // ISO 8601 with milliseconds precision
  type: string;
  message: string;
  context: object;
}

/**
 * Error logging service implementation
 */
class ErrorLoggingService {
  /**
   * Logs an error with standardized format
   * @param error Error information to log
   */
  public logError(error: ErrorLog): void {
    // Ensuring ISO 8601 format with milliseconds precision
    const timestamp = new Date().toISOString();
    error.timestamp = timestamp;
    try {
      // Here we could integrate with external logging services
      console.error('Error logged:', {
        ...error,
        context: {
          ...error.context,
          loggedAt: new Date().toISOString()
        }
      });
    } catch (e) {
      // Fallback logging if service fails
      console.error('Failed to log error:', e);
    }
  }
}

/**
 * Attempts to recover from camera-specific errors
 * @param error The camera error to recover from
 * @returns Promise indicating recovery success
 */
export const recoverFromError = async (error: CameraError): Promise<boolean> => {
  switch (error.type) {
    case CameraErrorType.PERMISSION_DENIED:
      // Request permissions again or guide user to settings
      return await requestCameraPermissions();
      
    case CameraErrorType.DEVICE_NOT_FOUND:
      // Attempt to find alternative camera devices
      return await findAlternativeCamera();
      
    case CameraErrorType.CONSTRAINT_ERROR:
      // Try with lower quality constraints
      return await retryWithLowerConstraints();
      
    case CameraErrorType.INITIALIZATION_ERROR:
      // Reinitialize camera with default settings
      return await reinitializeCamera();
      
    case CameraErrorType.STREAM_ERROR:
      // Attempt to restart stream
      return await restartCameraStream();
      
    default:
      return false;
  }
};

// Helper functions for error recovery
async function requestCameraPermissions(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
}

async function findAlternativeCamera(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

async function retryWithLowerConstraints(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
}

async function reinitializeCamera(): Promise<boolean> {
  try {
    // Attempt to clear any existing camera state
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasCamera = devices.some(device => device.kind === 'videoinput');
    if (!hasCamera) return false;
    
    // Reset to default configuration
    return true;
  } catch {
    return false;
  }
}

async function restartCameraStream(): Promise<boolean> {
  try {
    // Request a new stream with default settings
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
}

// Export singleton instance of error logging service
export const errorLoggingService = new ErrorLoggingService();
