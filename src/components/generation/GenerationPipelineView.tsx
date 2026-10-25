import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GenerationPlant, GenerationStatus, GenerationSource } from '../../types';
import {
  Zap,
  Flame,
  Droplets,
  Search,
  Filter,
  Download,
  MapPin,
  Building2,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Compass,
  FileSpreadsheet,
  X,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const GenerationPipelineView: React.FC = () => {
  const { generationPlants } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedProvince, setSelectedProvince] = useState<string>('Todas');
  const [selectedSource, setSelectedSource] = useState<string>('Todas');
  const [selectedPlant, setSelectedPlant] = useState<GenerationPlant | null>(null);

  // Status Colors & Badges
  const getStatusBadge = (status: GenerationStatus) => {
    switch (status) {
      case 'Em operação':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Em Operação',
        };
      case 'Em construção':
      case 'Em Implementacao (Primeira fase 150 MW)' as any:
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Em Construção',
        };
      case 'Em estudos de viabilidade':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Estudos Viabilidade',
        };
      case 'Carteira de Projecto':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          label: 'Carteira de Projecto',
        };
      case 'Na fase Conceptual':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          label: 'Fase Conceptual',
        };
      case 'Em Desenvolvimento':
        return {
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          dot: 'bg-cyan-500',
          label: 'Em Desenvolvimento',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const getSourceIcon = (source: GenerationSource) => {
    switch (source) {
      case 'Hídrica':
        return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
      case 'Térmica a Gás':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'Dual Fuel / HFO':
        return <Activity className="w-3.5 h-3.5 text-amber-500" />;
      case 'FSRU / Gás':
        return <Zap className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  // Provinces list
  const provinces = useMemo(() => {
    const list = Array.from(new Set(generationPlants.map(p => p.province))).sort();
    return ['Todas', ...list];
  }, [generationPlants]);

  // Filtered plants
  const filteredPlants = useMemo(() => {
    return generationPlants.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.partner && p.partner.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        selectedStatus === 'Todos' || p.status.toLowerCase().includes(selectedStatus.toLowerCase());

      const matchesProvince =
        selectedProvince === 'Todas' || p.province.toLowerCase() === selectedProvince.toLowerCase();

      const matchesSource =
        selectedSource === 'Todas' || p.sourceType === selectedSource;

      return matchesSearch && matchesStatus && matchesProvince && matchesSource;
    });
  }, [generationPlants, searchQuery, selectedStatus, selectedProvince, selectedSource]);

  // Aggregate Metrics
  const totalCapacityMW = useMemo(
    () => generationPlants.reduce((acc, p) => acc + p.capacityMW, 0),
    [generationPlants]
  );

  const filteredCapacityMW = useMemo(
    () => filteredPlants.reduce((acc, p) => acc + p.capacityMW, 0),
    [filteredPlants]
  );

  const operatingCapacityMW = useMemo(
    () =>
      generationPlants
        .filter(p => p.status.toLowerCase().includes('operação'))
        .reduce((acc, p) => acc + p.capacityMW, 0),
    [generationPlants]
  );

  const constructionCapacityMW = useMemo(
    () =>
      generationPlants
        .filter(p => p.status.toLowerCase().includes('constru') || p.status.toLowerCase().includes('implementa'))
        .reduce((acc, p) => acc + p.capacityMW, 0),
    [generationPlants]
  );

  const viabilityCapacityMW = useMemo(
    () =>
      generationPlants
        .filter(p => p.status.toLowerCase().includes('viabilidade') || p.status.toLowerCase().includes('desenvolvimento'))
        .reduce((acc, p) => acc + p.capacityMW, 0),
    [generationPlants]
  );

  const pipelineCapacityMW = useMemo(
    () =>
      generationPlants
        .filter(p => p.status.toLowerCase().includes('carteira') || p.status.toLowerCase().includes('conceptual'))
        .reduce((acc, p) => acc + p.capacityMW, 0),
    [generationPlants]
  );

  // Chart: MW by Province
  const mwByProvinceData = useMemo(() => {
    const map: Record<string, number> = {};
    generationPlants.forEach(p => {
      const prov = p.province.replace('Província de ', '').replace('Cidade de ', '');
      map[prov] = (map[prov] || 0) + p.capacityMW;
    });
    return Object.entries(map)
      .map(([name, mw]) => ({ name, mw }))
      .sort((a, b) => b.mw - a.mw);
  }, [generationPlants]);

  // Chart: MW by Status
  const mwByStatusData = useMemo(() => {
    return [
      { name: 'Em Operação', mw: operatingCapacityMW, color: '#10B981' },
      { name: 'Em Construção', mw: constructionCapacityMW, color: '#3B82F6' },
      { name: 'Estudos Viabilidade', mw: viabilityCapacityMW, color: '#F59E0B' },
      { name: 'Carteira / Conceptual', mw: pipelineCapacityMW, color: '#8B5CF6' },
    ];
  }, [operatingCapacityMW, constructionCapacityMW, viabilityCapacityMW, pipelineCapacityMW]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Item', 'Nome da Central', 'Localizacao', 'Provincia', 'Capacidade_MW', 'Estado', 'Fonte', 'Parceiro', 'Notas'];
    const rows = filteredPlants.map(p => [
      p.id,
      p.item,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.location.replace(/"/g, '""')}"`,
      `"${p.province.replace(/"/g, '""')}"`,
      p.capacityMW,
      `"${p.status}"`,
      `"${p.sourceType}"`,
      `"${(p.partner || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EDM_Pipeline_Centrais_2026_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Executive Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#102A43] text-white p-6 sm:p-8 shadow-xl border border-slate-700">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#F7942D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              EDM • Matriz Estratégica de Centrais 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Pipeline de Geração & Centrais Eléctricas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitorização da capacidade instalada e planeada de geração em <strong>Megawatts (MW)</strong> para garantir a segurança energética nacional e exportação na África Austral (SAPP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold backdrop-blur-xs transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Exportar Matriz CSV
            </button>
          </div>
        </div>

        {/* Executive KPI Cards in Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Potência Total Pipeline
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {totalCapacityMW.toLocaleString('pt-PT')} <span className="text-xs font-normal text-orange-400">MW</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">27 Centrais Mapeadas</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
              Em Operação
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
              {operatingCapacityMW.toLocaleString('pt-PT')} <span className="text-xs font-normal text-emerald-300">MW</span>
            </div>
            <span className="text-[10px] text-emerald-200/70 block mt-0.5">
              {((operatingCapacityMW / totalCapacityMW) * 100).toFixed(1)}% do total
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">
              Em Construção
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-400 mt-1">
              {constructionCapacityMW.toLocaleString('pt-PT')} <span className="text-xs font-normal text-blue-300">MW</span>
            </div>
            <span className="text-[10px] text-blue-200/70 block mt-0.5">Temane CTT & Vulcan</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">
              Estudos de Viabilidade
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">
              {viabilityCapacityMW.toLocaleString('pt-PT')} <span className="text-xs font-normal text-amber-300">MW</span>
            </div>
            <span className="text-[10px] text-amber-200/70 block mt-0.5">Beluluane, Pavua, etc.</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-xs col-span-2 lg:col-span-1">
            <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
              Carteira & Conceptual
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-300 mt-1">
              {pipelineCapacityMW.toLocaleString('pt-PT')} <span className="text-xs font-normal text-purple-200">MW</span>
            </div>
            <span className="text-[10px] text-purple-200/70 block mt-0.5">ExxonMobil, Dondo, etc.</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: MW by Province */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Distribuição de Potência (MW) por Província
              </h3>
              <p className="text-xs text-slate-500">
                Capacidade acumulada em cada província considerando todas as centrais
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#c26508] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              {mwByProvinceData.length} Províncias
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mwByProvinceData} margin={{ top: 10, right: 15, left: 15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `${v} MW`} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString('pt-PT')} MW`, 'Capacidade']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="mw" fill="#F7942D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: MW by Maturity Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading mb-1">
              Maturidade dos Projectos (MW)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Proporção da capacidade energética por estado de desenvolvimento
            </p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mwByStatusData}
                    dataKey="mw"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {mwByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString('pt-PT')} MW`, 'Capacidade']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px]">
            {mwByStatusData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <strong className="text-slate-900 ml-auto font-mono">{((item.mw / totalCapacityMW) * 100).toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por central, localidade, província ou parceiro (ex: Temane, Beluluane, CTM)..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#F7942D]/30 focus:border-[#F7942D] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="text-xs bg-transparent border-none text-slate-700 font-medium focus:ring-0 cursor-pointer"
              >
                <option value="Todos">Todos os Estados</option>
                <option value="operação">Em Operação</option>
                <option value="constru">Em Construção</option>
                <option value="viabilidade">Estudos Viabilidade</option>
                <option value="carteira">Carteira de Projecto</option>
                <option value="conceptual">Fase Conceptual</option>
              </select>
            </div>

            {/* Province Filter */}
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className="text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium focus:ring-1 focus:ring-[#F7942D] cursor-pointer"
            >
              {provinces.map(prov => (
                <option key={prov} value={prov}>
                  {prov === 'Todas' ? 'Todas as Províncias' : prov}
                </option>
              ))}
            </select>

            {/* Source Type Filter */}
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium focus:ring-1 focus:ring-[#F7942D] cursor-pointer"
            >
              <option value="Todas">Todas as Fontes</option>
              <option value="Térmica a Gás">Térmica a Gás</option>
              <option value="Hídrica">Hídrica</option>
              <option value="Dual Fuel / HFO">Dual Fuel / HFO</option>
              <option value="FSRU / Gás">FSRU / Gás</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            A apresentar <strong>{filteredPlants.length}</strong> de {generationPlants.length} centrais
          </div>
          <div className="font-semibold text-slate-800">
            Capacidade Filtrada: <span className="font-mono text-[#c26508]">{filteredCapacityMW.toLocaleString('pt-PT')} MW</span>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[720px] lg:min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 hidden sm:table-cell">Item</th>
                <th className="py-3.5 px-4 min-w-[200px]">Central de Geração</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Localização</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Fonte</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Capacidade (MW)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Estado do Projecto</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Parceiro / Operador</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Acção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlants.map(plant => {
                const badge = getStatusBadge(plant.status);
                const percentOfMax = Math.min(100, Math.round((plant.capacityMW / 3000) * 100));

                return (
                  <tr
                    key={plant.id}
                    onClick={() => setSelectedPlant(plant)}
                    className="hover:bg-orange-50/40 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400 group-hover:text-slate-700 hidden sm:table-cell">
                      #{plant.item}
                    </td>

                    <td className="py-3.5 px-4 min-w-[220px]" title={plant.notes || undefined}>
                      <div className="font-bold text-slate-900 group-hover:text-[#c26508] transition leading-snug">
                        {plant.name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-[#F7942D]" />
                        {plant.location}
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4">{plant.province}</div>
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <div className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        {getSourceIcon(plant.sourceType)}
                        <span>{plant.sourceType}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-extrabold text-sm text-slate-900">
                        {plant.capacityMW.toLocaleString('pt-PT')} <span className="text-[10px] font-normal text-slate-400">MW</span>
                      </div>
                      <div className="w-20 ml-auto bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#F7942D] h-full rounded-full"
                          style={{ width: `${Math.max(8, percentOfMax)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="text-slate-700 font-medium truncate max-w-xs">
                        {plant.partner || 'EDM'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedPlant(plant);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#c26508] hover:bg-orange-100/60 transition"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plant Detail Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-orange-400">
                  <span>CENTRAL #{selectedPlant.item}</span>
                  <span>•</span>
                  <span>{selectedPlant.sourceType}</span>
                </div>
                <h3 className="text-xl font-bold font-heading">{selectedPlant.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {selectedPlant.location} ({selectedPlant.province})
                </p>
              </div>

              <button
                onClick={() => setSelectedPlant(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                    Capacidade de Geração
                  </span>
                  <div className="text-2xl font-black font-mono text-[#c26508] mt-1">
                    {selectedPlant.capacityMW.toLocaleString('pt-PT')} <span className="text-xs">MW</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Estado de Desenvolvimento
                  </span>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        getStatusBadge(selectedPlant.status).bg
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${getStatusBadge(selectedPlant.status).dot}`} />
                      {selectedPlant.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Parceiros e Operadores
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {selectedPlant.partner || 'Electricidade de Moçambique, E.P.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Descrição e Âmbito Estratégico
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedPlant.notes || 'Projecto de geração energética inserido na carteira estratégica de desenvolvimento da EDM 2026.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPlant(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
