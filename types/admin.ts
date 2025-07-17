import { ObjectId } from 'mongodb';

/**
 * Represents a frame that can be overlaid on photos
 * Frames are PNG images that are overlaid on the final photo
 */
export interface Frame {
  _id: ObjectId;
  name: string;
  url: string;
  isActive: boolean;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a guide that helps with photo composition
 * Guides are SVG images that are shown during photo capture
 */
export interface Guide {
  _id: ObjectId;
  name: string;
  url: string;
  isActive: boolean;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a background style
 * Can be gradient, solid color, or any valid CSS background
 */
export interface Background {
  _id: ObjectId;
  name: string;
  style: string; // CSS background style
  isActive: boolean;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Asset types that can be managed in the admin interface
 */
export type AssetType = 'frame' | 'guide' | 'background';

/**
 * Response format for asset operations
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
