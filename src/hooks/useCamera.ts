import { useState, useEffect, useCallback } from 'react';

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
 * Result type for the useCamera hook
 */
interface UseCameraResult {
  state: CameraState;
  retry: () => void;
}

/**
 * Hook for managing camera state and lifecycle
 * Handles initialization, permissions, stream access, and cleanup
 * @returns Object containing camera state and control functions
 */
export function useCamera(): UseCameraResult {
  const [state, setState] = useState<CameraState>(initialCameraState);

  /**
   * Initializes the camera stream and updates state
   */
  const initializeCamera = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, initializationStatus: 'initializing' }));
      
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

      switch (err.name) {
        case 'NotAllowedError':
          cameraError = {
            code: 'PERMISSION_DENIED',
            message: 'Camera access was denied by the user'
          };
          break;
        case 'NotFoundError':
          cameraError = {
            code: 'DEVICE_NOT_FOUND',
            message: 'No camera device was found'
          };
          break;
        case 'NotSupportedError':
          cameraError = {
            code: 'NOT_SUPPORTED',
            message: 'Camera API is not supported in this browser'
          };
          break;
        default:
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
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    void initializeCamera();
  }, [initializeCamera]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.stream]);

  // Retry initialization method
  const retry = useCallback(() => {
    setState(initialCameraState);
    void initializeCamera();
  }, [initializeCamera]);

  return {
    state,
    retry
  };
}
