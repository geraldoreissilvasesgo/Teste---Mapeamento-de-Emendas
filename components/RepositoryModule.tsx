
/**
 * MÓDULO DE REPOSITÓRIO GERAL - RESPONSIVO
 */
import React, { useState, useMemo } from 'react';
import { Amendment, Status, AmendmentType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Search, Download, Database, ChevronLeft, ChevronRight, Filter, 
  Layers, ArrowUpRight, Clock, Building2, Tag, FileText, Printer, 
  User, X, DollarSign, MapPin, Loader2, Landmark
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

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesDeputy = deputyFilter === 'all' || item.deputyName === deputyFilter;
      const matchesMunicipality = municipalityFilter === 'all' || item.municipality === municipalityFilter;
      const val = item.value;
      const min = minValue ? parseFloat(minValue) : -Infinity;
      const max = maxValue ? parseFloat(maxValue) : Infinity;
      const matchesValue = val >= min && val <= max;
      const matchesSearch = !term || item.seiNumber?.toLowerCase().includes(term) || item.object?.toLowerCase().includes(term) || item.municipality?.toLowerCase().includes(term);
      return matchesType && matchesDeputy && matchesMunicipality && matchesValue && matchesSearch;
    });
  }, [amendments, searchTerm, typeFilter, deputyFilter, municipalityFilter, minValue, maxValue]);

  const groupedData = useMemo(() => {
    if (groupBy === 'none') return [];
    const groups: Record<string, { count: number; value: number }> = {};
    filteredData.forEach(item => {
        const key = item[groupBy as keyof Amendment] as string || 'Não especificado';
        if (!groups[key]) groups[key] = { count: 0, value: 0 };
        groups[key].count++;
        groups[key].value += item.value;
    });
    return Object.entries(groups).map(([name, stats]) => ({ name, ...stats })).sort((a, b) => b.value - a.value);
  }, [filteredData, groupBy]);

  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Repositório Central</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">SES/SUBIPEI - SES/SUBIPEI-21286</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => {}} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-500 border border-slate-200 px-4 py-3 rounded-xl text-[10px] font-black uppercase">
                <FileText size={16} /> CSV
            </button>
            <button onClick={() => setIsGeneratingPdf(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0d457a] text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg">
                <Printer size={16} /> PDF
            </button>
        </div>
      </div>

      <div className="bg-white p-6 lg:p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6 no-print">
        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text"
                value={searchTerm}
                placeholder="Pesquisar..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 uppercase text-xs"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select value={deputyFilter} onChange={(e) => setDeputyFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black text-slate-600 uppercase appearance-none">
                <option value="all">TODOS OS AUTORES</option>
                {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={municipalityFilter} onChange={(e) => setMunicipalityFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black text-slate-600 uppercase appearance-none">
                <option value="all">TODOS OS MUNICÍPIOS</option>
                {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} placeholder="VALOR MÍN." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black text-slate-600 uppercase outline-none" />
            <input type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} placeholder="VALOR MÁX." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black text-slate-600 uppercase outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        {groupBy === 'none' ? (
            <div className="overflow-x-auto scrollbar-hide">
                <div className="min-w-[800px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Processo</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Localidade</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-black text-[#0d457a] uppercase">{item.seiNumber}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[150px]">{item.object}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-black text-slate-600 uppercase">{item.municipality}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-[10px] font-black text-[#0d457a]">{formatBRL(item.value)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-100">{item.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Visual indicator for horizontal scroll on mobile */}
                <div className="lg:hidden p-2 bg-slate-50 text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    Arraste para o lado para ver mais →
                </div>
            </div>
        ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedData.map((group, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{group.name}</h4>
                         <div className="flex justify-between items-end">
                            <p className="text-xl font-black text-[#0d457a] tracking-tight">{formatBRL(group.value)}</p>
                            <span className="text-[9px] font-black text-blue-600">{group.count} Proc.</span>
                         </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 no-print">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 bg-white border border-slate-200 rounded-lg text-[#0d457a]"><ChevronLeft size={20} /></button>
            <span className="text-[9px] font-black text-[#0d457a] uppercase tracking-widest px-4">Pag {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 bg-white border border-slate-200 rounded-lg text-[#0d457a]"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};
