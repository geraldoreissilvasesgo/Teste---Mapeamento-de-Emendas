

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
import { TrendingUp, Clock, FileCheck, AlertCircle, Building2, CheckCircle, Zap, Landmark, Award, Info, Search, FileSearch, X } from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
  systemMode: SystemMode;
  onSelectAmendment: (id: string) => void;
}

const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#4f46e5'];

export const Dashboard: React.FC<DashboardProps> = ({ amendments, systemMode, onSelectAmendment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Amendment[]>([]);
  const [inspectedAmendment, setInspectedAmendment] = useState<Amendment | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim().length > 2) {
      const results = amendments.filter(a => 
        a.seiNumber.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results.slice(0, 5)); // Limita a 5 resultados
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (amendment: Amendment) => {
    setInspectedAmendment(amendment);
    setSearchTerm('');
    setSearchResults([]);
  };

  const stats = useMemo(() => {
    const totalValue = amendments.reduce((acc, curr) => acc + curr.value, 0);
    
    const impositivaValue = amendments
      .filter(a => a.type === AmendmentType.IMPOSITIVA)
      .reduce((acc, curr) => acc + curr.value, 0);
    
    const goiasCrescimentoValue = amendments
      .filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO)
      .reduce((acc, curr) => acc + curr.value, 0);

    const totalCount = amendments.length;
    // Fix: Replaced non-existent `Status.PAID` with `Status.CONCLUDED` as it covers paid status.
    const approvedCount = amendments.filter(a => a.status === Status.CONCLUDED).length;
    // Fix: Replaced non-existent `Status.PROCESSING` with `Status.IN_PROGRESS`.
    const processingCount = amendments.filter(a => a.status === Status.IN_PROGRESS || a.status === Status.DILIGENCE).length;
    
    const sectorDistribution = (() => {
      const sectorCounts: { [key: string]: number } = {};
      // Fix: Removed check for non-existent `Status.PAID` and replaced `Status.INACTIVE` with `Status.ARCHIVED`.
      const activeAmendments = amendments.filter(a => 
          a.status !== Status.CONCLUDED && 
          a.status !== Status.ARCHIVED
      );

      activeAmendments.forEach(amendment => {
          const currentSectors = amendment.currentSector.split(' | ');
          currentSectors.forEach(sectorName => {
              const trimmedSector = sectorName.trim();
              if (trimmedSector) {
                  sectorCounts[trimmedSector] = (sectorCounts[trimmedSector] || 0) + 1;
              }
          });
      });

      return Object.entries(sectorCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
    })();

    const today = new Date();
    const overdueCount = amendments.filter(a => {
      // Fix: Removed check for non-existent `Status.PAID`.
      if (a.status === Status.CONCLUDED) return false;
      const lastMovement = a.movements[a.movements.length - 1];
      return lastMovement && new Date(lastMovement.deadline) < today;
    }).length;

    return { totalValue, impositivaValue, goiasCrescimentoValue, totalCount, approvedCount, processingCount, sectorDistribution, overdueCount };
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Cockpit Gerencial</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Métricas de Performance e Finanças GESA/SUBIPEI</p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar Histórico de Processo SEI..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all text-sm font-medium shadow-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.map(result => (
                  <button 
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <p className="font-black text-[#0d457a] text-sm">{result.seiNumber}</p>
                    <p className="text-xs text-slate-400 truncate">{result.object}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
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
            <Building2 size={16} className="text-blue-500"/> Processos Ativos por Setor
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sectorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="name"
                >
                  {stats.sectorDistribution.map((entry, index) => (
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
              <BarChart data={stats.sectorDistribution}>
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

      {inspectedAmendment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-100 rounded-2xl text-[#0d457a]"><FileSearch size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Histórico de Tramitação</h3>
                  <p className="text-slate-500 text-sm font-bold">{inspectedAmendment.seiNumber}</p>
                </div>
              </div>
              <button onClick={() => setInspectedAmendment(null)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {inspectedAmendment.movements.map((m, idx) => (
                  <div key={m.id} className="relative">
                    <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 ${idx === inspectedAmendment.movements.length - 1 ? 'bg-[#0d457a]' : 'bg-slate-200'}`} />
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(m.dateIn).toLocaleDateString()} às {new Date(m.dateIn).toLocaleTimeString()}</p>
                        {m.deadline && (
                          <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${new Date(m.deadline) < new Date() && !m.dateOut ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            {m.dateOut ? 'Finalizado' : `Até ${new Date(m.deadline).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-black text-[#0d457a] uppercase mb-1">{m.toSector}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Responsável: {m.handledBy}</p>
                      {m.fromSector && <p className="text-[9px] text-slate-400 font-medium uppercase mt-1">Origem: {m.fromSector}</p>}
                    </div>
                  </div>
                )).reverse()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};