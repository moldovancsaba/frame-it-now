'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MessageOverlay } from './components/MessageOverlay';
import { useLayersStore } from './store/layers';
import type { Layer, ITextLayer, IImageLayer } from './types/layers';

function CameraLayer(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    console.log('Initializing camera...');
    setIsLoading(true);
    
    async function initializeCamera(): Promise<void> {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true
        });
        console.log('Camera access granted.');
        if (videoRef.current && mediaStream) {
          console.log('Video element is ready.');
          stream = mediaStream;
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            console.log('Camera feed is live.');
          };
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Camera access error:', error);
        setError('Failed to access camera. Please check permissions and try again.');
        setIsLoading(false);
      }
    }

    initializeCamera();

  return (): void => stream?.getTracks().forEach(track => track.stop());
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
      style={{ 
        position: 'absolute',
        width: '100%',
        height: '100vh',
        objectFit: 'cover',
        zIndex: 0
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
        .sort((a, b) => a.order - b.order)
        .map(layer => (
          <LayerComponent key={layer.id} layer={layer} />
        ))}
    </div>
  );
}
