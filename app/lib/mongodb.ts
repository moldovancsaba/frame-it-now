import { MongoClient } from 'mongodb';
import { configLoader } from './config/loader';

// Get MongoDB configuration from centralized config
/**
 * MongoDB connection configuration and client initialization
 * Handles configuration loading and connection management
 */

// Initialize MongoDB client promise
const initializeClient = async (): Promise<MongoClient> => {
  const config = await configLoader.loadConfig();
  const { uri, options } = config.mongodb;

  // Create new client instance with serverless-optimized options
  const client = new MongoClient(uri, {
    ...options,
    // Force serverless mode for better connection handling
    maxPoolSize: 1,
    minPoolSize: 0,
    keepAlive: false,
    autoReconnect: false,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000
  });
  return client;
};

// Initialize connection with retry logic
const connectWithRetry = async (client: MongoClient, retries = 3, delay = 1000): Promise<MongoClient> => {
  try {
    await client.connect();
    return client;
  } catch (error) {
    if (retries > 0) {
      console.warn(`MongoDB connection failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(client, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Handle client initialization based on environment
const clientPromise: Promise<MongoClient> = (async (): Promise<MongoClient> => {
  if (process.env.NODE_ENV === 'development') {
    // In development, reuse existing connection if available
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = await initializeClient();
      globalWithMongo._mongoClientPromise = connectWithRetry(client);
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // In production, create new connection
    const client = await initializeClient();
    return connectWithRetry(client);
  }
})();

export default clientPromise;
