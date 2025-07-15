import { useState, useEffect } from 'react';

/**
 * Represents possible errors that can occur during camera operations
 */
export interface CameraError {
  code: 'PERMISSION_DENIED' | 'DEVICE_NOT_FOUND' | 'NOT_SUPPORTED' | 'INITIALIZATION_ERROR';
  message: string;
}

/**
 * Represents the current state of the camera system
 */
export interface CameraState {
  stream?: MediaStream;
  error?: CameraError;
  permissionState: 'prompt' | 'granted' | 'denied';
  initializationStatus: 'idle' | 'initializing' | 'ready' | 'error';
}

/**
 * Initial state for the camera system
 */
const initialCameraState: CameraState = {
  permissionState: 'prompt',
  initializationStatus: 'idle'
};

/**
 * Hook for managing camera state and lifecycle
 * - Handles camera initialization
 * - Manages permissions
 * - Provides stream access
 * - Implements proper cleanup
 */
export const useCamera = (): {
  state: CameraState;
  retry: () => void;
} => {
  const [state, setState] = useState<CameraState>(initialCameraState);

  // Initialize camera on mount
  useEffect(() => {
    const initializeCamera = async (): Promise<void> => {
      try {
        setState(prev => ({ ...prev, initializationStatus: 'initializing' }));
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        
        setState({
          stream,
          permissionState: 'granted',
          initializationStatus: 'ready'
        });
      } catch (error: unknown) {
        let cameraError: CameraError;
        const err = error as { name?: string };

        // Map browser errors to our error types
        if (err.name === 'NotAllowedError') {
          cameraError = {
            code: 'PERMISSION_DENIED',
            message: 'Camera access was denied by the user'
          };
        } else if (err.name === 'NotFoundError') {
          cameraError = {
            code: 'DEVICE_NOT_FOUND',
            message: 'No camera device was found'
          };
        } else if (err.name === 'NotSupportedError') {
          cameraError = {
            code: 'NOT_SUPPORTED',
            message: 'Camera API is not supported in this browser'
          };
        } else {
          cameraError = {
            code: 'INITIALIZATION_ERROR',
            message: 'Failed to initialize camera'
          };
        }

        setState({
          error: cameraError,
          permissionState: err.name === 'NotAllowedError' ? 'denied' : 'prompt',
          initializationStatus: 'error'
        });
      }
    };

    initializeCamera();
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return (): void => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.stream]);

  return {
    state,
    // Expose a retry method for error recovery
    retry: (): void => {
      setState(initialCameraState);
    }
  };
};
