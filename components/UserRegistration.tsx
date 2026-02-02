
import React, { useState } from 'react';
import { Role } from '../types';
import { 
  UserPlus, Shield, Mail, Eye, EyeOff, ShieldCheck, 
  UserCog, Key, CheckCircle2, ShieldAlert, ArrowLeft
} from 'lucide-react';

interface UserRegistrationProps {
  onAddUser: (user: any) => void;
  onBack: () => void;
}

export const UserRegistration: React.FC<UserRegistrationProps> = ({ onAddUser, onBack }) => {
  const [lgpdConfirmation, setLgpdConfirmation] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '',
    email: '',
    role: Role.OPERATOR,
    password: '',
    department: 'SES/SUBIPEI/GESA'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdConfirmation) {
      alert("É necessário confirmar a ciência dos termos da LGPD para prosseguir.");
      return;
    }
    if (newUser.name && newUser.email && newUser.role && newUser.password) {
      onAddUser(newUser);
      setLgpdConfirmation(false);
      setNewUser({ name: '', email: '', role: Role.OPERATOR, password: '', department: 'SES/SUBIPEI/GESA' });
      alert("Solicitação de provisionamento enviada com sucesso!");
      onBack();
    } else {
      alert("Preencha todos os campos obrigatórios.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Cadastrar Novo Usuário</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
            <Shield size={14} className="text-blue-500" /> Provisionamento de Identidade Governamental
          </p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#0d457a] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Coluna 1: Dados Pessoais e Institucionais */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-widest border-b border-slate-100 pb-2">Dados do Servidor</h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                  <UserCog size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    value={newUser.name} 
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/10" 
                    required 
                    placeholder="NOME COMPLETO"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-mail Corporativo (@goias.gov.br)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="email" 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/10" 
                    required 
                    placeholder="servidor@goias.gov.br"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Lotação / Unidade</label>
                <input 
                  type="text" 
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs" 
                  placeholder="EX: SES/SUBIPEI/GESA"
                />
              </div>
            </div>

            {/* Coluna 2: Segurança e Permissões */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-widest border-b border-slate-100 pb-2">Controle de Acesso</h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Perfil de Permissão (RBAC)</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 uppercase text-xs outline-none"
                >
                  <option value={Role.OPERATOR}>Operador GESA</option>
                  <option value={Role.VIEWER}>Consultor Externo</option>
                  <option value={Role.ADMIN}>Administrador de Unidade</option>
                  <option value={Role.AUDITOR}>Auditor Fiscal</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Senha Provisória</label>
                <div className="relative">
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/10" 
                    required 
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed">
                    Atenção: O novo usuário receberá um e-mail para confirmação da conta. O tratamento dos dados será auditado.
                  </p>
                </div>
                <label className="flex items-center gap-3 p-3 bg-white/50 rounded-xl cursor-pointer hover:bg-white transition-all">
                  <input 
                    type="checkbox" 
                    checked={lgpdConfirmation}
                    onChange={(e) => setLgpdConfirmation(e.target.checked)}
                    className="w-5 h-5 rounded border-blue-200 text-[#0d457a]"
                  />
                  <span className="text-[9px] font-black text-[#0d457a] uppercase leading-tight">Estou ciente da conformidade LGPD deste registro</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-50">
            <button 
              type="submit" 
              className="px-10 py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-[#0a365f] transition-all"
            >
              Confirmar Provisionamento <CheckCircle2 size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
