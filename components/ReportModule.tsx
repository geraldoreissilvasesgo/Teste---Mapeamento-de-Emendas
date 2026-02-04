import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Amendment, AmendmentType } from '../types.ts';
import { 
  Printer, PieChart as PieIcon, 
  BarChart3, MapPin, Loader2, ClipboardList, FileSpreadsheet,
  TrendingUp, CalendarRange
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
      
      let matchDate = true;
      if (startDate || endDate) {
        const entryDateToTest = a.entryDate || a.createdAt; 
        if (entryDateToTest) {
          const entry = new Date(entryDateToTest).getTime();
          if (startDate) {
            const start = new Date(startDate).getTime();
            if (entry < start) matchDate = false;
          }
          if (endDate) {
            const end = new Date(endDate).getTime();
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

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatBRLCompact = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  const handleSavePdf = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      alert("Motor de PDF em carregamento.");
      return;
    }

    setIsGeneratingPdf(true);
    const element = document.getElementById('report-content-canvas');
    
    const opt = {
      margin: 8,
      filename: `RELATORIO_ANALITICO_GESA_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
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
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Inteligência de Dados</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" /> Relatórios Analíticos e Consolidação Financeira
          </p>
        </div>
        <button 
          onClick={handleSavePdf}
          disabled={isGeneratingPdf || filteredData.length === 0}
          className="flex items-center gap-3 bg-[#0d457a] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#0a365f] transition-all disabled:opacity-50"
        >
          {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
          {isGeneratingPdf ? 'Compilando Dossiê...' : 'Exportar Relatório (PDF)'}
        </button>
      </div>

      {/* FILTROS DE TELA (NO-PRINT) */}
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
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Início (Ingestão)</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none focus:ring-2 ring-[#0d457a]" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Fim (Ingestão)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none focus:ring-2 ring-[#0d457a]" />
          </div>
      </div>

      {/* CONTAINER DO RELATÓRIO (CANVAS DE EXPORTAÇÃO) */}
      <div id="report-content-canvas" className="bg-white rounded-[48px] shadow-sm border border-slate-200 overflow-hidden print:rounded-none print:border-none">
        
        {/* CABEÇALHO INSTITUCIONAL RÍGIDO (RÉPLICA MODELO) */}
        <div className="p-12 text-center space-y-4 border-b-2 border-[#0d457a]/10">
          <div className="space-y-1 mb-10">
            <h4 className="text-[11px] font-black text-[#0d457a] uppercase leading-tight tracking-tight">
              SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA - SES/SUBIPEI-21286
            </h4>
            <h5 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest opacity-80">
              GERÊNCIA DE SUPORTE ADMINISTRATIVO
            </h5>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">RELATÓRIO ANALÍTICO DE PERFORMANCE</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
              SISTEMA GESA CLOUD - EXTRAÍDO EM: {new Date().toLocaleDateString('pt-BR')} ÀS {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="flex justify-center mb-2"><ClipboardList size={18} className="text-blue-500"/></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Processos Analisados</p>
                  <p className="text-3xl font-black text-[#0d457a]">{totalCount}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="flex justify-center mb-2"><TrendingUp size={18} className="text-emerald-500"/></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Montante Consolidado</p>
                  <p className="text-3xl font-black text-[#0d457a]">{formatBRLCompact(totalValue)}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="flex justify-center mb-2"><CalendarRange size={18} className="text-amber-500"/></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Exercício Base</p>
                  <p className="text-3xl font-black text-[#0d457a] uppercase">{yearFilter === 'all' ? 'Multiexercício' : yearFilter}</p>
              </div>
          </div>
        </div>

        <div className="p-12 space-y-20">
            {/* SEÇÃO VISUAL: GRÁFICOS (PRESERVADOS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pdf-avoid-break">
                <div className="space-y-8 bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm">
                    <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-3 justify-center">
                        <PieIcon size={18} className="text-blue-500" /> Distribuição por Origem (Financeiro)
                    </h4>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                  data={typeDistribution} 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={70} 
                                  outerRadius={100} 
                                  dataKey="value" 
                                  paddingAngle={5}
                                  animationDuration={0}
                                >
                                    {typeDistribution.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip formatter={(v: number) => formatBRL(v)} />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '9px', fontWeight: '800', textTransform: 'uppercase'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-8 bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm">
                    <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-3 justify-center">
                        <MapPin size={18} className="text-emerald-500" /> Ranking de Municípios (Top 5)
                    </h4>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMunicipalities} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 9, fontWeight: '800', fill: '#0d457a'}} axisLine={false} tickLine={false} width={120} />
                                <Tooltip formatter={(v: number) => formatBRL(v)} />
                                <Bar dataKey="value" fill="#0d457a" radius={[0, 10, 10, 0]} barSize={24} animationDuration={0} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* SEÇÃO ANALÍTICA: DADOS COMPILADOS (DADOS TABULARES PARA AUDITORIA) */}
            <div className="pt-12 border-t-2 border-dashed border-slate-100 pdf-avoid-break">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-3">
                        <FileSpreadsheet size={18} className="text-purple-500" /> Consolidação de Dados Compilados
                      </h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Valores brutos apurados no repositório central</p>
                   </div>
                   <span className="px-4 py-1.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded-lg tracking-widest">DADOS OFICIAIS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Tabela por Origem */}
                   <div className="overflow-hidden rounded-[32px] border border-slate-200 shadow-inner">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Categoria / Origem</th>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Valor Consolidado</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                           {typeDistribution.map((item, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-[10px] font-black text-[#0d457a] uppercase">{item.name}</td>
                                <td className="px-6 py-4 text-[11px] font-bold text-slate-600 text-right">{formatBRL(item.value)}</td>
                             </tr>
                           ))}
                           <tr className="bg-[#0d457a]/5">
                              <td className="px-6 py-4 text-[10px] font-black text-[#0d457a] uppercase">TOTAL ANALISADO</td>
                              <td className="px-6 py-4 text-[11px] font-black text-[#0d457a] text-right">{formatBRL(totalValue)}</td>
                           </tr>
                        </tbody>
                      </table>
                   </div>

                   {/* Tabela por Município */}
                   <div className="overflow-hidden rounded-[32px] border border-slate-200 shadow-inner">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Município (Top 5)</th>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Montante Alocado</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                           {topMunicipalities.map((item, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-[10px] font-black text-[#0d457a] uppercase">{item.name}</td>
                                <td className="px-6 py-4 text-[11px] font-bold text-slate-600 text-right">{formatBRL(item.value)}</td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
            </div>

            {/* RODAPÉ DO DOSSIÊ (PRINT ONLY) */}
            <div className="hidden print:block pt-16 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                GERÊNCIA DE SUPORTE ADMINISTRATIVO • GESA / SUBIPEI
              </p>
              <p className="text-[8px] font-bold text-slate-300 uppercase mt-2">Dossiê Analítico Gerado via GESA Cloud Engine</p>
            </div>
        </div>
      </div>
    </div>
  );
};