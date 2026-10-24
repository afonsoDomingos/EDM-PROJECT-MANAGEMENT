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
