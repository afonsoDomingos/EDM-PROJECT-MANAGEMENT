import React from 'react';
import {
  FolderKanban,
  Activity,
  CheckCircle,
  AlertOctagon,
  Clock,
  TrendingUp,
  Zap,
  ArrowUpRight,
  CheckSquare,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPercent } from '../../utils/formatters';

export const ExecutiveKpiCards: React.FC = () => {
  const { projects, generationPlants, tasks, setActiveTab, setFilterStatus, clearFilters } = useApp();

  const totalProjects = projects.length;
  const inExecution = projects.filter(p => p.status === 'Em Execução').length;
  const completed = projects.filter(p => p.status === 'Concluído').length;
  const delayed = projects.filter(p => p.status === 'Atrasado').length;
  const atRisk = projects.filter(p => p.status === 'Em Risco').length;

  const avgPhysical =
    totalProjects > 0
      ? projects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects
      : 0;

  const completedTasks = tasks.filter(t => t.status === 'Concluída').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const onScheduleProjects = projects.filter(p => p.status === 'Em Execução' || p.status === 'Concluído').length;
  const scheduleAdherencePercent = totalProjects > 0 ? (onScheduleProjects / totalProjects) * 100 : 0;

  const kpis = [
    {
      title: 'Total de Projectos',
      value: totalProjects,
      subtitle: `${inExecution} em curso activo`,
      icon: FolderKanban,
      color: 'bg-orange-50 text-[#c26508] border-orange-200/80',
      iconBg: 'bg-[#F7942D] text-white',
      actionLabel: 'Ver todos os projectos',
      onClick: () => {
        clearFilters();
        setActiveTab('projects');
      },
    },
    {
      title: 'Em Execução',
      value: inExecution,
      subtitle: `${((inExecution / totalProjects) * 100 || 0).toFixed(0)}% do portfólio`,
      icon: Activity,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      actionLabel: 'Filtrar em execução',
      onClick: () => {
        clearFilters();
        setFilterStatus('Em Execução');
        setActiveTab('projects');
      },
    },
    {
      title: 'Concluídos',
      value: completed,
      subtitle: 'Entregues à exploração',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
      actionLabel: 'Filtrar concluídos',
      onClick: () => {
        clearFilters();
        setFilterStatus('Concluído');
        setActiveTab('projects');
      },
    },
    {
      title: 'Projectos Atrasados',
      value: delayed,
      subtitle: 'Requerem revisão de prazo',
      icon: Clock,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      iconBg: 'bg-orange-500 text-white',
      actionLabel: 'Filtrar atrasados',
      onClick: () => {
        clearFilters();
        setFilterStatus('Atrasado');
        setActiveTab('projects');
      },
    },
    {
      title: 'Projectos em Risco',
      value: atRisk,
      subtitle: 'Atenção executiva crítica',
      icon: AlertOctagon,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
      actionLabel: 'Abrir matriz de riscos',
      onClick: () => {
        setActiveTab('risks');
      },
    },
    {
      title: 'Média de Execução Física',
      value: formatPercent(avgPhysical),
      subtitle: 'Avanço ponderado de obras',
      icon: TrendingUp,
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      iconBg: 'bg-slate-800 text-white',
      progress: avgPhysical,
      actionLabel: 'Ver cronogramas & prazos',
      onClick: () => {
        setActiveTab('schedule');
      },
    },
    {
      title: 'Marcos & Entregas Físicas',
      value: `${completedTasks} / ${totalTasks}`,
      subtitle: `${taskCompletionRate.toFixed(0)}% das entregas técnicas concluídas`,
      icon: CheckSquare,
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      iconBg: 'bg-slate-800 text-white',
      progress: taskCompletionRate,
      tooltip: `${completedTasks} tarefas e marcos de engenharia validados`,
      actionLabel: 'Ver actividades & tarefas',
      onClick: () => {
        setActiveTab('activities');
      },
    },
    {
      title: 'Aderência ao Cronograma',
      value: `${scheduleAdherencePercent.toFixed(0)}%`,
      subtitle: `${onScheduleProjects} de ${totalProjects} no prazo planeado`,
      icon: CalendarDays,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      progress: scheduleAdherencePercent,
      tooltip: `${delayed} com desvio temporal • ${atRisk} em risco`,
      actionLabel: 'Ver cronogramas & prazos',
      onClick: () => {
        setActiveTab('schedule');
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            onClick={kpi.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                kpi.onClick();
              }
            }}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-lg hover:border-[#F7942D]/60 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 relative overflow-hidden group cursor-pointer text-left select-none"
            title={`${kpi.tooltip || kpi.title} • Clique para ${kpi.actionLabel.toLowerCase()}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase group-hover:text-slate-800 transition-colors">
                    {kpi.title}
                  </p>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-[#F7942D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight font-heading group-hover:text-[#F7942D] transition-colors">
                  {kpi.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200 ${kpi.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Optional mini progress bar */}
            {kpi.progress !== undefined && (
              <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#F7942D] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                />
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">{kpi.subtitle}</span>
              <span className="text-[10px] font-bold text-[#F7942D] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                {kpi.actionLabel} →
              </span>
            </div>
          </div>
        );
      })}

      {/* Quick link banner to Generation Pipeline */}
      <div
        onClick={() => setActiveTab('generation')}
        className="col-span-1 sm:col-span-2 lg:col-span-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200/90 hover:border-orange-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F7942D] text-white flex items-center justify-center shadow-xs shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Pipeline Estratégico de Centrais Eléctricas (2026)
              </span>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                27 Centrais • {generationPlants.reduce((acc, p) => acc + p.capacityMW, 0).toLocaleString('pt-PT')} MW
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Monitorização da capacidade energética nacional: centrais térmicas a gás, hídricas, dual fuel e offshore em operação e desenvolvimento.
            </span>
          </div>
        </div>
        <button className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#c26508] bg-white px-3.5 py-2 rounded-xl border border-orange-200 shadow-2xs hover:bg-orange-50 transition shrink-0">
          Explorar Matriz MW →
        </button>
      </div>
    </div>
  );
};
