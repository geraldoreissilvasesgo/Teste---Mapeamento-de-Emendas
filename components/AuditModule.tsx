
import React, { useState, useMemo } from 'react';
import { 
  Search, Download, ShieldAlert, Bug, 
  Activity, X, Terminal, Fingerprint, Database, Binary, History,
  GitBranch, Rocket, ShieldCheck, Code2, AlertTriangle, 
  ChevronLeft, ChevronRight, Copy, Check, RefreshCw, Loader2,
  Filter as FilterIcon, Zap, ShieldX
} from 'lucide-react';
import { AuditLog, AuditAction, User as AppUser } from '../types.ts';

interface AuditModuleProps {
  logs: AuditLog[];
  currentUser: AppUser;
  activeTenantId: string;
  onRefresh: () => void;
  error?: string | null;
}

const ITEMS_PER_PAGE = 15;

const actionVisuals: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  [AuditAction.LOGIN]: { icon: History, color: 'text-sky-500', bg: 'bg-sky-50' },
  [AuditAction.CREATE]: { icon: Code2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  [AuditAction.UPDATE]: { icon: Binary, color: 'text-amber-500', bg: 'bg-amber-50' },
  [AuditAction.DELETE]: { icon: X, color: 'text-red-500', bg: 'bg-red-50' },
  [AuditAction.MOVE]: { icon: Rocket, color: 'text-purple-500', bg: 'bg-purple-50' },
  [AuditAction.SECURITY]: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  [AuditAction.ERROR]: { icon: Bug, color: 'text-red-600', bg: 'bg-red-100' },
  [AuditAction.AI_ANALYSIS]: { icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  [AuditAction.TENANT_SWITCH]: { icon: Database, color: 'text-slate-500', bg: 'bg-slate-50' },
};

export const AuditModule: React.FC<AuditModuleProps> = ({ logs, currentUser, activeTenantId, onRefresh, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(error === 'DATABASE_SETUP_REQUIRED');
  const [showCriticalPathOnly, setShowCriticalPathOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const sqlSetup = `-- GESA CLOUD: TRILHA DE AUDITORIA IMUTÁVEL
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  "actorId" text,
  "actorName" text,
  action text not null,
  details text,
  severity text default 'INFO',
  timestamp timestamp with time zone default now()
);
alter table audit_logs enable row level security;
create policy "Acesso por Tenant Auditoria" on audit_logs for select using (true);
create policy "Sistema Grava Auditoria" on audit_logs for insert with check (true);`;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filtro de Rastreio Crítico (Criação/Tramitação + WARN/CRITICAL)
      if (showCriticalPathOnly) {
        const isActionMatch = log.action === AuditAction.CREATE || log.action === AuditAction.MOVE;
        const isSeverityMatch = log.severity === 'WARN' || log.severity === 'CRITICAL';
        if (!isActionMatch || !isSeverityMatch) return false;
      }

      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !term ||
        (log.actorName?.toLowerCase().includes(term) || false) ||
        (log.details?.toLowerCase().includes(term) || false) ||
        (log.action?.toLowerCase().includes(term) || false);
      
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchTerm, severityFilter, showCriticalPathOnly]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      critical: logs.filter(l => l.severity === 'CRITICAL').length,
      warn: logs.filter(l => l.severity === 'WARN').length,
      info: logs.filter(l => l.severity === 'INFO').length,
    };
  }, [logs]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Data;Operador;Acao;Detalhes;Severidade\n" + 
        filteredLogs.map(l => `${new Date(l.timestamp).toLocaleString()};${l.actorName || 'Sistema'};${l.action};"${(l.details || '').replace(/"/g, '""')}";${l.severity}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `GESA_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-amber-900/5 mb-8">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center animate-pulse">
            <ShieldAlert size={40} />
          </div>
          <h3 className="text-xl font-black text-amber-900 uppercase">Tabela 'audit_logs' Offline</h3>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Gerar Script SQL
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Auditoria & Segurança</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <Fingerprint size={16} className="text-blue-500" /> Rastreabilidade Governamental GESA Cloud
          </p>
        </div>
        
        <div className="flex gap-3 no-print">
            <button 
              onClick={() => setShowCriticalPathOnly(!showCriticalPathOnly)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
                showCriticalPathOnly 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-white border border-slate-200 text-slate-400 hover:text-red-500'
              }`}
              title="Filtrar por Criação/Tramitação com Atraso ou Erro"
            >
              <Zap size={16} />
              {showCriticalPathOnly ? 'Modo Risco Ativo' : 'Filtro de Risco'}
            </button>
            <button 
              onClick={handleManualRefresh}
              className="p-4 bg-white border border-slate-200 text-[#0d457a] rounded-2xl hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
            >
              {isRefreshing ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting || logs.length === 0}
              className="flex items-center justify-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#0a365f] transition-all disabled:opacity-50"
            >
              <Download size={16} /> Exportar CSV
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Eventos</p>
            <p className="text-2xl font-black text-[#0d457a]">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Normais</p>
            <p className="text-2xl font-black text-emerald-600">{stats.info}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Avisos</p>
            <p className="text-2xl font-black text-amber-600">{stats.warn}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-[32px] border border-red-100">
            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Críticos</p>
            <p className="text-2xl font-black text-red-600">{stats.critical}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-5 items-center no-print">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por servidor ou detalhe da ação..."
                className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase text-[#0d457a]"
              />
          </div>
          <div className="w-full lg:w-48">
             <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
             >
                <option value="all">Todas Severidades</option>
                <option value="INFO">INFO</option>
                <option value="WARN">AVISO</option>
                <option value="CRITICAL">CRÍTICO</option>
             </select>
          </div>
      </div>

      {showCriticalPathOnly && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <ShieldX className="text-red-500" size={18} />
          <span className="text-[10px] font-black text-red-900 uppercase tracking-widest">
            Filtro de Risco Ativo: Exibindo apenas Criações e Tramitações com Avisos ou Falhas Críticas.
          </span>
          <button onClick={() => setShowCriticalPathOnly(false)} className="ml-auto text-[9px] font-black text-red-600 uppercase underline">Remover Filtro</button>
        </div>
      )}

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                  <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividade</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Servidor Responsável</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição do Evento</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Risco</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-inter">
                  {paginatedLogs.map(log => {
                      const Visual = actionVisuals[log.action] || { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-50' };
                      return (
                          <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-2xl ${Visual.bg} ${Visual.color} shadow-sm`}>
                                          <Visual.icon size={18} />
                                      </div>
                                      <div>
                                          <span className="text-[11px] font-black text-[#0d457a] uppercase block mb-1">{log.action}</span>
                                          <span className="text-[9px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-[#0d457a] text-white flex items-center justify-center text-[10px] font-black uppercase">
                                       {log.actorName?.charAt(0) || 'S'}
                                    </div>
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{log.actorName || 'Sistema'}</span>
                                  </div>
                              </td>
                              <td className="px-8 py-6">
                                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-sm">{log.details}</p>
                              </td>
                              <td className="px-8 py-6 text-center">
                                  <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                                    log.severity === 'CRITICAL' ? 'bg-red-600 text-white border-red-700 animate-pulse' :
                                    log.severity === 'WARN' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  }`}>
                                    {log.severity}
                                  </span>
                              </td>
                          </tr>
                      );
                  })}
                  {paginatedLogs.length === 0 && (
                     <tr>
                       <td colSpan={4} className="py-20 text-center">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma atividade registrada que coincida com os filtros.</p>
                       </td>
                     </tr>
                  )}
              </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
           <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] disabled:opacity-30 shadow-sm"><ChevronLeft size={20} /></button>
           <span className="text-[10px] font-black uppercase tracking-widest bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">Página {currentPage} de {totalPages}</span>
           <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] disabled:opacity-30 shadow-sm"><ChevronRight size={20} /></button>
        </div>
      )}

      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-amber-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Esquema do Banco (audit_logs)</h3>
               </div>
               <button onClick={() => setIsSqlModalOpen(false)}><X/></button>
            </div>
            <div className="p-10 space-y-6">
               <pre className="bg-slate-900 text-blue-400 p-6 rounded-3xl font-mono text-[11px] overflow-x-auto h-72 border border-white/5 shadow-inner">
                   {sqlSetup}
               </pre>
               <button onClick={handleCopySql} className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs">
                 {copied ? 'Copiado!' : 'Copiar Script SQL'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
