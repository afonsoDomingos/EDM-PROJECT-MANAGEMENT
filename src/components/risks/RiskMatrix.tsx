import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Filter,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Risk, RiskCategory, RiskLevel } from '../../types';
import { formatDatePt } from '../../utils/formatters';

export const RiskMatrix: React.FC = () => {
  const { risks, projects, addRisk, updateRisk, deleteRisk, setSelectedProjectId, isReadOnly } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRiskInModal, setSelectedRiskInModal] = useState<Risk | null>(null);

  // New risk form
  const [riskForm, setRiskForm] = useState({
    projectId: projects[0]?.id || '',
    title: '',
    category: 'Técnico' as RiskCategory,
    probability: 3 as 1 | 2 | 3 | 4 | 5,
    impact: 3 as 1 | 2 | 3 | 4 | 5,
    assignee: 'Eng. Zacarias Mucavele',
    mitigationPlan: '',
    resolutionDeadline: '',
    status: 'Identificado' as any,
    identifiedIssues: '',
    correctiveActions: '',
  });

  const categories: RiskCategory[] = [
    'Técnico',
    'Financeiro',
    'Operacional',
    'Logístico',
    'Ambiental',
    'Contratual',
  ];

  const filteredRisks = risks.filter(r => {
    if (selectedCategory !== 'Todas' && r.category !== selectedCategory) return false;
    if (selectedLevel !== 'Todos' && r.level !== selectedLevel) return false;
    return true;
  });

  const criticalRisks = risks.filter(r => r.level === 'Crítico');
  const highRisks = risks.filter(r => r.level === 'Alto');

  // Matrix cell risk score calculation & style
  const getCellBg = (prob: number, imp: number) => {
    const score = prob * imp;
    if (score >= 15) return 'bg-rose-500/20 text-rose-800 border-rose-300';
    if (score >= 10) return 'bg-orange-500/20 text-orange-800 border-orange-300';
    if (score >= 5) return 'bg-amber-500/20 text-amber-800 border-amber-300';
    return 'bg-emerald-500/20 text-emerald-800 border-emerald-300';
  };

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskForm.title.trim() || !riskForm.projectId) return;

    const score = riskForm.probability * riskForm.impact;
    let level: RiskLevel = 'Baixo';
    if (score >= 16) level = 'Crítico';
    else if (score >= 10) level = 'Alto';
    else if (score >= 5) level = 'Médio';

    addRisk({
      ...riskForm,
      riskScore: score,
      level,
      resolutionDeadline: riskForm.resolutionDeadline || new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setRiskForm({
      projectId: projects[0]?.id || '',
      title: '',
      category: 'Técnico',
      probability: 3,
      impact: 3,
      assignee: 'Eng. Zacarias Mucavele',
      mitigationPlan: '',
      resolutionDeadline: '',
      status: 'Identificado',
      identifiedIssues: '',
      correctiveActions: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Matriz de Riscos & Gestão de Problemas
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
              {criticalRisks.length} Críticos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identificação preventiva, análise de probabilidade vs impacto e planos de contingência técnica
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Registar Novo Risco
          </button>
        )}
      </div>

      {/* Critical Risk Banner Alerts */}
      {criticalRisks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
              Atenção Executiva: Riscos de Nível Crítico Exigem Intervenção Imediata
            </h4>
            <div className="mt-1 text-xs text-rose-800 space-y-1">
              {criticalRisks.map(cr => {
                const p = projects.find(prj => prj.id === cr.projectId);
                return (
                  <div key={cr.id} className="flex items-center justify-between">
                    <span>
                      <strong>{p?.code}:</strong> {cr.title} ({cr.category})
                    </span>
                    <span className="font-semibold text-rose-950">
                      Prazo: {formatDatePt(cr.resolutionDeadline)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5x5 Visual Risk Matrix & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* The 5x5 Heatmap Matrix */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Matriz Visual 5x5 (Probabilidade × Impacto)
              </h4>
              <p className="text-xs text-slate-500">
                Distribuição dos riscos activos segundo gravidade estimada
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" /> Baixo
              <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block ml-1" /> Médio
              <span className="w-2.5 h-2.5 rounded bg-orange-400 inline-block ml-1" /> Alto
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block ml-1" /> Crítico
            </div>
          </div>

          {/* Grid visual container */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative pl-8 pb-8">
              {/* Y Axis Label (Probabilidade) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-wider origin-center">
                Probabilidade ↑
              </div>

              {/* The Matrix Cells */}
              <div className="grid grid-rows-5 gap-1.5">
                {[5, 4, 3, 2, 1].map(prob => (
                  <div key={`prob-${prob}`} className="grid grid-cols-5 gap-1.5 h-12">
                    {[1, 2, 3, 4, 5].map(imp => {
                      const matchingRisks = risks.filter(
                        r => r.probability === prob && r.impact === imp
                      );
                      const isHot = prob * imp >= 15;
                      return (
                        <div
                          key={`cell-${prob}-${imp}`}
                          className={`rounded-xl border flex flex-col items-center justify-center p-1 transition cursor-pointer relative ${getCellBg(
                            prob,
                            imp
                          )}`}
                          title={`Probabilidade: ${prob}, Impacto: ${imp} (Pontuação: ${prob * imp})`}
                        >
                          <span className="text-[10px] font-bold opacity-70">
                            {prob * imp}
                          </span>
                          {matchingRisks.length > 0 && (
                            <span
                              className={`mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold shadow-xs ${
                                isHot ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                              }`}
                            >
                              {matchingRisks.length} {matchingRisks.length > 1 ? 'riscos' : 'risco'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* X Axis Label (Impacto) */}
              <div className="text-center mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Impacto nas Metas do Projecto →
              </div>
            </div>
          </div>
        </div>

        {/* Risk Categories Distribution */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading mb-1">
              Riscos por Categoria
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Tipologia dos desafios enfrentados no terreno
            </p>

            <div className="space-y-2.5">
              {categories.map(cat => {
                const count = risks.filter(r => r.category === cat).length;
                const percentage = risks.length > 0 ? (count / risks.length) * 100 : 0;
                return (
                  <div key={cat} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">{cat}</span>
                      <span className="font-bold text-[#F7942D]">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#F7942D] h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950">
            <strong>Dica de Conformidade EDM:</strong> Riscos contratuais e ambientais devem ser revistos quinzenalmente junto das comissões provinciais.
          </div>
        </div>
      </div>

      {/* Filter and Risks Register List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Livro de Registo de Riscos & Acções Correctivas
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {filteredRisks.length} listados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="Todas">Todas as Categorias</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="Todos">Todos os Níveis</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Médio">Médio</option>
              <option value="Baixo">Baixo</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRisks.map(r => {
            const project = projects.find(p => p.id === r.projectId);
            return (
              <div key={r.id} className="p-4 hover:bg-slate-50/80 transition space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => setSelectedProjectId(r.projectId)}
                      className="font-mono text-xs font-bold text-[#c26508] bg-orange-50 px-2 py-0.5 rounded cursor-pointer hover:underline"
                    >
                      {project?.code || r.projectId}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                    <h5 className="text-xs font-bold text-slate-900">{r.title}</h5>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.level === 'Crítico'
                          ? 'bg-rose-100 text-rose-800'
                          : r.level === 'Alto'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Nível: {r.level} ({r.riskScore}/25)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {r.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Prazo: {formatDatePt(r.resolutionDeadline)}
                    </span>
                  </div>
                </div>

                {/* Mitigation & issues block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">
                      Plano de Mitigação:
                    </span>
                    <p className="text-slate-600">{r.mitigationPlan}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">
                      Acções Correctivas & Histórico:
                    </span>
                    <p className="text-slate-600">
                      {r.correctiveActions || r.identifiedIssues || 'Em monitorização técnica permanente.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Responsável: <strong>{r.assignee}</strong></span>
                  <div className="flex items-center gap-2">
                    <span>Estado: <strong>{r.status}</strong></span>
                    {!isReadOnly && (
                      <button
                        onClick={() => {
                          if (window.confirm('Deseja remover este risco?')) {
                            deleteRisk(r.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 font-medium ml-2"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Risk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Registo de Risco ou Problema Técnico
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRisk} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Projecto *
                </label>
                <select
                  required
                  value={riskForm.projectId}
                  onChange={e => setRiskForm({ ...riskForm, projectId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título do Risco / Problema *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Demora alfandegária na liberação de transformadores..."
                  value={riskForm.title}
                  onChange={e => setRiskForm({ ...riskForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={riskForm.category}
                    onChange={e => setRiskForm({ ...riskForm, category: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Probabilidade (1-5)
                  </label>
                  <select
                    value={riskForm.probability}
                    onChange={e => setRiskForm({ ...riskForm, probability: Number(e.target.value) as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>
                        {n} - {n === 1 ? 'Muito Baixa' : n === 5 ? 'Quase Certa' : 'Nível ' + n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Impacto (1-5)
                  </label>
                  <select
                    value={riskForm.impact}
                    onChange={e => setRiskForm({ ...riskForm, impact: Number(e.target.value) as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>
                        {n} - {n === 1 ? 'Desprezível' : n === 5 ? 'Catastrófico' : 'Nível ' + n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plano de Mitigação *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Acções preventivas a desencadear..."
                  value={riskForm.mitigationPlan}
                  onChange={e => setRiskForm({ ...riskForm, mitigationPlan: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-5 -mb-5 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#F7942D] hover:bg-[#e07d17] rounded-xl shadow-md transition"
                >
                  Gravar Risco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
