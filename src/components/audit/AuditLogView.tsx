import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  User,
  Calendar,
  Filter,
  CheckCircle,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs, notifications, markNotificationAsRead, setSelectedProjectId } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'notifications'>('audit');
  const [filterAction, setFilterAction] = useState('Todas');
  const [filterEntity, setFilterEntity] = useState('Todas');

  const actions = ['Todas', 'Criação', 'Edição', 'Eliminação', 'Actualização Financeira', 'Actualização de Risco', 'Mudança de Estado'];
  const entities = ['Todas', 'Projecto', 'Tarefa', 'Risco', 'Despesa', 'Documento'];

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction !== 'Todas' && log.action !== filterAction) return false;
    if (filterEntity !== 'Todas' && log.entity !== filterEntity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Auditoria, Rastreabilidade & Notificações
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {auditLogs.length} Registos Imutáveis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trilha de auditoria integral em conformidade com as normas de governação corporativa da EDM
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Trilha de Auditoria
          </button>
          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'notifications'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Notificações ({notifications.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'audit' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <select
                  value={filterAction}
                  onChange={e => setFilterAction(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                >
                  {actions.map(a => (
                    <option key={a} value={a}>
                      {a === 'Todas' ? 'Todas as Acções' : a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterEntity}
                  onChange={e => setFilterEntity(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                >
                  {entities.map(ent => (
                    <option key={ent} value={ent}>
                      {ent === 'Todas' ? 'Todas as Entidades' : ent}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-500">
              A mostrar {filteredLogs.length} registos
            </span>
          </div>

          {/* Audit Logs List */}
          <div className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/70 transition flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#c26508] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {log.userName[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {log.userName}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {log.userRole}
                      </span>
                      <span className="text-[11px] font-semibold text-[#c26508]">
                        [{log.action} de {log.entity}]
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1 font-medium">
                    {log.details}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Entidade: <strong>{log.entityName}</strong></span>
                    <span>• Ref: {log.entityId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Notifications List */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.projectId) setSelectedProjectId(n.projectId);
              }}
              className={`p-4 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3.5 ${
                !n.read ? 'bg-orange-50/30' : ''
              }`}
            >
              <div className="mt-1 shrink-0">
                {n.type === 'danger' && <AlertCircle className="w-5 h-5 text-red-600" />}
                {n.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                {n.type === 'info' && <Clock className="w-5 h-5 text-blue-500" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#F7942D]">
                    Categoria: {n.category}
                  </span>
                  {!n.read && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800">
                      Não lida
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
