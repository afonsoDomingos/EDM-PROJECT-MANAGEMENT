import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db.js';
import { ExpenseModel, ProjectModel } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const expenses = await ExpenseModel.find().sort({ createdAt: -1 });
      return res.json(expenses);
    }

    if (req.method === 'POST') {
      const id = req.body.id || `EXP-${Date.now().toString().slice(-4)}`;
      const newExpense = new ExpenseModel({ ...req.body, id });
      await newExpense.save();

      // Increment project spentBudget
      await ProjectModel.findOneAndUpdate(
        { id: req.body.projectId },
        { $inc: { spentBudget: req.body.amount } }
      );

      return res.status(201).json(newExpense);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
