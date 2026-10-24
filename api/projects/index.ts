import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db.js';
import { ProjectModel } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const projects = await ProjectModel.find().sort({ createdAt: -1 });
      return res.json(projects);
    }

    if (req.method === 'POST') {
      const count = await ProjectModel.countDocuments();
      const id = req.body.id || `PRJ-${String(count + 1).padStart(3, '0')}`;
      const newProject = new ProjectModel({ ...req.body, id });
      await newProject.save();
      return res.status(201).json(newProject);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
