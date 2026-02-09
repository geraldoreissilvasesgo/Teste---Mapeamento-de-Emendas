
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Amendment, AmendmentType, Status } from '../types';
import { 
  Printer, PieChart as PieIcon, BarChart3, MapPin, Loader2, 
  FileSpreadsheet, TrendingUp, Download, Search, ChevronDown, 
  ListFilter, Landmark, Briefcase, Calculator, Users, ArrowUpRight,
  ShieldCheck, FileText
} from 'lucide-react';

interface ReportModuleProps {
  amendments: Amendment[];
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#64748B'];

export const ReportModule: React.FC<ReportModuleProps> = ({ amendments }) => {
  const [reportView, setReportView] = useState<'synthetic' | 'analytical'>('synthetic');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filtros Avançados
  const [filters, setFilters] = useState({
    year: 'all',
    type: 'all',
    status: 'all',
    municipality: 'all',
    startDate: '',
    endDate: ''
  });

  const availableYears = useMemo(() => 
    Array.from(new Set(amendments.map(a => a.year))).sort((a: number, b: number) => b - a), 
    [amendments]
  );
  
  const availableStatuses = useMemo(() => 
    Array.from(new Set(amendments.map(a => a.status))).sort(), 
    [amendments]
  );

  const filteredData = useMemo(() => {
    return amendments.filter(a => {
      const matchYear = filters.year === 'all' || a.year === Number(filters.year);
      const matchType = filters.type === 'all' || a.type === filters.type;
      const matchStatus = filters.status === 'all' || a.status === filters.status;
      const matchCity = filters.municipality === 'all' || a.municipality === filters.municipality;
      
      let matchDate = true;
      const entryDate = a.entryDate || a.createdAt;
      if (filters.startDate) matchDate = matchDate && new Date(entryDate) >= new Date(filters.startDate);
      if (filters.endDate) matchDate = matchDate && new Date(entryDate) <= new Date(filters.endDate);

      return matchYear && matchType && matchStatus && matchCity && matchDate;
    });
  }, [amendments, filters]);

  // Cálculos Sintéticos (Business Intelligence)
  const stats = useMemo(() => {
    const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    const count = filteredData.length;
    const avgValue = count > 0 ? totalValue / count : 0;
    
    // Distribuição por Status
    const statusMap = filteredData.reduce((acc, curr) => {
      if (!acc[curr.status]) acc[curr.status] = { name: curr.status, value: 0, count: 0 };
      acc[curr.status].value += curr.value;
      acc[curr.status].count += 1;
      return acc;
    }, {} as Record<string, { name: string, value: number, count: number }>);
    
    const statusData = Object.values(statusMap).sort((a: any, b: any) => b.value - a.value);

    // Top Municípios
    const cityMap = filteredData.reduce((acc, curr) => {
      acc[curr.municipality] = (acc[curr.municipality] || 0) + curr.value;
      return acc;
    }, {} as Record<string, number>);
    
    const cityData = Object.entries(cityMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 8);

    return { totalValue, count, avgValue, statusData, cityData };
  }, [filteredData]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleExportCSV = () => {
    const headers = ["SEI", "Ano", "Tipo", "Parlamentar", "Municipio", "Objeto", "Valor", "Status", "Unidade Atual"];
    const rows = filteredData.map(a => [
      a.seiNumber, a.year, a.type, a.deputyName || '-', a.municipality, 
      `"${a.object.replace(/"/g, '""')}"`, a.value, a.status, a.currentSector
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `GESA_Relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) return;
    
    setIsGeneratingPdf(true);
    const element = document.getElementById('report-canvas');
    const opt = {
      margin: 10,
      filename: `Relatorio_GESA_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    try {
      await h2p().set(opt).from(element).save();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Centro de Inteligência</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-500" /> Relatórios Estratégicos GESA
          </p>
        </div>
        
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
          <button 
            onClick={() => setReportView('synthetic')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'synthetic' ? 'bg-white text-[#0d457a] shadow-md' : 'text-slate-500 hover:text-[#0d457a]'}`}
          >
            <PieIcon size={14} /> Visão Sintética
          </button>
          <button 
            onClick={() => setReportView('analytical')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'analytical' ? 'bg-white text-[#0d457a] shadow-md' : 'text-slate-500 hover:text-[#0d457a]'}`}
          >
            <ListFilter size={14} /> Visão Analítica
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Exercício Financeiro</label>
            <div className="relative">
              <select value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 uppercase outline-none focus:ring-2 ring-[#0d457a] appearance-none">
                <option value="all">TODOS OS ANOS</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status do Fluxo</label>
            <div className="relative">
              <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 uppercase outline-none focus:ring-2 ring-[#0d457a] appearance-none">
                <option value="all">TODOS OS STATUS</option>
                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Inicial</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none" />
          </div>
          <div className="flex items-end gap-3">
            <button onClick={handleExportCSV} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
              <FileSpreadsheet size={16} /> CSV
            </button>
            <button onClick={handleExportPDF} disabled={isGeneratingPdf} className="flex-1 flex items-center justify-center gap-2 bg-[#0d457a] text-white px-4 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#0a365f] transition-all shadow-lg">
              {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} PDF
            </button>
          </div>
        </div>
      </div>

      <div id="report-canvas" className="space-y-10">
        <div className="hidden print:block text-center border-b-2 border-[#0d457a] pb-8 mb-12">
            <h1 className="text-xl font-black text-[#0d457a] uppercase">Estado de Goiás - Secretaria da Saúde</h1>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Gerência de Suporte Administrativo (GESA)</h2>
            <p className="text-[10px] font-black text-slate-400 mt-4 uppercase">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
        </div>

        {reportView === 'synthetic' ? (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
                 <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Landmark size={120} /></div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Montante Global Filtrado</p>
                 <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{formatBRL(stats.totalValue)}</p>
                 <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 mt-4">
                    <ArrowUpRight size={12} /> Dados Auditados
                 </span>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Processos SEI Registrados</p>
                 <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{stats.count}</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase">Unidades Governamentais</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Médio por Recurso</p>
                 <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{formatBRL(stats.avgValue)}</p>
                 <p className="text-[9px] font-bold text-blue-500 mt-4 uppercase">Capacidade Operacional</p>
              </div>
              <div className="bg-[#0d457a] p-8 rounded-[40px] text-white shadow-xl">
                 <p className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest mb-1">Conformidade SLAs</p>
                 <p className="text-3xl font-black">100%</p>
                 <div className="flex items-center gap-2 mt-4 text-[9px] font-black uppercase text-emerald-400">
                    <ShieldCheck size={14} /> GESA Cloud Native
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                 <h3 className="text-xs font-black text-[#0d457a] uppercase mb-10 tracking-widest flex items-center gap-3">
                    <PieIcon size={18} className="text-blue-500" /> Fluxo por Ciclo de Vida
                 </h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={stats.statusData} 
                            cx="50%" cy="50%" 
                            innerRadius={70} 
                            outerRadius={100} 
                            paddingAngle={5} 
                            dataKey="value"
                            stroke="none"
                          >
                             {stats.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', paddingTop: '20px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                 <h3 className="text-xs font-black text-[#0d457a] uppercase mb-10 tracking-widest flex items-center gap-3">
                    <MapPin size={18} className="text-emerald-500" /> Alocação Geográfica (Top 8)
                 </h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={stats.cityData} layout="vertical" margin={{ left: 20, right: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{fontSize: 9, fontWeight: '800', fill: '#64748b'}} 
                            axisLine={false} 
                            tickLine={false} 
                            width={120} 
                          />
                          <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{borderRadius: '16px', border: 'none'}} />
                          <Bar dataKey="value" fill="#0d457a" radius={[0, 10, 10, 0]} barSize={20} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
             <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                   <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest">Dossiê Analítico de Processos</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Exibindo {filteredData.length} registros filtrados</p>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/80 border-b border-slate-200">
                      <tr>
                         <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocolo SEI</th>
                         <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Parlamentar / Autor</th>
                         <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Município</th>
                         <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Nominal</th>
                         <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status GESA</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 font-inter">
                      {filteredData.map(a => (
                        <tr key={a.id} className="hover:bg-blue-50/30 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-xs font-black text-[#0d457a] uppercase tracking-tighter">{a.seiNumber}</span>
                                 <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{a.year} • {a.type}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-[10px] font-bold text-slate-600 uppercase">{a.deputyName || 'Executivo Estadual'}</span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <MapPin size={12} className="text-emerald-500" />
                                 <span className="text-[10px] font-black text-slate-500 uppercase">{a.municipality}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <span className="text-xs font-black text-[#0d457a]">{formatBRL(a.value)}</span>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase border border-blue-100">
                                 {a.status}
                              </span>
                           </td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                           <td colSpan={5} className="py-32 text-center opacity-30">
                              <Search size={48} className="mx-auto text-slate-300 mb-4" />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sem resultados para os filtros selecionados.</p>
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
