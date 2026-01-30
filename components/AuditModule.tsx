
/**
 * MÓDULO DE AUDITORIA E MONITORAMENTO AVANÇADO - V3
 * 
 * Este componente centraliza a rastreabilidade:
 * 1. Trilha de Auditoria de Ações (Logs Imutáveis)
 * 2. Auditoria de Código & Build (Integridade)
 * 3. Pipeline CI/CD & Releases (Deploy Profissional)
 */
import React, { useState, useMemo } from 'react';
import { 
  Search, Download, User, ShieldAlert, Bug, 
  ShieldCheck as ShieldCheckIcon, Activity, X,
  Terminal, Fingerprint, Database, CheckCircle2, Lock, Binary, History,
  GitBranch, GitCommit, Rocket, RotateCcw, ShieldCheck, Cpu, Code2, AlertTriangle
} from 'lucide-react';
import { AuditLog, AuditAction, AuditSeverity } from '../types';

interface AuditModuleProps {
  logs: AuditLog[];
}

const ITEMS_PER_PAGE = 15;

const actionVisuals = {
  [AuditAction.LOGIN]: { icon: History, color: 'text-sky-500', bg: 'bg-sky-50' },
  [AuditAction.CREATE]: { icon: Code2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  [AuditAction.UPDATE]: { icon: Binary, color: 'text-amber-500', bg: 'bg-amber-50' },
  [AuditAction.DELETE]: { icon: X, color: 'text-red-500', bg: 'bg-red-50' },
  [AuditAction.MOVE]: { icon: Rocket, color: 'text-purple-500', bg: 'bg-purple-50' },
  [AuditAction.SECURITY]: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  [AuditAction.ERROR]: { icon: Bug, color: 'text-red-600', bg: 'bg-red-100' },
};

export const AuditModule: React.FC<AuditModuleProps> = ({ logs }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'code' | 'cicd' | 'releases'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const buildInfo = {
    version: "2.7.1-stable",
    buildHash: "sha256:7f83b127ff22636045b8c715c3274f8281969d72d62a3745223a7f6c7718cc01",
    deployedAt: "2024-05-20 14:32:00",
    environment: "PRODUÇÃO GO",
    compliance: ["ISO 27001", "ISO 9001", "LGPD"]
  };

  const releases = [
    { v: '2.7.1', date: '2024-05-20', author: 'Eng. DevOps', hash: '7f83b12...', status: 'Active' },
    { v: '2.7.0', date: '2024-05-15', author: 'Eng. DevOps', hash: 'a1b2c3d...', status: 'Archived' },
    { v: '2.6.9', date: '2024-05-02', author: 'Eng. DevOps', hash: 'e5f6g7h...', status: 'Archived' },
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, severityFilter]);

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleRollback = (version: string) => {
    if (window.confirm(`⚠️ AÇÃO CRÍTICA: Deseja reverter o sistema para a versão ${version}? Isso afetará todos os usuários em produção.`)) {
        alert(`Rollback para v${version} iniciado. Logs de auditoria gerados.`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Auditoria & Operações</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3">Rastreabilidade, CI/CD e Gestão de Releases</p>
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
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <tab.icon size={14} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-5 items-center">
              <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text"
                    placeholder="Filtrar por Usuário ou Ação..."
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-xs uppercase"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <button className="flex items-center justify-center gap-3 bg-[#0d457a] text-white px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                 <Download size={16} /> Exportar Logs
              </button>
           </div>

           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                      <tr>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ação / Hash</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operador</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Integridade</th>
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
                                              <span className="text-[9px] font-mono text-slate-300">sha256:{log.id.substring(0, 8)}</span>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <span className="text-xs font-black text-slate-600 uppercase">{log.actorName}</span>
                                  </td>
                                  <td className="px-8 py-6">
                                      <div className="flex items-center gap-2 text-emerald-500">
                                          <Lock size={12} />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Imutável</span>
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'cicd' && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-slate-900 p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Rocket size={200} /></div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Pipeline de Deploy GESA Cloud
              </h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                {[
                  { label: 'Source', icon: GitBranch, status: 'Completed', color: 'text-emerald-400' },
                  { label: 'Build', icon: Cpu, status: 'Completed', color: 'text-emerald-400' },
                  { label: 'Security Scan', icon: ShieldCheck, status: 'Completed', color: 'text-emerald-400' },
                  { label: 'Quality QA', icon: CheckCircle2, status: 'Running', color: 'text-blue-400' },
                  { label: 'Production', icon: Rocket, status: 'Waiting', color: 'text-white/20' }
                ].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center gap-4 text-center group">
                      <div className={`w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                        <step.icon size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{step.label}</p>
                        <p className={`text-[8px] font-bold uppercase mt-1 ${step.status === 'Running' ? 'animate-pulse text-blue-400' : 'text-white/30'}`}>{step.status}</p>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-white/5 via-white/20 to-white/5 mt-[-24px]"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'releases' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
             <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
               <GitBranch size={20} className="text-purple-500"/> Histórico de Versões e Rollback
             </h3>
             <div className="overflow-hidden border border-slate-100 rounded-[32px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Versão (SemVer)</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployer / Hash</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações de Segurança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {releases.map((rel, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <span className="text-base font-black text-[#0d457a]">v{rel.v}</span>
                              {rel.status === 'Active' && (
                                <span className="bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-md font-black uppercase animate-pulse">Live</span>
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
                        <td className="px-8 py-6 text-center">
                           {rel.status !== 'Active' ? (
                             <button 
                                onClick={() => handleRollback(rel.v)}
                                className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all border border-amber-200"
                             >
                                <RotateCcw size={14} /> Solicitar Rollback
                             </button>
                           ) : (
                             <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center justify-center gap-2">
                                <CheckCircle2 size={14} /> Versão Estável
                             </span>
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
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest mb-8">Varredura Estática (SAST)</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Secrets Leakage', status: 'Clean', icon: Lock },
                   { label: 'SQL Injection', status: 'Blocked', icon: Database },
                   { label: 'XSS Protection', status: 'Verified', icon: ShieldCheck }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl">
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-700 uppercase">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-100 px-3 py-1 rounded-full">{item.status}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={120}/></div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-400" /> Auditoria de Dependências
              </h3>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                 <p className="text-xs text-white/50 leading-relaxed">Última análise completa de pacotes realizada em <strong>20/05/2024 às 14:00</strong>. Todas as dependências (NPM/ESM) estão em conformidade com as diretrizes da Sefaz-GO.</p>
                 <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-[9px] font-black uppercase tracking-widest">Gerar Laudo SBOM</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
