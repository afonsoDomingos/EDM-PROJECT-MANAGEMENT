import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db.js';
import { ProjectModel, TaskModel, RiskModel, ExpenseModel, MilestoneModel, DocumentModel } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const updated = await ProjectModel.findOneAndUpdate(
        { id },
        { ...req.body, lastUpdated: new Date().toISOString().split('T')[0] },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Projecto não encontrado' });
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      const deleted = await ProjectModel.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Projecto não encontrado' });
      await Promise.all([
        TaskModel.deleteMany({ projectId: id }),
        RiskModel.deleteMany({ projectId: id }),
        ExpenseModel.deleteMany({ projectId: id }),
        MilestoneModel.deleteMany({ projectId: id }),
        DocumentModel.deleteMany({ projectId: id }),
      ]);
      return res.json({ message: 'Projecto e entidades dependentes eliminados com sucesso.' });
    }

    if (req.method === 'GET') {
      const project = await ProjectModel.findOne({ id });
      if (!project) return res.status(404).json({ error: 'Projecto não encontrado' });
      return res.json(project);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
