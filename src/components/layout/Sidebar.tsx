import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Zap,
  CalendarDays,
  CheckSquare,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  History,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  FileCheck2,
  Landmark,
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
    approvalRequests,
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

  const pendingApprovalsCount = approvalRequests.filter(
    r => r.status === 'Pendente'
  ).length;

  const navSections = [
    {
      title: 'Estratégia & Governo',
      items: [
        { id: 'dashboard',   label: 'Dashboard Executivo',     icon: LayoutDashboard, badge: null },
        { id: 'governmental',label: 'Projectos Governamentais',icon: Landmark,        badge: '5', badgeColor: 'bg-[#F7942D] text-white' },
        { id: 'generation',  label: 'Centrais & Geração (MW)', icon: Zap,             badge: '27' },
      ],
    },
    {
      title: 'Execução de Obras',
      items: [
        { id: 'projects',    label: 'Gestão de Projectos',     icon: FolderGit2,      badge: projects.length },
        { id: 'schedule',    label: 'Cronogramas & Tarefas',   icon: CalendarDays,    badge: delayedCount > 0 ? delayedCount : null, badgeColor: 'bg-amber-100 text-amber-700' },
      ],
    },
    {
      title: 'Apoio Corporativo',
      items: [
        { id: 'approvals',   label: 'Despachos & Decisões',    icon: FileCheck2,      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null, badgeColor: 'bg-amber-500 text-white' },
        { id: 'reports',     label: 'Relatórios & Exportação', icon: FileSpreadsheet, badge: null },
        { id: 'settings',    label: 'Configurações',           icon: ShieldCheck,     badge: null },
      ],
    },
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
        className={`fixed lg:sticky top-0 lg:top-[57px] h-screen lg:h-[calc(100vh-57px)] shrink-0 z-40 lg:z-20 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-xs ${
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
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
              )}
              {isCollapsed && sIdx > 0 && (
                <div className="w-8 mx-auto my-2 border-t border-slate-200" />
              )}
              {section.items.map(item => {
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
                        isCollapsed ? 'lg:justify-center px-2 py-3' : 'justify-between px-3 py-2'
                      } rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#F7942D] text-white shadow-xs'
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
            </div>
          ))}
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

              <div className="text-center pt-2 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
                <a
                  href="https://www.muv.co.mz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs hover:border-orange-300 hover:shadow-xs transition select-none group cursor-pointer"
                  title="Visitar MUV Educação & Engenharia (https://www.muv.co.mz/)"
                >
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-[#002D62] uppercase tracking-wider transition">
                    Powered by
                  </span>
                  <img
                    src="/muv logo.png"
                    alt="MUV Educação & Engenharia"
                    className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition"
                  />
                </a>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Electricidade de Moçambique
                  </span>
                  <span className="text-[9px] text-slate-400">© 2026 Portal de Projectos</span>
                </div>
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
              <a
                href="https://www.muv.co.mz/"
                target="_blank"
                rel="noopener noreferrer"
                title="Visitar MUV Educação & Engenharia (https://www.muv.co.mz/)"
                className="cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <img
                  src="/muv logo.png"
                  alt="MUV"
                  className="w-7 h-7 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition"
                />
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
