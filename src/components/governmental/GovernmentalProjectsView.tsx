import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  CheckSquare,
  Square,
  AlertTriangle,
  Zap,
  Wind,
  Sun,
  Flame,
  Ship,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Calendar,
  Building,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_GOVERNMENTAL_PROJECTS,
  TRANSVERSAL_GOVERNMENT_PRIORITIES,
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
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    'gov-eni-75mw': true,
    'gov-argelia-40mw': true,
    'gov-metoro-40mwp': true,
    'gov-namaacha-120mw': true,
    'gov-sligm-fsru': true,
  });

  // Modal / inline state for adding new milestone
  const [addingToProject, setAddingToProject] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneCategory, setNewMilestoneCategory] = useState<GovernmentalMilestone['category']>('Técnico / Estudos');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Ignore storage errors
    }
  }, [projects]);

  // Toggle milestone completion checkbox
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

  // Mark all milestones of a project as complete or incomplete
  const handleToggleAllMilestones = (projectId: string, completed: boolean) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map(m => ({ ...m, completed })),
        };
      })
    );
  };

  // Add new milestone line to a project
  const handleAddMilestone = (projectId: string) => {
    if (!newMilestoneText.trim()) return;
    const newM: GovernmentalMilestone = {
      id: `custom-${Date.now()}`,
      description: newMilestoneText.trim(),
      completed: false,
      targetDate: newMilestoneDate.trim() || undefined,
      category: newMilestoneCategory,
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
    setAddingToProject(null);
  };

  // Reset to initial official document state
  const handleResetToOfficial = () => {
    if (window.confirm('Deseja restaurar os pontos de situação oficiais do documento da Presidência da República? Suas seleções actuais serão redefinidas.')) {
      setProjects(INITIAL_GOVERNMENTAL_PROJECTS);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  // Toggle expand/collapse all
  const toggleAllExpanded = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    projects.forEach(p => {
      updated[p.id] = expand;
    });
    setExpandedProjects(updated);
  };

  const toggleExpand = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Global KPIs
  const globalStats = useMemo(() => {
    let totalMilestones = 0;
    let completedMilestones = 0;
    let totalMW = 0;

    projects.forEach(p => {
      totalMW += p.capacityMW || 0;
      totalMilestones += p.milestones.length;
      completedMilestones += p.milestones.filter(m => m.completed).length;
    });

    const executionPercentage =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      totalProjects: projects.length,
      totalMW,
      totalMilestones,
      completedMilestones,
      executionPercentage,
    };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesTech =
        selectedTech === 'all' ||
        (selectedTech === 'gas' && (p.technology === 'Gás / Térmica' || p.technology === 'Turbinas Móveis a Gás')) ||
        (selectedTech === 'solar' && p.technology === 'Solar Fotovoltaica') ||
        (selectedTech === 'wind' && p.technology === 'Eólica') ||
        (selectedTech === 'gnl' && p.technology === 'GNL / FSRU');

      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partnerEntities.some(pe => pe.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.milestones.some(m => m.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTech && matchesQuery;
    });
  }, [projects, selectedTech, searchQuery]);

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

  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case 'Acordo / Contrato':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Técnico / Estudos':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Procurement / Concurso':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Governo / Regulatório':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Obras / Operação':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-[#083b77] to-[#0a4b99] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F7942D] text-white shadow-sm">
                <Landmark className="w-3.5 h-3.5" />
                Presidência da República
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Projectos Estratégicos Seleccionados
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
                title="Imprimir Ponto de Situação"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </button>
              <button
                onClick={handleResetToOfficial}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
                title="Restaurar dados originais do documento"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurar Oficial
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Ponto de Situação dos Projectos Governamentais Prioritários
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 max-w-4xl leading-relaxed">
            Acompanhamento linha a linha da execução física e institucional dos 5 empreendimentos
            estruturantes do sector energético nacional. Marque nas caixas de selecção cada
            actividade concluída para actualizar em tempo real o progresso de execução.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Projectos Estratégicos
            </p>
            <p className="text-2xl font-black text-slate-800 mt-1">5 Empreendimentos</p>
            <p className="text-xs text-slate-500 mt-0.5">Sob acompanhamento directo</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002D62] flex items-center justify-center font-bold">
            <Landmark className="w-6 h-6 text-[#002D62]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Capacidade em Estruturação
            </p>
            <p className="text-2xl font-black text-[#002D62] mt-1">
              235 MW <span className="text-sm font-semibold text-slate-500">+ FSRU</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Térmica, Solar, Eólica e GNL</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F7942D] flex items-center justify-center font-bold">
            <Zap className="w-6 h-6 text-[#F7942D]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Actividades Concluídas
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {globalStats.completedMilestones}{' '}
              <span className="text-sm font-semibold text-slate-400">
                / {globalStats.totalMilestones}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {globalStats.executionPercentage}% de marcos realizados
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Decisões Críticas Pendentes
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">5 Intervenções</p>
            <p className="text-xs text-slate-500 mt-0.5">MIREME, MinFin, AT e Parceiros</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Progresso Físico Global dos 5 Projectos:
            </span>
            <span className="text-sm font-black text-[#002D62]">
              {globalStats.executionPercentage}% Concluído
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {globalStats.completedMilestones} de {globalStats.totalMilestones} actividades marcadas como feitas
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#F7942D] via-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${globalStats.executionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por projecto, actividade, parceiro ou localização..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62] focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Technology Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtro:
          </span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'gas', label: 'Gás & Térmica' },
            { id: 'solar', label: 'Solar' },
            { id: 'wind', label: 'Eólica' },
            { id: 'gnl', label: 'GNL / FSRU' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedTech(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                selectedTech === f.id
                  ? 'bg-[#002D62] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Expand / Collapse All */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAllExpanded(true)}
            className="text-xs font-medium text-slate-600 hover:text-[#002D62] px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          >
            Expandir Todos
          </button>
          <button
            onClick={() => toggleAllExpanded(false)}
            className="text-xs font-medium text-slate-600 hover:text-[#002D62] px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          >
            Recolher Todos
          </button>
        </div>
      </div>

      {/* Projects List with Line-by-Line Checkbox Activities */}
      <div className="space-y-6">
        {filteredProjects.map(project => {
          const isExpanded = expandedProjects[project.id] ?? true;
          const completedCount = project.milestones.filter(m => m.completed).length;
          const totalCount = project.milestones.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Project Card Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50/70 to-white border-b border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getTechIcon(project.technology)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {project.code}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${project.statusColor}`}>
                          {project.status}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {project.technology}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {project.capacity}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {project.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          Local: <strong className="text-slate-700">{project.location}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Entrada em Operação (COD):{' '}
                          <strong className="text-slate-700">{project.commercialOperationDate}</strong>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Mini Progress */}
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500">Progresso Físico</div>
                      <div className="text-base font-black text-[#002D62]">
                        {completedCount} / {totalCount}{' '}
                        <span className="text-xs font-normal text-slate-400">({percent}%)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar for this project */}
                <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      percent === 100
                        ? 'bg-emerald-500'
                        : percent > 50
                        ? 'bg-[#002D62]'
                        : 'bg-[#F7942D]'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* General Situation Summary */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F7942D]" />
                      Ponto de Situação Executivo (Resumo Geral)
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {project.currentSituationSummary}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500">Entidades Envolvidas:</span>
                      {project.partnerEntities.map((partner, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-slate-700 shadow-2xs"
                        >
                          {partner}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* LINE-BY-LINE CHECKBOX ACTIVITIES (PONTOS DE SITUAÇÃO ESPECÍFICOS) */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-[#002D62]" />
                          Actividades & Pontos de Situação (Linha a Linha)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Clique em cada caixa de selecção para assinalar a realização da actividade.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAllMilestones(project.id, true)}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition"
                        >
                          Marcar Todas Feitas
                        </button>
                        <button
                          onClick={() => handleToggleAllMilestones(project.id, false)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-200 transition"
                        >
                          Desmarcar Todas
                        </button>
                        <button
                          onClick={() =>
                            setAddingToProject(addingToProject === project.id ? null : project.id)
                          }
                          className="text-[11px] font-semibold text-[#002D62] hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar Actividade
                        </button>
                      </div>
                    </div>

                    {/* Inline Add Milestone Form */}
                    {addingToProject === project.id && (
                      <div className="mb-3 p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 animate-fade-in">
                        <p className="text-xs font-bold text-[#002D62] mb-2">
                          Adicionar Novo Ponto de Situação / Actividade:
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newMilestoneText}
                            onChange={e => setNewMilestoneText(e.target.value)}
                            placeholder="Descreva a actividade ou decisão realizada..."
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                          />
                          <input
                            type="text"
                            value={newMilestoneDate}
                            onChange={e => setNewMilestoneDate(e.target.value)}
                            placeholder="Data Alvo (ex: S1 2027)"
                            className="w-36 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                          />
                          <select
                            value={newMilestoneCategory}
                            onChange={e => setNewMilestoneCategory(e.target.value as any)}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                          >
                            <option value="Acordo / Contrato">Acordo / Contrato</option>
                            <option value="Técnico / Estudos">Técnico / Estudos</option>
                            <option value="Procurement / Concurso">Procurement / Concurso</option>
                            <option value="Governo / Regulatório">Governo / Regulatório</option>
                            <option value="Obras / Operação">Obras / Operação</option>
                          </select>
                          <button
                            onClick={() => handleAddMilestone(project.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#002D62] hover:bg-[#083b77] rounded-lg transition"
                          >
                            Gravar
                          </button>
                          <button
                            onClick={() => {
                              setAddingToProject(null);
                              setNewMilestoneText('');
                            }}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Milestone rows - each activity on its own line */}
                    <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
                      {project.milestones.map((milestone, idx) => {
                        const isDone = milestone.completed;

                        return (
                          <div
                            key={milestone.id}
                            onClick={() => handleToggleMilestone(project.id, milestone.id)}
                            className={`group p-3 sm:px-4 flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                              isDone
                                ? 'bg-emerald-50/30 hover:bg-emerald-50/50'
                                : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Checkbox icon */}
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleToggleMilestone(project.id, milestone.id);
                                }}
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border-2 border-slate-300 group-hover:border-[#002D62] text-transparent hover:border-slate-400'
                                }`}
                                aria-label={isDone ? 'Concluído' : 'Pendente'}
                              >
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 fill-emerald-600 text-white" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-transparent" />
                                )}
                              </button>

                              {/* Numbering badge */}
                              <span className="text-[11px] font-mono font-bold text-slate-400 w-5 shrink-0">
                                #{idx + 1}
                              </span>

                              {/* Activity description */}
                              <span
                                className={`text-xs sm:text-sm leading-relaxed transition ${
                                  isDone
                                    ? 'line-through text-slate-400 font-normal'
                                    : 'text-slate-800 font-medium'
                                }`}
                              >
                                {milestone.description}
                              </span>
                            </div>

                            {/* Tags and Target Date */}
                            <div className="flex items-center gap-2 shrink-0">
                              {milestone.targetDate && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {milestone.targetDate}
                                </span>
                              )}

                              {milestone.category && (
                                <span
                                  className={`hidden md:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                                    milestone.category
                                  )}`}
                                >
                                  {milestone.category}
                                </span>
                              )}

                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isDone ? 'Concluída' : 'Pendente'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Constraints and Priority Actions 2-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Constraints */}
                    <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Principais Constrangimentos
                      </h4>
                      <ul className="space-y-1.5 text-xs text-rose-950">
                        {project.mainConstraints.map((constraint, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Priority Actions */}
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#002D62] mb-2 flex items-center gap-1.5">
                        <ArrowRight className="w-4 h-4 text-[#F7942D]" />
                        Próximos Passos & Decisões Prioritárias
                      </h4>
                      <ul className="space-y-1.5 text-xs text-blue-950">
                        {project.priorityActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#F7942D] font-bold shrink-0">→</span>
                            <span className="leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Transversal Strategic Priorities from the Presidential Document */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="w-5 h-5 text-[#002D62]" />
          <h3 className="text-base font-black text-slate-800 tracking-tight">
            Orientações Estratégicas Transversais (Presidência da República)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Directrizes corporativas e regulatórias essenciais para garantir o cumprimento das metas
          de geração e segurança energética nacional:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRANSVERSAL_GOVERNMENT_PRIORITIES.map((tp, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#002D62]">{tp.area}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    tp.urgency === 'Crítica'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {tp.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{tp.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
