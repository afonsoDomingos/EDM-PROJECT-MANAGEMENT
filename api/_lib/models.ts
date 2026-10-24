import mongoose, { Schema } from 'mongoose';

// Project Schema
const ProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    region: { type: String, required: true },
    province: { type: String, required: true },
    locality: { type: String, default: '' },
    manager: { type: String, required: true },
    department: { type: String, required: true },
    startDate: { type: String, required: true },
    expectedEndDate: { type: String, required: true },
    actualEndDate: { type: String },
    status: { type: String, required: true, default: 'Por Iniciar' },
    priority: { type: String, required: true, default: 'Média' },
    physicalProgress: { type: Number, default: 0 },
    approvedBudget: { type: Number, default: 0 },
    revisedBudget: { type: Number, default: 0 },
    spentBudget: { type: Number, default: 0 },
    commitments: { type: Number, default: 0 },
    fundingSource: { type: String, default: '' },
    risksNotes: { type: String, default: '' },
    observations: { type: String, default: '' },
    lastUpdated: { type: String, default: () => new Date().toISOString().split('T')[0] },
    lat: { type: Number },
    lng: { type: Number },
  },
  { timestamps: true }
);

// Task Schema
const TaskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignee: { type: String, required: true },
    startDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    priority: { type: String, default: 'Média' },
    status: { type: String, default: 'Por Iniciar' },
    progressPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Risk Schema
const RiskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    probability: { type: Number, required: true, default: 3 },
    impact: { type: Number, required: true, default: 3 },
    riskScore: { type: Number, default: 9 },
    level: { type: String, default: 'Médio' },
    assignee: { type: String, required: true },
    mitigationPlan: { type: String, default: '' },
    resolutionDeadline: { type: String },
    status: { type: String, default: 'Identificado' },
    identifiedIssues: { type: String, default: '' },
    correctiveActions: { type: String, default: '' },
  },
  { timestamps: true }
);

// Expense Schema
const ExpenseSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    supplier: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    invoiceNumber: { type: String },
    approvedBy: { type: String, required: true },
    category: { type: String, default: 'Equipamento' },
  },
  { timestamps: true }
);

// Milestone Schema
const MilestoneSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    plannedDate: { type: String, required: true },
    actualDate: { type: String },
    status: { type: String, default: 'Pendente' },
    weightPercent: { type: Number, default: 10 },
  },
  { timestamps: true }
);

// Document Schema
const DocumentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, default: 'PDF' },
    fileSize: { type: String, default: '2.0 MB' },
    uploadDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    uploadedBy: { type: String, default: 'EDM' },
    category: { type: String, default: 'Relatório Técnico' },
  },
  { timestamps: true }
);

// AuditLog Schema
const AuditLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    timestamp: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    entityName: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

// Notification Schema
const NotificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, default: 'info' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    projectId: { type: String },
    timestamp: { type: String, default: 'Agora' },
    read: { type: Boolean, default: false },
    category: { type: String, default: 'Auditoria' },
  },
  { timestamps: true }
);

// User Schema
const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

// Use cached models to avoid re-compilation in serverless
export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const RiskModel = mongoose.models.Risk || mongoose.model('Risk', RiskSchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
export const MilestoneModel = mongoose.models.Milestone || mongoose.model('Milestone', MilestoneSchema);
export const DocumentModel = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
