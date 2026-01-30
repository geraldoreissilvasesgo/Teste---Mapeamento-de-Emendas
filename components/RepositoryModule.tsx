
/**
 * MÓDULO DE REPOSITÓRIO GERAL
 * 
 * Este componente funciona como um "Data Warehouse" da aplicação, oferecendo
 * uma visão tabular e consolidada de toda a base de dados de processos.
 * Atualizado com suporte a exportação em PDF e identificação SEI aprimorada.
 */
import React, { useState, useMemo } from 'react';
import { Amendment, Status, AmendmentType } from '../types';
import { GOIAS_DEPUTIES } from '../constants';
import { Search, Download, Database, ChevronLeft, ChevronRight, Filter, Layers, PieChart, ArrowUpRight, Clock, Building2, Tag, FileText, Printer, User, X } from 'lucide-react';

interface RepositoryModuleProps {
  amendments: Amendment[];
}

const ITEMS_PER_PAGE = 20;
type GroupByOption = 'none' | 'type' | 'deputyName' | 'municipality';

export const RepositoryModule: React.FC<RepositoryModuleProps> = ({ amendments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deputyFilter, setDeputyFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesDeputy = deputyFilter === 'all' || item.deputyName === deputyFilter;
      const matchesSearch = !term ||
        item.seiNumber?.toLowerCase().includes(term) ||
        item.object?.toLowerCase().includes(term) ||
        item.municipality?.toLowerCase().includes(term) ||
        item.deputyName?.toLowerCase().includes(term);
      
      return matchesType && matchesDeputy && matchesSearch;
    });
  }, [amendments, searchTerm, typeFilter, deputyFilter]);

  const groupedData = useMemo(() => {
    if (groupBy === 'none') return [];
    const groups: Record<string, { count: number; value: number }> = {};

    filteredData.forEach(item => {
        const key = item[groupBy as keyof Amendment] as string || 'Não especificado';
        if (!groups[key]) {
            groups[key] = { count: 0, value: 0 };
        }
        groups[key].count++;
        groups[key].value += item.value;
    });

    return Object.entries(groups)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, groupBy]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDeputyFilter('all');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `repositorio_gesa_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (groupBy === 'none') {
        csvContent += "SEI;Ano;Tipo;Autor;Município;Objeto;Valor;Setor Atual;Status\n";
        filteredData.forEach(row => {
            const line = `${row.seiNumber};${row.year};${row.type};${row.deputyName || ''};${row.municipality};"${row.object.replace(/"/g, '""')}";${row.value};${row.currentSector};${row.status}`;
            csvContent += line + "\n";
        });
    } else {
        filename = `agrupado_por_${groupBy}_${new Date().toISOString().split('T')[0]}.csv`;
        csvContent += `Agrupamento;Qtd. Processos;Valor Total\n`;
        groupedData.forEach(row => {
            const line = `${row.name};${row.count};${row.value}`;
            csvContent += line + "\n";
        });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  const totalFilteredValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  const getStatusBadgeClass = (status: Status) => {
    switch (status) {
      case Status.CONCLUDED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case Status.IN_PROGRESS: return 'bg-blue-50 text-blue-600 border-blue-100';
      case Status.DILIGENCE: return 'bg-amber-50 text-amber-600 border-amber-100';
      case Status.REJECTED: return 'bg-red-50 text-red-600 border-red-100';
      case Status.ARCHIVED: return 'bg-slate-100 text-slate-500 border-slate-200';
      case Status.CONSOLIDATION: return 'bg-purple-50 text-purple-600 border-purple-100';
      case Status.FORWARDING: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print-container">
      {/* Cabeçalho Institucional para Impressão */}
      <div className="print-only print-header">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Relatório Consolidado de Processos</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Gerência de Suporte Administrativo - GESA/SUBIPEI</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Emissão: {new Date().toLocaleDateString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Registros: {filteredData.length}</p>
                <p className="text-[10px] font-bold text-[#0d457a] uppercase">Total: {formatCurrency(totalFilteredValue)}</p>
            </div>
        </div>
      </div>

      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Repositório Geral</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Base de Dados Completa para Consulta e Exportação</p>
        </div>
        <div className="flex gap-3">
          {(searchTerm || typeFilter !== 'all' || deputyFilter !== 'all') && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2.5 rounded-2xl hover:bg-slate-200 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <X size={14} /> Limpar
            </button>
          )}
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg uppercase text-[10px] font-black tracking-widest">
              <Download size={16} /> Exportar CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-[#0d457a] text-white px-5 py-2.5 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest">
              <Printer size={16} /> Exportar PDF
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-4 no-print">
        <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por SEI, Objeto ou Município..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all font-bold text-xs uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#0d457a] outline-none transition-all font-bold text-[10px] uppercase text-[#0d457a]"
            >
                <option value="all">Tipos: Todos</option>
                {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <div className="relative">
             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
                value={deputyFilter} 
                onChange={(e) => setDeputyFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#0d457a] outline-none transition-all font-bold text-[10px] uppercase text-[#0d457a]"
            >
                <option value="all">Parlamentar: Todos</option>
                <option value="Executivo Estadual">Executivo Estadual</option>
                {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>
        <div className="relative">
             <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#0d457a] outline-none transition-all font-bold text-[10px] uppercase text-[#0d457a]"
            >
                <option value="none">Visão Detalhada</option>
                <option value="type">Agrupar por Tipo</option>
                <option value="deputyName">Agrupar por Autor</option>
                <option value="municipality">Agrupar por Município</option>
            </select>
        </div>
      </div>

      {groupBy === 'none' ? (
        <>
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">PROCESSO SEI / Objeto</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Beneficiário / Autor</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo / Ano</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status Atual</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Localização</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {(paginatedData.length > 0 ? paginatedData : []).map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-black text-[#0d457a] text-xs flex items-center gap-1">
                                    <FileText size={10} className="no-print" /> {item.seiNumber}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[180px] mt-1" title={item.object}>{item.object}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-xs font-black text-slate-600 uppercase">{item.municipality}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.deputyName || 'Executivo'}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-[10px] font-black text-slate-500 uppercase">{item.type}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-1">Exercício {item.year}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${getStatusBadgeClass(item.status)}`}>
                                    <Tag size={10} className="no-print" />
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
                                    <Building2 size={12} className="shrink-0 no-print" />
                                    <span className="truncate max-w-[120px]">{item.currentSector}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-[#0d457a]">
                                {formatCurrency(item.value)}
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                       <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-400 italic font-bold uppercase text-xs">Nenhum registro localizado para os filtros atuais.</td>
                       </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8 pb-4 no-print">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-3 bg-white border border-slate-200 rounded-xl text-[#0d457a] hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={20}/>
                </button>
                <div className="px-6 py-2 bg-[#0d457a] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                   Página {currentPage} de {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="p-3 bg-white border border-slate-200 rounded-xl text-[#0d457a] hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronRight size={20}/>
                </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Grupo ({groupBy})</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Total</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Participação</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {groupedData.map((group, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-black text-[#0d457a] uppercase text-xs">{group.name}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{group.count} processos</td>
                          <td className="px-6 py-4 text-xs font-black text-[#0d457a]">{formatCurrency(group.value)}</td>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                      <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{width: `${(group.value / totalFilteredValue) * 100}%`}}></div>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400 w-10">{((group.value / totalFilteredValue) * 100).toFixed(1)}%</span>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      )}
      
      {/* Resumo Financeiro da Base Filtrada (Apenas Impressão) */}
      <div className="print-only mt-8 pt-6 border-t-2 border-[#0d457a]">
         <div className="flex justify-between items-center">
            <span className="text-sm font-black uppercase">Valor Total Consolidado (Filtros Ativos)</span>
            <span className="text-xl font-black text-[#0d457a]">{formatCurrency(totalFilteredValue)}</span>
         </div>
      </div>
    </div>
  );
};
