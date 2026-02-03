
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
    const valueImpositiva = amendments.filter(a => a.type === AmendmentType.IMPOSITIVA).reduce((acc, c) => acc + c.value, 0);
    const valueCrescimento = amendments.filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO).reduce((acc, c) => acc + c.value, 0);
    const finalStatusNames = statusConfigs.filter(s => s.isFinal).map(s => s.name);
    const concludedCount = amendments.filter(a => finalStatusNames.includes(a.status)).length;
    const avgCompletion = concludedCount / (total || 1);
    
    return { total, totalValue, valueImpositiva, valueCrescimento, avgCompletion };
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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl lg:text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-tight">Cockpit Gerencial</h2>
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
          <div className="w-4 h-0.5 bg-[#0d457a]"></div> Consolidado SES/SUBIPEI
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-[#0d457a] p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] shadow-lg text-white">
           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Impositivas</p>
           <h3 className="text-2xl lg:text-3xl font-black tracking-tighter">{formatBRL(stats.valueImpositiva)}</h3>
        </div>

        <div className="bg-emerald-600 p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] shadow-lg text-white">
           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Goiás em Crescimento</p>
           <h3 className="text-2xl lg:text-3xl font-black tracking-tighter">{formatBRL(stats.valueCrescimento)}</h3>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-slate-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Conclusão</p>
            <h3 className="text-2xl lg:text-3xl font-black text-[#0d457a]">{(stats.avgCompletion * 100).toFixed(1)}%</h3>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500" style={{ width: `${stats.avgCompletion * 100}%` }}></div>
            </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-slate-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Investido</p>
            <h3 className="text-2xl lg:text-3xl font-black text-[#0d457a]">{formatBRL(stats.totalValue)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] border border-slate-200">
          <h3 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
            <Sparkles size={16} className="text-purple-500" /> Distribuição Regional
          </h3>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amendments.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="municipality" tick={{fontSize: 8, fontWeight: '800', fill: '#0d457a'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 8, fill: '#0d457a'}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d457a" radius={[8, 8, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] border border-slate-200">
          <h3 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest mb-8">Status Geral</h3>
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {pieData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-[9px] font-black uppercase text-[#0d457a]">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}} /> {d.name}</span>
                <span>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
