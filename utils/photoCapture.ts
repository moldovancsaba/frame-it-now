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
 * Captures a photo from video stream with optional overlay at maximum resolution
 * Uses the native video resolution to ensure highest quality capture
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
  // Get the native video resolution
  const nativeWidth = video.videoWidth;
  const nativeHeight = video.videoHeight;

  // Create canvas at native resolution
  const canvas = document.createElement('canvas');
  canvas.width = nativeWidth;
  canvas.height = nativeHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Validate video element and its source
  if (!video || typeof video !== 'object') {
    throw new Error('Invalid video element provided');
  }

  if (!video.srcObject) {
    throw new Error('No video source available');
  }

  // Calculate dimensions while preserving the target aspect ratio
  const targetAspectRatio = width / height;
  let cropWidth, cropHeight, sx, sy;

  if (nativeWidth / nativeHeight > targetAspectRatio) {
    // Video is wider than target, crop width
    cropHeight = nativeHeight;
    cropWidth = nativeHeight * targetAspectRatio;
    sx = (nativeWidth - cropWidth) / 2;
    sy = 0;
  } else {
    // Video is taller than target, crop height
    cropWidth = nativeWidth;
    cropHeight = nativeWidth / targetAspectRatio;
    sx = 0;
    sy = (nativeHeight - cropHeight) / 2;
  }

  // Clear canvas and set to target dimensions
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  // Mirror and draw video frame
  ctx.scale(-1, 1);
  ctx.drawImage(
    video,
    sx, sy, cropWidth, cropHeight,
    -width, 0, width, height
  );
  ctx.scale(-1, 1); // Reset transform

  // Validate overlay image if provided
  if (overlayImage && (!overlayImage.complete || !overlayImage.naturalWidth)) {
    throw new Error('Invalid or incomplete overlay image');
  }

  // Add overlay if provided, with proper state management and positioning
  if (overlayImage) {
    // Preserve canvas state
    ctx.save();
    // Reset any transforms
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Draw overlay scaled to match the target dimensions
    ctx.drawImage(overlayImage, 0, 0, width, height);
    // Restore canvas state
    ctx.restore();
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
    minWidth = 1080,    // Minimum resolution matches frame
    minHeight = 1080,   // Minimum resolution matches frame
    maxWidth = 4096,    // Support up to 4K
    maxHeight = 4096,   // Support up to 4K
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
