/**
 * Configuration type definitions and validation constraints
 * Defines the structure and requirements for all environment variables and configuration settings
 * These types ensure type safety and provide clear documentation of all available configuration options
 */

/**
 * MongoDB connection options interface
 * Specifies required connection parameters and constraints for MongoDB connection pool
 * These settings are critical for application performance and reliability
 */
export interface IMongoDBOptions {
  maxPoolSize: number;           // Maximum number of connections in the connection pool
  serverSelectionTimeoutMS: number;  // How long to wait for server selection before timing out
  socketTimeoutMS: number;       // How long to wait for socket operations before timing out
  replicaSet?: string;          // Optional replica set name for MongoDB cluster
  retryWrites: boolean;         // Whether to retry write operations on failure
}

/**
 * MongoDB configuration interface
 * Contains all MongoDB-related settings including connection string and database name
 * Required for establishing and maintaining database connectivity
 */
export interface IMongoDBConfig {
  uri: string;                  // MongoDB connection string (required)
  dbName: string;              // Database name to connect to
  options: IMongoDBOptions;     // Connection options for fine-tuning MongoDB behavior
}

/**
 * ImgBB configuration interface
 * Settings for ImgBB image hosting service integration
 * Ensures proper image upload handling and validation
 */
export interface IImgBBConfig {
  apiKey: string;              // ImgBB API key for authentication
  apiUrl: string;              // ImgBB API endpoint URL
  maxFileSizeMB: number;       // Maximum allowed file size in megabytes
  allowedFileTypes: string[];  // List of allowed image MIME types
  uploadTimeout: number;       // Timeout for upload requests in milliseconds
}

/**
 * Server configuration interface
 * Basic server settings and operational parameters
 * Controls server behavior, security, and performance settings
 */
export interface IServerConfig {
  port: number;                // Port number for the server to listen on
  host: string;               // Host address to bind to
  corsOrigins: string[];      // Allowed CORS origins for security
  rateLimitRequests: number;  // Number of requests allowed per window
  rateLimitWindowMs: number;  // Rate limiting window in milliseconds
}

/**
 * Application environment type
 * Strictly typed environment options to prevent invalid environment settings
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Security configuration interface
 * Contains security-related settings and constraints
 * Critical for maintaining application security
 */
export interface ISecurityConfig {
  jwtSecret: string;          // Secret key for JWT token signing
  jwtExpiryHours: number;     // JWT token expiration time in hours
  bcryptSaltRounds: number;   // Number of salt rounds for password hashing
  maxLoginAttempts: number;   // Maximum failed login attempts before lockout
}

/**
 * Cache configuration interface
 * Settings for application caching mechanisms
 * Optimizes performance and resource usage
 */
export interface ICacheConfig {
  enabled: boolean;           // Whether caching is enabled
  ttlSeconds: number;        // Time-to-live for cached items
  maxSize: number;           // Maximum cache size in bytes
  checkPeriodMinutes: number; // How often to check for expired items
}

/**
 * Complete application configuration interface
 * Contains all configuration sections and global settings
 * Serves as the single source of truth for all configuration values
 */
export interface IConfig {
  environment: Environment;   // Current environment
  mongodb: IMongoDBConfig;    // MongoDB settings
  imgbb: IImgBBConfig;       // ImgBB integration settings
  server: IServerConfig;      // Server configuration
  security: ISecurityConfig;  // Security settings
  cache: ICacheConfig;       // Caching settings
  logLevel: 'debug' | 'info' | 'warn' | 'error';  // Logging verbosity
  isDevelopment: boolean;    // Convenience flag for development mode
  version: string;          // Application version from package.json
}

/**
 * Default configuration values
 * Provides sensible defaults for non-sensitive configuration options
 * Do NOT include sensitive values here - they should be loaded from environment variables
 */
export const defaultConfig: Partial<IConfig> = {
  environment: 'development',
  server: {
    port: 3000,
    host: 'localhost',
    corsOrigins: ['http://localhost:3000'],
    rateLimitRequests: 100,
    rateLimitWindowMs: 60000,
  },
  mongodb: {
    uri: '',  // Will be overridden by environment variable
    dbName: 'frame-it-now',
    options: {
      maxPoolSize: 1, // Reduced for serverless environment
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      keepAlive: false, // Disabled for serverless
      autoReconnect: false // Disabled for serverless
    }
  },
  imgbb: {
    apiKey: '',  // Will be overridden by environment variable
    apiUrl: 'https://api.imgbb.com/1/upload',
    maxFileSizeMB: 10,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
    uploadTimeout: 30000,
  },
  cache: {
    enabled: true,
    ttlSeconds: 3600,
    maxSize: 104857600, // 100MB
    checkPeriodMinutes: 5,
  },
  security: {
    jwtSecret: '',  // Will be overridden by environment variable
    jwtExpiryHours: 24,
    bcryptSaltRounds: 12,
    maxLoginAttempts: 5,
  },
  logLevel: 'info',
  isDevelopment: true,
}
