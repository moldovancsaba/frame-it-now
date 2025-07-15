import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import PhotoFrame from './PhotoFrame';
import useCamera from '../hooks/useCamera';
import { defaultNavigation, Navigation } from '../utils/navigation';
import { capturePhoto, loadImage } from '../utils/photoCapture';
import { getAvailableScreenSpace } from '../utils/previewSize';
import OverlayGuide from './OverlayGuide';
import ErrorBoundary from './ErrorBoundary';

/**
 * Props interface for the CameraComponent
 * @interface CameraComponentProps
 */
interface CameraComponentProps {
  /** Default overlay image URL to use for photo frames */
  defaultOverlay?: string;
  /** Callback function triggered after successful photo capture */
  onPhotoCapture?: (photoUrl: string) => void;
  /** Callback function for handling errors during camera operations */
  onError?: (error: Error) => void;
  /** Navigation service */
  navigation?: Navigation;
}

const DEFAULT_OVERLAY = 'https://i.ibb.co/MDzTJdB8/SEYU-FRAME-1080x1080.png';

// Replace fixed size with dynamic frame dimensions
/**
 * Calculates natural dimensions of a given HTML image element
 * @param frame - The HTML image element to get dimensions from
 * @returns Object containing width and height in pixels
 */
const getFrameDimensions = (frame: HTMLImageElement): { width: number; height: number } => {
  return {
    width: frame.naturalWidth,
    height: frame.naturalHeight
  };
};

export default function CameraComponent({
  defaultOverlay = DEFAULT_OVERLAY,
  onPhotoCapture,
  onError,
  navigation = defaultNavigation,
}: CameraComponentProps): JSX.Element {
  const [frameDimensions, setFrameDimensions] = useState({ width: 1080, height: 1080 }); // Default 1:1 aspect ratio
  const { videoRef, initializationStatus: cameraStatus, startCamera } = useCamera({ 
    facingMode: 'user',
    frameDimensions
  });
  const frameRef = useRef<HTMLImageElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
const overlayUrl = (typeof window !== 'undefined' && typeof localStorage !== 'undefined')
    ? localStorage.getItem('overlayUrl') || defaultOverlay
    : defaultOverlay;

  // Update preview size when frame dimensions change or on window resize
  useEffect(() => {
    const updatePreviewSize = (): void => {
      const screen = getAvailableScreenSpace();
      setPreviewSize(screen);
      setFrameDimensions(screen);
    };

    // Initial update
    updatePreviewSize();

    // Update on window resize
    window.addEventListener('resize', updatePreviewSize);
    return () => window.removeEventListener('resize', updatePreviewSize);
  }, []);


  const handleCapture = async (): Promise<void> => {
    if (!videoRef.current || cameraStatus.state !== 'ready') return;

    try {
      setLoading(true);
      setPhoto(null);
      setUploadedUrl(null);

      const overlay = await loadImage(overlayUrl);
      const frameDims = getFrameDimensions(overlay);
      const photoData = await capturePhoto({
        video: videoRef.current,
        width: frameDims.width,
        height: frameDims.height,
        overlayImage: overlay
      });

    setPhoto(photoData || null);
      onPhotoCapture?.(photoData);
      await uploadPhoto(photoData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to capture photo');
      console.error('Photo capture error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (): Promise<void> => {
    if (!photo || typeof photo !== 'string') return;

    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({
          title: 'Captured Photo',
          url: uploadedUrl || photo
        });
      } else {
        throw new Error('Sharing not supported');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Share failed');
      console.error('Share error:', error);
      onError?.(error);
    }
  };

  const handleDownload = (): void => {
    if (!photo || typeof photo !== 'string') return;

    const link = document.createElement('a');
    link.href = photo;
    link.download = `photo-${new Date().toISOString()}.png`;
    link.click();
  };

  const handleReset = async (): Promise<void> => {
    setPhoto(null);
    setUploadedUrl(null);
    
    // Restart the camera stream
    try {
      await startCamera();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to restart camera');
      console.error('Camera restart error:', error);
      onError?.(error);
    }
  };

  const uploadPhoto = async (dataUrl: string): Promise<void> => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          overlayUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

  interface UploadResponse { url: string }
      const result = await response.json() as UploadResponse;
      if (result.url && result.url.length > 0) {
        setUploadedUrl(result.url);
      } else {
        setUploadedUrl(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      console.error('Upload error:', error);
      onError?.(error);
    }
  };

  if (cameraStatus.state === 'error') {
    const nav = navigation || defaultNavigation;
    return (
      <div className="error-container">
        <p>Camera Error: {cameraStatus.message}</p>
        <button 
          onClick={() => nav.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div className="error-container">
          <p>Camera Error: {error.message}</p>
          <button 
            onClick={() => (navigation ?? defaultNavigation).reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      )}
    >
    <div className="camera-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '5%',
        padding: '5%'
      }} data-testid="camera-container">
        {!photo ? (
          <div className="preview-container" style={{ 
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            aspectRatio: '1',
            margin: '0 auto'
          }}>
          {cameraStatus.state === 'initializing' && (
            <div className="loading-container">
              <span className="loading-spinner" />
              <p>Preparing camera...</p>
            </div>
          )}
          {previewSize.width > 0 && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onCanPlay={() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                      .catch(err => {
                        console.error('Video playback failed:', err);
                        onError?.(new Error('Failed to start video playback'));
                      });
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: cameraStatus.state === 'ready' ? 'block' : 'none',
                  borderRadius: '8px'
                }}
              />
              <OverlayGuide 
                width={previewSize.width}
                height={previewSize.height}
                className="overlay-guide"
              />
              <PhotoFrame
                src={overlayUrl}
                width={previewSize.width}
                height={previewSize.height}
                className="photo-frame"
                ref={frameRef}
              />
            </>
          )}
        </div>
        ) : (
          <div className="photo-container" data-testid="photo-container">
            <Image
              src={photo}
              alt="captured photo"
              width={320}
              height={320}
              className="photo-output"
              unoptimized
              priority
            />
          </div>
        )}

      <div className="button-container" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '5%',
        width: '100%',
        maxWidth: '640px'
      }}>
        {!photo && (
          <button 
            onClick={() => void handleCapture()} 
            disabled={cameraStatus.state !== 'ready' || loading}
            className={`btn btn-primary ${cameraStatus.state !== 'ready' || loading ? 'btn-disabled' : ''}`}
          >
            {loading ? (
              <React.Fragment>
                <span className="loading-spinner mr-2" />
                Processing...
              </React.Fragment>
            ) : (
              'Take Photo'
            )}
          </button>
        )}
        {photo && (
          <>
            <button onClick={() => void handleDownload()} className="btn btn-primary">Download</button>
            <button onClick={() => void handleShare()} className="btn btn-secondary">Share</button>
            <button onClick={() => void handleReset()} className="btn btn-outline">New Photo</button>
          </>
        )}
      </div>

      {loading && (
        <div className="status-text flex items-center">
          <span className="loading-spinner mr-2" />
          Processing...
        </div>
      )}
      {uploadedUrl && (
        <a 
          href={uploadedUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="link-text"
        >
          View Online
        </a>
      )}
    </div>
    </ErrorBoundary>
  );
}

