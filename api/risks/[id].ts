import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db.js';
import { RiskModel } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const updated = await RiskModel.findOneAndUpdate({ id }, req.body, { new: true });
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      await RiskModel.findOneAndDelete({ id });
      return res.json({ message: 'Risco eliminado' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
