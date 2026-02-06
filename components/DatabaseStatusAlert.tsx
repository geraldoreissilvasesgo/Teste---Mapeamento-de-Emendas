
import React, { useState } from 'react';
import { ShieldAlert, Terminal, Copy, Check, X, Database, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DatabaseStatusAlertProps {
  errors: {
    users?: string;
    sectors?: string;
    statuses?: string;
    amendments?: string;
    audit?: string;
  };
}

export const DatabaseStatusAlert: React.FC<DatabaseStatusAlertProps> = ({ errors }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const missingTables = Object.entries(errors).filter(([_, value]) => value === 'DATABASE_SETUP_REQUIRED');
  
  if (missingTables.length === 0) return null;

  const sqlScripts: Record<string, string> = {
    master_fix: `-- EXECUTE ESTE SCRIPT PARA LIBERAR TUDO
-- 1. Ativar extensão de ID
create extension if not exists pgcrypto;

-- 2. Garantir permissões de esquema para a API
grant usage on schema public to anon;
grant usage on schema public to authenticated;
grant all on all tables in schema public to anon;
grant all on all sequences in schema public to anon;
grant all on all functions in schema public to anon;

-- 3. Resetar políticas RLS para modo livre (Desenvolvimento)
alter table if exists users disable row level security;
alter table if exists sectors disable row level security;
alter table if exists statuses disable row level security;
alter table if exists amendments disable row level security;
alter table if exists audit_logs disable row level security;`,

    amendments: `-- TABELA DE EMENDAS (ESTRUTURA GOIÁS)
create table if not exists amendments (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  code text,
  "seiNumber" text not null,
  year integer,
  type text,
  "deputyName" text,
  municipality text,
  "beneficiaryUnit" text,
  object text,
  value numeric(15,2),
  status text,
  "currentSector" text,
  movements jsonb default '[]'::jsonb,
  "createdAt" timestamp with time zone default now(),
  "entryDate" date,
  suinfra boolean default false,
  sutis boolean default false
);

-- Liberar acesso total
alter table amendments disable row level security;
grant all on amendments to anon;`,

    users: `-- TABELA DE USUÁRIOS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  name text not null,
  email text unique not null,
  role text not null,
  password text,
  department text,
  "avatarUrl" text,
  "lgpdAccepted" boolean default false,
  "mfaEnabled" boolean default false,
  "createdAt" timestamp with time zone default now()
);
alter table users disable row level security;
grant all on users to anon;`,

    sectors: `-- TABELA DE SETORES
create table if not exists sectors (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  name text not null,
  "defaultSlaDays" integer default 5,
  "analysisType" text,
  "createdAt" timestamp with time zone default now()
);
alter table sectors disable row level security;
grant all on sectors to anon;`,

    statuses: `-- TABELA DE STATUS
create table if not exists statuses (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  name text not null,
  color text default '#0d457a',
  "isFinal" boolean default false,
  "createdAt" timestamp with time zone default now()
);
alter table statuses disable row level security;
grant all on statuses to anon;`
  };

  const handleCopy = (table: string) => {
    navigator.clipboard.writeText(sqlScripts[table]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8 animate-in slide-in-from-top duration-500">
      <div className="bg-red-50 border-2 border-red-200 rounded-[32px] overflow-hidden shadow-xl shadow-red-900/5">
        <div className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert size={40} />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-red-900 uppercase tracking-tight">Falha de Gravação Detectada</h3>
            <p className="text-xs font-bold text-red-700 uppercase mt-2 leading-relaxed">
              O banco de dados não está aceitando novos registros. Isso geralmente é causado por falta de permissão <b>GRANT</b> no Supabase.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
               <button 
                 onClick={() => setSelectedTable('master_fix')}
                 className="px-6 py-3 bg-[#0d457a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
               >
                 <ShieldCheck size={16} /> Corrigir Permissões (Master)
               </button>
               {missingTables.map(([key]) => (
                 <button 
                   key={key}
                   onClick={() => setSelectedTable(key)}
                   className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                 >
                   <Terminal size={14} /> Criar {key}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      {selectedTable && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Script de Reparo: {selectedTable}</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Copie e cole no SQL Editor do Supabase</p>
               </div>
               <button onClick={() => setSelectedTable(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} />
               </button>
            </div>
            <div className="p-8 space-y-6">
               <pre className="bg-slate-900 text-blue-400 p-6 rounded-3xl font-mono text-[11px] overflow-x-auto h-80 border border-white/5 shadow-inner leading-relaxed">
                   {sqlScripts[selectedTable]}
               </pre>
               <button 
                  onClick={() => handleCopy(selectedTable)}
                  className="w-full py-6 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-600 transition-all"
               >
                 {copied ? <Check size={20}/> : <Copy size={20}/>}
                 {copied ? 'Copiado! Agora execute no Supabase' : 'Copiar Script para Área de Transferência'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
