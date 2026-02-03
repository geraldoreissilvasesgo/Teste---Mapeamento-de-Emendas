
import React, { useState, useMemo } from 'react';
import { Amendment, Status, AmendmentType } from '../types.ts';
import { 
  Search, Download, Database, ChevronLeft, ChevronRight, Filter, 
  Layers, ArrowUpRight, Clock, Building2, Tag, FileText, Printer, 
  User, X, DollarSign, MapPin, Loader2, Landmark, ShieldCheck, Map as MapIcon,
  BarChart3, PieChart, Users, LayoutGrid, ChevronDown, RotateCcw
} from 'lucide-react';

interface RepositoryModuleProps {
  amendments: Amendment[];
}

const ITEMS_PER_PAGE = 20;
type GroupByOption = 'none' | 'type' | 'deputyName' | 'municipality';

export const RepositoryModule: React.FC<RepositoryModuleProps> = ({ amendments }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deputyFilter, setDeputyFilter] = useState<string>('all');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  // Extração dinâmica de opções baseada nos dados reais (Robustez)
  const dynamicDeputies = useMemo(() => {
    const names = amendments.map(a => a.deputyName).filter(Boolean) as string[];
    return Array.from(new Set(names)).sort();
  }, [amendments]);

  const dynamicCities = useMemo(() => {
    const cities = amendments.map(a => a.municipality).filter(Boolean) as string[];
    return Array.from(new Set(cities)).sort();
  }, [amendments]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesDeputy = deputyFilter === 'all' || item.deputyName === deputyFilter;
      const matchesMunicipality = municipalityFilter === 'all' || item.municipality === municipalityFilter;
      
      const val = item.value || 0;
      const min = minValue ? parseFloat(minValue) : -Infinity;
      const max = maxValue ? parseFloat(maxValue) : Infinity;
      const matchesValue = val >= min && val <= max;
      
      const matchesSearch = !term || 
        item.seiNumber?.toLowerCase().includes(term) || 
        item.object?.toLowerCase().includes(term) || 
        item.municipality?.toLowerCase().includes(term);

      return matchesType && matchesDeputy && matchesMunicipality && matchesValue && matchesSearch;
    });
  }, [amendments, searchTerm, typeFilter, deputyFilter, municipalityFilter, minValue, maxValue]);

  const totalFilteredValue = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [filteredData]);

  const groupedData = useMemo(() => {
    if (groupBy === 'none') return [];
    const groups: Record<string, { count: number; value: number }> = {};
    filteredData.forEach(item => {
        const key = (item[groupBy as keyof Amendment] as string) || 'Não especificado';
        if (!groups[key]) groups[key] = { count: 0, value: 0 };
        groups[key].count++;
        groups[key].value += item.value;
    });
    return Object.entries(groups).map(([name, stats]) => ({ name, ...stats })).sort((a, b) => b.value - a.value);
  }, [filteredData, groupBy]);

  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDeputyFilter('all');
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
    const element = document.getElementById('repository-table-content');
    
    const opt = {
      margin: 10,
      filename: `Repositorio_GESA_${new Date().toISOString().split('T')[0]}.pdf`,
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
      setIsGeneratingPdf(false);
    }
  };

  const getGroupIcon = () => {
    switch (groupBy) {
      case 'type': return <Landmark size={20} className="text-blue-500" />;
      case 'deputyName': return <Users size={20} className="text-purple-500" />;
      case 'municipality': return <MapIcon size={20} className="text-emerald-500" />;
      default: return <LayoutGrid size={20} />;
    }
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
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                Relatório (PDF)
            </button>
        </div>
      </div>

      <div className="bg-white p-6 lg:p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6 no-print">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                  type="text" 
                  value={searchTerm}
                  placeholder="Pesquisar por SEI, Objeto ou Município..."
                  className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 uppercase text-xs focus:ring-4 ring-blue-500/5 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="w-full lg:w-72 relative">
              <select 
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                className="w-full pl-6 pr-10 py-4 bg-[#0d457a] text-white rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest shadow-lg appearance-none cursor-pointer"
              >
                <option value="none">NÃO AGRUPAR SALDOS</option>
                <option value="type">POR TIPO DE EMENDA</option>
                <option value="deputyName">POR PARLAMENTAR</option>
                <option value="municipality">POR MUNICÍPIO</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <select value={deputyFilter} onChange={(e) => setDeputyFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-[10px] font-black text-slate-600 uppercase appearance-none outline-none focus:ring-2 ring-[#0d457a]">
                  <option value="all">TODOS OS PARLAMENTARES</option>
                  {dynamicDeputies.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
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

        <div className="flex justify-between items-center px-2 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
           <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Encontrados</span>
                <span className="text-xs font-black text-[#0d457a]">{filteredData.length} Processos</span>
              </div>
              <div className="w-px h-8 bg-blue-100" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Soma Alocada</span>
                <span className="text-xs font-black text-[#0d457a]">{formatBRL(totalFilteredValue)}</span>
              </div>
           </div>
           {filteredData.length > 0 && (
             <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] animate-pulse">Base Sincronizada</span>
           )}
        </div>
      </div>

      {groupBy !== 'none' && groupedData.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 ml-2">
            <div className="p-2 bg-blue-50 text-[#0d457a] rounded-lg">
              {getGroupIcon()}
            </div>
            <h3 className="text-[10px] font-black text-[#0d457a] uppercase tracking-[0.2em]">
              Consolidação por {groupBy === 'type' ? 'Origem' : groupBy === 'deputyName' ? 'Parlamentar' : 'Município'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedData.map((group, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                  {getGroupIcon()}
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80%]">
                      {group.name}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-[#0d457a] text-[8px] font-black rounded-full border border-slate-100">
                      {group.count}
                    </span>
                  </div>
                  <p className="text-xl font-black text-[#0d457a] tracking-tighter">
                    {formatBRL(group.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="repository-table-content" className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden print:block p-12 border-b-8 border-[#0d457a] bg-white">
            <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">ESTADO DE GOIÁS</h1>
                    <div className="space-y-1">
                      <p className="text-[12px] font-black text-slate-700 uppercase leading-tight max-w-2xl">
                        SES/SUBIPEI-21286 - GERÊNCIA DE SUPORTE ADMINISTRATIVO
                      </p>
                    </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-black text-[#0d457a] uppercase tracking-widest">REPOSITÓRIO DE EMENDAS</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Data da Extração: {new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>
            <div className="flex gap-10 border-t border-slate-100 pt-6">
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Total Geral</p>
                   <p className="text-lg font-black text-[#0d457a]">{formatBRL(totalFilteredValue)}</p>
                </div>
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Processos</p>
                   <p className="text-lg font-black text-[#0d457a]">{filteredData.length}</p>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Processo SEI</th>
                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Município</th>
                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Parlamentar</th>
                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Valor</th>
                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {paginatedData.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all pdf-avoid-break">
                            <td className="px-8 py-6">
                                <div className="text-[11px] font-black text-[#0d457a] uppercase mb-1">{item.seiNumber}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[320px]">{item.object}</div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-2">
                                  <MapPin size={12} className="text-emerald-500" /> {item.municipality}
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="text-[10px] font-black text-slate-600 uppercase">{item.deputyName}</div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="text-[11px] font-black text-[#0d457a]">{formatBRL(item.value)}</div>
                            </td>
                            <td className="px-8 py-6 text-center">
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-xl border border-blue-100 whitespace-nowrap shadow-sm">
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Database size={48} className="mx-auto text-slate-100 mb-4" />
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum processo localizado com os filtros aplicados</p>
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

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
