import React, { useMemo } from 'react';
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
import { TrendingUp, Clock, FileCheck, AlertCircle, Building2, CheckCircle, Zap, Landmark, Award, Info } from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  systemMode: SystemMode;
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#4f46e5'];

export const Dashboard: React.FC<DashboardProps> = ({ amendments, systemMode }) => {
  const stats = useMemo(() => {
    const totalValue = amendments.reduce((acc, curr) => acc + curr.value, 0);
    
    const impositivaValue = amendments
      .filter(a => a.type === AmendmentType.IMPOSITIVA)
      .reduce((acc, curr) => acc + curr.value, 0);
    
    const goiasCrescimentoValue = amendments
      .filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO)
      .reduce((acc, curr) => acc + curr.value, 0);

    const totalCount = amendments.length;
    const approvedCount = amendments.filter(a => a.status === Status.CONCLUDED || a.status === Status.PAID).length;
    const processingCount = amendments.filter(a => a.status === Status.PROCESSING || a.status === Status.DILIGENCE).length;
    
    const statusData = Object.values(Status).map(status => ({
      name: status,
      count: amendments.filter(a => a.status === status).length
    })).filter(d => d.count > 0);

    const sectorData = Object.values(Sector).map(sector => ({
      name: sector.split(' ')[0], 
      count: amendments.filter(a => a.currentSector === sector).length
    })).filter(d => d.count > 0);

    const today = new Date();
    const overdueCount = amendments.filter(a => {
      if (a.status === Status.CONCLUDED || a.status === Status.PAID) return false;
      const lastMovement = a.movements[a.movements.length - 1];
      return lastMovement && new Date(lastMovement.deadline) < today;
    }).length;

    return { totalValue, impositivaValue, goiasCrescimentoValue, totalCount, approvedCount, processingCount, statusData, sectorData, overdueCount };
  }, [amendments]);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtext, alert }: any) => (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-shadow ${alert ? 'ring-2 ring-red-500/20 bg-red-50/10' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest truncate">{title}</p>
        <h3 className={`text-xl lg:text-2xl font-black truncate ${alert ? 'text-red-600' : 'text-[#0d457a]'}`}>{value}</h3>
        {subtext && <p className={`text-[10px] mt-2 font-black uppercase tracking-tight ${alert ? 'text-red-500' : 'text-emerald-600'}`}>{subtext}</p>}
      </div>
      <div className={`p-3 rounded-2xl shadow-lg shrink-0 ml-4 ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Cockpit Gerencial</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Métricas de Performance e Finanças GESA/SUBIPEI</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] text-[#0d457a] bg-white px-4 py-2 rounded-xl border border-slate-200 uppercase font-black tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Versão 2.7
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Consolidado" 
          value={`R$ ${stats.totalValue.toLocaleString('pt-BR')}`} 
          icon={TrendingUp} 
          colorClass="bg-[#0d457a]" 
          subtext={`${stats.totalCount} processos totais`}
        />
        <StatCard 
          title="Emendas Impositivas" 
          value={`R$ ${stats.impositivaValue.toLocaleString('pt-BR')}`} 
          icon={Landmark} 
          colorClass="bg-blue-600" 
          subtext="Recursos ALEGO"
        />
        <StatCard 
          title="Goiás em Crescimento" 
          value={`R$ ${stats.goiasCrescimentoValue.toLocaleString('pt-BR')}`} 
          icon={Award} 
          colorClass="bg-indigo-600" 
          subtext="Recursos do Executivo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Eficiência (Pagos)" 
          value={`${stats.approvedCount}`} 
          icon={CheckCircle} 
          colorClass="bg-emerald-500"
          subtext={`${((stats.approvedCount/stats.totalCount)*100 || 0).toFixed(1)}% de liquidação`} 
        />
        <StatCard 
          title="Em Tramitação" 
          value={stats.processingCount} 
          icon={Clock} 
          colorClass="bg-amber-500" 
        />
        <StatCard 
          title="Atrasados (Fora SLA)" 
          value={stats.overdueCount} 
          icon={AlertCircle} 
          colorClass="bg-red-500" 
          alert={stats.overdueCount > 0}
          subtext={stats.overdueCount > 0 ? "Ação imediata requerida" : "Fluxo em conformidade"}
        />
        <div className="bg-[#0d457a] p-6 rounded-3xl shadow-lg flex flex-col justify-center text-white">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Distribuição de Custo</p>
            <div className="flex items-end gap-1">
                <span className="text-2xl font-black">
                    {stats.totalValue > 0 ? ((stats.impositivaValue/stats.totalValue)*100).toFixed(0) : 0}%
                </span>
                <span className="text-[10px] font-bold uppercase mb-1.5 opacity-70">Impositivas</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full mt-2">
                <div 
                  className="h-full bg-blue-400 rounded-full" 
                  style={{ width: `${(stats.impositivaValue/stats.totalValue)*100 || 0}%` }}
                ></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-[#0d457a] mb-8 border-b border-slate-100 pb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap size={16} className="text-amber-500"/> Ciclo de Vida dos Processos
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="count"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontFamily: 'Inter', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-[#0d457a] mb-8 border-b border-slate-100 pb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Building2 size={16} className="text-blue-500"/> Volume por Departamento Técnico
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sectorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#0d457a" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
