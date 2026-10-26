import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  FileText,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatCompactMZN,
  formatDatePt,
  formatPercent,
  calculateFinancialExecution,
  exportToCsv,
} from '../../utils/formatters';

type ReportType =
  | 'resumo_executivo'
  | 'estado_projectos'
  | 'execucao_fisica'
  | 'execucao_financeira'
  | 'atrasos'
  | 'riscos'
  | 'regional'
  | 'actividades_pendentes';

export const ExecutiveReports: React.FC = () => {
  const { projects, tasks, risks, expenses } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('resumo_executivo');
  const [filterRegion, setFilterRegion] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterManager, setFilterManager] = useState('Todos');

  const managers = ['Todos', ...Array.from(new Set(projects.map(p => p.manager)))];

  const filteredProjects = projects.filter(p => {
    if (filterRegion !== 'Todas' && p.region !== filterRegion) return false;
    if (filterStatus !== 'Todos' && p.status !== filterStatus) return false;
    if (filterManager !== 'Todos' && p.manager !== filterManager) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (activeReport === 'riscos') {
      const headers = ['ID Risco', 'Código Projecto', 'Título', 'Categoria', 'Nível', 'Probabilidade', 'Impacto', 'Responsável', 'Prazo', 'Plano Mitigação'];
      const rows = risks.map(r => {
        const p = projects.find(prj => prj.id === r.projectId);
        return [
          r.id,
          p?.code || r.projectId,
          r.title,
          r.category,
          r.level,
          r.probability,
          r.impact,
          r.assignee,
          r.resolutionDeadline,
          r.mitigationPlan,
        ];
      });
      exportToCsv('relatorio_riscos_edm', headers, rows);
    } else if (activeReport === 'actividades_pendentes') {
      const headers = ['ID Tarefa', 'Projecto', 'Título', 'Responsável', 'Prazo', 'Prioridade', 'Estado', 'Progresso (%)'];
      const rows = tasks.map(t => {
        const p = projects.find(prj => prj.id === t.projectId);
        return [
          t.id,
          p?.code || t.projectId,
          t.title,
          t.assignee,
          t.dueDate,
          t.priority,
          t.status,
          t.progressPercent,
        ];
      });
      exportToCsv('relatorio_actividades_edm', headers, rows);
    } else {
      const headers = [
        'Código',
        'Nome do Projecto',
        'Categoria',
        'Região',
        'Província',
        'Gestor',
        'Data Início',
        'Conclusão Prevista',
        'Estado',
        'Exec. Física (%)',
        'Orçamento Revisto (MZN)',
        'Despesas Acumuladas (MZN)',
        'Exec. Financeira (%)',
      ];
      const rows = filteredProjects.map(p => [
        p.code,
        p.name,
        p.category,
        p.region,
        p.province,
        p.manager,
        p.startDate,
        p.expectedEndDate,
        p.status,
        p.physicalProgress,
        p.revisedBudget,
        p.spentBudget,
        calculateFinancialExecution(p.spentBudget, p.revisedBudget).toFixed(1),
      ]);
      exportToCsv(`relatorio_${activeReport}_edm`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls (No-Print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Centro de Relatórios & Exportação Executiva
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508] font-bold">
              PDF / Impressão & CSV
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geração de relatórios operacionais e consolidados para o Conselho de Administração e Financiadores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Gerar PDF
          </button>
        </div>
      </div>

      {/* Report Selector Pills (No-Print) */}
      <div className="no-print bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
        {[
          { id: 'resumo_executivo', label: 'Resumo Executivo' },
          { id: 'estado_projectos', label: 'Estado dos Projectos' },
          { id: 'execucao_fisica', label: 'Execução Física' },
          { id: 'execucao_financeira', label: 'Execução Financeira' },
          { id: 'atrasos', label: 'Atrasos & Desvios' },
          { id: 'riscos', label: 'Matriz de Riscos' },
          { id: 'regional', label: 'Distribuição Regional' },
          { id: 'actividades_pendentes', label: 'Actividades Pendentes' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id as ReportType)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeReport === r.id
                ? 'bg-[#F7942D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Filter Row (No-Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Região:
          </label>
          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Todas">Todas as Regiões</option>
            <option value="Norte">Norte</option>
            <option value="Centro">Centro</option>
            <option value="Sul">Sul</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Estado:
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Todos">Todos os Estados</option>
            <option value="Em Execução">Em Execução</option>
            <option value="Atrasado">Atrasado</option>
            <option value="Em Risco">Em Risco</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Gestor Responsável:
          </label>
          <select
            value={filterManager}
            onChange={e => setFilterManager(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            {managers.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10 space-y-6">
        {/* Institutional Report Header */}
        <div className="border-b-2 border-[#F7942D] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 px-2 py-1 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-center">
              <img
                src="/logo-edm.webp"
                alt="Electricidade de Moçambique, E.P."
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-wider font-heading">
                ELECTRICIDADE DE MOÇAMBIQUE, E.P.
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Direcção de Gestão Estratégica e Monitorização de Projectos
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mb-1">
              DOCUMENTO INSTITUCIONAL OFICIAL
            </span>
            <p>Data de Emissão: {new Date().toLocaleDateString('pt-PT')}</p>
            <p>Classificação: Confidencial / Interno</p>
          </div>
        </div>

        {/* Report Title */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-heading uppercase tracking-wide">
            {activeReport === 'resumo_executivo' && 'Relatório de Resumo Executivo da Carteira de Projectos'}
            {activeReport === 'estado_projectos' && 'Relatório Detalhado de Estado dos Projectos'}
            {activeReport === 'execucao_fisica' && 'Relatório de Acompanhamento da Execução Física'}
            {activeReport === 'execucao_financeira' && 'Relatório de Execução Orçamental e Financeira'}
            {activeReport === 'atrasos' && 'Relatório de Projectos Atrasados e Desvios de Cronograma'}
            {activeReport === 'riscos' && 'Relatório do Registo Consolidado de Riscos e Contingências'}
            {activeReport === 'regional' && 'Relatório de Distribuição de Infra-estruturas por Região'}
            {activeReport === 'actividades_pendentes' && 'Relatório de Tarefas e Actividades Operacionais'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Abrangência: {filteredProjects.length} empreendimentos avaliados • Moeda: Meticais (MZN)
          </p>
        </div>

        {/* Report Content Table */}
        {activeReport === 'riscos' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border">Ref.</th>
                  <th className="p-2 border">Título do Risco</th>
                  <th className="p-2 border">Categoria</th>
                  <th className="p-2 border text-center">Nível</th>
                  <th className="p-2 border">Responsável</th>
                  <th className="p-2 border">Plano de Mitigação</th>
                  <th className="p-2 border">Prazo</th>
                </tr>
              </thead>
              <tbody>
                {risks.map(r => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 font-mono font-bold">{r.id}</td>
                    <td className="p-2 font-semibold text-slate-900">{r.title}</td>
                    <td className="p-2">{r.category}</td>
                    <td className="p-2 text-center font-bold">{r.level}</td>
                    <td className="p-2">{r.assignee}</td>
                    <td className="p-2 text-slate-600">{r.mitigationPlan}</td>
                    <td className="p-2">{formatDatePt(r.resolutionDeadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeReport === 'actividades_pendentes' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Tarefa</th>
                  <th className="p-2 border">Responsável</th>
                  <th className="p-2 border">Prazo</th>
                  <th className="p-2 border text-center">Prioridade</th>
                  <th className="p-2 border text-center">Estado</th>
                  <th className="p-2 border text-center">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="border-b">
                    <td className="p-2 font-mono font-bold">{t.id}</td>
                    <td className="p-2 font-semibold text-slate-900">{t.title}</td>
                    <td className="p-2">{t.assignee}</td>
                    <td className="p-2">{formatDatePt(t.dueDate)}</td>
                    <td className="p-2 text-center">{t.priority}</td>
                    <td className="p-2 text-center font-bold">{t.status}</td>
                    <td className="p-2 text-center font-mono">{t.progressPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border">Código</th>
                  <th className="p-2.5 border">Projecto</th>
                  <th className="p-2.5 border">Localização</th>
                  <th className="p-2.5 border text-center">Estado</th>
                  <th className="p-2.5 border text-center">Exec. Física</th>
                  <th className="p-2.5 border text-right">Orçamento Revisto</th>
                  <th className="p-2.5 border text-right">Despesas</th>
                  <th className="p-2.5 border text-center">Exec. Fin.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProjects.map(p => {
                  const finExec = calculateFinancialExecution(p.spentBudget, p.revisedBudget);
                  return (
                    <tr key={p.id}>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{p.code}</td>
                      <td className="p-2.5 font-semibold text-slate-900 max-w-xs">{p.name}</td>
                      <td className="p-2.5 text-slate-600">{p.province} ({p.region})</td>
                      <td className="p-2.5 text-center font-semibold">{p.status}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-[#F7942D]">{p.physicalProgress}%</td>
                      <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(p.revisedBudget)}</td>
                      <td className="p-2.5 text-right font-mono text-[#c26508] font-bold">{formatCurrency(p.spentBudget)}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{formatPercent(finExec)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures & Footer for Print */}
        <div className="pt-10 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs text-slate-600">
          <div>
            <div className="border-b border-slate-400 w-36 mx-auto mb-1.5" />
            <p className="font-bold">Eng. Armindo Macaringue</p>
            <p className="text-[10px] text-slate-400">Gestor de Projectos</p>
          </div>
          <div>
            <div className="border-b border-slate-400 w-36 mx-auto mb-1.5" />
            <p className="font-bold">Eng. António Nhassego</p>
            <p className="text-[10px] text-slate-400">Director de Projectos</p>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-slate-400 w-36 mx-auto mb-1.5" />
            <p className="font-bold">Conselho de Administração</p>
            <p className="text-[10px] text-slate-400">Electricidade de Moçambique, E.P.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
