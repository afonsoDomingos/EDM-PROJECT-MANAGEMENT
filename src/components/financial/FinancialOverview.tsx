import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowUpRight,
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

export const FinancialOverview: React.FC = () => {
  const { projects, expenses, addExpense, deleteExpense, isReadOnly, setSelectedProjectId } = useApp();

  const [selectedProjectFilter, setSelectedProjectFilter] = useState('Todos');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);

  // New expense form
  const [expenseForm, setExpenseForm] = useState({
    projectId: projects[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    supplier: '',
    amount: 0,
    invoiceNumber: '',
    approvedBy: 'Eng. António Nhassego',
    category: 'Equipamento' as any,
  });

  // Financial aggregates
  const totalApproved = projects.reduce((sum, p) => sum + (p.approvedBudget || 0), 0);
  const totalRevised = projects.reduce((sum, p) => sum + (p.revisedBudget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spentBudget || 0), 0);
  const totalCommitments = projects.reduce((sum, p) => sum + (p.commitments || 0), 0);
  const totalBalance = Math.max(0, totalRevised - totalSpent);
  const globalFinancialExec = calculateFinancialExecution(totalSpent, totalRevised);

  // Projects with financial alerts (overbudget or variance > 15%)
  const projectsWithAlerts = projects.filter(p => {
    const finExec = calculateFinancialExecution(p.spentBudget, p.revisedBudget);
    const variance = finExec - p.physicalProgress;
    return p.spentBudget > p.revisedBudget || Math.abs(variance) > 15;
  });

  const filteredExpenses = expenses.filter(e => {
    if (selectedProjectFilter !== 'Todos' && e.projectId !== selectedProjectFilter) return false;
    if (selectedCategoryFilter !== 'Todas' && e.category !== selectedCategoryFilter) return false;
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || expenseForm.amount <= 0 || !expenseForm.projectId) return;
    addExpense({
      ...expenseForm,
      invoiceNumber: expenseForm.invoiceNumber || `FAT-${Date.now().toString().slice(-4)}`,
    });
    setShowAddModal(false);
    setExpenseForm({
      projectId: projects[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      supplier: '',
      amount: 0,
      invoiceNumber: '',
      approvedBy: 'Eng. António Nhassego',
      category: 'Equipamento',
    });
  };

  const handleExportCsv = () => {
    const headers = ['ID Despesa', 'Código Projecto', 'Data', 'Descrição', 'Fornecedor', 'Categoria', 'Valor (MZN)', 'Aprovado Por'];
    const rows = filteredExpenses.map(e => {
      const p = projects.find(prj => prj.id === e.projectId);
      return [
        e.id,
        p?.code || e.projectId,
        e.date,
        e.description,
        e.supplier,
        e.category,
        e.amount,
        e.approvedBy,
      ];
    });
    exportToCsv('historico_despesas_edm', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Gestão e Monitorização Financeira
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c26508] font-bold">
              Moeda: Metical (MZN)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento de orçamentos aprovados, compromissos, liquidações e controlo de desvios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar Despesas
          </button>
          {!isReadOnly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7942D] hover:bg-[#e07d17] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Registar Despesa
            </button>
          )}
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Orçamento Revisto Total
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCompactMZN(totalRevised)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Aprovado Inicial: {formatCompactMZN(totalApproved)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-[#c26508] uppercase tracking-wide">
            Despesas Liquidadas
          </span>
          <h3 className="text-2xl font-black text-[#c26508] mt-1 font-mono">
            {formatCompactMZN(totalSpent)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Compromissos: {formatCompactMZN(totalCommitments)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            Saldo Disponível Global
          </span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {formatCompactMZN(totalBalance)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Margem orçamental em caixa
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-[#c26508] uppercase tracking-wide">
            Execução Financeira Média
          </span>
          <h3 className="text-2xl font-black text-[#F7942D] mt-1 font-mono">
            {formatPercent(globalFinancialExec)}
          </h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#F7942D] h-full rounded-full"
              style={{ width: `${Math.min(globalFinancialExec, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Variance & Overbudget Alerts Section */}
      {projectsWithAlerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-900 font-heading">
              Alertas de Desvio Financeiro & Orçamental ({projectsWithAlerts.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectsWithAlerts.map(p => {
              const finExec = calculateFinancialExecution(p.spentBudget, p.revisedBudget);
              const variance = finExec - p.physicalProgress;
              const isOver = p.spentBudget > p.revisedBudget;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className="bg-white p-3.5 rounded-xl border border-amber-200 hover:shadow-md cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#c26508] bg-orange-50 px-1.5 py-0.5 rounded">
                      {p.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOver ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isOver ? 'Orçamento Ultrapassado' : `Desvio: ${formatPercent(variance)}`}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mt-1 truncate">{p.name}</h5>
                  <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Exec. Física: <strong>{p.physicalProgress}%</strong></span>
                      <span>Exec. Financeira: <strong>{formatPercent(finExec)}</strong></span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Orçamento: {formatCompactMZN(p.revisedBudget)}</span>
                      <span>Gasto: {formatCompactMZN(p.spentBudget)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Financial Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-900 font-heading">
            Quadro Comparativo por Empreendimento
          </h4>
          <span className="text-xs text-slate-500">
            {projects.length} projectos monitorizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Projecto</th>
                <th className="py-3 px-3 text-right">Orçamento Revisto</th>
                <th className="py-3 px-3 text-right">Despesas Acumuladas</th>
                <th className="py-3 px-3 text-right">Saldo Orçamental</th>
                <th className="py-3 px-3 text-center">Exec. Financeira</th>
                <th className="py-3 px-3 text-center">Exec. Física</th>
                <th className="py-3 px-3 text-center">Desvio (%)</th>
                <th className="py-3 px-4 text-center">Estado Financeiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(p => {
                const finExec = calculateFinancialExecution(p.spentBudget, p.revisedBudget);
                const variance = finExec - p.physicalProgress;
                const balance = Math.max(0, p.revisedBudget - p.spentBudget);
                const isOver = p.spentBudget > p.revisedBudget;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className="hover:bg-orange-50/20 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <span className="font-mono text-[10px] text-slate-500">{p.code} • {p.fundingSource}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(p.revisedBudget)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#c26508]">
                      {formatCurrency(p.spentBudget)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(balance)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      {formatPercent(finExec)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#F7942D]">
                      {p.physicalProgress}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span
                        className={`font-bold ${
                          Math.abs(variance) > 15
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {variance > 0 ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOver
                            ? 'bg-rose-100 text-rose-800'
                            : Math.abs(variance) > 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOver ? 'Derrapagem' : Math.abs(variance) > 15 ? 'Em Alerta' : 'Equilibrado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Histórico Consolidado de Despesas e Autos de Medição
            </h4>
            <p className="text-xs text-slate-500">
              Registos individuais auditáveis de pagamento e certificação
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedProjectFilter}
              onChange={e => setSelectedProjectFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="Todos">Todos os Projectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref. / Data</th>
                <th className="py-3 px-4">Projecto</th>
                <th className="py-3 px-4">Descrição da Despesa</th>
                <th className="py-3 px-3">Fornecedor / Empreiteiro</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-right">Valor (MZN)</th>
                {!isReadOnly && <th className="py-3 px-4 text-center">Acção</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(e => {
                const project = projects.find(p => p.id === e.projectId);
                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-slate-900">{e.invoiceNumber || e.id}</span>
                      <p className="text-[11px] text-slate-400">{formatDatePt(e.date)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        onClick={() => setSelectedProjectId(e.projectId)}
                        className="font-mono text-xs font-bold text-[#c26508] hover:underline cursor-pointer"
                      >
                        {project?.code || e.projectId}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{project?.name}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{e.description}</td>
                    <td className="py-3 px-3 text-slate-600">{e.supplier}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(e.amount)}
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Deseja anular este registo de despesa?')) {
                              deleteExpense(e.id);
                            }
                          }}
                          className="text-[11px] text-red-600 hover:text-red-800 font-semibold"
                        >
                          Anular
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Lançamento de Despesa / Auto de Medição
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Projecto *
                </label>
                <select
                  required
                  value={expenseForm.projectId}
                  onChange={e => setExpenseForm({ ...expenseForm, projectId: e.target.value })}
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
                  Descrição da Despesa / Auto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fornecimento de 50 postes e cruzetas..."
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor (MZN) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Valor em Meticais..."
                    value={expenseForm.amount || ''}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data da Despesa *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fornecedor / Empreiteiro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Siemens Energy..."
                    value={expenseForm.supplier}
                    onChange={e => setExpenseForm({ ...expenseForm, supplier: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Equipamento">Equipamento</option>
                    <option value="Obras Civis">Obras Civis</option>
                    <option value="Fiscalização">Fiscalização</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="Logística">Logística</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
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
                  Registar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
