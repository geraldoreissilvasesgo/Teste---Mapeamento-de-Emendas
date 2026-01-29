/**
 * MÓDULO DE SEGURANÇA E PRIVACIDADE
 * 
 * Este componente é responsável pela gestão de usuários e pela conformidade com a LGPD.
 * Administradores podem adicionar novos usuários e remover existentes. Todos os usuários
 * podem visualizar seus próprios dados coletados pelo sistema, garantindo transparência.
 * 
 * Funcionalidades:
 * - Listagem de usuários com informações de perfil e status de consentimento LGPD.
 * - Máscara de e-mail para usuários não-administradores (Privacy by Design).
 * - Modal para cadastro de novos usuários (disponível apenas para Admins).
 * - Modal de "Meus Dados" para que o usuário veja as informações que o sistema armazena sobre ele.
 * - Ação de exclusão de usuários (disponível apenas para Admins).
 */
import React, { useState } from 'react';
import { User, Role, Sector } from '../types';
import { Trash2, UserPlus, Shield, Mail, Building, Lock, Eye, EyeOff, Info, UserCheck, Fingerprint, X, ShieldCheck, ClipboardCheck } from 'lucide-react';

// Define a estrutura das props que o componente espera receber.
interface SecurityModuleProps {
  users: User[];                          // Lista de todos os usuários do sistema.
  onAddUser: (user: User) => void;        // Callback para adicionar um novo usuário.
  onDeleteUser: (id: string) => void;     // Callback para remover um usuário.
  currentUser: User;                      // Dados do usuário logado para controle de permissões.
}

const RoleSelect: React.FC<{ value: Role; onChange: (value: Role) => void }> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as Role)}
    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
  >
    {Object.values(Role).map((role) => (
      <option key={role} value={role}>{role}</option>
    ))}
  </select>
);

export const SecurityModule: React.FC<SecurityModuleProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  // Estado para controlar a visibilidade do modal de "Novo Usuário".
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para controlar a visibilidade da senha no formulário.
  const [showPassword, setShowPassword] = useState(false);
  // Estado para controlar a visibilidade do modal "Meus Dados".
  const [showMyData, setShowMyData] = useState(false);
  // Estado para armazenar os dados do formulário de novo usuário.
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    role: Role.VIEWER,
    password: ''
  });

  // Função para aplicar máscara LGPD no e-mail. Apenas admins podem ver o e-mail completo.
  const maskEmail = (email: string) => {
    if (currentUser.role === Role.ADMIN) return email;
    const [user, domain] = email.split('@');
    return `${user.substring(0, 3)}***@${domain}`;
  };

  // Manipulador para o envio do formulário de novo usuário.
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
        lgpdAccepted: false // Novo usuário sempre começa com consentimento pendente.
      } as User);
      setIsModalOpen(false);
      setShowPassword(false);
      setNewUser({ role: Role.VIEWER, password: '' }); // Reseta o formulário
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
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
          {/* Botão de "Novo Usuário" visível apenas para administradores */}
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

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
           <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil de Acesso</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status LGPD</th>
              <th className="px-6 py-4 text-right"></th>
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
                  {/* Botão de excluir visível apenas para admins e para usuários diferentes do logado */}
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
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-100 rounded-2xl text-[#0d457a]"><Fingerprint size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Dados Coletados</h3>
                  <p className="text-slate-500 text-sm font-bold">{currentUser.name}</p>
                </div>
              </div>
              <button onClick={() => setShowMyData(false)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-sm text-slate-600">Para fins de segurança e auditoria, o sistema armazena as seguintes informações sobre sua atividade:</p>
              <ul className="space-y-3">
                  <li className="flex items-center gap-3"><ClipboardCheck className="text-emerald-500" size={18}/> <span>Ações de criação, edição e exclusão.</span></li>
                  <li className="flex items-center gap-3"><ClipboardCheck className="text-emerald-500" size={18}/> <span>Datas e horários de acesso.</span></li>
                  <li className="flex items-center gap-3"><ClipboardCheck className="text-emerald-500" size={18}/> <span>Endereço IP e informações do navegador.</span></li>
              </ul>
              <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">Esses dados são tratados em conformidade com a LGPD e a política de segurança da informação do Estado de Goiás.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Usuário (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Novo Operador GESA</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configuração de Credenciais Institucionais</p>
              </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                <div className="relative mt-2">
                  <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all" required/>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail Institucional</label>
                <div className="relative mt-2">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="email" onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all" required/>
                </div>
              </div>
               <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil de Acesso</label>
                <div className="relative mt-2">
                  <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <RoleSelect value={newUser.role!} onChange={(role) => setNewUser({...newUser, role})}/>
                </div>
              </div>
              <div className="pt-4">
                 <button type="submit" className="w-full py-4 bg-[#0d457a] text-white rounded-xl font-black uppercase text-xs shadow-xl hover:bg-[#0a365f] transition-all">
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
