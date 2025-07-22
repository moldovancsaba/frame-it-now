import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}
const DB_NAME = process.env.MONGODB_DB || 'frameit';

async function checkLayers() {
  console.log('Checking layers in database...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('layers');
    
    const layers = await collection.find({}).toArray();
    console.log('Found layers:', JSON.stringify(layers, null, 2));
    
  } catch (error) {
    console.error('Error checking layers:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the check
checkLayers().catch(console.error);
