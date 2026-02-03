import React, { useState } from 'react';
import { User, Role } from '../types.ts';
import { 
  Trash2, UserPlus, Shield, Mail, Lock, Eye, EyeOff, Info, 
  UserCheck, Fingerprint, X, ShieldCheck, Search, Loader2,
  UserCog, Key, CheckCircle2, Building2, ShieldAlert, FileText,
  AlertCircle, Terminal, Copy, Check, Smartphone
} from 'lucide-react';

interface SecurityModuleProps {
  users: User[];
  onAddUser: (user: any) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
  isLoading?: boolean;
  isDbConnected?: boolean;
  onNavigateToRegister: () => void;
  error?: string | null;
}

export const SecurityModule: React.FC<SecurityModuleProps> = ({ 
  users, 
  onDeleteUser, 
  currentUser, 
  isLoading = false,
  isDbConnected = true,
  onNavigateToRegister,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

  const sqlSetup = `-- GESA CLOUD: ESTRUTURA DE IDENTIDADE GOVERNAMENTAL
-- 1. Criar Tabela de Usuários (Public)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  name text not null,
  email text unique not null,
  role text not null,
  password text, -- Hash de senha para contingência
  department text,
  "avatarUrl" text,
  "lgpdAccepted" boolean default false,
  "mfaEnabled" boolean default false,
  "createdAt" timestamp with time zone default now()
);

-- 2. Habilitar Segurança RLS (Row Level Security)
alter table users enable row level security;

-- 3. Políticas de Acesso Granular
create policy "Acesso por Tenant" on users 
  for select using (true); -- Em prod: auth.uid() match

create policy "Gestão Administrativa" on users 
  for all using (true);`;

  const maskEmail = (email: string) => {
    if (!email) return '***';
    if (!isAdmin) {
      const parts = email.split('@');
      if (parts.length < 2) return '***';
      return `${parts[0].substring(0, 2)}***@${parts[1]}`;
    }
    return email;
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return !term ||
      (u.name?.toLowerCase().includes(term) || false) || 
      (u.email?.toLowerCase().includes(term) || false);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-amber-900/5 mb-8">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center animate-pulse">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900 uppercase">Sincronização com Supabase Necessária</h3>
            <p className="text-xs text-amber-700 font-bold uppercase mt-2 max-w-xl">
              A tabela 'users' ainda não foi provisionada no seu ambiente. O sistema está operando em modo de memória volátil (Mock).
            </p>
          </div>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Ver Script de Migração
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Segurança e LGPD</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-500" /> Governança de Identidade e Dados Pessoais
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-500 ${!error ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${!error ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[9px] font-black uppercase tracking-widest">
                {!error ? 'Banco de Dados Online' : 'Banco Offline (Modo Local)'}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={onNavigateToRegister}
              className="flex items-center gap-3 bg-[#0d457a] text-white px-6 py-4 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest group"
            >
              <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
              Provisionar Servidor
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidade Governamental</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Perfil</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">MFA</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LGPD</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-inter">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#0d457a] text-white flex items-center justify-center font-black text-sm uppercase shadow-sm overflow-hidden">
                        {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : (user.name?.charAt(0) || 'S')}
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#0d457a] uppercase block leading-tight">{user.name}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter mt-1">{maskEmail(user.email)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.role.includes('Admin') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${user.mfaEnabled ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-slate-300 bg-slate-50 border-slate-100'}`}>
                      <Smartphone size={10} /> {user.mfaEnabled ? 'ATIVO' : 'OFF'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${user.lgpdAccepted ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                      <ShieldCheck size={10} /> {user.lgpdAccepted ? 'ACEITO' : 'PENDENTE'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {isAdmin && user.id !== currentUser.id && (
                      <button 
                        onClick={() => { if(confirm('⚠️ CRÍTICO: Revogar acesso deste colaborador?')) onDeleteUser(user.id); }}
                        className="p-3 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm"
                        title="Revogar Acesso"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal SQL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-amber-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Esquema do Banco (users)</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sincronização de Identidade Gov Cloud</p>
               </div>
               <button onClick={() => setIsSqlModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} />
               </button>
            </div>
            <div className="p-10 space-y-6">
               <pre className="bg-slate-900 text-blue-400 p-6 rounded-3xl font-mono text-[11px] overflow-x-auto h-72 border border-white/5 shadow-inner">
                   {sqlSetup}
               </pre>
               <button 
                  onClick={handleCopySql}
                  className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl"
               >
                 {copied ? <Check size={18}/> : <Copy size={18}/>}
                 {copied ? 'Copiado!' : 'Copiar Script SQL'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};