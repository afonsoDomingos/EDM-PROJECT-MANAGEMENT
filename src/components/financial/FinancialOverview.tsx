import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Building2,
  Clock,
  MapPin,
  Eye,
  Filter,
  CheckSquare,
  Activity,
  HardHat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatDatePt,
  formatPercent,
  exportToCsv,
} from '../../utils/formatters';

export const FinancialOverview: React.FC = () => {
  const { projects, tasks, setSelectedProjectId } = useApp();

  const [selectedRegionFilter, setSelectedRegionFilter] = useState('Todas');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todos');

  // Physical execution aggregates
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === 'Em Execução').length;
  const completedProjects = projects.filter(p => p.status === 'Concluído').length;
  const delayedProjects = projects.filter(p => p.status === 'Atrasado').length;
  const atRiskProjects = projects.filter(p => p.status === 'Em Risco').length;

  const avgPhysical =
    totalProjects > 0
      ? projects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects
      : 0;

  const completedTasks = tasks.filter(t => t.status === 'Concluída').length;
  const totalTasks = tasks.length;
  const tasksRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Projects requiring physical monitoring attention
  const criticalProjects = projects.filter(p => p.status === 'Atrasado' || p.status === 'Em Risco');

  // Filtering
  const filteredProjects = projects.filter(p => {
    if (selectedRegionFilter !== 'Todas' && p.region !== selectedRegionFilter) return false;
    if (selectedCategoryFilter !== 'Todas' && p.category !== selectedCategoryFilter) return false;
    if (selectedStatusFilter !== 'Todos' && p.status !== selectedStatusFilter) return false;
    return true;
  });

  const categories = ['Todas', ...Array.from(new Set(projects.map(p => p.category)))];

  const handleExportCsv = () => {
    const headers = [
      'Código',
      'Nome do Projecto',
      'Categoria',
      'Região',
      'Província',
      'Gestor',
      'Fase Actual',
      'Data Início',
      'Conclusão Prevista',
      'Avanço Físico (%)',
      'Estado',
      'Financiador',
    ];
    const rows = filteredProjects.map(p => [
      p.code,
      p.name,
      p.category,
      p.region,
      p.province,
      p.manager,
      p.phase || 'Obras Civis',
      p.startDate,
      p.expectedEndDate,
      p.physicalProgress,
      p.status,
      p.fundingSource,
    ]);
    exportToCsv('acompanhamento_execucao_projectos_edm', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Acompanhamento da Execução dos Projectos
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508] font-bold flex items-center gap-1">
              <Activity className="w-3 h-3" /> Foco Físico-Temporal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitorização executiva do progresso físico de obras, cronogramas de empreitada e fases de engenharia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar Relatório Físico
          </button>
        </div>
      </div>

      {/* Physical Execution Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Avanço Físico Global
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatPercent(avgPhysical)}
          </h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#F7942D] h-full rounded-full"
              style={{ width: `${Math.min(avgPhysical, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Média ponderada da carteira
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            Obras em Curso Activo
          </span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {inProgressProjects}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {completedProjects} empreitadas 100% concluídas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
            Alertas de Cronograma
          </span>
          <h3 className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {delayedProjects + atRiskProjects}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {delayedProjects} atrasados • {atRiskProjects} em risco
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-[#c26508] uppercase tracking-wide">
            Marcos Técnicos Validados
          </span>
          <h3 className="text-2xl font-black text-[#F7942D] mt-1 font-mono">
            {completedTasks} / {totalTasks}
          </h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(tasksRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {tasksRate.toFixed(0)}% das entregas de engenharia
          </p>
        </div>
      </div>

      {/* Critical Path Alerts Section */}
      {criticalProjects.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-900 font-heading">
              Projectos no Caminho Crítico & Desvios Temporais ({criticalProjects.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalProjects.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="bg-white p-3.5 rounded-xl border border-amber-200 hover:shadow-md cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#c26508] bg-orange-50 px-1.5 py-0.5 rounded">
                    {p.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {p.status}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">{p.name}</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.province} • {p.manager}</p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Avanço Físico: <strong>{p.physicalProgress}%</strong></span>
                  <span className="text-amber-800 font-medium">Fim: {formatDatePt(p.expectedEndDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Execution Tracking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros:
            </span>

            {/* Region Filter */}
            <select
              value={selectedRegionFilter}
              onChange={e => setSelectedRegionFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="Todas">Todas as Regiões</option>
              <option value="Norte">Norte</option>
              <option value="Centro">Centro</option>
              <option value="Sul">Sul</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 max-w-xs truncate"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="Todos">Todos os Estados</option>
              <option value="Em Execução">Em Execução</option>
              <option value="Concluído">Concluído</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Em Risco">Em Risco</option>
              <option value="Por Iniciar">Por Iniciar</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {filteredProjects.length} empreitadas listadas
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Código & Empreendimento</th>
                <th className="py-3 px-3">Localização</th>
                <th className="py-3 px-3">Gestor & Pelouro</th>
                <th className="py-3 px-3 text-center">Progresso Físico</th>
                <th className="py-3 px-3 text-center">Término Previsto</th>
                <th className="py-3 px-3 text-left">Fase Actual da Obra</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum projecto encontrado para os filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredProjects.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="font-bold text-slate-900 leading-snug">{p.name}</div>
                      <span className="font-mono text-[10px] text-slate-500">{p.code} • {p.category}</span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-[#F7942D]" />
                        {p.province}
                      </div>
                      <span className="text-[10px] text-slate-400 pl-4">{p.region}</span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{p.manager}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{p.department}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center min-w-[130px]">
                      <div className="font-mono font-bold text-slate-900">{p.physicalProgress}%</div>
                      <div className="w-20 mx-auto bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#F7942D] h-full rounded-full"
                          style={{ width: `${p.physicalProgress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{formatDatePt(p.expectedEndDate)}</div>
                      <div className="text-[10px] text-slate-400">Início: {formatDatePt(p.startDate)}</div>
                    </td>
                    <td className="py-3.5 px-3 text-left">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-orange-50 text-[#c26508] border border-orange-200/60 truncate max-w-[160px]">
                        {p.phase || 'Obras Civis & Montagem'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Concluído'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Em Execução'
                            ? 'bg-orange-100 text-[#c26508]'
                            : p.status === 'Atrasado'
                            ? 'bg-amber-100 text-amber-800'
                            : p.status === 'Em Risco'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedProjectId(p.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-[#F7942D] hover:text-white rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Obra
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
