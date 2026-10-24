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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      {/* Slim Prototype Bar */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-800">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="font-semibold">Protótipo de Demonstração — Dados Fictícios</span>
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isMongoConnected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isMongoConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {isMongoConnected ? 'MongoDB Conectado' : 'A conectar...'}
          </span>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Repor os dados fictícios originais?')) {
              resetToInitialData();
            }
          }}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 transition"
          title="Repor dados originais"
        >
          <RotateCcw className="w-3 h-3" />
          Repor Dados
        </button>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Abrir navegação"
          >
            <Menu className="w-5 h-5" />
          </button>

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

                <div className="p-3 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                    Alternar perfil
                  </p>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        currentUser.id === u.id
                          ? 'bg-orange-50 text-[#c26508] font-bold border border-orange-200'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.role}</p>
                      </div>
                      {currentUser.id === u.id && (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          Activo
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
