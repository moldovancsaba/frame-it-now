import React, { forwardRef, CSSProperties, useEffect } from 'react';
import { getAvailableScreenSpace, calculatePreviewSize } from '../utils/previewSize';
import Image, { ImageProps } from 'next/image';

/**
 * Base props without the alt property
 */
type BaseProps = Partial<Omit<ImageProps, 'alt' | 'onError'>>;

/**
 * Props interface for the PhotoFrame component.
 * Defines the structure of properties that can be passed to the component.
 */
interface PhotoFrameProps extends BaseProps {
  ref?: React.Ref<HTMLImageElement>;
  /** Source URL of the image to be displayed */
  src: string;
  /** Width of the canvas in pixels */
  width?: number;
  /** Height of the canvas in pixels */
  height?: number;
  /** Optional CSS class name for styling */
  className?: string;
  /** Optional inline styles object */
  style?: CSSProperties;
  /** Custom error handler callback */
  onError?: (error: Error) => void;
  /** Layout mode */
  layout?: 'fixed' | 'fill' | 'responsive' | 'intrinsic';
  /** Object fit property */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Image loading behavior */
  loading?: 'lazy' | 'eager';
  /** Image quality (1-100) */
  quality?: number;
  /** Placeholder type */
  placeholder?: 'blur' | 'empty';
  /** Base64 encoded blur data URL */
  blurDataURL?: string;
  /** Priority loading */
  priority?: boolean;
  /** Responsive size behavior */
  sizes?: string;
  /** Ready state for visibility control */
  isReady?: boolean;
  /** Callback when frame dimensions are updated */
  onFrameDimensionsChange?: (dimensions: { width: number; height: number }) => void;
}

/**
 * PhotoFrame Component - A canvas-based image display component with effects support
 * 
 * Uses React.ForwardRefRenderFunction to implement ref forwarding pattern, allowing
 * parent components to directly access the underlying canvas element. This is useful
 * for operations like taking snapshots or applying custom canvas manipulations.
 * 
 * @param props - Component props excluding ref
 * @param ref - Forwarded ref to access the canvas element
 */

const PhotoFrame = forwardRef<HTMLImageElement, PhotoFrameProps>(function PhotoFrame(props, ref) {
  const {
    src,
    className = '',
    style,
    onError,
    objectFit,
    isReady = true,
    onFrameDimensionsChange,
    ...otherProps
  } = props;

  // Handle errors
  const handleError = (): void => {
    if (onError) {
      const error = new Error('Image loading failed');
      onError(error);
    }
  };

  // Handle frame load and calculate dimensions based on screen space
  useEffect(() => {
    if (typeof window !== 'undefined') {
      getAvailableScreenSpace();
    }
  }, []);

  const handleFrameLoad = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    const img = event.currentTarget;
    const availableSpace = getAvailableScreenSpace();
    const newDimensions = calculatePreviewSize(img, availableSpace);
    onFrameDimensionsChange?.(newDimensions);
  };

  // Update frame loaded state when dimensions are set

const imageStyle: CSSProperties = {
    ...style,
    objectFit: objectFit || 'cover',
    maxHeight: '90vh',
    opacity: isReady ? 0.8 : 0,
    transition: 'opacity 0.3s ease',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    borderRadius: '8px'
  };

  return (
    <Image
      ref={ref}
      src={src}
      width={1080}
      height={1080}
      className={`video-preview ${className}`}
      style={imageStyle}
      alt="Photo frame overlay"
      onError={handleError}
      onLoad={handleFrameLoad}
      quality={75}
      priority={true}
      unoptimized={true}
      {...otherProps}
    />
  );
});

export default PhotoFrame;
