
import React, { useState } from 'react';
import { DatabaseZap, Terminal, AlertTriangle, FileJson, Check, Copy, Hash, Database, Users, ShieldAlert, Settings } from 'lucide-react';
import { Role, Status, AmendmentType, TransferMode, GNDType, AnalysisType, AuditAction, AuditSeverity } from '../types';

const CodeBlock: React.FC<{ title: string, code: string, language?: string, alert?: string }> = ({ title, code, language = 'json', alert }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
        <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <Terminal size={16} /> {title}
        </h4>
        <button 
          onClick={handleCopy}
          className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-600 transition-all"
        >
          {copied ? <><Check size={14} className="text-emerald-400" /> Copiado!</> : <><Copy size={14} /> Copiar</>}
        </button>
      </div>
      
      {alert && (
        <div className="p-4 bg-amber-500/10 text-amber-300 border-b border-amber-500/20 text-xs flex items-center gap-3">
          <AlertTriangle size={24} className="shrink-0" />
          <p className="font-bold leading-tight">{alert}</p>
        </div>
      )}
      
      <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
        <pre><code className={`language-${language} text-xs text-blue-300`}>{code}</code></pre>
      </div>
    </div>
  );
};

const SchemaCard: React.FC<{ title: string; icon: React.ElementType; schema: object }> = ({ title, icon: Icon, schema }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-50 text-[#0d457a] rounded-xl"><Icon size={20} /></div>
            <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest">{title}</h3>
        </div>
        <pre className="text-[10px] bg-slate-50 p-4 rounded-2xl max-h-80 overflow-auto custom-scrollbar">
            {JSON.stringify(schema, null, 2)}
        </pre>
    </div>
);

const EnumCard: React.FC<{ title: string; enumObject: object }> = ({ title, enumObject }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{title}</h4>
        <div className="space-y-1">
            {Object.entries(enumObject).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-[10px] font-bold text-slate-500">{key}</span>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">{value}</span>
                </div>
            ))}
        </div>
    </div>
);

export const TechnicalPanel: React.FC = () => {
  const firebaseConfigString = `{
  apiKey: "AIzaSy-PLACEHOLDER",
  authDomain: "rastreio-emendas-go.firebaseapp.com",
  projectId: "rastreio-emendas-go",
  storageBucket: "rastreio-emendas-go.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
}`;

  // Simplified schemas for display
  const schemas = {
    amendment: {
      id: "string (PK)",
      code: "string",
      seiNumber: "string (Unique)",
      year: "number",
      type: "Enum (AmendmentType)",
      deputyName: "string | null",
      municipality: "string",
      object: "string",
      value: "number",
      status: "Enum (Status)",
      currentSector: "string",
      movements: "Array<AmendmentMovement>",
      gnd: "Enum (GNDType)",
      createdAt: "ISOString"
    },
    user: {
      id: "string (PK, Firebase UID)",
      name: "string",
      email: "string (Unique)",
      role: "Enum (Role)",
      lgpdAccepted: "boolean",
      mfaEnabled: "boolean",
    },
    auditLog: {
        id: "string (PK)",
        actorId: "string (FK -> User)",
        actorName: "string",
        action: "Enum (AuditAction)",
        severity: "Enum (AuditSeverity)",
        targetResource: "string",
        timestamp: "ISOString",
        ipAddress: "string",
        payloadBefore: "string (JSON) | null",
        payloadAfter: "string (JSON) | null"
    },
    sectorConfig: {
        id: "string (PK)",
        name: "string (Unique)",
        defaultSlaDays: "number",
        analysisType: "Enum (AnalysisType)"
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter flex items-center gap-3">
          <DatabaseZap className="text-blue-500" /> Painel Técnico de Dados
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mt-1">Especificação de Conexões, Schemas e Domínios do Sistema GESA.</p>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
        <h3 className="text-base font-black text-[#0d457a] uppercase tracking-widest mb-6 flex items-center gap-3">
            <Terminal size={20} /> Configuração de Conexão (Firebase)
        </h3>
        <CodeBlock 
          title="firebase.ts"
          code={firebaseConfigString}
          language="javascript"
          alert="ATENÇÃO: Estas são chaves de placeholder. Substitua pelas credenciais REAIS do seu projeto Firebase para habilitar a autenticação em produção."
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-black text-[#0d457a] uppercase tracking-widest mb-4 flex items-center gap-3 ml-2">
            <FileJson size={20} /> Modelos de Dados (Schemas)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SchemaCard title="Amendment (Processos)" icon={Database} schema={schemas.amendment} />
            <SchemaCard title="User (Servidores)" icon={Users} schema={schemas.user} />
            <SchemaCard title="AuditLog (Auditoria)" icon={ShieldAlert} schema={schemas.auditLog} />
            <SchemaCard title="SectorConfig (Setores)" icon={Settings} schema={schemas.sectorConfig} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-base font-black text-[#0d457a] uppercase tracking-widest mb-4 flex items-center gap-3 ml-2">
            <Hash size={20} /> Domínios e Constantes (Enums)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <EnumCard title="Status do Processo" enumObject={Status} />
            <EnumCard title="Perfis de Acesso" enumObject={Role} />
            <EnumCard title="Tipo de Recurso" enumObject={AmendmentType} />
            <EnumCard title="Modalidade Repasse" enumObject={TransferMode} />
            <EnumCard title="Natureza Despesa" enumObject={GNDType} />
            <EnumCard title="Tipo de Análise" enumObject={AnalysisType} />
            <EnumCard title="Ações de Auditoria" enumObject={AuditAction} />
            <EnumCard title="Severidade (Auditoria)" enumObject={AuditSeverity} />
        </div>
      </div>
    </div>
  );
};
