import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Project,
  Task,
  Risk,
  ExpenseRecord,
  Milestone,
  ProjectDocument,
  AuditLog,
  User,
  AppNotification,
  UserRole,
  GenerationPlant,
  ApprovalRequest,
  ApprovalStatus,
} from '../types';
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
  INITIAL_APPROVALS,
} from '../data/initialData';
import { INITIAL_GENERATION_PLANTS } from '../data/generationData';

interface AppContextType {
  projects: Project[];
  generationPlants: GenerationPlant[];
  approvalRequests: ApprovalRequest[];
  decideApprovalRequest: (id: string, decision: ApprovalStatus, notes?: string) => void;
  updateGenerationPlant: (plant: GenerationPlant) => void;
  tasks: Task[];
  risks: Risk[];
  expenses: ExpenseRecord[];
  milestones: Milestone[];
  documents: ProjectDocument[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isMongoConnected: boolean;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  // AI Copilot
  isAiCopilotOpen: boolean;
  aiCopilotInitialPrompt?: string;
  openAiCopilot: (initialPrompt?: string) => void;
  closeAiCopilot: () => void;

  // Filters & Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRegion: string;
  setFilterRegion: (region: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterManager: string;
  setFilterManager: (manager: string) => void;
  clearFilters: () => void;

  // CRUD Actions
  addProject: (p: Omit<Project, 'id' | 'lastUpdated'>) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => boolean;

  addTask: (t: Omit<Task, 'id'>) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;

  addRisk: (r: Omit<Risk, 'id'>) => void;
  updateRisk: (r: Risk) => void;
  deleteRisk: (id: string) => void;

  addExpense: (e: Omit<ExpenseRecord, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addMilestone: (m: Omit<Milestone, 'id'>) => void;
  updateMilestone: (m: Milestone) => void;
  deleteMilestone: (id: string) => void;

  addDocument: (d: Omit<ProjectDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToInitialData: () => Promise<void>;

  // Permission checks
  canEditProject: (project?: Project) => boolean;
  canManageBudget: () => boolean;
  canDelete: () => boolean;
  isReadOnly: boolean;
}

const STORAGE_KEY = 'edm_project_management_v1';
const AUTH_STORAGE_KEY = 'edm_auth_session';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isMongoConnected, setIsMongoConnected] = useState(false);

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [risks, setRisks] = useState<Risk[]>(INITIAL_RISKS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [documents, setDocuments] = useState<ProjectDocument[]>(INITIAL_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      return !!savedAuth;
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return INITIAL_USERS[0]; // Eng. António Nhassego (Director)
  });

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  };

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Por favor, introduza o correio institucional do Director.' };
    }

    // Access strictly restricted to Director
    const directorUser = users.find(u => u.role === 'Director') || INITIAL_USERS[0];
    if (cleanEmail === directorUser.email.toLowerCase() || cleanEmail === 'antonio.nhassego@edm.co.mz') {
      setCurrentUser(directorUser);
      setIsAuthenticated(true);
      return { success: true };
    }

    return {
      success: false,
      message: 'De momento, o acesso ao portal está restrito exclusivamente ao perfil do Director (Eng. António Nhassego - antonio.nhassego@edm.co.mz).',
    };
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
  };

  const APPROVALS_STORAGE_KEY = 'edm_approvals_v1';

  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(APPROVALS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_APPROVALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(approvalRequests));
    } catch {}
  }, [approvalRequests]);

  const [generationPlants, setGenerationPlants] = useState<GenerationPlant[]>(INITIAL_GENERATION_PLANTS);

  const updateGenerationPlant = (updated: GenerationPlant) => {
    setGenerationPlants(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // AI Copilot State
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState<boolean>(false);
  const [aiCopilotInitialPrompt, setAiCopilotInitialPrompt] = useState<string | undefined>(undefined);

  const openAiCopilot = (initialPrompt?: string) => {
    setAiCopilotInitialPrompt(initialPrompt);
    setIsAiCopilotOpen(true);
  };

  const closeAiCopilot = () => {
    setIsAiCopilotOpen(false);
    setAiCopilotInitialPrompt(undefined);
  };

  // Global filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterManager, setFilterManager] = useState('Todos');

  // Load state on mount from MongoDB Atlas API, with local fallback
  useEffect(() => {
    async function fetchFromAtlas() {
      try {
        const [healthRes, projRes, taskRes, riskRes, expRes, mlsRes, docRes, logRes, notifRes, userRes] =
          await Promise.all([
            fetch('/api/health').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/projects').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/tasks').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/risks').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/expenses').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/milestones').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/documents').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/audit-logs').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/notifications').then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch('/api/users').then(r => (r.ok ? r.json() : null)).catch(() => null),
          ]);

        if (healthRes?.status === 'online') {
          setIsMongoConnected(true);
        }

        if (projRes && projRes.length > 0) {
          setProjects(projRes);
          setIsMongoConnected(true);
        }
        if (taskRes && taskRes.length > 0) setTasks(taskRes);
        if (riskRes && riskRes.length > 0) setRisks(riskRes);
        if (expRes && expRes.length > 0) setExpenses(expRes);
        if (mlsRes && mlsRes.length > 0) setMilestones(mlsRes);
        if (docRes && docRes.length > 0) setDocuments(docRes);
        if (logRes && logRes.length > 0) setAuditLogs(logRes);
        if (notifRes && notifRes.length > 0) setNotifications(notifRes);
        if (userRes && userRes.length > 0) setUsers(userRes);
      } catch (e) {
        console.warn('API error, relying on local state:', e);
      } finally {
        setDataLoaded(true);
      }
    }

    fetchFromAtlas();
  }, []);

  // Sync to localStorage as redundancy
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          projects,
          tasks,
          risks,
          expenses,
          milestones,
          documents,
          auditLogs,
          notifications,
          currentUserId: currentUser.id,
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [projects, tasks, risks, expenses, milestones, documents, auditLogs, notifications, currentUser, dataLoaded]);

  // Permissions
  const isReadOnly = currentUser.role === 'Utilizador de consulta';

  const canEditProject = (project?: Project) => {
    if (isReadOnly) return false;
    if (currentUser.role === 'Administrador' || currentUser.role === 'Director') return true;
    if (currentUser.role === 'Gestor de projectos') {
      if (!project) return true;
      return project.manager.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[1] || '');
    }
    return false;
  };

  const canManageBudget = () => {
    return currentUser.role === 'Administrador' || currentUser.role === 'Director';
  };

  const canDelete = () => {
    return currentUser.role === 'Administrador';
  };

  const logAudit = async (
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    entityId: string,
    entityName: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      entityName,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Send to MongoDB Atlas API
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(err => console.error('MongoDB Atlas AuditLog save error:', err));
  };

  // CRUD for Projects with MongoDB Atlas API
  const addProject = async (pData: Omit<Project, 'id' | 'lastUpdated'>) => {
    const newId = `PRJ-${String(projects.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const newProj: Project = {
      ...pData,
      id: newId,
      lastUpdated: today,
    };
    setProjects(prev => [newProj, ...prev]);

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj),
    }).catch(err => console.error('MongoDB Atlas Project save error:', err));

    logAudit('Criação', 'Projecto', newId, newProj.name, `Projecto criado com código ${newProj.code}.`);
  };

  const updateProject = async (updated: Project) => {
    const today = new Date().toISOString().split('T')[0];
    const withDate = { ...updated, lastUpdated: today };
    setProjects(prev => prev.map(p => (p.id === updated.id ? withDate : p)));

    fetch(`/api/projects/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withDate),
    }).catch(err => console.error('MongoDB Atlas Project update error:', err));

    logAudit('Edição', 'Projecto', updated.id, updated.name, 'Dados gerais do projecto actualizados.');
  };

  const deleteProject = (id: string): boolean => {
    const target = projects.find(p => p.id === id);
    if (!target) return false;
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setRisks(prev => prev.filter(r => r.projectId !== id));
    setExpenses(prev => prev.filter(e => e.projectId !== id));
    setMilestones(prev => prev.filter(m => m.projectId !== id));
    setDocuments(prev => prev.filter(d => d.projectId !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);

    fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('MongoDB Atlas Project delete error:', err));

    logAudit('Eliminação', 'Projecto', id, target.name, 'Projecto e entidades dependentes removidas.');
    return true;
  };

  // CRUD for Tasks with MongoDB Atlas API
  const addTask = async (tData: Omit<Task, 'id'>) => {
    const newId = `TSK-${Date.now().toString().slice(-4)}`;
    const newTask: Task = { ...tData, id: newId };
    setTasks(prev => [newTask, ...prev]);

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    }).catch(err => console.error('MongoDB Atlas Task save error:', err));

    logAudit('Criação', 'Tarefa', newId, newTask.title, `Tarefa associada ao projecto ${newTask.projectId}.`);
  };

  const updateTask = async (updated: Task) => {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));

    fetch(`/api/tasks/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('MongoDB Atlas Task update error:', err));

    logAudit('Edição', 'Tarefa', updated.id, updated.title, `Estado: ${updated.status}, Progresso: ${updated.progressPercent}%.`);
  };

  const deleteTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));

    fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('MongoDB Atlas Task delete error:', err));

    if (target) {
      logAudit('Eliminação', 'Tarefa', id, target.title, 'Tarefa removida.');
    }
  };

  // CRUD for Risks with MongoDB Atlas API
  const addRisk = async (rData: Omit<Risk, 'id'>) => {
    const newId = `RSK-${Date.now().toString().slice(-3)}`;
    const newRisk: Risk = { ...rData, id: newId };
    setRisks(prev => [newRisk, ...prev]);

    fetch('/api/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRisk),
    }).catch(err => console.error('MongoDB Atlas Risk save error:', err));

    logAudit('Criação', 'Risco', newId, newRisk.title, `Risco nível ${newRisk.level} registado.`);
  };

  const updateRisk = async (updated: Risk) => {
    setRisks(prev => prev.map(r => (r.id === updated.id ? updated : r)));

    fetch(`/api/risks/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('MongoDB Atlas Risk update error:', err));

    logAudit('Actualização de Risco', 'Risco', updated.id, updated.title, `Nível: ${updated.level}, Estado: ${updated.status}.`);
  };

  const deleteRisk = async (id: string) => {
    const target = risks.find(r => r.id === id);
    setRisks(prev => prev.filter(r => r.id !== id));

    fetch(`/api/risks/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('MongoDB Atlas Risk delete error:', err));

    if (target) {
      logAudit('Eliminação', 'Risco', id, target.title, 'Risco removido da matriz.');
    }
  };

  // Expenses with MongoDB Atlas API
  const addExpense = async (eData: Omit<ExpenseRecord, 'id'>) => {
    const newId = `EXP-${Date.now().toString().slice(-4)}`;
    const newExp: ExpenseRecord = { ...eData, id: newId };
    setExpenses(prev => [newExp, ...prev]);

    // Update local project spentBudget
    setProjects(prev =>
      prev.map(p => {
        if (p.id === eData.projectId) {
          const newSpent = p.spentBudget + eData.amount;
          return { ...p, spentBudget: newSpent, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return p;
      })
    );

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExp),
    }).catch(err => console.error('MongoDB Atlas Expense save error:', err));

    logAudit(
      'Actualização Financeira',
      'Despesa',
      newId,
      newExp.description,
      `Despesa no valor de ${newExp.amount.toLocaleString()} MZN adicionada.`
    );
  };

  const deleteExpense = async (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    setProjects(prev =>
      prev.map(p => {
        if (p.id === exp.projectId) {
          const newSpent = Math.max(0, p.spentBudget - exp.amount);
          return { ...p, spentBudget: newSpent };
        }
        return p;
      })
    );

    fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('MongoDB Atlas Expense delete error:', err));

    logAudit('Eliminação', 'Despesa', id, exp.description, 'Registo de despesa cancelado.');
  };

  // Milestones with MongoDB Atlas API
  const addMilestone = async (mData: Omit<Milestone, 'id'>) => {
    const newId = `MLS-${Date.now().toString().slice(-3)}`;
    const newMls: Milestone = { ...mData, id: newId };
    setMilestones(prev => [...prev, newMls]);

    fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMls),
    }).catch(err => console.error('MongoDB Atlas Milestone save error:', err));
  };

  const updateMilestone = async (m: Milestone) => {
    setMilestones(prev => prev.map(item => (item.id === m.id ? m : item)));

    fetch(`/api/milestones/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    }).catch(err => console.error('MongoDB Atlas Milestone update error:', err));
  };

  const deleteMilestone = async (id: string) => {
    setMilestones(prev => prev.filter(item => item.id !== id));

    fetch(`/api/milestones/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('MongoDB Atlas Milestone delete error:', err));
  };

  // Documents with MongoDB Atlas API
  const addDocument = async (dData: Omit<ProjectDocument, 'id'>) => {
    const newId = `DOC-${Date.now().toString().slice(-3)}`;
    const newDoc: ProjectDocument = { ...dData, id: newId };
    setDocuments(prev => [newDoc, ...prev]);

    fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc),
    }).catch(err => console.error('MongoDB Atlas Document save error:', err));

    logAudit('Criação', 'Documento', newId, newDoc.title, `Documento (${newDoc.category}) arquivado.`);
  };

  const deleteDocument = async (id: string) => {
    const d = documents.find(item => item.id === id);
    setDocuments(prev => prev.filter(item => item.id !== id));

    fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('MongoDB Atlas Document delete error:', err));

    if (d) {
      logAudit('Eliminação', 'Documento', id, d.title, 'Documento removido.');
    }
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    fetch(`/api/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch('/api/notifications/read-all', { method: 'PUT' }).catch(() => {});
  };

  const resetToInitialData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
    } catch (e) {
      console.warn('API reset failed, resetting local memory:', e);
    }
    localStorage.removeItem(STORAGE_KEY);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setRisks(INITIAL_RISKS);
    setExpenses(INITIAL_EXPENSES);
    setMilestones(INITIAL_MILESTONES);
    setDocuments(INITIAL_DOCUMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    setSelectedProjectId(null);
  };

  const decideApprovalRequest = (id: string, decision: ApprovalStatus, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    let matched: ApprovalRequest | undefined;

    setApprovalRequests(prev =>
      prev.map(r => {
        if (r.id === id) {
          matched = {
            ...r,
            status: decision,
            directorNotes: notes,
            decidedAt: today,
          };
          return matched;
        }
        return r;
      })
    );

    if (matched) {
      logAudit(
        'Edição',
        'Projecto',
        matched.projectId,
        matched.projectName,
        `Despacho Executivo [${decision.toUpperCase()}]: ${matched.title}. Parecer do Director: ${notes || 'Sem observações adicionais.'}`
      );

      // Reflect in project metrics
      if (decision === 'Aprovado') {
        if (matched.physicalProgressClaimed !== undefined) {
          setProjects(prev =>
            prev.map(p =>
              p.id === matched!.projectId
                ? { ...p, physicalProgress: matched!.physicalProgressClaimed!, lastUpdated: today }
                : p
            )
          );
        }
        if (matched.amount !== undefined && matched.type === 'Despesa Orçamental') {
          setProjects(prev =>
            prev.map(p =>
              p.id === matched!.projectId
                ? { ...p, spentBudget: p.spentBudget + matched!.amount!, lastUpdated: today }
                : p
            )
          );
        }
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRegion('Todas');
    setFilterStatus('Todos');
    setFilterCategory('Todas');
    setFilterManager('Todos');
  };

  const value = useMemo(
    () => ({
      projects,
      generationPlants,
      updateGenerationPlant,
      approvalRequests,
      decideApprovalRequest,
      tasks,
      risks,
      expenses,
      milestones,
      documents,
      auditLogs,
      notifications,
      users,
      currentUser,
      setCurrentUser,
      isAuthenticated,
      login,
      logout,
      isMongoConnected,
      activeTab,
      setActiveTab,
      selectedProjectId,
      setSelectedProjectId,
      isAiCopilotOpen,
      aiCopilotInitialPrompt,
      openAiCopilot,
      closeAiCopilot,
      searchQuery,
      setSearchQuery,
      filterRegion,
      setFilterRegion,
      filterStatus,
      setFilterStatus,
      filterCategory,
      setFilterCategory,
      filterManager,
      setFilterManager,
      clearFilters,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      addRisk,
      updateRisk,
      deleteRisk,
      addExpense,
      deleteExpense,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addDocument,
      deleteDocument,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      resetToInitialData,
      canEditProject,
      canManageBudget,
      canDelete,
      isReadOnly,
    }),
    [
      projects,
      approvalRequests,
      tasks,
      risks,
      expenses,
      milestones,
      documents,
      auditLogs,
      notifications,
      users,
      currentUser,
      isAuthenticated,
      isMongoConnected,
      activeTab,
      selectedProjectId,
      isAiCopilotOpen,
      aiCopilotInitialPrompt,
      searchQuery,
      filterRegion,
      filterStatus,
      filterCategory,
      filterManager,
      isReadOnly,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
