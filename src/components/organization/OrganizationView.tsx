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
  Briefcase,
  History,
  User,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  OrganizationalUnit,
  OrganizationalCategory,
  ApprovalDelegation,
  BoardMember,
  PastPresident,
} from '../../types';
import {
  EDM_BOARD_MEMBERS,
  EDM_PAST_PRESIDENTS,
  INITIAL_ORGANIZATIONAL_UNITS,
  INITIAL_DELEGATIONS,
} from '../../data/organizationData';
import { formatCurrency, formatCompactMZN, formatDatePt } from '../../utils/formatters';

export const OrganizationView: React.FC = () => {
  const { projects, setSelectedProjectId, setActiveTab, setFilterCategory } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('Conselho de Administração');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(null);
  const [selectedBoardMember, setSelectedBoardMember] = useState<BoardMember | null>(null);
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
    'Conselho de Administração',
    'Centros de Suporte',
    'Centros de Negócio',
    'Área de Serviço ao Cliente',
    'Divisões',
    'Delegações de Competência',
    'Todas',
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

  // Filter units
  const filteredUnits = INITIAL_ORGANIZATIONAL_UNITS.filter(u => {
    if (activeCategory !== 'Todas' && activeCategory !== 'Delegações de Competência' && activeCategory !== 'Conselho de Administração') {
      if (u.category !== activeCategory) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchCode = u.code.toLowerCase().includes(q);
      const matchDirector = u.directorName.toLowerCase().includes(q);
      const matchLoc = u.location.toLowerCase().includes(q);
      const matchPelouro = u.pelouro ? u.pelouro.toLowerCase().includes(q) : false;
      if (!matchName && !matchCode && !matchDirector && !matchLoc && !matchPelouro) return false;
    }
    return true;
  });

  // Filter board members
  const filteredBoardMembers = EDM_BOARD_MEMBERS.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.pelouro.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.supervisedUnits.some(u => u.toLowerCase().includes(q))
    );
  });

  // Filter past presidents
  const filteredPastPresidents = EDM_PAST_PRESIDENTS.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mandateYears.toLowerCase().includes(q) ||
      (p.notableAchievements && p.notableAchievements.toLowerCase().includes(q))
    );
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
      case 'Centros de Negócio':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Centros de Suporte':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Área de Serviço ao Cliente':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Divisões':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const pcaMember = EDM_BOARD_MEMBERS.find(m => m.role === 'PCA') || EDM_BOARD_MEMBERS[0];
  const executiveAdministrators = EDM_BOARD_MEMBERS.filter(m => m.role === 'Administrador Executivo');

  // Breadcrumb category text
  const getBreadcrumbTitle = () => {
    switch (activeCategory) {
      case 'Conselho de Administração':
        return 'Conselho de Administração';
      case 'Centros de Suporte':
        return 'Centros de Suporte';
      case 'Centros de Negócio':
        return 'Centros de Negócio';
      case 'Área de Serviço ao Cliente':
        return 'Área de Serviço ao Cliente';
      case 'Divisões':
        return 'Divisões';
      case 'Delegações de Competência':
        return 'Delegações de Competência';
      default:
        return 'Estrutura Organizacional';
    }
  };

  return (
    <div className="space-y-6">
      {/* Official EDM Portal Style Header with Watermark */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e07d19] via-[#f7942d] to-[#ffa343] p-8 text-white shadow-lg border border-orange-400/30">
        {/* Subtle Watermark EDM Seal Background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-15 pointer-events-none select-none">
          <svg className="w-80 h-80 text-white" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,5 95,90 5,90" fill="none" stroke="currentColor" strokeWidth="4" />
            <line x1="50" y1="5" x2="50" y2="90" stroke="currentColor" strokeWidth="3" />
            <line x1="28" y1="50" x2="72" y2="50" stroke="currentColor" strokeWidth="3" />
            <line x1="38" y1="70" x2="62" y2="70" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Breadcrumb matching official portal */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-white/80">
              <span>PORTAL EDM</span>
              <span>•</span>
              <span>EMPRESA</span>
              <span>•</span>
              <span className="text-white underline decoration-white/50">{getBreadcrumbTitle()}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading drop-shadow-sm">
              {getBreadcrumbTitle()}
            </h1>

            <p className="text-xs md:text-sm text-white/90 max-w-2xl leading-relaxed">
              Estrutura hierárquica oficial da Electricidade de Moçambique, E.P. — composição do Conselho de Administração, pelouros executivos, centros operacionais, áreas de serviço e histórico institucional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddDelegationModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold transition shadow-md cursor-pointer border border-white/20"
            >
              <UserCheck className="w-4 h-4 text-[#F7942D]" />
              Registar Delegação de Poderes
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conselho Admin.</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 font-heading">
              1 PCA + 6 Pelouros
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold">Órgão Máximo de Gestão</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Centros de Suporte</p>
            <h3 className="text-xl font-bold text-blue-600 mt-0.5 font-heading">
              {INITIAL_ORGANIZATIONAL_UNITS.filter(u => u.category === 'Centros de Suporte').length}
            </h3>
            <span className="text-[11px] text-slate-400">Direcções Centrais</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Centros de Negócio</p>
            <h3 className="text-xl font-bold text-orange-600 mt-0.5 font-heading">
              {INITIAL_ORGANIZATIONAL_UNITS.filter(u => u.category === 'Centros de Negócio').length}
            </h3>
            <span className="text-[11px] text-slate-400">Operações e Regionais</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Áreas de Serviço (ASC)</p>
            <h3 className="text-xl font-bold text-purple-600 mt-0.5 font-heading">
              {INITIAL_ORGANIZATIONAL_UNITS.filter(u => u.category === 'Área de Serviço ao Cliente').length}
            </h3>
            <span className="text-[11px] text-slate-400">Atendimento Provincial</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Divisões Técnicas</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 font-heading">
              {INITIAL_ORGANIZATIONAL_UNITS.filter(u => u.category === 'Divisões').length}
            </h3>
            <span className="text-[11px] text-slate-400">Transporte & SCADA</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar titular, pelouro, cargo, sigla..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#F7942D]"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW: CONSELHO DE ADMINISTRAÇÃO (Matches Screenshot 1) */}
      {/* ========================================================================= */}
      {activeCategory === 'Conselho de Administração' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top PCA Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#F7942D]" />
              Composição dos Membros do Conselho de Administração
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              PCA
            </h2>

            {/* PCA Card - Centered and Prominent */}
            <div className="max-w-xl mx-auto">
              <div className="bg-white rounded-3xl border-2 border-[#F7942D]/40 p-6 md:p-8 shadow-md hover:shadow-xl transition-all relative overflow-hidden group text-center space-y-4">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-[#F7942D] to-orange-600" />

                {/* PCA Avatar / Badge */}
                <div className="relative inline-block mx-auto">
                  {pcaMember.photoUrl ? (
                    <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-4 border-amber-300 group-hover:scale-105 transition-transform mx-auto bg-slate-900">
                      <img
                        src={pcaMember.photoUrl}
                        alt={pcaMember.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center shadow-lg border-4 border-amber-100 group-hover:scale-105 transition-transform mx-auto">
                      <span className="text-3xl font-black font-heading text-amber-400">MGA</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 mt-1">EDM • PCA</span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#F7942D] text-white flex items-center justify-center shadow-md">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 font-heading">
                    {pcaMember.name}
                  </h3>
                  <p className="text-xs font-bold text-[#c26508] uppercase tracking-wider mt-1">
                    Administração • {pcaMember.pelouro}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">
                    {pcaMember.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Supervisão Directa:</span>
                  {pcaMember.supervisedUnits.map((u, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {u}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-center gap-4 text-xs">
                  <a
                    href={`mailto:${pcaMember.email}`}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#c26508] transition font-medium"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {pcaMember.email}
                  </a>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Alçada Ilimitada (Governação)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Administradores Executivos Section */}
          <div className="space-y-5 pt-4">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                Administradores Executivos
              </h3>
              <p className="text-xs text-slate-500">
                Membros do Conselho de Administração com pelouros operacionais e alçadas de decisão executiva
              </p>
            </div>

            {/* 6 Executive Administrators Grid (Matches 3x2 grid in Screenshot 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {executiveAdministrators.map(admin => {
                const initials = admin.name
                  .split(' ')
                  .filter(n => n.length > 2)
                  .map(n => n[0])
                  .slice(0, 3)
                  .join('');

                return (
                  <div
                    key={admin.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-[#F7942D]/60 hover:shadow-xl transition-all p-6 shadow-xs flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-4 text-center">
                      {/* Avatar Portrait Styled Badge */}
                      {admin.photoUrl ? (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md mx-auto group-hover:scale-105 transition-transform border-2 border-orange-200 bg-slate-900">
                          <img
                            src={admin.photoUrl}
                            alt={admin.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex flex-col items-center justify-center shadow-md mx-auto group-hover:scale-105 transition-transform border-2 border-orange-100">
                          <span className="text-xl font-black font-heading text-amber-300">{initials}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">EDM ADM</span>
                        </div>
                      )}

                      {/* Name & Pelouro */}
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-heading leading-snug group-hover:text-[#c26508] transition-colors">
                          {admin.name}
                        </h4>
                        <p className="text-xs font-extrabold text-[#F7942D] mt-1">
                          {admin.pelouro}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed text-left bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {admin.description}
                      </p>

                      {/* Supervised Units */}
                      <div className="text-left space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Direcções Sob Tutela Directa:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {admin.supervisedUnits.map((unit, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-orange-50 text-[#c26508] border border-orange-100"
                            >
                              {unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Contact & Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <a
                        href={`mailto:${admin.email}`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 truncate"
                        title={admin.email}
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{admin.email}</span>
                      </a>
                      <button
                        onClick={() => {
                          setSearchQuery(admin.name.split(' ')[0]);
                          setActiveCategory('Todas');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c26508] hover:underline shrink-0"
                      >
                        Ver Estrutura →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW: ÁREA DE SERVIÇO AO CLIENTE (Matches Screenshot 2) */}
      {/* ========================================================================= */}
      {activeCategory === 'Área de Serviço ao Cliente' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-start gap-3">
            <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 leading-relaxed">
              <strong className="block font-bold">Rede Territorial de Atendimento ao Cliente (ASCs):</strong>
              As Áreas de Serviço ao Cliente asseguram a presença comercial da EDM nas cidades e distritos de todo o país, gerindo o atendimento ao público, ligações novas da rede Credelec, manutenção de ramais e redução de perdas comerciais.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUnits
              .filter(u => u.category === 'Área de Serviço ao Cliente')
              .map(unit => {
                const initials = unit.directorName
                  .split(' ')
                  .filter(n => n.length > 2)
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('');

                return (
                  <div
                    key={unit.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all p-5 shadow-xs text-center space-y-3 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Avatar Monogram Circle (Matches AG, MA, ID, SB in Screenshot 2) */}
                      <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-purple-200 text-purple-700 flex items-center justify-center font-black text-lg mx-auto shadow-xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        {initials}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {unit.directorName}
                        </h4>
                        <p className="text-xs font-semibold text-purple-700 mt-0.5">
                          {unit.name}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{unit.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-600 border-t border-slate-200/60">
                          <span>Equipa: <strong>{unit.teamCount} técnicos</strong></span>
                          <span>Âmbito: <strong>Atendimento & Redes</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 truncate">
                      <a href={`mailto:${unit.contactEmail}`} className="hover:text-purple-700 truncate">
                        {unit.contactEmail}
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: DIVISÕES (Matches Screenshot 3) */}
      {/* ========================================================================= */}
      {activeCategory === 'Divisões' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <strong className="block font-bold">Divisões Técnicas Especializadas:</strong>
              Unidades operacionais de engenharia pesada responsáveis pela rede troncal de transporte (220kV e 400kV), despacho em tempo real do sistema elétrico nacional (SCADA/CND), e ensaios de protecções de alta tensão.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUnits
              .filter(u => u.category === 'Divisões')
              .map(unit => {
                const initials = unit.directorName
                  .split(' ')
                  .filter(n => n.length > 2)
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('');

                return (
                  <div
                    key={unit.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all p-6 shadow-xs flex flex-col justify-between space-y-4 group text-center"
                  >
                    <div className="space-y-3">
                      {/* Avatar Photo or Monogram Styled (Matches Celso Clinketh Coelho in Screenshot 3) */}
                      {unit.photoUrl ? (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md mx-auto group-hover:scale-105 transition-transform border-2 border-emerald-300 bg-slate-900">
                          <img
                            src={unit.photoUrl}
                            alt={unit.directorName}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-emerald-300 flex flex-col items-center justify-center font-black text-xl mx-auto shadow-md border-2 border-emerald-100 group-hover:scale-105 transition-transform">
                          <span>{initials}</span>
                          <span className="text-[9px] uppercase font-bold text-emerald-200 mt-0.5 tracking-wider">{unit.code}</span>
                        </div>
                      )}

                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-heading">
                          {unit.directorName}
                        </h4>
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">
                          {unit.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{unit.directorTitle}</p>
                      </div>

                      <p className="text-xs text-slate-600 text-left bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                        {unit.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {unit.location}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          Operação & Manutenção de Redes
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 truncate">{unit.contactEmail}</span>
                      <button
                        onClick={() => handleFilterProjectsByUnit(unit)}
                        className="text-xs font-bold text-emerald-700 hover:underline shrink-0"
                      >
                        Projectos →
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* 5. VIEW: CENTROS DE NEGÓCIO & CENTROS DE SUPORTE & TODAS */}
      {/* ========================================================================= */}
      {(activeCategory === 'Centros de Suporte' ||
        activeCategory === 'Centros de Negócio' ||
        activeCategory === 'Todas') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {filteredUnits.map(unit => {
            const projectCount = getUnitProjectCount(unit.code, unit.name);

            return (
              <div
                key={unit.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-[#F7942D]/50 hover:shadow-lg transition-all p-6 shadow-xs flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top line: Code and Category */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm font-mono shadow-xs group-hover:bg-[#F7942D] transition-colors">
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
                    {unit.pelouro && (
                      <p className="text-[11px] font-semibold text-[#c26508] mt-0.5">
                        {unit.pelouro}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {unit.description}
                    </p>
                  </div>

                  {/* Director & Leadership Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F7942D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
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
                      <span>Âmbito Operacional:</span>
                      <strong className="text-slate-900 font-medium">
                        Direcção & Fiscalização Técnica
                      </strong>
                    </div>
                  </div>

                  {/* Metadata strip */}
                  <div className="space-y-1.5 text-xs text-slate-500">
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#c26508] hover:text-orange-700 hover:underline shrink-0 cursor-pointer"
                  >
                    Ver Carteira →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. VIEW: DELEGAÇÕES DE COMPETÊNCIA */}
      {/* ========================================================================= */}
      {activeCategory === 'Delegações de Competência' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex items-start gap-3.5">
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
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
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

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
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
      )}

      {/* ========================================================================= */}
      {/* 7. "OUTRAS CATEGORIAS" OFFICIAL EDM FOOTER BAR (Present in Screenshots 1, 2, 3) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-[#e07d19] via-[#f7942d] to-[#ffa343] p-8 text-white shadow-lg space-y-5 text-center">
        <div>
          <h3 className="text-xl md:text-2xl font-black font-heading tracking-tight drop-shadow-xs">
            Outras Categorias
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Navegue pelas diferentes instâncias e unidades funcionais da Electricidade de Moçambique, E.P.
          </p>
        </div>

        {/* Dark Pill Buttons matching official EDM portal */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
          {[
            'Conselho de Administração',
            'Centros de Suporte',
            'Centros de Negócio',
            'Área de Serviço ao Cliente',
            'Divisões',
          ].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-slate-900 ring-2 ring-slate-950 font-black'
                  : 'bg-black/90 hover:bg-black text-white hover:scale-105'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. MODAL: REGISTAR NOVA DELEGAÇÃO DE PODERES */}
      {/* ========================================================================= */}
      {showAddDelegationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateDelegation}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-slate-800 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Delegação de Competências
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F7942D] hover:bg-orange-600 text-white shadow-sm transition cursor-pointer"
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
