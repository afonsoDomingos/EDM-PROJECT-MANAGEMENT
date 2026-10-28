import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  CheckSquare,
  Square,
  Plus,
  Edit2,
  Trash2,
  Zap,
  Wind,
  Sun,
  Flame,
  Ship,
  Search,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  RotateCcw,
  CheckCircle2,
  Clock,
  Table,
  AlertTriangle,
  Pencil,
  Save,
  Filter,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  INITIAL_GOVERNMENTAL_PROJECTS,
  GovernmentalProject,
  GovernmentalMilestone,
} from '../../data/governmentalProjectsData';
import { GovernmentalProjectsTableView } from './GovernmentalProjectsTableView';
import { GovernmentalReportModal } from './GovernmentalReportModal';
import {
  calculateDaysRemaining,
  formatDaysSinceCompletion,
  getProjectDelayStatus,
  checkMilestoneExceedsProject,
  getProjectScheduleConflicts,
} from '../../utils/formatters';

const STORAGE_KEY = 'edm_governmental_projects_v3';

export const GovernmentalProjectsView: React.FC = () => {
  const { openAiCopilot } = useApp();
  // View mode: 'table' (Official Presidential Matrix) vs 'cards' (Checklist Cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Load saved projects from localStorage or default to initial
  const [projects, setProjects] = useState<GovernmentalProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_GOVERNMENTAL_PROJECTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    'gov-eni-75mw': false,
    'gov-argelia-40mw': false,
    'gov-metoro-40mwp': false,
    'gov-namaacha-120mw': false,
    'gov-sligm-fsru': false,
  });

  // Reports Modal State (General & Individual)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetProject, setReportTargetProject] = useState<GovernmentalProject | null>(null);

  const handleOpenGeneralReport = () => {
    setReportTargetProject(null);
    setIsReportModalOpen(true);
  };

  const handleOpenProjectReport = (project: GovernmentalProject) => {
    setReportTargetProject(project);
    setIsReportModalOpen(true);
  };

  // Modal State for Add / Edit Project
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formTechnology, setFormTechnology] = useState<GovernmentalProject['technology']>('Gás / Térmica');
  const [formCapacity, setFormCapacity] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCOD, setFormCOD] = useState('');
  const [formStatus, setFormStatus] = useState<GovernmentalProject['status']>('Em Negociação');
  const [formSituation, setFormSituation] = useState('');
  const [formPriorityAction, setFormPriorityAction] = useState('');

  // Inline Add Milestone State
  const [addingMilestoneTo, setAddingMilestoneTo] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  // Inline Edit Milestone State
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingMilestoneText, setEditingMilestoneText] = useState('');
  const [editingMilestoneDate, setEditingMilestoneDate] = useState('');

  // Inline Edit Project COD State for Cards View
  const [editingCODProjectId, setEditingCODProjectId] = useState<string | null>(null);
  const [editingCODValue, setEditingCODValue] = useState('');

  // Filter States
  const [filterSchedule, setFilterSchedule] = useState<'all' | 'delayed' | 'conflicts' | 'ontrack' | 'completed' | 'inprogress'>('all');
  const [filterTechnology, setFilterTechnology] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterSchedule('all');
    setFilterTechnology('all');
    setFilterStatus('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || filterSchedule !== 'all' || filterTechnology !== 'all' || filterStatus !== 'all';

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Ignore
    }
  }, [projects]);

  // Expand / collapse single project
  const toggleExpand = (id: string) => {
    setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Modal de Confirmação Visual de Alteração de Status
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
    milestoneId: string;
    milestoneDescription: string;
    isCurrentlyCompleted: boolean;
    targetDate?: string;
    completionDateInput: string;
  } | null>(null);

  // Notificação Visual (Toast)
  const [toast, setToast] = useState<{
    id: string;
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `${Date.now()}`;
    setToast({ id, type, title, message });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 4500);
  };

  // Solicitar alteração de status da actividade (abre modal de confirmação visual)
  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const todayStr = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setConfirmStatusModal({
      isOpen: true,
      projectId,
      projectName: project.shortName || project.name,
      milestoneId,
      milestoneDescription: milestone.description,
      isCurrentlyCompleted: milestone.completed,
      targetDate: milestone.targetDate,
      completionDateInput: milestone.completedDate || todayStr,
    });
  };

  // Confirmar alteração de status pelo utilizador
  const handleConfirmStatusChange = () => {
    if (!confirmStatusModal) return;
    const { projectId, milestoneId, milestoneDescription, isCurrentlyCompleted, completionDateInput } = confirmStatusModal;
    const nextDone = !isCurrentlyCompleted;

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map(m => {
            if (m.id !== milestoneId) return m;
            return {
              ...m,
              completed: nextDone,
              completedDate: nextDone ? (completionDateInput.trim() || undefined) : undefined,
            };
          }),
        };
      })
    );

    setConfirmStatusModal(null);

    // Disparar notificação visual de sucesso
    if (nextDone) {
      showToast(
        'success',
        'Actividade Marcada como Concluída!',
        `A etapa "${milestoneDescription.slice(0, 50)}..." foi confirmada com sucesso (${completionDateInput}).`
      );
    } else {
      showToast(
        'info',
        'Actividade Reaberta',
        `A etapa "${milestoneDescription.slice(0, 50)}..." voltou ao estado pendente.`
      );
    }
  };

  // Add milestone to project
  const handleAddMilestone = (projectId: string) => {
    if (!newMilestoneText.trim()) return;
    const newM: GovernmentalMilestone = {
      id: `m-${Date.now()}`,
      description: newMilestoneText.trim(),
      completed: false,
      targetDate: newMilestoneDate.trim() || undefined,
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: [...p.milestones, newM],
        };
      })
    );

    setNewMilestoneText('');
    setNewMilestoneDate('');
    setAddingMilestoneTo(null);
  };

  // Delete milestone
  const handleDeleteMilestone = (projectId: string, milestoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.filter(m => m.id !== milestoneId),
        };
      })
    );
  };

  // Start editing a milestone inline
  const handleStartEditMilestone = (milestone: GovernmentalMilestone, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMilestoneId(milestone.id);
    setEditingMilestoneText(milestone.description);
    setEditingMilestoneDate(milestone.completed ? (milestone.completedDate || '') : (milestone.targetDate || ''));
  };

  // Save edited milestone
  const handleSaveEditMilestone = (projectId: string, milestoneId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editingMilestoneText.trim()) return;
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map(m => {
            if (m.id !== milestoneId) return m;
            return {
              ...m,
              description: editingMilestoneText.trim(),
              targetDate: !m.completed ? (editingMilestoneDate.trim() || undefined) : m.targetDate,
              completedDate: m.completed ? (editingMilestoneDate.trim() || m.completedDate) : m.completedDate,
            };
          }),
        };
      })
    );
    setEditingMilestoneId(null);
    setEditingMilestoneText('');
    setEditingMilestoneDate('');
  };

  // Cancel editing milestone
  const handleCancelEditMilestone = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMilestoneId(null);
    setEditingMilestoneText('');
    setEditingMilestoneDate('');
  };

  // Directly update project COD (Completion Date)
  const handleUpdateProjectCOD = (projectId: string, newCOD: string) => {
    const trimmedCOD = newCOD.trim();
    if (!trimmedCOD) return;
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          commercialOperationDate: trimmedCOD,
        };
      })
    );
    showToast(
      'success',
      'Prazo do Projecto Prolongado!',
      `A data final do projecto foi ajustada para "${trimmedCOD}" para acomodar o cronograma das actividades.`
    );
  };

  // Open modal to Create
  const handleOpenCreate = () => {
    setEditingProjectId(null);
    setFormName('');
    setFormCode(`GOV-0${projects.length + 1}`);
    setFormTechnology('Gás / Térmica');
    setFormCapacity('');
    setFormLocation('');
    setFormCOD('');
    setFormStatus('Em Negociação');
    setFormSituation('');
    setFormPriorityAction('');
    setIsProjectModalOpen(true);
  };

  // Open modal to Edit
  const handleOpenEdit = (project: GovernmentalProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setFormName(project.name);
    setFormCode(project.code);
    setFormTechnology(project.technology);
    setFormCapacity(project.capacity);
    setFormLocation(project.location);
    setFormCOD(project.commercialOperationDate);
    setFormStatus(project.status);
    setFormSituation(project.currentSituationSummary || '');
    setFormPriorityAction(project.priorityActionSummary || (project.priorityActions ? project.priorityActions.join(' ') : ''));
    setIsProjectModalOpen(true);
  };

  // Save Project (Create or Update)
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingProjectId) {
      // Update existing
      setProjects(prev =>
        prev.map(p => {
          if (p.id !== editingProjectId) return p;
          return {
            ...p,
            name: formName.trim(),
            code: formCode.trim() || p.code,
            technology: formTechnology,
            capacity: formCapacity.trim() || p.capacity,
            location: formLocation.trim() || p.location,
            commercialOperationDate: formCOD.trim() || p.commercialOperationDate,
            status: formStatus,
            currentSituationSummary: formSituation.trim() || p.currentSituationSummary,
            priorityActionSummary: formPriorityAction.trim() || p.priorityActionSummary,
          };
        })
      );
    } else {
      // Create new project
      const newProjId = `gov-${Date.now()}`;
      const newProject: GovernmentalProject = {
        id: newProjId,
        code: formCode.trim() || `GOV-${projects.length + 1}`,
        name: formName.trim(),
        shortName: formName.trim(),
        capacity: formCapacity.trim() || 'Sob Definição',
        capacityMW: parseFloat(formCapacity) || 0,
        technology: formTechnology,
        location: formLocation.trim() || 'Moçambique',
        province: formLocation.trim(),
        objective: 'Projecto prioritário de infra-estrutura energética nacional.',
        partnerEntities: ['EDM, E.P.'],
        currentSituationSummary: formSituation.trim() || 'Projecto estratégico inserido no portfólio governamental.',
        priorityActionSummary: formPriorityAction.trim() || 'Definição e alinhamento interinstitucional prioritário.',
        commercialOperationDate: formCOD.trim() || 'A definir',
        status: formStatus,
        statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
        milestones: [
          {
            id: `m-${Date.now()}-1`,
            description: 'Enquadramento institucional e aprovação preliminar',
            completed: false,
          },
        ],
        mainConstraints: [],
        priorityActions: formPriorityAction.trim() ? [formPriorityAction.trim()] : [],
      };

      setProjects(prev => [newProject, ...prev]);
      setExpandedProjects(prev => ({ ...prev, [newProjId]: true }));
    }

    setIsProjectModalOpen(false);
  };

  // Delete project
  const handleDeleteProject = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem a certeza que deseja eliminar o projecto "${projectName}"?`)) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  // Restore initial defaults
  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar a lista oficial inicial de projectos governamentais?')) {
      setProjects(INITIAL_GOVERNMENTAL_PROJECTS);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  // Statistics
  const stats = useMemo(() => {
    let totalMilestones = 0;
    let completedMilestones = 0;
    projects.forEach(p => {
      totalMilestones += p.milestones.length;
      completedMilestones += p.milestones.filter(m => m.completed).length;
    });
    const percent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    return {
      total: projects.length,
      totalMilestones,
      completedMilestones,
      percent,
    };
  }, [projects]);

  // Pre-calculate counts for quick filter buttons
  const filterCounts = useMemo(() => {
    let conflicts = 0;
    let delayed = 0;
    let ontrack = 0;
    let completed = 0;
    let inProgress = 0;

    projects.forEach(p => {
      const isAllDone = p.milestones.length > 0 && p.milestones.every(m => m.completed);
      const doneCount = p.milestones.filter(m => m.completed).length;
      const delayInfo = getProjectDelayStatus(p.milestones, p.commercialOperationDate);
      const confInfo = getProjectScheduleConflicts(p.milestones, p.commercialOperationDate);

      if (confInfo.hasConflicts) conflicts++;
      if (delayInfo.isDelayed) delayed++;
      if (!delayInfo.isDelayed && !isAllDone) ontrack++;
      if (isAllDone) completed++;
      if (doneCount > 0 && doneCount < p.milestones.length) inProgress++;
    });

    return {
      total: projects.length,
      conflicts,
      delayed,
      ontrack,
      completed,
      inProgress,
    };
  }, [projects]);

  // Filtered projects by Search, Technology, Status, and Schedule State
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // 1. Text Search (Name, Code, Location, or Milestones)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.milestones.some(m => m.description.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // 2. Technology Filter
      if (filterTechnology !== 'all' && p.technology !== filterTechnology) {
        return false;
      }

      // 3. Status Filter
      if (filterStatus !== 'all' && p.status !== filterStatus) {
        return false;
      }

      // 4. Schedule Quick Filter
      if (filterSchedule !== 'all') {
        const isAllDone = p.milestones.length > 0 && p.milestones.every(m => m.completed);
        const doneCount = p.milestones.filter(m => m.completed).length;
        const delayInfo = getProjectDelayStatus(p.milestones, p.commercialOperationDate);
        const confInfo = getProjectScheduleConflicts(p.milestones, p.commercialOperationDate);

        if (filterSchedule === 'conflicts' && !confInfo.hasConflicts) return false;
        if (filterSchedule === 'delayed' && !delayInfo.isDelayed) return false;
        if (filterSchedule === 'ontrack' && (delayInfo.isDelayed || isAllDone)) return false;
        if (filterSchedule === 'completed' && !isAllDone) return false;
        if (filterSchedule === 'inprogress' && !(doneCount > 0 && doneCount < p.milestones.length)) return false;
      }

      return true;
    });
  }, [projects, searchQuery, filterTechnology, filterStatus, filterSchedule]);

  // Technology icon helper
  const getTechIcon = (tech: string) => {
    switch (tech) {
      case 'Solar Fotovoltaica':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Eólica':
        return <Wind className="w-4 h-4 text-sky-500" />;
      case 'Gás / Térmica':
      case 'Turbinas Móveis a Gás':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'GNL / FSRU':
        return <Ship className="w-4 h-4 text-purple-500" />;
      default:
        return <Zap className="w-4 h-4 text-[#F7942D]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in">
      {/* Clean & Elegant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-[#c26508]">
              <Landmark className="w-3.5 h-3.5" />
              Presidência da República
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">• Acompanhamento Directo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Projectos Governamentais
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Checklist de execução: marque as caixas de selecção para assinalar actividades concluídas.
          </p>
        </div>

        {/* Action Buttons: Responsive Grid on Mobile, Flex on Desktop */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenCreate}
            className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#083b77] text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer order-first sm:order-last"
          >
            <Plus className="w-4 h-4 text-[#F7942D]" />
            <span>Adicionar Projecto</span>
          </button>
          <button
            onClick={() => handleOpenGeneralReport()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-orange-300 text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
            title="Emitir Relatório Geral Consolidado (Todos os Projectos Governamentais)"
          >
            <FileText className="w-3.5 h-3.5 text-[#002D62]" />
            <span>Relatório Geral</span>
          </button>
          <button
            onClick={() => openAiCopilot('Auditar prazos e conflitos de cronograma dos projectos governamentais')}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-[#002D62] border border-blue-200 text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer group"
            title="Diagnóstico Inteligente de Prazos & Riscos com IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F7942D] group-hover:rotate-12 transition-transform" />
            <span>Diagnóstico IA</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="hidden sm:inline-flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Restaurar dados originais"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Stats Bar (Simple & Clean - Mobile Responsive) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="text-center border-r border-slate-100 pr-1 sm:pr-2">
          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Projectos</p>
          <p className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">{stats.total}</p>
        </div>
        <div className="text-center border-r border-slate-100 px-1 sm:px-2">
          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-tight">Actividades Concluídas</p>
          <p className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">
            {stats.completedMilestones}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-slate-400">/ {stats.totalMilestones}</span>
          </p>
        </div>
        <div className="text-center pl-1 sm:pl-2">
          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progresso Global</p>
          <p className="text-lg sm:text-xl font-black text-[#002D62] mt-0.5">{stats.percent}%</p>
        </div>
      </div>

      {/* Painel Interativo de Filtros e Pesquisa */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Linha 1: Campo de Pesquisa + Selectores de Tecnologia e Estado */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-2.5">
          {/* Pesquisa por Texto */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar projecto ou actividade..."
              className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selector de Tecnologia */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={filterTechnology}
              onChange={e => setFilterTechnology(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002D62] cursor-pointer"
            >
              <option value="all">⚡ Todas as Tecnologias</option>
              <option value="Gás / Térmica">Gás / Térmica</option>
              <option value="Turbinas Móveis a Gás">Turbinas Móveis a Gás</option>
              <option value="Solar Fotovoltaica">Solar Fotovoltaica</option>
              <option value="Eólica">Eólica</option>
              <option value="GNL / FSRU">GNL / FSRU</option>
            </select>

            {/* Selector de Estado Institucional */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002D62] cursor-pointer"
            >
              <option value="all">📋 Todos os Estados</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Aguardando Parecer">Aguardando Parecer</option>
              <option value="Impasse Tarifário">Impasse Tarifário</option>
              <option value="Concursos em Curso">Concursos em Curso</option>
              <option value="Constituição de SPV">Constituição de SPV</option>
            </select>

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer shrink-0"
                title="Limpar todos os filtros activos"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Linha 2: Chips / Botões de Filtro Rápido por Cronograma e Situação */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Filtrar por:
          </span>

          {/* Todos */}
          <button
            onClick={() => setFilterSchedule('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterSchedule === 'all'
                ? 'bg-[#002D62] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Todos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterSchedule === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {filterCounts.total}
            </span>
          </button>

          {/* Conflito de Prazo */}
          <button
            onClick={() => setFilterSchedule('conflicts')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterSchedule === 'conflicts'
                ? 'bg-amber-600 text-white shadow-2xs ring-2 ring-amber-300'
                : filterCounts.conflicts > 0
                ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className={`w-3 h-3 ${filterSchedule === 'conflicts' ? 'text-white' : 'text-amber-600'}`} />
            <span>Conflito de Prazo</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterSchedule === 'conflicts' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {filterCounts.conflicts}
            </span>
          </button>

          {/* Em Atraso */}
          <button
            onClick={() => setFilterSchedule('delayed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterSchedule === 'delayed'
                ? 'bg-rose-600 text-white shadow-2xs ring-2 ring-rose-300'
                : filterCounts.delayed > 0
                ? 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                filterSchedule === 'delayed' ? 'bg-white' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span>Em Atraso</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterSchedule === 'delayed' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900'
              }`}
            >
              {filterCounts.delayed}
            </span>
          </button>

          {/* No Prazo */}
          <button
            onClick={() => setFilterSchedule('ontrack')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterSchedule === 'ontrack'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>No Prazo</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterSchedule === 'ontrack' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {filterCounts.ontrack}
            </span>
          </button>

          {/* Em Execução */}
          <button
            onClick={() => setFilterSchedule('inprogress')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterSchedule === 'inprogress'
                ? 'bg-[#002D62] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Em Execução</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterSchedule === 'inprogress' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {filterCounts.inProgress}
            </span>
          </button>

          {/* 100% Concluídos */}
          <button
            onClick={() => setFilterSchedule('completed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterSchedule === 'completed'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>100% Concluídos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterSchedule === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {filterCounts.completed}
            </span>
          </button>
        </div>
      </div>

      {/* View Switcher: Tabela Executiva Oficial vs Checklist */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#f08519] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Tabela</span>
            <span className="hidden sm:inline">Matriz Executiva Oficial (Tabela)</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Checklist</span>
            <span className="hidden sm:inline">Checklist de Actividades</span>
          </button>
        </div>

        {/* Indicador Dinâmico de Resultados e Filtros */}
        <div className="flex items-center justify-between sm:justify-end gap-2 px-1 sm:px-2 flex-wrap">
          <span className="text-[11px] text-slate-500 font-medium">
            A mostrar <strong>{filteredProjects.length}</strong> de {projects.length} projectos
          </span>
          {hasActiveFilters && (
            <span className="text-[10px] bg-orange-100 text-[#c26508] font-bold px-2 py-0.5 rounded-full border border-orange-200">
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {viewMode === 'table' ? (
        <GovernmentalProjectsTableView
          projects={filteredProjects}
          expandedProjects={expandedProjects}
          toggleExpand={toggleExpand}
          handleToggleMilestone={handleToggleMilestone}
          handleOpenEdit={handleOpenEdit}
          handleDeleteProject={handleDeleteProject}
          handleAddMilestone={handleAddMilestone}
          handleDeleteMilestone={handleDeleteMilestone}
          handleStartEditMilestone={handleStartEditMilestone}
          handleSaveEditMilestone={handleSaveEditMilestone}
          handleCancelEditMilestone={handleCancelEditMilestone}
          editingMilestoneId={editingMilestoneId}
          editingMilestoneText={editingMilestoneText}
          setEditingMilestoneText={setEditingMilestoneText}
          editingMilestoneDate={editingMilestoneDate}
          setEditingMilestoneDate={setEditingMilestoneDate}
          handleUpdateProjectCOD={handleUpdateProjectCOD}
          addingMilestoneTo={addingMilestoneTo}
          setAddingMilestoneTo={setAddingMilestoneTo}
          newMilestoneText={newMilestoneText}
          setNewMilestoneText={setNewMilestoneText}
          newMilestoneDate={newMilestoneDate}
          setNewMilestoneDate={setNewMilestoneDate}
          getTechIcon={getTechIcon}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          onGenerateReport={handleOpenProjectReport}
        />
      ) : (
        <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-slate-500 text-xs font-medium">
              Nenhum projecto governamental encontrado para os critérios ou filtros seleccionados.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-xs font-bold text-white bg-[#002D62] hover:bg-[#083b77] rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                Limpar Filtros e Mostrar Todos os Projectos
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map(project => {
            const isExpanded = expandedProjects[project.id] ?? true;
            const completed = project.milestones.filter(m => m.completed).length;
            const total = project.milestones.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const delayStatus = getProjectDelayStatus(project.milestones, project.commercialOperationDate);
            const codRemaining = project.commercialOperationDate
              ? calculateDaysRemaining(project.commercialOperationDate)
              : null;
            const scheduleConflicts = getProjectScheduleConflicts(
              project.milestones,
              project.commercialOperationDate
            );

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Project Header Row */}
                <div
                  onClick={() => toggleExpand(project.id)}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {getTechIcon(project.technology)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {project.code}
                        </span>
                        <h2 className="text-sm sm:text-base font-black text-slate-900">
                          {project.name}
                        </h2>
                        {percent === 100 && total > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            100% Concluído
                          </span>
                        ) : percent > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#002D62] border border-blue-200">
                            Em Execução ({percent}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Por Iniciar
                          </span>
                        )}

                        {/* Project Schedule Conflict Alert Badge */}
                        {scheduleConflicts.hasConflicts && (
                          <span
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-2xs animate-fade-in"
                            title={`Incoerência de Cronograma: Existem ${scheduleConflicts.conflictCount} actividades com prazo posterior à conclusão do projecto.`}
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            Conflito de Prazo ({scheduleConflicts.conflictCount})
                            {scheduleConflicts.latestSuggestedCOD && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateProjectCOD(project.id, scheduleConflicts.latestSuggestedCOD);
                                }}
                                className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#002D62] text-white hover:bg-[#083b77] text-[9px] font-bold cursor-pointer transition active:scale-95"
                                title={`Prolongar projecto para ${scheduleConflicts.latestSuggestedCOD}`}
                              >
                                <Zap className="w-2.5 h-2.5 text-amber-300" />
                                Prolongar para {scheduleConflicts.latestSuggestedCOD}
                              </button>
                            )}
                          </span>
                        )}

                        {/* Project Delay Alert Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${delayStatus.badgeClass}`}
                          title={delayStatus.statusText}
                        >
                          {delayStatus.isDelayed && (
                            <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
                          )}
                          {delayStatus.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="font-semibold text-slate-700">{project.capacity}</span>
                        {project.location && (
                          <span className="flex items-center gap-1 text-slate-400 truncate">
                            <MapPin className="w-3 h-3" /> {project.location}
                          </span>
                        )}

                        {/* Data de Finalização (COD) - Editável em Data ou Dias */}
                        {editingCODProjectId === project.id ? (
                          <div
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 bg-white p-0.5 rounded border-2 border-orange-400 shadow-xs"
                          >
                            <input
                              type="text"
                              value={editingCODValue}
                              onChange={e => setEditingCODValue(e.target.value)}
                              placeholder="Data (ex: 31/12/2028) ou Dias (ex: 40 dias)"
                              className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-800 font-bold w-36 focus:outline-none"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleUpdateProjectCOD(project.id, editingCODValue);
                                  setEditingCODProjectId(null);
                                }
                                if (e.key === 'Escape') setEditingCODProjectId(null);
                              }}
                            />
                            <button
                              onClick={() => {
                                handleUpdateProjectCOD(project.id, editingCODValue);
                                setEditingCODProjectId(null);
                              }}
                              className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Guardar prazo"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingCODProjectId(null)}
                              className="p-0.5 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              setEditingCODProjectId(project.id);
                              setEditingCODValue(project.commercialOperationDate || '');
                            }}
                            className="group/cod inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition flex-wrap"
                            title="Clique para editar o prazo de finalização (pode ser data ou em dias, ex: 40 dias)"
                          >
                            <Calendar className="w-3.5 h-3.5 text-[#f08519]" />
                            <span className="text-slate-500 font-normal">Prazo Final (COD):</span>
                            <strong className="font-bold text-[#002D62]">{project.commercialOperationDate || 'A definir'}</strong>
                            {codRemaining?.targetDateFormatted && codRemaining.inputMode === 'days' && (
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({codRemaining.targetDateFormatted})
                              </span>
                            )}
                            {codRemaining?.label && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  codRemaining.isOverdue
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : codRemaining.isToday
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {codRemaining.label}
                              </span>
                            )}
                            <Pencil className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover/cod:opacity-100" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Mini Progress */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* Progress indicator */}
                    <div className="text-right">
                      <div className={`text-xs font-bold ${percent === 100 ? 'text-emerald-700' : 'text-[#002D62]'}`}>
                        {completed}/{total}{' '}
                        <span className="text-[10px] font-normal text-slate-400">({percent}%)</span>
                      </div>
                      <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Report Project Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenProjectReport(project);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#002D62] hover:bg-white rounded-lg border border-transparent hover:border-orange-200 transition shadow-2xs"
                      title="Gerar Relatório Individual deste Projecto"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#F7942D]" />
                      <span className="hidden sm:inline">Relatório</span>
                    </button>

                    {/* Edit Project Button */}
                    <button
                      onClick={e => handleOpenEdit(project, e)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition"
                      title="Editar dados do projecto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Project Button */}
                    <button
                      onClick={e => handleDeleteProject(project.id, project.name, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                      title="Eliminar projecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand/Collapse Toggle */}
                    <div className="text-slate-400 pl-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Checklist (Line-by-Line with Checkboxes and High-Visibility Progress Bar) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-3">
                    
                    {/* BARRA BEM VISÍVEL DE PROGRESSÃO */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
                          Barra de Progressão das Actividades:
                        </span>
                        <span className="font-black text-sm text-[#002D62]">
                          {percent}%{' '}
                          <span className="font-normal text-xs text-slate-500">
                            ({completed} de {total} concluídas)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent === 100
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Lista de Actividades */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {project.milestones.map((milestone, idx) => {
                        const isDone = milestone.completed;
                        const isEditingThis = editingMilestoneId === milestone.id;
                        const remaining = !isDone && milestone.targetDate ? calculateDaysRemaining(milestone.targetDate) : null;
                        const conflict = !isDone && milestone.targetDate
                          ? checkMilestoneExceedsProject(milestone.targetDate, project.commercialOperationDate)
                          : null;

                        if (isEditingThis) {
                          const editingConflict = checkMilestoneExceedsProject(
                            editingMilestoneDate,
                            project.commercialOperationDate
                          );

                          return (
                            <div
                              key={milestone.id}
                              className="p-3 bg-amber-50/70 border-l-4 border-l-amber-500 flex flex-col gap-2 animate-fade-in"
                            >
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <span className="text-xs font-bold text-amber-800 shrink-0">
                                  Actividade #{idx + 1}:
                                </span>
                                <input
                                  type="text"
                                  value={editingMilestoneText}
                                  onChange={e => setEditingMilestoneText(e.target.value)}
                                  placeholder="Descrição da actividade..."
                                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                                  autoFocus
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveEditMilestone(project.id, milestone.id);
                                    if (e.key === 'Escape') handleCancelEditMilestone();
                                  }}
                                />
                                <input
                                  type="text"
                                  value={editingMilestoneDate}
                                  onChange={e => setEditingMilestoneDate(e.target.value)}
                                  placeholder="Prazo (Ex: 15/12/2026, 40 dias ou Dez 2026)"
                                  className="w-full sm:w-52 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                                />
                                <div className="flex items-center gap-1.5 justify-end shrink-0">
                                  <button
                                    onClick={() => handleSaveEditMilestone(project.id, milestone.id)}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                    title="Guardar alterações da actividade"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Guardar
                                  </button>
                                  <button
                                    onClick={handleCancelEditMilestone}
                                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition cursor-pointer"
                                    title="Cancelar"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Alerta inteligente se a data em edição ultrapassar a data final do projecto */}
                              {editingConflict.hasConflict && (
                                <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 text-xs animate-fade-in shadow-2xs">
                                  <span className="flex items-center gap-1.5 font-semibold">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>
                                      Atenção: Este prazo ultrapassa a conclusão do projecto (<strong>{project.commercialOperationDate}</strong>) em <strong className="text-rose-700">{editingConflict.diffDays} dias</strong>!
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateProjectCOD(project.id, editingConflict.suggestedNewCOD)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#002D62] hover:bg-[#083b77] text-white font-bold text-[10px] cursor-pointer shadow-xs transition active:scale-95 ml-auto"
                                    title={`Prolongar prazo do projecto para ${editingConflict.suggestedNewCOD}`}
                                  >
                                    <Zap className="w-3 h-3 text-amber-300" />
                                    Prolongar Projecto para "{editingConflict.suggestedNewCOD}"
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={milestone.id}
                            className={`group p-2.5 sm:px-3.5 flex flex-col gap-1.5 transition select-none ${
                              isDone
                                ? 'bg-emerald-50/70 hover:bg-emerald-50 border-l-4 border-l-emerald-500'
                                : conflict?.hasConflict
                                ? 'bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-l-amber-500'
                                : remaining?.isOverdue
                                ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500'
                                : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 w-full">
                              <div
                                onClick={() => handleToggleMilestone(project.id, milestone.id)}
                                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                              >
                                {/* Clean Checkbox */}
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                                    isDone
                                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-200'
                                      : 'border-2 border-slate-300 group-hover:border-slate-500 bg-white'
                                  }`}
                                >
                                  {isDone ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-transparent" />
                                  )}
                                </div>

                                {/* Number */}
                                <span className={`text-[11px] font-mono w-4 shrink-0 ${isDone ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                                  {idx + 1}.
                                </span>

                                {/* Text Description */}
                                <span
                                  className={`text-xs sm:text-sm leading-relaxed transition ${
                                    isDone
                                      ? 'text-emerald-950 font-semibold'
                                      : 'text-slate-800 font-medium'
                                  }`}
                                >
                                  {milestone.description}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                {/* Explicit Status Badge */}
                                {isDone ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Concluída
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    Pendente
                                  </span>
                                )}

                                {/* Controlo de Datas, Conclusão e Atrasos em Dias */}
                                {isDone && milestone.completedDate ? (
                                  <span
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                                    title="Data efectiva de conclusão"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Conclusão:</span>
                                    <strong className="font-bold text-emerald-950">{milestone.completedDate}</strong>
                                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                                      {formatDaysSinceCompletion(milestone.completedDate)}
                                    </span>
                                  </span>
                                ) : milestone.targetDate ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                                      remaining?.isOverdue
                                        ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                                        : remaining?.isToday
                                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
                                    }`}
                                    title={remaining?.label || 'Prazo previsto da actividade'}
                                  >
                                    <Calendar
                                      className={`w-3.5 h-3.5 shrink-0 ${
                                        remaining?.isOverdue
                                          ? 'text-rose-600'
                                          : remaining?.isToday
                                          ? 'text-amber-600'
                                          : 'text-slate-500'
                                      }`}
                                    />
                                    <span className="text-slate-500 font-normal">Prazo Previsto:</span>
                                    <strong className="font-bold text-slate-900">{milestone.targetDate}</strong>
                                    {remaining?.targetDateFormatted && remaining.inputMode === 'days' && (
                                      <span className="text-[10px] text-slate-500 font-normal">
                                        ({remaining.targetDateFormatted})
                                      </span>
                                    )}
                                    {remaining?.label && (
                                      <span
                                        className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                          remaining.isOverdue
                                            ? 'bg-rose-200 text-rose-950'
                                            : remaining.isToday
                                            ? 'bg-amber-200 text-amber-950'
                                            : 'bg-blue-100 text-[#002D62]'
                                        }`}
                                      >
                                        {remaining.label}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono italic">
                                    Sem prazo
                                  </span>
                                )}

                                {/* Botão de Edição da Actividade */}
                                <button
                                  onClick={e => handleStartEditMilestone(milestone, e)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition cursor-pointer"
                                  title="Editar texto ou prazo desta actividade"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete single milestone */}
                                <button
                                  onClick={e => handleDeleteMilestone(project.id, milestone.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition cursor-pointer"
                                  title="Remover esta actividade"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Alerta Inteligente de Incoerência de Cronograma e Botão 1-Clique para Prolongar Projecto */}
                            {!isDone && conflict?.hasConflict && (
                              <div className="w-full mt-1 flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 text-[11px] animate-fade-in shadow-2xs">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>
                                    <strong className="text-amber-900 font-bold">Incoerência de Cronograma:</strong> O prazo desta actividade (<strong>{milestone.targetDate}</strong>) ultrapassa a conclusão do projecto (<strong>{project.commercialOperationDate}</strong>) em <strong className="text-rose-700 font-bold">{conflict.diffDays} {conflict.diffDays === 1 ? 'dia' : 'dias'}</strong>.
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateProjectCOD(project.id, conflict.suggestedNewCOD);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#002D62] hover:bg-[#083b77] text-white font-bold text-[10px] shadow-xs cursor-pointer transition active:scale-95 ml-auto"
                                  title={`Prolongar prazo do projecto para ${conflict.suggestedNewCOD}`}
                                >
                                  <Zap className="w-3 h-3 text-amber-300" />
                                  Prolongar Projecto para "{conflict.suggestedNewCOD}"
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Add Milestone Row com Verificação Inteligente */}
                    {addingMilestoneTo === project.id ? (
                      <div className="space-y-2 pt-1 animate-fade-in">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newMilestoneText}
                            onChange={e => setNewMilestoneText(e.target.value)}
                            placeholder="Nova actividade ou ponto de situação..."
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleAddMilestone(project.id);
                              if (e.key === 'Escape') setAddingMilestoneTo(null);
                            }}
                          />
                          <input
                            type="text"
                            value={newMilestoneDate}
                            onChange={e => setNewMilestoneDate(e.target.value)}
                            placeholder="Prazo (Ex: 15/12/2026, 40 dias)"
                            className="w-36 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                          />
                          <button
                            onClick={() => handleAddMilestone(project.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#002D62] hover:bg-[#083b77] rounded-lg transition cursor-pointer"
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={() => setAddingMilestoneTo(null)}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>

                        {/* Alerta inteligente se a data da nova actividade ultrapassar o projecto */}
                        {(() => {
                          const newConflict = newMilestoneDate.trim()
                            ? checkMilestoneExceedsProject(newMilestoneDate, project.commercialOperationDate)
                            : null;
                          if (!newConflict?.hasConflict) return null;
                          return (
                            <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 text-xs animate-fade-in shadow-2xs">
                              <span className="flex items-center gap-1.5 font-semibold">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                  Atenção: O prazo desta nova actividade ultrapassa o prazo do projecto (<strong>{project.commercialOperationDate}</strong>) em <strong className="text-rose-700">{newConflict.diffDays} dias</strong>.
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateProjectCOD(project.id, newConflict.suggestedNewCOD)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#002D62] hover:bg-[#083b77] text-white font-bold text-[10px] cursor-pointer shadow-xs transition active:scale-95 ml-auto"
                                title={`Prolongar prazo do projecto para ${newConflict.suggestedNewCOD}`}
                              >
                                <Zap className="w-3 h-3 text-amber-300" />
                                Prolongar Projecto para "{newConflict.suggestedNewCOD}"
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingMilestoneTo(project.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#002D62] pt-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar ponto de situação a este projecto
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    )}

      {/* MODAL: Adicionar / Editar Projecto (Limpo & Elegante) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingProjectId ? 'Editar Projecto Governamental' : 'Novo Projecto Governamental'}
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Projecto *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Central ENI Temane 75 MW"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código / Sigla
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    placeholder="Ex: GOV-01"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Capacidade
                  </label>
                  <input
                    type="text"
                    value={formCapacity}
                    onChange={e => setFormCapacity(e.target.value)}
                    placeholder="Ex: 75 MW"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tecnologia
                  </label>
                  <select
                    value={formTechnology}
                    onChange={e => setFormTechnology(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  >
                    <option value="Gás / Térmica">Gás / Térmica</option>
                    <option value="Turbinas Móveis a Gás">Turbinas Móveis a Gás</option>
                    <option value="Solar Fotovoltaica">Solar Fotovoltaica</option>
                    <option value="Eólica">Eólica</option>
                    <option value="GNL / FSRU">GNL / FSRU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Localização / Província
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    placeholder="Ex: Temane, Inhambane"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Data de Finalização (COD)</span>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Editável</span>
                  </label>
                  <input
                    type="text"
                    value={formCOD}
                    onChange={e => setFormCOD(e.target.value)}
                    placeholder="Ex: Dezembro 2028 ou 31/12/2028"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62] font-semibold text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Actualize esta data sempre que houver ajustes no cronograma oficial.
                  </p>
                  {(() => {
                    if (!editingProjectId || !formCOD.trim()) return null;
                    const currProject = projects.find(p => p.id === editingProjectId);
                    if (!currProject) return null;
                    const modalConflicts = getProjectScheduleConflicts(currProject.milestones, formCOD);
                    if (!modalConflicts.hasConflicts) return null;

                    return (
                      <div className="mt-2 p-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 text-[11px] animate-fade-in shadow-2xs">
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-900">Atenção ao Cronograma:</span> Existem {modalConflicts.conflictCount} actividades com prazo posterior a esta data (ultrapassam até {modalConflicts.maxExceededDays} dias).
                            {modalConflicts.latestSuggestedCOD && (
                              <button
                                type="button"
                                onClick={() => setFormCOD(modalConflicts.latestSuggestedCOD)}
                                className="mt-1 block text-[10px] font-bold text-[#002D62] hover:underline cursor-pointer"
                              >
                                ⚡ Harmonizar e definir para "{modalConflicts.latestSuggestedCOD}"
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  >
                    <option value="Em Negociação">Em Negociação</option>
                    <option value="Aguardando Parecer">Aguardando Parecer</option>
                    <option value="Impasse Tarifário">Impasse Tarifário</option>
                    <option value="Concursos em Curso">Concursos em Curso</option>
                    <option value="Constituição de SPV">Constituição de SPV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Situação Actual (Texto da Matriz)
                </label>
                <textarea
                  rows={3}
                  value={formSituation}
                  onChange={e => setFormSituation(e.target.value)}
                  placeholder="Descrição da situação actual do projecto..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Decisão ou Acção Prioritária (Texto da Matriz)
                </label>
                <textarea
                  rows={2}
                  value={formPriorityAction}
                  onChange={e => setFormPriorityAction(e.target.value)}
                  placeholder="Próximas decisões ou acções prioritárias..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#002D62] hover:bg-[#083b77] rounded-lg transition shadow-xs"
                >
                  {editingProjectId ? 'Guardar Alterações' : 'Criar Projecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE CONFIRMAÇÃO VISUAL DE CONCLUSÃO / ALTERAÇÃO DE STATUS */}
      {confirmStatusModal && confirmStatusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div
              className={`px-5 py-4 flex items-center justify-between border-b ${
                !confirmStatusModal.isCurrentlyCompleted
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                    !confirmStatusModal.isCurrentlyCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {!confirmStatusModal.isCurrentlyCompleted ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Clock className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 font-heading">
                    {!confirmStatusModal.isCurrentlyCompleted
                      ? 'Confirmar Conclusão da Actividade'
                      : 'Reabrir Actividade (Mudar para Pendente)'}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Projecto: {confirmStatusModal.projectName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConfirmStatusModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Actividade Seleccionada:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  "{confirmStatusModal.milestoneDescription}"
                </div>
              </div>

              {!confirmStatusModal.isCurrentlyCompleted ? (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Data Efectiva de Conclusão da Actividade:
                      </span>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Formato: DD/MM/AAAA
                      </span>
                    </label>

                    {/* Botões Rápidos de Selecção de Data */}
                    <div className="flex items-center gap-2 pt-0.5 pb-1">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          setConfirmStatusModal({
                            ...confirmStatusModal,
                            completionDateInput: today,
                          });
                        }}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        Hoje ({new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const yest = new Date();
                          yest.setDate(yest.getDate() - 1);
                          const yestStr = yest.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          setConfirmStatusModal({
                            ...confirmStatusModal,
                            completionDateInput: yestStr,
                          });
                        }}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        Ontem
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={confirmStatusModal.completionDateInput}
                        onChange={e =>
                          setConfirmStatusModal({
                            ...confirmStatusModal,
                            completionDateInput: e.target.value,
                          })
                        }
                        placeholder="Ex: 27/10/2026 ou Outubro 2026"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 shadow-2xs"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pode digitar uma data específica (ex: <code className="bg-slate-100 px-1 py-0.2 rounded text-slate-700">27/10/2026</code>) ou mês/ano (ex: <code className="bg-slate-100 px-1 py-0.2 rounded text-slate-700">Outubro 2026</code>).
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Ao confirmar, esta etapa será marcada como <strong>Concluída</strong> com esta data oficial e a barra de percentagem global subirá automaticamente.
                    </span>
                  </p>
                </div>
              ) : (
                <div className="pt-1">
                  <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Tem a certeza que deseja <strong>reabrir</strong> esta etapa? O estado passará a <strong>Pendente</strong> e a percentagem global do projecto será recalculada.
                    </span>
                  </p>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmStatusModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    !confirmStatusModal.isCurrentlyCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {!confirmStatusModal.isCurrentlyCompleted ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      Sim, Confirmar Conclusão
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Sim, Reabrir Actividade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICAÇÃO VISUAL FLUTUANTE (TOAST) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-slide-up">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Clock className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {toast.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODAL DE RELATÓRIOS (GERAL & INDIVIDUAL) */}
      <GovernmentalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        projects={projects}
        initialProjectId={reportTargetProject?.id}
        initialMode={reportTargetProject ? 'single' : 'general'}
      />
    </div>
  );
};
