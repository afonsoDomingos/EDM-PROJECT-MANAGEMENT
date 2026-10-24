import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db.js';
import { MilestoneModel } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const milestones = await MilestoneModel.find().sort({ plannedDate: 1 });
      return res.json(milestones);
    }

    if (req.method === 'POST') {
      const id = req.body.id || `MLS-${Date.now().toString().slice(-3)}`;
      const newMilestone = new MilestoneModel({ ...req.body, id });
      await newMilestone.save();
      return res.status(201).json(newMilestone);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
