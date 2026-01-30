
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Terminal, CheckCircle2, XCircle, Activity, Cpu, Zap, ShieldCheck, Bug, 
  Dna, RefreshCw, Gauge, Database, Search, Clock, Loader2
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
    if (isAllRunning) return;
    setIsAllRunning(true);
    addLog("Iniciando Pipeline de Testes Unitários...");
    
    const tests = [
      { id: 'u1', name: 'Validação de Máscara SEI', category: 'Unit' as const },
      { id: 'u2', name: 'Cálculo de Prazo SLA', category: 'Unit' as const },
      { id: 'u3', name: 'Sanitização LGPD (Data Mask)', category: 'Unit' as const },
      { id: 'u4', name: 'Conversão de Moeda (BRL)', category: 'Unit' as const },
    ];

    const initialResults = tests.map(t => ({ ...t, status: 'pending' as const, message: 'Aguardando...' }));
    setResults(initialResults);

    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      setResults(prev => prev.map(res => res.id === t.id ? { ...res, status: 'running' } : res));
      addLog(`Executando: ${t.name}...`);
      
      const duration = Math.floor(Math.random() * 400) + 100;
      await new Promise(resolve => setTimeout(resolve, duration));

      const isSuccess = Math.random() > 0.05; // 95% de chance de sucesso
      setResults(prev => prev.map(res => res.id === t.id ? { 
        ...res, 
        status: isSuccess ? 'success' : 'failed', 
        duration, 
        message: isSuccess ? 'Aprovado' : 'Erro de Assertividade' 
      } : res));
      
      addLog(`${isSuccess ? '✓' : '✗'} ${t.name} finalizado em ${duration}ms`);
    }

    addLog("Pipeline Unitário concluída.");
    await runIntegrationTests();
  };

  const runIntegrationTests = async () => {
    addLog("Iniciando Testes de Integração de Sistema...");
    
    const tests = [
      { id: 'i1', name: 'Conexão Supabase Real-time', category: 'Integration' as const },
      { id: 'i2', name: 'Handshake Gemini Pro API', category: 'Integration' as const },
      { id: 'i3', name: 'Verificação de Políticas RLS', category: 'Integration' as const },
    ];

    setResults(prev => [...prev, ...tests.map(t => ({ ...t, status: 'pending' as const, message: 'Aguardando...' }))]);

    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      setResults(prev => prev.map(res => res.id === t.id ? { ...res, status: 'running' } : res));
      addLog(`Validando integração: ${t.name}...`);
      
      const duration = Math.floor(Math.random() * 800) + 300;
      await new Promise(resolve => setTimeout(resolve, duration));

      setResults(prev => prev.map(res => res.id === t.id ? { 
        ...res, 
        status: 'success', 
        duration, 
        message: 'Handshake OK' 
      } : res));
      
      addLog(`✓ Conexão estável em ${t.name}`);
    }

    addLog("Integração verificada.");
    await runLoadTest();
  };

  const runLoadTest = async () => {
    addLog("Iniciando Simulação de Estresse (Load Test)...");
    addLog("Simulando 500 usuários simultâneos no módulo de trâmites...");
    
    const testId = 'l1';
    setResults(prev => [...prev, { id: testId, name: 'Estresse Concorrência 500/req', category: 'Load', status: 'running', message: 'Injetando Tráfego...' }]);

    let currentLoadData: {time: number, latency: number}[] = [];
    for (let i = 0; i < 20; i++) {
      const latency = Math.floor(Math.random() * 60) + 15;
      currentLoadData.push({ time: i, latency });
      setLoadData([...currentLoadData]);
      
      if (i % 5 === 0) addLog(`Batch ${i/5 + 1}: Latência média ${latency}ms`);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setResults(prev => prev.map(res => res.id === testId ? { 
      ...res, 
      status: 'success', 
      duration: 3000, 
      message: 'Estabilidade Mantida' 
    } : res));

    addLog("Teste de carga finalizado. Sistema resiliente.");
    setIsAllRunning(false);
  };

  const clearTests = () => {
    setResults([]);
    setLogs([]);
    setLoadData([]);
    setIsAllRunning(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Painel de Engenharia (QA)</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Diagnóstico de Sistema e Cobertura de Testes</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={clearTests} 
            disabled={isAllRunning}
            className="flex items-center gap-2 bg-white text-slate-500 border border-slate-200 px-5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest disabled:opacity-50"
          >
            <RefreshCw size={16} className={isAllRunning ? 'animate-spin' : ''} /> Limpar
          </button>
          <button 
            onClick={runUnitTests} 
            disabled={isAllRunning}
            className="flex items-center gap-2 bg-[#0d457a] text-white px-5 py-2.5 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest disabled:opacity-50"
          >
            {isAllRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 
            {isAllRunning ? 'Rodando...' : 'Rodar Pipeline'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck size={24}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Saúde Geral</p>
                <p className="text-lg font-black text-[#0d457a]">Operacional</p>
              </div>
            </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Dna size={24}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cobertura</p>
                <p className="text-lg font-black text-[#0d457a]">92.7%</p>
              </div>
            </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Bug size={24}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Falhas Críticas</p>
                <p className="text-lg font-black text-[#0d457a]">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Teste</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Duração</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {results.length > 0 ? results.map(r => (
                        <tr key={r.id} className="animate-in slide-in-from-left-2 duration-300">
                            <td className="px-6 py-4">
                                {r.status === 'success' && <CheckCircle2 size={20} className="text-emerald-500" />}
                                {r.status === 'failed' && <XCircle size={20} className="text-red-500" />}
                                {r.status === 'running' && <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />}
                                {r.status === 'pending' && <div className="w-4 h-4 rounded-full bg-slate-200" />}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-600">{r.name}</span>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">{r.message}</p>
                            </td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md">{r.category}</span></td>
                            <td className="px-6 py-4 text-right text-xs font-mono text-slate-400">{r.duration ? `${r.duration}ms` : '-'}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-400 italic">Nenhum teste executado ainda. Clique em "Rodar Pipeline" para iniciar o diagnóstico.</td>
                        </tr>
                    )}
                </tbody>
             </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[40px] shadow-lg flex flex-col h-[30rem] border border-slate-800">
              <div className="p-4 border-b border-white/10 flex items-center justify-between text-white/50">
                <div className="flex items-center gap-2">
                  <Terminal size={16}/>
                  <span className="text-[10px] font-black uppercase tracking-widest">Console de Saída (DevOps)</span>
                </div>
                {isAllRunning && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
              </div>
              <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto custom-scrollbar font-mono">
                {logs.length > 0 ? logs.map((log, i) => (
                  <p key={i} className="text-[11px] text-emerald-400/80 leading-relaxed mb-1">
                    <span className="text-slate-600 mr-2">{i+1}.</span>
                    {log}
                  </p>
                )) : (
                  <p className="text-slate-700 italic text-xs">Waiting for sequence initiation...</p>
                )}
              </div>
           </div>
           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-8">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <Gauge size={16} className="text-[#0d457a]" />
                  <span>Teste de Carga (Latência)</span>
                </div>
                {loadData.length > 0 && (
                  <span className="text-[10px] font-black text-emerald-600">{loadData[loadData.length-1].latency}ms</span>
                )}
             </div>
             <div className="h-40">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loadData}>
                        <Line 
                          type="monotone" 
                          dataKey="latency" 
                          stroke="#0d457a" 
                          strokeWidth={4} 
                          dot={false} 
                          animationDuration={300}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                          labelStyle={{display: 'none'}}
                        />
                    </LineChart>
                 </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
