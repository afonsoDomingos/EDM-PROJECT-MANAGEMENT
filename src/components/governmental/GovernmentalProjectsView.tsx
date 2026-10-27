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
} from 'lucide-react';
import {
  INITIAL_GOVERNMENTAL_PROJECTS,
  GovernmentalProject,
  GovernmentalMilestone,
} from '../../data/governmentalProjectsData';

const STORAGE_KEY = 'edm_governmental_projects_v1';

export const GovernmentalProjectsView: React.FC = () => {
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
    'gov-eni-75mw': true,
    'gov-argelia-40mw': true,
    'gov-metoro-40mwp': true,
    'gov-namaacha-120mw': true,
    'gov-sligm-fsru': true,
  });

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

  // Inline Add Milestone State
  const [addingMilestoneTo, setAddingMilestoneTo] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

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

  // Toggle milestone completion
  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        };
      })
    );
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
        currentSituationSummary: 'Projecto estratégico inserido no portfólio governamental.',
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
        priorityActions: [],
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

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.milestones.some(m => m.description.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-[#c26508]">
              <Landmark className="w-3.5 h-3.5" />
              Presidência da República
            </span>
            <span className="text-xs text-slate-400 font-medium">• Acompanhamento Directo</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Projectos Governamentais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Checklist de execução: marque as caixas de selecção para assinalar actividades concluídas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            title="Restaurar dados originais"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#083b77] text-white text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#F7942D]" />
            Adicionar Projecto
          </button>
        </div>
      </div>

      {/* Mini Stats Bar (Simple & Clean) */}
      <div className="grid grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="text-center border-r border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Projectos</p>
          <p className="text-xl font-black text-slate-800 mt-0.5">{stats.total}</p>
        </div>
        <div className="text-center border-r border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actividades Concluídas</p>
          <p className="text-xl font-black text-emerald-600 mt-0.5">
            {stats.completedMilestones}{' '}
            <span className="text-xs font-normal text-slate-400">/ {stats.totalMilestones}</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progresso Global</p>
          <p className="text-xl font-black text-[#002D62] mt-0.5">{stats.percent}%</p>
        </div>
      </div>

      {/* Search Input (Minimalist) */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Pesquisar projecto ou actividade..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002D62] transition shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Projects List (Clean Cards with Checklist) */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Nenhum projecto encontrado.
          </div>
        ) : (
          filteredProjects.map(project => {
            const isExpanded = expandedProjects[project.id] ?? true;
            const completed = project.milestones.filter(m => m.completed).length;
            const total = project.milestones.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

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
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{project.capacity}</span>
                        {project.location && (
                          <span className="flex items-center gap-1 text-slate-400 truncate">
                            <MapPin className="w-3 h-3" /> {project.location}
                          </span>
                        )}
                        {project.commercialOperationDate && (
                          <span className="hidden sm:flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3" /> COD: {project.commercialOperationDate}
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

                {/* Checklist (Line-by-Line with Checkboxes) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {project.milestones.map((milestone, idx) => {
                        const isDone = milestone.completed;

                        return (
                          <div
                            key={milestone.id}
                            onClick={() => handleToggleMilestone(project.id, milestone.id)}
                            className={`group p-2.5 sm:px-3.5 flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                              isDone
                                ? 'bg-emerald-50/70 hover:bg-emerald-50 border-l-4 border-l-emerald-500'
                                : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
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

                            <div className="flex items-center gap-2.5 shrink-0">
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

                              {milestone.targetDate && (
                                <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                  {milestone.targetDate}
                                </span>
                              )}

                              {/* Delete single milestone */}
                              <button
                                onClick={e => handleDeleteMilestone(project.id, milestone.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition"
                                title="Remover esta actividade"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Add Milestone Row */}
                    {addingMilestoneTo === project.id ? (
                      <div className="flex items-center gap-2 pt-1 animate-fade-in">
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
                          placeholder="Prazo (opcional)"
                          className="w-28 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                        />
                        <button
                          onClick={() => handleAddMilestone(project.id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#002D62] hover:bg-[#083b77] rounded-lg transition"
                        >
                          Adicionar
                        </button>
                        <button
                          onClick={() => setAddingMilestoneTo(null)}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition"
                        >
                          Cancelar
                        </button>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Previsão de Conclusão (COD)
                  </label>
                  <input
                    type="text"
                    value={formCOD}
                    onChange={e => setFormCOD(e.target.value)}
                    placeholder="Ex: Dezembro 2028"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
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
    </div>
  );
};
