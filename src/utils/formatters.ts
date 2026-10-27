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

/**
 * Computes days remaining or overdue for any date string (ISO, DD/MM/YYYY, or descriptive Portuguese terms).
 */
export const calculateDaysRemaining = (
  dateStr: string | null | undefined
): {
  days: number | null;
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  colorClass: string;
} => {
  if (!dateStr || !dateStr.trim()) {
    return { days: null, label: '', isOverdue: false, isToday: false, colorClass: '' };
  }

  const clean = dateStr.trim().toLowerCase();
  let targetDate: Date | null = null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number);
    targetDate = new Date(y, m - 1, d);
  }
  // Format DD/MM/YYYY
  else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/').map(Number);
    targetDate = new Date(y, m - 1, d);
  } else {
    // Search year
    const yearMatch = clean.match(/\b(202\d|203\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : now.getFullYear();

    if (clean.includes('janeiro') || clean.includes('jan')) {
      targetDate = new Date(year, 0, 31);
    } else if (clean.includes('fevereiro') || clean.includes('fev')) {
      targetDate = new Date(year, 1, 28);
    } else if (clean.includes('março') || clean.includes('mar') || clean.includes('1º trim') || clean.includes('q1')) {
      targetDate = new Date(year, 2, 31);
    } else if (clean.includes('abril') || clean.includes('abr')) {
      targetDate = new Date(year, 3, 30);
    } else if (clean.includes('maio') || clean.includes('mai')) {
      targetDate = new Date(year, 4, 31);
    } else if (clean.includes('junho') || clean.includes('jun') || clean.includes('1º sem') || clean.includes('s1') || clean.includes('2º trim') || clean.includes('q2')) {
      targetDate = new Date(year, 5, 30);
    } else if (clean.includes('julho') || clean.includes('jul')) {
      targetDate = new Date(year, 6, 31);
    } else if (clean.includes('agosto') || clean.includes('ago')) {
      targetDate = new Date(year, 7, 31);
    } else if (clean.includes('setembro') || clean.includes('set') || clean.includes('3º trim') || clean.includes('q3')) {
      targetDate = new Date(year, 8, 30);
    } else if (clean.includes('outubro') || clean.includes('out')) {
      targetDate = new Date(year, 9, 31);
    } else if (clean.includes('novembro') || clean.includes('nov')) {
      targetDate = new Date(year, 10, 30);
    } else if (clean.includes('dezembro') || clean.includes('dez') || clean.includes('2º sem') || clean.includes('s2') || clean.includes('4º trim') || clean.includes('q4')) {
      targetDate = new Date(year, 11, 31);
    } else if (yearMatch) {
      targetDate = new Date(year, 11, 31);
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    return { days: null, label: dateStr, isOverdue: false, isToday: false, colorClass: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      days: 0,
      label: 'Prazo termina hoje',
      isOverdue: false,
      isToday: true,
      colorClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
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
    };
  } else {
    const absDays = Math.abs(diffDays);
    return {
      days: diffDays,
      label: `Atrasado há ${absDays} ${absDays === 1 ? 'dia' : 'dias'}`,
      isOverdue: true,
      isToday: false,
      colorClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    };
  }
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

