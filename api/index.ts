import express, { Request, Response } from 'express';
import cors from 'cors';
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

const app = express();

app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected on each serverless invocation
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error in serverless:', err);
  }
  next();
});

// ---------------- HEALTH & STATUS ----------------
app.get('/api/health', async (_req: Request, res: Response) => {
  const isConnected = ProjectModel.db?.readyState === 1;
  res.json({
    status: isConnected ? 'online' : 'connecting',
    database: 'MongoDB Atlas',
    cluster: 'cluster0.oe0akin.mongodb.net',
    dbName: 'edmprojectmanagementdb',
  });
});

// ---------------- SEED DATABASE ----------------
app.post('/api/seed', async (_req: Request, res: Response) => {
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
});

// ---------------- PROJECTS ----------------
app.get('/api/projects', async (_req: Request, res: Response) => {
  try {
    const projects = await ProjectModel.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const count = await ProjectModel.countDocuments();
    const id = req.body.id || `PRJ-${String(count + 1).padStart(3, '0')}`;
    const newProject = new ProjectModel({ ...req.body, id });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ error: 'Projecto não encontrado' });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const updated = await ProjectModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, lastUpdated: new Date().toISOString().split('T')[0] },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Projecto não encontrado' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await ProjectModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Projecto não encontrado' });
    await Promise.all([
      TaskModel.deleteMany({ projectId: req.params.id }),
      RiskModel.deleteMany({ projectId: req.params.id }),
      ExpenseModel.deleteMany({ projectId: req.params.id }),
      MilestoneModel.deleteMany({ projectId: req.params.id }),
      DocumentModel.deleteMany({ projectId: req.params.id }),
    ]);
    res.json({ message: 'Projecto e entidades dependentes eliminados com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- TASKS ----------------
app.get('/api/tasks', async (_req: Request, res: Response) => {
  try {
    const tasks = await TaskModel.find();
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const count = await TaskModel.countDocuments();
    const id = req.body.id || `TSK-${String(count + 1).padStart(3, '0')}`;
    const task = new TaskModel({ ...req.body, id });
    await task.save();
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const updated = await TaskModel.findOneAndUpdate({ id: req.params.id }, req.body, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await TaskModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json({ message: 'Tarefa eliminada com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- RISKS ----------------
app.get('/api/risks', async (_req: Request, res: Response) => {
  try {
    const risks = await RiskModel.find();
    res.json(risks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/risks', async (req: Request, res: Response) => {
  try {
    const count = await RiskModel.countDocuments();
    const id = req.body.id || `RSK-${String(count + 1).padStart(3, '0')}`;
    const risk = new RiskModel({ ...req.body, id });
    await risk.save();
    res.status(201).json(risk);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/risks/:id', async (req: Request, res: Response) => {
  try {
    const updated = await RiskModel.findOneAndUpdate({ id: req.params.id }, req.body, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Risco não encontrado' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/risks/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await RiskModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Risco não encontrado' });
    res.json({ message: 'Risco eliminado com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- EXPENSES ----------------
app.get('/api/expenses', async (_req: Request, res: Response) => {
  try {
    const expenses = await ExpenseModel.find();
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req: Request, res: Response) => {
  try {
    const count = await ExpenseModel.countDocuments();
    const id = req.body.id || `EXP-${String(count + 1).padStart(3, '0')}`;
    const expense = new ExpenseModel({ ...req.body, id });
    await expense.save();
    await ProjectModel.findOneAndUpdate(
      { id: req.body.projectId },
      { $inc: { spentBudget: req.body.amount || 0 } }
    );
    res.status(201).json(expense);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const exp = await ExpenseModel.findOne({ id: req.params.id });
    if (exp) {
      await ProjectModel.findOneAndUpdate(
        { id: exp.projectId },
        { $inc: { spentBudget: -(exp.amount || 0) } }
      );
      await ExpenseModel.findOneAndDelete({ id: req.params.id });
    }
    res.json({ message: 'Despesa eliminada com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- MILESTONES ----------------
app.get('/api/milestones', async (_req: Request, res: Response) => {
  try {
    const milestones = await MilestoneModel.find();
    res.json(milestones);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/milestones', async (req: Request, res: Response) => {
  try {
    const count = await MilestoneModel.countDocuments();
    const id = req.body.id || `MLS-${String(count + 1).padStart(3, '0')}`;
    const mls = new MilestoneModel({ ...req.body, id });
    await mls.save();
    res.status(201).json(mls);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/milestones/:id', async (req: Request, res: Response) => {
  try {
    const updated = await MilestoneModel.findOneAndUpdate({ id: req.params.id }, req.body, { returnDocument: 'after' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- DOCUMENTS ----------------
app.get('/api/documents', async (_req: Request, res: Response) => {
  try {
    const docs = await DocumentModel.find();
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', async (req: Request, res: Response) => {
  try {
    const count = await DocumentModel.countDocuments();
    const id = req.body.id || `DOC-${String(count + 1).padStart(3, '0')}`;
    const doc = new DocumentModel({ ...req.body, id });
    await doc.save();
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- AUDIT LOGS ----------------
app.get('/api/audit-logs', async (_req: Request, res: Response) => {
  try {
    const logs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const count = await AuditLogModel.countDocuments();
    const id = `LOG-${String(count + 1).padStart(3, '0')}`;
    const log = new AuditLogModel({
      ...req.body,
      id,
      timestamp: new Date().toISOString(),
    });
    await log.save();
    res.status(201).json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- NOTIFICATIONS ----------------
app.get('/api/notifications', async (_req: Request, res: Response) => {
  try {
    const notifs = await NotificationModel.find().sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { id: req.params.id },
      { read: true },
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', async (_req: Request, res: Response) => {
  try {
    await NotificationModel.updateMany({}, { read: true });
    res.json({ message: 'Todas as notificações marcadas como lidas.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- USERS ----------------
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
