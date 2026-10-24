import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { calculateFinancialExecution, formatCompactMZN } from '../../utils/formatters';

const STATUS_COLORS: Record<string, string> = {
  'Em Execução': '#F7942D',
  'Concluído': '#10b981',
  'Atrasado': '#f97316',
  'Em Risco': '#ef4444',
  'Por Iniciar': '#94a3b8',
};

const CATEGORY_COLORS = ['#F7942D', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export const ExecutiveCharts: React.FC = () => {
  const { projects } = useApp();

  // 1. Projects by Status
  const statusCounts: Record<string, number> = {};
  projects.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#64748b',
  }));

  // 2. Physical vs Financial Execution Comparison (top 7 active projects)
  const comparisonData = projects
    .filter(p => p.status !== 'Por Iniciar')
    .slice(0, 8)
    .map(p => {
      const finExec = calculateFinancialExecution(p.spentBudget, p.revisedBudget);
      return {
        name: p.code,
        fullName: p.name,
        'Execução Física (%)': p.physicalProgress,
        'Execução Financeira (%)': finExec,
      };
    });

  // 3. Projects by Region
  const regionCounts: Record<string, number> = { Norte: 0, Centro: 0, Sul: 0 };
  const regionBudget: Record<string, number> = { Norte: 0, Centro: 0, Sul: 0 };
  projects.forEach(p => {
    regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
    regionBudget[p.region] = (regionBudget[p.region] || 0) + p.revisedBudget;
  });
  const regionData = [
    { region: 'Região Norte', projectos: regionCounts['Norte'], orcamento: regionBudget['Norte'] },
    { region: 'Região Centro', projectos: regionCounts['Centro'], orcamento: regionBudget['Centro'] },
    { region: 'Região Sul', projectos: regionCounts['Sul'], orcamento: regionBudget['Sul'] },
  ];

  // 4. Budget by Category
  const categoryBudgets: Record<string, number> = {};
  projects.forEach(p => {
    categoryBudgets[p.category] = (categoryBudgets[p.category] || 0) + p.revisedBudget;
  });
  const categoryData = Object.entries(categoryBudgets).map(([name, value], index) => ({
    name,
    value,
    formatted: formatCompactMZN(value),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  // Custom tooltips
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <p className="font-bold text-orange-400 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <p className="font-bold text-slate-100">{data.name}</p>
          <p className="text-orange-400 font-semibold mt-0.5">
            Orçamento: {formatCompactMZN(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Chart 1: Physical vs Financial Execution Comparison */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Comparação: Execução Física vs Financeira
            </h4>
            <p className="text-xs text-slate-500">
              Desvio entre avanço de obra física e desembolso orçamental
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Principais Projectos
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
              <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Execução Física (%)" fill="#F7942D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Execução Financeira (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Project Distribution by Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Distribuição de Projectos por Estado
            </h4>
            <p className="text-xs text-slate-500">
              Visão consolidada do estado operacional dos empreendimentos
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            100% Portfólio
          </span>
        </div>

        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} projecto(s)`, name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Distribution by Region */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Projectos e Orçamento por Região
            </h4>
            <p className="text-xs text-slate-500">
              Descentralização geográfica: Norte, Centro e Sul
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: any, name: any) => {
                  if (name === 'Orçamento (MZN)') return [formatCompactMZN(value), name];
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="projectos" name="Qtd. Projectos" fill="#F7942D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Budget Distribution by Category */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Distribuição Orçamental por Categoria
            </h4>
            <p className="text-xs text-slate-500">
              Volume financeiro aprovado por tipologia de infra-estrutura
            </p>
          </div>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                outerRadius={85}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: any) =>
                  `${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cat-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomCategoryTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
