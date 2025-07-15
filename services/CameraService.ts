import { CameraError } from '../components/CameraUI';

/**
 * Service for managing camera initialization and permissions
 * Handles device detection, permissions, and automatic retry logic
 */
export class CameraService {
  private retryAttempts: number = 0;
  private maxRetries: number = 3;
  private readonly backoffMs: number = 1000; // Base backoff time in milliseconds
  
  /**
   * Initialize the camera stream with permission handling
   * @throws {CameraError} If camera initialization fails
   */
  async initialize(): Promise<MediaStream> {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw this.createError('device', 'Camera API not supported');
      }

      // Load stored permission status
      const storedPermission = localStorage.getItem(PERMISSION_KEY);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      // Update permission status on success
      localStorage.setItem(PERMISSION_KEY, 'granted');
      
      return stream;
    } catch (error) {
      if (error instanceof Error) {
        // Handle permission denials
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw this.createError('permission', 'Camera permission denied', () => this.retry());
        }
        
        // Handle device errors
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          throw this.createError('device', 'No camera device found');
        }
        
        // Other initialization errors
        throw this.createError('initialization', error.message, () => this.retry());
      }
      
      // Unknown errors
      throw this.createError('unknown', 'Failed to initialize camera', () => this.retry());
    }
  }

  /**
   * Retry camera initialization with exponential backoff
   * @throws {CameraError} If max retries exceeded
   */
  async retry(): Promise<void> {
    if (this.retryAttempts >= this.maxRetries) {
      throw this.createError('initialization', 'Max retry attempts exceeded');
    }

    // Implement exponential backoff
    const delay = this.backoffMs * Math.pow(2, this.retryAttempts);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.retryAttempts++;
    await this.initialize();
  }

  /**
   * Create a typed camera error with optional retry callback
   */
  private createError(
    type: CameraError['type'],
    message: string,
    retry?: () => Promise<void>
  ): CameraError {
    const error = new Error(message) as CameraError;
    error.type = type;
    if (retry) {
      error.retry = retry;
    }
    return error;
  }
}

/** Storage key for camera permission status */
export const PERMISSION_KEY = 'camera_permission_status';
