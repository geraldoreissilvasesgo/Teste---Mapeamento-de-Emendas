
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Amendment, Status, AmendmentType } from '../types';
import { 
  Printer, Filter, TrendingUp, Calendar, Layers, PieChart as PieIcon, 
  BarChart3, DollarSign, Landmark, User, CalendarRange, X, Loader2, Download
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ReportModuleProps {
  amendments: Amendment[];
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'];

export const ReportModule: React.FC<ReportModuleProps> = ({ amendments }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const availableYears = useMemo(() => {
    return Array.from(new Set(amendments.map(a => a.year))).sort((a, b) => Number(b) - Number(a));
  }, [amendments]);

  const [yearFilter, setYearFilter] = useState<number | 'all'>(() => {
    if (availableYears.length > 0) return availableYears[0];
    return new Date().getFullYear();
  });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredData = useMemo(() => {
    return amendments.filter(a => {
      const matchYear = yearFilter === 'all' || a.year === Number(yearFilter);
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      
      let matchDate = true;
      if (a.entryDate) {
        const entry = new Date(a.entryDate).getTime();
        if (startDate) {
          const start = new Date(startDate).getTime();
          if (entry < start) matchDate = false;
        }
        if (endDate) {
          const end = new Date(endDate).getTime();
          const endOfDay = Number(end) + (24 * 60 * 60 * 1000) - 1;
          if (entry > endOfDay) matchDate = false;
        }
      } else if (startDate || endDate) {
        matchDate = false;
      }

      return matchYear && matchType && matchDate;
    });
  }, [amendments, yearFilter, typeFilter, startDate, endDate]);

  const typeDistribution = useMemo(() => {
    const data = filteredData.reduce((acc, curr) => {
        acc[curr.type] = (Number(acc[curr.type]) || 0) + Number(curr.value);
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const topMunicipalities = useMemo(() => {
     const data = filteredData.reduce((acc, curr) => {
        acc[curr.municipality] = (Number(acc[curr.municipality]) || 0) + Number(curr.value);
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 5);
  }, [filteredData]);

  const topParliamentarians = useMemo(() => {
    const data = filteredData.reduce((acc, curr) => {
       const name = curr.deputyName || 'Executivo/Outros';
       acc[name] = (Number(acc[name]) || 0) + Number(curr.value);
       return acc;
   }, {} as Record<string, number>);
   return Object.entries(data)
     .map(([name, value]) => ({ name, value }))
     .sort((a, b) => Number(b.value) - Number(a.value))
     .slice(0, 5);
 }, [filteredData]);
  
  const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);
  const totalCount = filteredData.length;

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    const element = document.getElementById('report-content');
    const opt = {
      margin: 10,
      filename: `Relatorio_GESA_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      window.print(); // Fallback
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Relatórios Analíticos</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Consolidação de Dados e Performance Financeira</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                <Printer size={16} /> Imprimir
            </button>
            <button 
                onClick={handleSavePdf} 
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 bg-[#0d457a] text-white px-6 py-3 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest disabled:opacity-50"
            >
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isGeneratingPdf ? 'Gerando...' : 'Salvar em PDF'}
            </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-8 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Calendar size={12} /> Exercício
                </label>
                <div className="relative">
                    <select 
                        value={yearFilter} 
                        onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-[#0d457a] focus:ring-2 focus:ring-[#0d457a] outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">TODOS OS ANOS</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Layers size={12} /> Fonte
                </label>
                <div className="relative">
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#0d457a] outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">TODAS AS FONTES</option>
                        {Object.values(AmendmentType).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <CalendarRange size={12} /> Data Inicial
                </label>
                <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#0d457a] outline-none"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center pr-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <CalendarRange size={12} /> Data Final
                    </label>
                    {(startDate || endDate) && (
                        <button onClick={() => {setStartDate(''); setEndDate('');}} className="text-[9px] font-black text-red-400 hover:text-red-500 flex items-center gap-1 uppercase">
                            <X size={10} /> Limpar
                        </button>
                    )}
                </div>
                <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#0d457a] outline-none"
                />
            </div>
        </div>
      </div>

      <div id="report-content" className="space-y-6">
        {/* Cabeçalho do Relatório PDF */}
        <div className="hidden print:block text-center mb-10 border-b-2 border-[#0d457a] pb-6">
            <h1 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Relatório Consolidado GESA Cloud</h1>
            <div className="flex justify-center gap-6 mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Unidade: {yearFilter === 'all' ? 'Consolidado' : yearFilter}</span>
                <span>Fonte: {typeFilter === 'all' ? 'Todas' : typeFilter}</span>
                <span>Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0d457a] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-400" /> Valor Filtrado
                </p>
                <p className="text-2xl font-black tracking-tighter">{formatCurrency(totalValue)}</p>
            </div>
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-500" /> Processos
                </p>
                <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{totalCount}</p>
            </div>
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" /> Ticket Médio
                </p>
                <p className="text-2xl font-black text-[#0d457a] tracking-tighter">
                    {formatCurrency(totalCount > 0 ? totalValue / totalCount : 0)}
                </p>
            </div>
            <div className="bg-emerald-600 p-8 rounded-[32px] text-white">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Status da Base</p>
                <p className="text-lg font-black uppercase">Consolidado</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 print:break-inside-avoid">
                <h3 className="text-[10px] font-black text-[#0d457a] uppercase mb-10 tracking-[0.3em] flex items-center gap-3">
                    <PieIcon size={18} className="text-blue-500" /> Composição por Fonte
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={typeDistribution} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={110} 
                                paddingAngle={5}
                            >
                                {typeDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 print:break-inside-avoid">
                <h3 className="text-[10px] font-black text-[#0d457a] uppercase mb-10 tracking-[0.3em] flex items-center gap-3">
                    <Landmark size={18} className="text-emerald-500" /> Top Municípios (Valor)
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topMunicipalities} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={110} tick={{fontSize: 9, fontWeight: 'bold'}} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="value" fill="#0d457a" radius={[0, 10, 10, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
