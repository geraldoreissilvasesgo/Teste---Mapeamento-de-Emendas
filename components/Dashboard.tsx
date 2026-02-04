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
    const total = amendments.length;
    const totalValue = amendments.reduce((acc, c) => acc + c.value, 0);
    
    const impositivas = amendments.filter(a => a.type === AmendmentType.IMPOSITIVA);
    const countImpositiva = impositivas.length;
    const valueImpositiva = impositivas.reduce((acc, c) => acc + c.value, 0);
    
    const crescimento = amendments.filter(a => a.type === AmendmentType.GOIAS_CRESCIMENTO);
    const countCrescimento = crescimento.length;
    const valueCrescimento = crescimento.reduce((acc, c) => acc + c.value, 0);

    const especiais = amendments.filter(a => a.type === AmendmentType.ESPECIAL);
    const countEspecial = especiais.length;
    const valueEspecial = especiais.reduce((acc, c) => acc + c.value, 0);
    
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
      countImpositiva,
      valueImpositiva, 
      countCrescimento,
      valueCrescimento, 
      countEspecial,
      valueEspecial,
      avgCompletion,
      criticalCount: criticalProcesses.filter(p => p.slaStatus === 'critical').length,
      delayedCount: criticalProcesses.filter(p => p.slaStatus === 'delayed').length,
      criticalList: criticalProcesses.slice(0, 5)
    };
  }, [amendments, statusConfigs]);

  const typeComparisonData = useMemo(() => [
    { name: 'Impositivas', "Valor R$": stats.valueImpositiva, "Qtd": stats.countImpositiva, color: '#0d457a' },
    { name: 'Goiás Crescimento', "Valor R$": stats.valueCrescimento, "Qtd": stats.countCrescimento, color: '#059669' },
    { name: 'Especiais', "Valor R$": stats.valueEspecial, "Qtd": stats.countEspecial, color: '#8b5cf6' }
  ], [stats]);

  const searchedAmendment = useMemo(() => {
    if (!seiSearch || seiSearch.length < 4) return null;
    return amendments.find(a => a.seiNumber.toLowerCase().includes(seiSearch.toLowerCase()));
  }, [amendments, seiSearch]);

  const currentMovement = useMemo(() => {
    if (!searchedAmendment || searchedAmendment.movements.length === 0) return null;
    return searchedAmendment.movements[searchedAmendment.movements.length - 1];
  }, [searchedAmendment]);

  const pieData = useMemo(() => {
    const statusPool = statusConfigs.length > 0 ? statusConfigs : Array.from(new Set(amendments.map(a => a.status))).map(name => ({ name, color: '#64748b' }));
    return statusPool.map(s => ({
      name: s.name,
      value: amendments.filter(a => a.status === s.name).length,
      color: (s as any).color || '#64748b'
    })).filter(d => d.value > 0);
  }, [amendments, statusConfigs]);

  const barChartData = useMemo(() => {
    return amendments.slice(0, 10).map(a => ({
      municipality: a.municipality,
      "Valores R$": a.value
    }));
  }, [amendments]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v);

  const formatNumericOnly = (v: number) => new Intl.NumberFormat('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v);

  const getSlaStatus = (deadline: string, dateOut: string | null) => {
    const limit = new Date(deadline);
    const end = dateOut ? new Date(dateOut) : new Date();
    const isDelayed = end > limit;
    let delayDays = 0;
    if (isDelayed) {
      delayDays = Math.ceil((end.getTime() - limit.getTime()) / (1000 * 60 * 60 * 24));
    }
    return { isDelayed, delayDays };
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl lg:text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-tight">Cockpit Gerencial</h2>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="w-10 h-1 bg-[#0d457a] rounded-full"></div> Consolidado Estratégico GESA Cloud
          </div>
        </div>

        <div className="w-full md:w-96 relative group">
           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-300 group-focus-within:text-[#0d457a] transition-colors" />
           </div>
           <input 
              type="text" 
              placeholder="PESQUISAR PROCESSO SEI..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 ring-blue-500/5 focus:border-[#0d457a] font-black text-[11px] uppercase tracking-widest text-[#0d457a] transition-all"
              value={seiSearch}
              onChange={(e) => setSeiSearch(e.target.value)}
           />
        </div>
      </div>

      {searchedAmendment && (
        <div className="animate-in slide-in-from-top-4 duration-500 bg-white p-8 lg:p-10 rounded-[48px] border-2 border-blue-100 shadow-2xl shadow-blue-900/10 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5"><MapPin size={120} /></div>
           
           <div className="flex flex-col lg:flex-row justify-between items-start gap-6 relative z-10">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100">Localização Identificada</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{searchedAmendment.status}</span>
                 </div>
                 <h3 className="text-3xl font-black text-[#0d457a] tracking-tighter uppercase">{searchedAmendment.seiNumber}</h3>
                 <p className="text-sm font-bold text-slate-400 uppercase leading-tight max-w-2xl">{searchedAmendment.object}</p>
              </div>
              <button 
                onClick={() => onSelectAmendment(searchedAmendment.id)}
                className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all"
              >
                Abrir Dossiê Completo <ArrowUpRight size={18} />
              </button>
           </div>

           <div className="pt-6 border-t border-slate-50 relative z-10">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <MapPin size={14} className="text-blue-500" /> Custódia Atual do Processo
              </h4>
              
              {currentMovement ? (
                <div className="max-w-md bg-slate-50 p-8 rounded-[40px] border border-slate-100 relative group/card transition-all hover:shadow-lg">
                   <div className="absolute -top-1.5 left-8 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white animate-pulse shadow-lg shadow-emerald-200">
                      Unidade Técnica Atual
                   </div>
                   
                   <div className="space-y-6">
                      <div>
                        <p className="text-lg font-black text-[#0d457a] uppercase mb-1">{currentMovement.toSector}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentMovement.analysisType || 'Análise Geral'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Entrada</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase">{new Date(currentMovement.dateIn).toLocaleDateString('pt-BR')}</p>
                         </div>
                         <div className="p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Permanência</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase">{currentMovement.daysSpent} Dias</p>
                         </div>
                      </div>

                      {(() => {
                         const sla = getSlaStatus(currentMovement.deadline, currentMovement.dateOut);
                         return (
                           <div className={`p-5 rounded-3xl border flex items-center justify-between ${sla.isDelayed ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                              <div className="flex items-center gap-3">
                                 <Clock size={18} className={sla.isDelayed ? 'text-red-500' : 'text-blue-500'} />
                                 <div>
                                    <p className={`text-[8px] font-black uppercase ${sla.isDelayed ? 'text-red-400' : 'text-blue-400'}`}>Prazo Limite</p>
                                    <p className={`text-[11px] font-black uppercase ${sla.isDelayed ? 'text-red-600' : 'text-blue-600'}`}>
                                       {new Date(currentMovement.deadline).toLocaleDateString('pt-BR')}
                                    </p>
                                 </div>
                              </div>
                              {sla.isDelayed && (
                                 <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase animate-bounce">Atrasado</span>
                              )}
                           </div>
                         );
                      })()}
                   </div>
                </div>
              ) : (
                <div className="p-10 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processo recém-criado. Aguardando primeira movimentação oficial.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* PAINEL DE INDICADORES POR TIPO DE RECURSO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 lg:p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em] flex items-center gap-3">
              <ClipboardList size={18} className="text-blue-500" /> Panorama de Emendas Impositivas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 relative overflow-hidden group">
                   <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform"><Landmark size={64}/></div>
                   <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Montante Financeiro</p>
                   <p className="text-2xl font-black text-[#0d457a]">{formatBRL(stats.valueImpositiva)}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden group">
                   <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform"><Activity size={64}/></div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume de Processos</p>
                   <p className="text-2xl font-black text-[#0d457a]">{stats.countImpositiva} <span className="text-[10px] text-slate-400">UN</span></p>
                </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50">
               <span>Participação no Portfólio</span>
               <span className="text-[#0d457a] font-black">{((stats.valueImpositiva / (stats.totalValue || 1)) * 100).toFixed(1)}%</span>
            </div>
        </div>

        <div className="bg-white p-8 lg:p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldCheck size={18} className="text-emerald-500" /> Panorama Goiás em Crescimento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 relative overflow-hidden group">
                   <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={64}/></div>
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Montante Financeiro</p>
                   <p className="text-2xl font-black text-emerald-700">{formatBRL(stats.valueCrescimento)}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden group">
                   <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform"><Activity size={64}/></div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume de Processos</p>
                   <p className="text-2xl font-black text-[#0d457a]">{stats.countCrescimento} <span className="text-[10px] text-slate-400">UN</span></p>
                </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50">
               <span>Participação no Portfólio</span>
               <span className="text-emerald-600 font-black">{((stats.valueCrescimento / (stats.totalValue || 1)) * 100).toFixed(1)}%</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Eficiência (Aggregate) */}
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

        {/* Card SLA (Aggregate) */}
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

        {/* Card Geral (Count) */}
        <div className="group relative bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total de Processos</p>
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-black text-[#0d457a] tracking-tighter">{stats.total}</h3>
              <div className="p-3 bg-slate-50 rounded-2xl"><Briefcase size={24} className="text-[#0d457a]"/></div>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-4">Gestão Unificada GESA</p>
        </div>

        {/* Card Orçamentário (Total) */}
        <div className="group relative bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Volume Orçamentário</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-[#0d457a] tracking-tighter">{formatBRL(stats.totalValue)}</h3>
              <div className="p-3 bg-blue-50 rounded-2xl"><DollarSign size={24} className="text-blue-500"/></div>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-4">Consolidado Geral</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* GRÁFICO DE COMPARAÇÃO POR TIPO */}
          <div className="bg-white p-8 lg:p-12 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-50 rounded-2xl"><BarChart3 size={20} className="text-blue-600" /></div>
                <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em]">Composição por Tipo de Recurso</h3>
             </div>
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={typeComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: '800', fill: '#0d457a'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 9, fill: '#0d457a'}} axisLine={false} tickLine={false} tickFormatter={(v) => formatNumericOnly(v)} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                        cursor={{ fill: '#f8fafc' }}
                        formatter={(v: number) => formatNumericOnly(v)}
                      />
                      <Bar dataKey="Valor R$" radius={[12, 12, 0, 0]} barSize={48}>
                        {typeComparisonData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

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
              <div className="p-3 bg-blue-50 rounded-2xl"><MapPin size={20} className="text-blue-600" /></div>
              <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-[0.3em]">Concentração por Município</h3>
            </div>
            <div className="h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="municipality" tick={{fontSize: 8, fontWeight: '800', fill: '#0d457a'}} axisLine={false} tickLine={false} />
                  <YAxis 
                    tick={{fontSize: 8, fill: '#0d457a'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value: number) => formatNumericOnly(value)} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: number) => formatNumericOnly(value)}
                  />
                  <Bar dataKey="Valores R$" fill="#0d457a" radius={[10, 10, 0, 0]} barSize={32} />
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
