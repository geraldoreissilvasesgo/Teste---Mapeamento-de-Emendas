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
import { FileBarChart, Printer, Filter, Calendar, TrendingUp, DollarSign, Award, Map, Building2 } from 'lucide-react';

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

  // 1. Financial Status
  const financialData = useMemo(() => {
    const data = [
      { name: 'Em Tramitação', value: 0 },
      { name: 'Aprovado/Concluído', value: 0 },
      { name: 'Em Diligência', value: 0 }
    ];

    filteredData.forEach(a => {
      if (a.status === Status.CONCLUDED || a.status === Status.APPROVED || a.status === Status.PAID) {
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

  // 3. Top Deputies (by Value) - Only applies if filter is NOT Goiás Crescimento only
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

  // 4. Time Evolution (Amendments per Month)
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

  // KPIs
  const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);
  const avgValue = filteredData.length > 0 ? totalValue / filteredData.length : 0;
  const executionRate = financialData[1].value > 0 ? (financialData[1].value / totalValue) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      
      {/* HEADER EXCLUSIVO PARA IMPRESSÃO */}
      <div className="hidden print:flex flex-row items-center justify-between border-b-2 border-[#0d457a] pb-4 mb-6">
         <div className="flex items-center gap-4">
            {/* Simulação de Logo do Estado (Placeholder) */}
            <div className="w-16 h-16 bg-[#0d457a] rounded-full flex items-center justify-center text-white font-bold text-xs text-center p-1">
               Brasão GO
            </div>
            <div>
               <h1 className="text-xl font-bold text-slate-900 uppercase leading-none">Estado de Goiás</h1>
               <h2 className="text-lg font-semibold text-slate-700">Secretaria de Estado da Saúde</h2>
               <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Gerência de Suporte Administrativo - GESA/SUBIPEI</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-sm font-bold text-[#0d457a] uppercase">Relatório Gerencial de Emendas</p>
            <p className="text-xs text-slate-500">Gerado em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
            <p className="text-xs text-slate-500">Ref: {yearFilter} | {typeFilter === 'all' ? 'Todas Tipologias' : typeFilter}</p>
         </div>
      </div>

      {/* Header da Tela (Escondido na Impressão) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight flex items-center gap-2">
            <FileBarChart size={24} className="text-slate-400" />
            Central de Relatórios
          </h2>
          <p className="text-slate-500 text-sm">Inteligência de dados e análise de execução orçamentária.</p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white text-[#0d457a] border border-[#0d457a] px-4 py-2 rounded-md hover:bg-slate-50 transition-colors shadow-sm font-bold text-xs uppercase tracking-wider"
        >
          <Printer size={16} />
          Imprimir Relatório (PDF)
        </button>
      </div>

      {/* Filters (Escondido na Impressão) */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-[#0d457a] print:border print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest print:text-slate-600">Montante Filtrado</p>
               <h3 className="text-2xl font-bold text-[#0d457a] mt-1">{formatCurrency(totalValue)}</h3>
             </div>
             <div className="bg-blue-50 p-2 rounded text-[#0d457a] print:bg-transparent"><DollarSign size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 print:border print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest print:text-slate-600">Taxa de Execução</p>
               <h3 className="text-2xl font-bold text-emerald-600 mt-1">{executionRate.toFixed(1)}%</h3>
               <p className="text-xs text-slate-500 mt-1">Valores pagos/concluídos</p>
             </div>
             <div className="bg-emerald-50 p-2 rounded text-emerald-600 print:bg-transparent"><TrendingUp size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-amber-500 print:border print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest print:text-slate-600">Ticket Médio</p>
               <h3 className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(avgValue)}</h3>
               <p className="text-xs text-slate-500 mt-1">Por emenda</p>
             </div>
             <div className="bg-amber-50 p-2 rounded text-amber-600 print:bg-transparent"><Award size={20} /></div>
          </div>
        </div>
      </div>

      {/* Gráficos Area - Configurada para evitar quebras de página no meio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
         
         {/* Chart 1: Financial Status */}
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 print:break-inside-avoid print:border-slate-300 print:shadow-none">
            <h3 className="text-sm font-bold text-[#0d457a] mb-6 border-b border-slate-100 pb-2 uppercase tracking-wide">Execução Financeira</h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={financialData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {financialData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#0d457a' : index === 1 ? '#10B981' : '#F59E0B'} />
                        ))}
                     </Pie>
                     <Tooltip formatter={(value: number) => formatCurrency(value)} />
                     <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Chart 2: Top Municipalities */}
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 print:break-inside-avoid print:border-slate-300 print:shadow-none">
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

         {/* Chart 3: Monthly Evolution */}
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 print:break-inside-avoid col-span-1 lg:col-span-2 print:col-span-2 print:border-slate-300 print:shadow-none">
            <h3 className="text-sm font-bold text-[#0d457a] mb-6 border-b border-slate-100 pb-2 uppercase tracking-wide">
               Entrada de Emendas (Volume R$) - {yearFilter}
            </h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                     <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} tick={{fill: '#64748b', fontSize: 11}} />
                     <Tooltip formatter={(value: number) => formatCurrency(value)} />
                     <Line type="monotone" dataKey="value" stroke="#0d457a" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Detailed Tables Area */}
      {topDeputies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden print:break-inside-avoid print:border-slate-300 print:shadow-none">
           <div className="p-4 bg-slate-50 border-b border-slate-200 print:bg-slate-100">
              <h3 className="text-sm font-bold text-[#0d457a] uppercase tracking-wide">Ranking de Parlamentares (Top 5)</h3>
           </div>
           <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 border-b border-slate-200 print:bg-white">
                 <tr>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider w-16">Rank</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider">Parlamentar</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Valor Total Destinado</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Participação</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {topDeputies.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                       <td className="px-6 py-3 text-slate-400 font-bold">#{idx + 1}</td>
                       <td className="px-6 py-3 font-medium text-slate-800">{d.name}</td>
                       <td className="px-6 py-3 text-right font-bold text-[#0d457a] font-mono">{formatCurrency(d.value)}</td>
                       <td className="px-6 py-3 text-right text-slate-500 text-xs">
                          {((d.value / totalValue) * 100).toFixed(1)}%
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
      
      {/* Footer de Impressão */}
      <div className="hidden print:block mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500">
        <p>Documento gerado automaticamente pelo sistema Rastreio de Emendas - SES/GO.</p>
        <p>A autenticidade deste documento pode ser verificada junto à Superintendência de Orçamento e Finanças.</p>
      </div>
    </div>
  );
};