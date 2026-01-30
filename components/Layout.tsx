
import React from 'react';
import { 
  LayoutDashboard, FileText, Database, ShieldCheck, 
  LogOut, Menu, X, Bell, Globe, ChevronDown, Sparkles,
  BarChart3, History, Layers, Lock, BookOpen, Braces, Activity
} from 'lucide-react';
import { User, Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: string;
  activeTenantId: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onTenantChange: (id: string) => void;
}

const DEPARTMENTS = [
  { id: 'T-01', name: 'Secretaria da Saúde (SES)' },
  { id: 'T-02', name: 'Secretaria da Educação (SEDUC)' },
  { id: 'T-03', name: 'Infraestrutura (GOINFRA)' }
];

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentUser, currentView, activeTenantId, 
  onNavigate, onLogout, onTenantChange 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const activeDept = DEPARTMENTS.find(d => d.id === activeTenantId);
  
  // Vulnerability Fix: Only SuperAdmin can see the tenant switcher dropdown
  const canSwitchTenant = currentUser.role === Role.SUPER_ADMIN;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'amendments', label: 'Emendas SEI', icon: FileText },
    { id: 'repository', label: 'Repositório', icon: Database },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'audit', label: 'Auditoria', icon: History },
    { id: 'sectors', label: 'Fluxo Mestre', icon: Layers },
    { id: 'security', label: 'Segurança/LGPD', icon: Lock },
    { id: 'docs', label: 'Governança', icon: BookOpen },
    { id: 'api', label: 'API Portal', icon: Braces },
    { id: 'qa', label: 'Diagnóstico', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-inter">
      {/* Sidebar - Cor Institucional Goiás Blue */}
      <aside className={`bg-[#0d457a] text-white transition-all duration-300 flex flex-col z-50 shadow-2xl ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-white text-[#0d457a] p-2 rounded-xl shadow-lg">
            <ShieldCheck size={24} />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in duration-300">
              <h1 className="font-black text-white text-sm uppercase tracking-tighter leading-none">GESA <span className="text-emerald-400">Cloud</span></h1>
              <p className="text-[8px] font-black uppercase tracking-widest text-blue-200/50 mt-1">Governo de Goiás</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white text-[#0d457a] font-black shadow-lg' : 'hover:bg-white/10 text-blue-100'}`}
              >
                <Icon size={18} className={isActive ? 'text-[#0d457a]' : 'text-blue-200'} />
                {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-200 hover:bg-red-400/20 rounded-xl transition-all">
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Encerrar Sessão</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="relative group">
              <button 
                disabled={!canSwitchTenant}
                className={`flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 transition-all ${canSwitchTenant ? 'hover:border-[#0d457a]' : 'opacity-75 cursor-default'}`}
              >
                <Globe size={14} className="text-[#0d457a]" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{activeDept?.name || 'Carregando...'}</span>
                {canSwitchTenant && <ChevronDown size={14} className="text-slate-300" />}
              </button>
              
              {canSwitchTenant && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 space-y-1">
                    {DEPARTMENTS.map(d => (
                      <button 
                        key={d.id} 
                        onClick={() => onTenantChange(d.id)}
                        className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTenantId === d.id ? 'bg-blue-50 text-[#0d457a]' : 'hover:bg-slate-50 text-slate-500'}`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full border border-purple-100">
                <Sparkles size={12} className="text-purple-500" />
                <span className="text-[8px] font-black text-purple-600 uppercase">RLS Verified</span>
             </div>
             <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-lg shadow-sm" alt="Avatar" />
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-slate-900 leading-none">{currentUser.name}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{currentUser.role}</p>
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
};
