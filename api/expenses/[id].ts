import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { ExpenseModel, ProjectModel } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === 'DELETE') {
      const exp = await ExpenseModel.findOneAndDelete({ id });
      if (exp) {
        await ProjectModel.findOneAndUpdate(
          { id: exp.projectId },
          { $inc: { spentBudget: -exp.amount } }
        );
      }
      return res.json({ message: 'Despesa eliminada' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
