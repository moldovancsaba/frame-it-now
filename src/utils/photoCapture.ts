/**
 * Configuration interface for photo capture operations
 */
interface CaptureConfig {
  video: HTMLVideoElement;
  width: number;
  height: number;
  overlayImage?: HTMLImageElement;
  facingMode?: 'user' | 'environment';
}

/**
 * Captures a photo from video stream with optimized resolution handling
 * @param config CaptureConfig object containing capture parameters
 * @returns Promise resolving to base64 encoded PNG image
 * @throws Error if canvas context is unavailable or resolution validation fails
 */
export const capturePhoto = async ({
  video,
  width,
  height,
  overlayImage,
  facingMode = 'environment'
}: CaptureConfig): Promise<string> => {
  // Validate video stream dimensions
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error('Video dimensions not available - stream may not be initialized');
  }

  // Validate target dimensions
  if (width <= 0 || height <= 0) {
    throw new Error('Invalid target dimensions specified');
  }

  // Create high-res canvas matching video dimensions
  const canvas = document.createElement('canvas');
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  
  // Set canvas to native video resolution for maximum quality
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  // Calculate maximum square crop area
  const side = Math.min(sourceWidth, sourceHeight);
  const sx = (sourceWidth - side) / 2;
  const sy = (sourceHeight - side) / 2;

  // Get canvas context and validate
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Save context state before transformations
  ctx.save();

  // Mirror for selfie mode if needed
  if (facingMode === 'user') {
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
  }

  // Draw video frame maintaining aspect ratio
  ctx.drawImage(
    video,
    sx, sy, side, side,  // Source crop
    0, 0, width, height  // Target dimensions
  );

  // If overlay provided, scale and draw it
  if (overlayImage) {
    // Scale overlay to match target dimensions while preserving aspect ratio
    const overlayAspect = overlayImage.width / overlayImage.height;
    const targetAspect = width / height;
    
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (overlayAspect > targetAspect) {
      // Overlay is wider - scale to match height
      drawWidth = height * overlayAspect;
      offsetX = (width - drawWidth) / 2;
    } else {
      // Overlay is taller - scale to match width
      drawHeight = width / overlayAspect;
      offsetY = (height - drawHeight) / 2;
    }

    ctx.drawImage(
      overlayImage,
      offsetX, offsetY, drawWidth, drawHeight
    );
  }

  // Restore context state
  ctx.restore();

  // Convert to PNG with maximum quality
  return canvas.toDataURL('image/png', 1.0);
};
