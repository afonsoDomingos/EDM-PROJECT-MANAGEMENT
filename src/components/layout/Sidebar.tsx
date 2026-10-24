import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Zap,
  CalendarDays,
  CheckSquare,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  History,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
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
    { id: 'generation',  label: 'Centrais & Geração (MW)', icon: Zap,             badge: '27 MW', badgeColor: 'bg-orange-100 text-orange-800 font-mono' },
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
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 h-screen shrink-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <img
              src="/logo-edm.webp"
              alt="EDM"
              className="h-7 w-auto object-contain shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 truncate block">
                  EDM PORTAL
                </span>
                <span className="text-[10px] text-[#c26508] font-bold block truncate">
                  Project Management
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedProjectId(null);
                    onClose();
                  }}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'lg:justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#F7942D] text-white shadow-sm shadow-orange-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5">
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
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                    </div>
                  )}

                  {/* Dot indicator when collapsed */}
                  {isCollapsed && item.badge !== null && item.badge !== undefined && (
                    <span className="hidden lg:block absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F7942D] ring-2 ring-white" />
                  )}
                </button>

                {/* Floating Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-slate-100 ${isCollapsed ? 'lg:p-2 lg:text-center' : ''}`}>
          {!isCollapsed ? (
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Electricidade de Moçambique
              </span>
              <span className="text-[9px] text-slate-400">© 2026 Portal de Projectos</span>
            </div>
          ) : (
            <div className="w-full flex justify-center" title="EDM Portal 2026">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
