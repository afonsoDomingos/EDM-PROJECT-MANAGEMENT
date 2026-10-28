import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Square,
  Plus,
  X,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Pencil,
  Save,
  Zap,
  FileText,
  Table,
} from 'lucide-react';
import { GovernmentalProject, GovernmentalMilestone } from '../../data/governmentalProjectsData';
import {
  calculateDaysRemaining,
  formatDaysSinceCompletion,
  getProjectDelayStatus,
  checkMilestoneExceedsProject,
  getProjectScheduleConflicts,
} from '../../utils/formatters';

interface GovernmentalProjectsTableViewProps {
  projects: GovernmentalProject[];
  expandedProjects: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  handleToggleMilestone: (projectId: string, milestoneId: string) => void;
  handleOpenEdit: (project: GovernmentalProject, e: React.MouseEvent) => void;
  handleDeleteProject: (projectId: string, projectName: string, e: React.MouseEvent) => void;
  handleAddMilestone: (projectId: string) => void;
  handleDeleteMilestone: (projectId: string, milestoneId: string, e: React.MouseEvent) => void;
  handleStartEditMilestone: (milestone: GovernmentalMilestone, e: React.MouseEvent) => void;
  handleSaveEditMilestone: (projectId: string, milestoneId: string, e?: React.MouseEvent) => void;
  handleCancelEditMilestone: (e?: React.MouseEvent) => void;
  editingMilestoneId: string | null;
  editingMilestoneText: string;
  setEditingMilestoneText: (text: string) => void;
  editingMilestoneDate: string;
  setEditingMilestoneDate: (date: string) => void;
  handleUpdateProjectCOD?: (projectId: string, newCOD: string) => void;
  addingMilestoneTo: string | null;
  setAddingMilestoneTo: (id: string | null) => void;
  newMilestoneText: string;
  setNewMilestoneText: (text: string) => void;
  newMilestoneDate: string;
  setNewMilestoneDate: (date: string) => void;
  getTechIcon: (tech: string) => React.ReactNode;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  onGenerateReport?: (project: GovernmentalProject) => void;
}

export const GovernmentalProjectsTableView: React.FC<GovernmentalProjectsTableViewProps> = ({
  projects,
  expandedProjects,
  toggleExpand,
  handleToggleMilestone,
  handleOpenEdit,
  handleDeleteProject,
  handleAddMilestone,
  handleDeleteMilestone,
  handleStartEditMilestone,
  handleSaveEditMilestone,
  handleCancelEditMilestone,
  editingMilestoneId,
  editingMilestoneText,
  setEditingMilestoneText,
  editingMilestoneDate,
  setEditingMilestoneDate,
  handleUpdateProjectCOD,
  addingMilestoneTo,
  setAddingMilestoneTo,
  newMilestoneText,
  setNewMilestoneText,
  newMilestoneDate,
  setNewMilestoneDate,
  getTechIcon,
  onClearFilters,
  hasActiveFilters,
  onGenerateReport,
}) => {
  // Quick edit project COD state
  const [editingCODProjectId, setEditingCODProjectId] = useState<string | null>(null);
  const [editingCODValue, setEditingCODValue] = useState<string>('');

  const startEditCOD = (projectId: string, currentCOD: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCODProjectId(projectId);
    setEditingCODValue(currentCOD || '');
  };

  const saveEditCOD = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (handleUpdateProjectCOD && editingCODValue.trim()) {
      handleUpdateProjectCOD(projectId, editingCODValue.trim());
    }
    setEditingCODProjectId(null);
  };

  const cancelEditCOD = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCODProjectId(null);
  };

  if (projects.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
        <p className="text-slate-500 text-xs font-medium">
          Nenhum projecto governamental encontrado para os critérios ou filtros seleccionados.
        </p>
        {onClearFilters && hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-xs font-bold text-white bg-[#002D62] hover:bg-[#083b77] rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            Limpar Filtros e Mostrar Todos os Projectos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#f08519]/40 shadow-sm overflow-hidden animate-fade-in">
      {/* Mobile Scroll Indicator Banner */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2 bg-orange-50 border-b border-orange-200/70 text-[11px] text-orange-950">
        <span className="font-bold flex items-center gap-1.5">
          <Table className="w-3.5 h-3.5 text-[#f08519]" />
          Matriz Oficial
        </span>
        <span className="text-[10px] font-bold bg-white text-orange-800 px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs">
          Deslize para ver colunas ⇄
        </span>
      </div>

      <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="bg-[#f08519] text-white select-none">
              <th className="py-3.5 px-4 text-center font-black text-xs uppercase tracking-wider w-[26%] border-r border-orange-400/50">
                Projecto & Cronograma
              </th>
              <th className="py-3.5 px-6 font-black text-xs uppercase tracking-wider w-[40%] border-r border-orange-400/50">
                Situação actual
              </th>
              <th className="py-3.5 px-6 font-black text-xs uppercase tracking-wider w-[34%]">
                Decisão ou acção prioritária
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2d0aa]">
            {projects.map((project, idx) => {
              const isExpanded = expandedProjects[project.id] ?? false;
              const completed = project.milestones.filter(m => m.completed).length;
              const total = project.milestones.length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isEven = idx % 2 === 0;

              // Project-level delay calculation
              const delayStatus = getProjectDelayStatus(
                project.milestones,
                project.commercialOperationDate
              );
              const codRemaining = project.commercialOperationDate
                ? calculateDaysRemaining(project.commercialOperationDate)
                : null;
              const scheduleConflicts = getProjectScheduleConflicts(
                project.milestones,
                project.commercialOperationDate
              );

              return (
                <React.Fragment key={project.id}>
                  <tr
                    className={`transition ${
                      isEven ? 'bg-white' : 'bg-[#fffaf3]'
                    } hover:bg-orange-50/70`}
                  >
                    {/* Coluna 1: Projecto & Cronograma */}
                    <td className="py-5 px-4 align-top text-center border-r border-[#f2d0aa] bg-orange-50/30">
                      <div className="space-y-2 flex flex-col items-center justify-center">
                        <span className="text-sm sm:text-base font-black text-slate-900 font-heading block leading-tight">
                          {project.shortName || project.name}
                        </span>

                        {/* Capacity & Tech Pill */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-orange-200 shadow-2xs">
                          {getTechIcon(project.technology)}
                          {project.capacity}
                        </span>

                        {/* Data de Finalização do Projecto (COD) - Editável em Data ou Dias */}
                        {editingCODProjectId === project.id ? (
                          <div className="w-full max-w-[220px] flex items-center gap-1 bg-white p-1 rounded-lg border-2 border-orange-400 shadow-xs">
                            <input
                              type="text"
                              value={editingCODValue}
                              onChange={e => setEditingCODValue(e.target.value)}
                              placeholder="Data (ex: 31/12/2028) ou Dias (ex: 40 dias)"
                              className="w-full text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-800 font-bold focus:outline-none"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveEditCOD(project.id);
                                if (e.key === 'Escape') cancelEditCOD();
                              }}
                            />
                            <button
                              onClick={e => saveEditCOD(project.id, e)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Guardar nova data ou dias"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEditCOD}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="group/cod inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-[11px] font-semibold text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs flex-wrap justify-center">
                            <Calendar className="w-3.5 h-3.5 text-[#f08519] shrink-0" />
                            <span className="text-slate-500 font-normal">Prazo Final (COD):</span>
                            <span className="font-bold text-[#002D62]">
                              {project.commercialOperationDate || 'A definir'}
                            </span>
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
                            <button
                              onClick={e =>
                                startEditCOD(
                                  project.id,
                                  project.commercialOperationDate || '',
                                  e
                                )
                              }
                              className="opacity-0 group-hover/cod:opacity-100 p-0.5 text-slate-400 hover:text-orange-600 rounded transition cursor-pointer"
                              title="Alterar prazo de finalização (pode ser data ou em dias, ex: 40 dias)"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        {/* Project Schedule Conflict Warning & Quick Harmonize Button */}
                        {scheduleConflicts.hasConflicts && (
                          <div className="w-full max-w-[220px] bg-amber-50 border border-amber-300 rounded-lg p-2 text-center shadow-2xs animate-fade-in">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-black text-amber-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              Conflito de Prazo ({scheduleConflicts.conflictCount})
                            </div>
                            <p className="text-[10px] text-amber-800 leading-tight mt-0.5">
                              Actividade ultrapassa em {scheduleConflicts.maxExceededDays}d
                            </p>
                            {handleUpdateProjectCOD && scheduleConflicts.latestSuggestedCOD && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateProjectCOD(project.id, scheduleConflicts.latestSuggestedCOD);
                                }}
                                className="mt-1.5 w-full inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-[#002D62] hover:bg-[#083b77] text-white font-bold text-[10px] shadow-2xs cursor-pointer transition active:scale-95"
                                title={`Prolongar prazo do projecto para ${scheduleConflicts.latestSuggestedCOD}`}
                              >
                                <Zap className="w-3 h-3 text-amber-300" />
                                Prolongar para {scheduleConflicts.latestSuggestedCOD}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Project Delay / On-Track Status Alert Badge */}
                        <div
                          className={`w-[180px] h-8 flex items-center justify-center gap-1.5 px-2.5 rounded-lg border text-center shadow-2xs select-none transition text-[11px] ${delayStatus.badgeClass}`}
                          title={delayStatus.statusText}
                        >
                          {delayStatus.isDelayed ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />
                          ) : percent === 100 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span className="truncate">
                            {delayStatus.label.replace(/^[⚠️✓]\s*/, '')}
                          </span>
                        </div>

                        {/* Checklist button - Harmonized size matching Status badge */}
                        <button
                          onClick={() => toggleExpand(project.id)}
                          className={`w-[180px] h-8 flex items-center justify-between px-3 rounded-lg text-[11px] font-bold transition cursor-pointer border shadow-2xs ${
                            percent === 100
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-white text-[#002D62] border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
                          }`}
                          title="Ver / assinalar actividades"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {percent === 100 ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <CheckSquare className="w-3.5 h-3.5 text-[#f08519] shrink-0" />
                            )}
                            <span>Checklist {completed}/{total}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {/* Report, Edit & Delete Actions */}
                        <div className="w-[180px] flex items-center justify-center gap-1.5 pt-0.5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onGenerateReport?.(project);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#002D62] bg-white hover:bg-orange-50 rounded-lg border border-slate-200 hover:border-orange-300 transition cursor-pointer shadow-2xs"
                            title="Gerar Relatório Individual deste Projecto"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#F7942D]" />
                            <span>Relatório</span>
                          </button>
                          <button
                            onClick={e => handleOpenEdit(project, e)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer border border-transparent hover:border-slate-200"
                            title="Editar dados completos do projecto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleDeleteProject(project.id, project.name, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer border border-transparent hover:border-slate-200"
                            title="Eliminar linha do projecto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Coluna 2: Situação actual */}
                    <td className="py-5 px-6 align-top border-r border-[#f2d0aa] text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      <p className="whitespace-pre-line text-slate-800 text-justify sm:text-left">
                        {project.currentSituationSummary || 'Preparação dos estudos de base e acordos institucionais.'}
                      </p>
                    </td>

                    {/* Coluna 3: Decisão ou acção prioritária */}
                    <td className="py-5 px-6 align-top text-xs sm:text-sm text-slate-900 leading-relaxed font-normal">
                      <p className="whitespace-pre-line text-slate-900 text-justify sm:text-left">
                        {project.priorityActionSummary ||
                          (project.priorityActions && project.priorityActions.length > 0
                            ? project.priorityActions.join(' ')
                            : 'Definição e alinhamento interinstitucional prioritário.')}
                      </p>
                    </td>
                  </tr>

                  {/* Linha Expansível da Checklist com Barra Visível de Progressão e Edição */}
                  {isExpanded && (
                    <tr className="bg-slate-50/90 border-t border-[#f2d0aa]">
                      <td colSpan={3} className="p-4 sm:p-5">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                          
                          {/* Cabeçalho da Checklist */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-[#002D62] flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-[#f08519]" />
                                Checklist de Actividades: {project.shortName || project.name}
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                {completed}/{total} Concluídas ({percent}%)
                              </span>
                            </div>
                            <button
                              onClick={() => toggleExpand(project.id)}
                              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                            >
                              Fechar checklist <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* BARRA BEM VISÍVEL DE PROGRESSÃO */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
                                Barra de Progressão do Projecto:
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

                          {/* Lista de Actividades com Checkboxes e Controlo de Datas / Atrasos */}
                          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                            {project.milestones.map((milestone, mIdx) => {
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
                                        Actividade #{mIdx + 1}:
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
                                        {handleUpdateProjectCOD && (
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateProjectCOD(project.id, editingConflict.suggestedNewCOD)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#002D62] hover:bg-[#083b77] text-white font-bold text-[10px] cursor-pointer shadow-xs transition active:scale-95 ml-auto"
                                            title={`Prolongar prazo do projecto para ${editingConflict.suggestedNewCOD}`}
                                          >
                                            <Zap className="w-3 h-3 text-amber-300" />
                                            Prolongar Projecto para "{editingConflict.suggestedNewCOD}"
                                          </button>
                                        )}
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
                                    {/* Left: Checkbox, Number & Description */}
                                    <div
                                      onClick={() => handleToggleMilestone(project.id, milestone.id)}
                                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                    >
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
                                      <span
                                        className={`text-[11px] font-mono w-4 shrink-0 ${
                                          isDone ? 'text-emerald-700 font-bold' : 'text-slate-400'
                                        }`}
                                      >
                                        {mIdx + 1}.
                                      </span>
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

                                    {/* Right: Date & Status Badges + Edit/Delete */}
                                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
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

                                      {/* Botão de Remoção da Actividade */}
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
                                          <strong className="text-amber-900 font-bold">Incoerência de Cronograma:</strong> O prazo desta actividade (<strong>{milestone.targetDate}</strong>) ultrapassa o prazo final do projecto (<strong>{project.commercialOperationDate}</strong>) em <strong className="text-rose-700 font-bold">{conflict.diffDays} {conflict.diffDays === 1 ? 'dia' : 'dias'}</strong>.
                                        </span>
                                      </div>
                                      {handleUpdateProjectCOD && (
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
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Adicionar Nova Actividade com Verificação Inteligente */}
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
                                  className="w-44 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]"
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
                                    {handleUpdateProjectCOD && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateProjectCOD(project.id, newConflict.suggestedNewCOD)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#002D62] hover:bg-[#083b77] text-white font-bold text-[10px] cursor-pointer shadow-xs transition active:scale-95 ml-auto"
                                        title={`Prolongar prazo do projecto para ${newConflict.suggestedNewCOD}`}
                                      >
                                        <Zap className="w-3 h-3 text-amber-300" />
                                        Prolongar Projecto para "{newConflict.suggestedNewCOD}"
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingMilestoneTo(project.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#002D62] pt-1 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Adicionar ponto de situação a este projecto
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
