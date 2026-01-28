import React, { useState } from 'react';
import { AuditLog, AuditAction } from '../types';
import { Search, Download, Filter, FileText, User, Calendar, ShieldAlert } from 'lucide-react';

interface AuditModuleProps {
  logs: AuditLog[];
}

export const AuditModule: React.FC<AuditModuleProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  
  // Sorting logs by newest first
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = sortedLogs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: AuditAction) => {
    switch(action) {
      case AuditAction.LOGIN: return 'bg-blue-100 text-blue-800 border-blue-200';
      case AuditAction.CREATE: return 'bg-green-100 text-green-800 border-green-200';
      case AuditAction.DELETE: return 'bg-red-100 text-red-800 border-red-200';
      case AuditAction.SECURITY: return 'bg-purple-100 text-purple-800 border-purple-200';
      case AuditAction.MOVE: return 'bg-amber-100 text-amber-800 border-amber-200';
      case AuditAction.APPROVE: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleExport = () => {
    // Mock export functionality
    const headers = "Data,Hora,Ação,Usuário,Recurso,Detalhes,IP\n";
    const rows = filteredLogs.map(log => {
      const date = new Date(log.timestamp);
      return `${date.toLocaleDateString()},${date.toLocaleTimeString()},${log.action},${log.actorName},${log.targetResource},"${log.details}",${log.ipAddress}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_gesa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert size={24} className="text-slate-400" />
            Trilha de Auditoria
          </h2>
          <p className="text-slate-500 text-sm">Registro imutável de ações para conformidade e controle.</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
        >
          <Download size={16} />
          Exportar Relatório (CSV)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por usuário, recurso ou detalhes..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] focus:border-[#0d457a] outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] focus:border-[#0d457a] outline-none bg-white"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            <option value="all">Todas as Ações</option>
            {Object.values(AuditAction).map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-[#0d457a] uppercase tracking-wider whitespace-nowrap">Data / Hora</th>
                <th className="px-6 py-3 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Ação</th>
                <th className="px-6 py-3 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Recurso</th>
                <th className="px-6 py-3 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Detalhes</th>
                <th className="px-6 py-3 text-xs font-bold text-[#0d457a] uppercase tracking-wider text-right">IP Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-500 pl-4">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1 rounded-full">
                        <User size={14} className="text-slate-500" />
                      </div>
                      <span className="text-sm text-slate-700">{log.actorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {log.targetResource}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 block max-w-xs truncate" title={log.details}>
                      {log.details}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="text-xs text-slate-400 font-mono">
                      {log.ipAddress}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
             <FileText size={48} className="text-slate-200" />
             <p>Nenhum registro de auditoria encontrado com os filtros atuais.</p>
          </div>
        )}
      </div>
    </div>
  );
};