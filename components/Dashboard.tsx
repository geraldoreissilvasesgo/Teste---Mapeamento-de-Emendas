
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Amendment, Status, AmendmentType } from '../types';
import { 
  Landmark, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Activity, Sparkles, Zap, ArrowRight,
  GanttChartSquare, Landmark as BankIcon, Wallet, PieChart as PieIcon
} from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  onSelectAmendment: (id: string) => void;
}

const COLORS = ['#0d457a', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ amendments, onSelectAmendment }) => {
  const stats = useMemo(() => {
    const total = amendments.length;
    const totalValue = amendments.reduce((acc, c) => acc + c.value, 0);
    
    // Separação de saldos por tipo
    const valueImpositiva = amendments
      .filter(a => a.type === AmendmentType.IMPOSITIVA)
      .reduce((acc, c) => acc + c.value, 0);
      
    const valueCrescimento = amendments
      .filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO)
      .reduce((acc, c) => acc + c.value, 0);

    const avgCompletion = amendments.filter(a => a.status === Status.CONCLUDED).length / (total || 1);
    const pendingSutis = amendments.filter(a => a.sutis).length;
    
    return { 
      total, 
      totalValue, 
      valueImpositiva, 
      valueCrescimento, 
      avgCompletion, 
      pendingSutis 
    };
  }, [amendments]);

  const pieData = useMemo(() => {
    return Object.values(Status).map(s => ({
      name: s,
      value: amendments.filter(a => a.status === s).length
    })).filter(d => d.value > 0);
  }, [amendments]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Painel de Execução</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#0d457a]"></div> Consolidação Financeira por Fonte de Recurso
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase">Integridade SEI: 100%</span>
          </div>
        </div>
      </div>

      {/* Grid de Saldos Segregados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Impositiva */}
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

        {/* Card Goiás Crescimento */}
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

        {/* Card Taxa de Liquidação */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" /> Índice de Pagamento
            </p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{(stats.avgCompletion * 100).toFixed(1)}%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.avgCompletion * 100}%` }}></div>
            </div>
        </div>

        {/* Card Volume Total */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Wallet size={16} className="text-purple-500" /> Montante Consolidado
            </p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{formatBRL(stats.totalValue)}</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{stats.total} Processos Ativos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Distribuição por Município */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <Sparkles size={18} className="text-purple-500" /> Concentração Regional de Investimentos
            </h3>
            <div className="flex gap-2">
               <div className="w-3 h-3 bg-[#0d457a] rounded-sm"></div>
               <span className="text-[9px] font-black uppercase text-slate-400">R$ Alocado</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amendments.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="municipality" tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900' }} 
                  formatter={(v: number) => formatBRL(v)}
                />
                <Bar dataKey="value" fill="#0d457a" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Status */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-3">
             <PieIcon size={18} className="text-[#0d457a]" /> Ciclo de Vida do Processo
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
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={4} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <p className="text-[9px] font-black text-slate-400 uppercase">Processos</p>
               <p className="text-2xl font-black text-[#0d457a]">{stats.total}</p>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}} /> {d.name}</span>
                <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recomendações de IA */}
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <Zap size={18} className="text-amber-500" /> Diligências Críticas Detectadas
          </h3>
          <span className="text-[9px] font-black text-[#0d457a] bg-blue-50 px-3 py-1 rounded-full uppercase">Alerta Preditivo GESA</span>
        </div>
        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
          {amendments.filter(a => a.status === Status.DILIGENCE).length > 0 ? (
            amendments.filter(a => a.status === Status.DILIGENCE).map(a => (
              <div key={a.id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><AlertTriangle size={24} /></div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{a.seiNumber}</p>
                       <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${a.type === AmendmentType.IMPOSITIVA ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {a.type}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-lg">{a.object}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectAmendment(a.id)}
                  className="flex items-center gap-2 bg-[#0d457a] text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                >
                  Ver Trâmite <ArrowRight size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
               Nenhuma diligência crítica pendente no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
