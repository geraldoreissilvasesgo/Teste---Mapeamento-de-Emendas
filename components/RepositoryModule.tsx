/**
 * MÓDULO DE REPOSITÓRIO GERAL
 * 
 * Este componente funciona como um "Data Warehouse" da aplicação, oferecendo
 * uma visão tabular e consolidada de toda a base de dados de processos.
 */
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

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesSearch = !term ||
        item.seiNumber?.toLowerCase().includes(term) ||
        item.object?.toLowerCase().includes(term) ||
        item.municipality?.toLowerCase().includes(term) ||
        item.deputyName?.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }, [amendments, searchTerm, typeFilter]);

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

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `repositorio_gesa_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (groupBy === 'none') {
        csvContent += "SEI;Ano;Tipo;Autor;Município;Objeto;Valor;Status\n";
        paginatedData.forEach(row => {
            const line = `${row.seiNumber};${row.year};${row.type};${row.deputyName || ''};${row.municipality};"${row.object}";${row.value};${row.status}`;
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
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  const totalFilteredValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Repositório Geral</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Base de Dados Completa para Consulta e Exportação</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg uppercase text-[10px] font-black tracking-widest">
            <Download size={16} /> Exportar CSV
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar em toda a base..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
            >
                <option value="all">Todos os Tipos</option>
                {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <div className="relative">
             <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
            >
                <option value="none">Não Agrupar (Detalhado)</option>
                <option value="type">Agrupar por Tipo</option>
                <option value="deputyName">Agrupar por Autor</option>
                <option value="municipality">Agrupar por Município</option>
            </select>
        </div>
      </div>

      {groupBy === 'none' ? (
        <>
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                  <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SEI / Objeto</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Município / Autor</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo / Ano</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {paginatedData.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="font-bold text-[#0d457a]">{item.seiNumber}</div>
                              <div className="text-[10px] text-slate-400 uppercase truncate max-w-[200px]">{item.object}</div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="text-xs font-bold text-slate-600">{item.municipality}</div>
                              <div className="text-[10px] text-slate-400 uppercase">{item.deputyName || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="text-xs font-bold text-slate-600">{item.type}</div>
                              <div className="text-[10px] text-slate-400">{item.year}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-[#0d457a]">
                              {formatCurrency(item.value)}
                          </td>
                          <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-500">
                                  {item.status}
                              </span>
                          </td>
                      </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><ChevronLeft/></button>
                <span className="text-sm font-bold text-slate-500">Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50"><ChevronRight/></button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50">
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
                          <td className="px-6 py-4 font-bold text-[#0d457a] uppercase text-xs">{group.name}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{group.count} processos</td>
                          <td className="px-6 py-4 text-xs font-black text-[#0d457a]">{formatCurrency(group.value)}</td>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 rounded-full" style={{width: `${(group.value / totalFilteredValue) * 100}%`}}></div>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400">{((group.value / totalFilteredValue) * 100).toFixed(1)}%</span>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
