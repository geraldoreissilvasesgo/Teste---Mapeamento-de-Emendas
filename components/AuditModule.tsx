
/**
 * MÓDULO DE AUDITORIA E MONITORAMENTO
 * 
 * Este componente serve como a central de rastreabilidade do sistema. Ele exibe
 * todos os logs de auditoria, permitindo que administradores e auditores monitorem
 * todas as ações realizadas na plataforma.
 * 
 * Atualização: Implementada paginação para lidar com alto volume de registros.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { AuditLog, AuditAction, AuditSeverity } from '../types';
import { 
  Search, Download, Filter, User, ShieldAlert, Bug, Clock, 
  FileUp, FilePen, Move, ShieldCheck as ShieldCheckIcon, Activity, HeartPulse, Users, LogIn, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface AuditModuleProps {
  logs: AuditLog[];
}

const ITEMS_PER_PAGE = 15;

const actionVisuals = {
  [AuditAction.LOGIN]: { icon: LogIn, color: 'text-sky-500', bg: 'bg-sky-50' },
  [AuditAction.CREATE]: { icon: FileUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  [AuditAction.UPDATE]: { icon: FilePen, color: 'text-amber-500', bg: 'bg-amber-50' },
  [AuditAction.DELETE]: { icon: X, color: 'text-red-500', bg: 'bg-red-50' },
  [AuditAction.MOVE]: { icon: Move, color: 'text-purple-500', bg: 'bg-purple-50' },
  [AuditAction.LGPD_CONSENT]: { icon: ShieldCheckIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
  [AuditAction.SECURITY]: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  [AuditAction.ERROR]: { icon: Bug, color: 'text-red-600', bg: 'bg-red-100' },
};

export const AuditModule: React.FC<AuditModuleProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetResource.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      return matchesSearch && matchesSeverity && matchesAction;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, severityFilter, actionFilter]);

  // Reseta para a primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, severityFilter, actionFilter]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const kpis = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const events24h = logs.filter(l => new Date(l.timestamp) > oneDayAgo).length;
    const criticalErrors7d = logs.filter(l => l.severity === AuditSeverity.CRITICAL && new Date(l.timestamp) > oneWeekAgo).length;
    const uniqueUsers = new Set(logs.filter(l => new Date(l.timestamp) > oneDayAgo).map(l => l.actorId)).size;
    
    const activityMap = new Map<string, number>();
    for(let i=6; i>=0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('pt-BR', {weekday: 'short'});
        activityMap.set(key, 0);
    }
    
    logs.forEach(l => {
        if (new Date(l.timestamp) > oneWeekAgo) {
            const key = new Date(l.timestamp).toLocaleDateString('pt-BR', {weekday: 'short'});
            if(activityMap.has(key)) activityMap.set(key, activityMap.get(key)! + 1);
        }
    });

    const activityLast7Days = Array.from(activityMap.entries()).map(([name, count]) => ({ name, count }));

    return { events24h, criticalErrors7d, activeUsers: uniqueUsers, systemHealth: criticalErrors7d > 0 ? 'Atenção' : 'Estável', activityLast7Days };
  }, [logs]);

  const StatCard = ({ title, value, icon: Icon, health }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-[#0d457a]">{value}</h3>
          {health && <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${health === 'Estável' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{health}</span>}
       </div>
       <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
          <Icon size={24} />
       </div>
    </div>
  );

  return (
    <div className="space-y-6 font-inter animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Trilha de Auditoria</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monitoramento de Segurança e Conformidade</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest">
            <Download size={16} /> Exportar Logs
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Eventos (24h)" value={kpis.events24h} icon={Activity} />
        <StatCard title="Usuários Ativos" value={kpis.activeUsers} icon={Users} />
        <StatCard title="Falhas Críticas (7d)" value={kpis.criticalErrors7d} icon={ShieldAlert} />
        <StatCard title="Saúde do Sistema" value={kpis.systemHealth} icon={HeartPulse} health={kpis.systemHealth} />
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
         <h3 className="text-xs font-black text-[#0d457a] mb-6 uppercase tracking-widest">Atividade Recente (7 dias)</h3>
         <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.activityLast7Days}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="count" fill="#0d457a" radius={[4, 4, 4, 4]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
      
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar em logs (usuário, ação, recurso)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all font-bold text-slate-600 uppercase text-xs"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
                className="w-full md:w-52 pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl appearance-none focus:ring-2 focus:ring-[#0d457a] outline-none transition-all font-black text-[10px] uppercase text-[#0d457a]"
                onChange={(e) => setActionFilter(e.target.value)}
            >
                <option value="all">Todas as Ações</option>
                {Object.values(AuditAction).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
        </div>
        <div className="relative">
            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
                className="w-full md:w-52 pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl appearance-none focus:ring-2 focus:ring-[#0d457a] outline-none transition-all font-black text-[10px] uppercase text-[#0d457a]"
                onChange={(e) => setSeverityFilter(e.target.value)}
            >
                <option value="all">Todas Severidades</option>
                {Object.values(AuditSeverity).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ação</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Recurso / Detalhes</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data/Hora</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map(log => {
                    const Visual = actionVisuals[log.action] || { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-50' };
                    const Icon = Visual.icon;
                    return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${Visual.bg} ${Visual.color}`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{log.action}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400"/>
                                    <span className="text-[11px] font-bold text-[#0d457a] uppercase">{log.actorName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mr-2">{log.targetResource}</span>
                                    <span className="text-xs text-slate-500">{log.details}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    <Clock size={12} />
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>
                            </td>
                        </tr>
                    );
                })}
                {filteredLogs.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-400 italic">Nenhum log encontrado para os filtros selecionados.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-6 rounded-[28px] shadow-sm border border-slate-200">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Exibindo {paginatedLogs.length} de {filteredLogs.length} registros
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 bg-slate-50 text-[#0d457a] rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:grayscale transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="px-6 py-2.5 bg-[#0d457a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                 Página {currentPage} de {totalPages}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 bg-slate-50 text-[#0d457a] rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:grayscale transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
