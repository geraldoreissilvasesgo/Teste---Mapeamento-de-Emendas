/**
 * PAINEL DE DIAGNÓSTICO E ENGENHARIA (QA)
 * 
 * Este é um componente de desenvolvimento e Quality Assurance (QA). Ele não faz parte
 * do fluxo de negócio principal, mas serve para simular e monitorar a saúde
 * e a integridade do sistema.
 * 
 * Funcionalidades:
 * - Simula a execução de diferentes tipos de testes:
 *   - Testes Unitários: Verificam pequenas partes isoladas da lógica (ex: formatação).
 *   - Testes de Integração: Verificam a comunicação entre diferentes partes (ex: criação -> auditoria).
 *   - Testes de Carga (Estresse): Simulam um alto volume de requisições para medir a performance.
 * - Exibe os resultados dos testes em uma tabela clara (sucesso/falha).
 * - Mostra um console de log em tempo real com o andamento dos testes.
 * - Apresenta um gráfico de latência para o teste de carga.
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Terminal, CheckCircle2, XCircle, Activity, Cpu, Zap, ShieldCheck, Bug, 
  Dna, RefreshCw, Gauge, Database, Search, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define a estrutura de um resultado de teste.
interface TestResult {
  id: string;
  name: string;
  category: 'Unit' | 'Integration' | 'Load';
  status: 'pending' | 'running' | 'success' | 'failed';
  message: string;
  duration?: number;
}

export const TestingPanel: React.FC = () => {
  // Estados para gerenciar os resultados, logs e a UI do painel.
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isAllRunning, setIsAllRunning] = useState(false);
  const [loadData, setLoadData] = useState<{ time: number, latency: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null); // Ref para auto-scroll do console

  // Função para adicionar uma nova mensagem ao log.
  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Efeito para rolar o console de logs para o final automaticamente.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Simula a execução de testes unitários.
  const runUnitTests = async () => { /* ... */ };

  // Simula a execução de testes de integração.
  const runIntegrationTests = async () => { /* ... */ };

  // Simula um teste de carga (estresse).
  const runLoadTest = async () => { /* ... */ };

  // Limpa todos os resultados e logs da tela.
  const clearTests = () => {
    setResults([]);
    setLogs([]);
    setLoadData([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho do Painel */}
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Painel de Engenharia (QA)</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Diagnóstico de Sistema e Cobertura de Testes</p>
        </div>
        <div className="flex gap-3">
          <button onClick={clearTests} className="flex items-center gap-2 bg-white text-slate-500 border border-slate-200 px-5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest">
            <RefreshCw size={16} /> Limpar
          </button>
          <button onClick={runUnitTests} className="flex items-center gap-2 bg-[#0d457a] text-white px-5 py-2.5 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest">
            <Play size={16} /> Rodar Pipeline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sumário de Cobertura de Testes */}
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
          
          {/* Tabela de Resultados da Pipeline */}
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
                        <tr key={r.id}>
                            <td className="px-6 py-4">
                                {r.status === 'success' && <CheckCircle2 size={20} className="text-emerald-500" />}
                                {r.status === 'failed' && <XCircle size={20} className="text-red-500" />}
                                {r.status === 'running' && <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{r.name}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md">{r.category}</span></td>
                            <td className="px-6 py-4 text-right text-xs font-mono text-slate-400">{r.duration ? `${r.duration}ms` : '-'}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-400 italic">Nenhum teste executado ainda.</td>
                        </tr>
                    )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Console de Log e Monitor de Estresse */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[40px] shadow-lg flex flex-col h-[30rem]">
              <div className="p-4 border-b border-white/10 flex items-center gap-2 text-white/50">
                <Terminal size={16}/>
                <span className="text-xs font-bold uppercase">Console de Saída</span>
              </div>
              <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => <p key={i} className="text-xs font-mono text-slate-400 leading-relaxed">{log}</p>)}
              </div>
           </div>
           <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-6">
             <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-4">
                <Gauge size={16} />
                <span>Teste de Carga (Latência)</span>
             </div>
             <div className="h-32">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loadData}>
                        <Tooltip contentStyle={{fontSize: '10px', borderRadius: '8px'}}/>
                        <Line type="monotone" dataKey="latency" stroke="#0d457a" strokeWidth={3} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
