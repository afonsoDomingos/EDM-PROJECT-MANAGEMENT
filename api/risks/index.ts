import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { RiskModel } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const risks = await RiskModel.find().sort({ createdAt: -1 });
      return res.json(risks);
    }

    if (req.method === 'POST') {
      const id = req.body.id || `RSK-${Date.now().toString().slice(-3)}`;
      const newRisk = new RiskModel({ ...req.body, id });
      await newRisk.save();
      return res.status(201).json(newRisk);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
