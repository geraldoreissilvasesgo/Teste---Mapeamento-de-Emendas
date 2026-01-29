
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { AuditLog, AuditAction, AuditSeverity } from '../types';
import { 
  Search, Download, Filter, User, ShieldAlert, Code, Terminal, Clock, Fingerprint, 
  Eye, Database, AlertTriangle, CheckCircle2, X, LogIn, FileUp, Bug, FilePen, 
  Move, ShieldCheck as ShieldCheckIcon, Activity, HeartPulse, Users 
} from 'lucide-react';

interface AuditModuleProps {
  logs: AuditLog[];
}

// Mapeamento de ícones e cores para cada tipo de ação de auditoria
const actionVisuals = {
  [AuditAction.LOGIN]: { icon: LogIn, color: 'text-sky-500' },
  [AuditAction.CREATE]: { icon: FileUp, color: 'text-emerald-500' },
  [AuditAction.UPDATE]: { icon: FilePen, color: 'text-amber-500' },
  [AuditAction.DELETE]: { icon: AlertTriangle, color: 'text-red-600' },
  [AuditAction.MOVE]: { icon: Move, color: 'text-indigo-500' },
  [AuditAction.LGPD_CONSENT]: { icon: ShieldCheckIcon, color: 'text-blue-500' },
  [AuditAction.SECURITY]: { icon: ShieldAlert, color: 'text-fuchsia-600' },
  [AuditAction.ERROR]: { icon: Bug, color: 'text-red-700' },
};

export const AuditModule: React.FC<AuditModuleProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Lógica de filtragem aprimorada
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetResource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm);
      
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      
      return matchesSearch && matchesSeverity && matchesAction;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, severityFilter, actionFilter]);

  // KPIs para o dashboard de monitoramento
  const kpis = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 60 * 60 * 1000);
    
    const events24h = logs.filter(l => new Date(l.timestamp) > last24h).length;
    const criticalErrors7d = logs.filter(l => new Date(l.timestamp) > last7d && l.severity === AuditSeverity.CRITICAL).length;
    const activeUsers = new Set(logs.filter(l => new Date(l.timestamp) > last24h).map(l => l.actorId)).size;
    const systemHealth = criticalErrors7d > 0 ? 'Alerta' : 'Operacional';

    const activityLast7Days = Array(7).fill(0).map((_, i) => {
      const day = new Date();
      day.setDate(now.getDate() - (6 - i));
      day.setHours(0, 0, 0, 0);
      return { 
        name: day.toLocaleDateString('pt-BR', { weekday: 'short' }), 
        eventos: 0 
      };
    });

    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 7) {
        const index = 6 - diffDays;
        if (activityLast7Days[index]) {
          activityLast7Days[index].eventos++;
        }
      }
    });

    return { events24h, criticalErrors7d, activeUsers, systemHealth, activityLast7Days };
  }, [logs]);

  const getSeverityStyles = (severity: AuditSeverity) => {
    switch(severity) {
      case AuditSeverity.CRITICAL: return { badge: 'bg-red-500 text-white shadow-red-200', border: 'border-l-red-500' };
      case AuditSeverity.HIGH: return { badge: 'bg-orange-500 text-white shadow-orange-200', border: 'border-l-orange-500' };
      case AuditSeverity.MEDIUM: return { badge: 'bg-amber-100 text-amber-800 border-amber-200', border: 'border-l-amber-400' };
      case AuditSeverity.LOW: return { badge: 'bg-blue-100 text-blue-800 border-blue-200', border: 'border-l-blue-400' };
      default: return { badge: 'bg-slate-100 text-slate-500 border-slate-200', border: 'border-l-slate-300' };
    }
  };

  const StatCard = ({ title, value, icon: Icon, health }: { title: string, value: string | number, icon: React.ElementType, health?: 'good' | 'bad' }) => (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200 ${health === 'bad' ? 'border-red-200 bg-red-50/50' : ''}`}>
        <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
            <Icon size={20} className={health === 'bad' ? 'text-red-500' : 'text-slate-300'} />
        </div>
        <p className={`text-3xl font-black mt-2 ${health === 'bad' ? 'text-red-600' : 'text-[#0d457a]'}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 font-inter">
      <div>
        <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Central de Monitoramento</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Logs, Eventos de Segurança e Erros de Sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Eventos (24h)" value={kpis.events24h} icon={Activity} />
        <StatCard title="Erros Críticos (7d)" value={kpis.criticalErrors7d} icon={Bug} health={kpis.criticalErrors7d > 0 ? 'bad' : 'good'} />
        <StatCard title="Usuários Ativos" value={kpis.activeUsers} icon={Users} />
        <StatCard title="Saúde do Sistema" value={kpis.systemHealth} icon={HeartPulse} health={kpis.systemHealth === 'Alerta' ? 'bad' : 'good'} />
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
        <h3 className="text-sm font-black text-[#0d457a] mb-6 border-b border-slate-100 pb-4 uppercase tracking-widest">
            Atividade de Logs (Últimos 7 Dias)
        </h3>
        <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.activityLast7Days} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="eventos" fill="#0d457a" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por autor, IP, processo ou ação técnica..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#0d457a] text-sm font-medium transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="p-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-[#0d457a] text-slate-600"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            <option value="all">Ação: Todas</option>
            {Object.values(AuditAction).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            className="p-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-[#0d457a] text-slate-600"
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
          >
            <option value="all">Severidade: Todas</option>
            {Object.values(AuditSeverity).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes do Evento</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recurso / IP</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const visuals = actionVisuals[log.action] || { icon: Activity, color: 'text-slate-500' };
                const Icon = visuals.icon;
                const severityStyles = getSeverityStyles(log.severity);
                return (
                  <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors group border-l-4 ${severityStyles.border} ${log.severity === AuditSeverity.CRITICAL ? 'bg-red-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-40">
                        <div className={`p-2 rounded-xl bg-slate-50 ${visuals.color}`}><Icon size={16} /></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter truncate">{log.action}</p>
                          <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-sm border ${severityStyles.badge}`}>
                            {log.severity}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 font-bold leading-tight max-w-sm line-clamp-2">{log.details}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-700 uppercase">{log.actorName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter truncate max-w-[150px]">{log.targetResource}</span>
                      <p className="text-[10px] font-mono font-bold text-slate-400">{log.ipAddress}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(log.payloadBefore || log.payloadAfter) && (
                        <button onClick={() => setSelectedLog(log)} className="p-2 text-slate-300 hover:text-[#0d457a] hover:bg-white rounded-xl transition-all shadow-sm" title="Inspecionar Payload Forense">
                          <Code size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-24 text-center">
            <ShieldAlert size={64} className="mx-auto text-slate-100 mb-6" />
            <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Nenhum registro de auditoria disponível</p>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-emerald-400 shadow-xl ring-4 ring-slate-100"><Terminal size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Detalhamento de Transação</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Protocolo: {selectedLog.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-900">
               <div className="flex-1 border-r border-white/5 flex flex-col min-h-0">
                  <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Database size={12} /> Estado Anterior (Legacy)
                     </span>
                  </div>
                  <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                     <pre className="text-[11px] text-blue-300 font-mono leading-relaxed">
                        {selectedLog.payloadBefore ? JSON.stringify(JSON.parse(selectedLog.payloadBefore), null, 2) : '// Nenhum dado prévio registrado'}
                     </pre>
                  </div>
               </div>
               <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={12} /> Novo Estado (Commit)
                     </span>
                  </div>
                  <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                     <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed">
                        {selectedLog.payloadAfter ? JSON.stringify(JSON.parse(selectedLog.payloadAfter), null, 2) : '// Nenhuma alteração de estado registrada'}
                     </pre>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                     <span className="text-[9px] text-slate-400 font-black uppercase">Endereço IP</span>
                     <span className="text-xs font-mono font-bold text-slate-700">{selectedLog.ipAddress}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                  <div className="flex flex-col">
                     <span className="text-[9px] text-slate-400 font-black uppercase">Agente de Software</span>
                     <span className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[250px]">{selectedLog.userAgent}</span>
                  </div>
               </div>
               <button 
                 onClick={() => setSelectedLog(null)}
                 className="px-8 py-3 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-[#0a365f] transition-all"
               >
                 Fechar Inspeção
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};