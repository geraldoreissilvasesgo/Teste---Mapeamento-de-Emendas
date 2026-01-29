/**
 * PAINEL TÉCNICO DE DADOS
 * 
 * Este componente é uma tela de "documentação viva" voltada para desenvolvedores e
 * administradores de sistema. Ele centraliza e exibe informações cruciais sobre
 * a arquitetura de dados da aplicação.
 * 
 * Funcionalidades:
 * - Exibe a configuração de conexão com o Firebase, facilitando o setup de novos
 *   ambientes de desenvolvimento.
 * - Apresenta os "schemas" (modelos de dados) de cada entidade principal do sistema
 *   (Processo, Usuário, Log, etc.), mostrando os campos e seus tipos esperados.
 * - Lista todos os "enums" (domínios de valores) utilizados, como Status, Perfis, etc.,
 *   o que é essencial para entender as regras de negócio.
 * - Oferece uma funcionalidade de "Copiar" para os blocos de código.
 */
import React, { useState } from 'react';
import { DatabaseZap, Terminal, AlertTriangle, FileJson, Check, Copy, Hash, Database, Users, ShieldAlert, Settings } from 'lucide-react';
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
  // String de configuração do Firebase para exibição.
  const firebaseConfigString = `{\n  apiKey: "AIzaSy-PLACEHOLDER",\n  authDomain: "rastreio-emendas-go.firebaseapp.com",\n  projectId: "rastreio-emendas-go",\n  storageBucket: "rastreio-emendas-go.appspot.com",\n  messagingSenderId: "000000000000",\n  appId: "1:000000000000:web:000000000000"\n}`;

  // Definição simplificada dos schemas para documentação visual.
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
    <div className="space-y-8">
      {/* Cabeçalho do Painel */}
      <div>
        <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter flex items-center gap-3">
          <DatabaseZap size={28}/>
          Painel Técnico de Dados
        </h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Especificação de Conexões, Schemas e Domínios do Sistema GESA.</p>
      </div>

      {/* Seção de Configuração de Conexão */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
        <CodeBlock 
          title="services/firebase.ts"
          code={firebaseConfigString}
          language="javascript"
          alert="ATENÇÃO: Estas são chaves de placeholder. Substitua pelas credenciais REAIS do seu projeto Firebase para habilitar a autenticação."
        />
      </div>

      {/* Seção de Modelos de Dados (Schemas) */}
      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Modelos de Dados (Schemas)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SchemaCard title="Amendment (Processos)" icon={Database} schema={schemas.amendment} />
            <SchemaCard title="User (Usuários)" icon={Users} schema={schemas.user} />
            <SchemaCard title="AuditLog (Auditoria)" icon={ShieldAlert} schema={schemas.auditLog} />
            <SchemaCard title="SectorConfig (Setores)" icon={Settings} schema={schemas.sectorConfig} />
        </div>
      </div>
      
      {/* Seção de Domínios (Enums) */}
      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Domínios e Constantes (Enums)</h3>
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
