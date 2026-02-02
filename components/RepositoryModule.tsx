/**
 * MÓDULO DE REPOSITÓRIO GERAL
 * 
 * Este componente funciona como um "Data Warehouse" da aplicação, oferecendo
 * uma visão tabular e consolidada de toda a base de dados de processos.
 * Atualizado com suporte a exportação em PDF e filtros dinâmicos de alta performance.
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

      const matchesSearch = !term ||
        item.seiNumber?.toLowerCase().includes(term) ||
        item.object?.toLowerCase().includes(term) ||
        item.municipality?.toLowerCase().includes(term) ||
        (item.deputyName && item.deputyName.toLowerCase().includes(term));
      
      return matchesType && matchesDeputy && matchesMunicipality && matchesValue && matchesSearch;
    });
  }, [amendments, searchTerm, typeFilter, deputyFilter, municipalityFilter, minValue, maxValue]);

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
    setMunicipalityFilter('all');
    setMinValue('');
    setMaxValue('');
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

  const handleExportPDF = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      alert("Aguarde o carregamento do motor de PDF.");
      return;
    }

    setIsGeneratingPdf(true);
    
    // Pequeno atraso para garantir que o React renderizou o cabeçalho institucional que estava oculto
    setTimeout(async () => {
      const element = document.getElementById('repository-table-content');
      if (!element) {
        setIsGeneratingPdf(false);
        return;
      }
      
      const opt = {
        margin: 10,
        filename: `Relatorio_Estruturado_GESA_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      try {
        await h2p().set(opt).from(element).save();
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        window.print();
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 200);
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Repositório Central</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <Database size={14} className="text-blue-500" /> Consulta Estruturada de Dados
          </p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleExportCSV} 
                className="flex items-center gap-2 bg-white text-slate-500 border border-slate-200 px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                <FileText size={16} /> Exportar CSV
            </button>
            <button 
                onClick={handleExportPDF} 
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 bg-[#0d457a] text-white px-6 py-3 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest disabled:opacity-50"
            >
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                {isGeneratingPdf ? 'Gerando PDF...' : 'Salvar Relatório'}
            </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6 no-print">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="text"
                    value={searchTerm}
                    placeholder="Pesquisa global na base..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-bold text-slate-600 uppercase text-xs"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button onClick={clearFilters} className="px-5 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100">
                    <X size={14} /> Limpar
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={12}/> Parlamentar / Autor
                </label>
                <select 
                    value={deputyFilter} 
                    onChange={(e) => setDeputyFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-black text-slate-600 focus:ring-2 focus:ring-[#0d457a] outline-none appearance-none"
                >
                    <option value="all">TODOS OS AUTORES</option>
                    {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="Executivo Estadual">Executivo Estadual</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin size={12}/> Município Beneficiário
                </label>
                <select 
                    value={municipalityFilter} 
                    onChange={(e) => setMunicipalityFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-black text-slate-600 focus:ring-2 focus:ring-[#0d457a] outline-none appearance-none"
                >
                    <option value="all">TODOS OS MUNICÍPIOS</option>
                    {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign size={12}/> Valor Mínimo
                </label>
                <input 
                    type="number" 
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-black text-slate-600 focus:ring-2 focus:ring-[#0d457a] outline-none"
                    placeholder="R$ 0,00"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign size={12}/> Valor Máximo
                </label>
                <input 
                    type="number" 
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-black text-slate-600 focus:ring-2 focus:ring-[#0d457a] outline-none"
                    placeholder="R$ 10.000.000,00"
                />
            </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-4">
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agrupar Por:</span>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    {[
                        { id: 'none', label: 'Lista' },
                        { id: 'type', label: 'Tipo' },
                        { id: 'deputyName', label: 'Autor' },
                        { id: 'municipality', label: 'Cidade' }
                    ].map(opt => (
                        <button 
                            key={opt.id}
                            onClick={() => setGroupBy(opt.id as GroupByOption)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${groupBy === opt.id ? 'bg-[#0d457a] text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div id="repository-table-content" className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        {/* Cabeçalho Institucional Oficial para PDF - Sincronizado com isGeneratingPdf */}
        <div className={`${isGeneratingPdf ? 'block' : 'hidden'} print:block p-12 border-b-2 border-[#0d457a] text-center space-y-3 bg-slate-50`}>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h1 className="text-[15px] font-black text-[#0d457a] uppercase tracking-tight leading-tight">SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA - SES/SUBIPEI-21286</h1>
              <h2 className="text-[13px] font-bold text-[#0d457a] uppercase tracking-widest">GERÊNCIA DE SUPORTE ADMINISTRATIVO</h2>
            </div>
            <div className="pt-8 pb-4">
              <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Consulta Estruturada de Dados</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Dossiê de Repositório - Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
        </div>

        {groupBy === 'none' ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Processo / Ano</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Autor & Município</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Objeto</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Consolidado</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Setor / Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(isGeneratingPdf ? filteredData : paginatedData).map(item => (
                            <tr key={item.id} className="group hover:bg-slate-50/50 transition-all pdf-avoid-break">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 text-[#0d457a] rounded-xl shadow-sm no-pdf"><FileText size={16}/></div>
                                        <div>
                                            <span className="text-xs font-black text-[#0d457a] uppercase block leading-none mb-1">{item.seiNumber}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.year} • {item.type}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Landmark size={12} className="text-emerald-500 no-pdf"/>
                                            <span className="text-[11px] font-black text-[#0d457a] uppercase tracking-tight">{item.deputyName || 'Executivo'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-slate-300 no-pdf"/>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.municipality}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-xs uppercase truncate" title={item.object}>{item.object}</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className="text-sm font-black text-[#0d457a] tracking-tighter">{formatBRL(item.value)}</span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="inline-flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.currentSector}</span>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                            item.status === 'Liquidado / Pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            item.status === 'Em Tramitação' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupedData.map((group, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative overflow-hidden group/card animate-in zoom-in-95 duration-300 pdf-avoid-break">
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:scale-110 transition-transform"><Layers size={48} /></div>
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{group.name}</h4>
                             <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{formatBRL(group.value)}</p>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{group.count} Processos</span>
                                </div>
                                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0d457a] transition-all" style={{ width: `${Math.min(100, (group.value / Math.max(...groupedData.map(g => g.value))) * 100)}%` }}></div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {filteredData.length === 0 && (
            <div className="py-24 text-center">
                <Database size={48} className="text-slate-100 mx-auto mb-4" />
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Nenhum registro localizado com estes filtros.</p>
            </div>
        )}

        {/* Rodapé institucional nas páginas do PDF */}
        <div className={`${isGeneratingPdf ? 'block' : 'hidden'} print:block p-10 border-t border-slate-100 text-center text-slate-400 pdf-avoid-break`}>
            <p className="text-[9px] font-black uppercase tracking-[0.4em]">Gerência de Suporte Administrativo • GESA / SUBIPEI</p>
        </div>
      </div>

      {groupBy === 'none' && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 no-print">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="p-3 bg-white border border-slate-200 rounded-xl text-[#0d457a] disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest bg-white px-6 py-2 rounded-xl border border-slate-200">Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="p-3 bg-white border border-slate-200 rounded-xl text-[#0d457a] disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
        </div>
      )}
    </div>
  );
};