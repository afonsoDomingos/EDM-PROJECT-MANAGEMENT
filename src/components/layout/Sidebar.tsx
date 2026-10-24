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
  Sparkles,
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

  const delayedProjectsCount = projects.filter(
    p => p.status === 'Atrasado' || p.status === 'Em Risco'
  ).length;

  const pendingTasksCount = tasks.filter(
    t => t.status === 'Em Curso' || t.status === 'Atrasada' || t.status === 'Bloqueada'
  ).length;

  const criticalRisksCount = risks.filter(
    r => r.level === 'Crítico' || r.level === 'Alto'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Executivo',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'projects',
      label: 'Gestão de Projectos',
      icon: FolderGit2,
      badge: projects.length,
    },
    {
      id: 'schedule',
      label: 'Cronogramas & Prazos',
      icon: CalendarDays,
      badge: delayedProjectsCount > 0 ? `${delayedProjectsCount} alertas` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'activities',
      label: 'Actividades & Tarefas',
      icon: CheckSquare,
      badge: pendingTasksCount,
    },
    {
      id: 'financial',
      label: 'Gestão Financeira',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'risks',
      label: 'Riscos & Problemas',
      icon: AlertTriangle,
      badge: criticalRisksCount > 0 ? criticalRisksCount : null,
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      id: 'reports',
      label: 'Relatórios & Exportação',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Auditoria & Notificações',
      icon: History,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Perfis & Configurações',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Banner in Sidebar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-edm.webp" alt="EDM Logo" className="h-7 w-auto object-contain" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 block leading-tight">
                EDM PORTAL
              </span>
              <span className="text-[10px] text-[#c26508] font-bold">Project Management</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#F7942D] text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Corporate Strategic Goal Box */}
        <div className="p-4 m-3 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#F7942D]" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Meta Nacional
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200">
            Acesso Universal à Energia Eléctrica em Moçambique até 2030
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Taxa Cobertura Global</span>
              <span className="text-orange-400 font-bold">54.2%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-orange-500 to-amber-400 h-full rounded-full"
                style={{ width: '54.2%' }}
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 text-center">
          <p className="text-[10px] font-medium text-slate-400">
            EDM Project Management System v1.2
          </p>
          <p className="text-[9px] text-slate-400">Electricidade de Moçambique, E.P.</p>
        </div>
      </aside>
    </>
  );
};
