import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import PhotoFrame from '../components/PhotoFrame';

// Lazy load heavy components
const ImageControls = lazy(() => import('../components/ImageControls'));
const FullscreenButton = lazy(() => import('../components/FullscreenButton'));

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function SlideshowPage(): JSX.Element {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch images from the API, use the .images array
const fetchImages = async (): Promise<void> => {
    try {
      const res = await fetch(`/api/gallery`);
      const data = await res.json();
      if (Array.isArray(data.images)) setImages(shuffle([...data.images]));
      setIndex(0);
    } catch {
      setImages([]);
    }
  };

  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 3 * 1000);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [images]);

  const goFullscreen = (): void => {
    const el = document.getElementById('slideshow-container');
    if (el === null) return;
    if (typeof el.requestFullscreen === 'function') {
      void el.requestFullscreen();
} else if ('webkitRequestFullscreen' in el && typeof (el as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen === 'function') {
      void (el as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
    } else if ('msRequestFullscreen' in el && typeof (el as HTMLElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen === 'function') {
      void (el as HTMLElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
    }
  };

  return (
    <div
      id="slideshow-container"
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
      tabIndex={0}
    >
      <Suspense fallback={<div style={{ color: '#fff', fontSize: 24 }}>Loading image...</div>}>
        {images.length > 0 ? (
          <PhotoFrame
            src={images[index]}
            width={1024}
            height={1024}
          />
        ) : (
          <div style={{ color: '#fff', fontSize: 24 }}>No images to display.</div>
        )}
      </Suspense>
      <Suspense fallback={<div />}>
        <FullscreenButton onClick={goFullscreen} />
      </Suspense>
      <Suspense fallback={<div />}>
        <ImageControls 
          currentIndex={index + 1}
          totalImages={images.length}
        />
      </Suspense>
    </div>
  );
}