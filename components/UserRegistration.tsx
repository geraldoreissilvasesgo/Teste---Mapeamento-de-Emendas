import React, { useState, useMemo } from 'react';
import { Role, ROLE_METADATA } from '../types.ts';
import { useNotification } from '../context/NotificationContext.tsx';
import { 
  UserPlus, Shield, Mail, Eye, EyeOff, ShieldCheck, 
  UserCog, Key, CheckCircle2, ShieldAlert, ArrowLeft,
  Lock, Check, Info, Building2, UserCircle2, Sparkles,
  ShieldQuestion, Fingerprint, Activity, Smartphone
} from 'lucide-react';

interface UserRegistrationProps {
  onAddUser: (user: any) => void;
  onBack: () => void;
}

export const UserRegistration: React.FC<UserRegistrationProps> = ({ onAddUser, onBack }) => {
  const { notify } = useNotification();
  const [lgpdConfirmation, setLgpdConfirmation] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '',
    email: '',
    role: Role.OPERATOR,
    password: '',
    department: 'SES/SUBIPEI/GESA',
    mfaEnabled: false
  });

  const passStrength = useMemo(() => {
    const p = newUser.password;
    if (!p) return 0;
    let strength = 0;
    if (p.length >= 6) strength += 25;
    if (/[A-Z]/.test(p)) strength += 25;
    if (/[0-9]/.test(p)) strength += 25;
    if (/[^A-Za-z0-9]/.test(p)) strength += 25;
    return strength;
  }, [newUser.password]);

  const getStrengthColor = () => {
    if (passStrength <= 25) return 'bg-red-500';
    if (passStrength <= 50) return 'bg-amber-500';
    if (passStrength <= 75) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const validateEmail = (email: string) => {
    const domains = ['@goias.gov.br', '@gestao.go.gov.br'];
    return domains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lgpdConfirmation) {
      notify('warning', 'Consentimento LGPD', 'O servidor deve aceitar os termos de privacidade.');
      return;
    }

    if (!validateEmail(newUser.email)) {
      notify('error', 'E-mail Inválido', 'Utilize e-mail @goias.gov.br.');
      return;
    }

    if (newUser.name && newUser.email && newUser.role && newUser.password) {
      onAddUser({ ...newUser, lgpdAccepted: lgpdConfirmation });
    } else {
      notify('error', 'Campos Vazios', 'Preencha todos os campos obrigatórios.');
    }
  };

  const selectedRoleData = ROLE_METADATA[newUser.role];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Provisionamento</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <UserPlus size={16} className="text-blue-500" /> Cadastro de Novo Colaborador GESA
          </p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#0d457a] uppercase tracking-widest transition-all bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <ArrowLeft size={16} /> Cancelar Operação
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-200 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                <input 
                  type="text" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/10 transition-all text-xs" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo *</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/10 transition-all text-xs" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade de Lotação</label>
                <input 
                  type="text" 
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Provisória *</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/10 transition-all text-xs" 
                    required 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 pb-4 border-t border-slate-100">
               <label className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl cursor-pointer group hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-2xl transition-all ${newUser.mfaEnabled ? 'bg-purple-600 text-white' : 'bg-white text-slate-300'}`}>
                        <Smartphone size={24} />
                     </div>
                     <div>
                        <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest">Exigir MFA (2FA)</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Obrigar autenticação via dispositivo móvel</p>
                     </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={newUser.mfaEnabled} 
                    onChange={(e) => setNewUser({...newUser, mfaEnabled: e.target.checked})}
                    className="w-6 h-6 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500"
                  />
               </label>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Object.entries(ROLE_METADATA).map(([role, data]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setNewUser({...newUser, role: role as Role})}
                    className={`relative p-6 rounded-[32px] border-2 text-left transition-all ${
                      newUser.role === role ? `${data.borderColor} ${data.lightColor} ring-8 ring-blue-500/5` : 'bg-white border-slate-100 opacity-60'
                    }`}
                  >
                    <h5 className={`text-[11px] font-black uppercase tracking-widest mb-1.5 ${data.textColor}`}>{data.label}</h5>
                    <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">{data.description}</p>
                  </button>
                ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
             <div className="p-8 bg-blue-50 rounded-[36px] border border-blue-100">
                <label className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={lgpdConfirmation}
                      onChange={(e) => setLgpdConfirmation(e.target.checked)}
                      className="w-6 h-6 rounded-lg border-blue-200 text-[#0d457a] focus:ring-blue-500"
                    />
                  <span className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest leading-relaxed">Declaro ciência das políticas de sigilo de dados do Estado de Goiás (Lei 20.918/2020).</span>
                </label>
             </div>
             
             <button type="submit" className="w-full py-6 bg-[#0d457a] text-white rounded-[28px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-4">
              Confirmar Registro <CheckCircle2 size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-10 rounded-[48px] border transition-all ${selectedRoleData.borderColor} ${selectedRoleData.lightColor} shadow-sm sticky top-8`}>
             <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mb-10 ${selectedRoleData.textColor}`}>
               <Fingerprint size={18} /> Privilégios do Perfil
             </h3>
             <div className="space-y-4">
                {selectedRoleData.permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/70 p-5 rounded-2xl border border-white shadow-sm">
                     <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedRoleData.color} text-white shadow-sm shrink-0`}>
                        <Check size={14} strokeWidth={3} />
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRoleData.textColor}`}>{perm}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};