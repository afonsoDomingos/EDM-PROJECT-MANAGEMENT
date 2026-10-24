import React from 'react';
import {
  FolderKanban,
  Activity,
  CheckCircle,
  AlertOctagon,
  Clock,
  TrendingUp,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCompactMZN, formatCurrency, formatPercent, calculateFinancialExecution } from '../../utils/formatters';

export const ExecutiveKpiCards: React.FC = () => {
  const { projects } = useApp();

  const totalProjects = projects.length;
  const inExecution = projects.filter(p => p.status === 'Em Execução').length;
  const completed = projects.filter(p => p.status === 'Concluído').length;
  const delayed = projects.filter(p => p.status === 'Atrasado').length;
  const atRisk = projects.filter(p => p.status === 'Em Risco').length;

  const avgPhysical =
    totalProjects > 0
      ? projects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects
      : 0;

  const totalApprovedBudget = projects.reduce((acc, p) => acc + (p.approvedBudget || 0), 0);
  const totalRevisedBudget = projects.reduce((acc, p) => acc + (p.revisedBudget || 0), 0);
  const totalSpentBudget = projects.reduce((acc, p) => acc + (p.spentBudget || 0), 0);

  const globalFinancialExec = calculateFinancialExecution(totalSpentBudget, totalRevisedBudget);

  const kpis = [
    {
      title: 'Total de Projectos',
      value: totalProjects,
      subtitle: `${inExecution} em curso activo`,
      icon: FolderKanban,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-500 text-white',
    },
    {
      title: 'Em Execução',
      value: inExecution,
      subtitle: `${((inExecution / totalProjects) * 100 || 0).toFixed(0)}% do portfólio`,
      icon: Activity,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-500 text-white',
    },
    {
      title: 'Concluídos',
      value: completed,
      subtitle: 'Entregues à exploração',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
    },
    {
      title: 'Projectos Atrasados',
      value: delayed,
      subtitle: 'Requerem revisão de prazo',
      icon: Clock,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      iconBg: 'bg-orange-500 text-white',
    },
    {
      title: 'Projectos em Risco',
      value: atRisk,
      subtitle: 'Atenção executiva crítica',
      icon: AlertOctagon,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
    },
    {
      title: 'Média de Execução Física',
      value: formatPercent(avgPhysical),
      subtitle: 'Avanço ponderado de obras',
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      progress: avgPhysical,
    },
    {
      title: 'Orçamento Aprovado',
      value: formatCompactMZN(totalApprovedBudget),
      subtitle: `Revisto: ${formatCompactMZN(totalRevisedBudget)}`,
      icon: DollarSign,
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      iconBg: 'bg-slate-800 text-white',
      tooltip: formatCurrency(totalApprovedBudget),
    },
    {
      title: 'Execução Financeira Global',
      value: formatPercent(globalFinancialExec),
      subtitle: `${formatCompactMZN(totalSpentBudget)} desembolsados`,
      icon: PieChart,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      progress: globalFinancialExec,
      tooltip: `Desembolsado: ${formatCurrency(totalSpentBudget)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group"
            title={kpi.tooltip}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  {kpi.title}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight font-heading">
                  {kpi.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${kpi.iconBg}`}
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
              <span>{kpi.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
