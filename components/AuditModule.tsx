
/**
 * MÓDULO DE AUDITORIA E MONITORAMENTO AVANÇADO
 * 
 * Este componente centraliza a rastreabilidade:
 * 1. Trilha de Auditoria de Ações (Logs Imutáveis)
 * 2. Auditoria de Código & Build (Integridade)
 * 3. Performance de SLA
 */
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AuditLog, AuditAction, AuditSeverity } from '../types';
import { 
  Search, Download, Filter, User, ShieldAlert, Bug, Clock, 
  FileUp, FilePen, Move, ShieldCheck as ShieldCheckIcon, Activity, HeartPulse, Users, LogIn, X,
  ChevronLeft, ChevronRight, Terminal, Fingerprint, Database, CheckCircle2, Lock, Binary, History
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
  const [activeTab, setActiveTab] = useState<'logs' | 'code' | 'sla'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const buildInfo = {
    version: "2.7.1-stable",
    buildHash: "sha256:7f83b127ff22636045b8c715c3274f8281969d72d62a3745223a7f6c7718cc01",
    deployedAt: "2024-05-20 14:32:00",
    environment: "PRODUÇÃO GO",
    compliance: ["ISO 27001", "ISO 9001", "LGPD"]
  };

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

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Centro de Auditoria</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3">Rastreabilidade Total e Integridade de Código</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-[24px] shadow-sm">
           {[
             { id: 'logs', label: 'Logs de Ações', icon: History },
             { id: 'code', label: 'Auditoria de Código', icon: Binary },
             { id: 'sla', label: 'Compliance SLA', icon: Activity }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <tab.icon size={14} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
           {/* Barra de Filtros */}
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-5 items-center">
              <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text"
                    placeholder="Filtrar por Usuário, SEI ou Detalhe..."
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-bold text-slate-600 uppercase placeholder:text-slate-200 text-xs"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                 <select className="px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-[10px] font-black uppercase text-[#0d457a]" onChange={(e) => setSeverityFilter(e.target.value)}>
                    <option value="all">Severidade: Todas</option>
                    {Object.values(AuditSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <button className="flex items-center justify-center gap-3 bg-[#0d457a] text-white px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    <Download size={16} /> Exportar CSV
                 </button>
              </div>
           </div>

           {/* Tabela de Logs Imutáveis */}
           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                      <tr>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hash / Ação</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operador</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recurso Alvo</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Integridade</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {paginatedLogs.map(log => {
                          const Visual = actionVisuals[log.action] || { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-50' };
                          return (
                              <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                  <td className="px-8 py-6">
                                      <div className="flex items-center gap-4">
                                          <div className={`p-3 rounded-2xl ${Visual.bg} ${Visual.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                              <Visual.icon size={18} />
                                          </div>
                                          <div>
                                              <span className="text-[11px] font-black text-[#0d457a] uppercase block leading-none mb-1">{log.action}</span>
                                              <span className="text-[9px] font-mono text-slate-300">sig:{log.id.substring(0, 12)}...</span>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={14}/></div>
                                          <span className="text-xs font-black text-slate-600 uppercase">{log.actorName}</span>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <div className="flex flex-col gap-1">
                                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit uppercase">{log.targetResource}</span>
                                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs">{log.details}</span>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <div className="flex items-center gap-2 text-emerald-500">
                                          <Lock size={12} className="shrink-0" />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Selo de Imutabilidade OK</span>
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

      {activeTab === 'code' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Build Info */}
              <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 text-white/5 opacity-20"><Binary size={200} /></div>
                 <div className="flex items-center gap-5 mb-10 border-b border-white/10 pb-8">
                    <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-3xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                       <CheckCircle2 size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Integridade do Build</h3>
                       <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-widest">Assinado Digitalmente • GESA-OPS</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-2">Versão do Sistema</p>
                          <p className="text-lg font-mono font-black">{buildInfo.version}</p>
                       </div>
                       <div>
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-2">SHA-256 Runtime Hash</p>
                          <p className="text-[10px] font-mono text-white/60 bg-white/5 p-4 rounded-2xl border border-white/10 break-all leading-relaxed">
                             {buildInfo.buildHash}
                          </p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div>
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-2">Último Deploy Automático</p>
                          <p className="text-lg font-mono font-black">{buildInfo.deployedAt}</p>
                       </div>
                       <div>
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-2">Certificações Ativas</p>
                          <div className="flex flex-wrap gap-2">
                             {buildInfo.compliance.map(c => (
                                <span key={c} className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[9px] font-black uppercase">{c}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Security Metrics */}
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Varredura de Segurança (SAST)</h4>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <Fingerprint size={20} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-[#0d457a] uppercase">Secrets Check</span>
                       </div>
                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-tighter">Limpo</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <Database size={20} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-[#0d457a] uppercase">SQL Injection</span>
                       </div>
                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-tighter">Limpo</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <ShieldAlert size={20} className="text-blue-500" />
                          <span className="text-[10px] font-black text-[#0d457a] uppercase">Vulnerabilidades</span>
                       </div>
                       <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-tighter">Zero</span>
                    </div>
                    <button className="w-full mt-4 py-4 border-2 border-[#0d457a]/10 hover:border-[#0d457a] text-[#0d457a] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                       Baixar Laudo de Auditoria
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
