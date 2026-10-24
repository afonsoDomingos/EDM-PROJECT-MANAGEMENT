import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db.js';
import { TaskModel } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const tasks = await TaskModel.find().sort({ createdAt: -1 });
      return res.json(tasks);
    }

    if (req.method === 'POST') {
      const id = req.body.id || `TSK-${Date.now().toString().slice(-4)}`;
      const newTask = new TaskModel({ ...req.body, id });
      await newTask.save();
      return res.status(201).json(newTask);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
