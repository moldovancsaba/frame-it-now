import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/db';

interface GalleryResponse {
  images: string[];
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const client = await clientPromise;
    const db = client.db(); // uses default DB from connection string
    const collection = db.collection('photos'); // consistent collection name

    interface ImageDoc {
      url: string;
      createdAt: Date;
    }

    const images = await collection
      .find<ImageDoc>({}, { projection: { _id: 0, url: 1 } })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    // shuffle
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }

    res.status(200).json({ images: images.map(img => img.url) });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch images');
    res.status(500).json({ error: 'Failed to fetch images', detail: error.message });
  }
}