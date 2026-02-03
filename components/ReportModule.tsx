import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Amendment, Status, AmendmentType } from '../types.ts';
import { 
  Printer, Filter, TrendingUp, Calendar, Layers, PieChart as PieIcon, 
  BarChart3, DollarSign, Landmark, User, CalendarRange, X, Loader2, Download, RotateCcw,
  ShieldCheck, MapPin, Building2
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

  const filteredData = useMemo(() => {
    return amendments.filter(a => {
      const matchYear = yearFilter === 'all' || a.year === Number(yearFilter);
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      
      // Filtros de período refinados para a coluna "Data de Entrada"
      let matchDate = true;
      if (startDate || endDate) {
        // Assume entryDate como data de entrada para fins de filtro temporal
        const entryDateToTest = a.entryDate || a.createdAt; 
        if (entryDateToTest) {
          const entry = new Date(entryDateToTest).getTime();
          if (startDate) {
            const start = new Date(startDate).getTime();
            if (entry < start) matchDate = false;
          }
          if (endDate) {
            const end = new Date(endDate).getTime();
            // Ajuste para final do dia no filtro de fim
            const endOfDay = Number(end) + (24 * 60 * 60 * 1000) - 1;
            if (entry > endOfDay) matchDate = false;
          }
        } else {
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

  const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);
  const totalCount = filteredData.length;

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

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
      filename: `Relatorio_Analitico_GESA_SUBIPEI_${new Date().toISOString().split('T')[0]}.pdf`,
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Relatórios Analíticos</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" /> Inteligência e Performance SES/SUBIPEI
          </p>
        </div>
        <button 
          onClick={handleSavePdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#0a365f] transition-all disabled:opacity-50"
        >
          {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
          {isGeneratingPdf ? 'Gerando Dossiê...' : 'Salvar Relatório (PDF)'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Exercício Fiscal</label>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 uppercase outline-none focus:ring-2 ring-[#0d457a]">
                <option value="all">TODOS OS ANOS</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Emenda</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 uppercase outline-none focus:ring-2 ring-[#0d457a]">
                <option value="all">TODOS OS TIPOS</option>
                {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Início</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none focus:ring-2 ring-[#0d457a]" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Fim</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none focus:ring-2 ring-[#0d457a]" />
          </div>
      </div>

      <div id="report-content" className="bg-white rounded-[48px] shadow-sm border border-slate-200 overflow-hidden">
        {/* CABEÇALHO INSTITUCIONAL RÍGIDO (PRINT ONLY) - PADRONIZADO GESA/SUBIPEI */}
        <div className="hidden print:block p-12 border-b-8 border-[#0d457a] bg-white">
            <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">ESTADO DE GOIÁS</h1>
                    <p className="text-[12px] font-black text-slate-700 uppercase leading-tight max-w-xl">
                      SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA - SES/SUBIPEI-21286
                    </p>
                    <p className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest mt-1">
                      GERÊNCIA DE SUPORTE ADMINISTRATIVO - GESA
                    </p>
                </div>
                <div className="text-right">
                  <div className="flex justify-end mb-4">
                    <ShieldCheck size={40} className="text-[#0d457a]" />
                  </div>
                  <p className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest">RELATÓRIO ANALÍTICO</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Extraído em: {new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Processos Filtrados</p>
                <p className="text-3xl font-black text-[#0d457a]">{totalCount}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume Financeiro</p>
                <p className="text-3xl font-black text-[#0d457a]">{formatBRL(totalValue)}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Exercício Base</p>
                <p className="text-3xl font-black text-[#0d457a] uppercase">{yearFilter === 'all' ? 'Multiexercício' : yearFilter}</p>
              </div>
            </div>
        </div>

        <div className="p-10 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Distribuição por Tipo */}
                <div className="space-y-8 pdf-avoid-break">
                    <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-3">
                        <Layers size={18} className="text-blue-500" /> Distribuição por Origem
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                                    {typeDistribution.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Municípios */}
                <div className="space-y-8 pdf-avoid-break">
                    <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-3">
                        <MapPin size={18} className="text-emerald-500" /> Top 5 Municípios (Volume R$)
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMunicipalities} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 9, fontWeight: '800', fill: '#0d457a'}} axisLine={false} tickLine={false} width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0d457a" radius={[0, 8, 8, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-slate-100 pdf-avoid-break">
               <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <Building2 size={18} className="text-purple-500" /> Resumo Consolidado de Tramitação
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {typeDistribution.map((item, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{item.name}</p>
                       <p className="text-2xl font-black text-[#0d457a] tracking-tighter">{formatBRL(item.value)}</p>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="hidden print:block pt-20 text-center text-slate-300">
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Documento Gerado pelo Sistema de Gestão de Emendas - GESA Cloud</p>
              <p className="text-[8px] font-bold mt-2 uppercase tracking-widest">VALIDADE JURÍDICA ASSEGURADA POR METADADOS DE SISTEMA</p>
            </div>
        </div>
      </div>
    </div>
  );
};