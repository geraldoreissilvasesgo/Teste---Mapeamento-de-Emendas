import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Amendment, StatusConfig, AmendmentType } from '../types.ts';
import { 
  Landmark, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Activity, Sparkles, Zap, ArrowRight,
  GanttChartSquare, Landmark as BankIcon, Wallet, PieChart as PieIcon,
  AlertCircle, ChevronRight, TrendingDown, ShieldCheck, Search, FileSearch, History, Timer, MapPin,
  ClipboardList, BarChart3, Briefcase, DollarSign, Target, ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  statusConfigs: StatusConfig[];
  onSelectAmendment: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ amendments, statusConfigs, onSelectAmendment }) => {
  const [seiSearch, setSeiSearch] = useState('');

  const stats = useMemo(() => {
    const finalStatuses = statusConfigs.filter(s => s.isFinal).map(s => s.name);
    const today = new Date();

    const getStatsByType = (type: AmendmentType) => {
      const filtered = amendments.filter(a => a.type === type);
      const totalValue = filtered.reduce((acc, c) => acc + c.value, 0);
      const count = filtered.length;
      const concluded = filtered.filter(a => finalStatuses.includes(a.status)).length;
      const efficiency = count > 0 ? (concluded / count) * 100 : 0;
      
      const active = filtered.filter(a => !finalStatuses.includes(a.status));
      const critical = active.filter(a => {
        const lastMov = a.movements[a.movements.length - 1];
        if (!lastMov) return false;
        const deadline = new Date(lastMov.deadline);
        return deadline < today;
      }).length;

      return { totalValue, count, efficiency, critical };
    };

    return {
      impositiva: getStatsByType(AmendmentType.IMPOSITIVA),
      crescimento: getStatsByType(AmendmentType.GOIAS_CRESCIMENTO),
      especial: getStatsByType(AmendmentType.ESPECIAL),
      globalTotal: amendments.length,
      globalValue: amendments.reduce((acc, c) => acc + c.value, 0)
    };
  }, [amendments, statusConfigs]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', currency: 'BRL', notation: 'compact'
  }).format(v);

  const formatBRLFull = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', currency: 'BRL'
  }).format(v);

  const searchedAmendment = useMemo(() => {
    if (!seiSearch || seiSearch.length < 4) return null;
    return amendments.find(a => a.seiNumber.toLowerCase().includes(seiSearch.toLowerCase()));
  }, [amendments, seiSearch]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {/* HEADER E BUSCA ESTRATÉGICA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-tight">Cockpit Analítico GESA</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
            <Activity size={14} className="text-blue-500"/> Gestão Dual de Recursos • v2.9
          </p>
        </div>
        <div className="w-full md:w-96 relative group">
           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-300 group-focus-within:text-[#0d457a] transition-colors" />
           </div>
           <input 
              type="text" 
              placeholder="LOCALIZAR PROCESSO SEI..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 ring-blue-500/5 focus:border-[#0d457a] font-black text-[11px] uppercase tracking-widest text-[#0d457a] transition-all"
              value={seiSearch}
              onChange={(e) => setSeiSearch(e.target.value)}
           />
        </div>
      </div>

      {searchedAmendment && (
        <div className="bg-white p-8 rounded-[48px] border-2 border-blue-500/20 shadow-2xl animate-in slide-in-from-top-4 duration-500 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <FileSearch size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{searchedAmendment.type}</p>
               <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">{searchedAmendment.seiNumber}</h3>
               <p className="text-xs font-bold text-slate-400 uppercase truncate max-w-md">{searchedAmendment.object}</p>
            </div>
          </div>
          <button 
            onClick={() => onSelectAmendment(searchedAmendment.id)}
            className="bg-[#0d457a] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3"
          >
            Abrir Dossiê <ArrowUpRight size={18} />
          </button>
        </div>
      )}

      {/* HUB 1: EMENDAS IMPOSITIVAS (AZUL) */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-px flex-1 bg-blue-100"></div>
           <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] flex items-center gap-3">
              <Landmark size={18} /> Emendas Impositivas
           </h3>
           <div className="h-px flex-1 bg-blue-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-blue-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><DollarSign size={100} /></div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Volume Financeiro</p>
            <p className="text-3xl font-black text-[#0d457a]">{formatBRLFull(stats.impositiva.totalValue)}</p>
            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">{( (stats.impositiva.totalValue / (stats.globalValue || 1)) * 100 ).toFixed(1)}% do Orçamento</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-blue-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Briefcase size={100} /></div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Processos Ativos</p>
            <p className="text-3xl font-black text-[#0d457a]">{stats.impositiva.count}</p>
            <p className="text-[10px] font-bold text-slate-300 mt-4 uppercase">Demanda Parlamentar</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-blue-100 shadow-sm flex flex-col justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Eficiência de Ciclo</p>
            <div className="flex items-center justify-between mb-2">
               <span className="text-2xl font-black text-[#0d457a]">{stats.impositiva.efficiency.toFixed(1)}%</span>
               <Target size={20} className="text-blue-500" />
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500" style={{ width: `${stats.impositiva.efficiency}%` }}></div>
            </div>
          </div>

          <div className={`p-8 rounded-[40px] border flex flex-col justify-between transition-all ${stats.impositiva.critical > 0 ? 'bg-red-50 border-red-200 shadow-lg shadow-red-900/5' : 'bg-white border-blue-100'}`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alertas de SLA</p>
            <div className="flex items-center justify-between mt-4">
               <h4 className={`text-4xl font-black ${stats.impositiva.critical > 0 ? 'text-red-600' : 'text-emerald-500'}`}>
                {stats.impositiva.critical}
               </h4>
               {stats.impositiva.critical > 0 ? <AlertTriangle className="text-red-500 animate-bounce" size={32} /> : <CheckCircle className="text-emerald-500" size={32} />}
            </div>
            <p className={`text-[8px] font-black uppercase mt-4 ${stats.impositiva.critical > 0 ? 'text-red-400' : 'text-slate-300'}`}>
               {stats.impositiva.critical > 0 ? 'Trâmites com prazo expirado' : 'Fluxo em conformidade'}
            </p>
          </div>
        </div>
      </div>

      {/* HUB 2: GOIÁS EM CRESCIMENTO (ESMERALDA) */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-px flex-1 bg-emerald-100"></div>
           <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] flex items-center gap-3">
              <TrendingUp size={18} /> Goiás em Crescimento
           </h3>
           <div className="h-px flex-1 bg-emerald-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={100} /></div>
            <p className="text-[9px] font-black text-emerald-100/60 uppercase mb-2 tracking-widest">Investimento Total</p>
            <p className="text-3xl font-black">{formatBRLFull(stats.crescimento.totalValue)}</p>
            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-bold text-emerald-100 bg-white/10 px-2 py-1 rounded-lg">Fomento Estruturante Ativo</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Activity size={100} /></div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Demandas Técnicas</p>
            <p className="text-3xl font-black text-emerald-700">{stats.crescimento.count}</p>
            <p className="text-[10px] font-bold text-slate-300 mt-4 uppercase">Unidades de Execução</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-emerald-100 shadow-sm flex flex-col justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Maturidade de Entrega</p>
            <div className="flex items-center justify-between mb-2">
               <span className="text-2xl font-black text-emerald-700">{stats.crescimento.efficiency.toFixed(1)}%</span>
               <ShieldCheck size={20} className="text-emerald-500" />
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500" style={{ width: `${stats.crescimento.efficiency}%` }}></div>
            </div>
          </div>

          <div className={`p-8 rounded-[40px] border flex flex-col justify-between transition-all ${stats.crescimento.critical > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-emerald-100'}`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alerta de Gestão</p>
            <div className="flex items-center justify-between mt-4">
               <h4 className={`text-4xl font-black ${stats.crescimento.critical > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>
                {stats.crescimento.critical}
               </h4>
               {stats.crescimento.critical > 0 ? <Timer className="text-amber-500 animate-pulse" size={32} /> : <CheckCircle className="text-emerald-500" size={32} />}
            </div>
            <p className={`text-[8px] font-black uppercase mt-4 ${stats.crescimento.critical > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
               {stats.crescimento.critical > 0 ? 'Exige intervenção na unidade' : 'Cronograma preservado'}
            </p>
          </div>
        </div>
      </div>

      {/* COMPARAÇÃO GLOBAL E MIX DE PORTFÓLIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
           <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <BarChart3 size={18} className="text-blue-500" /> Distribuição de Peso Orçamentário
           </h3>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={[
                    { name: 'Impositivas', valor: stats.impositiva.totalValue },
                    { name: 'Crescimento', valor: stats.crescimento.totalValue },
                    { name: 'Especiais', valor: stats.especial.totalValue }
                   ]}
                 >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: '800', fill: '#0d457a'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 9, fill: '#0d457a'}} axisLine={false} tickLine={false} tickFormatter={(v) => formatBRL(v)} />
                    <Tooltip 
                      formatter={(v: number) => formatBRLFull(v)}
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="valor" radius={[12, 12, 0, 0]} barSize={60}>
                       <Cell fill="#0d457a" />
                       <Cell fill="#10b981" />
                       <Cell fill="#8b5cf6" />
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
          <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
             <PieIcon size={18} className="text-purple-500" /> Mix de Processos (%)
          </h3>
          <div className="h-64 relative mb-6">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie 
                    data={[
                      { name: 'Impositivas', value: stats.impositiva.count },
                      { name: 'Crescimento', value: stats.crescimento.count },
                      { name: 'Especiais', value: stats.especial.count }
                    ]}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={5}
                   >
                      <Cell fill="#0d457a" />
                      <Cell fill="#10b981" />
                      <Cell fill="#8b5cf6" />
                   </Pie>
                   <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-[#0d457a]">{stats.globalTotal}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
             </div>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-blue-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-700"></div> Impositivas</span>
                <span className="text-slate-400">{stats.impositiva.count} UN</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-emerald-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-600"></div> Crescimento</span>
                <span className="text-slate-400">{stats.crescimento.count} UN</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
