
import React, { useMemo } from 'react';
import { Amendment, Status } from '../types';
import { 
  AlertCircle, Clock, CheckCircle2, Search, Timer, 
  ArrowRight, Calendar, AlertTriangle, ShieldCheck, 
  Activity, ArrowUpRight, Filter
} from 'lucide-react';

interface DeadlinePanelProps {
  amendments: Amendment[];
  onSelect: (a: Amendment) => void;
}

export const DeadlinePanel: React.FC<DeadlinePanelProps> = ({ amendments, onSelect }) => {
  const activeProcesses = useMemo(() => 
    amendments.filter(a => a.status !== Status.CONCLUDED && a.status !== Status.ARCHIVED),
    [amendments]
  );

  const getSlaStatus = (deadline: string) => {
    const today = new Date();
    const limit = new Date(deadline);
    const diffDays = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Atrasado', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, level: 3 };
    if (diffDays <= 2) return { label: 'Crítico', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Clock, level: 2 };
    return { label: 'No Prazo', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, level: 1 };
  };

  const stats = useMemo(() => {
    const counts = { overdue: 0, critical: 0, ontime: 0 };
    activeProcesses.forEach(a => {
      const lastMov = a.movements[a.movements.length - 1];
      const sla = getSlaStatus(lastMov?.deadline || new Date().toISOString());
      if (sla.level === 3) counts.overdue++;
      else if (sla.level === 2) counts.critical++;
      else counts.ontime++;
    });
    return counts;
  }, [activeProcesses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Monitoramento de SLAs</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <Timer size={16} className="text-blue-500" /> Controle de Temporalidade SES-GO
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeProcesses.length > 0 ? activeProcesses.map(a => {
          const lastMov = a.movements[a.movements.length - 1];
          const sla = getSlaStatus(lastMov?.deadline || new Date().toISOString());
          const SlaIcon = sla.icon;
          const diffDays = Math.ceil((new Date(lastMov?.deadline || "").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div 
              key={a.id} 
              onClick={() => onSelect(a)}
              className="bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group flex flex-col p-6 overflow-hidden relative"
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border flex items-center gap-1.5 ${sla.bg} ${sla.color} ${sla.border}`}>
                  <SlaIcon size={10} /> {sla.label}
                </span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{a.code}</span>
              </div>
              <div className="flex-1 space-y-2 mb-6">
                <h3 className="text-sm font-black text-[#0d457a] uppercase group-hover:text-blue-600 transition-colors">{a.seiNumber}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase line-clamp-2 leading-relaxed">{a.object}</p>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
             <ShieldCheck size={64} className="text-slate-400" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Nenhum processo em trâmite ativo.</p>
          </div>
        )}
      </div>
    </div>
  );
};
