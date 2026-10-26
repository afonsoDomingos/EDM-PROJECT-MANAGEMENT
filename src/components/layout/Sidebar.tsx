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
  LogOut,
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
    currentUser,
    logout,
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
    { id: 'generation',  label: 'Centrais & Geração (MW)', icon: Zap,             badge: '27' },
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
        className={`fixed lg:sticky top-0 lg:top-[86px] h-screen lg:h-[calc(100vh-86px)] shrink-0 z-40 lg:z-20 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden h-14 px-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-edm.webp"
              alt="EDM"
              className="h-7 w-auto object-contain shrink-0"
            />
            <span className="font-black text-xs uppercase tracking-wider text-slate-800">
              EDM PORTAL
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Header / Collapse Bar */}
        <div className="hidden lg:flex h-11 px-3 border-b border-slate-100 items-center justify-between">
          {!isCollapsed ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1">
                Menu Principal
              </span>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Recolher Menu Lateral"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Expandir Menu Lateral"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          )}
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
        <div className={`p-3 border-t border-slate-100 ${isCollapsed ? 'lg:p-2' : ''}`}>
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#F7942D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {currentUser.name.split(' ').slice(0, 2).join(' ')}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Terminar Sessão"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Electricidade de Moçambique
                </span>
                <span className="text-[9px] text-slate-400">© 2026 Portal de Projectos</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={logout}
                title="Terminar Sessão"
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sessão Activa" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
