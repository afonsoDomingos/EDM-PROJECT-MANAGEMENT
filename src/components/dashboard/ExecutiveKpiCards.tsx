import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Activity,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const ExecutiveKpiCards: React.FC = () => {
  const { projects, tasks, setActiveTab, setFilterStatus, clearFilters } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const totalProjects = projects.length;
  const inExecution = projects.filter(p => p.status === 'Em Execução').length;
  const completed = projects.filter(p => p.status === 'Concluído').length;
  const delayed = projects.filter(p => p.status === 'Atrasado').length;
  const atRisk = projects.filter(p => p.status === 'Em Risco').length;

  const avgPhysical =
    totalProjects > 0
      ? projects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects
      : 0;

  const kpis = [
    {
      title: 'Total de Projectos',
      numericValue: totalProjects + 5,
      decimals: 0,
      suffix: '',
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
      numericValue: inExecution,
      decimals: 0,
      suffix: '',
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
      numericValue: avgPhysical,
      decimals: 1,
      suffix: '%',
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
      numericValue: delayed + atRisk,
      decimals: 0,
      suffix: delayed + atRisk === 1 ? ' Projecto' : ' Projectos',
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
            className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-[#F7942D]/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer text-left select-none group transform ${
              isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
            }`}
            style={{
              transitionDelay: `${index * 80}ms`,
            }}
            title={`${kpi.tooltip || kpi.title} • Clique para ${kpi.actionLabel.toLowerCase()}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  {kpi.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                  <AnimatedCounter
                    value={kpi.numericValue}
                    decimals={kpi.decimals}
                    suffix={kpi.suffix}
                    duration={1000 + index * 120}
                  />
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${kpi.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Dynamic Animated progress bar */}
            {kpi.progress !== undefined && (
              <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: isMounted ? `${Math.min(kpi.progress, 100)}%` : '0%' }}
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

