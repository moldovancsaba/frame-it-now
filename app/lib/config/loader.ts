import { IConfig, defaultConfig, Environment } from './types';
import { validateEnvOrThrow } from './validator';

/**
 * ConfigurationError class for handling configuration-specific errors
 * Provides detailed error messages and maintains error type checking
 */
class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Configuration loader implementing the singleton pattern
 * Provides centralized, type-safe access to all configuration values
 * Features:
 * - Environment-aware configuration loading
 * - Configuration validation
 * - Caching for performance optimization
 * - Retry logic for resilient config loading
 * - Type-safe access to all config values
 */
export class ConfigLoader {
  private static instance: ConfigLoader | null = null;
  private config: IConfig | null = null;
  private retryAttempts = 0;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Returns the singleton instance of ConfigLoader
   * Creates a new instance if one doesn't exist
   */
  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Loads and validates configuration based on current environment
   * Implements retry logic for resilient loading
   * @throws ConfigurationError if configuration loading fails after all retries
   */
  public async loadConfig(): Promise<IConfig> {
    try {
      // Return cached config if available
      if (this.config) {
        return this.config;
      }

      // Validate environment variables
      validateEnvOrThrow();

      // Load and merge configurations
      const config = await this.loadEnvironmentConfig();
      
      // Cache the validated config
      this.config = config;
      return config;
    } catch (error) {
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        console.warn(
          `Configuration loading failed, attempt ${this.retryAttempts}/${this.maxRetries}. Retrying...`,
          error
        );
        await this.delay(this.retryDelayMs);
        return this.loadConfig();
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ConfigurationError(
        `Failed to load configuration after ${this.maxRetries} attempts: ${errorMessage}`
      );
    }
  }

  /**
   * Gets a specific configuration section with type safety
   * @param key Configuration section key
   * @throws ConfigurationError if configuration is not loaded
   */
  public async getConfig<K extends keyof IConfig>(key: K): Promise<IConfig[K]> {
    const config = await this.loadConfig();
    return config[key];
  }

  /**
   * Loads environment-specific configuration and merges with defaults
   * @returns Complete configuration object
   */
  private async loadEnvironmentConfig(): Promise<IConfig> {
    const environment = (process.env.NODE_ENV || 'development') as Environment;
    
    // Start with default configuration
    const config: IConfig = {
      ...defaultConfig,
      environment,
      isDevelopment: environment === 'development',
      version: process.env.npm_package_version || '0.0.0',
      
      // MongoDB configuration
      mongodb: {
        uri: this.requireEnv('MONGODB_URI'),
        dbName: process.env.MONGODB_DB || 'frameit',
        options: {
          ...defaultConfig.mongodb!.options,
          replicaSet: process.env.MONGODB_REPLICA_SET,
        },
      },

      // ImgBB configuration
      imgbb: {
        ...defaultConfig.imgbb!,
        apiKey: this.requireEnv('IMGBB_API_KEY'),
      },

      // Server configuration
      server: {
        ...defaultConfig.server!,
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || 'localhost',
        corsOrigins: this.parseArrayEnv('CORS_ORIGINS', defaultConfig.server!.corsOrigins),
      },

      // Security configuration
      security: {
        ...defaultConfig.security!,
        jwtSecret: process.env.JWT_SECRET || 'development_jwt_secret',  // Only require in production
      },

      // Cache configuration
      cache: {
        ...defaultConfig.cache!,
        enabled: this.parseBooleanEnv('CACHE_ENABLED', true),
        maxSize: parseInt(process.env.CACHE_MAX_SIZE || String(defaultConfig.cache!.maxSize), 10),
      },

      // Logging configuration
      logLevel: (process.env.LOG_LEVEL || defaultConfig.logLevel) as IConfig['logLevel'],
    };

    return config;
  }

  /**
   * Requires an environment variable to be set
   * @param key Environment variable name
   * @throws ConfigurationError if the environment variable is not set
   */
  private requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new ConfigurationError(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Parses a comma-separated environment variable into an array
   * @param key Environment variable name
   * @param defaultValue Default value if not set
   */
  private parseArrayEnv(key: string, defaultValue: string[]): string[] {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    return value.split(',').map(item => item.trim());
  }

  /**
   * Parses a boolean environment variable
   * @param key Environment variable name
   * @param defaultValue Default value if not set
   */
  private parseBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  /**
   * Utility function to implement delay between retries
   * @param ms Delay in milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clears the configuration cache
   * Useful for testing or when configuration needs to be reloaded
   */
  public clearCache(): void {
    this.config = null;
    this.retryAttempts = 0;
  }
}

// Export a singleton instance
export const configLoader = ConfigLoader.getInstance();
