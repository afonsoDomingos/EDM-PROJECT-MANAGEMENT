import React from 'react';
import {
  Shield,
  UserCheck,
  RotateCcw,
  Database,
  Lock,
  Server,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const SettingsAndUsersView: React.FC = () => {
  const { users, currentUser, setCurrentUser, resetToInitialData, projects, tasks, risks } = useApp();

  const rolePermissions: Record<UserRole, { description: string; perms: string[] }> = {
    Administrador: {
      description: 'Acesso irrestrito a todos os dados do sistema, configurações e gestão de utilizadores.',
      perms: [
        'Criar, editar e eliminar projectos',
        'Aprovação e alteração de dotações orçamentais',
        'Gestão de riscos, despesas e auditoria',
        'Eliminação de registos sensíveis',
        'Repor dados de demonstração',
      ],
    },
    Director: {
      description: 'Visão executiva estratégica e aprovação de grandes marcos, relatórios e orçamentos.',
      perms: [
        'Visualização consolidada de todos os indicadores',
        'Aprovação e revisão de orçamentos e autos',
        'Exportação de relatórios executivos para PDF/CSV',
        'Criação e edição de notas de acompanhamento',
      ],
    },
    'Gestor de projectos': {
      description: 'Gestão técnica e operacional dos projectos e actividades sob sua supervisão.',
      perms: [
        'Actualização de progresso físico de obras',
        'Criação e acompanhamento de tarefas operacionais',
        'Registo de riscos, despesas e documentos técnicos',
        'Edição dos dados dos projectos atribuídos',
      ],
    },
    Técnico: {
      description: 'Execução de trabalhos de terreno, relatórios de medição e actualização de tarefas.',
      perms: [
        'Actualização de percentagem e estado de tarefas',
        'Submissão de notas técnicas e autos no terreno',
        'Consulta de cronogramas e desenhos executivos',
      ],
    },
    'Utilizador de consulta': {
      description: 'Acesso exclusivo de visualização para auditoria externa, financiadores e partes interessadas.',
      perms: [
        'Consulta de indicadores e relatórios em modo somente leitura',
        'Exportação de relatórios em CSV',
        'Sem permissões para alterar ou eliminar qualquer dado',
      ],
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Perfis de Utilizador, Segurança & Governação
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              RBAC (Role-Based Access Control)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuração de acessos por perfil de função e directrizes de integração tecnológica
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Tem a certeza de que deseja repor todos os dados para o estado inicial do sistema?')) {
              resetToInitialData();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition"
        >
          <RotateCcw className="w-4 h-4 text-amber-700" />
          Repor Dados Originais do Sistema
        </button>
      </div>

      {/* User Switcher Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 font-heading mb-1">
          Utilizadores e Sessão Activa para Teste
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Clique num utilizador para alternar a sessão activa e experimentar as permissões associadas a cada perfil
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => {
            const isActive = currentUser.id === u.id;
            const roleInfo = rolePermissions[u.role];
            return (
              <div
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  isActive
                    ? 'border-[#F7942D] bg-orange-50/40 ring-2 ring-[#F7942D]/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#F7942D] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {u.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  {isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Sessão Activa
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Clique para assumir
                    </span>
                  )}
                </div>

                <h5 className="text-xs font-bold text-slate-900">{u.name}</h5>
                <p className="text-[11px] font-semibold text-[#c26508] mt-0.5">{u.role}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{u.department}</p>

                <p className="text-[11px] text-slate-600 mt-2.5 line-clamp-2">
                  {roleInfo?.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Permission Matrix Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 font-heading mb-3">
          Matriz de Privilégios por Perfil
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(rolePermissions) as UserRole[]).map(role => {
            const details = rolePermissions[role];
            const isUserRole = currentUser.role === role;
            return (
              <div
                key={role}
                className={`p-4 rounded-xl border ${
                  isUserRole
                    ? 'bg-orange-50/20 border-orange-200'
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-900">{role}</h5>
                  {isUserRole && (
                    <span className="text-[9px] font-bold bg-[#F7942D] text-white px-1.5 py-0.2 rounded">
                      Seu Perfil
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mb-2">{details.description}</p>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {details.perms.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live MongoDB Atlas Cloud Integration Card */}
      <div className="bg-linear-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 border border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-heading">
              Base de Dados Cloud: MongoDB Atlas
            </h4>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cluster Conectado & Operacional
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          A aplicação está conectada ao cluster <strong>MongoDB Atlas</strong> na nuvem (<code className="text-emerald-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">cluster0.oe0akin.mongodb.net</code>) na base de dados <code className="text-orange-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">edmprojectmanagementdb</code>. Todos os registos criados, alterados ou eliminados são persistidos em tempo real nas colecções dedicadas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block mb-1">✓ Persistência em Nuvem</span>
            <span className="text-slate-300">
              Colecções sincronizadas: Projects, Tasks, Risks, Expenses, Milestones e AuditLogs.
            </span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block mb-1">✓ API REST Express</span>
            <span className="text-slate-300">
              Endpoints modulares com validação de esquemas Mongoose e transações atómicas.
            </span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block mb-1">✓ Alta Disponibilidade</span>
            <span className="text-slate-300">
              Cluster distribuído com réplicas automáticas e recuperação de desastres.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
