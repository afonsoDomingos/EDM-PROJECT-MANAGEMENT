import React, { useState } from 'react';
import {
  FolderKanban,
  PlusCircle,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  Search,
  TrendingUp,
  User,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import {
  formatDatePt,
  formatPercent,
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
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

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

      {/* Clean & Sleek Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Quick Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por código, nome, província ou gestor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
          />
        </div>

        {/* Status Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#002D62] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          {(searchQuery || filterStatus !== 'Todos' || filterRegion !== 'Todas' || filterCategory !== 'Todas') && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 transition"
              title="Limpar todos os filtros"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(p => {
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

                  {/* Timeline & Phase Info */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Término Previsto</span>
                      <span className="font-semibold text-slate-800">
                        {formatDatePt(p.expectedEndDate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Fase da Obra</span>
                      <span className="font-semibold text-[#c26508] truncate max-w-[130px] inline-block">
                        {p.phase || 'Obras Civis'}
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
                          setProjectToDelete(p);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
                  <th className="py-3 px-3 text-center hidden sm:table-cell whitespace-nowrap">Término Previsto</th>
                  <th className="py-3 px-3 text-left hidden sm:table-cell whitespace-nowrap">Fase da Obra</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Estado</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.map(p => {
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
                      <td className="py-3 px-3 text-center text-slate-700 hidden sm:table-cell whitespace-nowrap">
                        {formatDatePt(p.expectedEndDate)}
                      </td>
                      <td className="py-3 px-3 text-left hidden sm:table-cell whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-[#c26508] border border-orange-200/60">
                          {p.phase || 'Obras Civis'}
                        </span>
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

      {/* Modal Visual de Confirmação de Eliminação */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full overflow-hidden animate-scale-in">
            <div className="px-5 py-4 flex items-center justify-between border-b border-rose-100 bg-rose-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Trash2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Eliminar Projecto
                  </h3>
                  <span className="text-[11px] font-bold text-rose-700 block">
                    Confirmação de Segurança
                  </span>
                </div>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 font-medium">
                Tem a certeza que deseja eliminar o projecto <strong className="text-slate-900">"{projectToDelete.name}"</strong> ({projectToDelete.code})?
              </p>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Esta acção é irreversível e removerá todas as tarefas, cronograma e relatórios deste projecto.</span>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProject(projectToDelete.id);
                    setProjectToDelete(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sim, Eliminar Projecto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
