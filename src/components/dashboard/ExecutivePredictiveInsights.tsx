import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FolderGit2,
  BarChart3,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPercent } from '../../utils/formatters';

interface AnomalyItem {
  projectId: string;
  code: string;
  name: string;
  manager: string;
  province: string;
  physical: number;
  phase: string;
  expectedEndDate: string;
  severity: 'Crítica' | 'Alta' | 'Moderada';
  type: 'Atraso no Caminho Crítico' | 'Risco de Prazo de Conclusão' | 'Avanço Físico Exemplar';
  diagnostic: string;
  recommendation: string;
}

export const ExecutivePredictiveInsights: React.FC = () => {
  const { projects, setSelectedProjectId, setActiveTab } = useApp();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('Todas');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const analysis = useMemo(() => {
    const anomalies: AnomalyItem[] = [];

    projects.forEach(p => {
      const physical = p.physicalProgress || 0;

      // 1. Critical Delay: Delayed status or high priority with low physical progress
      if (p.status === 'Atrasado' || (p.status === 'Em Risco' && p.priority === 'Crítica')) {
        anomalies.push({
          projectId: p.id,
          code: p.code,
          name: p.name,
          manager: p.manager,
          province: p.province,
          physical,
          phase: p.phase || 'Obras Civis',
          expectedEndDate: p.expectedEndDate,
          severity: 'Crítica',
          type: 'Atraso no Caminho Crítico',
          diagnostic: `Avanço físico em ${formatPercent(physical)} com prazo previsto de conclusão em ${p.expectedEndDate}. ${p.constraints || 'Constrangimentos logísticos ou aprovação de materiais.'}`,
          recommendation:
            'Acelerar mobilização de frentes de trabalho adicionais e convocar reunião de alinhamento com a equipa de fiscalização.',
        });
      }
      // 2. Schedule Risk: In execution but low progress for remaining time
      else if (p.status === 'Em Risco' || (p.status === 'Em Execução' && physical < 40)) {
        anomalies.push({
          projectId: p.id,
          code: p.code,
          name: p.name,
          manager: p.manager,
          province: p.province,
          physical,
          phase: p.phase || 'Montagem Electromecânica',
          expectedEndDate: p.expectedEndDate,
          severity: 'Alta',
          type: 'Risco de Prazo de Conclusão',
          diagnostic: `Projecto na fase '${p.phase || 'Execução'}' com avanço físico de ${formatPercent(physical)}. Alerta precoce para cumprimento da meta.`,
          recommendation:
            'Revisão técnica do plano de acção semanal e priorização de fornecimento de componentes críticos na subestação/linha.',
        });
      }
      // 3. High physical performance
      else if (physical >= 80 && p.status !== 'Concluído') {
        anomalies.push({
          projectId: p.id,
          code: p.code,
          name: p.name,
          manager: p.manager,
          province: p.province,
          physical,
          phase: p.phase || 'Comissionamento',
          expectedEndDate: p.expectedEndDate,
          severity: 'Moderada',
          type: 'Avanço Físico Exemplar',
          diagnostic: `Execução física avançada em ${formatPercent(physical)}. Conclusão dos ensaios preliminares e montagem dentro do programado.`,
          recommendation:
            'Projecto pronto para ensaios de energização e comissionamento. Agendar vistoria com a Direcção de Produção e Transporte.',
        });
      }
    });

    return anomalies;
  }, [projects]);

  const filtered = analysis.filter(a => {
    if (selectedSeverity !== 'Todas' && a.severity !== selectedSeverity) return false;
    return true;
  });

  const criticalCount = analysis.filter(a => a.severity === 'Crítica').length;
  const highCount = analysis.filter(a => a.severity === 'Alta').length;

  if (!isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-white shadow-xs flex items-center justify-between cursor-pointer transition duration-200 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-[#F7942D] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-slate-200">
              Diagnóstico Preditivo Executivo:{' '}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              {criticalCount} caminhos críticos e {highCount} alertas de prazo identificados
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-white transition shrink-0 ml-3">
          <span>Ver Recomendações</span>
          <ChevronDown className="w-4 h-4 text-[#F7942D] group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F7942D] to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/50 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                Diagnóstico Preditivo & Inteligência Executiva EVM
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-[#F7942D] border border-[#F7942D]/40 uppercase tracking-wider">
                Análise Contínua
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Detecção automática de anomalias entre progresso físico de obras e prazos de execução.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              {criticalCount} Anomalias Críticas
            </span>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition inline-flex items-center gap-1.5"
          >
            <span>Recolher</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 6).map((item, idx) => {
          const isCritical = item.severity === 'Crítica';
          const isHigh = item.severity === 'Alta';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-slate-800/40 backdrop-blur-sm ${
                isCritical
                  ? 'border-red-500/40 hover:border-red-500/70'
                  : isHigh
                  ? 'border-amber-500/40 hover:border-amber-500/70'
                  : 'border-emerald-500/40 hover:border-emerald-500/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      isCritical
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.code}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {item.province} • Gestor: {item.manager}
                </p>

                {/* Physical Progress & Phase Indicator */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Avanço Físico Real:</span>
                    <span className="font-bold text-white">{formatPercent(item.physical)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${Math.min(item.physical, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Fase Actual:</span>
                    <span className="font-semibold text-orange-300 truncate max-w-[130px]">{item.phase}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Término Previsto: <span className="text-slate-200 font-mono">{item.expectedEndDate}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px]">
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-amber-400">Diagnóstico:</strong> {item.diagnostic}
                  </p>
                  <p className="text-slate-400 leading-relaxed flex items-start gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-[#F7942D] shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Recomendação:</strong> {item.recommendation}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProjectId(item.projectId)}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-[#F7942D]" />
                Auditar Projecto em Detalhe →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
