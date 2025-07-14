import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/db';

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

interface UploadResponse {
  url: string;
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { image, overlayUrl } = req.body;
  if (image === undefined || image === null || image === '') {
    return res.status(400).json({ error: 'Missing image data' });
  }

  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (apiKey === undefined || apiKey === null || apiKey === '') {
      throw new Error('Missing IMGBB_API_KEY environment variable');
    }

    // Upload to imgbb
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('image', image.replace(/^data:image\/\w+;base64,/, ''));

    const imgbbResp = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const imgbbJson: {
      success: boolean;
      data?: { url: string };
    } = await imgbbResp.json();

    if (!imgbbJson.success || !imgbbJson.data) {
      return res.status(500).json({ error: 'ImgBB upload failed', detail: JSON.stringify(imgbbJson) });
    }

    const imageUrl = imgbbJson.data.url;

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db(); // uses default DB from URI
    const collection = db.collection('photos');

    const doc = {
      url: imageUrl,
      createdAt: new Date(),
      overlayUrl: overlayUrl ?? null,
    };

    await collection.insertOne(doc);

    return res.status(200).json({ url: imageUrl });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Upload failed');
    res.status(500).json({ error: 'Upload failed', detail: error.message });
  }
}