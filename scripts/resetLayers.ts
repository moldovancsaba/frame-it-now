import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}
const DB_NAME = process.env.MONGODB_DB || 'frameit';

async function resetLayers() {
  console.log('Resetting layers in database...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('layers');
    
    // Remove all existing layers
    await collection.deleteMany({});
    console.log('Removed all existing layers');
    
    // Insert default camera layer
    const cameraLayer = {
      type: 'camera',
      order: 0,
      visible: true
    };
    
    const result = await collection.insertOne(cameraLayer);
    console.log('Created default camera layer:', result.insertedId.toString());
    
    // Insert example text layer
    const textLayer = {
      type: 'text',
      order: 1,
      visible: true,
      content: 'New Text',
      fontSize: 16,
      color: '#000000',
      position: {
        x: 100,
        y: 100
      }
    };
    
    const textResult = await collection.insertOne(textLayer);
    console.log('Created example text layer:', textResult.insertedId.toString());
    
    console.log('Layer reset complete');
  } catch (error) {
    console.error('Error resetting layers:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the reset
resetLayers().catch(console.error);
