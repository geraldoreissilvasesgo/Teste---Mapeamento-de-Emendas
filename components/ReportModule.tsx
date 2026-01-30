
/**
 * MÓDULO DE RELATÓRIOS GERENCIAIS
 * 
 * Este componente fornece uma visão analítica e visual dos dados,
 * focada na geração de relatórios consolidados para tomada de decisão.
 * Agora com suporte a filtragem multi-ano e visão consolidada.
 */
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Amendment, Status, AmendmentType } from '../types';
import { 
  Printer, Filter, TrendingUp, Calendar, Layers, PieChart as PieIcon, 
  BarChart3, DollarSign, Landmark, User, CalendarRange, X
} from 'lucide-react';

interface ReportModuleProps {
  amendments: Amendment[];
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'];

export const ReportModule: React.FC<ReportModuleProps> = ({ amendments }) => {
  // Lista de anos disponíveis nos dados
  const availableYears = useMemo(() => {
    // FIX: Explicitly cast to any or use Number() to avoid "The left-hand side of an arithmetic operation must be..." if inference fails
    const years = Array.from(new Set(amendments.map(a => a.year))).sort((a, b) => Number(b) - Number(a));
    return years;
  }, [amendments]);

  // Filtros de estado
  const [yearFilter, setYearFilter] = useState<number | 'all'>(() => {
    if (availableYears.length > 0) return availableYears[0];
    return new Date().getFullYear();
  });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filtragem principal dos dados
  const filteredData = useMemo(() => {
    return amendments.filter(a => {
      const matchYear = yearFilter === 'all' || a.year === Number(yearFilter);
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      
      // Filtro de Data de Entrada (Período)
      let matchDate = true;
      if (a.entryDate) {
        const entry = new Date(a.entryDate).getTime();
        if (startDate) {
          const start = new Date(startDate).getTime();
          if (entry < start) matchDate = false;
        }
        if (endDate) {
          const end = new Date(endDate).getTime();
          // Ajusta end para o final do dia
          // FIX: Explicitly cast end to Number to avoid arithmetic type errors
          const endOfDay = Number(end) + (24 * 60 * 60 * 1000) - 1;
          if (entry > endOfDay) matchDate = false;
        }
      } else if (startDate || endDate) {
        // Se houver filtro de data mas o registro não tiver data de entrada, oculta por segurança
        matchDate = false;
      }

      return matchYear && matchType && matchDate;
    });
  }, [amendments, yearFilter, typeFilter, startDate, endDate]);

  // Cálculos para Gráfico de Composição (Pizza)
  const typeDistribution = useMemo(() => {
    const data = filteredData.reduce((acc, curr) => {
        // FIX: Ensure numeric addition
        acc[curr.type] = (Number(acc[curr.type]) || 0) + Number(curr.value);
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Cálculos para Top 5 Municípios (Barras)
  const topMunicipalities = useMemo(() => {
     const data = filteredData.reduce((acc, curr) => {
        // FIX: Ensure numeric addition to avoid arithmetic errors
        acc[curr.municipality] = (Number(acc[curr.municipality]) || 0) + Number(curr.value);
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      // FIX: Ensure numeric comparison in sort
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 5);
  }, [filteredData]);

  // Cálculos para Top 5 Parlamentares (Barras)
  const topParliamentarians = useMemo(() => {
    const data = filteredData.reduce((acc, curr) => {
       const name = curr.deputyName || 'Executivo/Outros';
       // FIX: Ensure numeric addition
       acc[name] = (Number(acc[name]) || 0) + Number(curr.value);
       return acc;
   }, {} as Record<string, number>);
   return Object.entries(data)
     .map(([name, value]) => ({ name, value }))
     // FIX: Ensure numeric comparison in sort
     .sort((a, b) => Number(b.value) - Number(a.value))
     .slice(0, 5);
 }, [filteredData]);
  
  const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);
  const totalCount = filteredData.length;

  const handlePrint = () => {
    window.print();
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0 animate-in fade-in duration-500">
      {/* Cabeçalho de Impressão (Oculto na UI) */}
      <div className="hidden print:block text-center mb-10 border-b-2 border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Relatório Consolidado GESA/SUBIPEI</h1>
        <div className="flex justify-center gap-6 mt-2 text-xs font-bold text-slate-500 uppercase">
           <span>Exercício: {yearFilter === 'all' ? 'Consolidado' : yearFilter}</span>
           <span>Fonte: {typeFilter === 'all' ? 'Todas' : typeFilter}</span>
           {(startDate || endDate) && <span>Período: {startDate || '...'} até {endDate || '...'}</span>}
           <span>Emissão: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Título e Ações da UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Relatórios Analíticos</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Consolidação de Dados e Performance Financeira</p>
        </div>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
        >
            <Printer size={16} /> Exportar Relatório (PDF)
        </button>
      </div>

      {/* Barra de Filtros Expansível */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-8 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filtro de Exercício */}
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

            {/* Filtro de Fonte */}
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

            {/* Filtro de Data Inicial */}
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

            {/* Filtro de Data Final */}
            <div className="space-y-2">
                <div className="flex justify-between items-center pr-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <CalendarRange size={12} /> Data Final
                    </label>
                    {(startDate || endDate) && (
                        <button onClick={clearDateFilter} className="text-[9px] font-black text-red-400 hover:text-red-500 flex items-center gap-1 uppercase">
                            <X size={10} /> Limpar Datas
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

      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0d457a] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-400" /> Valor Total Filtrado
            </p>
            <p className="text-2xl font-black tracking-tighter">{formatCurrency(totalValue)}</p>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-[9px] font-black text-white/40 uppercase">Investimento Real</span>
                <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-lg">GESA-PROD</span>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-500" /> Volume de Processos
            </p>
            <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{totalCount}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 italic">Na base de dados filtrada</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" /> Ticket Médio
            </p>
            <p className="text-3xl font-black text-[#0d457a] tracking-tighter">
                {formatCurrency(totalCount > 0 ? totalValue / totalCount : 0)}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 italic">Valor médio por SEI</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status do Relatório</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-tight">Consolidação Ativa</span>
            </div>
        </div>
      </div>

      {/* Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Distribuição por Fonte */}
         <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 print:break-inside-avoid print:shadow-none">
            <h3 className="text-xs font-black text-[#0d457a] uppercase mb-10 tracking-[0.3em] flex items-center gap-3">
                <PieIcon size={18} className="text-blue-500" /> Distribuição Financeira por Fonte
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
                            fill="#8884d8"
                        >
                             {typeDistribution.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                             ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', paddingTop: '20px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Top 5 Municípios */}
         <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 print:break-inside-avoid print:shadow-none">
             <h3 className="text-xs font-black text-[#0d457a] uppercase mb-10 tracking-[0.3em] flex items-center gap-3">
                 <Landmark size={18} className="text-emerald-500" /> Concentração de Recursos (Top 5 Municípios)
             </h3>
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMunicipalities} layout="vertical" margin={{ left: 30, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={110} 
                            tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748b'}} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" fill="#0d457a" radius={[0, 10, 10, 0]} barSize={35}>
                            {topMunicipalities.map((entry, index) => (
                                <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
         </div>

         {/* Top 5 Parlamentares */}
         <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 print:break-inside-avoid print:shadow-none">
             <h3 className="text-xs font-black text-[#0d457a] uppercase mb-10 tracking-[0.3em] flex items-center gap-3">
                 <User size={18} className="text-indigo-500" /> Alocação por Parlamentar (Top 5)
             </h3>
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topParliamentarians} layout="vertical" margin={{ left: 30, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={110} 
                            tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748b'}} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" fill="#2563eb" radius={[0, 10, 10, 0]} barSize={35}>
                            {topParliamentarians.map((entry, index) => (
                                <Cell key={`bar-dep-${index}`} fill={COLORS[(index + 3) % COLORS.length]} opacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
         </div>
      </div>

      {/* Rodapé do Relatório Informativo */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 print:hidden">
         <p className="text-[10px] text-slate-400 font-bold uppercase text-center leading-relaxed">
            Este relatório consolida os dados operacionais da GESA/SUBIPEI. Os valores refletem os registros em sistema e estão sujeitos a alterações conforme tramitação.
         </p>
      </div>
    </div>
  );
};
