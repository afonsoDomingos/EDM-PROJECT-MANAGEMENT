import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Search,
  Filter,
  ArrowUpRight,
  FolderGit2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Layers,
  Award,
  Sparkles,
  UserCheck,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrganizationalUnit, OrganizationalCategory, ApprovalDelegation } from '../../types';
import { INITIAL_ORGANIZATIONAL_UNITS, INITIAL_DELEGATIONS } from '../../data/organizationData';
import { formatCurrency, formatCompactMZN, formatDatePt } from '../../utils/formatters';

export const OrganizationView: React.FC = () => {
  const { projects, setSelectedProjectId, setActiveTab, setFilterCategory } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(null);
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>(INITIAL_DELEGATIONS);
  const [showAddDelegationModal, setShowAddDelegationModal] = useState<boolean>(false);

  // New delegation form state
  const [newDelegation, setNewDelegation] = useState({
    substituteName: '',
    substituteTitle: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reason: '',
    scope: 'Pareceres de Autos de Medição Técnica e Despachos Operacionais',
  });

  const categories: (string | OrganizationalCategory)[] = [
    'Todas',
    'Conselho de Administração',
    'Direcção Operacional',
    'Centro de Suporte',
    'Direcção Regional',
    'Área de Negócio Cliente',
    'Delegações de Competência',
  ];

  // Map units to project count
  const getUnitProjectCount = (unitCode: string, unitName: string) => {
    return projects.filter(p => {
      const dep = p.department.toLowerCase();
      const codeMatch = dep.includes(`(${unitCode.toLowerCase()})`) || dep.includes(unitCode.toLowerCase());
      const nameMatch = dep.includes(unitName.toLowerCase().split(' ')[2] || '');
      return codeMatch || nameMatch;
    }).length;
  };

  const filteredUnits = INITIAL_ORGANIZATIONAL_UNITS.filter(u => {
    if (activeCategory !== 'Todas' && activeCategory !== 'Delegações de Competência') {
      if (u.category !== activeCategory) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchCode = u.code.toLowerCase().includes(q);
      const matchDirector = u.directorName.toLowerCase().includes(q);
      const matchLoc = u.location.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDirector && !matchLoc) return false;
    }
    return true;
  });

  const totalTeams = INITIAL_ORGANIZATIONAL_UNITS.reduce((sum, u) => sum + u.teamCount, 0);

  const handleCreateDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelegation.substituteName || !newDelegation.endDate) return;

    const delegationItem: ApprovalDelegation = {
      id: `DEL-${Date.now().toString().slice(-4)}`,
      titularName: 'Eng. António Nhassego',
      titularTitle: 'Director Executivo',
      substituteName: newDelegation.substituteName,
      substituteTitle: newDelegation.substituteTitle || 'Substituto Autorizado',
      startDate: newDelegation.startDate,
      endDate: newDelegation.endDate,
      reason: newDelegation.reason || 'Delegação temporária de competências executivas.',
      status: 'Activa',
      authorizedScopes: [newDelegation.scope],
    };

    setDelegations(prev => [delegationItem, ...prev]);
    setShowAddDelegationModal(false);
    setNewDelegation({
      substituteName: '',
      substituteTitle: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reason: '',
      scope: 'Pareceres de Autos de Medição Técnica e Despachos Operacionais',
    });
  };

  const handleFilterProjectsByUnit = (unit: OrganizationalUnit) => {
    setActiveTab('projects');
  };

  const getCategoryBadgeColor = (cat: OrganizationalCategory) => {
    switch (cat) {
      case 'Conselho de Administração':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Direcção Operacional':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Centro de Suporte':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Direcção Regional':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Área de Negócio Cliente':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F7942D] text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Estrutura Organizacional & Governação EDM
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Organograma Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direcções centrais, centros de suporte, direcções regionais, alçadas de decisão e delegação de poderes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddDelegationModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7942D] hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <UserCheck className="w-4 h-4" />
          Registar Delegação de Poderes
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Unidades Orgânicas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-heading">
              {INITIAL_ORGANIZATIONAL_UNITS.length}
            </h3>
            <span className="text-[11px] text-slate-400">Direcções e Gabinetes mapeados</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F7942D] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Direcções Regionais</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-heading">3</h3>
            <span className="text-[11px] text-slate-400">Norte, Centro e Sul</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Efectivo em Equipas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-heading">
              {totalTeams.toLocaleString('pt-PT')}
            </h3>
            <span className="text-[11px] text-slate-400">Técnicos e engenheiros</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Delegações Activas</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-heading">
              {delegations.filter(d => d.status === 'Activa').length}
            </h3>
            <span className="text-[11px] text-slate-400">Substitutos legais em vigor</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
                {cat === 'Delegações de Competência' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                    {delegations.filter(d => d.status === 'Activa').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar unidade, titular, sigla..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
            />
          </div>
        </div>
      </div>

      {/* Main View: Units or Delegations */}
      {activeCategory === 'Delegações de Competência' ? (
        /* Delegations Section */
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="block font-bold">Mecanismo de Despacho em Substituição:</strong>
              As delegações de competências permitem que directores executivos nomeiem formalmente substitutos credenciados para emitir pareceres e aprovações durante missões de serviço ou impedimentos legais temporários. Todas as assinaturas são carimbadas com a menção expressa de substituição legal.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {delegations.map(del => (
              <div
                key={del.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {del.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatDatePt(del.startDate)} até {formatDatePt(del.endDate)}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Titular: <span className="text-[#c26508]">{del.titularName}</span>
                  </h4>
                  <p className="text-xs text-slate-500">{del.titularTitle}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <p className="font-semibold text-slate-700">
                    Substituto Autorizado: <strong className="text-slate-900">{del.substituteName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">{del.substituteTitle}</p>
                  <p className="text-[11px] text-slate-600 pt-1 italic">"{del.reason}"</p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Âmbito Autorizado:
                  </span>
                  <ul className="space-y-1">
                    {del.authorizedScopes.map((scope, i) => (
                      <li key={i} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {scope}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Units Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map(unit => {
            const projectCount = getUnitProjectCount(unit.code, unit.name);

            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#F7942D]/50 hover:shadow-md transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top line: Code and Category */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm font-mono shadow-xs group-hover:bg-[#F7942D] transition-colors">
                      {unit.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(
                        unit.category
                      )}`}
                    >
                      {unit.category}
                    </span>
                  </div>

                  {/* Directorate Name & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug font-heading">
                      {unit.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {unit.description}
                    </p>
                  </div>

                  {/* Director & Leadership Info */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F7942D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {unit.directorName
                          .split(' ')
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {unit.directorName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{unit.directorTitle}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Alçada de Despacho:</span>
                      <strong className="text-slate-900 font-mono">
                        {unit.approvalThresholdMZN === 0
                          ? 'Sem limite (PCA)'
                          : formatCompactMZN(unit.approvalThresholdMZN)}
                      </strong>
                    </div>
                  </div>

                  {/* Metadata strip */}
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{unit.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        Equipa: <strong>{unit.teamCount} pessoas</strong>
                      </span>
                      {projectCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c26508] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                          <FolderGit2 className="w-3 h-3" />
                          {projectCount} Projectos
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-400 truncate">
                    {unit.contactEmail}
                  </span>
                  <button
                    onClick={() => handleFilterProjectsByUnit(unit)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#c26508] hover:text-orange-700 hover:underline shrink-0"
                  >
                    Ver Carteira →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Delegation Modal */}
      {showAddDelegationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateDelegation}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-800 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Delegação de Competências
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Registar Substituto Autorizado
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Titular: <strong>Eng. António Nhassego</strong> (Director Executivo)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Substituto Autorizado:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dra. Teresa Cossa"
                  value={newDelegation.substituteName}
                  onChange={e => setNewDelegation({ ...newDelegation, substituteName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cargo / Função do Substituto:
                </label>
                <input
                  type="text"
                  placeholder="ex: Gestora Sénior de Projectos de Electrificação Rural"
                  value={newDelegation.substituteTitle}
                  onChange={e => setNewDelegation({ ...newDelegation, substituteTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data de Início:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDelegation.startDate}
                    onChange={e => setNewDelegation({ ...newDelegation, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data de Término:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDelegation.endDate}
                    onChange={e => setNewDelegation({ ...newDelegation, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo da Ausência / Missão:
                </label>
                <input
                  type="text"
                  placeholder="ex: Missão oficial de serviço junto da SAPP em Joanesburgo"
                  value={newDelegation.reason}
                  onChange={e => setNewDelegation({ ...newDelegation, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Âmbito e Poderes Delegados:
                </label>
                <textarea
                  rows={2}
                  value={newDelegation.scope}
                  onChange={e => setNewDelegation({ ...newDelegation, scope: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDelegationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F7942D] hover:bg-orange-600 text-white shadow-sm transition"
              >
                Homologar Delegação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
