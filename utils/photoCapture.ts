/**
 * Configuration for photo capture
 */
interface CaptureConfig {
  video: HTMLVideoElement;
  width: number;
  height: number;
  overlayImage?: HTMLImageElement;
}

/**
 * Captures a photo from video stream with optional overlay
 * 
 * @param {CaptureConfig} config - Configuration for photo capture
 * @returns {Promise<string>} Data URL of the captured image
 */
export const capturePhoto = async ({
  video,
  width,
  height,
  overlayImage
}: CaptureConfig): Promise<string> => {
  // Create canvas for capture
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate dimensions while preserving aspect ratio
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  const side = Math.min(videoWidth, videoHeight);
  const sx = (videoWidth - side) / 2;
  const sy = (videoHeight - side) / 2;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw video frame
  ctx.drawImage(video, sx, sy, side, side, 0, 0, width, height);

  // Add overlay if provided
  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, width, height);
  }

  // Convert to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Loads an image from URL
 * 
 * @param {string} url - URL of the image to load
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export default {
  capturePhoto,
  loadImage,
};
