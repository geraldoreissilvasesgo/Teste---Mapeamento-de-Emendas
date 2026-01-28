
import React, { useState } from 'react';
import { User, Role, Sector } from '../types';
import { Trash2, UserPlus, Shield, Mail, Building, Lock, Eye, EyeOff } from 'lucide-react';

interface SecurityModuleProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const SecurityModule: React.FC<SecurityModuleProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    role: Role.VIEWER,
    password: ''
  });

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
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random&color=fff&background=0d457a`
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
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Controle de Acesso (RBAC)</h2>
          <p className="text-slate-500 text-sm">Gerencie usuários, permissões e vinculação por setor.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0d457a] text-white px-4 py-2 rounded-md hover:bg-[#0a365f] transition-colors shadow-sm uppercase text-xs font-bold tracking-wider"
        >
          <UserPlus size={16} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-4 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Email Institucional</th>
              <th className="px-6 py-4 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Função</th>
              <th className="px-6 py-4 text-xs font-bold text-[#0d457a] uppercase tracking-wider">Setor Vinculado</th>
              <th className="px-6 py-4 text-xs font-bold text-[#0d457a] uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                    <span className="font-semibold text-slate-700 uppercase text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                    ${user.role === Role.ADMIN ? 'bg-[#0d457a] text-white' : 
                      user.role === Role.OPERATOR ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.department ? (
                    <span className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Building size={14} className="text-emerald-600" />
                      {user.department}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDeleteUser(user.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    title="Remover acesso"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d457a] bg-opacity-90 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-lg">
              <h3 className="text-lg font-bold text-[#0d457a] uppercase tracking-wide">Novo Usuário</h3>
              <p className="text-xs text-slate-500 mt-1">Credenciamento e vinculação de setor.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
                  value={newUser.name || ''}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Institucional</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
                    value={newUser.email || ''}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
                    value={newUser.password || ''}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    placeholder="****"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Perfil de Acesso</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none transition-all bg-white"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                  >
                    {Object.values(Role).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Setor (Opcional)</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none transition-all bg-white"
                    value={newUser.department || ''}
                    onChange={e => setNewUser({...newUser, department: e.target.value as Sector})}
                  >
                    <option value="">Nenhum</option>
                    {Object.values(Sector).map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-bold text-xs uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0d457a] text-white rounded-md hover:bg-[#0a365f] font-bold text-xs uppercase shadow-sm transition-colors"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
