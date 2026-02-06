import React, { useState, useMemo } from 'react';
import { Amendment, Status, AmendmentType } from '../types.ts';
import { 
  Search, Download, Database, ChevronLeft, ChevronRight, Filter, 
  Layers, ArrowUpRight, Clock, Building2, Tag, FileText, Printer, 
  User, X, DollarSign, MapPin, Loader2, Landmark, ShieldCheck, Map as MapIcon,
  BarChart3, PieChart, Users, LayoutGrid, ChevronDown, RotateCcw, MapPinIcon,
  TrendingUp, Calculator, List, Briefcase
} from 'lucide-react';

interface RepositoryModuleProps {
  amendments: Amendment[];
}

const ITEMS_PER_PAGE = 20;
type GroupByOption = 'none' | 'type' | 'deputyName' | 'municipality';

export const RepositoryModule: React.FC<RepositoryModuleProps> = ({ amendments }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [parlamentarSearch, setParlamentarSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  const dynamicCities = useMemo(() => {
    const cities = amendments.map(a => a.municipality).filter(Boolean) as string[];
    return Array.from(new Set(cities)).sort();
  }, [amendments]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const pSearch = parlamentarSearch.toLowerCase();
    
    return amendments.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesMunicipality = municipalityFilter === 'all' || item.municipality === municipalityFilter;
      
      const val = item.value || 0;
      const min = minValue ? parseFloat(minValue) : -Infinity;
      const max = maxValue ? parseFloat(maxValue) : Infinity;
      const matchesValue = val >= min && val <= max;
      
      const matchesSearch = !term || 
        item.seiNumber?.toLowerCase().includes(term) || 
        item.object?.toLowerCase().includes(term);

      const matchesParlamentar = !pSearch || 
        item.deputyName?.toLowerCase().includes(pSearch);

      return matchesType && matchesMunicipality && matchesValue && matchesSearch && matchesParlamentar;
    });
  }, [amendments, searchTerm, parlamentarSearch, typeFilter, municipalityFilter, minValue, maxValue]);

  // Lógica de Agrupamento de Saldos
  const groupedBalances = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: Record<string, { count: number, total: number }> = {};
    
    filteredData.forEach(item => {
      const key = (item[groupBy as keyof Amendment] as string) || 'Não Informado';
      if (!groups[key]) groups[key] = { count: 0, total: 0 };
      groups[key].count += 1;
      groups[key].total += Number(item.value || 0);
    });

    return Object.entries(groups)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredData, groupBy]);

  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleResetFilters = () => {
    setSearchTerm('');
    setParlamentarSearch('');
    setTypeFilter('all');
    setMunicipalityFilter('all');
    setMinValue('');
    setMaxValue('');
    setGroupBy('none');
    setCurrentPage(1);
  };

  const handleExportPdf = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      alert("Motor de PDF em carregamento.");
      return;
    }

    setIsGeneratingPdf(true);
    const printHeader = document.getElementById('repository-institutional-header');
    if (printHeader) printHeader.classList.remove('hidden');

    const element = document.getElementById('repository-print-container');
    
    const opt = {
      margin: 8,
      filename: `Relatorio_Estruturado_GESA_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await h2p().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      if (printHeader) printHeader.classList.add('hidden');
      setIsGeneratingPdf(false);
    }
  };

  const getSlaData = (item: Amendment) => {
    if (!item.movements || item.movements.length === 0) return { entry: '-', days: '-' };
    const lastMov = item.movements[item.movements.length - 1];
    const dateIn = new Date(lastMov.dateIn);
    const diff = Math.ceil((new Date().getTime() - dateIn.getTime()) / (1000 * 60 * 60 * 24));
    return {
      entry: dateIn.toLocaleDateString('pt-BR'),
      days: lastMov.dateOut ? lastMov.daysSpent : diff
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Repositório Central</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Database size={14} className="text-blue-500" /> Consulta Dinâmica de Processos GESA
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleResetFilters}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-red-500 border border-red-100 px-5 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-red-50 transition-all shadow-sm"
            >
                <RotateCcw size={16} /> Limpar Filtros
            </button>
            <button 
                onClick={handleExportPdf}
                disabled={isGeneratingPdf || filteredData.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-[#0d457a] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-[#0a365f] transition-all disabled:opacity-50"
            >
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Exportar Consulta
            </button>
        </div>
      </div>

      {/* FILTROS E AGRUPAMENTOS */}
      <div className="bg-white p-6 lg:p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6 no-print">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                  type="text" 
                  value={searchTerm}
                  placeholder="Pesquisar por SEI ou Objeto do processo..."
                  className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 uppercase text-xs focus:ring-4 ring-blue-500/5 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

          <div className="w-full lg:w-72">
            <div className="relative">
              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as GroupByOption)} 
                className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black text-[#0d457a] uppercase appearance-none outline-none focus:border-[#0d457a] transition-all"
              >
                  <option value="none">Lista Simples (Sem Agrupamento)</option>
                  <option value="type">Agrupar Saldos por Tipo</option>
                  <option value="deputyName">Agrupar Saldos por Parlamentar</option>
                  <option value="municipality">Agrupar Saldos por Município</option>
              </select>
              <Calculator size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-[10px] font-black text-slate-600 uppercase appearance-none outline-none focus:ring-2 ring-[#0d457a]">
                  <option value="all">TODOS OS TIPOS</option>
                  {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>

            <div className="relative">
              <input 
                  type="text" 
                  value={parlamentarSearch}
                  placeholder="BUSCAR PARLAMENTAR..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-[10px] font-black text-slate-600 uppercase outline-none focus:ring-2 ring-[#0d457a]"
                  onChange={(e) => setParlamentarSearch(e.target.value)}
              />
              <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>

            <div className="relative">
              <select value={municipalityFilter} onChange={(e) => setMunicipalityFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-[10px] font-black text-slate-600 uppercase appearance-none outline-none focus:ring-2 ring-[#0d457a]">
                  <option value="all">TODOS OS MUNICÍPIOS</option>
                  {dynamicCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>

            <div className="relative">
              <input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} placeholder="VALOR MÍNIMO" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-[10px] font-black text-slate-600 uppercase outline-none focus:ring-2 ring-[#0d457a]" />
              <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>

            <div className="relative">
              <input type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} placeholder="VALOR MÁXIMO" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-[10px] font-black text-slate-600 uppercase outline-none focus:ring-2 ring-[#0d457a]" />
              <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
        </div>
      </div>

      {/* PAINEL DE SALDOS AGRUPADOS (VISÍVEL SE HOUVER AGRUPAMENTO) */}
      {groupedBalances && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 no-print animate-in slide-in-from-top-4 duration-500">
           {groupedBalances.map((g, i) => (
             <div key={i} className="bg-white p-6 rounded-[32px] border-2 border-emerald-50 shadow-lg shadow-emerald-900/5 relative overflow-hidden group hover:border-emerald-200 transition-all">
                <div className="absolute -right-4 -bottom-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={100} />
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate pr-8">{g.name}</p>
                <h4 className="text-lg font-black text-[#0d457a] tracking-tight mb-3">{formatBRL(g.total)}</h4>
                <div className="flex items-center gap-2">
                   <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">
                      {g.count} Processos
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* CONTAINER DE IMPRESSÃO */}
      <div id="repository-print-container" className="bg-white rounded-[48px] shadow-sm border border-slate-200 overflow-hidden print:rounded-none print:border-none">
        
        {/* CABEÇALHO INSTITUCIONAL */}
        <div id="repository-institutional-header" className="p-12 pb-8 text-center space-y-3 hidden print:block">
          <div className="space-y-1 mb-8">
            <h4 className="text-[11px] font-black text-[#0d457a] uppercase leading-tight tracking-tight">
              SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA - SES/SUBIPEI-21286
            </h4>
            <h5 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest opacity-80">
              GERÊNCIA DE SUPORTE ADMINISTRATIVO
            </h5>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">CONSULTA ESTRUTURADA DE DADOS</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
              DOSSIÊ DE REPOSITÓRIO - GERADO EM: {new Date().toLocaleDateString('pt-BR')} ÀS {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>

        {/* TABELA ESTRUTURADA */}
        <div className="px-8 pb-12 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-y-2 border-[#0d457a]/20">
              <tr>
                <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">PROCESSO / ANO</th>
                <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">AUTOR & MUNICÍPIO</th>
                <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">OBJETO</th>
                <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">VALOR</th>
                <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">LOCALIZAÇÃO</th>
                <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">ENTRADA SETOR</th>
                <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">PERMANÊNCIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map(item => {
                const sla = getSlaData(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all pdf-avoid-break">
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#0d457a] uppercase leading-none mb-1">{item.seiNumber}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{item.year} • {item.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#0d457a] uppercase leading-none truncate max-w-[120px]">{item.deputyName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin size={10} className="shrink-0" />
                          <span className="text-[8px] font-black uppercase tracking-tight">{item.municipality}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed max-w-[200px] line-clamp-2">
                        {item.object}
                      </p>
                    </td>
                    <td className="px-4 py-6">
                      <p className="text-[11px] font-black text-[#0d457a] whitespace-nowrap">
                        {formatBRL(item.value)}
                      </p>
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-[#0d457a] uppercase truncate max-w-[100px]">
                          {item.currentSector || 'GESA'}
                        </span>
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[100px]">
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center">
                       <span className="text-[10px] font-black text-slate-600 uppercase">{sla.entry}</span>
                    </td>
                    <td className="px-4 py-6 text-center">
                       <div className={`inline-flex items-center justify-center w-fit px-3 h-8 rounded-full font-black text-[10px] ${
                          Number(sla.days) > 10 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                       }`}>
                          {sla.days} Dias
                       </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <Database size={48} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum processo localizado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ DO DOSSIÊ */}
        <div className="hidden print:block p-12 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            GERÊNCIA DE SUPORTE ADMINISTRATIVO • GESA / SUBIPEI
          </p>
        </div>
      </div>

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 no-print pb-10">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30"
            >
                <ChevronLeft size={20} />
            </button>
            <div className="px-8 py-4 bg-[#0d457a] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                Página {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}
    </div>
  );
};