import { CameraStatus, CameraConfig, CameraError } from '../types/camera';

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
 * Image processing result interface
 */
interface ProcessedImage {
  width: number;
  height: number;
  format: string;
  dataUrl: string;
}

/**
 * Image validation options
 */
interface ImageValidationOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedFormats?: string[];
}

/**
 * Captures a photo from video stream with optional overlay at maximum available resolution
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
  // Validate video element and its source
  if (!video || typeof video !== 'object') {
    throw new Error('Invalid video element provided');
  }

  if (!video.srcObject) {
    throw new Error('No video source available');
  }

  // Get the actual video track settings for maximum resolution
  const videoTrack = (video.srcObject as MediaStream).getVideoTracks()[0];
  const settings = videoTrack.getSettings();
  const actualWidth = settings.width || video.videoWidth;
  const actualHeight = settings.height || video.videoHeight;

  // Create canvas at the maximum available resolution
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(width, actualWidth);
  canvas.height = Math.max(height, actualHeight);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate dimensions while preserving aspect ratio
  const videoAspect = actualWidth / actualHeight;
  const targetAspect = width / height;

  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

  // Calculate dimensions to fill the frame while maintaining aspect ratio
  if (videoAspect > targetAspect) {
    drawHeight = canvas.height;
    drawWidth = drawHeight * videoAspect;
    offsetX = (drawWidth - canvas.width) / 2;
  } else {
    drawWidth = canvas.width;
    drawHeight = drawWidth / videoAspect;
    offsetY = (drawHeight - canvas.height) / 2;
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mirror and draw video frame at full resolution
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(
    video,
    -canvas.width - offsetX,
    -offsetY,
    drawWidth,
    drawHeight
  );
  ctx.restore();

  // Add overlay if provided, scaling it to match the canvas size
  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }

  // Convert to high-quality PNG
  return canvas.toDataURL('image/png', 1.0);
};

/**
 * Process a captured image
 * 
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<ProcessedImage>} Processed image information
 */
export const processImage = async (imageData: string): Promise<ProcessedImage> => {
  if (!imageData.startsWith('data:image/')) {
    throw new Error('Invalid image data');
  }

  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Failed to process image'));
    img.src = imageData;
  });

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    format: imageData.split(';')[0].split('/')?.[1] || 'png',
    dataUrl: imageData
  };
};

/**
 * Validate image dimensions and format
 * 
 * @param {ProcessedImage} imageData - Processed image data to validate
 * @param {ImageValidationOptions} [options] - Validation options
 * @returns {boolean} Whether the image meets the validation criteria
 */
export const validateImage = (imageData: ProcessedImage, options: ImageValidationOptions = {}): boolean => {
  const {
    minWidth = 1920,  // Minimum Full HD
    minHeight = 1920, // Minimum Full HD
    maxWidth = 8192,  // Support up to 8K
    maxHeight = 8192, // Support up to 8K
    allowedFormats = ['jpeg', 'png']
  } = options;

  // Check dimensions
  if (imageData.width < minWidth || imageData.height < minHeight) {
    console.warn('Image resolution below minimum:', imageData.width, 'x', imageData.height);
    return false;
  }

  if (imageData.width > maxWidth || imageData.height > maxHeight) {
    console.warn('Image resolution above maximum:', imageData.width, 'x', imageData.height);
    return false;
  }

  // Check format
  if (!allowedFormats.includes(imageData.format.toLowerCase())) {
    console.warn('Unsupported image format:', imageData.format);
    return false;
  }

  return true;
};

/**
 * Load an image from a URL
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
