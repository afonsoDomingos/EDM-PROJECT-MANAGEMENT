import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Landmark,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Building,
  MapPin,
  TrendingUp,
  StickyNote,
} from 'lucide-react';
import { GovernmentalProject, GovernmentalMilestone } from '../../data/governmentalProjectsData';
import {
  calculateDaysRemaining,
  getProjectDelayStatus,
  getProjectScheduleConflicts,
  checkMilestoneExceedsProject,
  exportToCsv,
} from '../../utils/formatters';

interface GovernmentalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GovernmentalProject[];
  initialProjectId?: string | null;
  initialMode?: 'general' | 'single';
}

export const GovernmentalReportModal: React.FC<GovernmentalReportModalProps> = ({
  isOpen,
  onClose,
  projects,
  initialProjectId,
  initialMode = 'general',
}) => {
  const [reportMode, setReportMode] = useState<'general' | 'single'>(
    initialProjectId ? 'single' : initialMode
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || (projects[0]?.id || '')
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Copy Markdown summary
  const handleCopySummary = () => {
    let text = '';
    const dateStr = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });

    if (reportMode === 'general') {
      const totalMW = projects.reduce((acc, p) => acc + (p.capacityMW || 0), 0);
      let totalM = 0;
      let doneM = 0;
      projects.forEach(p => {
        totalM += p.milestones.length;
        doneM += p.milestones.filter(m => m.completed).length;
      });
      const pct = totalM > 0 ? Math.round((doneM / totalM) * 100) : 0;

      text = `*RELATÓRIO GERAL - PROJECTOS ESTRATÉGICOS GOVERNAMENTAIS (EDM)*\n`;
      text += `Data: ${dateStr}\n`;
      text += `Total de Projectos: ${projects.length} | Capacidade Total: ${totalMW} MW | Execução de Marcos: ${pct}%\n\n`;

      projects.forEach((p, idx) => {
        const pDone = p.milestones.filter(m => m.completed).length;
        text += `${idx + 1}. ${p.code} - ${p.name}\n`;
        text += `   Capacidade: ${p.capacity} (${p.technology}) | Província: ${p.province}\n`;
        text += `   COD: ${p.commercialOperationDate} | Estado: ${p.status}\n`;
        text += `   Marcos: ${pDone}/${p.milestones.length} concluídos\n`;
        text += `   Situação: ${p.currentSituationSummary}\n\n`;
      });
    } else if (currentProject) {
      const pDone = currentProject.milestones.filter(m => m.completed).length;
      text = `*RELATÓRIO INDIVIDUAL DO PROJECTO - ${currentProject.name}*\n`;
      text += `Código: ${currentProject.code} | Capacidade: ${currentProject.capacity}\n`;
      text += `Tecnologia: ${currentProject.technology} | Província: ${currentProject.province}\n`;
      text += `Data de Operação Comercial (COD): ${currentProject.commercialOperationDate}\n`;
      text += `Estado: ${currentProject.status}\n`;
      text += `Parceiros: ${currentProject.partnerEntities.join(', ')}\n`;
      text += `Avanço de Marcos: ${pDone}/${currentProject.milestones.length} concluídos\n\n`;
      text += `Situação Actual:\n${currentProject.currentSituationSummary}\n\n`;
      text += `Actividades & Marcos:\n`;
      currentProject.milestones.forEach((m, idx) => {
        text += `${idx + 1}. [${m.completed ? 'CONCLUÍDO' : 'PENDENTE'}] ${m.description} (${m.completedDate || m.targetDate || 'Sem data'})\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (reportMode === 'general') {
      const headers = [
        'Código',
        'Nome do Projecto',
        'Tecnologia',
        'Capacidade (MW)',
        'Localização',
        'Província',
        'Data COD',
        'Estado',
        'Parceiros',
        'Marcos Concluídos',
        'Total Marcos',
        '% Conclusão',
        'Situação Actual',
        'Prioridade Imediata',
      ];
      const rows = projects.map(p => {
        const done = p.milestones.filter(m => m.completed).length;
        const total = p.milestones.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return [
          p.code,
          p.name,
          p.technology,
          p.capacityMW || '',
          p.location,
          p.province,
          p.commercialOperationDate,
          p.status,
          p.partnerEntities.join('; '),
          done,
          total,
          `${pct}%`,
          p.currentSituationSummary,
          p.priorityActionSummary || (p.priorityActions ? p.priorityActions[0] : ''),
        ];
      });
      exportToCsv(`relatorio_geral_projectos_governamentais_edm`, headers, rows);
    } else if (currentProject) {
      const headers = [
        'ID Marco',
        'Projecto Código',
        'Projecto Nome',
        'Actividade / Marco',
        'Nota / Observação',
        'Categoria',
        'Prazo Previsto',
        'Data de Conclusão',
        'Estado',
      ];
      const rows = currentProject.milestones.map(m => [
        m.id,
        currentProject.code,
        currentProject.name,
        m.description,
        m.notes || '',
        m.category || 'Geral',
        m.targetDate || '',
        m.completedDate || '',
        m.completed ? 'Concluído' : 'Pendente',
      ]);
      exportToCsv(`relatorio_${currentProject.code.toLowerCase()}_edm`, headers, rows);
    }
  };

  // General Report stats
  const totalCapacityMW = projects.reduce((acc, p) => acc + (p.capacityMW || 0), 0);
  let totalAllMilestones = 0;
  let completedAllMilestones = 0;
  projects.forEach(p => {
    totalAllMilestones += p.milestones.length;
    completedAllMilestones += p.milestones.filter(m => m.completed).length;
  });
  const overallMilestonePercent = totalAllMilestones > 0
    ? Math.round((completedAllMilestones / totalAllMilestones) * 100)
    : 0;

  const currentDateFormatted = new Date().toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Action Header (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Central de Relatórios de Projectos Governamentais</h3>
              <p className="text-[11px] text-slate-400">Emissão de relatórios executivos para deliberação institucional</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle Button */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setReportMode('general')}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  reportMode === 'general'
                    ? 'bg-[#002D62] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Relatório Geral (Todos)
              </button>
              <button
                type="button"
                onClick={() => setReportMode('single')}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  reportMode === 'single'
                    ? 'bg-[#002D62] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Por Projecto (Individual)
              </button>
            </div>

            {/* Individual Project Selector Dropdown */}
            {reportMode === 'single' && (
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.shortName || p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Export Actions */}
            <button
              onClick={handleCopySummary}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Copiar Sumário"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
              title="Descarregar ficheiro CSV para Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel / CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              title="Imprimir ou Guardar em PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 select-text">
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 printable-card space-y-8">
            {/* Document Institutional Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-edm.webp"
                  alt="EDM"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    Electricidade de Moçambique, E.P.
                  </h1>
                  <p className="text-xs font-bold text-[#c26508] uppercase tracking-wider">
                    Direcção de Desenvolvimento de Negócios e Infraestruturas
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Acompanhamento Presidencial • Projectos Estruturantes de Geração
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-600 sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {reportMode === 'general' ? 'RELATÓRIO GERAL CONSOLIDADO' : 'RELATÓRIO INDIVIDUAL'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Data de Emissão: {currentDateFormatted}</p>
                <p className="text-[10px] text-slate-400">Classificação: Oficial / Directoria</p>
              </div>
            </div>

            {/* ===================== RELATÓRIO GERAL ===================== */}
            {reportMode === 'general' ? (
              <div className="space-y-8">
                {/* Executive Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Projectos Monitorizados</span>
                    <span className="text-2xl font-black text-slate-900">{projects.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Capacidade Total</span>
                    <span className="text-2xl font-black text-[#002D62]">{totalCapacityMW} MW</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Marcos Concluídos</span>
                    <span className="text-2xl font-black text-emerald-600">{completedAllMilestones}/{totalAllMilestones}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Execução Global</span>
                    <span className="text-2xl font-black text-orange-600">{overallMilestonePercent}%</span>
                  </div>
                </div>

                {/* Master Table of All Projects */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#002D62]" />
                    <span>Quadro Resumo da Carteira Governamental</span>
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Código</th>
                          <th className="p-2.5">Projecto</th>
                          <th className="p-2.5">Tecnologia</th>
                          <th className="p-2.5 text-center">Capacidade</th>
                          <th className="p-2.5">Localização</th>
                          <th className="p-2.5 text-center">Data COD</th>
                          <th className="p-2.5 text-center">Estado</th>
                          <th className="p-2.5 text-center">Marcos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {projects.map((p, idx) => {
                          const done = p.milestones.filter(m => m.completed).length;
                          const total = p.milestones.length;
                          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                          const delayInfo = getProjectDelayStatus(p.milestones, p.commercialOperationDate);
                          const conflictInfo = getProjectScheduleConflicts(p.milestones, p.commercialOperationDate);

                          return (
                            <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="p-2.5 font-mono font-bold text-[#002D62]">{p.code}</td>
                              <td className="p-2.5 font-semibold text-slate-900">
                                <div>{p.shortName || p.name}</div>
                                <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{p.partnerEntities.join(', ')}</div>
                              </td>
                              <td className="p-2.5 text-slate-600">{p.technology}</td>
                              <td className="p-2.5 text-center font-bold text-slate-800">{p.capacity}</td>
                              <td className="p-2.5 text-slate-600">{p.location}</td>
                              <td className="p-2.5 text-center font-mono font-medium text-slate-700">
                                {p.commercialOperationDate}
                                {conflictInfo.hasConflicts && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] text-rose-600 font-bold">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                    Conflito
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-bold">
                                <span className={pct === 100 ? 'text-emerald-600' : 'text-slate-800'}>
                                  {done}/{total} ({pct}%)
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detailed Breakdown Per Project */}
                <div className="space-y-6 pt-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#F7942D]" />
                    <span>Diagnóstico Detalhado por Empreendimento</span>
                  </h3>

                  {projects.map((p, pIdx) => {
                    const done = p.milestones.filter(m => m.completed).length;
                    const total = p.milestones.length;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    const conflictInfo = getProjectScheduleConflicts(p.milestones, p.commercialOperationDate);

                    return (
                      <div key={p.id} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-xs font-bold text-[#002D62] font-mono mr-2">{p.code}</span>
                            <span className="text-sm font-bold text-slate-900">{p.name}</span>
                            <span className="text-xs text-slate-500 ml-2">({p.capacity} • {p.technology})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">COD: <strong className="text-slate-800">{p.commercialOperationDate}</strong></span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {p.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <strong className="text-slate-700 block mb-1">Situação Actual:</strong>
                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              {p.currentSituationSummary || 'Em processo de estruturação.'}
                            </p>
                          </div>
                          <div>
                            <strong className="text-slate-700 block mb-1">Acção Prioritária Imediata:</strong>
                            <p className="text-slate-600 leading-relaxed bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                              {p.priorityActionSummary || (p.priorityActions ? p.priorityActions.join(' ') : 'Definição de cronograma detalhado.')}
                            </p>
                          </div>
                        </div>

                        {/* Milestones list */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1.5">
                            Progresso dos Marcos ({done}/{total} concluídos - {pct}%):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                            {p.milestones.map((m, mIdx) => (
                              <div
                                key={m.id || mIdx}
                                className={`flex items-center justify-between p-1.5 px-2.5 rounded border ${
                                  m.completed
                                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="truncate pr-2">
                                  {m.completed ? '✓' : '○'} {m.description}
                                </span>
                                <span className="font-mono text-[10px] shrink-0 font-medium">
                                  {m.completed ? m.completedDate : m.targetDate || 'Pendente'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {conflictInfo.hasConflicts && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>
                              <strong>Alerta de Cronograma:</strong> Existem {conflictInfo.conflictCount} actividade(s) com data limite superior à data de encerramento do projecto (COD {p.commercialOperationDate}). Recomenda-se prorrogar o prazo do projecto.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ===================== RELATÓRIO INDIVIDUAL ===================== */
              currentProject && (
                <div className="space-y-6">
                  {/* Project Banner Card */}
                  <div className="bg-gradient-to-r from-slate-900 to-[#002D62] text-white p-6 rounded-xl shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white mb-1">
                          {currentProject.code}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black">{currentProject.name}</h2>
                        <p className="text-xs text-blue-200">{currentProject.objective}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-300 block">{currentProject.capacity}</span>
                        <span className="text-xs text-slate-300 font-medium">{currentProject.technology}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Localização</span>
                        <span className="font-semibold text-white">{currentProject.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Data Prevista (COD)</span>
                        <span className="font-semibold text-white font-mono">{currentProject.commercialOperationDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Estado Actual</span>
                        <span className="font-semibold text-white">{currentProject.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Parceiros</span>
                        <span className="font-semibold text-white">{currentProject.partnerEntities.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Situation & Priorities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#002D62]" />
                        <span>Resumo da Situação Actual</span>
                      </h4>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {currentProject.currentSituationSummary || 'Projecto em fase de estruturação e negociações preliminares.'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#F7942D]" />
                        <span>Acção Prioritária Recomendada</span>
                      </h4>
                      <p className="text-slate-600 leading-relaxed bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                        {currentProject.priorityActionSummary || (currentProject.priorityActions ? currentProject.priorityActions.join(' ') : 'Definição de passos executivos.')}
                      </p>
                    </div>
                  </div>

                  {/* Milestones Detailed Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#002D62]" />
                        <span>Quadro Analítico de Actividades & Cronograma</span>
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {currentProject.milestones.filter(m => m.completed).length} de {currentProject.milestones.length} concluídos (
                        {Math.round((currentProject.milestones.filter(m => m.completed).length / (currentProject.milestones.length || 1)) * 100)}%)
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10 text-center">#</th>
                            <th className="p-2.5">Descrição da Actividade / Marco</th>
                            <th className="p-2.5">Categoria</th>
                            <th className="p-2.5 text-center">Prazo Planeado</th>
                            <th className="p-2.5 text-center">Conclusão Real</th>
                            <th className="p-2.5 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {currentProject.milestones.map((m, idx) => {
                            const conflict = checkMilestoneExceedsProject(m.targetDate, currentProject.commercialOperationDate);
                            return (
                              <tr key={m.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-2.5 font-semibold text-slate-800">
                                  <div>{m.description}</div>
                                  {m.notes && (
                                    <div className="mt-1 flex items-start gap-1.5 text-[11px] font-normal text-slate-700 bg-amber-50/80 border border-amber-200/90 rounded px-2 py-0.5 max-w-xl">
                                      <StickyNote className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                      <span>
                                        <strong className="text-amber-900 font-bold uppercase text-[9px] tracking-wider mr-1">Nota:</strong>
                                        {m.notes}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-2.5 text-slate-500">{m.category || 'Técnico / Estudos'}</td>
                                <td className="p-2.5 text-center font-mono font-medium text-slate-700">
                                  {m.targetDate || '—'}
                                  {conflict.hasConflict && (
                                    <span className="block text-[9px] text-rose-600 font-bold">
                                      Ultrapassa COD ({conflict.diffDays}d)
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-center font-mono font-medium text-emerald-700">
                                  {m.completedDate || '—'}
                                </td>
                                <td className="p-2.5 text-center">
                                  {m.completed ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Concluído
                                    </span>
                                  ) : conflict.hasConflict ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                                      Em Conflito
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      Em Curso
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Main Constraints & Priority Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <strong className="text-slate-800 font-bold block uppercase text-[11px] tracking-wider text-rose-800">
                        Principais Constrangimentos:
                      </strong>
                      <ul className="space-y-1.5 text-slate-600">
                        {currentProject.mainConstraints && currentProject.mainConstraints.length > 0 ? (
                          currentProject.mainConstraints.map((c, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{c}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">Sem constrangimentos críticos registados.</li>
                        )}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <strong className="text-slate-800 font-bold block uppercase text-[11px] tracking-wider text-[#002D62]">
                        Acções Prioritárias Definidas:
                      </strong>
                      <ul className="space-y-1.5 text-slate-600">
                        {currentProject.priorityActions && currentProject.priorityActions.length > 0 ? (
                          currentProject.priorityActions.map((a, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-1.5">
                              <span className="text-[#F7942D] font-bold">•</span>
                              <span>{a}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">Acções padrão de consultoria técnica.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Formal Institutional Sign-off Block (Visible in Print & Screen) */}
            <div className="pt-10 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs text-slate-600 page-break">
              <div>
                <div className="border-b border-slate-400 w-40 mx-auto mb-1.5" />
                <p className="font-bold text-slate-900">Eng. Armindo Macaringue</p>
                <p className="text-[10px] text-slate-500">Gestor de Projectos Estratégicos</p>
              </div>
              <div>
                <div className="border-b border-slate-400 w-40 mx-auto mb-1.5" />
                <p className="font-bold text-slate-900">Eng. António Nhassego</p>
                <p className="text-[10px] text-slate-500">Director de Projectos / DTIT</p>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-slate-400 w-40 mx-auto mb-1.5" />
                <p className="font-bold text-slate-900">Conselho de Administração</p>
                <p className="text-[10px] text-slate-500">Electricidade de Moçambique, E.P.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
