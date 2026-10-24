import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db.js';
import { NotificationModel } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'PUT') {
      await NotificationModel.updateMany({}, { read: true });
      return res.json({ message: 'Todas as notificações marcadas como lidas' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
