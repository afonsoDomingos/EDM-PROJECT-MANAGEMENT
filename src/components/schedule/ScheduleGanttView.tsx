import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDatePt } from '../../utils/formatters';

export const ScheduleGanttView: React.FC = () => {
  const { projects, milestones, setSelectedProjectId } = useApp();

  const [selectedRegion, setSelectedRegion] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const filteredProjects = projects.filter(p => {
    if (selectedRegion !== 'Todas' && p.region !== selectedRegion) return false;
    if (selectedStatus !== 'Todos' && p.status !== selectedStatus) return false;
    return true;
  });

  // Calculate timeline window
  const minYear = 2023;
  const maxYear = 2026;
  const totalMonths = (maxYear - minYear + 1) * 12; // 48 months from 2023-01 to 2026-12

  const getPositionPercent = (dateStr: string) => {
    try {
      const [year, month] = dateStr.split('-').map(Number);
      const monthsFromStart = (year - minYear) * 12 + (month - 1);
      const pct = (monthsFromStart / totalMonths) * 100;
      return Math.max(0, Math.min(100, pct));
    } catch {
      return 0;
    }
  };

  const getBarWidth = (startDate: string, endDate: string) => {
    const startPct = getPositionPercent(startDate);
    const endPct = getPositionPercent(endDate);
    return Math.max(2, endPct - startPct);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Cronogramas & Gráfico de Gantt Consolidado
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508] font-bold">
              Horizonte 2023 - 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitorização temporal de marcos, fases executivas e identificação automática de desvios de calendário
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Todas">Todas as Regiões</option>
            <option value="Norte">Norte</option>
            <option value="Centro">Centro</option>
            <option value="Sul">Sul</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Todos">Todos os Estados</option>
            <option value="Em Execução">Em Execução</option>
            <option value="Atrasado">Atrasado</option>
            <option value="Em Risco">Em Risco</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
      </div>

      {/* Gantt Interactive Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Timeline Header (Years and Quarters) */}
        <div className="border-b border-slate-200 bg-slate-50/80 p-4">
          <div className="grid grid-cols-12 gap-1 text-center text-xs font-bold text-slate-600 font-heading">
            <div className="col-span-4 sm:col-span-3 text-left pl-2">
              Empreendimento / Prazo
            </div>
            <div className="col-span-8 sm:col-span-9 grid grid-cols-4 border-l border-slate-200 text-slate-700">
              <span className="border-r border-slate-200">2023</span>
              <span className="border-r border-slate-200">2024</span>
              <span className="border-r border-slate-200">2025</span>
              <span>2026</span>
            </div>
          </div>
        </div>

        {/* Project Timeline Rows */}
        <div className="divide-y divide-slate-100 p-2">
          {filteredProjects.map(p => {
            const startPct = getPositionPercent(p.startDate);
            const widthPct = getBarWidth(p.startDate, p.expectedEndDate);
            const isDelayed = p.status === 'Atrasado' || p.status === 'Em Risco';

            return (
              <div
                key={p.id}
                className="py-3 px-2 hover:bg-orange-50/20 transition rounded-xl cursor-pointer grid grid-cols-12 gap-1 items-center"
                onClick={() => setSelectedProjectId(p.id)}
              >
                {/* Left Column: Info */}
                <div className="col-span-4 sm:col-span-3 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#c26508] bg-orange-50 px-1 py-0.2 rounded">
                      {p.code}
                    </span>
                    <span className="text-[10px] text-slate-400">• {p.province}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 truncate hover:text-[#c26508] transition">
                    {p.name}
                  </h5>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>{formatDatePt(p.startDate)} → {formatDatePt(p.expectedEndDate)}</span>
                    <span className="font-mono font-bold text-slate-700">{p.physicalProgress}%</span>
                  </div>
                </div>

                {/* Right Column: Visual Timeline Bar */}
                <div className="col-span-8 sm:col-span-9 border-l border-slate-100 pl-2 h-10 flex items-center relative">
                  {/* Background grid lines for years */}
                  <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-20">
                    <div className="border-r border-slate-300" />
                    <div className="border-r border-slate-300" />
                    <div className="border-r border-slate-300" />
                    <div />
                  </div>

                  {/* The Gantt Bar */}
                  <div
                    className="relative h-6 rounded-lg transition-all duration-300 group flex items-center shadow-xs overflow-hidden"
                    style={{
                      left: `${startPct}%`,
                      width: `${Math.max(widthPct, 6)}%`,
                      backgroundColor:
                        p.status === 'Concluído'
                          ? '#10b981'
                          : isDelayed
                          ? '#f97316'
                          : '#F7942D',
                    }}
                  >
                    {/* Filled Progress portion */}
                    <div
                      className="h-full bg-black/20"
                      style={{ width: `${p.physicalProgress}%` }}
                    />
                    <span className="absolute left-2 text-[10px] font-bold text-white whitespace-nowrap drop-shadow-xs">
                      {p.physicalProgress}% {isDelayed ? '⚠️' : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Milestones Spotlight */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Próximos Marcos e Entregas Críticas
            </h4>
            <p className="text-xs text-slate-500">
              Pontos de controlo contratual que definem a entrada em exploração comercial
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {milestones.map(m => {
            const project = projects.find(p => p.id === m.projectId);
            return (
              <div
                key={m.id}
                onClick={() => setSelectedProjectId(m.projectId)}
                className="p-3.5 bg-slate-50 hover:bg-orange-50/40 rounded-xl border border-slate-200 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-mono font-bold text-[#c26508]">{project?.code}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      m.status === 'Atingido'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'Atrasado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 leading-snug">{m.title}</h5>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Data: <strong>{formatDatePt(m.plannedDate)}</strong></span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-semibold">
                    Peso: {m.weightPercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
