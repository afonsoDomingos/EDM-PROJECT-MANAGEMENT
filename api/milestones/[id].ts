import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { MilestoneModel } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const updated = await MilestoneModel.findOneAndUpdate({ id }, req.body, { new: true });
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      await MilestoneModel.findOneAndDelete({ id });
      return res.json({ message: 'Marco eliminado' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
