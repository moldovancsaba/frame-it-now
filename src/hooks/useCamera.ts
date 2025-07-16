// Resolution profiles for fallback
const resolutionProfiles = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 640, height: 480 }
];

// Negotiate resolution function
const negotiateResolution = async (facingMode?: 'user' | 'environment') => {
  for (const profile of resolutionProfiles) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: profile.width },
          height: { ideal: profile.height }
        }
      });
      return stream;
    } catch (err) {
      console.warn(`Failed to get ${profile.width}x${profile.height}, trying lower resolution`);
      continue;
    }
  }
  throw new Error('Could not initialize camera at any supported resolution');
};

import { useState, useEffect, useCallback } from 'react';

/**
 * Represents possible errors that can occur during camera operations
 */
export interface CameraError {
  code: 'PERMISSION_DENIED' | 'DEVICE_NOT_FOUND' | 'NOT_SUPPORTED' | 'INITIALIZATION_ERROR' | 'RESOLUTION_ERROR';
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
 * Gets video constraints with resolution fallback support
 */
const getVideoConstraints = (facingMode?: 'user' | 'environment') => ({
  video: {
    facingMode,
    width: { 
      ideal: 1920,
      min: 640
    },
    height: { 
      ideal: 1080,
      min: 480
    }
  }
});

/**
 * Detects available camera capabilities
 * @returns The supported video constraints
 */
async function detectCameraCapabilities(): Promise<MediaTrackConstraints | null> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    if (videoDevices.length === 0) {
      return null;
    }

    // Start with highest resolution and try to get stream
    const constraints = getVideoConstraints();
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Get actual capabilities from the stream
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    
    // Clean up test stream
    stream.getTracks().forEach(track => track.stop());
    
    return capabilities;
  } catch (error) {
    console.warn('Failed to detect camera capabilities:', error);
    return null;
  }
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
      
      // Try to get camera capabilities first
      const capabilities = await detectCameraCapabilities();
      
      // If we couldn't detect capabilities, fall back to basic constraints
      const constraints = capabilities ? getVideoConstraints() : { video: true };
      
      try {
        const stream = await negotiateResolution(facingMode);
        // Verify we got acceptable resolution
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        
        if (settings.width && settings.width < 640 || settings.height && settings.height < 480) {
          throw new Error('Resolution negotiation failed');
        }
      
      setState({
        stream,
        permissionState: 'granted',
        initializationStatus: 'ready'
      });
    } catch (error: unknown) {
      let cameraError: CameraError;
      const err = error as { name?: string };

      switch (err.name) {
        case 'Error':
          if (error instanceof Error && error.message === 'Resolution negotiation failed') {
            cameraError = {
              code: 'RESOLUTION_ERROR',
            message: 'Failed to negotiate acceptable video resolution. Please ensure your device camera supports at least 640x480 resolution.'
            };
            break;
          }
          // Fall through to default if not a resolution error
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
