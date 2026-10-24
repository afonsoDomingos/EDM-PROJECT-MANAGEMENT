import React, { useState } from 'react';
import {
  Search,
  Bell,
  UserCheck,
  Zap,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Menu,
  X,
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Institutional Top Demo Disclaimer Bar */}
      <div className="bg-amber-500 text-amber-950 px-4 py-1 text-xs font-semibold flex items-center justify-between border-b border-amber-600/20">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>PROTÓTIPO DE DEMONSTRAÇÃO — DADOS FICTÍCIOS</span>
          <span className="hidden md:inline text-amber-900 font-normal">
            | Referência visual inspirada no portal corporativo EDM.
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 ml-2 px-2 py-0.2 rounded-full bg-emerald-900/20 text-emerald-950 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {isMongoConnected ? 'MongoDB Atlas Conectado' : 'Conectando ao MongoDB...'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-amber-950 font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-amber-900" />
            Piquete 24h: <span className="font-extrabold text-sm">1455</span>
          </span>
          <button
            onClick={() => {
              if (window.confirm('Tem certeza de que deseja repor os dados fictícios originais no MongoDB Atlas?')) {

                resetToInitialData();
              }
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-950 text-[11px] font-semibold transition"
            title="Repor dados originais"
          >
            <RotateCcw className="w-3 h-3" />
            Repor Dados
          </button>
        </div>
      </div>

      {/* Main EDM Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Alternar navegação"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedProjectId(null);
            }}
          >
            {/* Official EDM Logo from public folder */}
            <div className="h-11 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center">
              <img
                src="/logo-edm.webp"
                alt="Electricidade de Moçambique, E.P."
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-slate-900 font-heading">
                  ELECTRICIDADE DE MOÇAMBIQUE
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-[#c26508]">
                  E.P.
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Dashboard Integrado de Gestão e Monitorização de Projectos
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar projectos, tarefas, regiões ou gestores..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F7942D] focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Notifications & User Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Notifications dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Ver notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notificações do Sistema</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
                      {unreadCount} novas
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-[#F7942D] hover:text-[#d97706] font-medium"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      Nenhuma notificação no momento.
                    </div>
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
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                          !n.read ? 'bg-orange-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'danger' && <AlertCircle className="w-4 h-4 text-red-600" />}
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {n.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span>{n.timestamp}</span>
                            <span className="font-medium text-slate-500">{n.category}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('audit');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs font-semibold text-[#F7942D] hover:underline"
                  >
                    Ver Histórico e Auditoria Completa →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#F7942D] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1]}
                </p>
                <p className="text-[10px] font-bold text-[#c26508]">{currentUser.role}</p>
              </div>
            </button>

            {/* Role Switcher Dialog */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-4 bg-linear-to-r from-slate-900 to-slate-800 text-white">
                  <p className="text-xs text-slate-400">Sessão Activa</p>
                  <p className="text-sm font-bold text-white mt-0.5">{currentUser.name}</p>
                  <p className="text-xs text-orange-400 font-medium">{currentUser.department}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-xs font-semibold text-white">
                    <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                    Perfil: {currentUser.role}
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                    Alternar Perfil para Demonstração:
                  </p>
                  <div className="space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
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

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
                  Simulação de controlo de acessos e permissões no sistema.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
