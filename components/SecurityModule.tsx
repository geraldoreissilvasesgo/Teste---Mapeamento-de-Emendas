import React, { useState } from 'react';
import { User, Role } from '../types';
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

  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

  const maskEmail = (email: string) => {
    if (!email) return '***';
    if (!isAdmin) {
      const parts = email.split('@');
      if (parts.length < 2) return '***';
      return `${parts[0].substring(0, 2)}***@${parts[1]}`;
    }
    return email;
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return !term ||
      (u.name?.toLowerCase().includes(term) || false) || 
      (u.email?.toLowerCase().includes(term) || false);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
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
                        {user.name?.charAt(0) || 'S'}
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
    </div>
  );
};