
/**
 * PAINEL TÉCNICO DE DADOS E INFRAESTRUTURA - V2
 * 
 * Centraliza informações de arquitetura, monitoramento e métricas de ALM.
 */
import React, { useState, useEffect } from 'react';
import { 
  DatabaseZap, Terminal, AlertTriangle, FileJson, Check, Copy, Hash, 
  Database, Users, ShieldAlert, Settings, Cpu, Activity, Zap, 
  HardDrive, BarChart, Rocket, Globe, Server, Cloud
} from 'lucide-react';
import { Role, Status, AmendmentType, TransferMode, GNDType, AnalysisType, AuditAction, AuditSeverity } from '../types';

const CodeBlock: React.FC<{ title: string, code: string, language?: string, alert?: string }> = ({ title, code, language = 'json', alert }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      <div className="p-4 flex justify-between items-center bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-slate-400" />
          <span className="text-xs font-mono text-slate-300">{title}</span>
        </div>
        <button onClick={handleCopy} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-600 transition-colors">
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      {alert && (
        <div className="p-4 bg-amber-500/10 text-amber-300 text-xs border-b border-white/10">
          <p className="leading-relaxed">{alert}</p>
        </div>
      )}
      <pre className="p-6 text-sm overflow-x-auto custom-scrollbar">
        <code className={`language-${language} text-sky-300`}>{code}</code>
      </pre>
    </div>
  );
};

export const TechnicalPanel: React.FC = () => {
  const [systemLoad, setSystemLoad] = useState({ cpu: 12, mem: 24, sync: 99, throughput: 142 });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => ({
        cpu: Math.min(99, Math.max(10, prev.cpu + (Math.random() * 6 - 3))),
        mem: Math.min(99, Math.max(20, prev.mem + (Math.random() * 4 - 2))),
        sync: 98 + Math.random() * 2,
        throughput: Math.max(50, prev.throughput + (Math.random() * 20 - 10))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter flex items-center gap-3">
            <DatabaseZap size={32}/> Console Técnico GESA
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Infraestrutura, Escalabilidade e ALM Metrics</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="px-5 py-3 bg-[#0d457a] text-white rounded-2xl shadow-xl flex items-center gap-3">
                <Globe size={18} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Region: South-1 (Goiás)</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carga CPU</p>
           <h3 className="text-3xl font-black text-[#0d457a]">{systemLoad.cpu.toFixed(1)}%</h3>
           <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0d457a] transition-all duration-1000" style={{width: `${systemLoad.cpu}%`}}></div>
           </div>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vazão Global</p>
           <h3 className="text-3xl font-black text-[#0d457a]">{systemLoad.throughput.toFixed(0)} <span className="text-xs text-slate-300">REQ/S</span></h3>
           <p className="text-[9px] font-bold text-emerald-500 mt-2 uppercase">Status: Saudável</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl text-white">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">SLA Produção</p>
           <h3 className="text-3xl font-black text-emerald-400">99.98%</h3>
           <p className="text-[9px] font-bold text-white/30 mt-2 uppercase">Uptime 30 dias</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Build Success Rate</p>
           <h3 className="text-3xl font-black text-[#0d457a]">100%</h3>
           <p className="text-[9px] font-bold text-blue-500 mt-2 uppercase">Últimos 50 builds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
               <Server size={20} className="text-blue-500"/> Matriz de Ambientes
            </h3>
            <div className="space-y-4">
               {[
                 { label: 'PRODUÇÃO', status: 'Live', type: 'Primary Cloud', color: 'bg-emerald-500' },
                 { label: 'HOMOLOGAÇÃO', status: 'Active', type: 'Staging Env', color: 'bg-blue-500' },
                 { label: 'DRP (Disaster Recovery)', status: 'Warm Standby', type: 'Backup Cloud', color: 'bg-amber-500' },
                 { label: 'LAB (Desenvolvimento)', status: 'Offline', type: 'Local Sandbox', color: 'bg-slate-300' }
               ].map((env, i) => (
                 <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className={`w-3 h-3 rounded-full ${env.color}`}></div>
                       <div>
                          <p className="text-[11px] font-black text-[#0d457a] uppercase">{env.label}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{env.type}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{env.status}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
               <Activity size={20} className="text-purple-500"/> Métricas ALM (DevOps)
            </h3>
            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Time</p>
                  <p className="text-xl font-black text-[#0d457a]">2.4 hrs</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase mt-1">✓ Top Performer</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">MTTR</p>
                  <p className="text-xl font-black text-[#0d457a]">18 min</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase mt-1">✓ Resiliência Alta</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Deploy Freq.</p>
                  <p className="text-xl font-black text-[#0d457a]">4.2 / day</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Change Fail</p>
                  <p className="text-xl font-black text-red-500">&lt; 1%</p>
               </div>
            </div>
         </div>
      </div>

      <CodeBlock 
        title="CI/CD Configuration (Github Actions / GitLab)"
        code={`deploy-prod:\n  stage: deploy\n  script:\n    - npm run build\n    - aws s3 sync ./dist s3://gesa-prod-bucket\n    - aws cloudfront create-invalidation\n  only:\n    - tags`}
        language="yaml"
      />
    </div>
  );
};
