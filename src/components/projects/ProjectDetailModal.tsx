import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  PlusCircle,
  Upload,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatCompactMZN,
  formatDatePt,
  formatPercent,
  calculateFinancialExecution,
} from '../../utils/formatters';
import { Task, Risk, ExpenseRecord, Milestone, ProjectDocument } from '../../types';

interface ProjectDetailModalProps {
  onClose: () => void;
  onEdit: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ onClose, onEdit }) => {
  const {
    projects,
    selectedProjectId,
    tasks,
    risks,
    expenses,
    milestones,
    documents,
    auditLogs,
    canEditProject,
    canDelete,
    deleteProject,
    addTask,
    addRisk,
    addExpense,
    addMilestone,
    addDocument,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'schedule' | 'financial' | 'risks' | 'documents' | 'history'
  >('overview');

  // Mini-modals/states inside tabs
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // New expense form state
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmount, setNewExpAmount] = useState<number>(0);
  const [newExpSupplier, setNewExpSupplier] = useState('');

  // New risk form state
  const [newRiskTitle, setNewRiskTitle] = useState('');
  const [newRiskCat, setNewRiskCat] = useState<'Técnico' | 'Financeiro' | 'Operacional' | 'Logístico' | 'Ambiental' | 'Contratual'>('Técnico');
  const [newRiskProb, setNewRiskProb] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newRiskImp, setNewRiskImp] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newRiskMitigation, setNewRiskMitigation] = useState('');

  // New doc form state
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCat, setNewDocCat] = useState<'Contrato' | 'Projecto Executivo' | 'Relatório Técnico' | 'Licença Ambiental' | 'Auto de Medição'>('Relatório Técnico');

  const project = projects.find(p => p.id === selectedProjectId);
  if (!project) return null;

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectRisks = risks.filter(r => r.projectId === project.id);
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const projectMilestones = milestones.filter(m => m.projectId === project.id);
  const projectDocs = documents.filter(d => d.projectId === project.id);
  const projectLogs = auditLogs.filter(l => l.entityId === project.id || projectTasks.some(t => t.id === l.entityId));

  const financialExecution = calculateFinancialExecution(project.spentBudget, project.revisedBudget);
  const balance = Math.max(0, project.revisedBudget - project.spentBudget);
  const isBudgetExceeded = project.spentBudget > project.revisedBudget;
  const variance = financialExecution - project.physicalProgress;

  // Handlers for adding items
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      projectId: project.id,
      title: newTaskTitle,
      description: 'Tarefa criada via painel de projecto.',
      assignee: newTaskAssignee || project.manager,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newTaskDueDate || project.expectedEndDate,
      priority: 'Alta',
      status: 'Por Iniciar',
      progressPercent: 0,
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesc.trim() || newExpAmount <= 0) return;
    addExpense({
      projectId: project.id,
      date: new Date().toISOString().split('T')[0],
      description: newExpDesc,
      supplier: newExpSupplier || 'Fornecedor Credenciado',
      amount: newExpAmount,
      invoiceNumber: `FAT-${Math.floor(1000 + Math.random() * 9000)}`,
      approvedBy: project.manager,
      category: 'Obras Civis',
    });
    setNewExpDesc('');
    setNewExpAmount(0);
    setShowAddExpense(false);
  };

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiskTitle.trim()) return;
    const score = newRiskProb * newRiskImp;
    let level: 'Baixo' | 'Médio' | 'Alto' | 'Crítico' = 'Baixo';
    if (score >= 16) level = 'Crítico';
    else if (score >= 10) level = 'Alto';
    else if (score >= 5) level = 'Médio';

    addRisk({
      projectId: project.id,
      title: newRiskTitle,
      category: newRiskCat,
      probability: newRiskProb,
      impact: newRiskImp,
      riskScore: score,
      level,
      assignee: project.manager,
      mitigationPlan: newRiskMitigation || 'Em análise técnica preliminar.',
      resolutionDeadline: project.expectedEndDate,
      status: 'Identificado',
    });
    setNewRiskTitle('');
    setNewRiskMitigation('');
    setShowAddRisk(false);
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    addDocument({
      projectId: project.id,
      title: newDocTitle,
      type: 'PDF',
      fileSize: '2.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: project.manager,
      category: newDocCat,
    });
    setNewDocTitle('');
    setShowAddDoc(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header of the Modal */}
        <div className="p-6 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-500 text-white">
                {project.code}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200 font-semibold">
                {project.category}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200 font-semibold">
                {project.region} • {project.province}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  project.status === 'Concluído'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : project.status === 'Em Risco'
                    ? 'bg-rose-500/20 text-rose-300'
                    : project.status === 'Atrasado'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-orange-500/20 text-orange-300'
                }`}
              >
                {project.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Gestor: <strong>{project.manager}</strong> ({project.department})</span>
              <span>•</span>
              <span>Actualizado a {formatDatePt(project.lastUpdated)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canEditProject(project) && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </button>
            )}
            {canDelete() && (
              <button
                onClick={() => {
                  if (window.confirm(`Tem a certeza que deseja eliminar o projecto "${project.name}"?`)) {
                    deleteProject(project.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'tasks', label: `Actividades (${projectTasks.length})` },
            { id: 'schedule', label: `Cronograma & Gantt` },
            { id: 'financial', label: 'Financeiro' },
            { id: 'risks', label: `Riscos (${projectRisks.length})` },
            { id: 'documents', label: `Documentos (${projectDocs.length})` },
            { id: 'history', label: 'Histórico & Auditoria' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-[#F7942D] text-[#c26508]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <span className="text-[11px] font-bold text-orange-800 uppercase">
                    Execução Física
                  </span>
                  <p className="text-2xl font-black text-[#c26508] mt-1 font-mono">
                    {project.physicalProgress}%
                  </p>
                  <div className="w-full bg-orange-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#F7942D] h-full rounded-full"
                      style={{ width: `${project.physicalProgress}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-800 uppercase">
                    Execução Financeira
                  </span>
                  <p className="text-2xl font-black text-blue-700 mt-1 font-mono">
                    {formatPercent(financialExecution)}
                  </p>
                  <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(financialExecution, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">
                    Orçamento Revisto
                  </span>
                  <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                    {formatCompactMZN(project.revisedBudget)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Aprovado: {formatCompactMZN(project.approvedBudget)}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">
                    Saldo Disponível
                  </span>
                  <p className="text-lg font-bold text-emerald-700 mt-1 font-mono">
                    {formatCompactMZN(balance)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gasto: {formatCompactMZN(project.spentBudget)}
                  </p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Detalhes do Âmbito
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Fonte Financiamento</span>
                      <span className="font-semibold text-slate-900">{project.fundingSource || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tipo Financiamento</span>
                      <span className="font-semibold text-slate-900">{project.financingType || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Modalidade</span>
                      <span className="font-semibold text-slate-900">{project.modality || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Fase do Projecto</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                        {project.phase || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Localidade</span>
                      <span className="font-semibold text-slate-900">{project.locality || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Conclusão Prevista</span>
                      <span className="font-semibold text-slate-900">{formatDatePt(project.expectedEndDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Observações, Constrangimentos e Riscos
                  </h4>
                  {project.constraints && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                      <div>
                        <strong>Constrangimentos Identificados:</strong>
                        <p className="mt-0.5 leading-relaxed">{project.constraints}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong>Notas de Risco:</strong>
                      <p className="mt-0.5">{project.risksNotes || 'Nenhum risco crítico impeditivo registado no momento.'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Observações da Direcção:</span>
                    <p className="text-xs text-slate-700 mt-1">{project.observations || 'Trabalhos a decorrer em conformidade com o plano oficial.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ACTIVIDADES / TAREFAS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    Actividades Operacionais
                  </h4>
                  <p className="text-xs text-slate-500">
                    Acompanhamento do progresso de tarefas de engenharia e montagem
                  </p>
                </div>
                {canEditProject(project) && (
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Adicionar Tarefa
                  </button>
                )}
              </div>

              {/* Add Task Modal Sub-dialog */}
              {showAddTask && (
                <form
                  onSubmit={handleCreateTask}
                  className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3 animate-in fade-in duration-150"
                >
                  <p className="text-xs font-bold text-orange-900 uppercase">
                    Nova Tarefa do Projecto
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Título da tarefa..."
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={e => setNewTaskDueDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-[#F7942D] text-white rounded-lg hover:bg-[#e07d17]"
                    >
                      Gravar Tarefa
                    </button>
                  </div>
                </form>
              )}

              {/* Task List */}
              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {projectTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Nenhuma tarefa registada para este projecto.
                  </div>
                ) : (
                  projectTasks.map(t => (
                    <div key={t.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                            {t.id}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">{t.title}</h5>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.status === 'Concluída'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'Atrasada'
                                ? 'bg-rose-100 text-rose-800'
                                : t.status === 'Bloqueada'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Responsável: {t.assignee} • Prazo: {formatDatePt(t.dueDate)} • Prioridade: {t.priority}
                        </p>
                      </div>

                      <div className="w-28 text-right">
                        <span className="text-xs font-bold font-mono text-slate-800">
                          {t.progressPercent}%
                        </span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-[#F7942D] h-full rounded-full"
                            style={{ width: `${t.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. CRONOGRAMA & GANTT */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-heading">
                  Linha do Tempo & Marcos Contratuais (Gantt)
                </h4>
                <p className="text-xs text-slate-500">
                  Acompanhamento de prazos planeados versus reais e identificação automática de desvios
                </p>
              </div>

              {/* Visual Gantt-style Timeline */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span>Início: <strong>{formatDatePt(project.startDate)}</strong></span>
                  <span>Conclusão Prevista: <strong>{formatDatePt(project.expectedEndDate)}</strong></span>
                </div>

                <div className="space-y-3">
                  {projectMilestones.map(m => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${m.status === 'Atingido' ? 'text-emerald-600' : 'text-[#F7942D]'}`} />
                          <span className="text-xs font-bold text-slate-900">{m.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                            Peso: {m.weightPercent}%
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === 'Atingido'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'Atrasado'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      {/* Milestone timeline bar */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Data Planeada: {formatDatePt(m.plannedDate)}</span>
                        {m.actualDate && (
                          <span className="text-emerald-700 font-semibold">
                            Efectuado em: {formatDatePt(m.actualDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. FINANCEIRO */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    Execução Orçamental & Histórico de Despesas
                  </h4>
                  <p className="text-xs text-slate-500">
                    Controlo de dotações orçamentais, compromissos e faturas liquidadas
                  </p>
                </div>
                {canEditProject(project) && (
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Registar Despesa
                  </button>
                )}
              </div>

              {/* Add Expense Form Sub-dialog */}
              {showAddExpense && (
                <form
                  onSubmit={handleCreateExpense}
                  className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3 animate-in fade-in duration-150"
                >
                  <p className="text-xs font-bold text-orange-900 uppercase">
                    Registo de Despesa / Auto de Medição
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Descrição da despesa..."
                      value={newExpDesc}
                      onChange={e => setNewExpDesc(e.target.value)}
                      className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Valor em Meticais (MZN)..."
                      value={newExpAmount || ''}
                      onChange={e => setNewExpAmount(Number(e.target.value))}
                      className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Fornecedor / Empreiteiro..."
                      value={newExpSupplier}
                      onChange={e => setNewExpSupplier(e.target.value)}
                      className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddExpense(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-[#F7942D] text-white rounded-lg hover:bg-[#e07d17]"
                    >
                      Gravar Despesa
                    </button>
                  </div>
                </form>
              )}

              {/* Financial Balance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Orçamento Revisto</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatCurrency(project.revisedBudget)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Despesas Acumuladas</span>
                  <p className="text-lg font-bold text-blue-700 mt-0.5">
                    {formatCurrency(project.spentBudget)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Saldo Disponível</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>

              {/* Expense Ledger Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Fornecedor</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3 text-right">Valor (MZN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {projectExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          Nenhuma despesa individual lançada.
                        </td>
                      </tr>
                    ) : (
                      projectExpenses.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-500">{formatDatePt(e.date)}</td>
                          <td className="p-3 font-semibold text-slate-900">{e.description}</td>
                          <td className="p-3 text-slate-600">{e.supplier}</td>
                          <td className="p-3 text-slate-500">{e.category}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(e.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. RISCOS */}
          {activeTab === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    Registo de Riscos do Projecto
                  </h4>
                  <p className="text-xs text-slate-500">
                    Matriz de probabilidade e impacto com plano de mitigação
                  </p>
                </div>
                {canEditProject(project) && (
                  <button
                    onClick={() => setShowAddRisk(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Registar Risco
                  </button>
                )}
              </div>

              {/* Add Risk Form Sub-dialog */}
              {showAddRisk && (
                <form
                  onSubmit={handleCreateRisk}
                  className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3 animate-in fade-in duration-150"
                >
                  <p className="text-xs font-bold text-orange-900 uppercase">
                    Novo Risco Identificado
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Título do risco..."
                        value={newRiskTitle}
                        onChange={e => setNewRiskTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <select
                        value={newRiskCat}
                        onChange={e => setNewRiskCat(e.target.value as any)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Técnico">Técnico</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Operacional">Operacional</option>
                        <option value="Logístico">Logístico</option>
                        <option value="Ambiental">Ambiental</option>
                        <option value="Contratual">Contratual</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Plano de mitigação..."
                        value={newRiskMitigation}
                        onChange={e => setNewRiskMitigation(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRisk(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-[#F7942D] text-white rounded-lg hover:bg-[#e07d17]"
                    >
                      Gravar Risco
                    </button>
                  </div>
                </form>
              )}

              {/* Risk Cards */}
              <div className="space-y-3">
                {projectRisks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Nenhum risco registado neste projecto.
                  </div>
                ) : (
                  projectRisks.map(r => (
                    <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              r.level === 'Crítico'
                                ? 'bg-rose-100 text-rose-800'
                                : r.level === 'Alto'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            Nível: {r.level} ({r.riskScore}/25)
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {r.category}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          Estado: {r.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">{r.title}</h5>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <strong>Mitigação:</strong> {r.mitigationPlan}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 6. DOCUMENTOS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    Documentos e Licenças Oficiais
                  </h4>
                  <p className="text-xs text-slate-500">
                    Projectos executivos, cadernos de encargos e relatórios de conformidade
                  </p>
                </div>
                {canEditProject(project) && (
                  <button
                    onClick={() => setShowAddDoc(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-sm transition"
                  >
                    <Upload className="w-4 h-4" />
                    Carregar Ficheiro
                  </button>
                )}
              </div>

              {/* Add Doc Form Sub-dialog */}
              {showAddDoc && (
                <form
                  onSubmit={handleCreateDoc}
                  className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3 animate-in fade-in duration-150"
                >
                  <p className="text-xs font-bold text-orange-900 uppercase">
                    Novo Documento
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nome do documento / licença..."
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <select
                      value={newDocCat}
                      onChange={e => setNewDocCat(e.target.value as any)}
                      className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Projecto Executivo">Projecto Executivo</option>
                      <option value="Contrato">Contrato</option>
                      <option value="Licença Ambiental">Licença Ambiental</option>
                      <option value="Auto de Medição">Auto de Medição</option>
                      <option value="Relatório Técnico">Relatório Técnico</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDoc(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-[#F7942D] text-white rounded-lg hover:bg-[#e07d17]"
                    >
                      Adicionar
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectDocs.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Nenhum documento arquivado neste projecto.
                  </div>
                ) : (
                  projectDocs.map(d => (
                    <div
                      key={d.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between hover:shadow-xs transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#c26508] flex items-center justify-center font-bold text-xs">
                          {d.type}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{d.title}</h5>
                          <p className="text-[11px] text-slate-500">
                            {d.category} • {d.fileSize} • {formatDatePt(d.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`A abrir visualizador simulado do documento "${d.title}"`)}
                        className="text-xs text-[#F7942D] hover:underline font-semibold"
                      >
                        Descarregar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 7. HISTÓRICO & AUDITORIA */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-heading">
                  Rastreabilidade e Trilha de Auditoria
                </h4>
                <p className="text-xs text-slate-500">
                  Registo cronológico imutável de todas as acções, edições e aprovações efectuadas
                </p>
              </div>

              <div className="space-y-3">
                {projectLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Nenhum registo de auditoria recente para este projecto.
                  </div>
                ) : (
                  projectLogs.map(l => (
                    <div key={l.id} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#F7942D] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {l.action}: {l.entityName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{l.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{l.details}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Executado por: <strong>{l.userName}</strong> ({l.userRole})
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
