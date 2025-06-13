export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };
import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, overlayUrl } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  try {
    // 1. Feltöltés imgbb-re
    const formData = new URLSearchParams();
    formData.append('key', process.env.IMGBB_API_KEY);
    formData.append('image', image.replace(/^data:image\/\w+;base64,/, ''));

    const imgbbResp = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const imgbbJson = await imgbbResp.json();

    if (!imgbbJson.success) {
      return res.status(500).json({ error: 'ImgBB upload failed', detail: imgbbJson });
    }

    const imageUrl = imgbbJson.data.url;

    // 2. MongoDB-be mentés
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('photos');

    const doc = {
      url: imageUrl,
      createdAt: new Date(),
      overlayUrl: overlayUrl || null,
    };

    await collection.insertOne(doc);

    return res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
}
