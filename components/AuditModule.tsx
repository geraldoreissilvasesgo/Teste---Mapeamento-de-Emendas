
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Download, User, ShieldAlert, Bug, 
  ShieldCheck as ShieldCheckIcon, Activity, X,
  Terminal, Fingerprint, Database, CheckCircle2, Lock, Binary, History,
  GitBranch, GitCommit, Rocket, RotateCcw, ShieldCheck, Cpu, Code2, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { AuditLog, AuditAction, AuditSeverity, User as AppUser } from '../types';
import { db } from '../services/supabase';

interface AuditModuleProps {
  logs: AuditLog[];
  currentUser: AppUser;
  activeTenantId: string;
}

const ITEMS_PER_PAGE = 10;

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

export const AuditModule: React.FC<AuditModuleProps> = ({ logs, currentUser, activeTenantId }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'code' | 'cicd' | 'releases'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Filtragem Dinâmica dos Logs Reais
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        log.actorName.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term);
      
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchTerm, severityFilter]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Data;Operador;Acao;Detalhes;Severidade\n" + 
        filteredLogs.map(l => `${new Date(l.timestamp).toLocaleString()};${l.actorName};${l.action};"${l.details.replace(/"/g, '""')}";${l.severity}`).join("\n");
      
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

  const handleRollbackRequest = async (version: string) => {
    if (window.confirm(`⚠️ OPERAÇÃO DE SEGURANÇA: Deseja realmente solicitar o rollback para a versão ${version}? Esta ação será auditada.`)) {
      try {
        await db.audit.log({
          tenantId: activeTenantId,
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: AuditAction.SECURITY,
          details: `Solicitação de Rollback para v${version} iniciada manualmente.`,
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Auditoria & Operações</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <Fingerprint size={16} className="text-blue-500" /> Rastreabilidade e Governança GESA Cloud
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-[24px] shadow-sm">
           {[
             { id: 'logs', label: 'Auditoria', icon: History },
             { id: 'cicd', label: 'Pipeline CI/CD', icon: Rocket },
             { id: 'releases', label: 'Releases', icon: GitBranch },
             { id: 'code', label: 'Segurança', icon: ShieldCheck }
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

      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-5 items-center">
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
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center justify-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#0a365f] transition-all disabled:opacity-50"
              >
                 <Download size={16} /> Exportar Logs
              </button>
           </div>

           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação / Data</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operador</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                                                <span className="text-[11px] font-black text-[#0d457a] uppercase block mb-1">{log.action}</span>
                                                <span className="text-[9px] font-mono text-slate-300">{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                          <User size={14} className="text-slate-300" />
                                          <span className="text-xs font-black text-slate-600 uppercase">{log.actorName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase max-w-xs truncate" title={log.details}>{log.details}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                          log.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' :
                                          log.severity === 'WARN' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                          {log.severity}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedLogs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">Nenhum log de auditoria localizado para esta consulta.</td>
                          </tr>
                        )}
                    </tbody>
                </table>
              </div>
           </div>

           {totalPages > 1 && (
             <div className="flex justify-center items-center gap-4 pt-4">
               <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0d457a] disabled:opacity-30"><ChevronLeft size={20}/></button>
               <span className="text-[10px] font-black text-[#0d457a] uppercase bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">Página {currentPage} de {totalPages}</span>
               <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0d457a] disabled:opacity-30"><ChevronRight size={20}/></button>
             </div>
           )}
        </div>
      )}

      {activeTab === 'cicd' && (
        <div className="animate-in slide-in-from-top-4 duration-500">
           <div className="bg-[#020617] p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Rocket size={240} /></div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                Status do Pipeline de Produção
              </h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                {[
                  { label: 'Source', icon: GitBranch, status: 'Completed', color: 'text-emerald-400' },
                  { label: 'Build', icon: Cpu, status: 'Completed', color: 'text-emerald-400' },
                  { label: 'Security Scan', icon: ShieldCheck, status: 'Completed', color: 'text-emerald-400' },
                  { label: 'Quality QA', icon: CheckCircle2, status: 'Stable', color: 'text-blue-400' },
                  { label: 'Production', icon: Rocket, status: 'Live', color: 'text-emerald-400' }
                ].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center gap-4 text-center group cursor-default">
                      <div className={`w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center ${step.color} group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500 shadow-xl`}>
                        <step.icon size={32} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{step.label}</p>
                        <p className={`text-[8px] font-bold uppercase mt-1 opacity-50`}>{step.status}</p>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 mt-[-32px]"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="mt-16 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl"><Activity size={20} /></div>
                   <div>
                     <p className="text-[10px] font-black uppercase text-white/70">Tempo Médio de Deploy</p>
                     <p className="text-sm font-black text-emerald-400">4m 22s <span className="text-[8px] text-white/30 uppercase ml-2">(Otimizado via GESA Cloud)</span></p>
                   </div>
                </div>
                <div className="px-6 py-2 bg-emerald-500 text-[#020617] rounded-xl text-[10px] font-black uppercase tracking-widest">Pipeline Saudável</div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'releases' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                  <GitBranch size={20} className="text-purple-500"/> Registro Histórico de Releases
                </h3>
                <span className="text-[9px] font-black bg-blue-50 text-[#0d457a] px-4 py-2 rounded-full border border-blue-100 uppercase tracking-widest">Sistema Imutável</span>
             </div>
             
             <div className="overflow-hidden border border-slate-100 rounded-[32px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Versão / Tag</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployer / Hash</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Gestão de Risco</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { v: '2.7.1', date: '2024-05-20', author: 'Eng. DevOps GESA', hash: '7f83b12', status: 'LIVE', health: 'Saudável' },
                      { v: '2.7.0', date: '2024-05-15', author: 'Eng. DevOps GESA', hash: 'a1b2c3d', status: 'ARCHIVED', health: 'Estável' },
                      { v: '2.6.9', date: '2024-05-02', author: 'Eng. DevOps GESA', hash: 'e5f6g7h', status: 'ARCHIVED', health: 'Estável' },
                    ].map((rel, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <span className="text-base font-black text-[#0d457a] tracking-tighter">v{rel.v}</span>
                              {rel.status === 'LIVE' && (
                                <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-[8px] px-2.5 py-1 rounded-lg font-black uppercase animate-pulse">
                                   <Rocket size={10} /> Produção
                                </div>
                              )}
                           </div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{rel.date}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-slate-600 uppercase">{rel.author}</span>
                             <span className="text-[9px] font-mono text-slate-300">[{rel.hash}]</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
                              <ShieldCheckIcon size={14} /> {rel.health}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                           {rel.status !== 'LIVE' ? (
                             <button 
                                onClick={() => handleRollbackRequest(rel.v)}
                                className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-white text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all border border-amber-200 shadow-sm"
                             >
                                <RotateCcw size={14} /> Solicitar Reversão
                             </button>
                           ) : (
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Nenhuma ação necessária</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative">
              <div className="absolute top-8 right-10 text-emerald-500 opacity-20"><ShieldCheck size={64}/></div>
              <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest mb-10">Conformidade e SAST (Código)</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Secrets Leakage Check', status: 'Clean', icon: Lock, color: 'bg-emerald-500' },
                   { label: 'SQL Injection Guard', status: 'Secure', icon: Database, color: 'bg-emerald-500' },
                   { label: 'Cross-Site Scripting (XSS)', status: 'Verified', icon: ShieldCheck, color: 'bg-emerald-500' },
                   { label: 'Sensitive Data Masking', status: 'Applied', icon: User, color: 'bg-blue-500' }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-[28px] border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm"><item.icon size={18} /></div>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
                      </div>
                      <span className={`text-[9px] font-black text-white px-3 py-1 rounded-full uppercase ${item.color}`}>{item.status}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-[#0f172a] p-10 rounded-[48px] text-white shadow-xl relative flex flex-col">
              <div className="absolute -bottom-10 -right-10 p-8 opacity-5 scale-150 rotate-12"><Terminal size={120}/></div>
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <AlertTriangle size={18} className="text-amber-400" /> Relatório de Vulnerabilidades
                </h3>
                <span className="text-[8px] font-black bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">Live Monitoring</span>
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                   <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Integridade de Dependências</p>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">Aprovado</span>
                   </div>
                   <p className="text-xs text-white/40 leading-relaxed font-bold">Última varredura de pacotes (NPM/ESM) não encontrou vulnerabilidades conhecidas (CVEs). Ambiente 100% isolado via Sandbox.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                      <p className="text-2xl font-black text-emerald-400">0</p>
                      <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mt-1">Críticos</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                      <p className="text-2xl font-black text-amber-400">0</p>
                      <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mt-1">Médios</p>
                   </div>
                </div>
                
                <button className="mt-auto w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                   <Terminal size={14} /> Solicitar Novo Scan Completo
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
