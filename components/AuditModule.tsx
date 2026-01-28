
import React, { useState } from 'react';
import { AuditLog, AuditAction, AuditSeverity } from '../types';
// Fix: Added CheckCircle2 to imports
import { Search, Download, Filter, User, ShieldAlert, Code, Terminal, Clock, Fingerprint, Eye, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AuditModuleProps {
  logs: AuditLog[];
}

export const AuditModule: React.FC<AuditModuleProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getSeverityStyles = (severity: AuditSeverity) => {
    switch(severity) {
      case AuditSeverity.CRITICAL: return 'bg-red-500 text-white shadow-red-200';
      case AuditSeverity.HIGH: return 'bg-orange-500 text-white shadow-orange-200';
      case AuditSeverity.MEDIUM: return 'bg-amber-100 text-amber-800 border-amber-200';
      case AuditSeverity.LOW: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const handleExport = () => {
    const headers = "Data,Hora,Acao,Severidade,Usuario,Recurso,Detalhes,IP,UserAgent\n";
    const rows = filteredLogs.map(log => {
      const date = new Date(log.timestamp);
      return `"${date.toLocaleDateString()}","${date.toLocaleTimeString()}","${log.action}","${log.severity}","${log.actorName}","${log.targetResource}","${log.details.replace(/"/g, '""')}","${log.ipAddress}","${log.userAgent.replace(/"/g, '""')}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_forense_gesa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-inter">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Auditoria de Integridade</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Trilha Forense Imutável - Monitoramento de Transações GESA.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-white text-[#0d457a] border-2 border-slate-200 px-5 py-2.5 rounded-2xl hover:bg-slate-50 shadow-sm transition-all uppercase text-[10px] font-black tracking-widest"
        >
          <Download size={16} /> Exportar Relatório CSV
        </button>
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
            className="p-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-[#0d457a] text-[#0d457a]"
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
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp / Severidade</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação / Evento</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recurso / IP</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors group ${log.severity === AuditSeverity.CRITICAL ? 'bg-red-50/20' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-slate-700">{new Date(log.timestamp).toLocaleString()}</span>
                      <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-sm border ${getSeverityStyles(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#0d457a] uppercase mb-1 tracking-tighter">{log.action}</span>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight max-w-sm line-clamp-2">{log.details}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0d457a]/5 group-hover:text-[#0d457a] transition-all">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 uppercase">{log.actorName}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{log.actorId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{log.ipAddress}</span>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter truncate max-w-[150px]">{log.targetResource}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(log.payloadBefore || log.payloadAfter) && (
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-slate-300 hover:text-[#0d457a] hover:bg-white rounded-xl transition-all shadow-sm"
                        title="Inspecionar Payload Forense"
                      >
                        <Code size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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

      {/* Modal de Inspeção Forense (Payload) */}
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
               {/* Lado Esquerdo: Payload Antes */}
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

               {/* Lado Direito: Payload Depois */}
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

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
