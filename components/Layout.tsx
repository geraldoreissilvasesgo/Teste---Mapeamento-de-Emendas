import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Database, ShieldCheck, 
  LogOut, Menu, Bell, Globe, ChevronDown, Sparkles,
  BarChart3, History, Layers, Lock, Braces, Activity, CalendarDays, Link2,
  Scale, Zap, RefreshCw, Wifi, WifiOff, Users, Workflow, Book
} from 'lucide-react';
import { User, Role } from '../types';
import { APP_VERSION } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: string;
  activeTenantId: string;
  isLive: boolean; 
  onlineUsers?: any[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onTenantChange: (id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentUser, currentView, activeTenantId, 
  isLive, onlineUsers = [], onNavigate, onLogout, onTenantChange 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const menuSections = [
    {
      label: 'Operacional',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'amendments', label: 'Emendas Impositivas', icon: FileText },
        { id: 'fast_analysis', label: 'Análise Rápida (2026)', icon: Zap },
        { id: 'calendar', label: 'Calendário de Prazos', icon: CalendarDays },
        { id: 'repository', label: 'Repositório Central', icon: Database },
      ]
    },
    {
      label: 'Carga e Fluxo',
      items: [
        { id: 'import', label: 'Conexão Planilha', icon: Link2 },
        { id: 'reports', label: 'Central de Relatórios', icon: BarChart3 },
        { id: 'sectors', label: 'Unidades Técnicas', icon: Layers },
        { id: 'statuses', label: 'Ciclo de Vida', icon: Workflow },
      ]
    },
    {
      label: 'Governança',
      items: [
        { id: 'audit', label: 'Auditoria', icon: History },
        { id: 'security', label: 'Segurança & LGPD', icon: Lock },
        { id: 'api', label: 'Portal de Integração', icon: Braces },
        { id: 'documentation', label: 'Dossiê do Sistema', icon: Book },
        { id: 'governance', label: 'Governança Estratégica', icon: ShieldCheck },
        { id: 'compliance_details', label: 'Compliance Details', icon: Scale },
      ]
    }
  ];

  const handleNavigate = (viewId: string) => {
    onNavigate(viewId);
    if (!isDesktop) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-inter">
      {!isDesktop && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#0d457a]/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`bg-[#0d457a] text-white transition-all duration-300 flex flex-col z-[70] shadow-2xl no-print border-r border-white/5 
          ${isDesktop ? (isSidebarOpen ? 'w-72' : 'w-20') : (isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full')}
          ${!isDesktop ? 'fixed inset-y-0 left-0' : 'relative'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#0d457a] p-2 rounded-xl shrink-0 flex items-center justify-center relative">
              <ShieldCheck size={20} className="relative z-10" />
              <Zap size={10} className="absolute -top-1 -right-1 text-emerald-500 fill-emerald-500" />
            </div>
            {(isSidebarOpen || !isDesktop) && (
              <div className="animate-in fade-in duration-300">
                <h1 className="font-black text-white text-sm uppercase tracking-tighter leading-none">RASTREIO <span className="text-emerald-400">GESA</span></h1>
                <p className="text-[7px] font-black uppercase tracking-[0.3em] text-blue-200/50 mt-1">SISTEMA SUBIPEI • GOIÁS</p>
              </div>
            )}
          </div>
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
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                      isActive 
                        ? 'bg-white text-[#0d457a] font-black shadow-lg' 
                        : 'hover:bg-white/10 text-blue-100/70 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#0d457a]' : 'text-blue-200/50'} />
                    {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/5">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-200 hover:bg-red-500/20 rounded-xl transition-all">
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-slate-50 rounded-xl text-[#0d457a]"
            >
              <Menu size={24} />
            </button>
            <div className="hidden xl:flex flex-col">
                <h2 className="text-[11px] font-black text-[#0d457a] uppercase leading-tight tracking-tight">
                  SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA
                </h2>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  GERÊNCIA DE SUPORTE ADMINISTRATIVO
                </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {onlineUsers.length > 1 && (
               <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                  <div className="flex -space-x-2">
                    {onlineUsers.slice(0, 3).map((u, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[8px] font-black text-white overflow-hidden" title={u.name}>
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : u.name[0]}
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase">+{onlineUsers.length} Operadores</span>
               </div>
             )}

             <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 ${isLive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                {isLive ? <RefreshCw size={16} className="animate-pulse" /> : <WifiOff size={16} />}
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase leading-none">{isLive ? 'Cloud Realtime' : 'Modo Offline'}</span>
                  <span className="text-[7px] font-bold opacity-60 uppercase mt-0.5">{isLive ? 'Sincronização Ativa' : 'Local Buffer'}</span>
                </div>
             </div>

             <div className="flex items-center gap-3 ml-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-[#0d457a] leading-none">{currentUser.name}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{currentUser.role}</p>
                </div>
                <img src={currentUser.avatarUrl} className="w-9 h-9 rounded-xl shadow-sm border border-slate-200" alt="Avatar" />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#f8fafc] custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};