import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Menu,
  RotateCcw,
  PhoneCall,
  PanelLeft,
  X,
  FolderKanban,
  Zap,
  ArrowRight,
  LogOut,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isCollapsed,
  onToggleCollapse,
}) => {
  const {
    currentUser,
    setCurrentUser,
    logout,
    users,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchQuery,
    setSearchQuery,
    resetToInitialData,
    setSelectedProjectId,
    setActiveTab,
    isMongoConnected,
    projects,
    generationPlants,
    approvalRequests,
  } = useApp();

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'Pendente').length;

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const matchingProjects = useMemo(() => {
    if (!cleanQuery) return [];
    return projects.filter(
      p =>
        p.name?.toLowerCase().includes(cleanQuery) ||
        p.code?.toLowerCase().includes(cleanQuery) ||
        p.province?.toLowerCase().includes(cleanQuery) ||
        p.manager?.toLowerCase().includes(cleanQuery) ||
        p.category?.toLowerCase().includes(cleanQuery) ||
        p.fundingSource?.toLowerCase().includes(cleanQuery)
    );
  }, [projects, cleanQuery]);

  const matchingPlants = useMemo(() => {
    if (!cleanQuery) return [];
    return generationPlants.filter(
      p =>
        p.name?.toLowerCase().includes(cleanQuery) ||
        p.location?.toLowerCase().includes(cleanQuery) ||
        p.province?.toLowerCase().includes(cleanQuery) ||
        p.sourceType?.toLowerCase().includes(cleanQuery) ||
        (p.partner && p.partner.toLowerCase().includes(cleanQuery))
    );
  }, [generationPlants, cleanQuery]);

  const totalMatches = matchingProjects.length + matchingPlants.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Em Execução':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Concluído':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Atrasado':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Em Risco':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">

      {/* Main Header Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Hamburger / Collapse Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Abrir navegação"
          >
            <Menu className="w-5 h-5" />
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedProjectId(null);
            }}
          >
            <img
              src="/logo-edm.webp"
              alt="EDM"
              className="h-8 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm tracking-wide text-slate-900">
                ELECTRICIDADE DE MOÇAMBIQUE
              </span>
              <p className="text-[10px] text-slate-400 leading-tight">
                Gestão e Monitorização de Projectos
              </p>
            </div>
          </div>

          {/* Powered by MUV Logo */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 select-none">
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
              Powered by
            </span>
            <img
              src="/muv logo.png"
              alt="MUV Educação & Engenharia"
              className="h-7 w-auto object-contain hover:scale-105 transition"
              title="Powered by MUV Educação & Engenharia"
            />
          </div>
        </div>

        {/* Center: Search with Live Interactive Results Popover */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg mx-4 relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setIsSearchOpen(false);
                  setActiveTab('projects');
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Pesquisar projectos, centrais, províncias..."
              className="w-full pl-9 pr-9 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-slate-200/60 focus:border-[#F7942D] focus:ring-2 focus:ring-[#F7942D]/20 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Floating Dropdown Results */}
          {isSearchOpen && cleanQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              {/* Header with summary & hints */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {totalMatches === 0
                    ? 'Nenhum resultado'
                    : `${totalMatches} ${totalMatches === 1 ? 'resultado encontrado' : 'resultados encontrados'}`}
                </span>
                <span className="text-[11px] text-slate-400">
                  Pressione <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-2xs">Enter ↵</kbd> para abrir na lista
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {/* Empty State */}
                {totalMatches === 0 && (
                  <div className="py-8 px-4 text-center">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      Nenhum resultado para "{searchQuery}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      Tente pesquisar por código (ex: PRJ-001), província (ex: Maputo, Tete) ou central (ex: Temane).
                    </p>
                  </div>
                )}

                {/* Section: Projectos */}
                {matchingProjects.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FolderKanban className="w-3 h-3 text-[#F7942D]" />
                      <span>Projectos de Infra-estrutura ({matchingProjects.length})</span>
                    </div>

                    <div className="mt-1 space-y-1">
                      {matchingProjects.slice(0, 5).map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            setIsSearchOpen(false);
                          }}
                          className="px-3 py-2 rounded-xl hover:bg-orange-50/70 border border-transparent hover:border-orange-200/60 cursor-pointer flex items-center justify-between gap-3 transition group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-[#F7942D]/15 group-hover:text-[#c26508] transition">
                                {p.code}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {p.province}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border ${getStatusBadge(p.status)}`}>
                                {p.status}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-[#c26508] transition truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              Gestor: {p.manager} • Categoria: {p.category}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-[#c26508]">
                              {p.physicalProgress}%
                            </span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-[#F7942D] rounded-full"
                                style={{ width: `${p.physicalProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Centrais Eléctricas */}
                {matchingPlants.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Centrais & Geração MW ({matchingPlants.length})</span>
                    </div>

                    <div className="mt-1 space-y-1">
                      {matchingPlants.slice(0, 3).map(plant => (
                        <div
                          key={plant.id}
                          onClick={() => {
                            setActiveTab('centrais');
                            setIsSearchOpen(false);
                          }}
                          className="px-3 py-2 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200/60 cursor-pointer flex items-center justify-between gap-3 transition group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                {plant.capacityMW} MW
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {plant.province}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {plant.sourceType}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-amber-800 transition truncate">
                              {plant.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              Local: {plant.location} • Estado: {plant.status}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('projects');
                    setIsSearchOpen(false);
                  }}
                  className="font-semibold text-[#c26508] hover:text-[#a04e03] flex items-center gap-1 transition"
                >
                  <span>Ver todos na Gestão de Projectos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowMobileSearch(!showMobileSearch);
              setTimeout(() => mobileSearchRef.current?.focus(), 100);
            }}
            className="md:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100 transition"
            aria-label="Pesquisar"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Director Executive Approvals Button */}
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => setActiveTab('approvals')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Existem despachos aguardando decisão do Director"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Despachos ({pendingApprovalsCount})</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">Notificações</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-[#F7942D] hover:underline font-medium"
                    >
                      Marcar todas lidas
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-400">
                      Sem notificações.
                    </p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.projectId) {
                            setSelectedProjectId(n.projectId);
                            setShowNotifMenu(false);
                          }
                        }}
                        className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition ${
                          !n.read ? 'bg-orange-50/50' : ''
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.type === 'danger' && <AlertCircle className="w-4 h-4 text-red-500" />}
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {n.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('audit');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs font-semibold text-[#F7942D] hover:underline"
                  >
                    Ver registo de auditoria →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#F7942D] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.name.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-[10px] text-[#c26508] font-medium">{currentUser.role}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="p-4 bg-slate-900 text-white">
                  <p className="text-xs text-slate-400">Sessão activa</p>
                  <p className="text-sm font-bold mt-0.5">{currentUser.name}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                    {currentUser.role}
                  </div>
                </div>

                <div className="p-4 space-y-2.5 text-xs text-slate-600 bg-white">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Departamento</span>
                    <span className="font-semibold text-slate-800">{currentUser.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Correio Electrónico</span>
                    <span className="font-mono text-slate-700">{currentUser.email}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Nível de Acesso</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition border border-red-200"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Terminar Sessão
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Drawer */}
      {showMobileSearch && (
        <div className="md:hidden px-4 py-2.5 bg-slate-50 border-t border-slate-200">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setActiveTab('projects');
                  setShowMobileSearch(false);
                }
              }}
              placeholder="Pesquisar projectos, províncias..."
              className="w-full pl-9 pr-8 py-2 bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:outline-none focus:border-[#F7942D] focus:ring-2 focus:ring-[#F7942D]/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {cleanQuery.length > 0 && totalMatches > 0 && (
            <div className="mt-2 text-xs flex items-center justify-between text-slate-600 px-1">
              <span>{totalMatches} resultados encontrados</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('projects');
                  setShowMobileSearch(false);
                }}
                className="font-bold text-[#c26508]"
              >
                Ver na lista →
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
