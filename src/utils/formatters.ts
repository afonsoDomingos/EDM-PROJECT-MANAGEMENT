export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 MZN';
  return (
    new Intl.NumberFormat('pt-MZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + ' MZN'
  );
};

export const formatCompactMZN = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 MZN';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.', ',') + ' B MZN';
  }
  if (abs >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.', ',') + ' M MZN';
  }
  if (abs >= 1_000) {
    return (amount / 1_000).toFixed(1).replace('.', ',') + ' mil MZN';
  }
  return amount.toFixed(0) + ' MZN';
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(1).replace('.', ',')}%`;
};

export const formatDatePt = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const calculateFinancialExecution = (
  spent: number | null | undefined,
  budget: number | null | undefined
): number => {
  if (!budget || budget <= 0 || !spent || spent <= 0) return 0;
  const pct = (spent / budget) * 100;
  return Math.min(Math.round(pct * 10) / 10, 200); // capped at 200% for sanity in display
};

export const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]): void => {
  const processCell = (cell: string | number) => {
    let str = cell === null || cell === undefined ? '' : String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM so Excel opens PT accents properly
    [headers.map(processCell).join(';'), ...rows.map(row => row.map(processCell).join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export interface DaysRemainingResult {
  days: number | null;
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  colorClass: string;
  targetDateFormatted?: string;
  inputMode?: 'days' | 'date';
}
/**
 * Parses any supported date format into a standard Date object at midnight:
 * - Days offset (e.g., "40 dias", "40d", "40", "-5 dias")
 * - ISO date (YYYY-MM-DD)
 * - European date (DD/MM/YYYY, DD-MM-YYYY)
 * - Portuguese month names & quarters (e.g. "Novembro de 2026", "Dezembro 2028", "Q4 2026")
 */
export const parseAnyDateStringToDate = (dateStr: string | null | undefined): { date: Date | null; isDaysMode: boolean } => {
  if (!dateStr || !dateStr.trim()) return { date: null, isDaysMode: false };
  const clean = dateStr.trim().toLowerCase();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Prazos expressos em DIAS (ex: "40 dias", "40d", "40", "em 40 dias", "faltam 40 dias")
  const daysPattern = /^(?:em\s*|faltam?\s*|prazo\s*de\s*)?(\d+)\s*(?:dias?|d)?$/i;
  const overdueDaysPattern = /^(?:atrasad[oa]\s*(?:h[aá])?\s*|-)(\d+)\s*(?:dias?|d)?$/i;

  const overdueMatch = clean.match(overdueDaysPattern);
  const daysMatch = clean.match(daysPattern);

  if (overdueMatch && !clean.includes('/') && !clean.includes('-202') && !clean.includes('-203')) {
    const numDays = parseInt(overdueMatch[1], 10);
    return {
      date: new Date(today.getTime() - numDays * 24 * 60 * 60 * 1000),
      isDaysMode: true,
    };
  } else if (daysMatch && !clean.includes('/') && !clean.includes('-202') && !clean.includes('-203') && !clean.match(/\b202\d\b/)) {
    const numDays = parseInt(daysMatch[1], 10);
    return {
      date: new Date(today.getTime() + numDays * 24 * 60 * 60 * 1000),
      isDaysMode: true,
    };
  }
  // 2. ISO: YYYY-MM-DD
  else if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number);
    return { date: new Date(y, m - 1, d), isDaysMode: false };
  }
  // 3. Formato DD/MM/YYYY ou DD-MM-YYYY
  else if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(clean)) {
    const parts = clean.split(/[\/\-\.]/).map(Number);
    return { date: new Date(parts[2], parts[1] - 1, parts[0]), isDaysMode: false };
  } else {
    // 4. Reconhecimento de meses e trimestres/semestres
    const yearMatch = clean.match(/\b(202\d|203\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : now.getFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    if (clean.includes('janeiro') || clean.includes('jan')) {
      return { date: new Date(year, 0, 31), isDaysMode: false };
    } else if (clean.includes('fevereiro') || clean.includes('fev')) {
      return { date: new Date(year, 1, isLeap ? 29 : 28), isDaysMode: false };
    } else if (clean.includes('março') || clean.includes('marco') || clean.includes('mar') || clean.includes('1º trim') || clean.includes('q1')) {
      return { date: new Date(year, 2, 31), isDaysMode: false };
    } else if (clean.includes('abril') || clean.includes('abr')) {
      return { date: new Date(year, 3, 30), isDaysMode: false };
    } else if (clean.includes('maio') || clean.includes('mai')) {
      return { date: new Date(year, 4, 31), isDaysMode: false };
    } else if (clean.includes('junho') || clean.includes('jun') || clean.includes('1º sem') || clean.includes('s1') || clean.includes('2º trim') || clean.includes('q2')) {
      return { date: new Date(year, 5, 30), isDaysMode: false };
    } else if (clean.includes('julho') || clean.includes('jul')) {
      return { date: new Date(year, 6, 31), isDaysMode: false };
    } else if (clean.includes('agosto') || clean.includes('ago')) {
      return { date: new Date(year, 7, 31), isDaysMode: false };
    } else if (clean.includes('setembro') || clean.includes('set') || clean.includes('3º trim') || clean.includes('q3')) {
      return { date: new Date(year, 8, 30), isDaysMode: false };
    } else if (clean.includes('outubro') || clean.includes('out')) {
      return { date: new Date(year, 9, 31), isDaysMode: false };
    } else if (clean.includes('novembro') || clean.includes('nov')) {
      return { date: new Date(year, 10, 30), isDaysMode: false };
    } else if (clean.includes('dezembro') || clean.includes('dez') || clean.includes('2º sem') || clean.includes('s2') || clean.includes('4º trim') || clean.includes('q4')) {
      return { date: new Date(year, 11, 31), isDaysMode: false };
    } else if (yearMatch) {
      return { date: new Date(year, 11, 31), isDaysMode: false };
    }
  }

  return { date: null, isDaysMode: false };
};

export const calculateDaysRemaining = (
  dateStr: string | null | undefined
): DaysRemainingResult => {
  if (!dateStr || !dateStr.trim()) {
    return { days: null, label: '', isOverdue: false, isToday: false, colorClass: '' };
  }

  const { date: targetDate, isDaysMode } = parseAnyDateStringToDate(dateStr);
  const inputMode: 'days' | 'date' = isDaysMode ? 'days' : 'date';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!targetDate || isNaN(targetDate.getTime())) {
    return { days: null, label: dateStr, isOverdue: false, isToday: false, colorClass: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const targetDateFormatted = targetDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (diffDays === 0) {
    return {
      days: 0,
      label: 'Prazo termina hoje',
      isOverdue: false,
      isToday: true,
      colorClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      targetDateFormatted,
      inputMode,
    };
  } else if (diffDays > 0) {
    const colorClass =
      diffDays <= 30
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-blue-50 text-[#002D62] border-blue-200';
    return {
      days: diffDays,
      label: `Faltam ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
      isOverdue: false,
      isToday: false,
      colorClass,
      targetDateFormatted,
      inputMode,
    };
  } else {
    const absDays = Math.abs(diffDays);
    return {
      days: diffDays,
      label: `Atrasado há ${absDays} ${absDays === 1 ? 'dia' : 'dias'}`,
      isOverdue: true,
      isToday: false,
      colorClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
      targetDateFormatted,
      inputMode,
    };
  }
};

export interface ScheduleInconsistencyInfo {
  hasConflict: boolean;
  diffDays: number;
  milestoneDateText: string;
  projectCODText: string;
  suggestedNewCOD: string;
  warningMessage: string;
}

/**
 * Intelligently checks if an activity's deadline exceeds the project's overall completion date (COD).
 * Example: Project until Nov 2026, Activity until Dec 2026 -> Conflict!
 * Also produces a clean suggested COD to allow 1-click schedule prolongation.
 */
export const checkMilestoneExceedsProject = (
  milestoneTargetDate?: string | null,
  projectCOD?: string | null
): ScheduleInconsistencyInfo => {
  if (!milestoneTargetDate || !projectCOD || !milestoneTargetDate.trim() || !projectCOD.trim()) {
    return {
      hasConflict: false,
      diffDays: 0,
      milestoneDateText: milestoneTargetDate || '',
      projectCODText: projectCOD || '',
      suggestedNewCOD: '',
      warningMessage: '',
    };
  }

  const { date: milestoneDate, isDaysMode: mIsDays } = parseAnyDateStringToDate(milestoneTargetDate);
  const { date: projectDate } = parseAnyDateStringToDate(projectCOD);

  if (!milestoneDate || !projectDate || isNaN(milestoneDate.getTime()) || isNaN(projectDate.getTime())) {
    return {
      hasConflict: false,
      diffDays: 0,
      milestoneDateText: milestoneTargetDate,
      projectCODText: projectCOD,
      suggestedNewCOD: '',
      warningMessage: '',
    };
  }

  // Compare at midnight
  const mTime = new Date(milestoneDate.getFullYear(), milestoneDate.getMonth(), milestoneDate.getDate()).getTime();
  const pTime = new Date(projectDate.getFullYear(), projectDate.getMonth(), projectDate.getDate()).getTime();

  if (mTime > pTime) {
    const diffDays = Math.round((mTime - pTime) / (1000 * 60 * 60 * 24));

    // Determine clean suggested COD
    let suggestedNewCOD = milestoneTargetDate.trim();
    if (mIsDays) {
      const d = milestoneDate.getDate().toString().padStart(2, '0');
      const m = (milestoneDate.getMonth() + 1).toString().padStart(2, '0');
      const y = milestoneDate.getFullYear();
      suggestedNewCOD = `${d}/${m}/${y}`;
    }

    return {
      hasConflict: true,
      diffDays,
      milestoneDateText: milestoneTargetDate,
      projectCODText: projectCOD,
      suggestedNewCOD,
      warningMessage: `O prazo da actividade (${milestoneTargetDate}) ultrapassa a conclusão do projecto (${projectCOD}) em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}.`,
    };
  }

  return {
    hasConflict: false,
    diffDays: 0,
    milestoneDateText: milestoneTargetDate,
    projectCODText: projectCOD,
    suggestedNewCOD: '',
    warningMessage: '',
  };
};

/**
 * Checks all pending milestones of a project for conflicts against project COD.
 */
export const getProjectScheduleConflicts = (
  milestones: Array<{ completed: boolean; targetDate?: string }> = [],
  projectCOD?: string | null
): {
  hasConflicts: boolean;
  conflictCount: number;
  maxExceededDays: number;
  latestSuggestedCOD: string;
} => {
  if (!projectCOD) {
    return { hasConflicts: false, conflictCount: 0, maxExceededDays: 0, latestSuggestedCOD: '' };
  }

  let conflictCount = 0;
  let maxExceededDays = 0;
  let latestSuggestedCOD = '';
  let maxTime = 0;

  milestones.forEach(m => {
    if (!m.completed && m.targetDate) {
      const check = checkMilestoneExceedsProject(m.targetDate, projectCOD);
      if (check.hasConflict) {
        conflictCount++;
        if (check.diffDays > maxExceededDays) {
          maxExceededDays = check.diffDays;
        }
        const { date: mDate } = parseAnyDateStringToDate(m.targetDate);
        if (mDate && mDate.getTime() > maxTime) {
          maxTime = mDate.getTime();
          latestSuggestedCOD = check.suggestedNewCOD;
        }
      }
    }
  });

  return {
    hasConflicts: conflictCount > 0,
    conflictCount,
    maxExceededDays,
    latestSuggestedCOD,
  };
};

/**
 * Formats completion elapsed days.
 */
export const formatDaysSinceCompletion = (dateStr: string | null | undefined): string => {
  if (!dateStr || !dateStr.trim()) return 'Concluída';
  const clean = dateStr.trim();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let compDate: Date | null = null;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/').map(Number);
    compDate = new Date(y, m - 1, d);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number);
    compDate = new Date(y, m - 1, d);
  }

  if (compDate && !isNaN(compDate.getTime())) {
    const diffMs = today.getTime() - compDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return `Hoje (${clean})`;
    if (diffDays === 1) return `Ontem (${clean})`;
    if (diffDays > 1) return `Há ${diffDays} dias (${clean})`;
  }

  return clean;
};

export interface ProjectDelayInfo {
  isDelayed: boolean;
  maxDelayDays: number;
  overdueCount: number;
  upcomingCount: number;
  minUpcomingDays: number | null;
  label: string;
  badgeClass: string;
  statusText: string;
}

/**
 * Calculates whether a project has delayed activities based on today's date.
 * Considers pending milestones with targetDate and overall commercialOperationDate.
 */
export const getProjectDelayStatus = (
  milestones: Array<{ completed: boolean; targetDate?: string }> = [],
  commercialOperationDate?: string
): ProjectDelayInfo => {
  let overdueCount = 0;
  let maxDelayDays = 0;
  let minUpcomingDays: number | null = null;
  let upcomingCount = 0;

  milestones.forEach(m => {
    if (!m.completed && m.targetDate) {
      const remaining = calculateDaysRemaining(m.targetDate);
      if (remaining.isOverdue && remaining.days !== null) {
        overdueCount++;
        const absDays = Math.abs(remaining.days);
        if (absDays > maxDelayDays) {
          maxDelayDays = absDays;
        }
      } else if (remaining.days !== null && remaining.days >= 0) {
        upcomingCount++;
        if (minUpcomingDays === null || remaining.days < minUpcomingDays) {
          minUpcomingDays = remaining.days;
        }
      }
    }
  });

  if (overdueCount === 0 && commercialOperationDate) {
    const codRemaining = calculateDaysRemaining(commercialOperationDate);
    const allDone = milestones.length > 0 && milestones.every(m => m.completed);
    if (!allDone && codRemaining.isOverdue && codRemaining.days !== null) {
      overdueCount++;
      maxDelayDays = Math.abs(codRemaining.days);
    }
  }

  const allCompleted = milestones.length > 0 && milestones.every(m => m.completed);

  if (allCompleted) {
    return {
      isDelayed: false,
      maxDelayDays: 0,
      overdueCount: 0,
      upcomingCount: 0,
      minUpcomingDays: null,
      label: '✓ 100% Concluído',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusText: 'Todas as actividades concluídas com sucesso',
    };
  }

  if (overdueCount > 0) {
    return {
      isDelayed: true,
      maxDelayDays,
      overdueCount,
      upcomingCount,
      minUpcomingDays,
      label: `⚠️ Atrasado há ${maxDelayDays} ${maxDelayDays === 1 ? 'dia' : 'dias'}`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs font-black animate-pulse',
      statusText: `${overdueCount} ${overdueCount === 1 ? 'actividade em atraso' : 'actividades em atraso'} (máx. ${maxDelayDays} dias)`,
    };
  }

  if (minUpcomingDays !== null) {
    if (minUpcomingDays === 0) {
      return {
        isDelayed: false,
        maxDelayDays: 0,
        overdueCount: 0,
        upcomingCount,
        minUpcomingDays: 0,
        label: '⚠️ Prazo termina hoje',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        statusText: 'Actividade com prazo a terminar hoje',
      };
    }
    return {
      isDelayed: false,
      maxDelayDays: 0,
      overdueCount: 0,
      upcomingCount,
      minUpcomingDays,
      label: `✓ No Prazo (Faltam ${minUpcomingDays}d)`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
      statusText: `Próximo marco em ${minUpcomingDays} dias`,
    };
  }

  return {
    isDelayed: false,
    maxDelayDays: 0,
    overdueCount: 0,
    upcomingCount: 0,
    minUpcomingDays: null,
    label: '✓ No Prazo',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    statusText: 'Sem actividades em atraso',
  };
};

