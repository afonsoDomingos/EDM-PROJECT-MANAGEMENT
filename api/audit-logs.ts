import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './_lib/db.js';
import { AuditLogModel } from './_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const logs = await AuditLogModel.find().sort({ timestamp: -1 });
      return res.json(logs);
    }

    if (req.method === 'POST') {
      const id = req.body.id || `LOG-${Date.now()}`;
      const newLog = new AuditLogModel({ ...req.body, id });
      await newLog.save();
      return res.status(201).json(newLog);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
