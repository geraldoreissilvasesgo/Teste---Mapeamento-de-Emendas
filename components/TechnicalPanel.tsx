
/**
 * PAINEL TÉCNICO DE DADOS E INFRAESTRUTURA
 * 
 * Este componente é uma tela de "documentação viva" voltada para desenvolvedores e
 * administradores de sistema. Centraliza informações de arquitetura e monitoramento.
 */
import React, { useState, useEffect } from 'react';
import { DatabaseZap, Terminal, AlertTriangle, FileJson, Check, Copy, Hash, Database, Users, ShieldAlert, Settings, Cpu, Activity, Zap, HardDrive } from 'lucide-react';
import { Role, Status, AmendmentType, TransferMode, GNDType, AnalysisType, AuditAction, AuditSeverity } from '../types';

// Componente reutilizável para exibir blocos de código com destaque.
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
        <div className="p-4 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-3 border-b border-white/10">
          <AlertTriangle size={24} className="mt-0.5 shrink-0"/>
          <p className="leading-relaxed">{alert}</p>
        </div>
      )}
      <pre className="p-6 text-sm overflow-x-auto custom-scrollbar">
        <code className={`language-${language} text-sky-300`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

// Componente reutilizável para exibir um schema de dados.
const SchemaCard: React.FC<{ title: string; icon: React.ElementType; schema: object }> = ({ title, icon: Icon, schema }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <Icon className="text-[#0d457a]" size={20}/>
            <h4 className="text-sm font-black text-[#0d457a] uppercase tracking-wider">{title}</h4>
        </div>
        <pre className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl overflow-x-auto custom-scrollbar">
            {JSON.stringify(schema, null, 2)}
        </pre>
    </div>
);

// Componente reutilizável para exibir os valores de um enum.
const EnumCard: React.FC<{ title: string; enumObject: object }> = ({ title, enumObject }) => (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
            <Hash size={14} className="text-slate-400"/>
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</h5>
        </div>
        <div className="space-y-1">
            {Object.values(enumObject).map(val => (
                <p key={val} className="text-xs font-mono text-[#0d457a] bg-blue-50/50 px-2 py-1 rounded-md">{val}</p>
            ))}
        </div>
    </div>
);

export const TechnicalPanel: React.FC = () => {
  const firebaseConfigString = `{\n  apiKey: "AIzaSy-PLACEHOLDER",\n  authDomain: "rastreio-emendas-go.firebaseapp.com",\n  projectId: "rastreio-emendas-go",\n  storageBucket: "rastreio-emendas-go.appspot.com",\n  messagingSenderId: "000000000000",\n  appId: "1:000000000000:web:000000000000"\n}`;

  // Simulação de Carga (Escalabilidade)
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

  const schemas = {
    amendment: {
      id: "string",
      seiNumber: "string",
      year: "number",
      type: "AmendmentType",
      value: "number",
      status: "Status",
      currentSector: "string",
      movements: "AmendmentMovement[]"
    },
    user: {
      id: "string",
      name: "string",
      email: "string",
      role: "Role",
      lgpdAccepted: "boolean"
    },
    auditLog: {
      id: "string",
      actorId: "string",
      action: "AuditAction",
      severity: "AuditSeverity",
      targetResource: "string",
      timestamp: "string (ISO)"
    },
    sectorConfig: {
      id: "string",
      name: "string",
      defaultSlaDays: "number",
      analysisType: "AnalysisType"
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter flex items-center gap-3">
            <DatabaseZap size={32}/>
            Console Técnico GESA
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Engenharia de Dados, Infraestrutura e Escalabilidade</p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="flex items-center gap-3 px-5 py-3 bg-[#0d457a] text-white rounded-2xl shadow-xl">
                <Zap size={18} className="text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-widest">Sincronização Ativa: {systemLoad.sync.toFixed(1)}%</span>
             </div>
        </div>
      </div>

      {/* Seção de Métricas de Escalabilidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Cpu size={24}/></div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${systemLoad.cpu > 80 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                {systemLoad.cpu > 80 ? 'Carga Alta' : 'Nominal'}
              </span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Processamento (CPU)</p>
           <h3 className="text-3xl font-black text-[#0d457a]">{systemLoad.cpu.toFixed(1)}%</h3>
           <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${systemLoad.cpu}%`}}></div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><HardDrive size={24}/></div>
              <span className="text-[9px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase">Alocada</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Memória em Uso</p>
           <h3 className="text-3xl font-black text-[#0d457a]">{systemLoad.mem.toFixed(1)}%</h3>
           <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${systemLoad.mem}%`}}></div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Activity size={24}/></div>
              <span className="text-[9px] font-black px-3 py-1 bg-purple-50 text-purple-600 rounded-full uppercase">Tempo Real</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vazão (Req/s)</p>
           <h3 className="text-3xl font-black text-[#0d457a]">{systemLoad.throughput.toFixed(0)}</h3>
           <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase">Pico de 450 req/s suportado</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl text-white">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/10 text-emerald-400 rounded-2xl"><Check size={24}/></div>
           </div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Status de Disponibilidade</p>
           <h3 className="text-3xl font-black">99.98%</h3>
           <p className="text-[9px] font-bold text-emerald-400/60 mt-3 uppercase">SLA de Infraestrutura OK</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Variáveis de Ambiente e Conexão</h3>
        <CodeBlock 
          title="Configuração Cloud (Firebase)"
          code={firebaseConfigString}
          language="javascript"
          alert="ATENÇÃO: Estas são chaves de placeholder injetadas no ambiente de testes. Em produção, verifique os segredos do cofre de chaves da Sefaz-GO."
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Estruturas de Dados (Schemas)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SchemaCard title="Amendment (Processos)" icon={Database} schema={schemas.amendment} />
            <SchemaCard title="User (Usuários)" icon={Users} schema={schemas.user} />
            <SchemaCard title="AuditLog (Auditoria)" icon={ShieldAlert} schema={schemas.auditLog} />
            <SchemaCard title="SectorConfig (Setores)" icon={Settings} schema={schemas.sectorConfig} />
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Domínios e Constantes (Enums)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <EnumCard title="Status do Processo" enumObject={Status} />
            <EnumCard title="Perfis de Acesso" enumObject={Role} />
            <EnumCard title="Tipos de Emenda" enumObject={AmendmentType} />
            <EnumCard title="Modo de Transferência" enumObject={TransferMode} />
            <EnumCard title="Natureza da Despesa" enumObject={GNDType} />
            <EnumCard title="Tipo de Análise" enumObject={AnalysisType} />
            <EnumCard title="Ação de Auditoria" enumObject={AuditAction} />
            <EnumCard title="Severidade (Auditoria)" enumObject={AuditSeverity} />
        </div>
      </div>
    </div>
  );
};
