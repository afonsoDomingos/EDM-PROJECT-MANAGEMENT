import React, { useState } from 'react';
import { CalendarDays, CheckSquare } from 'lucide-react';
import { ScheduleGanttView } from './ScheduleGanttView';
import { ActivitiesKanban } from '../activities/ActivitiesKanban';

export const ScheduleAndTasksUnifiedView: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<'gantt' | 'kanban'>('gantt');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Cronogramas & Tarefas de Obras
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento temporal: visualize o horizonte no Gráfico de Gantt ou gerencie as entregas no Quadro Kanban.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubView('gantt')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubView === 'gantt'
                ? 'bg-white text-[#002D62] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#F7942D]" />
            Cronograma Gantt
          </button>
          <button
            onClick={() => setActiveSubView('kanban')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubView === 'kanban'
                ? 'bg-white text-[#002D62] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#002D62]" />
            Quadro Kanban
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {activeSubView === 'gantt' ? <ScheduleGanttView /> : <ActivitiesKanban />}
    </div>
  );
};
