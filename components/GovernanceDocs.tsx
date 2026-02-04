
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ShieldCheck, Zap, Workflow, Scale, 
  FileCheck, Target, Layers, Network, ChevronRight, 
  FileText, Briefcase, HelpCircle, GraduationCap,
  HardDrive, Server, Award, CheckCircle2, AlertCircle, RefreshCw, GitBranch, Rocket,
  RotateCcw, Activity, ShieldAlert, FileSearch, ClipboardCheck, History, Eye, Cpu, CloudLightning,
  Play, Lock, Undo2, AlertTriangle, ShieldX
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext.tsx';

type GovernanceTab = 'cobit' | 'itil' | 'compliance' | 'iso' | 'drp' | 'release';

export const GovernanceDocs: React.FC = () => {
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<GovernanceTab>('cobit');
  const [drpStatus, setDrpStatus] = useState<'idle' | 'running' | 'success' | 'rollback'>('idle');
  const [drpLogs, setDrpLogs] = useState<string[]>([]);
  const [isoChecks, setIsoChecks] = useState<Record<string, boolean>>({
    'c1': true, 'c2': true, 'c3': false, 'c4': true
  });

  const toggleCheck = (id: string) => {
    setIsoChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addLog = (msg: string) => {
    setDrpLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRollback = async () => {
    if (!window.confirm("⚠️ ALERTA CRÍTICO: Você está prestes a reverter o software para o último Snapshot íntegro. Todas as transações pendentes no buffer de rede serão perdidas. Deseja prosseguir com o Rollback de Emergência?")) return;
    
    setDrpStatus('rollback');
    setDrpLogs([]);
    addLog("INICIANDO PROTOCOLO DE REVERSÃO DE ESTADO (ROLLBACK)...");
    
    const steps = [
      "Congelando escrita no Banco de Dados (Read-only mode)...",
      "Localizando último Snapshot estável (24h atrás)...",
      "Validando Checksum de integridade do Snapshot...",
      "Substituindo ponteiros de memória de estado...",
      "Purgando cache de IA e buffers de trâmite...",
      "Reiniciando serviços de mensageria governamental...",
      "SISTEMA REVERTIDO PARA O ESTADO ESTÁVEL COM SUCESSO."
    ];

    for (const step of steps) {
      addLog(step);
      await new Promise(r => setTimeout(r, 600));
    }
    
    notify('warning', 'Rollback Concluído', 'O sistema foi restaurado para um ponto de controle anterior.');
    setDrpStatus('success');
  };

  const runDRPSimulation = async () => {
    setDrpStatus('running');
    setDrpLogs([]);
    const steps = [
      "Iniciando Protocolo de Continuidade GESA...",
      "Detectando falha no Site Primário (Goiânia-DC1)",
      "Redirecionando tráfego para Failover (Brasília-DC2)",
      "Montando Snapshots de Banco de Dados (RPO: 5min)",
      "Sincronizando Buckets de Documentos SEI...",
      "Validando Integridade de Identidades (MFA Re-sync)",
      "Sistema Restaurado em Ambiente de Contingência."
    ];

    for (const step of steps) {
      addLog(step);
      await new Promise(r => setTimeout(r, 800));
    }
    setDrpStatus('success');
  };

  const getScore = (tab: GovernanceTab) => {
    switch(tab) {
      case 'cobit': return 88;
      case 'itil': return 92;
      case 'iso': return 75;
      case 'compliance': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Governança & Compliance</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <GraduationCap size={16} className="text-blue-500" /> Framework de Gestão Estratégica de TI (Estado de Goiás)
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase">Índice Geral de Maturidade</p>
              <p className="text-xl font-black text-[#0d457a]">89.4%</p>
           </div>
           <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-slate-100 flex items-center justify-center">
              <span className="text-[10px] font-black text-emerald-600">A+</span>
           </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-[28px] w-fit">
        {[
          { id: 'cobit', label: 'COBIT 2019', icon: Target },
          { id: 'itil', label: 'ITIL v4', icon: Workflow },
          { id: 'iso', label: 'ISO 27001', icon: ShieldCheck },
          { id: 'release', label: 'Deploy Policy', icon: Rocket },
          { id: 'drp', label: 'DRP (Contingência)', icon: CloudLightning },
          { id: 'compliance', label: 'LGPD & Jurídico', icon: Scale }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as GovernanceTab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#0d457a] text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        <div className="lg:col-span-3 space-y-8">
          
          {/* Dashboard de Maturidade Superior */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Activity size={180} /></div>
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest">Painel de Alinhamento: {activeTab.toUpperCase()}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">Status de Implementação dos Controles</p>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-blue-600">{getScore(activeTab)}%</span>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${getScore(activeTab)}%`}}></div>
                  </div>
               </div>
            </div>

            {/* CONTEÚDO DINÂMICO POR ABA */}
            {activeTab === 'cobit' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                    <h4 className="text-[11px] font-black text-[#0d457a] uppercase mb-4 flex items-center gap-2">
                       <Target size={16} className="text-blue-500"/> Alinhamento de Objetivos
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                       O GESA Cloud utiliza o domínio **EDM (Evaluate, Direct and Monitor)** para garantir que as emendas parlamentares sigam a legislação estadual, com monitoramento direto via Auditoria Supabase.
                    </p>
                  </div>
                  <div className="p-8 bg-emerald-50/50 rounded-[32px] border border-emerald-100">
                    <h4 className="text-[11px] font-black text-emerald-700 uppercase mb-4 flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-emerald-500"/> Governança de Dados
                    </h4>
                    <ul className="text-[10px] space-y-2 font-bold text-emerald-800/70 uppercase">
                       <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Custódia de Processos SEI</li>
                       <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Transparência Ativa GESA</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                   <div className="absolute bottom-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Cpu size={120}/></div>
                   <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-6">Métrica de Valor de TI</h4>
                   <div className="space-y-6 relative z-10">
                      <div>
                        <p className="text-3xl font-black tracking-tighter">ROI Social: 14.2x</p>
                        <p className="text-[9px] text-blue-400 font-bold uppercase mt-1">Eficiência Burocrática Estimada</p>
                      </div>
                      <div className="pt-6 border-t border-white/10">
                         <p className="text-[9px] font-black text-white/30 uppercase mb-3">Redução de Lead-time</p>
                         <div className="h-1.5 w-full bg-white/10 rounded-full">
                            <div className="h-full bg-blue-400 w-[65%]"></div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'iso' && (
               <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                     <h4 className="text-[11px] font-black text-[#0d457a] uppercase mb-8 flex items-center gap-3">
                        <ClipboardCheck size={18} className="text-blue-500"/> Checklist de Conformidade ISO 27001:2022
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'c1', label: 'Criptografia em Repouso (AES-256)', detail: 'Status: Ativo via Supabase' },
                          { id: 'c2', label: 'Gestão de Identidades e RBAC', detail: 'Status: Políticas RLS Ativas' },
                          { id: 'c3', label: 'Varredura de Vulnerabilidades Semanal', detail: 'Pendente: Próximo Scan em 48h' },
                          { id: 'c4', label: 'Trilha de Auditoria Imutável', detail: 'Status: Audit Log Sync ON' }
                        ].map(check => (
                          <div 
                            key={check.id}
                            onClick={() => toggleCheck(check.id)}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${isoChecks[check.id] ? 'bg-white border-emerald-200 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}
                          >
                             <div>
                                <p className="text-xs font-black text-[#0d457a] uppercase tracking-tight">{check.label}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{check.detail}</p>
                             </div>
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isoChecks[check.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent'}`}>
                                <CheckCircle size={14} />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'drp' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 <div className="bg-[#0d457a] p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10"><CloudLightning size={160} /></div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                       <div className="max-w-md">
                          <h3 className="text-2xl font-black uppercase tracking-tighter">Plano de Recuperação de Desastres</h3>
                          <p className="text-blue-200/60 text-xs font-bold uppercase mt-2 leading-relaxed">
                             Protocolos de alta disponibilidade e reversão de estado para garantir a continuidade do serviço público.
                          </p>
                          <div className="flex flex-wrap gap-4 mt-8">
                            <button 
                                onClick={runDRPSimulation}
                                disabled={drpStatus === 'running' || drpStatus === 'rollback'}
                                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {drpStatus === 'running' ? <RefreshCw className="animate-spin" size={16}/> : <Play size={16}/>}
                                Failover Simulado
                            </button>
                            <button 
                                onClick={handleRollback}
                                disabled={drpStatus === 'running' || drpStatus === 'rollback'}
                                className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {drpStatus === 'rollback' ? <RefreshCw className="animate-spin" size={16}/> : <Undo2 size={16}/>}
                                Rollback de Estado
                            </button>
                          </div>
                       </div>
                       
                       <div className="w-full md:w-80 bg-black/20 rounded-[32px] p-6 font-mono text-[10px] h-64 overflow-y-auto custom-scrollbar border border-white/5 shadow-inner">
                          {drpLogs.length > 0 ? drpLogs.map((log, i) => (
                             <p key={i} className="text-emerald-400 mb-2 leading-relaxed animate-in fade-in slide-in-from-left-2">
                                <span className="text-white/30 mr-2">{i+1}.</span> {log}
                             </p>
                          )) : (
                             <div className="h-full flex flex-col items-center justify-center text-white/20 uppercase font-black text-center">
                                <Server size={32} className="mb-4 opacity-10"/>
                                Aguardando Comando
                             </div>
                          )}
                          <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-amber-50 border border-amber-200 rounded-[32px] flex items-center gap-6 group">
                        <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-900 uppercase">Modo de Segurança</h4>
                            <p className="text-[10px] text-amber-700 font-bold uppercase mt-1">O Rollback reverte o software para o último ponto de restauração verificado pela SEAD/GESA.</p>
                        </div>
                    </div>
                    <div className="p-8 bg-blue-50 border border-blue-200 rounded-[32px] flex items-center gap-6 group">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <ShieldX size={32} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase">Snapshot Imutável</h4>
                            <p className="text-[10px] text-blue-700 font-bold uppercase mt-1">Garantia de que os dados revertidos mantenham a integridade jurídica de cada processo.</p>
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'release' && (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                       <h4 className="text-[11px] font-black text-[#0d457a] uppercase mb-4 flex items-center gap-2">
                          <GitBranch size={16} className="text-purple-500"/> Fluxo de Promoção de Código
                       </h4>
                       <div className="space-y-4">
                          {[
                            { step: 'Dev', status: 'CI-Passed', color: 'text-emerald-500' },
                            { step: 'Staging', status: 'Audit-Pending', color: 'text-amber-500' },
                            { step: 'Prod', status: 'Locked', color: 'text-slate-400' }
                          ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100">
                               <span className="text-xs font-black text-[#0d457a] uppercase">{s.step}</span>
                               <span className={`text-[9px] font-black uppercase ${s.color}`}>{s.status}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-8 bg-slate-900 rounded-[32px] text-white">
                       <h4 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-6">Políticas de Segurança ALM</h4>
                       <ul className="space-y-4">
                          <li className="flex gap-3">
                             <Lock size={16} className="text-blue-400 shrink-0"/>
                             <p className="text-[10px] font-bold text-white/70 uppercase">Escaneamento de dependências via Snyk</p>
                          </li>
                          <li className="flex gap-3">
                             <ShieldCheck size={16} className="text-blue-400 shrink-0"/>
                             <p className="text-[10px] font-bold text-white/70 uppercase">Secrets Detection em todos os Pull Requests</p>
                          </li>
                          <li className="flex gap-3">
                             <CheckCircle2 size={16} className="text-blue-400 shrink-0"/>
                             <p className="text-[10px] font-bold text-white/70 uppercase">Assinatura Digital GPG de Commits</p>
                          </li>
                       </ul>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'compliance' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                  <div className="md:col-span-2 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                    <h4 className="text-[11px] font-black text-[#0d457a] uppercase mb-6 flex items-center gap-3">
                        <Scale size={18} className="text-blue-500"/> Matriz Jurídica e LGPD
                    </h4>
                    <div className="space-y-6 text-xs text-slate-500 leading-relaxed">
                       <p>Todos os processos do GESA Cloud seguem a **Lei Estadual nº 20.918/2020**, garantindo que emendas parlamentares tenham rastreabilidade total.</p>
                       <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-inner">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase mb-3">Privacidade de Dados (Operadores)</h5>
                          <p className="text-[11px] font-medium italic">"Os dados de servidores e gestores são protegidos por políticas de Row Level Security (RLS) e criptografia ponta-a-ponta, acessíveis apenas para fins de auditoria controlada."</p>
                       </div>
                    </div>
                  </div>
                  <div className="bg-[#0d457a] p-8 rounded-[32px] text-white text-center flex flex-col items-center justify-center">
                     <Award size={48} className="text-amber-400 mb-4" />
                     <h4 className="text-xs font-black uppercase mb-2">Selo de Integridade</h4>
                     <p className="text-[9px] font-bold text-blue-200/50 uppercase tracking-widest">GESA Compliance v2.7</p>
                     <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[9px] font-black uppercase tracking-widest">
                        Baixar Certificado
                     </button>
                  </div>
               </div>
            )}

          </div>
        </div>

        {/* Sidebar de Ações de Governança */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
               <History size={18} className="text-blue-500" /> Atividade de Auditoria
             </h4>
             <div className="space-y-6">
                {[
                  { user: 'S. DevOps', act: 'DRP Test', time: '10m ago' },
                  { user: 'Auditoria', act: 'ISO Scan', time: '1h ago' },
                  { user: 'Admin', act: 'Policy Update', time: '4h ago' }
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#0d457a] font-black text-[10px]">{act.user[0]}</div>
                     <div>
                        <p className="text-[10px] font-black text-slate-700 uppercase">{act.act}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{act.time}</p>
                     </div>
                  </div>
                ))}
             </div>
             <button className="w-full mt-10 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-[#0d457a] transition-all rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                Ver Logs Completos
             </button>
          </div>

          <div className="bg-emerald-600 p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><ShieldCheck size={180} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">Status de Segurança</h4>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-xs font-black">
                    <span>WAF/Firewall</span>
                    <span className="text-emerald-200">Active</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-black">
                    <span>MFA Policies</span>
                    <span className="text-emerald-200">Enforced</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-black">
                    <span>Database Encryption</span>
                    <span className="text-emerald-200">AES-256</span>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
