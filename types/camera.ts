/**
 * Camera configuration types and interfaces
 * Defines the structure for camera settings and configuration options
 */

/**
 * Supported camera facing modes
 * - 'user': Front-facing camera (selfie mode)
 * - 'environment': Back-facing camera (main camera)
 */
/**
 * Supported camera facing modes
 * @type {FacingMode}
 */
export type FacingMode = 'user' | 'environment';

/**
 * Camera configuration interface
 * Defines the settings for initializing and configuring the camera
 */
/**
 * Camera configuration interface
 * @interface CameraConfig
 * @property {FacingMode} facingMode - Which camera to use (front or back)
 * @property {number} [width] - Desired video width in pixels
 * @property {number} [height] - Desired video height in pixels
 * @property {number} [aspectRatio] - Desired aspect ratio
 * @property {number} [frameRate] - Desired frame rate
 * @property {'auto' | 'manual' | 'continuous'} [focusMode] - Camera focus mode
 * @property {'auto' | 'manual' | 'continuous'} [exposureMode] - Camera exposure mode
 * @property {'auto' | 'manual' | 'continuous'} [whiteBalanceMode] - Camera white balance mode
 */
export interface CameraConfig {
  // Which camera to use (front or back)
  facingMode: FacingMode;
  // Optional video constraints
  width?: number;
  height?: number;
  aspectRatio?: number;
  frameRate?: number;
  // Advanced settings
  focusMode?: 'auto' | 'manual' | 'continuous';
  exposureMode?: 'auto' | 'manual' | 'continuous';
  whiteBalanceMode?: 'auto' | 'manual' | 'continuous';
}

/**
 * Camera status enumeration
 * Represents the possible states of the camera
 */
/**
 * Camera status enumeration
 * Represents the possible states of the camera during its lifecycle
 * @enum {string}
 */
export enum CameraStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  READY = 'ready',
  STREAMING = 'streaming',
  ERROR = 'error'
}

/**
 * Camera error interface
 * Represents errors that can occur during camera operations
 */
/**
 * Camera error interface
 * @interface CameraError
 * @property {string} code - Error code for categorizing the error
 * @property {string} message - Human-readable error description
 * @property {unknown} [details] - Additional error context or data
 */
export interface CameraError {
  code: string;
  message: string;
  details?: unknown;
}
