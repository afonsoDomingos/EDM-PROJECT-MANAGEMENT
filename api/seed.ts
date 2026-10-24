import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './_lib/db.js';
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
} from './_lib/models.js';

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
} from '../src/data/initialData.js';

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
      ProjectModel.insertMany(INITIAL_PROJECTS as any),
      TaskModel.insertMany(INITIAL_TASKS as any),
      RiskModel.insertMany(INITIAL_RISKS as any),
      ExpenseModel.insertMany(INITIAL_EXPENSES as any),
      MilestoneModel.insertMany(INITIAL_MILESTONES as any),
      DocumentModel.insertMany(INITIAL_DOCUMENTS as any),
      AuditLogModel.insertMany(INITIAL_AUDIT_LOGS as any),
      NotificationModel.insertMany(INITIAL_NOTIFICATIONS as any),
      UserModel.insertMany(INITIAL_USERS as any),
    ]);

    res.json({ message: 'Dados de demonstração repostos com sucesso no MongoDB Atlas.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
