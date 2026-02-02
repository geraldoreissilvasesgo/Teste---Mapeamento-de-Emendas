
import React from 'react';
import { 
  LayoutDashboard, FileText, Database, ShieldCheck, 
  LogOut, Menu, X, Bell, Globe, ChevronDown, Sparkles,
  BarChart3, History, Layers, Lock, BookOpen, Braces, Activity, FileCode, Terminal, Tag, UserPlus
} from 'lucide-react';
import { User, Role } from '../types';
import { APP_VERSION } from '../constants';

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

  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

  const menuSections = [
    {
      label: 'Operacional',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'amendments', label: 'Processos SEI', icon: FileText },
        { id: 'repository', label: 'Repositório Central', icon: Database },
      ]
    },
    {
      label: 'Gestão e Fluxo',
      items: [
        { id: 'reports', label: 'Relatórios Analíticos', icon: BarChart3 },
        { id: 'sectors', label: 'Unidades Técnicas', icon: Layers },
        { id: 'statuses', label: 'Estados do Ciclo', icon: Tag },
      ]
    },
    {
      label: 'Governança e Segurança',
      items: [
        { id: 'audit', label: 'Trilha de Auditoria', icon: History },
        { id: 'security', label: 'Segurança & LGPD', icon: Lock },
        ...(isAdmin ? [{ id: 'register-user', label: 'Cadastrar Usuário', icon: UserPlus }] : []),
        { id: 'docs', label: 'Base de Governança', icon: BookOpen },
      ]
    },
    {
      label: 'Suporte Técnico',
      items: [
        { id: 'api', label: 'Gateway de APIs', icon: Braces },
        { id: 'debugger', label: 'Engine Telemetry', icon: Terminal },
        { id: 'qa', label: 'Health Diagnosis', icon: Activity },
        { id: 'manual', label: 'Manual do Sistema', icon: FileCode },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-inter">
      <aside 
        aria-label="Menu principal"
        className={`bg-[#0d457a] text-white transition-all duration-300 flex flex-col z-50 shadow-2xl no-print border-r border-white/5 ${isSidebarOpen ? 'w-72' : 'w-20'}`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-white text-[#0d457a] p-2.5 rounded-2xl shadow-lg shrink-0">
            <ShieldCheck size={24} />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in duration-300">
              <h1 className="font-black text-white text-sm uppercase tracking-tighter leading-none">GESA <span className="text-emerald-400">Cloud</span></h1>
              <p className="text-[8px] font-black uppercase tracking-widest text-blue-200/50 mt-1">Sistemas Estruturantes</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {isSidebarOpen && (
                <h3 className="px-4 text-[9px] font-black text-blue-200/30 uppercase tracking-[0.2em] mb-2 mt-4 first:mt-0">
                  {section.label}
                </h3>
              )}
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group ${
                      isActive 
                        ? 'bg-white text-[#0d457a] font-black shadow-xl shadow-blue-900/20' 
                        : 'hover:bg-white/10 text-blue-100/70 hover:text-white'
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon 
                      size={18} 
                      className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#0d457a]' : 'text-blue-200/50 group-hover:text-blue-100'}`} 
                    />
                    {isSidebarOpen && (
                      <span className="text-[10px] uppercase tracking-widest truncate">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-4 px-4 py-3 text-red-200 hover:bg-red-500/20 rounded-xl transition-all group"
          >
            <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40 no-print shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black text-[#0d457a] uppercase tracking-tight">{activeDept?.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
               <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black text-[#0d457a] leading-none">{currentUser.name}</p>
                 <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{currentUser.role}</p>
               </div>
               <img src={currentUser.avatarUrl} className="w-9 h-9 rounded-xl shadow-md border-2 border-white" alt="Avatar" />
             </div>
             
             <button className="relative p-2 text-slate-400 hover:text-[#0d457a] transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] print:p-0 print:bg-white print:overflow-visible custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
