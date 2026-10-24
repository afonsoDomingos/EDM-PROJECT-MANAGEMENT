import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './_lib/db';
import {
  ProjectModel,
  TaskModel,
  RiskModel,
  ExpenseModel,
  MilestoneModel,
  DocumentModel,
  AuditLogModel,
  NotificationModel,
  UserModel,
} from './_lib/models';

// Import seed data — path relative to project root
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_RISKS,
  INITIAL_EXPENSES,
  INITIAL_MILESTONES,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../src/data/initialData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await connectDB();

  try {
    await Promise.all([
      ProjectModel.deleteMany({}),
      TaskModel.deleteMany({}),
      RiskModel.deleteMany({}),
      ExpenseModel.deleteMany({}),
      MilestoneModel.deleteMany({}),
      DocumentModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      NotificationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);

    await Promise.all([
      ProjectModel.insertMany(INITIAL_PROJECTS),
      TaskModel.insertMany(INITIAL_TASKS),
      RiskModel.insertMany(INITIAL_RISKS),
      ExpenseModel.insertMany(INITIAL_EXPENSES),
      MilestoneModel.insertMany(INITIAL_MILESTONES),
      DocumentModel.insertMany(INITIAL_DOCUMENTS),
      AuditLogModel.insertMany(INITIAL_AUDIT_LOGS),
      NotificationModel.insertMany(INITIAL_NOTIFICATIONS),
      UserModel.insertMany(INITIAL_USERS),
    ]);

    res.json({ message: 'Dados de demonstração repostos com sucesso no MongoDB Atlas.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
