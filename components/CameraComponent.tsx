import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import PhotoFrame from './PhotoFrame';
import useCamera from '../hooks/useCamera';
import { defaultNavigation, Navigation } from '../utils/navigation';
import { capturePhoto, loadImage } from '../utils/photoCapture';
import { getAvailableScreenSpace } from '../utils/previewSize';
import OverlayGuide from './OverlayGuide';
import ErrorBoundary from './ErrorBoundary';

interface CameraComponentProps {
  defaultOverlay?: string;
  onPhotoCapture?: (photoUrl: string) => void;
  onError?: (error: Error) => void;
  navigation?: Navigation;
}

const DEFAULT_OVERLAY = 'https://i.ibb.co/MDzTJdB8/SEYU-FRAME-1080x1080.png';
const DEFAULT_FRAME_SIZE = { width: 1080, height: 1080 };

export default function CameraComponent({
  defaultOverlay = DEFAULT_OVERLAY,
  onPhotoCapture,
  onError,
  navigation = defaultNavigation,
}: CameraComponentProps): JSX.Element {
  const [frameDimensions, setFrameDimensions] = useState(DEFAULT_FRAME_SIZE);
  const { videoRef, initializationStatus: cameraStatus, startCamera } = useCamera({ 
    facingMode: 'user',
    frameDimensions
  });
  const frameRef = useRef<HTMLImageElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState(DEFAULT_FRAME_SIZE);

  const overlayUrl = (typeof window !== 'undefined' && typeof localStorage !== 'undefined')
    ? localStorage.getItem('overlayUrl') || defaultOverlay
    : defaultOverlay;

  useEffect(() => {
    const updatePreviewSize = (): void => {
      const screen = getAvailableScreenSpace();
      setPreviewSize(screen);
      setFrameDimensions(screen);
    };

    updatePreviewSize();
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
      const photoData = await capturePhoto({
        video: videoRef.current,
        width: frameDimensions.width,
        height: frameDimensions.height,
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
      setUploadedUrl(result.url?.length > 0 ? result.url : null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      console.error('Upload error:', error);
      onError?.(error);
    }
  };

  if (cameraStatus.state === 'error') {
    return (
      <div className="error-container">
        <p>Camera Error: {cameraStatus.message}</p>
        <button 
          onClick={() => navigation.reload()}
          className="btn"
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
            onClick={() => navigation.reload()}
            className="btn"
          >
            Retry
          </button>
        </div>
      )}
    >
      <div className="camera-container">
        {!photo ? (
          <div className="preview-container">
            {cameraStatus.state === 'initializing' && (
              <div className="loading-container">
                <span className="loading-spinner" />
                <p className="loading-text">Preparing camera...</p>
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
                  className={`video-preview ${cameraStatus.state !== 'ready' ? 'video-preview-hidden' : ''}`}
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
          <div className="photo-container">
            <Image
              src={photo}
              alt="captured photo"
              width={frameDimensions.width}
              height={frameDimensions.height}
              className="photo-output"
              unoptimized
              priority
            />
          </div>
        )}

        <div className="button-container">
          {!photo && (
            <button 
              onClick={() => void handleCapture()} 
              disabled={cameraStatus.state !== 'ready' || loading}
              className={`btn ${cameraStatus.state !== 'ready' || loading ? 'btn-disabled' : ''}`}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Processing...
                </>
              ) : (
                'Take Photo'
              )}
            </button>
          )}
          {photo && uploadedUrl && (
            <>
              <button onClick={() => void handleDownload()} className="btn">Download</button>
              <button onClick={() => void handleShare()} className="btn">Share</button>
              <button onClick={() => void handleReset()} className="btn">New Photo</button>
              <a 
                href={uploadedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn"
              >
                View Online
              </a>
            </>
          )}
        </div>

        {loading && (
          <div className="loading-container">
            <span className="loading-spinner" />
            <p className="loading-text">Processing...</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
