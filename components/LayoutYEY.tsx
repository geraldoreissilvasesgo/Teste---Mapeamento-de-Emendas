
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, BarChart3, 
  LogOut, Menu, X, ShieldCheck, Database, 
  UploadCloud, ShieldAlert, TestTube2, 
  Braces, BookOpen, Bug, Landmark
} from 'lucide-react';
import { User, Role } from '../types';
import { APP_VERSION } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentUser, currentView, 
  onNavigate, onLogout 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 1024;
      setIsDesktop(desktop);
      if (desktop) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.ADMIN, Role.OPERATOR, Role.AUDITOR, Role.SUPER_ADMIN, Role.VIEWER] },
    { id: 'amendments', label: 'Processos SEI', icon: FileText, roles: [Role.ADMIN, Role.OPERATOR, Role.SUPER_ADMIN] },
    { id: 'import', label: 'Importação', icon: UploadCloud, roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'repository', label: 'Repositório', icon: Landmark, roles: [Role.ADMIN, Role.AUDITOR, Role.SUPER_ADMIN, Role.VIEWER] },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, roles: [Role.ADMIN, Role.AUDITOR, Role.SUPER_ADMIN] },
    { id: 'security', label: 'Segurança', icon: ShieldCheck, roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'audit', label: 'Auditoria', icon: ShieldAlert, roles: [Role.AUDITOR, Role.SUPER_ADMIN] },
    { id: 'testing', label: 'QA / Testes', icon: TestTube2, roles: [Role.SUPER_ADMIN] },
    { id: 'governance', label: 'Governança', icon: BookOpen, roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'api', label: 'API Portal', icon: Braces, roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'debugger', label: 'Debugger', icon: Bug, roles: [Role.SUPER_ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  const handleNavigate = (viewId: string) => {
    onNavigate(viewId);
    if (!isDesktop) setIsSidebarOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-inter">
      {/* Sidebar */}
      <aside 
        className={`bg-[#0d457a] text-white transition-all duration-300 flex flex-col z-[70] shadow-2xl no-print
          ${isDesktop ? (isSidebarOpen ? 'w-64' : 'w-20') : (isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full')}
          ${!isDesktop ? 'fixed inset-y-0 left-0' : 'relative'}`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10 shrink-0">
          <div className="bg-white text-[#0d457a] p-2 rounded-xl shrink-0">
            <ShieldCheck size={20} />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in">
              <h1 className="font-black text-white text-sm uppercase tracking-tighter leading-none">Rastreio <span className="text-emerald-400">GESA</span></h1>
              <p className="text-[8px] font-black uppercase tracking-widest text-blue-200/50 mt-1">v{APP_VERSION}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white text-[#0d457a] font-bold shadow-lg' 
                    : 'hover:bg-white/10 text-blue-100/70 hover:text-white'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-200 hover:bg-red-500/20 rounded-xl transition-all">
            <LogOut size={18} className="shrink-0" />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-sm shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-xl text-[#0d457a]">
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black text-[#0d457a] leading-none">{currentUser.name}</p>
               <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{currentUser.department}</p>
             </div>
             {currentUser.avatarUrl ? (
               <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-xl border border-slate-200" alt="Avatar" />
             ) : (
               <div className="w-8 h-8 rounded-xl bg-[#0d457a] text-white flex items-center justify-center font-black text-[10px] border border-slate-200">
                 {getInitials(currentUser.name)}
               </div>
             )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
