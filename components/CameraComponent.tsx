import React, { useState } from 'react';
import Image from 'next/image';
import PhotoFrame from './PhotoFrame';
import useCamera from '../hooks/useCamera';
import { defaultNavigation, Navigation } from '../utils/navigation';
import { capturePhoto, loadImage } from '../utils/photoCapture';
import OverlayGuide from './OverlayGuide';

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
const PHOTO_SIZE = 1080; // Final photo size
const PREVIEW_SIZE = 320; // Preview component size

export default function CameraComponent({
  defaultOverlay = DEFAULT_OVERLAY,
  onPhotoCapture,
  onError,
  navigation = defaultNavigation,
}: CameraComponentProps): JSX.Element {
  const { videoRef: videoRefRaw, isReady, error, startCamera } = useCamera({ facingMode: 'user' });
  const videoRef = videoRefRaw as React.RefObject<HTMLVideoElement>;
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const overlayUrl = (typeof window !== 'undefined' && typeof localStorage !== 'undefined')
    ? localStorage.getItem('overlayUrl') || defaultOverlay
    : defaultOverlay;

  const handleCapture = async (): Promise<void> => {
    if (!videoRef.current || !isReady) return;

    try {
      setLoading(true);
      setPhoto(null);
      setUploadedUrl(null);

      const overlay = await loadImage(overlayUrl);
      const photoData = await capturePhoto({
        video: videoRef.current,
        width: PHOTO_SIZE,
        height: PHOTO_SIZE,
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

      const { url } = await response.json();
      if (typeof url === 'string' && url.length > 0) {
        setUploadedUrl(url);
      } else {
        setUploadedUrl(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      console.error('Upload error:', error);
      onError?.(error);
    }
  };

  if (error) {
    const nav = navigation || defaultNavigation;
    return (
      <div className="error-container">
        <p>Camera Error: {error.message}</p>
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
    <div className="camera-container" data-testid="camera-container">
      {!photo ? (
        <div className="preview-container">
          {/* Video preview - centered and scaled */}
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="video-preview"
          />
          {/* Face overlay guide - centered with frame and preview */}
          <OverlayGuide 
            width={PREVIEW_SIZE * 0.625} 
            height={PREVIEW_SIZE * 0.625} 
            className="overlay-guide"
          />
          {/* Photo frame - aligned with guide and preview */}
          <PhotoFrame
            src={overlayUrl}
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            className="photo-frame"
          />
        </div>
      ) : (
        <div className="photo-container" data-testid="photo-container">
          <Image
            src={photo}
            alt="captured photo"
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            className="photo-output"
            unoptimized
            priority
          />
        </div>
      )}

      <div className="button-container">
        {!photo && (
          <button 
            onClick={handleCapture} 
            disabled={!isReady || loading}
            className={`btn btn-primary ${!isReady || loading ? 'btn-disabled' : ''}`}
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
            <button onClick={handleDownload} className="btn btn-primary">Download</button>
            <button onClick={handleShare} className="btn btn-secondary">Share</button>
            <button onClick={handleReset} className="btn btn-outline">New Photo</button>
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
  );
}

