import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderGit2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApprovalRequest, ApprovalStatus } from '../../types';
import { formatDatePt } from '../../utils/formatters';

export const ExecutiveApprovalsView: React.FC = () => {
  const {
    approvalRequests,
    decideApprovalRequest,
    setSelectedProjectId,
    setActiveTab,
    currentUser,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [decisionModalType, setDecisionModalType] = useState<'Aprovado' | 'Rejeitado' | null>(null);
  const [directorNotes, setDirectorNotes] = useState<string>('');

  const pendingCount = approvalRequests.filter(r => r.status === 'Pendente').length;
  const approvedCount = approvalRequests.filter(r => r.status === 'Aprovado').length;
  const rejectedCount = approvalRequests.filter(r => r.status === 'Rejeitado').length;
  const pendingProjectsCount = new Set(approvalRequests.filter(r => r.status === 'Pendente').map(r => r.projectId)).size;

  const filteredRequests = approvalRequests.filter(r => {
    if (filterStatus !== 'Todos' && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchProject = r.projectName.toLowerCase().includes(q) || r.projectCode.toLowerCase().includes(q);
      const matchRequester = r.requestedBy.toLowerCase().includes(q);
      if (!matchTitle && !matchProject && !matchRequester) return false;
    }
    return true;
  });

  const handleOpenDecision = (req: ApprovalRequest, type: 'Aprovado' | 'Rejeitado') => {
    setSelectedRequest(req);
    setDecisionModalType(type);
    setDirectorNotes(
      type === 'Aprovado'
        ? 'Despacho favorável exarado. Autorizada a prossecução e regularização processual.'
        : 'Devolvido ao gestor do projecto para prestação de esclarecimentos adicionais e adequação técnica.'
    );
  };

  const handleConfirmDecision = () => {
    if (!selectedRequest || !decisionModalType) return;
    decideApprovalRequest(selectedRequest.id, decisionModalType, directorNotes);
    setSelectedRequest(null);
    setDecisionModalType(null);
    setDirectorNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F7942D] text-white flex items-center justify-center shadow-xs shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Gabinete de Despacho & Decisões Executivas
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508]">
                  Direcção Executiva
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Validação formal de autos de medição, dotações financeiras, prorrogações de prazo e alterações de escopo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Titular: <strong className="text-slate-800">{currentUser.name}</strong>
          </span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Aguardando Despacho
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-heading">
              {pendingCount}
            </h3>
            <span className="text-[11px] text-slate-400">Requerem assinatura executiva</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Empreendimentos em Despacho
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-heading">
              {pendingProjectsCount}
            </h3>
            <span className="text-[11px] text-slate-400">Projectos com decisões pendentes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Despachos Concedidos
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-heading">
              {approvedCount}
            </h3>
            <span className="text-[11px] text-slate-400">Liquidações e prazos homologados</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Solicitações Rejeitadas
            </p>
            <h3 className="text-2xl font-bold text-slate-700 mt-1 font-heading">
              {rejectedCount}
            </h3>
            <span className="text-[11px] text-slate-400">Devolvidas para revisão técnica</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['Todos', 'Pendente', 'Aprovado', 'Rejeitado'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'Todos' ? 'Todos os Pedidos' : status}
              {status === 'Pendente' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar pedido, projecto, gestor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3.5">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <FileCheck2 className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Nenhum pedido de aprovação encontrado</p>
            <p className="text-xs text-slate-400">Todos os despachos pendentes foram apreciados pelo Director.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isPending = req.status === 'Pendente';
            const isApproved = req.status === 'Aprovado';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Project and Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProjectId(req.projectId);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#c26508] text-xs font-bold transition border border-orange-200"
                        title="Ver detalhes do projecto"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        {req.projectCode} • {req.projectName}
                      </button>

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {req.type}
                      </span>

                      {req.priority === 'Crítica' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Prioridade Crítica
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isPending
                            ? 'bg-amber-100 text-amber-800'
                            : isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{req.title}</h4>

                    <p className="text-xs text-slate-600 leading-relaxed">{req.description}</p>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Requerente: <strong className="text-slate-700">{req.requestedBy}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Data do Pedido: {formatDatePt(req.requestedDate)}
                      </span>
                      {req.physicalProgressClaimed !== undefined && (
                        <span className="flex items-center gap-1 text-[#c26508] font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Avanço Medido: {req.physicalProgressClaimed}%
                        </span>
                      )}
                    </div>

                    {/* Director Decision notes (if already decided) */}
                    {req.directorNotes && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Parecer do Director ({formatDatePt(req.decidedAt || '')}):
                        </div>
                        <p className="text-slate-600 italic">"{req.directorNotes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  {isPending && (
                    <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => handleOpenDecision(req, 'Aprovado')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Despachar Favoravelmente
                      </button>

                      <button
                        onClick={() => handleOpenDecision(req, 'Rejeitado')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold border border-slate-200 hover:border-red-200 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Rejeitar / Solicitar Dados
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decision Modal */}
      {selectedRequest && decisionModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    decisionModalType === 'Aprovado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {decisionModalType === 'Aprovado' ? 'Despacho de Aprovação' : 'Despacho de Rejeição'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedRequest.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedRequest.projectCode} • {selectedRequest.projectName}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setDecisionModalType(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedRequest.physicalProgressClaimed !== undefined && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Avanço Físico Submetido:</span>
                <span className="font-bold text-[#F7942D] text-sm font-mono">
                  {selectedRequest.physicalProgressClaimed}%
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Parecer / Despacho do Director Executivo:
              </label>
              <textarea
                rows={4}
                value={directorNotes}
                onChange={e => setDirectorNotes(e.target.value)}
                placeholder="Insira as determinações executivas ou condições de homologação..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setDecisionModalType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${
                  decisionModalType === 'Aprovado'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar e Assinar Despacho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
