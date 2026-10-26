import React from 'react';
import {
  FolderKanban,
  Activity,
  AlertOctagon,
  TrendingUp,
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
      value: totalProjects + 5,
      subtitle: `${totalProjects} EDM + 5 Governamentais`,
      icon: FolderKanban,
      color: 'bg-orange-50 text-[#c26508] border-orange-200/80',
      iconBg: 'bg-[#F7942D] text-white',
      tooltip: 'Portfólio Consolidado: 35 Operacionais EDM + 5 Estratégicos Governamentais',
      actionLabel: 'Ver todos os projectos',
      onClick: () => {
        clearFilters();
        setActiveTab('projects');
      },
    },
    {
      title: 'Em Execução Activa',
      value: inExecution,
      subtitle: `${inExecution} em curso • ${completed} concluído`,
      icon: Activity,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-[#002D62] text-white',
      actionLabel: 'Filtrar em execução',
      onClick: () => {
        clearFilters();
        setFilterStatus('Em Execução');
        setActiveTab('projects');
      },
    },
    {
      title: 'Média de Execução Física',
      value: formatPercent(avgPhysical),
      subtitle: 'Avanço ponderado de obras',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      progress: avgPhysical,
      actionLabel: 'Ver cronogramas & prazos',
      onClick: () => {
        setActiveTab('schedule');
      },
    },
    {
      title: 'Desvios & Riscos',
      value: `${delayed + atRisk} Projectos`,
      subtitle: `${delayed} com atraso • ${atRisk} em risco`,
      icon: AlertOctagon,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
      actionLabel: 'Abrir matriz de riscos',
      onClick: () => {
        setActiveTab('risks');
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
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#F7942D]/50 transition-all duration-200 cursor-pointer text-left select-none group"
            title={`${kpi.tooltip || kpi.title} • Clique para ${kpi.actionLabel.toLowerCase()}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  {kpi.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                  {kpi.value}
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${kpi.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Optional mini progress bar */}
            {kpi.progress !== undefined && (
              <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                />
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-500">{kpi.subtitle}</span>
              <span className="text-[10px] font-bold text-[#F7942D] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                {kpi.actionLabel} →
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
