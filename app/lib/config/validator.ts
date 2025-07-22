/**
 * Environment variable validation with type checking and environment-specific rules
 */

interface IValidationResult {
  isValid: boolean;
  errors: string[];
}

interface IEnvVarConfig {
  required: boolean;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

interface IEnvConfig {
  [key: string]: IEnvVarConfig;
}

/**
 * Base configuration that applies to all environments
 */
const baseConfig: IEnvConfig = {
    MONGODB_URI: {
      required: true,
      validator: (value) => {
        return value.startsWith('mongodb+srv://') || value.startsWith('mongodb://');
      },
      errorMessage: 'MONGODB_URI must be a valid URL',
    },
    MONGODB_DB: {
      required: false,  // Has default value
      validator: (value) => typeof value === 'string' && value.length > 0,
      errorMessage: 'MONGODB_DB must be a non-empty string',
    },
    IMGBB_API_KEY: {
      required: true,
      validator: (value) => typeof value === 'string' && value.length > 0,
      errorMessage: 'IMGBB_API_KEY is required',
    },
};

/**
 * Environment-specific configuration overrides
 */
const envSpecificConfig: Record<string, IEnvConfig> = {
  development: {
    API_DEBUG: {
      required: false,
      validator: (value) => ['true', 'false'].includes(value.toLowerCase()),
      errorMessage: 'API_DEBUG must be either true or false',
    },
  },
  production: {
    // Production-specific environment variables can be added here if needed
  },
  test: {
    TEST_DB_URL: {
      required: true,
      validator: (value) => value.includes('test'),
      errorMessage: 'TEST_DB_URL must contain "test" to ensure test database usage',
    },
  },
};

/**
 * Validates environment variables based on current environment and configuration
 * @returns ValidationResult containing validation status and any error messages
 */
/**
 * Validate environment variables based on configuration
 */
export function validateEnv(): IValidationResult {
const result: IValidationResult = {
    isValid: true,
    errors: [],
  };

  const currentEnv = process.env.NODE_ENV || 'development';
  
  // Combine base config with environment-specific config
  const config = {
    ...baseConfig,
    ...(envSpecificConfig[currentEnv] || {}),
  };

  // Validate each configured environment variable
  Object.entries(config).forEach(([key, cfg]) => {
    const value = process.env[key];

    // Check if required variable is missing
    if (cfg.required && !value) {
      result.errors.push(`Missing required environment variable: ${key}`);
      result.isValid = false;
      return;
    }

    // Skip validation for optional variables that are not set
    if (!cfg.required && !value) {
      return;
    }

    // Validate value format if validator is provided
    if (value && cfg.validator && !cfg.validator(value)) {
      result.errors.push(cfg.errorMessage || `Invalid value for environment variable: ${key}`);
      result.isValid = false;
    }
  });

  return result;
}

/**
 * Validates environment variables and throws an error if validation fails
 * @throws Error with detailed validation messages if validation fails
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv();
  
  if (!result.isValid) {
    const errorMessage = [
      'Environment validation failed:',
      ...result.errors.map(err => `  - ${err}`),
    ].join('\n');
    
    throw new Error(errorMessage);
  }
}
