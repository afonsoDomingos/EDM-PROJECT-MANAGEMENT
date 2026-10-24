import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Project,
  ProjectCategory,
  ProjectStatus,
  PriorityLevel,
  Region,
  MozambiqueProvince,
} from '../../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

const PROVINCES_BY_REGION: Record<Region, MozambiqueProvince[]> = {
  Norte: ['Niassa', 'Cabo Delgado', 'Nampula'],
  Centro: ['Zambézia', 'Tete', 'Manica', 'Sofala'],
  Sul: ['Inhambane', 'Gaza', 'Província de Maputo', 'Cidade de Maputo'],
};

const CATEGORIES: ProjectCategory[] = [
  'Electrificação Rural',
  'Expansão da Rede',
  'Construção de Subestações',
  'Reabilitação de Infra-estruturas',
  'Instalação de Postos de Transformação',
];

const STATUSES: ProjectStatus[] = [
  'Por Iniciar',
  'Em Execução',
  'Concluído',
  'Atrasado',
  'Em Risco',
];

const PRIORITIES: PriorityLevel[] = ['Baixa', 'Média', 'Alta', 'Crítica'];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { addProject, updateProject, canManageBudget } = useApp();

  const [formData, setFormData] = useState<Partial<Project>>({
    code: '',
    name: '',
    description: '',
    category: 'Electrificação Rural',
    region: 'Centro',
    province: 'Tete',
    locality: '',
    manager: 'Dra. Teresa Cossa',
    department: 'Direcção de Electrificação Rural (DER)',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    status: 'Em Execução',
    priority: 'Alta',
    physicalProgress: 0,
    approvedBudget: 100000000,
    revisedBudget: 100000000,
    spentBudget: 0,
    commitments: 0,
    fundingSource: 'Banco Mundial & EDM',
    financingType: 'Donativo',
    modality: 'Directo',
    phase: 'Execução',
    constraints: '',
    risksNotes: '',
    observations: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setFormData({ ...projectToEdit });
    } else {
      setFormData({
        code: `EDM-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        description: '',
        category: 'Electrificação Rural',
        region: 'Centro',
        province: 'Tete',
        locality: '',
        manager: 'Eng. Armindo Macaringue',
        department: 'Direcção de Transporte (DTR)',
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: '2026-12-31',
        status: 'Por Iniciar',
        priority: 'Média',
        physicalProgress: 0,
        approvedBudget: 150000000,
        revisedBudget: 150000000,
        spentBudget: 0,
        commitments: 0,
        fundingSource: 'Governo de Moçambique & EDM',
        financingType: 'Donativo',
        modality: 'Directo',
        phase: 'Preparação',
        constraints: '',
        risksNotes: '',
        observations: '',
      });
    }
    setErrorMsg('');
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleRegionChange = (newRegion: Region) => {
    const provs = PROVINCES_BY_REGION[newRegion];
    setFormData(prev => ({
      ...prev,
      region: newRegion,
      province: provs[0],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name?.trim()) {
      setErrorMsg('O nome do projecto é obrigatório.');
      return;
    }
    if (!formData.code?.trim()) {
      setErrorMsg('O código do projecto é obrigatório.');
      return;
    }
    if (!formData.startDate || !formData.expectedEndDate) {
      setErrorMsg('As datas de início e de conclusão são obrigatórias.');
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.expectedEndDate)) {
      setErrorMsg('A data de início não pode ser posterior à data de conclusão prevista.');
      return;
    }
    if ((formData.approvedBudget || 0) < 0 || (formData.spentBudget || 0) < 0) {
      setErrorMsg('Os valores orçamentais e despesas não podem ser negativos.');
      return;
    }

    if (projectToEdit) {
      updateProject(formData as Project);
    } else {
      addProject(formData as Omit<Project, 'id' | 'lastUpdated'>);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              {projectToEdit ? 'Editar Projecto' : 'Criar Novo Projecto EDM'}
            </h3>
            <p className="text-xs text-slate-500">
              Preencha os dados institucionais, operacionais e financeiros
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Identificação */}
          <div>
            <h4 className="text-xs font-bold text-[#F7942D] uppercase tracking-wider mb-3">
              1. Identificação Geral
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código do Projecto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: EDM-TR-2025-01"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Projecto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Construção da Subestação 110kV..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição do Âmbito
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Objectivos, extensão de linha ou especificações técnicas..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado Operacional *
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prioridade *
                </label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Localização e Responsabilidade */}
          <div>
            <h4 className="text-xs font-bold text-[#F7942D] uppercase tracking-wider mb-3">
              2. Localização e Responsabilidade
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Região *
                </label>
                <select
                  value={formData.region}
                  onChange={e => handleRegionChange(e.target.value as Region)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                >
                  <option value="Norte">Norte</option>
                  <option value="Centro">Centro</option>
                  <option value="Sul">Sul</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Província *
                </label>
                <select
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value as MozambiqueProvince })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                >
                  {(PROVINCES_BY_REGION[formData.region as Region] || []).map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Distrito / Localidade *
                </label>
                <input
                  type="text"
                  value={formData.locality || ''}
                  onChange={e => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="Ex: Distrito de Moatize"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gestor Responsável *
                </label>
                <input
                  type="text"
                  value={formData.manager || ''}
                  onChange={e => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Ex: Eng. Armindo Macaringue"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Direcção / Departamento *
                </label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: Direcção de Transporte (DTR)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Prazos e Execução Física */}
          <div>
            <h4 className="text-xs font-bold text-[#F7942D] uppercase tracking-wider mb-3">
              3. Prazos e Execução Física
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Início *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate || ''}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conclusão Prevista *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expectedEndDate || ''}
                  onChange={e => setFormData({ ...formData, expectedEndDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Progresso Físico (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.physicalProgress || 0}
                  onChange={e => setFormData({ ...formData, physicalProgress: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Gestão Financeira */}
          <div>
            <h4 className="text-xs font-bold text-[#F7942D] uppercase tracking-wider mb-3">
              4. Orçamento e Despesas (MZN)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Orçamento Aprovado (MZN) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  disabled={!canManageBudget()}
                  value={formData.approvedBudget || 0}
                  onChange={e => setFormData({ ...formData, approvedBudget: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D] disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Orçamento Revisto (MZN) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  disabled={!canManageBudget()}
                  value={formData.revisedBudget || 0}
                  onChange={e => setFormData({ ...formData, revisedBudget: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D] disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Despesas Acumuladas (MZN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.spentBudget || 0}
                  onChange={e => setFormData({ ...formData, spentBudget: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fonte de Financiamento
                </label>
                <input
                  type="text"
                  value={formData.fundingSource || ''}
                  onChange={e => setFormData({ ...formData, fundingSource: e.target.value })}
                  placeholder="Ex: Banco Mundial, ASDI, BAD, KfW"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Financiamento
                </label>
                <input
                  type="text"
                  value={formData.financingType || ''}
                  onChange={e => setFormData({ ...formData, financingType: e.target.value })}
                  placeholder="Ex: Donativo, Empréstimo, Capital Próprio"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modalidade & Fase
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.modality || ''}
                    onChange={e => setFormData({ ...formData, modality: e.target.value })}
                    placeholder="Modalidade (Ex: Directo, Indireto)"
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                  />
                  <input
                    type="text"
                    value={formData.phase || ''}
                    onChange={e => setFormData({ ...formData, phase: e.target.value })}
                    placeholder="Fase (Ex: Execução, Concurso)"
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Constrangimentos Actuais
                </label>
                <input
                  type="text"
                  value={formData.constraints || ''}
                  onChange={e => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="Ex: Desembaraço aduaneiro no Porto de Maputo pendente, atrasos de material..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Riscos Críticos & Observações
                </label>
                <textarea
                  rows={2}
                  value={formData.risksNotes || ''}
                  onChange={e => setFormData({ ...formData, risksNotes: e.target.value })}
                  placeholder="Notas de risco técnico, ambiental ou contratual..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#F7942D]"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#F7942D] hover:bg-[#e07d17] rounded-xl shadow-md shadow-orange-500/20 transition"
            >
              <Save className="w-4 h-4" />
              {projectToEdit ? 'Gravar Alterações' : 'Criar Projecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
