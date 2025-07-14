import { useEffect, useRef, useState } from 'react';

/**
 * Configuration options for the useCamera hook
 * @interface UseCameraOptions
 */
interface UseCameraOptions {
  /** Camera facing mode - 'user' for front camera, 'environment' for back camera */
  facingMode?: 'user' | 'environment';
}

/**
 * Return type for the useCamera hook
 * @interface UseCameraReturn
 */
interface UseCameraReturn {
  /** Reference to the video element for camera stream display */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Indicates if the camera is initialized and ready */
  isReady: boolean;
  /** Contains any error that occurred during camera operations */
  error: Error | null;
  /** Initializes and starts the camera stream */
  startCamera: () => Promise<void>;
  /** Stops the camera stream and releases resources */
  stopCamera: () => void;
}

/**
 * Custom hook for managing camera functionality
 * Handles camera initialization, stream management, and cleanup
 * 
 * @param {UseCameraOptions} options - Camera configuration options
 * @returns {UseCameraReturn} Camera controls and state
 */
export const useCamera = ({ facingMode = 'user' }: UseCameraOptions = {}): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsReady(false);
      
      // Clean up any existing stream
      stopCamera();
      
      // Check for getUserMedia support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      }).catch((err: Error) => {
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

      // Stop any existing stream before setting new one
      stopCamera();

      // Store stream reference and update video source
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready before setting isReady
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start camera');
      setError(error);
      console.error('Camera initialization error:', error);
    }
  };

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  return {
    videoRef,
    isReady,
    error,
    startCamera,
    stopCamera,
  };
};

export default useCamera;
