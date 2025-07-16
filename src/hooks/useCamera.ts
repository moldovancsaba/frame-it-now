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
  stream: MediaStream | undefined;
  error: CameraError | undefined;
  permissionState: 'prompt' | 'granted' | 'denied';
  initializationStatus: 'idle' | 'initializing' | 'ready' | 'error';
}

/**
 * Result type for the useCamera hook
 */
interface UseCameraResult {
  state: CameraState;
  retry: () => void;
}

// Resolution profiles for fallback
const resolutionProfiles = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 640, height: 480 }
];

/**
 * Initial state for the camera system
 */
const initialCameraState: CameraState = {
  stream: undefined,
  error: undefined,
  permissionState: 'prompt',
  initializationStatus: 'idle'
};

/**
 * Negotiates camera resolution by trying different profiles
 */
async function negotiateResolution(facingMode?: 'user' | 'environment'): Promise<MediaStream> {
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
}

/**
 * Detects available camera capabilities
 * @returns The supported video constraints
 */

export function useCamera(): UseCameraResult {
  const [state, setState] = useState<CameraState>(initialCameraState);

  const initializeCamera = useCallback(async (facingMode?: 'user' | 'environment'): Promise<void> => {
    try {
      setState(prev => ({ ...prev, initializationStatus: 'initializing', error: undefined }));
      
// Get stream at highest possible resolution
      const stream = await negotiateResolution(facingMode);
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      
      if (!settings.width || settings.width < 640 || !settings.height || settings.height < 480) {
        throw new Error('Resolution negotiation failed');
      }
      
      setState({
        stream,
        error: undefined,
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
        stream: undefined,
        error: cameraError,
        permissionState: err.name === 'NotAllowedError' ? 'denied' : 'prompt',
        initializationStatus: 'error'
      });
      
      throw error;
    }
  }, [setState]);

  useEffect(() => {
    void initializeCamera('environment');
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeCamera, state.stream]);

  const retry = useCallback(() => {
    setState(initialCameraState);
    void initializeCamera('environment');
  }, [initializeCamera, setState]);

  return {
    state,
    retry
  };
}
