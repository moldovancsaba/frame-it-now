import { useEffect, useRef, useState } from 'react';

/**
 * Configuration options for the useCamera hook
 * @interface UseCameraOptions
 */
interface UseCameraOptions {
  /** Camera facing mode - 'user' for front camera, 'environment' for back camera */
  facingMode?: 'user' | 'environment';
  /** Optional frame dimensions for video constraints */
  frameDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Return type for the useCamera hook
 * @interface UseCameraReturn
 */
interface UseCameraReturn {
  /** Reference to the video element for camera stream display */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Current initialization status of the camera */
  initializationStatus: {
    state: 'initializing' | 'ready' | 'error';
    message?: string;
  };
  /** Initializes and starts the camera stream */
  startCamera: () => Promise<void>;
  /** Stops the camera stream and releases resources */
  stopCamera: () => void;
  /** Retries camera initialization after failure */
  retryCamera: () => Promise<void>;
}

/**
 * Custom hook for managing camera functionality
 * Handles camera initialization, stream management, and cleanup
 * 
 * @param {UseCameraOptions} options - Camera configuration options
 * @returns {UseCameraReturn} Camera controls and state
 */
export const useCamera = ({ facingMode = 'user', frameDimensions }: UseCameraOptions = {}): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [initializationStatus, setInitializationStatus] = useState<{
    state: 'initializing' | 'ready' | 'error';
    message?: string;
  }>({ state: 'initializing' });

  // Helper function to get video constraints that maximize resolution
  const getVideoConstraints = () => ({
    video: {
      facingMode,
      width: { ideal: 4096, min: 1920 },  // Request 4K, minimum Full HD
      height: { ideal: 4096, min: 1920 }, // Request 4K, minimum Full HD
      frameRate: { ideal: 30 },           // Optimal frame rate for quality
      aspectRatio: { ideal: 1 },          // Square aspect ratio for frame
      ...frameDimensions && {
        width: { 
          min: 1920,                      // Ensure minimum Full HD
          ideal: Math.max(4096, frameDimensions.width) // Use larger of 4K or frame size
        },
        height: { 
          min: 1920,                      // Ensure minimum Full HD
          ideal: Math.max(4096, frameDimensions.height) // Use larger of 4K or frame size
        }
      }
    }
  });

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setInitializationStatus({ state: 'initializing' });
  };

  const startCamera = async () => {
    try {
      setInitializationStatus({ state: 'initializing' });
      
      // Clean up any existing stream
      stopCamera();
      
      // Check for getUserMedia support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Request camera access with constraints
      const stream = await navigator.mediaDevices.getUserMedia(getVideoConstraints()).catch(err => {
        // Handle specific permission errors
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('Camera access denied. Please grant permission to use your camera.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('No camera device found. Please check your hardware.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          throw new Error('Camera is in use by another application.');
        }
        throw err;
      });

      // Get the actual track settings
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      console.log('Camera resolution:', settings.width, 'x', settings.height);

      // Stop any existing stream before setting new one
      stopCamera();

      // Store stream reference and update video source
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready before setting ready state
        videoRef.current.onloadedmetadata = () => {
          setInitializationStatus({ state: 'ready' });
        };
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start camera');
      const errorMessage = error.message || 'Camera initialization failed';
      setInitializationStatus({ state: 'error', message: errorMessage });
      console.error('Camera initialization error:', error);
    }
  };

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    
    // Define cleanup function for stream
    const cleanupStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };

    // Cleanup on unmount
    return () => {
      cleanupStream();
      setInitializationStatus({ state: 'initializing' });
    };
  }, [facingMode, frameDimensions]);

  const retryCamera = async () => {
    await stopCamera();
    await startCamera();
  };

  return {
    videoRef,
    initializationStatus,
    startCamera,
    stopCamera,
    retryCamera,
  };
};

export default useCamera;
