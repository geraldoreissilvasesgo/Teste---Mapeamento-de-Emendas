

import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Amendment, Status, Sector, AmendmentType } from '../types';
import { FileBarChart, Printer, Filter, Calendar, TrendingUp, DollarSign, Award, Map, Building2, Landmark } from 'lucide-react';

interface ReportModuleProps {
  amendments: Amendment[];
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'];

export const ReportModule: React.FC<ReportModuleProps> = ({ amendments }) => {
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // --- Data Processing ---

  const filteredData = useMemo(() => {
    return amendments.filter(a => {
      const matchYear = a.year === yearFilter;
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      return matchYear && matchType;
    });
  }, [amendments, yearFilter, typeFilter]);

  // Financial Split for Reports
  const typeDistribution = useMemo(() => {
    return [
      { name: 'Impositivas', value: filteredData.filter(a => a.type === AmendmentType.IMPOSITIVA).reduce((acc, curr) => acc + curr.value, 0) },
      { name: 'Goiás Crescimento', value: filteredData.filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO).reduce((acc, curr) => acc + curr.value, 0) },
      { name: 'Especiais', value: filteredData.filter(a => a.type === AmendmentType.ESPECIAL).reduce((acc, curr) => acc + curr.value, 0) }
    ].filter(d => d.value > 0);
  }, [filteredData]);

  // 1. Financial Status
  const financialData = useMemo(() => {
    const data = [
      { name: 'Em Tramitação', value: 0 },
      { name: 'Aprovado/Concluído', value: 0 },
      { name: 'Em Diligência', value: 0 }
    ];

    filteredData.forEach(a => {
      // Fix: Removed non-existent `Status.APPROVED` and `Status.PAID`. `Status.CONCLUDED` covers this logic.
      if (a.status === Status.CONCLUDED) {
        data[1].value += a.value;
      } else if (a.status.includes('diligência')) {
        data[2].value += a.value;
      } else {
        data[0].value += a.value;
      }
    });

    return data;
  }, [filteredData]);

  // 2. Top Municipalities (by Value)
  const topMunicipalities = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(a => {
      groups[a.municipality] = (groups[a.municipality] || 0) + a.value;
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // 3. Top Deputies (by Value)
  const topDeputies = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(a => {
      if (a.type === AmendmentType.IMPOSITIVA && a.deputyName) {
        groups[a.deputyName] = (groups[a.deputyName] || 0) + a.value;
      }
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // 4. Time Evolution
  const evolutionData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = months.map(m => ({ name: m, count: 0, value: 0 }));
    
    filteredData.forEach(a => {
      if (a.entryDate) {
        const parts = a.entryDate.split('-');
        if(parts.length === 3) {
             const monthIndex = parseInt(parts[1]) - 1; 
             if (monthIndex >= 0 && monthIndex < 12) {
                data[monthIndex].count += 1;
                data[monthIndex].value += a.value;
             }
        }
      }
    });
    return data;
  }, [filteredData]);

  const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);
  const impositivaTotal = filteredData.filter(a => a.type === AmendmentType.IMPOSITIVA).reduce((acc, curr) => acc + curr.value, 0);
  const crescTotal = filteredData.filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO).reduce((acc, curr) => acc + curr.value, 0);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      
      {/* HEADER EXCLUSIVO PARA IMPRESSÃO */}
      <div className="hidden print:flex flex-row items-center justify-between border-b-2 border-[#0d457a] pb-4 mb-6">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#0d457a] rounded-full flex items-center justify-center text-white font-bold text-xs text-center p-1">
               Brasão GO
            </div>
            <div>
               <h1 className="text-xl font-bold text-slate-900 uppercase leading-none">Estado de Goiás</h1>
               <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Gerência de Suporte Administrativo - GESA/SUBIPEI</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-sm font-bold text-[#0d457a] uppercase">Relatório Gerencial de Emendas</p>
            <p className="text-xs text-slate-500">Gerado em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight flex items-center gap-2">
            <FileBarChart size={24} className="text-slate-400" />
            Central de Relatórios
          </h2>
          <p className="text-slate-500 text-sm">Análise de execução orçamentária segregada por fonte.</p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white text-[#0d457a] border border-[#0d457a] px-4 py-2 rounded-md hover:bg-slate-50 transition-colors shadow-sm font-bold text-xs uppercase tracking-wider"
        >
          <Printer size={16} />
          Imprimir Relatório (PDF)
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <select 
            className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none bg-white text-sm"
            value={yearFilter}
            onChange={e => setYearFilter(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none bg-white text-sm"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">Todas as Tipologias</option>
            {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Segregated KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-[#0d457a]">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Geral</p>
               <h3 className="text-xl font-bold text-[#0d457a] mt-1">{formatCurrency(totalValue)}</h3>
             </div>
             <div className="text-slate-300"><DollarSign size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emendas Impositivas</p>
               <h3 className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(impositivaTotal)}</h3>
               <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{((impositivaTotal/totalValue)*100 || 0).toFixed(1)}% do orçamento</p>
             </div>
             <div className="text-blue-100"><Landmark size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-indigo-600">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goiás Crescimento</p>
               <h3 className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(crescTotal)}</h3>
               <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{((crescTotal/totalValue)*100 || 0).toFixed(1)}% do orçamento</p>
             </div>
             <div className="text-indigo-100"><Award size={20} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
         
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 print:break-inside-avoid">
            <h3 className="text-sm font-bold text-[#0d457a] mb-6 border-b border-slate-100 pb-2 uppercase tracking-wide">Composição por Fonte</h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={typeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {typeDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.name.includes('Impositiva') ? '#2563eb' : '#4f46e5'} />
                        ))}
                     </Pie>
                     <Tooltip formatter={(value: number) => formatCurrency(value)} />
                     <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 print:break-inside-avoid">
            <h3 className="text-sm font-bold text-[#0d457a] mb-6 border-b border-slate-100 pb-2 uppercase tracking-wide flex items-center gap-2">
               <Map size={16} /> Top 5 Municípios (Volume R$)
            </h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={topMunicipalities} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                     <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: '#f1f5f9'}} />
                     <Bar dataKey="value" fill="#0d457a" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};