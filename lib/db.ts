import { MongoClient } from 'mongodb';

// Add type assertion for the global variable
// This needs to use var for global declarations
/* eslint-disable no-var */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

declare var global: {
  _mongoClientPromise?: Promise<MongoClient>;
};
/* eslint-enable no-var */

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined');
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Validate MongoDB URI format
if (!uri.includes('mongodb+srv://') && !uri.includes('mongodb://')) {
  throw new Error('Invalid MongoDB URI format');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
// In dev, use a global variable so the value is preserved across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      // Add connection options for better error handling
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,  // 45 seconds
      serverSelectionTimeoutMS: 5000, // 5 seconds
      maxPoolSize: 10
    });
    global._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('MongoDB Connection Error:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In prod, create a new client for each invocation (serverless-safe)
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;