import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { uploadImage } from '../../lib/imgbb';
import type { NewLayer } from '../../types/layers';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = await clientPromise;
    if (!client) {
      throw new Error('Failed to connect to MongoDB Atlas');
    }
    
    const dbName = process.env.MONGODB_DB || 'frameit';
    console.log(`Using database: ${dbName}`);
    const db = client.db(dbName);
    
    // Verify database connection
    await db.command({ ping: 1 });
    console.log('Successfully connected to database');
    
    const layers = await db.collection('layers').find({}).toArray();
    // Convert MongoDB _id to string id for frontend
    // Convert MongoDB ObjectId to string id and ensure layer order is respected
    const formattedLayers = layers.map(layer => ({
      ...layer,
      id: layer._id.toString(),
      _id: undefined,
      // Ensure order is a number and unique
      order: typeof layer.order === 'number' ? layer.order : 0
    }));
    return NextResponse.json(formattedLayers);
  } catch (error) {
    // Enhanced error logging
    console.error('Database Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : '',
      error
    });
    
    return NextResponse.json({ 
      error: 'Failed to fetch layers',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'frameit';
    const db = client.db(dbName);
    const data = await request.json();

    let layer = data as NewLayer;

    // If it's an image layer, handle the image upload
    if (layer.type === 'image' && layer.url.startsWith('data:')) {
      try {
        const imageUrl = await uploadImage(layer.url);
        layer = { ...layer, url: imageUrl };
      } catch (error) {
        console.error('Image Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    const result = await db.collection('layers').insertOne(layer);
    const insertedLayer = { ...layer, id: result.insertedId.toString() };

    return NextResponse.json(insertedLayer);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create layer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'frameit';
  const db = client.db(dbName);

  try {
    const data = await request.json();
    const { id, order, ...updateData } = data;

    // If updating order, handle reordering logic
    if (typeof order === 'number') {
      const collection = db.collection('layers');
      const layer = await collection.findOne({ _id: new ObjectId(id) });

      if (!layer) {
        return NextResponse.json({ error: 'Layer not found' }, { status: 404 });
      }

      const currentOrder = layer.order;

      // Update orders of affected layers
      if (currentOrder < order) {
        // Moving down: decrease order of layers in between
        await collection.updateMany(
          { 
            order: { $gt: currentOrder, $lte: order },
            _id: { $ne: new ObjectId(id) }
          },
          { $inc: { order: -1 } }
        );
      } else if (currentOrder > order) {
        // Moving up: increase order of layers in between
        await collection.updateMany(
          { 
            order: { $gte: order, $lt: currentOrder },
            _id: { $ne: new ObjectId(id) }
          },
          { $inc: { order: 1 } }
        );
      }

      // Update the target layer's order
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { order } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: 'Failed to update layer order' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Handle non-order updates
  try {

    // If updating an image layer with a new image
    if (updateData.type === 'image' && updateData.url?.startsWith('data:')) {
      try {
        const imageUrl = await uploadImage(updateData.url);
        updateData.url = imageUrl;
      } catch (error) {
        console.error('Image Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    const result = await db.collection('layers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Layer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update layer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'frameit';
    const db = client.db(dbName);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Layer ID is required' }, { status: 400 });
    }

    const result = await db.collection('layers').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Layer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete layer' }, { status: 500 });
  }
}
