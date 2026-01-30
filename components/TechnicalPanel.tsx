
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Server, Zap, 
  CheckCircle2, Cloud, Network, Database, Cpu
} from 'lucide-react';
import { apiService } from '../services/apiService';

export const TechnicalPanel: React.FC = () => {
  const [health, setHealth] = useState(apiService.getSystemHealth());

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(apiService.getSystemHealth());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Console de Saúde</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Monitoramento de Infraestrutura Governamental</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Server size={24}/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Servidor</span>
           </div>
           <p className="text-xl font-black text-[#0d457a]">{health.status}</p>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Zap size={24}/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Latência</span>
           </div>
           <p className="text-xl font-black text-[#0d457a]">{health.latency}</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Database size={24}/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Uptime</span>
           </div>
           <p className="text-xl font-black text-[#0d457a]">{health.uptime}</p>
        </div>

        <div className="bg-[#0d457a] p-8 rounded-[32px] text-white shadow-xl">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 text-white rounded-2xl"><ShieldCheck size={24}/></div>
              <span className="text-[10px] font-black text-white/50 uppercase">Segurança</span>
           </div>
           <p className="text-xl font-black">Ativa</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
         <h3 className="text-xs font-black text-[#0d457a] uppercase mb-8 tracking-widest flex items-center gap-3">
            <Activity size={18} className="text-blue-500" /> Logs de Sistema em Tempo Real
         </h3>
         <div className="space-y-4 font-mono text-[10px] text-slate-400">
            <p>[{health.lastSync}] INFO: Conexão estabelecida com sucesso.</p>
            <p>[{health.lastSync}] INFO: Sessão de usuário validada via JWT.</p>
            <p>[{health.lastSync}] SUCCESS: Sincronização de base de dados completa.</p>
         </div>
      </div>
    </div>
  );
};
