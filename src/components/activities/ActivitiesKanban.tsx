import React, { useState } from 'react';
import {
  CheckSquare,
  PlusCircle,
  LayoutGrid,
  List,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, PriorityLevel } from '../../types';
import { formatDatePt } from '../../utils/formatters';

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
  { id: 'Por Iniciar', title: 'Por Iniciar', color: 'border-slate-300', badgeBg: 'bg-slate-100 text-slate-700' },
  { id: 'Em Curso', title: 'Em Curso', color: 'border-orange-400', badgeBg: 'bg-orange-100 text-orange-800' },
  { id: 'Bloqueada', title: 'Bloqueadas', color: 'border-red-400', badgeBg: 'bg-red-100 text-red-800' },
  { id: 'Atrasada', title: 'Atrasadas', color: 'border-amber-400', badgeBg: 'bg-amber-100 text-amber-800' },
  { id: 'Concluída', title: 'Concluídas', color: 'border-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-800' },
];

export const ActivitiesKanban: React.FC = () => {
  const { tasks, projects, updateTask, addTask, deleteTask, setSelectedProjectId, isReadOnly } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('Todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // New task modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    projectId: projects[0]?.id || '',
    title: '',
    description: '',
    assignee: 'Eng. Armindo Macaringue',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'Alta',
    status: 'Por Iniciar',
    progressPercent: 0,
  });

  const filteredTasks = tasks.filter(t => {
    if (selectedProjectFilter !== 'Todos' && t.projectId !== selectedProjectFilter) return false;
    if (selectedStatusFilter !== 'Todos' && t.status !== selectedStatusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchAssignee = t.assignee.toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee) return false;
    }
    return true;
  });

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    if (isReadOnly) return;
    const progress = newStatus === 'Concluída' ? 100 : newStatus === 'Por Iniciar' ? 0 : task.progressPercent;
    updateTask({ ...task, status: newStatus, progressPercent: progress });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title?.trim() || !taskForm.projectId) return;
    addTask({
      projectId: taskForm.projectId,
      title: taskForm.title,
      description: taskForm.description || '',
      assignee: taskForm.assignee || 'Eng. Responsável',
      startDate: taskForm.startDate || new Date().toISOString().split('T')[0],
      dueDate: taskForm.dueDate || new Date().toISOString().split('T')[0],
      priority: taskForm.priority as PriorityLevel,
      status: taskForm.status as TaskStatus,
      progressPercent: taskForm.progressPercent || 0,
    });
    setShowNewTaskModal(false);
    setTaskForm({
      projectId: projects[0]?.id || '',
      title: '',
      description: '',
      assignee: 'Eng. Armindo Macaringue',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      priority: 'Alta',
      status: 'Por Iniciar',
      progressPercent: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Gestão de Actividades e Tarefas
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508] font-bold">
              {filteredTasks.length} tarefas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quadro Kanban e tabela de actividades distribuídas por projecto e equipas técnicas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
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

          {!isReadOnly && (
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Criar Tarefa
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filtrar por Projecto:
          </label>
          <select
            value={selectedProjectFilter}
            onChange={e => setSelectedProjectFilter(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Todos">Todos os Projectos ({projects.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name.slice(0, 45)}...
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filtrar por Estado:
          </label>
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Todos">Todos os Estados</option>
            {KANBAN_COLUMNS.map(col => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Pesquisar por Título/Responsável:
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Ex: torres, betão, comissionamento..."
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
          </input>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {KANBAN_COLUMNS.map(column => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            return (
              <div
                key={column.id}
                className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200 flex flex-col min-h-[500px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F7942D]" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {column.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${column.badgeBg}`}>
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <div
                        key={task.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            onClick={() => setSelectedProjectId(task.projectId)}
                            className="text-[10px] font-bold font-mono text-[#c26508] bg-orange-50 hover:bg-orange-100 px-1.5 py-0.5 rounded cursor-pointer transition truncate max-w-[130px]"
                            title={project?.name}
                          >
                            {project?.code || task.projectId}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              task.priority === 'Crítica'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'Alta'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#c26508] transition leading-snug">
                          {task.title}
                        </h5>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{task.assignee.split(' ')[0]} {task.assignee.split(' ')[1]}</span>
                          <span>Prazo: {formatDatePt(task.dueDate)}</span>
                        </div>

                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-600 mb-0.5">
                            <span>Progresso</span>
                            <span>{task.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#F7942D] h-full rounded-full"
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Status Mover */}
                        {!isReadOnly && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Mover:</span>
                            <select
                              value={task.status}
                              onChange={e => handleStatusChange(task, e.target.value as TaskStatus)}
                              className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                            >
                              {KANBAN_COLUMNS.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Nenhuma tarefa nesta fase.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Código / Projecto</th>
                <th className="py-3 px-4">Tarefa</th>
                <th className="py-3 px-3">Responsável</th>
                <th className="py-3 px-3">Prazo</th>
                <th className="py-3 px-3 text-center">Progresso</th>
                <th className="py-3 px-3 text-center">Estado</th>
                {!isReadOnly && <th className="py-3 px-4 text-right">Alterar Estado</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(t => {
                const project = projects.find(p => p.id === t.projectId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span
                        onClick={() => setSelectedProjectId(t.projectId)}
                        className="font-mono text-xs font-bold text-[#c26508] hover:underline cursor-pointer"
                      >
                        {project?.code || t.projectId}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{project?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{t.title}</div>
                      <span className="text-[10px] text-slate-400">Prioridade: {t.priority}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{t.assignee}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDatePt(t.dueDate)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-slate-900">{t.progressPercent}%</span>
                      <div className="w-16 mx-auto bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#F7942D] h-full rounded-full"
                          style={{ width: `${t.progressPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Concluída'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Atrasada'
                            ? 'bg-amber-100 text-amber-800'
                            : t.status === 'Bloqueada'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4 text-right">
                        <select
                          value={t.status}
                          onChange={e => handleStatusChange(t, e.target.value as TaskStatus)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
                        >
                          {KANBAN_COLUMNS.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Criar Nova Actividade / Tarefa
              </h4>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Projecto Associado *
                </label>
                <select
                  required
                  value={taskForm.projectId}
                  onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Montagem das cruzetas do PT 04..."
                  value={taskForm.title || ''}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={taskForm.assignee || ''}
                    onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prazo Limite *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate || ''}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as PriorityLevel })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {KANBAN_COLUMNS.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-5 -mb-5 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#F7942D] hover:bg-[#e07d17] rounded-xl shadow-md transition"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
