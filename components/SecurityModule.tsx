
import React, { useState } from 'react';
import { User, Role, Sector } from '../types';
import { Trash2, UserPlus, Shield, Mail, Building, Lock, Eye, EyeOff, Info, UserCheck, Fingerprint, X, ShieldCheck, ClipboardCheck } from 'lucide-react';

interface SecurityModuleProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
}

export const SecurityModule: React.FC<SecurityModuleProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMyData, setShowMyData] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    role: Role.VIEWER,
    password: ''
  });

  // Função para aplicar máscara LGPD no e-mail (Privacy by Design)
  const maskEmail = (email: string) => {
    if (currentUser.role === Role.ADMIN) return email;
    const [user, domain] = email.split('@');
    return `${user.substring(0, 3)}***@${domain}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.email && newUser.role) {
      onAddUser({
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        password: newUser.password,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=0d457a&color=fff`,
        lgpdAccepted: false
      });
      setIsModalOpen(false);
      setShowPassword(false);
      setNewUser({ role: Role.VIEWER, password: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Segurança e Privacidade</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Gestão de Identidades (RBAC) e Conformidade LGPD.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMyData(true)}
            className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
          >
            <Fingerprint size={16} />
            Meus Dados (LGPD)
          </button>
          {currentUser.role === Role.ADMIN && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#0d457a] text-white px-5 py-2.5 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest"
            >
              <UserPlus size={16} />
              Novo Usuário
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Servidor</th>
              <th className="px-6 py-5 text-[10px] font-black text-[#0d457a] uppercase tracking-widest">E-mail (Mascarado)</th>
              <th className="px-6 py-5 text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Perfil de Acesso</th>
              <th className="px-6 py-5 text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Status LGPD</th>
              <th className="px-6 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-xl shadow-sm" />
                    <span className="text-xs font-black text-[#0d457a] uppercase">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-500">{maskEmail(user.email)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    user.role === Role.ADMIN ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     {user.lgpdAccepted ? (
                       <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase">
                         <ShieldCheck size={14} /> Consentido
                       </span>
                     ) : (
                       <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase">
                         <Info size={14} /> Pendente
                       </span>
                     )}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {currentUser.role === Role.ADMIN && user.id !== currentUser.id && (
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
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

      {/* Modal: Meus Dados (Transparência LGPD) */}
      {showMyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-[#0d457a] p-2.5 rounded-2xl text-white shadow-lg"><Fingerprint size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Transparência de Dados</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Seus dados pessoais no sistema</p>
                </div>
              </div>
              <button onClick={() => setShowMyData(false)} className="p-2 hover:bg-white rounded-xl transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nome Completo</p>
                     <p className="text-sm font-black text-[#0d457a] uppercase">{currentUser.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">E-mail Corporativo</p>
                     <p className="text-sm font-black text-[#0d457a]">{currentUser.email}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Perfil Funcional</p>
                     <p className="text-sm font-black text-[#0d457a] uppercase">{currentUser.role}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ID Único (Sistema)</p>
                     <p className="text-sm font-mono text-[#0d457a]">{currentUser.id}</p>
                  </div>
               </div>

               <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <ClipboardCheck size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Informações Adicionais</h4>
                  </div>
                  <ul className="space-y-2">
                    <li className="text-[11px] text-blue-600 font-bold">• Seu endereço IP é registrado em cada ação por motivos de segurança do Estado.</li>
                    <li className="text-[11px] text-blue-600 font-bold">• Data do consentimento LGPD: {currentUser.lgpdAccepted ? 'Registrado em cache local' : 'Pendente'}.</li>
                    <li className="text-[11px] text-blue-600 font-bold">• Finalidade: Gestão técnica de emendas e processos SEI.</li>
                  </ul>
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex justify-center">
               <button onClick={() => setShowMyData(false)} className="px-10 py-3 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Usuário (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Novo Operador GESA</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configuração de Credenciais Institucionais</p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome Completo</label>
                <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] outline-none font-bold text-slate-700" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Ex: João Silva" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="email" className="w-full pl-14 pr-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] outline-none font-bold text-slate-700" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="usuario@go.gov.br" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Perfil de Acesso</label>
                  <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}>
                    {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Senha Inicial</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] outline-none font-bold text-slate-700" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-[2] py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl">Criar Acesso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
