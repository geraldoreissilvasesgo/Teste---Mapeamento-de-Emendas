
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, Cpu, Database, Activity, Code2, Globe, 
  Layers, ShieldCheck, Zap, Search, ChevronRight, 
  AlertCircle, Bug, Braces, RefreshCw, Server, 
  Network, Play, Pause, Trash2, Maximize2, Monitor,
  Wifi, Signal, Clock, Box
} from 'lucide-react';
import { Amendment, User, AuditLog } from '../types';

interface DebugConsoleProps {
  amendments: Amendment[];
  currentUser: User;
  logs: AuditLog[];
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ amendments, currentUser, logs }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'state' | 'network' | 'env'>('console');
  const [isPaused, setIsPaused] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [latencyData, setLatencyData] = useState<number[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<{used: number, total: number}>({ used: 450, total: 2048 });
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Simulação de telemetria de rede e processamento em tempo real
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newLatency = Math.floor(Math.random() * 45) + 5;
      setLatencyData(prev => [...prev.slice(-20), newLatency]);
      
      // Simulação de uso de memória oscilando
      setMemoryUsage(prev => ({
        ...prev,
        used: Math.max(300, Math.min(1800, prev.used + (Math.random() * 20 - 10)))
      }));

      const events = [
        "POLLING_DB_SYNC: Tabela 'amendments' verificada.",
        "RLS_POLICY_CHECK: Token JWT validado com sucesso.",
        "GEMINI_PRO_API: Handshake de telemetria concluído.",
        "SUPABASE_AUTH: Sessão mantida (keep-alive).",
        "DOM_HYDRATION: Componentes renderizados em 12ms.",
        "NETWORK_REQUEST: GET /rest/v1/amendments?select=*",
        "IA_MODEL_LOAD: Pesos do Gemini carregados em cache local.",
        "WEBSOCKET_HEARTBEAT: Canal de notificação SEI estável."
      ];
      
      if (Math.random() > 0.4) {
        const msg = events[Math.floor(Math.random() * events.length)];
        setLiveLogs(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (!isPaused) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs, isPaused]);

  const maxLatency = Math.max(...latencyData, 1);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 animate-in fade-in duration-500 font-inter">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Console de Engenharia</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <Bug size={14} className="text-emerald-500" /> GESA IDE DevTools & Telemetry v2.8.4
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPaused ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-amber-500 text-white shadow-amber-200 shadow-lg'}`}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? 'Retomar Trace' : 'Pausar Trace'}
          </button>
          <button 
            onClick={() => { setLiveLogs([]); setLatencyData([]); }} 
            className="flex items-center gap-2 bg-slate-950 text-slate-400 border border-slate-800 px-6 py-3 rounded-2xl hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <Trash2 size={14} /> Limpar Buffer
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Painel de Navegação IDE */}
        <div className="bg-slate-950 rounded-[40px] border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Módulos de Depuração</h3>
             <nav className="space-y-2">
                {[
                  { id: 'console', label: 'Terminal de Execução', icon: Terminal },
                  { id: 'state', label: 'Inspecionar Estado', icon: Braces },
                  { id: 'network', label: 'Monitor de Rede', icon: Network },
                  { id: 'env', label: 'Variáveis de Ambiente', icon: Globe }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
             </nav>
          </div>
          <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
             <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Recursos Ativos</p>
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                         <span>Heap Usage</span>
                         <span>{memoryUsage.used.toFixed(0)}MB</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-400" style={{ width: `${(memoryUsage.used/memoryUsage.total)*100}%` }}></div>
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                         <span>CPU Load</span>
                         <span>4.2%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-400 w-[12%]"></div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="pt-6 border-t border-slate-800">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Health Check</p>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">DB Real-time</span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Auth Service</span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">IA Analyzer</span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Área Principal do Console */}
        <div className="lg:col-span-3 bg-slate-950 rounded-[40px] border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="h-12 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/30"></div>
                <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">{activeTab}.gesa</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[9px] font-mono text-slate-600">UTF-8</span>
                <span className="text-[9px] font-mono text-slate-600">Line: {liveLogs.length}</span>
             </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'console' && (
              <div className="h-full p-8 overflow-y-auto custom-scrollbar font-mono bg-[#0b0e14]">
                {liveLogs.length > 0 ? liveLogs.map((log, i) => (
                   <div key={i} className="flex gap-4 mb-2 animate-in slide-in-from-left-2 duration-300">
                      <span className="text-slate-700 select-none min-w-[30px] text-right">{i+1}</span>
                      <span className="text-emerald-400/80 leading-relaxed break-all">
                        <span className="text-blue-400/50 mr-2">{log.substring(0, 10)}</span>
                        {log.substring(10)}
                      </span>
                   </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <Terminal size={64} className="text-white mb-4" />
                    <p className="text-white font-black uppercase tracking-widest">Inicie o Trace para Depurar</p>
                  </div>
                )}
                <div ref={consoleEndRef} />
              </div>
            )}

            {activeTab === 'state' && (
              <div className="h-full p-8 overflow-y-auto custom-scrollbar bg-[#0b0e14]">
                 <div className="space-y-8">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-4 flex items-center gap-2">
                          <Box size={14}/> State: amendments_buffer [{amendments.length}]
                        </p>
                        <pre className="text-[11px] font-mono text-blue-300 leading-relaxed overflow-x-auto">
                          {JSON.stringify(amendments.slice(0, 2), null, 2)}
                          {amendments.length > 2 && "\n... more objects in buffer"}
                        </pre>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-4 flex items-center gap-2">
                          <Monitor size={14}/> State: user_session
                        </p>
                        <pre className="text-[11px] font-mono text-blue-300 leading-relaxed overflow-x-auto">
                          {JSON.stringify({
                             id: currentUser.id,
                             tenantId: currentUser.tenantId,
                             role: currentUser.role,
                             mfa: currentUser.mfaEnabled,
                             auth_level: 'JWT_SaaS_Isolated'
                          }, null, 2)}
                        </pre>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="h-full p-8 flex flex-col bg-[#0b0e14] space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Avg Latency</p>
                       <p className="text-2xl font-black text-blue-400">{(latencyData.reduce((a,b)=>a+b,0)/(latencyData.length||1)).toFixed(1)}ms</p>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Current Endpoint</p>
                       <p className="text-sm font-black text-emerald-400 uppercase">aws-sa-east-1.proxy</p>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Sync Status</p>
                       <div className="flex items-center gap-2">
                          <Wifi size={16} className="text-emerald-500" />
                          <p className="text-sm font-black text-emerald-400 uppercase tracking-tighter">Socket Stable</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 bg-slate-900/30 rounded-3xl border border-slate-800 p-8 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Latency Real-time Trace</h4>
                       <div className="flex gap-1">
                          {latencyData.map((d, i) => (
                             <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="absolute inset-x-8 bottom-8 h-48 flex items-end gap-1 group">
                       {latencyData.map((d, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-blue-500/30 border-t border-blue-400/50 hover:bg-emerald-500/50 transition-all cursor-crosshair relative group/bar" 
                            style={{ height: `${(d/maxLatency)*100}%` }}
                          >
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 text-[8px] font-mono text-blue-400 whitespace-nowrap bg-slate-900 px-1 rounded">
                                {d}ms
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'env' && (
               <div className="h-full p-8 overflow-y-auto custom-scrollbar bg-[#0b0e14]">
                  <div className="bg-slate-900/50 p-8 rounded-[32px] border border-slate-800 space-y-6">
                     <h4 className="text-[11px] font-black text-slate-400 uppercase mb-8 flex items-center gap-3">
                        <Globe size={18} className="text-blue-500"/> Environment System Variables
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {[
                           { key: 'VITE_APP_ENV', val: 'production_goias' },
                           { key: 'VITE_TENANT_ISOLATION', val: 'ENABLED' },
                           { key: 'VITE_GEMINI_MODEL', val: 'gemini-3-pro-preview' },
                           { key: 'VITE_SUPABASE_REGION', val: 'sa-east-1' },
                           { key: 'VITE_AUTH_PROVIDER', val: 'supabase_managed' },
                           { key: 'VITE_API_GATEWAY', val: 'https://api.gesa.go.gov.br' },
                           { key: 'VITE_DEBUG_MODE', val: 'IDE_VERBOSE' },
                           { key: 'VITE_LOG_REENTION', val: '90d' }
                        ].map((env, i) => (
                           <div key={i} className="flex justify-between items-center border-b border-slate-800 pb-4">
                              <span className="text-[10px] font-mono text-slate-500">{env.key}</span>
                              <span className="text-[10px] font-mono text-emerald-400">{env.val}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé de Status */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between no-print shadow-xl">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Main Branch Stable</span>
            </div>
            <div className="flex items-center gap-2">
               <Activity size={14} className="text-blue-400" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Runtime: Node 20.12.0</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg">
               <Clock size={12} className="text-slate-500" />
               <span className="text-[9px] font-mono text-slate-400 uppercase">Uptime: 142h 12m 04s</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg">
               <Signal size={12} className="text-emerald-500" />
               <span className="text-[9px] font-mono text-slate-400 uppercase">Latency: {latencyData[latencyData.length-1] || 0}ms</span>
            </div>
         </div>
      </div>
    </div>
  );
};
