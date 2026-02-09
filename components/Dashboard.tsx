
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Amendment, StatusConfig, AmendmentType } from '../types';
import { 
  Landmark, CheckCircle, AlertTriangle, 
  TrendingUp, Activity, Search, FileSearch, 
  DollarSign, Briefcase, Target, ArrowUpRight,
  PieChart as PieIcon, BarChart3, MapPin, CheckCircle2,
  Percent
} from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  statusConfigs: StatusConfig[];
  onSelectAmendment: (id: string) => void;
}

const COLORS = ['#0d457a', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ amendments, statusConfigs, onSelectAmendment }) => {
  const [seiSearch, setSeiSearch] = useState('');

  const stats = useMemo(() => {
    const finalStatuses = statusConfigs.filter(s => s.isFinal).map(s => s.name);
    
    const getStatsByType = (type: AmendmentType) => {
      const filtered = amendments.filter(a => a.type === type);
      const totalValue = filtered.reduce((acc, c) => acc + c.value, 0);
      const concluded = filtered.filter(a => finalStatuses.includes(a.status)).length;
      return { totalValue, count: filtered.length, efficiency: filtered.length > 0 ? (concluded / filtered.length) * 100 : 0 };
    };

    // Cálculo de Efetividade Global
    const allConcluded = amendments.filter(a => finalStatuses.includes(a.status)).length;
    const globalEfficiency = amendments.length > 0 ? (allConcluded / amendments.length) * 100 : 0;

    // Dados para Gráfico de Pizza (Status)
    const statusData = amendments.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + curr.value;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

    // Dados para Top Municípios
    const cityData = amendments.reduce((acc, curr) => {
      acc[curr.municipality] = (acc[curr.municipality] || 0) + curr.value;
      return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(cityData)
      .map(([name, valor]) => ({ name, valor: Number(valor) }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    return {
      impositiva: getStatsByType(AmendmentType.IMPOSITIVA),
      crescimento: getStatsByType(AmendmentType.GOIAS_CRESCIMENTO),
      globalValue: amendments.reduce((acc, c) => acc + c.value, 0),
      globalEfficiency,
      totalConcluded: allConcluded,
      pieData,
      barData
    };
  }, [amendments, statusConfigs]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', currency: 'BRL', notation: 'compact'
  }).format(v);

  const searchedAmendment = amendments.find(a => seiSearch.length > 3 && a.seiNumber.includes(seiSearch));

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter">Cockpit GESA</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Activity size={14} className="text-blue-500"/> Gestão Estratégica de Recursos SES-GO
          </p>
        </div>
        <div className="w-full md:w-80 relative">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <input 
              type="text" 
              placeholder="LOCALIZAR PROCESSO SEI..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all"
              value={seiSearch}
              onChange={(e) => setSeiSearch(e.target.value)}
           />
        </div>
      </div>

      {searchedAmendment && (
        <div className="bg-white p-6 rounded-[32px] border-2 border-blue-500/20 shadow-xl flex justify-between items-center animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileSearch size={24}/></div>
             <div>
                <p className="text-xs font-black text-[#0d457a]">{searchedAmendment.seiNumber}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{searchedAmendment.object}</p>
             </div>
          </div>
          <button onClick={() => onSelectAmendment(searchedAmendment.id)} className="bg-[#0d457a] text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-blue-900 transition-all shadow-md">Visualizar Dossiê</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700"><TrendingUp size={100} /></div>
           <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Emendas Impositivas</p>
           <p className="text-3xl font-black text-[#0d457a]">{formatBRL(stats.impositiva.totalValue)}</p>
           <div className="mt-6">
              <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-2">
                 <span>Eficiência de Liquidação</span>
                 <span>{stats.impositiva.efficiency.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.impositiva.efficiency}%` }}></div>
              </div>
           </div>
        </div>

        <div className="bg-[#10b981] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700"><Landmark size={100} /></div>
           <p className="text-[9px] font-black text-emerald-100 uppercase mb-2 tracking-widest">Goiás em Crescimento</p>
           <p className="text-3xl font-black">{formatBRL(stats.crescimento.totalValue)}</p>
           <div className="mt-6">
              <div className="flex justify-between text-[8px] font-black uppercase text-emerald-100/60 mb-2">
                 <span>Eficiência de Liquidação</span>
                 <span>{stats.crescimento.efficiency.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${stats.crescimento.efficiency}%` }}></div>
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between group overflow-hidden relative">
           <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-[#0d457a]"><Percent size={120} /></div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Efetividade de Execução</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-[#0d457a]">{stats.globalEfficiency.toFixed(1)}%</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Concluídos</p>
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 flex items-center gap-1">
                 <CheckCircle2 size={10} className="text-emerald-500" /> {stats.totalConcluded} de {amendments.length} Processos Efetivados
              </p>
           </div>
           <div className="mt-6">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-[#0d457a] rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${stats.globalEfficiency}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Status */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-3">
                 <PieIcon size={18} className="text-blue-500" /> Ciclo de Vida (Volume)
              </h3>
              <span className="text-[8px] font-black text-slate-300 uppercase">Dados em Tempo Real</span>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={stats.pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={110}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {stats.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                       ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '15px' }}
                      itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', paddingTop: '20px' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Top 5 Municípios */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-3">
                 <MapPin size={18} className="text-emerald-500" /> Concentração Financeira (Top 5)
              </h3>
              <span className="text-[8px] font-black text-slate-300 uppercase">Valores Alocados</span>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.barData} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 9, fontWeight: '800', fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatBRL(value)}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Bar dataKey="valor" fill="#0d457a" radius={[0, 12, 12, 0]} barSize={24} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
