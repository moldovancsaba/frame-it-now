'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MessageOverlay } from './components/MessageOverlay';
import { useLayersStore } from './store/layers';
import type { Layer, ITextLayer, IImageLayer } from './types/layers';

function compareLayerOrder(a: Layer, b: Layer): number {
  return a.order - b.order;
}

function CameraLayer(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    // Log camera initialization
    setIsLoading(true);
    
    const initializeCamera = async (): Promise<void> => {
      try {
        // Check if we're in a secure context
        if (!window.isSecureContext) {
          throw new Error('Camera access requires HTTPS');
        }

        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not available');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user'
          }
        });
        // Camera access successfully granted
        if (videoRef.current && mediaStream) {
          // Video element initialized and ready
          stream = mediaStream;
          videoRef.current.srcObject = mediaStream;
          const handleMetadataLoaded = async (): Promise<void> => {
            try {
              await videoRef.current?.play();
              // Camera feed initialized and streaming
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_error) {
              setError('Failed to start video playback');
            }
          };
          videoRef.current.onloadedmetadata = handleMetadataLoaded;
        }
        setIsLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Camera access failed
        console.error('Camera initialization error:', error);
        setError(
          `Failed to access camera: ${error instanceof Error ? error.message : 'Please check permissions and try again.'}`
        );
        setIsLoading(false);
      }
    }

    initializeCamera();

    return (): void => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track): void => {
          track.stop();
        });
      }
    };
  }, []);

  if (error) {
    return <MessageOverlay type="error" message={error} />;
  }

  if (isLoading) {
    return <MessageOverlay type="loading" message="Initializing camera..." />;
  }

  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline 
      muted
      style={{ 
        position: 'absolute',
        width: '100%',
        height: '100vh',
        objectFit: 'cover',
        zIndex: 0,
        transform: 'scaleX(-1)' // Mirror the video horizontally
      }} 
    />
  );
}

function TextLayer({ content, fontSize, color, position }: ITextLayer): JSX.Element {
  return (
    <div style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      fontSize: `${fontSize}px`,
      color,
      userSelect: 'none',
      zIndex: 1
    }}>
      {content}
    </div>
  );
}

function ImageLayer({ url, position, size }: IImageLayer): JSX.Element | null {
  if (!url || !url.trim()) {
    return null;
  }

  return (
    <Image
      alt="Layer content"
      src={url}
      width={size.width}
      height={size.height}
      style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      objectFit: 'contain',
      zIndex: 1
      }}
      unoptimized
    />
  );
}

function LayerComponent({ layer }: { layer: Layer }): JSX.Element | null {
  if (!layer.visible) { return null; }


  switch (layer.type) {
    case 'camera':
      return <CameraLayer />;
    case 'text':
      return <TextLayer {...layer} />;
    case 'image':
      return <ImageLayer {...layer} />;
    default:
      return null;
  }
}

export default function Page(): JSX.Element {
  const { layers, fetchLayers, isLoading, error } = useLayersStore();

  useEffect(() => {
    fetchLayers();
  }, [fetchLayers]);

  if (isLoading) {
    return <MessageOverlay type="loading" message="Loading layers..." />;
  }

  if (error) {
    return <MessageOverlay type="error" message={error} />;
  }

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      {layers
        .filter(layer => layer.visible)
        .sort(compareLayerOrder)
        .map(layer => (
          <LayerComponent key={layer.id} layer={layer} />
        ))}
    </div>
  );
}
