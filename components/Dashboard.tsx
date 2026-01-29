
/**
 * COMPONENTE DASHBOARD
 * 
 * Este componente é a tela principal do sistema, o "Cockpit Gerencial". Ele exibe
 * uma visão consolidada e visual dos dados mais importantes, incluindo agora
 * a funcionalidade de rastreio com timeline.
 */
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
  Cell
} from 'recharts';
import { Amendment, Status, Sector, AmendmentType, SystemMode } from '../types';
import { 
  TrendingUp, Clock, FileCheck, AlertCircle, Building2, CheckCircle, 
  Zap, Landmark, Award, Info, Search, FileSearch, X, ArrowRightLeft, 
  History, MapPin, User, LogIn, LogOut, Timer, ChevronRight
} from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  systemMode: SystemMode;
  onSelectAmendment: (id: string) => void;
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export const Dashboard: React.FC<DashboardProps> = ({ amendments, systemMode, onSelectAmendment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<Amendment | null>(null);

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    const total = amendments.length;
    const inProgress = amendments.filter(a => a.status === Status.IN_PROGRESS).length;
    const concluded = amendments.filter(a => a.status === Status.CONCLUDED).length;
    const diligence = amendments.filter(a => a.status === Status.DILIGENCE).length;
    const totalValue = amendments.reduce((acc, curr) => acc + curr.value, 0);

    return { total, inProgress, concluded, diligence, totalValue };
  }, [amendments]);

  // Gráfico: Volume por Status
  const statusData = useMemo(() => {
    return Object.values(Status).map(status => ({
      name: status,
      value: amendments.filter(a => a.status === status).length
    })).filter(d => d.value > 0);
  }, [amendments]);

  // Gráfico: Top 5 Municípios por Valor
  const municipalityData = useMemo(() => {
    const data: Record<string, number> = {};
    amendments.forEach(a => {
      data[a.municipality] = (data[a.municipality] || 0) + a.value;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [amendments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = amendments.find(a => 
      a.seiNumber.includes(searchTerm) || 
      a.id === searchTerm || 
      a.code === searchTerm
    );
    setSearchResult(found || null);
    if (!found && searchTerm) alert("Processo não localizado na base de dados ativa.");
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
      <div className={`p-5 rounded-2xl ${colorClass} text-white shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-[#0d457a] tracking-tighter leading-none">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header com Busca de Rastreio */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Visão Consolidada GESA</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500"/> Performance e Rastreabilidade do Estado de Goiás
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full lg:w-auto relative group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0d457a] transition-colors" size={20} />
           <input 
              type="text" 
              placeholder="Rastrear Processo SEI..." 
              className="w-full lg:w-96 pl-14 pr-32 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-[#0d457a]/10 outline-none transition-all font-black text-xs uppercase text-[#0d457a] placeholder:text-slate-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0d457a] text-white px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:bg-[#0a365f] transition-all">
              Consultar
           </button>
        </form>
      </div>

      {/* Timeline de Rastreio (Aparece ao buscar) */}
      {searchResult && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-top-10 duration-500">
           <div className="bg-[#0d457a] p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <History size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Linha do Tempo de Tramitação</h3>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Histórico de Movimentações SEI: {searchResult.seiNumber}</p>
                 </div>
              </div>
              <button onClick={() => setSearchResult(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                 <X size={24} />
              </button>
           </div>
           
           <div className="p-10">
              <div className="flex flex-col lg:flex-row gap-12">
                 <div className="lg:w-1/3 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Objeto do Processo</span>
                       <p className="text-sm font-black text-[#0d457a] uppercase leading-tight">{searchResult.object}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status Atual</span>
                          <span className="text-xs font-black text-blue-600 uppercase">{searchResult.status}</span>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Valor do SEI</span>
                          <span className="text-xs font-black text-[#0d457a]">R$ {searchResult.value.toLocaleString('pt-BR')}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => onSelectAmendment(searchResult.id)}
                      className="w-full flex items-center justify-center gap-3 bg-[#0d457a] text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#0a365f] transition-all shadow-lg"
                    >
                       Acessar Detalhamento Completo <ChevronRight size={16}/>
                    </button>
                 </div>
                 
                 <div className="flex-1 overflow-x-auto">
                    <div className="relative pt-4 pl-12 space-y-8 before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100">
                       {searchResult.movements.map((m, idx) => (
                          <div key={m.id} className="relative">
                             <div className={`absolute -left-[44px] top-1.5 w-7 h-7 rounded-full border-4 border-white shadow-md z-10 ${idx === searchResult.movements.length - 1 ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-100' : 'bg-slate-200'}`} />
                             <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                         <Building2 size={20} />
                                      </div>
                                      <div>
                                         <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-tight">{m.toSector}</h4>
                                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Responsável: {m.handledBy}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-6">
                                      <div className="text-right">
                                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Entrada</span>
                                         <span className="text-[11px] font-bold text-slate-600">{new Date(m.dateIn).toLocaleDateString('pt-BR')} {new Date(m.dateIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                      </div>
                                      <div className="text-right">
                                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Saída</span>
                                         <span className="text-[11px] font-bold text-slate-600">{m.dateOut ? new Date(m.dateOut).toLocaleDateString('pt-BR') : 'Aguardando'}</span>
                                      </div>
                                      <div className="bg-blue-50 px-3 py-2 rounded-xl text-center min-w-[60px]">
                                         <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block">Permanência</span>
                                         <span className="text-xs font-black text-blue-600">{m.daysSpent || 0}d</span>
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

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Valor Global SEI" value={`R$ ${(stats.totalValue / 1000000).toFixed(1)}M`} icon={Landmark} colorClass="bg-emerald-500" />
        <StatCard title="Processos Ativos" value={stats.inProgress} icon={FileSearch} colorClass="bg-blue-600" />
        <StatCard title="Liquidado / Pago" value={stats.concluded} icon={CheckCircle} colorClass="bg-indigo-500" />
        <StatCard title="Aguardando Diligência" value={stats.diligence} icon={AlertCircle} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Distribuição por Status */}
        <div className="lg:col-span-1 bg-white p-10 rounded-[40px] shadow-sm border border-slate-200">
           <h3 className="text-xs font-black text-[#0d457a] uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
             <Award size={18} className="text-indigo-500"/> Ciclo de Vida do Processo
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Top 5 Municípios por Investimento */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-[#0d457a] uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
             <MapPin size={18} className="text-emerald-500"/> Concentração Geográfica (R$)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={municipalityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'black', textTransform: 'uppercase'}} 
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'black'}} 
                    tickFormatter={(val) => `R$ ${val / 1000}k`}
                />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(val: number) => `R$ ${val.toLocaleString('pt-BR')}`}
                />
                <Bar dataKey="value" fill="#0d457a" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista de Alertas de Prazo */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
           <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.3em] flex items-center gap-3">
             <Timer size={18} className="text-red-500"/> Alertas de SLA Próximos do Vencimento
           </h3>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoramento Ativo</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nº SEI</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Localização Atual</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {amendments.filter(a => a.status === Status.IN_PROGRESS).slice(0, 5).map(a => {
                const lastMove = a.movements[a.movements.length - 1];
                const isOverdue = new Date(lastMove?.deadline) < new Date();
                return (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => onSelectAmendment(a.id)}>
                    <td className="px-8 py-5">
                       <span className="text-xs font-black text-[#0d457a] group-hover:text-blue-600 transition-colors">{a.seiNumber}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-[11px] font-bold text-slate-600 uppercase">{a.currentSector}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-[11px] font-mono text-slate-500">{new Date(lastMove?.deadline).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isOverdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                         {isOverdue ? 'Em Atraso' : 'Dentro do Prazo'}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
