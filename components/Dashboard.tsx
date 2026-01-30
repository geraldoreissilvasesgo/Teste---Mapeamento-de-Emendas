
/**
 * COMPONENTE DASHBOARD - FOCO EM NEGÓCIO
 * 
 * Otimizado com:
 * 1. Debounced Search para controle de carga.
 * 2. KPIs de Processos e Orçamento.
 * 3. Renderização condicional eficiente.
 */
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Amendment, Status, Sector, AmendmentType, SystemMode } from '../types';
import { 
  TrendingUp, Clock, FileCheck, AlertCircle, Building2, CheckCircle, 
  Zap, Landmark, Award, Info, Search, FileSearch, X, ArrowRightLeft, 
  History, MapPin, User, LogIn, LogOut, Timer, ChevronRight, Activity, Cpu, Database
} from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  systemMode: SystemMode;
  onSelectAmendment: (id: string) => void;
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export const Dashboard: React.FC<DashboardProps> = ({ amendments, systemMode, onSelectAmendment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [searchResult, setSearchResult] = useState<Amendment | null>(null);

  // --- CONTROLE DE CARGA: DEBOUNCE NA BUSCA ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 400); // 400ms de atraso para evitar processamento a cada tecla
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm.length > 3) {
      const found = amendments.find(a => 
        a.seiNumber.includes(debouncedTerm) || 
        a.id === debouncedTerm || 
        a.code === debouncedTerm
      );
      setSearchResult(found || null);
    } else {
      setSearchResult(null);
    }
  }, [debouncedTerm, amendments]);

  // Estatísticas e Performance Memoizadas
  const stats = useMemo(() => {
    const total = amendments.length;
    const inProgress = amendments.filter(a => a.status === Status.IN_PROGRESS).length;
    const concluded = amendments.filter(a => a.status === Status.CONCLUDED).length;
    const diligence = amendments.filter(a => a.status === Status.DILIGENCE).length;
    const totalValue = amendments.reduce((acc, curr) => acc + curr.value, 0);

    return { total, inProgress, concluded, diligence, totalValue };
  }, [amendments]);

  const statusData = useMemo(() => {
    return Object.values(Status).map(status => ({
      name: status,
      value: amendments.filter(a => a.status === status).length
    })).filter(d => d.value > 0);
  }, [amendments]);

  const municipalityData = useMemo(() => {
    const data: Record<string, number> = {};
    amendments.forEach(a => {
      data[a.municipality] = (data[a.municipality] || 0) + a.value;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Aumentado para Top 10 para melhor visualização do ranking
  }, [amendments]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const StatCard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex items-center gap-6 group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
      <div className={`p-5 rounded-2xl ${colorClass} text-white shadow-lg group-hover:scale-110 transition-transform relative z-10`}>
        <Icon size={28} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-[#0d457a] tracking-tighter leading-none">{value}</h3>
        {trend && <span className="text-[9px] font-bold text-emerald-500 uppercase mt-2 block">↑ {trend} Crescimento</span>}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Cookpit Gerencial GESA</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Visão consolidada de processos e recursos</p>
        </div>
        
        <div className="w-full lg:w-auto relative group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0d457a] transition-colors" size={20} />
           <input 
              type="text" 
              placeholder="Rastreio Inteligente (Nº SEI)..." 
              className="w-full lg:w-96 pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-[#0d457a]/10 outline-none transition-all font-black text-xs uppercase text-[#0d457a] placeholder:text-slate-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           {searchTerm && !searchResult && debouncedTerm === searchTerm && (
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase animate-pulse">Consultando...</span>
           )}
        </div>
      </div>

      {searchResult && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-top-10 duration-500">
           <div className="bg-[#0d457a] p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <History size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Status de Tramitação em Tempo Real</h3>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Protocolo Identificado: {searchResult.seiNumber}</p>
                 </div>
              </div>
              <button onClick={() => setSearchTerm('')} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                 <X size={24} />
              </button>
           </div>
           
           <div className="p-10">
              <div className="flex flex-col lg:flex-row gap-12">
                 <div className="lg:w-1/3 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Objeto Protocolado</span>
                       <p className="text-sm font-black text-[#0d457a] uppercase leading-tight">{searchResult.object}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Status Ativo</span>
                          <span className="text-xs font-black text-emerald-600 uppercase">{searchResult.status}</span>
                       </div>
                       <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1">Dotação</span>
                          <span className="text-xs font-black text-blue-700">R$ {searchResult.value.toLocaleString('pt-BR')}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => onSelectAmendment(searchResult.id)}
                      className="w-full flex items-center justify-center gap-3 bg-[#0d457a] text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#0a365f] transition-all shadow-lg"
                    >
                       Detalhamento Estratégico <ChevronRight size={16}/>
                    </button>
                 </div>
                 
                 <div className="flex-1 overflow-x-auto">
                    <div className="relative pt-4 pl-12 space-y-8 before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100">
                       {searchResult.movements.map((m, idx) => (
                          <div key={m.id} className="relative">
                             <div className={`absolute -left-[44px] top-1.5 w-7 h-7 rounded-full border-4 border-white shadow-md z-10 ${idx === searchResult.movements.length - 1 ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-100' : 'bg-slate-200'}`} />
                             <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                         <Building2 size={20} />
                                      </div>
                                      <div>
                                         <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-tight">{m.toSector}</h4>
                                         <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Resp: {m.handledBy}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase">
                                      <div className="text-right">
                                         <span className="text-slate-300 block mb-1">Entrada</span>
                                         <span>{new Date(m.dateIn).toLocaleDateString()}</span>
                                      </div>
                                      <div className="bg-blue-50 px-3 py-2 rounded-xl text-blue-600">
                                         <span className="text-blue-300 block mb-1">SLA</span>
                                         <span>{m.daysSpent || 0}d</span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       )).reverse()}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Volume Financeiro" value={`R$ ${(stats.totalValue / 1000000).toFixed(1)}M`} icon={Landmark} colorClass="bg-emerald-500" trend="12.4%" />
        <StatCard title="Em Tramitação" value={stats.inProgress} icon={FileSearch} colorClass="bg-blue-600" />
        <StatCard title="Liquidados / Pagos" value={stats.concluded} icon={CheckCircle} colorClass="bg-indigo-500" />
        <StatCard title="Diligências" value={stats.diligence} icon={AlertCircle} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-10 rounded-[40px] shadow-sm border border-slate-200">
           <h3 className="text-xs font-black text-[#0d457a] uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
             <Award size={18} className="text-indigo-500"/> Pipeline de Status
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-[#0d457a] uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
             <MapPin size={18} className="text-emerald-500"/> Ranking por Município
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={municipalityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'black', textTransform: 'uppercase'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'black'}} tickFormatter={(val) => formatCurrency(val)} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} 
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Bar dataKey="value" fill="#0d457a" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
