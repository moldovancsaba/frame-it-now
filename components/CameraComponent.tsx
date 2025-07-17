import { useState, useRef, useEffect, useCallback, ReactElement } from "react";
import useSWR from 'swr';
import { Frame, Guide, Background } from '../types/admin';
import Image from "next/image";
import PhotoFrame from "./PhotoFrame";
import useCamera from "../hooks/useCamera";
import { defaultNavigation, Navigation } from "../utils/navigation";
import { capturePhoto, loadImage } from "../utils/photoCapture";
import OverlayGuide from "./OverlayGuide";
import ErrorBoundary from "./ErrorBoundary";

interface CameraComponentProps {
  defaultOverlay?: string; // Deprecated - use admin interface instead
  onPhotoCapture?: (photoUrl: string) => void;
  onError?: (error: Error) => void;
  navigation?: Navigation;
}


// SWR fetcher type
type Fetcher<T> = (url: string) => Promise<T | null>;

// Fetch selected assets from the admin interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const fetcher: Fetcher<Frame | Guide | Background> = async (url) => {
  const response = await fetch(url);
  const result = await response.json() as ApiResponse<Frame | Guide | Background>;
  return result.success && result.data ? result.data : null;
};

const useSelectedAssets = (): { frame: Frame | null, guide: Guide | null, background: Background | null } => {
  const { data: frame } = useSWR<Frame | null>('/api/admin/assets/frame/selected', fetcher as Fetcher<Frame>);
  const { data: guide } = useSWR<Guide | null>('/api/admin/assets/guide/selected', fetcher as Fetcher<Guide>);
  const { data: background } = useSWR<Background | null>('/api/admin/assets/background/selected', fetcher as Fetcher<Background>);

  return { frame: frame || null, guide: guide || null, background: background || null };
};

export default function CameraComponent (props: CameraComponentProps): ReactElement | null {
  const {
    defaultOverlay = '',
    onPhotoCapture = (): void => {},
    onError = (): void => {},
    navigation = defaultNavigation
  } = props;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { videoRef, initializationStatus: cameraStatus, startCamera } = useCamera({ 
    facingMode: "user",
    dimensions
  });
  const frameRef = useRef<HTMLImageElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Get selected assets from admin interface
  const { frame, guide, background } = useSelectedAssets();
  
  // Apply selected background if available
useEffect(() => {
    if (background?.isSelected && background?.style) {
      document.body.style.background = background.style;
    }
    return () => {
      document.body.style.background = '';
    };
  }, [background]);

  // Update dimensions based on frame
  useEffect(() => {
    const calculateDimensions = (): void => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;
      let width = maxWidth;
      let height = maxHeight;

      // If we have a frame, use its aspect ratio
      if (frame?.isSelected && frame?.isActive && frameRef.current) {
        const frameAspect = frameRef.current.naturalWidth / frameRef.current.naturalHeight;
        
        // Calculate dimensions to fit within viewport while maintaining aspect ratio
        if (maxWidth / frameAspect <= maxHeight) {
          width = maxWidth;
          height = maxWidth / frameAspect;
        } else {
          height = maxHeight;
          width = maxHeight * frameAspect;
        }
      } else {
        // Default to square if no frame
        const size = Math.min(maxWidth, maxHeight);
        width = size;
        height = size;
      }

      setDimensions({ width, height });
    };

    if (typeof window !== 'undefined') {
      // Wait a bit for the frame to load
      setTimeout(calculateDimensions, 100);
      window.addEventListener('resize', calculateDimensions);
      return () => window.removeEventListener('resize', calculateDimensions);
    }
  }, [frame?.isSelected, frame?.isActive, frame?.url]);

  const uploadPhoto = useCallback(async (dataUrl: string): Promise<void> => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: dataUrl,
            overlayUrl: frame?.isSelected && frame?.isActive ? frame.url : defaultOverlay
          }),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      interface UploadResponse { url: string }
      const result = await response.json() as UploadResponse;
      setUploadedUrl(result.url?.length > 0 ? result.url : null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Upload failed");
      console.error("Upload error:", error);
      onError?.(error);
    }
  }, [frame, defaultOverlay, onError]);

  const handleCapture = useCallback(async (): Promise<void> => {
    if (!videoRef.current || cameraStatus.state !== "ready") return;

    try {
      setLoading(true);
      setPhoto(null);
      setUploadedUrl(null);

      // Use selected frame if both selected and active
      const overlayUrl = frame?.isSelected && frame?.isActive ? frame.url : defaultOverlay;
      const overlay = overlayUrl ? await loadImage(overlayUrl) : null;
      const photoData = await capturePhoto({
        video: videoRef.current,
        width: dimensions.width,
        height: dimensions.height,
        overlayImage: overlay || undefined
      });

      setPhoto(photoData || null);
      onPhotoCapture?.(photoData);
      await uploadPhoto(photoData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to capture photo");
      console.error("Photo capture error:", error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [videoRef, cameraStatus.state, dimensions.width, dimensions.height, frame, defaultOverlay, onPhotoCapture, onError, uploadPhoto]);

  const handleShare = async (): Promise<void> => {
    if (!photo || typeof photo !== "string") return;

    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: "Captured Photo",
          url: uploadedUrl || photo
        });
      } else {
        throw new Error("Sharing not supported");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Share failed");
      console.error("Share error:", error);
      onError?.(error);
    }
  };

  const handleDownload = (): void => {
    if (!photo || typeof photo !== "string") return;

    const link = document.createElement("a");
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
      const error = err instanceof Error ? err : new Error("Failed to restart camera");
      console.error("Camera restart error:", error);
      onError?.(error);
    }
  };


  if (cameraStatus.state === "error") {
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
          <div className="preview-container" style={{ width: dimensions.width, height: dimensions.height }}>
            {cameraStatus.state === "initializing" && (
              <div className="loading-container">
                <span className="loading-spinner" />
                <p className="loading-text">Preparing camera...</p>
              </div>
            )}
            {dimensions.width > 0 && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: dimensions.width, height: dimensions.height }}
                  className={`video-preview ${cameraStatus.state !== "ready" ? "video-preview-hidden" : ""}`}
                />
{guide?.isSelected && guide?.isActive && (
                  <OverlayGuide 
                    src={guide.url}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="overlay-guide"
                  />
                )}
{frame?.isSelected && frame?.isActive && (
                  <PhotoFrame
                    src={frame.url}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="photo-frame"
                    ref={frameRef}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <div className="photo-container" style={{ width: dimensions.width, height: dimensions.height }}>
            <Image
              src={photo}
              alt="captured photo"
              width={dimensions.width}
              height={dimensions.height}
              className="photo-output"
              unoptimized
              priority
            />
          </div>
        )}

        <div className="button-container">
          {!photo && (
            <button 
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!loading && cameraStatus.state === "ready") {
                  void handleCapture();
                }
              }}
              disabled={cameraStatus.state !== "ready" || loading}
              className={`btn ${cameraStatus.state !== "ready" || loading ? "btn-disabled" : ""}`}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Processing...
                </>
              ) : (
                "Take Photo"
              )}
            </button>
          )}
          {photo && uploadedUrl && (
            <>
              <button onClick={(e) => { e.preventDefault(); void handleDownload(); }} className="btn">Download</button>
              <button onClick={(e) => { e.preventDefault(); void handleShare(); }} className="btn">Share</button>
              <button onClick={(e) => { e.preventDefault(); void handleReset(); }} className="btn">New Photo</button>
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
