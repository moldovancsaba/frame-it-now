import { MongoClient } from 'mongodb';
interface Layer {
  id: string;
  type: 'camera' | 'text' | 'image';
  order: number;
  visible: boolean;
}

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}
const DB_NAME = process.env.MONGODB_DB || 'frameit';

async function initDefaultLayers() {
  console.log('Initializing default layers...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('layers');
    
    // Check if we already have a camera layer
    const existingCamera = await collection.findOne({ type: 'camera' });
    
    if (!existingCamera) {
      console.log('Creating default camera layer...');
      const cameraLayer: Layer = {
        id: 'camera-base',
        type: 'camera',
        order: 0,
        visible: true
      };
      
      await collection.insertOne(cameraLayer);
      console.log('Created default camera layer');
    } else {
      console.log('Camera layer already exists');
    }
    
    console.log('Default layers initialization complete');
  } catch (error) {
    console.error('Error initializing default layers:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the initialization
initDefaultLayers().catch(console.error);
