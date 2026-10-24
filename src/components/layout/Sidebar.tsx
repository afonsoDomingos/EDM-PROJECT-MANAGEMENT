import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  CalendarDays,
  CheckSquare,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  History,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    projects,
    tasks,
    risks,
    setSelectedProjectId,
  } = useApp();

  const delayedCount = projects.filter(
    p => p.status === 'Atrasado' || p.status === 'Em Risco'
  ).length;

  const pendingTasksCount = tasks.filter(
    t => t.status === 'Em Curso' || t.status === 'Atrasada' || t.status === 'Bloqueada'
  ).length;

  const criticalRisksCount = risks.filter(
    r => r.level === 'Crítico' || r.level === 'Alto'
  ).length;

  const navItems = [
    { id: 'dashboard',   label: 'Dashboard Executivo',     icon: LayoutDashboard, badge: null },
    { id: 'projects',    label: 'Gestão de Projectos',     icon: FolderGit2,      badge: projects.length },
    { id: 'schedule',    label: 'Cronogramas & Prazos',    icon: CalendarDays,    badge: delayedCount > 0 ? delayedCount : null, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'activities',  label: 'Actividades & Tarefas',   icon: CheckSquare,     badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'financial',   label: 'Gestão Financeira',       icon: DollarSign,      badge: null },
    { id: 'risks',       label: 'Riscos & Problemas',      icon: AlertTriangle,   badge: criticalRisksCount > 0 ? criticalRisksCount : null, badgeColor: 'bg-red-100 text-red-700' },
    { id: 'reports',     label: 'Relatórios & Exportação', icon: FileSpreadsheet, badge: null },
    { id: 'audit',       label: 'Auditoria',               icon: History,         badge: null },
    { id: 'settings',    label: 'Configurações',           icon: ShieldCheck,     badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-edm.webp" alt="EDM" className="h-6 w-auto object-contain" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 block">
                EDM Portal
              </span>
              <span className="text-[10px] text-[#c26508] font-semibold">Project Management</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedProjectId(null);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#F7942D] text-white shadow-sm shadow-orange-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : (item as any).badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center">
            EDM Project Management System
          </p>
        </div>
      </aside>
    </>
  );
};
