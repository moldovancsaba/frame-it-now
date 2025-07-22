import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import type { NewComposition } from '../../types/composition';

export async function GET(): Promise<NextResponse> {
  try {
    const client = await clientPromise;
    if (!client) {
      throw new Error('Failed to connect to MongoDB Atlas');
    }
    
    const dbName = process.env.MONGODB_DB || 'frameit';
    const db = client.db(dbName);
    
    // Always get the first composition (we only need one)
    const composition = await db.collection('composition').findOne({});
    
    if (!composition) {
      // Return default if none exists
      return NextResponse.json({
        aspectRatio: {
          width: 16,
          height: 9
        }
      });
    }

    // Convert MongoDB _id to string id
    return NextResponse.json({
      ...composition,
      id: composition._id.toString(),
      _id: undefined
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch composition',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'frameit';
    const db = client.db(dbName);
    const data = await request.json() as NewComposition;

    // Clear existing compositions and insert new one
    await db.collection('composition').deleteMany({});
    const result = await db.collection('composition').insertOne(data);
    
    const insertedComposition = { ...data, id: result.insertedId.toString() };
    return NextResponse.json(insertedComposition);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to save composition',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'frameit';
    const db = client.db(dbName);
    const data = await request.json();
    const { id, ...updateData } = data;

    const result = await db.collection('composition').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Composition not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update composition',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
