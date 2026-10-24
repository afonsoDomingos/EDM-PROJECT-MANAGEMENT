import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../_lib/db.js';
import { NotificationModel } from '../../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const updated = await NotificationModel.findOneAndUpdate(
        { id },
        { read: true },
        { new: true }
      );
      return res.json(updated);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
