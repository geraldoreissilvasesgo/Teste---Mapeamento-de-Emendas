
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Amendment, StatusConfig, AmendmentType } from '../types.ts';
import { 
  Landmark, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Activity, Sparkles, Zap, ArrowRight,
  GanttChartSquare, Landmark as BankIcon, Wallet, PieChart as PieIcon,
  AlertCircle, ChevronRight, TrendingDown, ShieldCheck
} from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  statusConfigs: StatusConfig[];
  onSelectAmendment: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ amendments, statusConfigs, onSelectAmendment }) => {
  const stats = useMemo(() => {
    const total = amendments.length;
    const totalValue = amendments.reduce((acc, c) => acc + c.value, 0);
    const valueImpositiva = amendments.filter(a => a.type === AmendmentType.IMPOSITIVA).reduce((acc, c) => acc + c.value, 0);
    const valueCrescimento = amendments.filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO).reduce((acc, c) => acc + c.value, 0);
    
    const finalStatuses = statusConfigs.filter(s => s.isFinal).map(s => s.name);
    const concludedCount = amendments.filter(a => finalStatuses.includes(a.status)).length;
    const avgCompletion = concludedCount / (total || 1);
    
    const today = new Date();
    const activeProcesses = amendments.filter(a => !finalStatuses.includes(a.status));
    
    const criticalProcesses = (activeProcesses.map(a => {
      const lastMovement = a.movements[a.movements.length - 1];
      const deadline = lastMovement ? new Date(lastMovement.deadline) : null;
      
      if (!deadline) return { ...a, slaStatus: 'normal' };
      
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { ...a, slaStatus: 'delayed', diffDays };
      if (diffDays <= 2) return { ...a, slaStatus: 'critical', diffDays };
      return { ...a, slaStatus: 'normal', diffDays };
    }).filter(a => a.slaStatus !== 'normal') as (Amendment & { slaStatus: string; diffDays: number })[])
      .sort((a, b) => (a.diffDays || 0) - (b.diffDays || 0));

    return { 
      total, 
      totalValue, 
      valueImpositiva, 
      valueCrescimento, 
      avgCompletion,
      criticalCount: criticalProcesses.filter(p => p.slaStatus === 'critical').length,
      delayedCount: criticalProcesses.filter(p => p.slaStatus === 'delayed').length,
      criticalList: criticalProcesses.slice(0, 5)
    };
  }, [amendments, statusConfigs]);

  const pieData = useMemo(() => {
    const statusPool = statusConfigs.length > 0 ? statusConfigs : Array.from(new Set(amendments.map(a => a.status))).map(name => ({ name, color: '#64748b' }));
    return statusPool.map(s => ({
      name: s.name,
      value: amendments.filter(a => a.status === s.name).length,
      color: (s as any).color || '#64748b'
    })).filter(d => d.value > 0);
  }, [amendments, statusConfigs]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl lg:text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-tight">Cockpit Gerencial</h2>
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="w-10 h-1 bg-[#0d457a] rounded-full"></div> Consolidado Estratégico GESA Cloud
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 01: Impositivas */}
        <div className="group relative bg-gradient-to-br from-[#0d457a] to-[#1e5a94] p-8 rounded-[40px] shadow-2xl shadow-blue-900/20 text-white overflow-hidden transition-all hover:scale-[1.02]">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
             <Landmark size={80} />
           </div>
           <p className="text-[10px] font-black text-blue-200/60 uppercase tracking-[0.2em] mb-4">Emendas Impositivas</p>
           <h3 className="text-3xl font-black tracking-tighter mb-6">{formatBRL(stats.valueImpositiva)}</h3>
           <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/5">
             <TrendingUp size={12} className="text-emerald-400" />
             <span className="text-[9px] font-black uppercase">Consolidado Geral</span>
           </div>
        </div>

        {/* Card 02: Goiás em Crescimento */}
        <div className="group relative bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[40px] shadow-2xl shadow-emerald-900/20 text-white overflow-hidden transition-all hover:scale-[1.02]">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
             <ShieldCheck size={80} />
           </div>
           <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-[0.2em] mb-4">Goiás em Crescimento</p>
           <h3 className="text-3xl font-black tracking-tighter mb-6">{formatBRL(stats.valueCrescimento)}</h3>
           <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/5">
             <Activity size={12} className="text-emerald-300" />
             <span className="text-[9px] font-black uppercase">Fluxo Operacional</span>
           </div>
        </div>

        {/* Card 03: Conclusão */}
        <div className="group relative bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Eficiência de Ciclo</p>
            <div className="flex items-end gap-3 mb-6">
              <h3 className="text-4xl font-black text-[#0d457a] tracking-tighter">{(stats.avgCompletion * 100).toFixed(1)}%</h3>
              <p className="text-[10px] font-black text-emerald-500 uppercase mb-1.5 tracking-widest">Concluídos</p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${stats.avgCompletion * 100}%` }}></div>
            </div>
        </div>

        {/* Card 04: Monitor de SLA */}
        <div className={`group relative p-8 rounded-[40px] shadow-2xl transition-all hover:scale-[1.02] overflow-hidden ${
          stats.delayedCount > 0 
          ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-900/30' 
          : 'bg-white border border-slate-200 text-[#0d457a]'
        }`}>
            {stats.delayedCount > 0 && (
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            )}
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${stats.delayedCount > 0 ? 'text-red-100/60' : 'text-slate-400'}`}>
              Monitor de Prazos (SLA)
            </p>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-4xl font-black tracking-tighter">{stats.delayedCount}</h3>
              {stats.delayedCount > 0 
                ? <AlertTriangle size={32} className="text-white animate-bounce" /> 
                : <CheckCircle size={32} className="text-emerald-500" />
              }
            </div>
            <p className={`text-[9px] font-black uppercase tracking-widest ${stats.delayedCount > 0 ? 'text-red-100' : 'text-slate-400'}`}>
              {stats.delayedCount > 0 ? 'Processos Fora do Prazo' : 'Tudo em Conformidade'}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Seção de Processos Críticos */}
          {stats.criticalList.length > 0 && (
            <div className="bg-white p-6 lg:p-12 rounded-[48px] border border-slate-200 shadow-xl animate-in slide-in-from-top-4 duration-700">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em] flex items-center gap-4">
                  <div className="p-2 bg-red-50 rounded-xl"><AlertCircle size={20} className="text-red-500" /></div>
                  Ação Prioritária (SLA Crítico)
                </h3>
                <span className="text-[9px] font-black bg-red-600 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-200">Urgente</span>
              </div>
              
              <div className="space-y-4">
                {stats.criticalList.map((a: any) => (
                  <div 
                    key={a.id} 
                    onClick={() => onSelectAmendment(a.id)}
                    className="flex items-center justify-between p-6 bg-slate-50 hover:bg-white hover:shadow-2xl rounded-3xl border border-slate-100 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${a.slaStatus === 'delayed' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {a.slaStatus === 'delayed' ? <AlertTriangle size={22} /> : <Clock size={22} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0d457a] uppercase tracking-tighter">{a.seiNumber}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[200px] lg:max-w-[450px] mt-1">{a.object}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className={`text-[11px] font-black uppercase tracking-widest ${a.slaStatus === 'delayed' ? 'text-red-600' : 'text-amber-600'}`}>
                          {a.slaStatus === 'delayed' ? 'Atrasado' : 'Crítico'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                          {a.slaStatus === 'delayed' ? `${Math.abs(a.diffDays)} dias excedidos` : `Vence em ${a.diffDays} dias`}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-[#0d457a] group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-8 lg:p-12 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-50 rounded-2xl"><TrendingUp size={20} className="text-blue-600" /></div>
              <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em]">Concentração por Município</h3>
            </div>
            <div className="h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={amendments.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="municipality" tick={{fontSize: 8, fontWeight: '800', fill: '#0d457a'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 8, fill: '#0d457a'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#0d457a" radius={[10, 10, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 rounded-[48px] border border-slate-200 shadow-sm h-fit">
          <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <PieIcon size={18} className="text-purple-500" /> Composição de Status
          </h3>
          <div className="h-64 relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={8}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#0d457a]">{stats.total}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="flex items-center gap-3 text-[10px] font-black uppercase text-[#0d457a]">
                  <div className="w-3 h-3 rounded-full shadow-inner" style={{backgroundColor: d.color}} /> 
                  {d.name}
                </span>
                <span className="text-xs font-black text-[#0d457a]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
