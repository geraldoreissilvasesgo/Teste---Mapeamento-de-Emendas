
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Amendment, Status, AmendmentType } from '../types';
import { 
  Printer, Filter, TrendingUp, Calendar, Layers, PieChart as PieIcon, 
  BarChart3, DollarSign, Landmark, User, CalendarRange, X, Loader2, Download, RotateCcw
} from 'lucide-react';

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

  const clearFilters = () => {
    setYearFilter('all');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const filteredData = useMemo(() => {
    return amendments.filter(a => {
      const matchYear = yearFilter === 'all' || a.year === Number(yearFilter);
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      
      let matchDate = true;
      // Filtra pela coluna entryDate (Data de Entrada)
      if (startDate || endDate) {
        if (a.entryDate) {
          const entry = new Date(a.entryDate).getTime();
          if (startDate) {
            const start = new Date(startDate).getTime();
            if (entry < start) matchDate = false;
          }
          if (endDate) {
            const end = new Date(endDate).getTime();
            // Define o fim do dia para a data final selecionada
            const endOfDay = Number(end) + (24 * 60 * 60 * 1000) - 1;
            if (entry > endOfDay) matchDate = false;
          }
        } else {
          // Se houver filtro de data mas o processo não tiver entryDate, ele não é incluído
          matchDate = false;
        }
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
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      alert("Aguarde o carregamento do motor de PDF.");
      return;
    }

    setIsGeneratingPdf(true);
    const element = document.getElementById('report-content');
    
    const opt = {
      margin: 10,
      filename: `Relatorio_Analitico_GESA_${new Date().toISOString().split('T')[0]}.pdf`,
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
                onClick={clearFilters}
                className="flex items-center gap-2 bg-white text-red-500 border border-red-100 px-6 py-3 rounded-2xl hover:bg-red-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                <RotateCcw size={16} /> Limpar Filtros
            </button>
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-[#0d457a] focus:ring-2 focus:ring-[#0d457a] outline-none appearance-none"
                    >
                        <option value="all">TODOS OS ANOS</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Layers size={12} /> Modalidade
                </label>
                <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-[#0d457a] focus:ring-2 focus:ring-[#0d457a] outline-none appearance-none"
                >
                    <option value="all">TODAS AS MODALIDADES</option>
                    {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <CalendarRange size={12} /> Entrada Inicial
                </label>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-[#0d457a] focus:ring-2 focus:ring-[#0d457a] outline-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <CalendarRange size={12} /> Entrada Final
                </label>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-[#0d457a] focus:ring-2 focus:ring-[#0d457a] outline-none"
                />
            </div>
        </div>
      </div>

      <div id="report-content" className="space-y-8 bg-white p-8 rounded-[40px] print:p-0">
        <div className="hidden print:block text-center border-b-2 border-[#0d457a] pb-8 mb-10">
            <h1 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Relatório Consolidado de Emendas Parlamentares</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Extraído em: {new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pdf-avoid-break">
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="p-4 bg-white text-[#0d457a] rounded-2xl shadow-sm mb-4"><DollarSign size={32} /></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montante Financeiro Total</p>
                <h3 className="text-4xl font-black text-[#0d457a] tracking-tighter">{formatCurrency(totalValue)}</h3>
            </div>
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm mb-4"><Layers size={32} /></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Processos Registrados</p>
                <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">{totalCount}</h3>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm pdf-avoid-break">
                <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
                    <PieIcon size={18} className="text-blue-500" /> Distribuição por Modalidade
                </h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={5}>
                                {typeDistribution.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm pdf-avoid-break">
                <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
                    <BarChart3 size={18} className="text-emerald-500" /> Top 5 Municípios Beneficiados
                </h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topMunicipalities} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748b'}} width={100} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{borderRadius: '16px', border: 'none'}} />
                            <Bar dataKey="value" fill="#10B981" radius={[0, 8, 8, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm lg:col-span-2 pdf-avoid-break">
                <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
                    <Landmark size={18} className="text-amber-500" /> Maiores Alocações por Autor
                </h4>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topParliamentarians}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 9, fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                            <Bar dataKey="value" fill="#0d457a" radius={[10, 10, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="text-center pt-20 border-t border-slate-100 text-slate-400 pdf-avoid-break">
            <p className="text-[9px] font-black uppercase tracking-[0.4em]">Gerência de Suporte Administrativo • GESA / SUBIPEI</p>
        </div>
      </div>
    </div>
  );
};
