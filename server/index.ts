import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, seedDatabase } from './db.js';
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
} from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health & Status
app.get('/api/health', async (_req: Request, res: Response) => {
  const isConnected = ProjectModel.db.readyState === 1;
  res.json({
    status: isConnected ? 'online' : 'connecting',
    database: 'MongoDB Atlas',
    cluster: 'cluster0.oe0akin.mongodb.net',
    dbName: 'edmprojectmanagementdb',
  });
});

// Reseed Endpoint
app.post('/api/seed', async (_req: Request, res: Response) => {
  const success = await seedDatabase(true);
  if (success) {
    res.json({ message: 'Dados de demonstração repostos com sucesso no MongoDB Atlas.' });
  } else {
    res.status(500).json({ error: 'Falha ao repor dados.' });
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

app.put('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const updated = await ProjectModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, lastUpdated: new Date().toISOString().split('T')[0] },
      { new: true }
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
    // Cascade delete related entities
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
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const id = req.body.id || `TSK-${Date.now().toString().slice(-4)}`;
    const newTask = new TaskModel({ ...req.body, id });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const updated = await TaskModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    await TaskModel.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Tarefa eliminada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- RISKS ----------------
app.get('/api/risks', async (_req: Request, res: Response) => {
  try {
    const risks = await RiskModel.find().sort({ createdAt: -1 });
    res.json(risks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/risks', async (req: Request, res: Response) => {
  try {
    const id = req.body.id || `RSK-${Date.now().toString().slice(-3)}`;
    const newRisk = new RiskModel({ ...req.body, id });
    await newRisk.save();
    res.status(201).json(newRisk);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/risks/:id', async (req: Request, res: Response) => {
  try {
    const updated = await RiskModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/risks/:id', async (req: Request, res: Response) => {
  try {
    await RiskModel.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Risco eliminado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- EXPENSES ----------------
app.get('/api/expenses', async (_req: Request, res: Response) => {
  try {
    const expenses = await ExpenseModel.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req: Request, res: Response) => {
  try {
    const id = req.body.id || `EXP-${Date.now().toString().slice(-4)}`;
    const newExpense = new ExpenseModel({ ...req.body, id });
    await newExpense.save();

    // Increment project spentBudget
    await ProjectModel.findOneAndUpdate(
      { id: req.body.projectId },
      { $inc: { spentBudget: req.body.amount } }
    );

    res.status(201).json(newExpense);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
  try {
    const exp = await ExpenseModel.findOneAndDelete({ id: req.params.id });
    if (exp) {
      await ProjectModel.findOneAndUpdate(
        { id: exp.projectId },
        { $inc: { spentBudget: -exp.amount } }
      );
    }
    res.json({ message: 'Despesa eliminada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- MILESTONES ----------------
app.get('/api/milestones', async (_req: Request, res: Response) => {
  try {
    const milestones = await MilestoneModel.find().sort({ plannedDate: 1 });
    res.json(milestones);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/milestones', async (req: Request, res: Response) => {
  try {
    const id = req.body.id || `MLS-${Date.now().toString().slice(-3)}`;
    const newMilestone = new MilestoneModel({ ...req.body, id });
    await newMilestone.save();
    res.status(201).json(newMilestone);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/milestones/:id', async (req: Request, res: Response) => {
  try {
    const updated = await MilestoneModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/milestones/:id', async (req: Request, res: Response) => {
  try {
    await MilestoneModel.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Marco eliminado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- DOCUMENTS ----------------
app.get('/api/documents', async (_req: Request, res: Response) => {
  try {
    const docs = await DocumentModel.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', async (req: Request, res: Response) => {
  try {
    const id = req.body.id || `DOC-${Date.now().toString().slice(-3)}`;
    const newDoc = new DocumentModel({ ...req.body, id });
    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', async (req: Request, res: Response) => {
  try {
    await DocumentModel.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Documento eliminado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- AUDIT LOGS ----------------
app.get('/api/audit-logs', async (_req: Request, res: Response) => {
  try {
    const logs = await AuditLogModel.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const id = req.body.id || `LOG-${Date.now()}`;
    const newLog = new AuditLogModel({ ...req.body, id });
    await newLog.save();
    res.status(201).json(newLog);
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
      { new: true }
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', async (_req: Request, res: Response) => {
  try {
    await NotificationModel.updateMany({}, { read: true });
    res.json({ message: 'Todas as notificações marcadas como lidas' });
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

// Start Server & Connect MongoDB
app.listen(PORT, async () => {
  console.log(`🚀 Servidor EDM API em execução na porta ${PORT}`);
  await connectDB();
});
