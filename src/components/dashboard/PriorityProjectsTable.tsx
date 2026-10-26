import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import { formatDatePt } from '../../utils/formatters';

interface PriorityProjectsTableProps {
  onOpenCreateModal: () => void;
}

export const PriorityProjectsTable: React.FC<PriorityProjectsTableProps> = ({
  onOpenCreateModal,
}) => {
  const {
    projects,
    setSelectedProjectId,
    setActiveTab,
    canEditProject,
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

  const [sortField, setSortField] = useState<keyof Project>('physicalProgress');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter options
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
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchProv = p.province.toLowerCase().includes(q);
      const matchMgr = p.manager.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchProv && !matchMgr && !matchCat) return false;
    }
    // Region
    if (filterRegion !== 'Todas' && p.region !== filterRegion) return false;
    // Status
    if (filterStatus !== 'Todos' && p.status !== filterStatus) return false;
    // Category
    if (filterCategory !== 'Todas' && p.category !== filterCategory) return false;
    // Manager
    if (filterManager !== 'Todos' && p.manager !== filterManager) return false;

    return true;
  });

  // Sorting
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    const strA = String(valA || '');
    const strB = String(valB || '');
    return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const toggleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Projectos Prioritários da EDM
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508] font-bold">
                {filteredProjects.length} de {projects.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {/* Region filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Região:
            </label>
            <select
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#F7942D]"
            >
              {regions.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Estado:
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#F7942D]"
            >
              {statuses.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Categoria:
            </label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#F7942D] truncate"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Manager filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Gestor Responsável:
            </label>
            <select
              value={filterManager}
              onChange={e => setFilterManager(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#F7942D] truncate"
            >
              {managers.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table Body with Responsive Scroll */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[680px] lg:min-w-full">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th
                onClick={() => toggleSort('code')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1">
                  Código & Nome
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('province')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  Localização
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('category')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition hidden lg:table-cell"
              >
                Categoria
              </th>
              <th
                onClick={() => toggleSort('physicalProgress')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition text-center whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  Exec. Física
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('expectedEndDate')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition text-center hidden sm:table-cell whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  Término Previsto
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-left hidden sm:table-cell whitespace-nowrap">
                Fase da Obra
              </th>
              <th
                onClick={() => toggleSort('status')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition text-center whitespace-nowrap"
              >
                Estado
              </th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Acção</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Nenhum projecto encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              sortedProjects.map(p => {
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-orange-50/20 transition cursor-pointer group"
                    onClick={() => {
                      setSelectedProjectId(p.id);
                    }}
                  >
                    {/* Code & Name (Clean, without excessive phase text) */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="font-bold text-slate-900 group-hover:text-[#c26508] transition leading-snug">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                          {p.code}
                        </span>
                        <span className="truncate max-w-[220px] text-slate-500">
                          • {p.manager}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-[#F7942D]" />
                        {p.province}
                      </div>
                      <div className="text-[11px] text-slate-500 pl-4">{p.region}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 hidden lg:table-cell">
                      <span className="text-slate-700 font-medium">{p.category}</span>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {p.fundingSource} {p.modality ? `• ${p.modality}` : ''}
                      </div>
                    </td>

                    {/* Physical Progress */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-bold text-slate-900 font-mono">
                        {p.physicalProgress}%
                      </div>
                      <div className="w-16 mx-auto bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#F7942D] h-full rounded-full"
                          style={{ width: `${p.physicalProgress}%` }}
                        />
                      </div>
                    </td>

                    {/* Planned End Date */}
                    <td className="py-3.5 px-3 text-center hidden sm:table-cell">
                      <div className="font-semibold text-xs text-slate-800 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDatePt(p.expectedEndDate)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Início: {formatDatePt(p.startDate)}
                      </div>
                    </td>

                    {/* Work Phase */}
                    <td className="py-3.5 px-3 text-left hidden sm:table-cell">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-orange-50 text-[#c26508] border border-orange-200/60 truncate max-w-[180px]">
                        {p.phase || 'Obras Civis & Montagem'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      {getStatusBadge(p.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedProjectId(p.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#F7942D] hover:text-white text-slate-700 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
