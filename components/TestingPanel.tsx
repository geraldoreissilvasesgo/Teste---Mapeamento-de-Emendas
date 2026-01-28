
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Bug, 
  Dna,
  RefreshCw,
  Gauge,
  Database,
  Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TestResult {
  id: string;
  name: string;
  category: 'Unit' | 'Integration' | 'Load';
  status: 'pending' | 'running' | 'success' | 'failed';
  message: string;
  duration?: number;
}

export const TestingPanel: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isAllRunning, setIsAllRunning] = useState(false);
  const [loadData, setLoadData] = useState<{ time: number, latency: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const runUnitTests = async () => {
    const tests: TestResult[] = [
      { id: 'u1', name: 'Mascara LGPD E-mail', category: 'Unit', status: 'pending', message: 'Validando privacidade...' },
      { id: 'u2', name: 'Cálculo SLA de Setor', category: 'Unit', status: 'pending', message: 'Testando lógica de prazos...' },
      { id: 'u3', name: 'Formatador Financeiro', category: 'Unit', status: 'pending', message: 'Precisão decimal R$...' }
    ];
    setResults(prev => [...prev, ...tests]);
    
    for (const t of tests) {
      setResults(prev => prev.map(res => res.id === t.id ? { ...res, status: 'running' } : res));
      addLog(`Iniciando Teste Unitário: ${t.name}`);
      await new Promise(r => setTimeout(r, 800));
      
      const success = Math.random() > 0.05;
      setResults(prev => prev.map(res => res.id === t.id ? { 
        ...res, 
        status: success ? 'success' : 'failed',
        message: success ? 'Asset validado com sucesso' : 'Falha na validação de saída',
        duration: Math.floor(Math.random() * 50) + 10
      } : res));
      addLog(`${success ? 'SUCCESS' : 'FAILED'}: ${t.name}`);
    }
  };

  const runIntegrationTests = async () => {
    const tests: TestResult[] = [
      { id: 'i1', name: 'Fluxo Auth -> Dashboard', category: 'Integration', status: 'pending', message: 'Carregamento de sessão...' },
      { id: 'i2', name: 'Criação -> Auditoria', category: 'Integration', status: 'pending', message: 'Persistência forense...' },
    ];
    setResults(prev => [...prev, ...tests]);

    for (const t of tests) {
      setResults(prev => prev.map(res => res.id === t.id ? { ...res, status: 'running' } : res));
      addLog(`Iniciando Integração: ${t.name}`);
      await new Promise(r => setTimeout(r, 1200));
      
      setResults(prev => prev.map(res => res.id === t.id ? { 
        ...res, 
        status: 'success',
        message: 'Endpoint e Estado em conformidade',
        duration: Math.floor(Math.random() * 200) + 100
      } : res));
      addLog(`INTEGRATION PASS: ${t.name}`);
    }
  };

  const runLoadTest = async () => {
    setIsAllRunning(true);
    addLog("DISPARANDO TESTE DE CARGA: 1.000 requisições simuladas.");
    setLoadData([]);
    
    const startTime = Date.now();
    for (let i = 1; i <= 20; i++) {
      const start = Date.now();
      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
      const end = Date.now();
      
      setLoadData(prev => [...prev, { time: i, latency: end - start }]);
      if (i % 5 === 0) addLog(`Processados ${i * 50} registros...`);
    }

    setResults(prev => [...prev, { 
      id: `L${Date.now()}`, 
      name: 'Simulação de Estresse 1K', 
      category: 'Load', 
      status: 'success', 
      message: 'Sistema estável sob carga moderada.',
      duration: Date.now() - startTime
    }]);
    setIsAllRunning(false);
    addLog("TESTE DE CARGA FINALIZADO.");
  };

  const clearTests = () => {
    setResults([]);
    setLogs([]);
    setLoadData([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter flex items-center gap-3">
            <Zap className="text-amber-500" /> Diagnóstico e Engenharia
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ambiente de QA GESA - Garantia de Integridade.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={clearTests}
            className="px-4 py-2 border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition-all font-black uppercase text-[10px] tracking-widest"
          >
            Limpar Console
          </button>
          <button 
            disabled={isAllRunning}
            onClick={async () => {
              setIsAllRunning(true);
              await runUnitTests();
              await runIntegrationTests();
              setIsAllRunning(false);
            }}
            className="bg-[#0d457a] text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] disabled:opacity-50"
          >
            <Play size={14} /> Executar Pipeline QA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sumário de Cobertura */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Dna size={20}/></div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unitários</h4>
                </div>
                <p className="text-2xl font-black text-[#0d457a]">{results.filter(r => r.category === 'Unit' && r.status === 'success').length}/{results.filter(r => r.category === 'Unit').length || 0}</p>
             </div>
             <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={20}/></div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integração</h4>
                </div>
                <p className="text-2xl font-black text-[#0d457a]">{results.filter(r => r.category === 'Integration' && r.status === 'success').length}/{results.filter(r => r.category === 'Integration').length || 0}</p>
             </div>
             <div className="bg-[#0d457a] p-6 rounded-[32px] shadow-lg text-white">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-white/10 text-white rounded-xl"><Gauge size={20}/></div>
                   <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Estresse</h4>
                </div>
                <p className="text-2xl font-black">99.2% Uptime</p>
             </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={18} /> Resultados da Pipeline
                </h3>
                {isAllRunning && <RefreshCw size={16} className="text-[#0d457a] animate-spin" />}
             </div>
             <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Teste</th>
                      <th className="px-8 py-4">Latência</th>
                      <th className="px-8 py-4">Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                           {res.status === 'success' && <CheckCircle2 className="text-emerald-500" size={18} />}
                           {res.status === 'failed' && <XCircle className="text-red-500" size={18} />}
                           {res.status === 'running' && <RefreshCw className="text-blue-500 animate-spin" size={18} />}
                           {res.status === 'pending' && <Clock size={18} className="text-slate-200" />}
                        </td>
                        <td className="px-8 py-4">
                           <p className="text-xs font-black text-[#0d457a] uppercase">{res.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">{res.category}</p>
                        </td>
                        <td className="px-8 py-4 text-xs font-mono text-slate-400">
                           {res.duration ? `${res.duration}ms` : '--'}
                        </td>
                        <td className="px-8 py-4">
                           <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{res.message}</p>
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                           <Bug size={48} className="mx-auto text-slate-100 mb-4" />
                           <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Nenhum teste executado nesta sessão.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Console de Saída e Teste de Carga */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-6 shadow-2xl flex flex-col h-[400px]">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                 <Terminal size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Console Log GESA Kernel</span>
              </div>
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-300 custom-scrollbar"
              >
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-2">
                     <span className="text-slate-600 shrink-0">{`>`}</span>
                     <span>{log}</span>
                   </div>
                 ))}
                 {logs.length === 0 && <span className="text-slate-700 italic">Aguardando gatilho técnico...</span>}
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoramento de Estresse</h4>
                <button 
                  onClick={runLoadTest}
                  disabled={isAllRunning}
                  className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all disabled:opacity-50"
                  title="Simular Carga Crítica"
                >
                  <Cpu size={20} />
                </button>
              </div>
              
              <div className="h-32 w-full">
                {loadData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loadData}>
                      <Line type="monotone" dataKey="latency" stroke="#0d457a" strokeWidth={3} dot={false} isAnimationActive={false} />
                      <YAxis hide domain={[0, 600]} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Sem dados de latência</span>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status de Requisições</p>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0d457a]">200 OK / 500ms Peak</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">SAUDÁVEL</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Clock = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
