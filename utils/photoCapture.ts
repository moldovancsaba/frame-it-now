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

  // Validate video element and its source
  if (!video || typeof video !== 'object') {
    throw new Error('Invalid video element provided');
  }

  // Check video dimensions first to match test expectations
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error('Invalid video dimensions');
  }

  if (!video.srcObject) {
    throw new Error('No video source available');
  }

  // Calculate dimensions while preserving aspect ratio
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // Validate video dimensions
  if (!videoWidth || !videoHeight) {
    throw new Error('Invalid video dimensions');
  }

  const side = Math.min(videoWidth, videoHeight);
  const sx = (videoWidth - side) / 2;
  const sy = (videoHeight - side) / 2;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Mirror and draw video frame
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, side, side, -width, 0, width, height);
  ctx.scale(-1, 1); // Reset transform

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
    format: imageData.split(';')[0].split('/')[1],
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
    minWidth = 640,
    minHeight = 480,
    maxWidth = 4096,
    maxHeight = 4096,
    allowedFormats = ['jpeg', 'png']
  } = options;

  // Check dimensions
  if (imageData.width < minWidth || imageData.height < minHeight) {
    return false;
  }

  if (imageData.width > maxWidth || imageData.height > maxHeight) {
    return false;
  }

  // Check format
  if (!allowedFormats.includes(imageData.format.toLowerCase())) {
    return false;
  }

  return true;
};

/**
 * Initialize camera with specified configuration
 * 
 * @param {CameraConfig} config - Camera configuration options
 * @returns {Promise<{ stream: MediaStream; status: CameraStatus; }>} Camera initialization result
 */
export const initializeCamera = async (
  config: CameraConfig,
  options: { retries?: number } = {}
): Promise<{ stream: MediaStream; status: CameraStatus }> => {
  const maxRetries = options.retries || 0;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: config.facingMode,
          width: config.width ? { ideal: config.width } : undefined,
          height: config.height ? { ideal: config.height } : undefined
        }
      });

      return {
        stream,
        status: CameraStatus.READY
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Camera initialization failed');
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new Error('Camera access denied');
        }
      }
      
      // Only retry if we haven't reached max retries
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw lastError || new Error('Camera initialization failed');
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
