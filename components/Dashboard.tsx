
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Amendment, StatusConfig, AmendmentType } from '../types';
import { 
  Landmark, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Activity, Sparkles, Zap, ArrowRight,
  GanttChartSquare, Landmark as BankIcon, Wallet, PieChart as PieIcon
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
    
    const valueImpositiva = amendments
      .filter(a => a.type === AmendmentType.IMPOSITIVA)
      .reduce((acc, c) => acc + c.value, 0);
      
    const valueCrescimento = amendments
      .filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO)
      .reduce((acc, c) => acc + c.value, 0);

    // Calcula conclusão baseado na flag isFinal dos status dinâmicos
    const finalStatusNames = statusConfigs.filter(s => s.isFinal).map(s => s.name);
    const concludedCount = amendments.filter(a => finalStatusNames.includes(a.status)).length;
    const avgCompletion = concludedCount / (total || 1);
    
    return { 
      total, 
      totalValue, 
      valueImpositiva, 
      valueCrescimento, 
      avgCompletion 
    };
  }, [amendments, statusConfigs]);

  const pieData = useMemo(() => {
    // Se não houver status cadastrados, usa os nomes presentes nas emendas
    const statusPool = statusConfigs.length > 0 
      ? statusConfigs 
      : Array.from(new Set(amendments.map(a => a.status))).map(name => ({ name, color: '#64748b' }));

    return statusPool.map(s => ({
      name: s.name,
      value: amendments.filter(a => a.status === s.name).length,
      color: (s as any).color || '#64748b'
    })).filter(d => d.value > 0);
  }, [amendments, statusConfigs]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Cockpit Gerencial</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#0d457a]"></div> Consolidação Financeira por Status Dinâmico
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase">Monitoramento Ativo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0d457a] p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
           <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
             <BankIcon size={12} className="text-blue-300" /> Saldo Impositivas
           </p>
           <h3 className="text-3xl font-black tracking-tighter">{formatBRL(stats.valueImpositiva)}</h3>
           <div className="mt-6 flex justify-between items-center text-[9px] font-black uppercase text-white/40 border-t border-white/10 pt-4">
              <span>Fonte: Tesouro Estadual</span>
              <span className="text-blue-300">ALEGO</span>
           </div>
        </div>

        <div className="bg-emerald-600 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
           <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
             <TrendingUp size={12} className="text-emerald-300" /> Goiás em Crescimento
           </p>
           <h3 className="text-3xl font-black tracking-tighter">{formatBRL(stats.valueCrescimento)}</h3>
           <div className="mt-6 flex justify-between items-center text-[9px] font-black uppercase text-white/40 border-t border-white/10 pt-4">
              <span>Plan. Estratégico</span>
              <span className="text-emerald-200">PROJETO</span>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" /> Índice de Conclusão
            </p>
            <h3 className="text-3xl font-black text-[#0d457a] tracking-tighter">{(stats.avgCompletion * 100).toFixed(1)}%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.avgCompletion * 100}%` }}></div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Wallet size={16} className="text-purple-500" /> Valor Consolidado
            </p>
            <h3 className="text-3xl font-black text-[#0d457a] tracking-tighter">{formatBRL(stats.totalValue)}</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{stats.total} Processos Registrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
              <Sparkles size={18} className="text-purple-500" /> Distribuição Regional de Investimentos
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amendments.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="municipality" tick={{fontSize: 9, fontWeight: '900', fill: '#0d457a'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 9, fill: '#0d457a'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900', color: '#0d457a' }} 
                  formatter={(v: number) => formatBRL(v)}
                />
                <Bar dataKey="value" fill="#0d457a" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-widest mb-10 flex items-center gap-3">
             <PieIcon size={18} className="text-[#0d457a]" /> Estados dos Processos
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={95} 
                  dataKey="value"
                  paddingAngle={5}
                >
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="white" strokeWidth={4} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <p className="text-[9px] font-black text-slate-400 uppercase">Total</p>
               <p className="text-2xl font-black text-[#0d457a]">{stats.total}</p>
            </div>
          </div>
          <div className="mt-8 space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight text-[#0d457a]">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}} /> {d.name}</span>
                <span className="text-[#0d457a] bg-slate-50 px-2 py-0.5 rounded-lg">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
