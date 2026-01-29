

import React from 'react';
import { Amendment, Status } from '../types';
import { AlertCircle, Clock, CheckCircle2, Search } from 'lucide-react';

interface DeadlinePanelProps {
  amendments: Amendment[];
  onSelect: (a: Amendment) => void;
}

export const DeadlinePanel: React.FC<DeadlinePanelProps> = ({ amendments, onSelect }) => {
  // Fix: Removed check for non-existent `Status.PAID`, as `Status.CONCLUDED` covers this state.
  const activeProcesses = amendments.filter(a => a.status !== Status.CONCLUDED);

  const getSlaStatus = (deadline: string) => {
    const today = new Date();
    const limit = new Date(deadline);
    const diffDays = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'ATRASADO', color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle };
    if (diffDays <= 2) return { label: 'CRÍTICO', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
    return { label: 'NO PRAZO', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Monitoramento de Prazos</h2>
        <p className="text-slate-500 text-sm">Acompanhamento em tempo real dos SLAs por processo.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Processo SEI</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Setor Atual</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Data Limite</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Status SLA</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeProcesses.map(a => {
              const lastMovement = a.movements[a.movements.length - 1];
              const sla = getSlaStatus(lastMovement?.deadline || new Date().toISOString());
              const SlaIcon = sla.icon;

              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#0d457a]">{a.seiNumber}</div>
                    <div className="text-[10px] text-slate-400 uppercase truncate max-w-[200px]">{a.object}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{a.currentSector}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-500">{new Date(lastMovement?.deadline).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${sla.color}`}>
                      <SlaIcon size={12} />
                      {sla.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onSelect(a)} className="p-2 hover:bg-blue-50 rounded-full text-[#0d457a] transition-colors">
                      <Search size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {activeProcesses.length === 0 && (
          <div className="p-12 text-center text-slate-400 italic">Nenhum processo em tramitação ativa.</div>
        )}
      </div>
    </div>
  );
};