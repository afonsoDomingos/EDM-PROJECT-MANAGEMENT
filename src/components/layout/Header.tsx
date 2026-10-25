import React, { useState } from 'react';
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
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Vibrant EDM Orange Banner */}
      <div className="bg-[#F7942D] px-4 sm:px-6 py-1.5 flex items-center justify-between text-slate-950 font-semibold text-xs shadow-inner">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-slate-900/60 shrink-0" />
          <span className="font-black text-[11px] sm:text-xs tracking-tight uppercase truncate text-slate-950">
            PROTÓTIPO EDM — DADOS FICTÍCIOS
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/15 text-slate-950 border border-black/10 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${isMongoConnected ? 'bg-emerald-600' : 'bg-amber-700'}`} />
            {isMongoConnected ? 'MongoDB Conectado' : 'Conectando ao MongoDB...'}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-black text-slate-950">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Piquete 24h: <strong>1455</strong></span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Repor os dados de demonstração originais?')) {
                resetToInitialData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 hover:bg-black/20 text-slate-950 text-[10px] font-bold transition border border-black/15 shadow-2xs"
            title="Repor dados originais"
          >
            <RotateCcw className="w-3 h-3" />
            Repor Dados
          </button>
        </div>
      </div>

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
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar projectos..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 text-sm text-slate-800 placeholder-slate-400 rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#F7942D]/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-2">
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
                      Acesso Total (Director)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
