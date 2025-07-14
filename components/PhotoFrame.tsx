import React, { useEffect, useRef } from 'react';

interface PhotoFrameProps {
  src: string;
  width: number;
  height: number;
  effects?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
  };
  className?: string;
}

/**
 * PhotoFrame Component
 * Renders an image with effects
 * 
 * @param {string} src - URL of the image
 * @param {number} width - Width of the frame
 * @param {number} height - Height of the frame
 * @param {object} effects - Image effects configuration
 * @param {boolean} priority - Whether to prioritize loading (default: false)
 * @param {string} className - Additional CSS classes
 */
const PhotoFrame: React.FC<PhotoFrameProps> = ({
  src,
  width,
  height,
effects = {},
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create filter string once outside the image load callback
    let filterString = '';
    if (effects?.blur !== undefined) filterString += `blur(${effects.blur}px) `;
    if (effects?.brightness !== undefined) filterString += `brightness(${effects.brightness}) `;
    if (effects?.contrast !== undefined) filterString += `contrast(${effects.contrast}) `;
    filterString = filterString.trim();

    const img = new Image();
    img.src = src;
    img.crossOrigin = 'anonymous';
    img.onload = (): void => {
      // Clear the canvas before drawing
      ctx.clearRect(0, 0, width, height);

      // Apply effects if any
      if (filterString !== '') {
        ctx.filter = filterString;
      }

      // Draw the image once with all effects applied
      ctx.drawImage(img, 0, 0, width, height);

      // Reset the filter
      if (filterString !== '') {
        ctx.filter = 'none';
      }
    };
  }, [src, width, height, effects]);

  // Calculate aspect ratio for responsive scaling

  return (
    <div className="responsive-frame-container" style={{ aspectRatio: `${width} / ${height}` }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`responsive-frame ${className}`.trim()}
      />
    </div>
  );
};

export default PhotoFrame;
