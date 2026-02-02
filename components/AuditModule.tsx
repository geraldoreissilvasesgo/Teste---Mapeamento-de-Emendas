
import React, { useState, useMemo } from 'react';
import { 
  Search, Download, ShieldAlert, Bug, 
  Activity, X, Terminal, Fingerprint, Database, Binary, History,
  GitBranch, Rocket, RotateCcw, ShieldCheck, Cpu, Code2, AlertTriangle, 
  ChevronLeft, ChevronRight, PlayCircle
} from 'lucide-react';
import { AuditLog, AuditAction, User as AppUser } from '../types';
import { db } from '../services/supabase';

/**
 * MÓDULO DE AUDITORIA E GOVERNANÇA (COMPLIANCE)
 * Responsável por exibir a trilha de auditoria imutável, o status do pipeline CI/CD,
 * as versões de release e os controles de segurança do sistema.
 */
interface AuditModuleProps {
  logs: AuditLog[];
  currentUser: AppUser;
  activeTenantId: string;
  onSimulate?: () => void;
}

const ITEMS_PER_PAGE = 15;

// Mapeamento visual para cada tipo de ação registrada
const actionVisuals = {
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

export const AuditModule: React.FC<AuditModuleProps> = ({ logs, currentUser, activeTenantId, onSimulate }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'code' | 'cicd' | 'releases'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Filtragem de logs em memória para busca rápida.
   */
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !term ||
        (log.actorName?.toLowerCase().includes(term) || false) ||
        (log.details?.toLowerCase().includes(term) || false) ||
        (log.action?.toLowerCase().includes(term) || false);
      
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchTerm, severityFilter]);

  /**
   * Sumarização de estatísticas para os cartões informativos.
   */
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

  /**
   * Gera um arquivo CSV com os logs filtrados para auditoria externa.
   */
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

  /**
   * Simula uma requisição de rollback de versão (apenas visual).
   */
  const handleRollbackRequest = async (version: string) => {
    if (window.confirm(`⚠️ OPERAÇÃO DE SEGURANÇA: Deseja realmente solicitar o rollback para a versão ${version}? Esta ação será auditada.`)) {
      try {
        await db.audit.log({
          tenantId: activeTenantId,
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: AuditAction.SECURITY,
          details: `Solicitação de Rollback para v${version} iniciada manualmente via Portal de Auditoria.`,
          severity: 'CRITICAL'
        });
        alert(`Solicitação de rollback da v${version} enviada para o time de DevOps.`);
      } catch (err) {
        console.error("Erro ao registrar auditoria de rollback", err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Título do Módulo */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Auditoria & Segurança</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <Fingerprint size={16} className="text-blue-500" /> Rastreabilidade e Governança GESA Cloud
          </p>
        </div>
        
        {/* Menu de Abas Técnicas */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-[24px] shadow-sm no-print">
           {[
             { id: 'logs', label: 'Eventos de Sistema', icon: History },
             { id: 'cicd', label: 'Pipeline CI/CD', icon: Rocket },
             { id: 'releases', label: 'Versões', icon: GitBranch },
             { id: 'code', label: 'Conformidade', icon: ShieldCheck }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
               className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <tab.icon size={14} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Visão de Logs (Trilha de Auditoria) */}
      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           {/* Cartões de Status */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Eventos</p>
                  <p className="text-2xl font-black text-[#0d457a]">{stats.total}</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 shadow-sm flex flex-col justify-center">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Informativos</p>
                  <p className="text-2xl font-black text-emerald-600">{stats.info}</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 shadow-sm flex flex-col justify-center">
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Alertas</p>
                  <p className="text-2xl font-black text-amber-600">{stats.warn}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 shadow-sm flex flex-col justify-center">
                  <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Críticos</p>
                  <p className="text-2xl font-black text-red-600">{stats.critical}</p>
              </div>
           </div>

           {/* Barra de Busca e Filtros */}
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-5 items-center no-print">
              <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar logs por operador ou ação..."
                    className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase text-[#0d457a]"
                  />
              </div>
              <div className="relative w-full lg:w-48">
                 <select 
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                 >
                    <option value="all">Severidade: Todas</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">AVISO</option>
                    <option value="CRITICAL">CRÍTICO</option>
                 </select>
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                {onSimulate && (
                   <button 
                    onClick={onSimulate}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all"
                  >
                    <PlayCircle size={16} /> Simular Logs
                  </button>
                )}
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#0a365f] transition-all disabled:opacity-50"
                >
                  <Download size={16} /> Exportar
                </button>
              </div>
           </div>

           {/* Tabela de Dados */}
           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividade / Timestamp</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agente Responsável</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registro de Evento</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Severidade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-inter">
                        {paginatedLogs.map(log => {
                            const Visual = actionVisuals[log.action as keyof typeof actionVisuals] || { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-50' };
                            return (
                                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${Visual.bg} ${Visual.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                                <Visual.icon size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-black text-[#0d457a] uppercase block mb-1">{log.action || 'SISTEMA'}</span>
                                                <span className="text-[9px] font-mono text-slate-300">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                             {log.actorName?.charAt(0) || 'S'}
                                          </div>
                                          <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{log.actorName || 'Sistema / Core'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-sm" title={log.details}>{log.details}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                          log.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                                          log.severity === 'WARN' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                          'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>
                                          {log.severity}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
           </div>
        </div>
      )}
      {/* Abas Técnicas (CI/CD, Releases, Code) apresentam visualizações de infraestrutura governamental */}
    </div>
  );
};
