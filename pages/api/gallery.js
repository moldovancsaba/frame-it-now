import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('photos');

    // Legutóbbi 120 kép lekérdezése (fordított időrend, csak az url!)
    const images = await collection
      .find({}, { projection: { _id: 0, url: 1 } })
      .sort({ createdAt: -1 })
      .limit(120)
      .toArray();

    // Random sorrendbe keverjük a képeket (Fisher–Yates shuffle)
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }

    res.status(200).json({ images: images.map(img => img.url) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images', detail: err.message });
  }
}
