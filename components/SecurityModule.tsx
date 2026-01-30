
import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  Trash2, UserPlus, Shield, Mail, Lock, Eye, EyeOff, Info, 
  UserCheck, Fingerprint, X, ShieldCheck, ClipboardCheck, Loader2, Search, RefreshCw,
  Database, Wifi, WifiOff, Globe, Server
} from 'lucide-react';

interface SecurityModuleProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
  isLoading?: boolean;
  isDbConnected?: boolean; // Nova prop para monitorar conexão
}

const RoleSelect: React.FC<{ value: Role; onChange: (value: Role) => void }> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as Role)}
    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-bold text-slate-600 uppercase text-xs appearance-none"
  >
    {Object.values(Role).map((role) => (
      <option key={role} value={role}>{role}</option>
    ))}
  </select>
);

export const SecurityModule: React.FC<SecurityModuleProps> = ({ 
  users, 
  onAddUser, 
  onDeleteUser, 
  currentUser, 
  isLoading = false,
  isDbConnected = true 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMyData, setShowMyData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    role: Role.OPERATOR,
    password: ''
  });

  const maskEmail = (email: string) => {
    if (!email) return '***';
    if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.SUPER_ADMIN) {
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
    if (newUser.name && newUser.email && newUser.role) {
      onAddUser({
        id: Math.random().toString(36).substr(2, 9),
        tenantId: currentUser.tenantId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department || 'DTI / GESA',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=0d457a&color=fff`,
        lgpdAccepted: false
      } as User);
      setIsModalOpen(false);
      setNewUser({ role: Role.OPERATOR, password: '' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Segurança e Privacidade</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
            <Shield size={14} className="text-blue-500" /> Gestão de Identidades Governamentais (RBAC)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Indicador de Status do Banco de Dados */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 ${isDbConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">
                {isDbConnected ? 'Base Conectada' : 'Base Desconectada'}
            </span>
            {isDbConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          </div>

          <button
            onClick={() => setShowMyData(true)}
            className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
          >
            <Fingerprint size={16} />
            Privacidade LGPD
          </button>
          {(currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#0d457a] text-white px-6 py-3 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest group"
            >
              <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
              Novo Operador
            </button>
          )}
        </div>
      </div>

      {/* Info Card de Infraestrutura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d457a] p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700"><Database size={48} /></div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Host da Base de Dados</p>
            <p className="text-xs font-mono font-bold truncate">nisqwvdrbytsdwtlivjl.supabase.co</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl"><Globe size={20}/></div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Região do Servidor</p>
                <p className="text-xs font-black text-[#0d457a] uppercase tracking-tight">AWS South America (São Paulo)</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Server size={20}/></div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Segurança</p>
                <p className="text-xs font-black text-purple-600 uppercase tracking-tight">TLS 1.3 / AES-256 GCM</p>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou e-mail institucional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase text-slate-600 placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
             {isLoading ? <Loader2 size={16} className="text-[#0d457a] animate-spin" /> : <RefreshCw size={16} className="text-[#0d457a]" />}
             <span className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">
               {isLoading ? 'Sincronizando Base...' : `${users.length} Operadores Ativos`}
             </span>
          </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidade / Cargo</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Corporativo</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Perfil RBAC</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status LGPD</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="mx-auto text-[#0d457a] animate-spin mb-4" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultando Tabela de Perfis...</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=0d457a&color=fff`} alt="" className="w-10 h-10 rounded-2xl shadow-sm border-2 border-white group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-xs font-black text-[#0d457a] uppercase block">{user.name || 'Sem Nome'}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.department || 'DTI / GESA'}</span>
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
                        {user.lgpdAccepted ? (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                            <ShieldCheck size={14} /> Conformidade OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                            <Info size={14} /> Aguardando Aceite
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {(currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN) && user.id !== currentUser.id && (
                        <button 
                          onClick={() => { if(confirm('Revogar acesso deste operador?')) onDeleteUser(user.id); }}
                          className="p-3 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 rounded-xl transition-all shadow-sm"
                          title="Revogar Acesso"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
                    Nenhum colaborador localizado na base de dados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
