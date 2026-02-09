
import React, { useState } from 'react';
import { ShieldAlert, Terminal, Copy, Check, X, Database, Info, Zap } from 'lucide-react';

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
  const hasErrors = missingTables.length > 0;

  const sqlScripts: Record<string, string> = {
    enable_realtime: `-- HABILITAR SINCRONIZAÇÃO EM TEMPO REAL (CONCORRÊNCIA MULTIUSUÁRIO)
-- Execute este script para que as mudanças apareçam instantaneamente para todos os operadores.

BEGIN;
  -- 1. Cria a publicação de Realtime se não existir
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;

  -- 2. Adiciona as tabelas do GESA Cloud à publicação
  ALTER PUBLICATION supabase_realtime ADD TABLE amendments, users, sectors, statuses, audit_logs;

  -- 3. Habilita Replica Identity Full para detectar mudanças completas em tempo real
  ALTER TABLE amendments REPLICA IDENTITY FULL;
  ALTER TABLE users REPLICA IDENTITY FULL;
  ALTER TABLE sectors REPLICA IDENTITY FULL;
  ALTER TABLE statuses REPLICA IDENTITY FULL;
  ALTER TABLE audit_logs REPLICA IDENTITY FULL;
COMMIT;`,
    
    setup_rls: `-- CONFIGURAR SEGURANÇA E ISOLAMENTO (SaaS / TENANT ISOLATION)
-- Garante que operadores de uma secretaria não vejam dados de outra.

BEGIN;
  -- Habilitar Row Level Security
  ALTER TABLE amendments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

  -- Criar Políticas de Acesso por TenantId
  CREATE POLICY "Isolamento por Secretaria" ON amendments 
    FOR ALL USING (tenantId = (auth.jwt() ->> 'tenantId'));

  CREATE POLICY "Acesso a Perfis da Secretaria" ON users 
    FOR SELECT USING (tenantId = (auth.jwt() ->> 'tenantId'));

  CREATE POLICY "Escrita de Auditoria Protegida" ON audit_logs 
    FOR INSERT WITH CHECK (tenantId = (auth.jwt() ->> 'tenantId'));
COMMIT;`,

    setup_tables: `-- SETUP ESTRUTURAL DAS TABELAS (GESA CLOUD CORE)
CREATE TABLE IF NOT EXISTS amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL DEFAULT 'GOIAS',
  code TEXT,
  "seiNumber" TEXT NOT NULL,
  year INTEGER,
  type TEXT,
  "deputyName" TEXT,
  municipality TEXT,
  "beneficiaryUnit" TEXT,
  object TEXT,
  value NUMERIC,
  status TEXT,
  "currentSector" TEXT,
  movements JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "entryDate" DATE,
  suinfra BOOLEAN DEFAULT FALSE,
  sutis BOOLEAN DEFAULT FALSE,
  "transferMode" TEXT,
  gnd TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL DEFAULT 'GOIAS',
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  "avatarUrl" TEXT,
  "api_key" TEXT,
  "lgpdAccepted" BOOLEAN DEFAULT FALSE,
  "mfaEnabled" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL DEFAULT 'GOIAS',
  "actorId" TEXT,
  "actorName" TEXT,
  action TEXT NOT NULL,
  details TEXT,
  severity TEXT DEFAULT 'INFO',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasErrors && !selectedTable) return null;

  return (
    <>
      {hasErrors && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500 no-print">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-900/5">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight leading-none">Ambiente de Dados Incompleto</h3>
                <p className="text-[10px] text-amber-700 font-bold uppercase mt-2">
                  Tabelas ausentes detectadas no Supabase. O sistema está operando em Modo Simulação.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {missingTables.map(([table]) => (
                    <span key={table} className="px-2 py-1 bg-amber-200/50 text-amber-800 rounded-lg text-[8px] font-black uppercase">
                      {table}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setSelectedTable('enable_realtime')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
              >
                <Zap size={14} /> Ativar Concorrência
              </button>
              <button 
                onClick={() => setSelectedTable('setup_tables')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-amber-200 text-amber-700 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
              >
                <Terminal size={14} /> Scripts de Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTable && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-emerald-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Script de Robustez</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sincronização e Segurança Real-time</p>
                  </div>
               </div>
               <button onClick={() => setSelectedTable(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} />
               </button>
            </div>
            <div className="p-10 space-y-6">
               <div className="relative group">
                  <pre className="bg-slate-900 text-emerald-400 p-8 rounded-[32px] font-mono text-[11px] overflow-x-auto h-80 border border-white/5 shadow-inner custom-scrollbar">
                      {sqlScripts[selectedTable]}
                  </pre>
                  <button 
                    onClick={() => handleCopy(sqlScripts[selectedTable])}
                    className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-sm"
                    title="Copiar Código"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
               </div>
               <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <Info size={20} className="text-blue-500 shrink-0" />
                  <p className="text-[10px] text-blue-700 font-bold uppercase leading-relaxed">
                    A ativação do Realtime e RLS é fundamental para garantir que múltiplos operadores trabalhem simultaneamente sem conflitos, respeitando o isolamento jurídico de cada Secretaria de Goiás.
                  </p>
               </div>
               
               {selectedTable === 'enable_realtime' && (
                 <button 
                  onClick={() => setSelectedTable('setup_rls')}
                  className="w-full py-4 text-emerald-600 font-black uppercase text-[10px] tracking-[0.2em] border-2 border-emerald-100 rounded-2xl hover:bg-emerald-50 transition-all mb-2"
                 >
                   Ver Próximo Passo: Segurança RLS
                 </button>
               )}

               <button 
                  onClick={() => handleCopy(sqlScripts[selectedTable])}
                  className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-[#0a365f] transition-all"
               >
                 {copied ? <Check size={18}/> : <Terminal size={18}/>}
                 {copied ? 'Copiado!' : 'Copiar Script SQL'}
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
