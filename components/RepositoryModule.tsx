import React, { useState, useMemo } from 'react';
import { Amendment, Status, AmendmentType } from '../types';
import { Search, Download, Database, ChevronLeft, ChevronRight, Filter, Layers, PieChart, ArrowUpRight } from 'lucide-react';

interface RepositoryModuleProps {
  amendments: Amendment[];
}

const ITEMS_PER_PAGE = 20;

type GroupByOption = 'none' | 'type' | 'deputyName' | 'municipality';

export const RepositoryModule: React.FC<RepositoryModuleProps> = ({ amendments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  // 1. Filter Logic
  const filteredData = useMemo(() => {
    return amendments.filter(item => {
      const matchesSearch = 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.deputyName && item.deputyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.object.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [amendments, searchTerm, typeFilter]);

  // 2. Grouping Logic (Aggregation)
  const groupedData = useMemo(() => {
    if (groupBy === 'none') return [];

    const groups: Record<string, { count: number; value: number }> = {};

    filteredData.forEach(item => {
      let key = '';

      // Determine Key based on grouping strategy
      if (groupBy === 'type') {
        key = item.type;
      } else if (groupBy === 'deputyName') {
        key = item.deputyName || 'Governo de Goiás (Sem Parlamentar)';
      } else if (groupBy === 'municipality') {
        key = item.municipality || 'Não Identificado';
      }

      if (!groups[key]) {
        groups[key] = { count: 0, value: 0 };
      }

      groups[key].count++;
      groups[key].value += item.value;
    });

    // Convert to array and sort by Value (Descending)
    return Object.entries(groups)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, groupBy]);

  // 3. Pagination Logic (Only applies to Detailed View)
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExport = () => {
    let content = "";
    let filename = "";

    if (groupBy === 'none') {
        // Detailed Export
        const headers = "Código;Tipo;Processo SEI;Parlamentar;Valor;Município;Objeto;Modalidade;Instituição;Status;Setor Atual;Data Entrada;Data Saída\n";
        const rows = filteredData.map(item => {
        const line = [
            item.code,
            item.type,
            item.seiNumber,
            item.deputyName || 'Governo de Goiás',
            item.value.toFixed(2).replace('.', ','),
            item.municipality,
            `"${item.object.replace(/"/g, '""')}"`, // Escape quotes
            item.transferMode || '',
            item.institutionName || '',
            item.status,
            item.currentSector,
            item.entryDate ? new Date(item.entryDate).toLocaleDateString() : '',
            item.exitDate ? new Date(item.exitDate).toLocaleDateString() : ''
        ];
        return line.join(';');
        }).join("\n");
        content = headers + rows;
        filename = `repositorio_detalhado_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
        // Grouped Export
        const headers = `Agrupamento (${groupBy});Qtd Emendas;Valor Total Consolidado\n`;
        const rows = groupedData.map(g => {
            return `${g.name};${g.count};${g.value.toFixed(2).replace('.', ',')}`;
        }).join("\n");
        content = headers + rows;
        filename = `repositorio_consolidado_${groupBy}_${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalFilteredValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight flex items-center gap-2">
            <Database size={24} className="text-slate-400" />
            Repositório Geral
          </h2>
          <p className="text-slate-500 text-sm">Visão consolidada tabular de toda a base de dados de emendas.</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#0d457a] text-white px-4 py-2 rounded-md hover:bg-[#0a365f] transition-colors shadow-sm font-bold text-xs uppercase tracking-wider"
        >
          <Download size={16} />
          {groupBy === 'none' ? 'Exportar Detalhado (CSV)' : 'Exportar Consolidado (CSV)'}
        </button>
      </div>

      {/* Controls Area */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-4">
        
        {/* Top Row: Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Pesquisar globalmente (Código, SEI, Parlamentar, Município)..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] focus:border-[#0d457a] outline-none transition-all"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            </div>
            <div className="flex items-center gap-2 min-w-[200px]">
            <Filter size={18} className="text-slate-400" />
            <select 
                className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] focus:border-[#0d457a] outline-none bg-white"
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
                <option value="all">Filtro: Todas as Tipologias</option>
                {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Group By Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <span className="text-xs font-bold text-slate-500 uppercase mr-2 whitespace-nowrap flex items-center gap-1">
                    <Layers size={14} /> Agrupar Saldos:
                </span>
                <button 
                    onClick={() => setGroupBy('none')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase whitespace-nowrap transition-colors border ${groupBy === 'none' ? 'bg-[#0d457a] text-white border-[#0d457a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    Não Agrupar
                </button>
                <button 
                    onClick={() => setGroupBy('type')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase whitespace-nowrap transition-colors border ${groupBy === 'type' ? 'bg-[#0d457a] text-white border-[#0d457a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    Por Tipo
                </button>
                <button 
                    onClick={() => setGroupBy('deputyName')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase whitespace-nowrap transition-colors border ${groupBy === 'deputyName' ? 'bg-[#0d457a] text-white border-[#0d457a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    Por Parlamentar
                </button>
                <button 
                    onClick={() => setGroupBy('municipality')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase whitespace-nowrap transition-colors border ${groupBy === 'municipality' ? 'bg-[#0d457a] text-white border-[#0d457a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    Por Município
                </button>
            </div>

            {/* Total Summary */}
            <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-3 whitespace-nowrap">
                <div className="p-1.5 bg-emerald-100 rounded-full">
                    <PieChart size={16} className="text-emerald-700" />
                </div>
                <div>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Total Filtrado</p>
                    <p className="text-lg font-bold text-emerald-800 leading-none">{formatCurrency(totalFilteredValue)}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Conditional Rendering: Grouped vs Detailed */}
      {groupBy === 'none' ? (
        /* --- DETAILED VIEW (EXISTING) --- */
        <>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100 text-[#0d457a] border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Código / Tipo</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Processo SEI</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Parlamentar / Origem</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Valor</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Município</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Setor Atual</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                            <div className="flex flex-col">
                            <span className="font-bold text-[#0d457a]">{item.code}</span>
                            <span className="text-[10px] text-slate-400 uppercase">{item.type}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{item.seiNumber}</td>
                        <td className="px-4 py-3 text-slate-700">{item.deputyName || 'Governo de Goiás'}</td>
                        <td className="px-4 py-3 font-mono text-slate-600 font-medium">{formatCurrency(item.value)}</td>
                        <td className="px-4 py-3 text-slate-600">{item.municipality}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase 
                            ${item.status === Status.CONCLUDED ? 'bg-green-100 text-green-700' : 
                                item.status.includes('diligência') ? 'bg-amber-100 text-amber-700' : 
                                'bg-slate-100 text-slate-600'}`}>
                            {item.statusDescription || item.status}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{item.currentSector}</td>
                        </tr>
                    ))}
                    {paginatedData.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                            Nenhum registro encontrado.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination Controls (Detailed Only) */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 uppercase font-bold">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} registros
                </span>
                <div className="flex gap-2">
                    <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                    <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold text-[#0d457a]">
                    {currentPage} / {totalPages}
                    </span>
                    <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                    <ChevronRight size={16} />
                    </button>
                </div>
                </div>
            )}
        </>
      ) : (
        /* --- GROUPED VIEW (SUMMARY) --- */
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#0d457a] uppercase tracking-wide">
                    Visão Consolidada: <span className="text-emerald-600">{
                        groupBy === 'type' ? 'Por Tipo de Emenda' :
                        groupBy === 'deputyName' ? 'Por Parlamentar' :
                        'Por Município'
                    }</span>
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider w-1/2">
                                {groupBy === 'type' ? 'Tipo' : groupBy === 'deputyName' ? 'Parlamentar' : 'Município'}
                            </th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Qtd. Emendas</th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Saldo Total (R$)</th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">% do Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {groupedData.map((group, idx) => {
                            const percent = totalFilteredValue > 0 ? (group.value / totalFilteredValue) * 100 : 0;
                            return (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {group.name}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600 font-mono">
                                        {group.count}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-[#0d457a] font-mono">
                                        {formatCurrency(group.value)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs font-medium text-slate-500">{percent.toFixed(1)}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {groupedData.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    Nenhum dado para agrupar com os filtros atuais.
                                </td>
                            </tr>
                        )}
                        {/* Summary Row */}
                        {groupedData.length > 0 && (
                             <tr className="bg-slate-50 font-bold border-t border-slate-300">
                                <td className="px-6 py-4 text-[#0d457a] uppercase">TOTAL GERAL</td>
                                <td className="px-6 py-4 text-right">{filteredData.length}</td>
                                <td className="px-6 py-4 text-right text-[#0d457a]">{formatCurrency(totalFilteredValue)}</td>
                                <td className="px-6 py-4 text-right">100%</td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};