import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  Trash2, UserPlus, Shield, Mail, Lock, Eye, EyeOff, Info, 
  UserCheck, Fingerprint, X, ShieldCheck, Search, Loader2,
  UserCog, Key, CheckCircle2, Building2, ShieldAlert, FileText,
  AlertCircle
} from 'lucide-react';

interface SecurityModuleProps {
  users: User[];
  onAddUser: (user: any) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
  isLoading?: boolean;
  isDbConnected?: boolean;
}

export const SecurityModule: React.FC<SecurityModuleProps> = ({ 
  users, 
  onAddUser, 
  onDeleteUser, 
  currentUser, 
  isLoading = false,
  isDbConnected = true 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [lgpdConfirmation, setLgpdConfirmation] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '',
    email: '',
    role: Role.OPERATOR,
    password: '',
    department: 'SES/SUBIPEI'
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdConfirmation) {
      alert("É necessário confirmar a ciência dos termos da LGPD para prosseguir.");
      return;
    }
    if (newUser.name && newUser.email && newUser.role && newUser.password) {
      onAddUser(newUser);
      setIsModalOpen(false);
      setLgpdConfirmation(false);
      setNewUser({ name: '', email: '', role: Role.OPERATOR, password: '', department: 'SES/SUBIPEI' });
    } else {
      alert("Preencha todos os campos obrigatórios.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Segurança e LGPD</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
            <Shield size={14} className="text-blue-500" /> Governança de Identidade e Dados Pessoais
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 ${isDbConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">
                {isDbConnected ? 'Base Conectada' : 'Base Desconectada'}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#0d457a] text-white px-6 py-3 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest group"
            >
              <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
              Cadastrar Novo Colaborador
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou e-mail corporativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase text-slate-600 placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
             <span className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">
               {users.length} Colaboradores Ativos
             </span>
          </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidade Governamental</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Institucional</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Perfil de Acesso</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Consentimento LGPD</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-inter">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#0d457a] text-white flex items-center justify-center font-black text-sm uppercase">
                        {user.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#0d457a] uppercase block leading-tight">{user.name || 'Servidor GESA'}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.department || 'SES/SUBIPEI'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-slate-500">{maskEmail(user.email)}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${
                      user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN ? 'bg-red-50 text-red-600 border-red-100' : 
                      user.role === Role.VIEWER ? 'bg-slate-50 text-slate-500 border-slate-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1 rounded-lg border ${user.lgpdAccepted ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                        {/* Fix: AlertCircle was missing from imports, but used here */}
                        {user.lgpdAccepted ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                        {user.lgpdAccepted ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {isAdmin && user.id !== currentUser.id && (
                      <button 
                        onClick={() => { if(confirm('Deseja realmente revogar o acesso deste colaborador?')) onDeleteUser(user.id); }}
                        className="p-3 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 rounded-xl transition-all shadow-sm"
                        title="Revogar Acesso"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#0d457a] text-white rounded-2xl shadow-lg"><UserPlus size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Novo Colaborador</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Provisionamento de Identidade GESA Cloud</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome Completo do Servidor</label>
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

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Perfil RBAC</label>
                      <select 
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 uppercase text-xs outline-none"
                      >
                        <option value={Role.OPERATOR}>Operador GESA</option>
                        <option value={Role.VIEWER}>Consultor Externo</option>
                        <option value={Role.ADMIN}>Administrador de Unidade</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Lotação / Gerência</label>
                      <input 
                        type="text" 
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs" 
                        placeholder="EX: SES/SUBIPEI/GESA"
                      />
                   </div>
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
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                 <div className="flex items-start gap-3">
                   <ShieldAlert size={18} className="text-blue-500 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed">
                     Ao cadastrar, você declara que este colaborador possui vínculo institucional e que o tratamento de seus dados pessoais será realizado exclusivamente para fins de auditoria pública.
                   </p>
                 </div>
                 <label className="flex items-center gap-3 p-3 bg-white/50 rounded-xl cursor-pointer hover:bg-white transition-all">
                    <input 
                      type="checkbox" 
                      checked={lgpdConfirmation}
                      onChange={(e) => setLgpdConfirmation(e.target.checked)}
                      className="w-5 h-5 rounded border-blue-200 text-[#0d457a]"
                    />
                    <span className="text-[9px] font-black text-[#0d457a] uppercase">Confirmo ciência dos termos de privacidade e LGPD</span>
                 </label>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-[#0a365f] transition-all"
              >
                Finalizar Cadastro <CheckCircle2 size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};