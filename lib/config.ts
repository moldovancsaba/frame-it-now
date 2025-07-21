/**
 * Configuration validation utility
 * Ensures all required environment variables are present and properly formatted
 */

interface IEnvConfig {
  mongodb: {
    uri: string;
    dbName: string;
  };
  imgbb: {
    apiKey: string;
    apiUrl: string;
  };
  upload: {
    maxFileSize: number;
  };
}

/**
 * Validates environment variables and returns a typed configuration object
 * Throws detailed errors if any required variables are missing or malformed
 */
export function validateConfig(): IEnvConfig {
  // MongoDB validation
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required');
  }
  
  const mongoDbName = process.env.MONGODB_DB;
  if (!mongoDbName) {
    throw new Error('MONGODB_DB environment variable is required');
  }

  // ImgBB validation
  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!imgbbApiKey) {
    throw new Error('NEXT_PUBLIC_IMGBB_API_KEY environment variable is required');
  }

  const imgbbApiUrl = process.env.IMGBB_API_URL;
  if (!imgbbApiUrl) {
    throw new Error('IMGBB_API_URL environment variable is required');
  }

  // File upload validation
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '33554432', 10);
  if (isNaN(maxFileSize) || maxFileSize <= 0) {
    throw new Error('MAX_FILE_SIZE must be a positive number');
  }

  return {
    mongodb: {
      uri: mongoUri,
      dbName: mongoDbName,
    },
    imgbb: {
      apiKey: imgbbApiKey,
      apiUrl: imgbbApiUrl,
    },
    upload: {
      maxFileSize,
    },
  };
}
