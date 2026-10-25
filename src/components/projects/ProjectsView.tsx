import React, { useState } from 'react';
import {
  FolderKanban,
  PlusCircle,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import {
  formatCompactMZN,
  formatDatePt,
  formatPercent,
  calculateFinancialExecution,
} from '../../utils/formatters';

interface ProjectsViewProps {
  onOpenCreateModal: () => void;
  onOpenEditModal: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenCreateModal,
  onOpenEditModal,
}) => {
  const {
    projects,
    setSelectedProjectId,
    deleteProject,
    canEditProject,
    canDelete,
    searchQuery,
    setSearchQuery,
    filterRegion,
    setFilterRegion,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterManager,
    setFilterManager,
    clearFilters,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const regions = ['Todas', 'Norte', 'Centro', 'Sul'];
  const statuses = ['Todos', 'Em Execução', 'Concluído', 'Atrasado', 'Em Risco', 'Por Iniciar'];
  const categories = [
    'Todas',
    'Electrificação Rural',
    'Expansão da Rede',
    'Construção de Subestações',
    'Reabilitação de Infra-estruturas',
    'Instalação de Postos de Transformação',
  ];
  const managers = ['Todos', ...Array.from(new Set(projects.map(p => p.manager)))];

  // Filtering
  const filteredProjects = projects.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchProv = p.province.toLowerCase().includes(q);
      const matchMgr = p.manager.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchProv && !matchMgr && !matchCat) return false;
    }
    if (filterRegion !== 'Todas' && p.region !== filterRegion) return false;
    if (filterStatus !== 'Todos' && p.status !== filterStatus) return false;
    if (filterCategory !== 'Todas' && p.category !== filterCategory) return false;
    if (filterManager !== 'Todos' && p.manager !== filterManager) return false;
    return true;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Em Execução':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7942D]" />
            Em Execução
          </span>
        );
      case 'Concluído':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Concluído
          </span>
        );
      case 'Atrasado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            Atrasado
          </span>
        );
      case 'Em Risco':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Em Risco
          </span>
        );
      case 'Por Iniciar':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Por Iniciar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Carteira Geral de Projectos EDM
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508] font-bold">
              {filteredProjects.length} de {projects.length}
            </span>
          </div>

        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grelha
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              Tabela
            </button>
          </div>

          {canEditProject() && (
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Projecto
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Região:
          </label>
          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            {regions.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Estado:
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Categoria:
          </label>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Gestor:
          </label>
          <select
            value={filterManager}
            onChange={e => setFilterManager(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate"
          >
            {managers.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(p => {
            const finExec = calculateFinancialExecution(p.spentBudget, p.revisedBudget);
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-lg hover:border-orange-200 transition duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#c26508] bg-orange-50 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    {getStatusBadge(p.status)}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#c26508] transition leading-snug line-clamp-2">
                    {p.name}
                  </h4>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#F7942D]" />
                        {p.province}
                      </span>
                      <span className="text-[11px]">{formatDatePt(p.expectedEndDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                  {/* Progress Bars */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-600">Execução Física</span>
                      <span className="font-bold text-[#F7942D]">{p.physicalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#F7942D] h-full rounded-full"
                        style={{ width: `${p.physicalProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Orçamento Revisto</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCompactMZN(p.revisedBudget)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Exec. Financeira</span>
                      <span className="font-mono font-bold text-[#c26508]">
                        {formatPercent(finExec)}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    {canEditProject(p) && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenEditModal(p);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Editar Projecto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete() && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Eliminar ${p.code}?`)) {
                            deleteProject(p.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar Projecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedProjectId(p.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-[#F7942D] text-[#c26508] hover:text-white text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Ficha
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[680px] lg:min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Código & Nome</th>
                  <th className="py-3 px-3 hidden md:table-cell">Localização</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Gestor</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Exec. Física</th>
                  <th className="py-3 px-3 text-center hidden sm:table-cell whitespace-nowrap">Exec. Financeira</th>
                  <th className="py-3 px-3 text-right hidden sm:table-cell whitespace-nowrap">Orçamento</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Estado</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.map(p => {
                  const finExec = calculateFinancialExecution(p.spentBudget, p.revisedBudget);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="font-bold text-slate-900 leading-snug">{p.name}</div>
                        <span className="font-mono text-[10px] text-slate-500">{p.code} • {p.category}</span>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell whitespace-nowrap">{p.province} ({p.region})</td>
                      <td className="py-3 px-3 hidden lg:table-cell whitespace-nowrap">{p.manager}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#F7942D] whitespace-nowrap">
                        {p.physicalProgress}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#c26508] hidden sm:table-cell whitespace-nowrap">
                        {formatPercent(finExec)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 hidden sm:table-cell whitespace-nowrap">
                        {formatCompactMZN(p.revisedBudget)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">{getStatusBadge(p.status)}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedProjectId(p.id);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-[#F7942D] hover:text-white rounded-lg transition"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
