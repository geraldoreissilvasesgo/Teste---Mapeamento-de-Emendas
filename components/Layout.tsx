import React, { useState, useEffect, useMemo } from 'react';
// Test comment Layout
import { 
  LayoutDashboard, FileText, Database, ShieldCheck, 
  LogOut, Menu, Bell, Globe, ChevronDown, Sparkles,
  BarChart3, History, Layers, Lock, Braces, Activity, CalendarDays,
  Scale, RefreshCw, WifiOff, Users, Workflow, Book, Key, Zap, UserCircle2,
  Settings2, ClipboardCheck, Terminal, HardDrive, ShieldAlert, LogIn
} from 'lucide-react';
import { User, Role } from '../types';
import { APP_VERSION } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  currentView: string;
  activeTenantId?: string;
  isLive: boolean; 
  onlineUsers?: any[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onTenantChange: (id: string) => void;
  onChangePassword: () => void;
  onLoginClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentUser, currentView, activeTenantId, 
  isLive, onNavigate, onLogout, onChangePassword, onLoginClick
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  /**
   * MATRIZ DE NAVEGAÇÃO ESTRUTURADA (RBAC)
   * Organizada por relevância operacional e permissões de perfil.
   */
  const menuSections = useMemo(() => {
    if (!currentUser) return [];
    const r = currentUser.role;

    const sections = [
      {
        label: 'Gestão Operacional',
        roles: 'all',
        items: [
          { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, roles: 'all' },
          { id: 'amendments', label: 'Processos SEI', icon: FileText, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR] },
          { id: 'calendar', label: 'Calendário SLA', icon: CalendarDays, roles: 'all' },
          { id: 'repository', label: 'Repositório Central', icon: Database, roles: 'all' },
        ]
      },
      {
        label: 'Inteligência e Fluxo',
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR],
        items: [
          { id: 'reports', label: 'Central de Relatórios', icon: BarChart3, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR] },
          { id: 'sectors', label: 'Unidades Técnicas', icon: Layers, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
          { id: 'statuses', label: 'Ciclo de Vida', icon: Workflow, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
        ]
      },
      {
        label: 'Segurança e Dados',
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR],
        items: [
          { id: 'audit', label: 'Trilha de Auditoria', icon: History, roles: [Role.SUPER_ADMIN, Role.AUDITOR] },
          { id: 'security', label: 'Controle de Acessos', icon: Lock, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
          { id: 'api', label: 'Portal de API', icon: Braces, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
          { id: 'documentation', label: 'Dossiê Técnico', icon: Book, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR] },
          { id: 'governance', label: 'Governança TI', icon: ShieldCheck, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR] },
        ]
      }
    ];

    return sections
      .filter(section => section.roles === 'all' || (Array.isArray(section.roles) && section.roles.includes(r)))
      .map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.roles === 'all' || (Array.isArray(item.roles) && item.roles.includes(r))
        )
      }))
      .filter(section => section.items.length > 0);
  }, [currentUser?.role]);

  const handleNavigate = (viewId: string) => {
    onNavigate(viewId);
    if (!isDesktop) setIsSidebarOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-inter">
      {/* Overlay para Mobile */}
      {!isDesktop && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#0d457a]/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Corporativa */}
      <aside 
        className={`bg-[#0d457a] text-white transition-all duration-500 ease-in-out flex flex-col z-[70] shadow-2xl no-print border-r border-white/5 
          ${isDesktop ? (isSidebarOpen ? 'w-72' : 'w-24') : (isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full')}
          ${!isDesktop ? 'fixed inset-y-0 left-0' : 'relative'}`}
      >
        {/* Branding GESA */}
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0 h-24">
          <div className="flex items-center gap-4">
            <div className="bg-white text-[#0d457a] p-2.5 rounded-[18px] shrink-0 flex items-center justify-center relative border border-white/10 shadow-xl group cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/50 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
              <ShieldCheck size={24} className="relative z-10 transition-transform group-hover:scale-110" />
              <Zap size={10} className="absolute -top-0.5 -right-0.5 text-emerald-500 fill-emerald-500 animate-pulse-sync" />
            </div>
            {(isSidebarOpen || !isDesktop) && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="font-black text-white text-base uppercase tracking-tighter leading-none">RASTREIO <span className="text-emerald-400">GESA</span></h1>
                <p className="text-[7px] font-black uppercase tracking-[0.4em] text-blue-200/40 mt-1.5">SUBIPEI • GOIÁS</p>
              </div>
            )}
          </div>
        </div>

        {/* Navegação por Seções */}
        <nav className="flex-1 py-8 px-4 space-y-10 overflow-y-auto custom-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-2">
              {(isSidebarOpen || !isDesktop) && (
                <div className="px-4 flex items-center gap-2 mb-4">
                  <span className="text-[9px] font-black text-blue-200/30 uppercase tracking-[0.25em] whitespace-nowrap">
                    {section.label}
                  </span>
                  <div className="h-px bg-white/5 flex-1"></div>
                </div>
              )}
              <div className="space-y-1.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group ${
                        isActive 
                          ? 'bg-white text-[#0d457a] font-black shadow-xl' 
                          : 'hover:bg-white/5 text-blue-100/60 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0d457a] rounded-r-full"></div>
                      )}
                      <Icon size={20} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#0d457a]' : 'text-blue-200/40'}`} />
                      {(isSidebarOpen || !isDesktop) && (
                        <span className="text-[10px] uppercase tracking-[0.1em] truncate font-bold">{item.label}</span>
                      )}
                      {isActive && isSidebarOpen && (
                        <div className="ml-auto w-1.5 h-1.5 bg-[#0d457a] rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-white/5 bg-black/10 shrink-0">
          {currentUser ? (
            <button 
              onClick={onLogout} 
              className="w-full flex items-center gap-4 px-4 py-4 text-red-200 hover:bg-red-500/20 rounded-2xl transition-all group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              {(isSidebarOpen || !isDesktop) && <span className="text-[10px] font-black uppercase tracking-widest">Encerrar Sessão</span>}
            </button>
          ) : (
            <button 
              onClick={onLoginClick} 
              className="w-full flex items-center gap-4 px-4 py-4 text-emerald-200 hover:bg-emerald-500/20 rounded-2xl transition-all group"
            >
              <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
              {(isSidebarOpen || !isDesktop) && <span className="text-[10px] font-black uppercase tracking-widest">Acessar Sistema</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Área de Conteúdo */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header Corporativo */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-3 hover:bg-slate-100 rounded-2xl text-[#0d457a] transition-all active:scale-95"
            >
              <Menu size={24} />
            </button>
            <div className="hidden xl:flex flex-col">
                <h2 className="text-[11px] font-black text-[#0d457a] uppercase leading-tight tracking-tight">
                  SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    GERÊNCIA DE SUPORTE ADMINISTRATIVO • GESA
                  </h3>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Status Badge */}
             <div className={`hidden sm:flex items-center gap-4 px-5 py-2.5 rounded-[20px] border transition-all duration-700 ${isLive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                <div className="relative">
                  {isLive ? <RefreshCw size={16} className="animate-spin-slow" /> : <WifiOff size={16} />}
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase leading-none tracking-tighter">{isLive ? 'Cloud Realtime' : 'Local Buffer'}</span>
                  <span className="text-[7px] font-bold opacity-50 uppercase mt-1 tracking-widest">{isLive ? 'Link Estável' : 'Sinc. Pendente'}</span>
                </div>
             </div>

             {/* Perfil de Acesso ou Botão de Login */}
             <div className="relative">
                {currentUser ? (
                  <>
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-4 p-1.5 pr-4 rounded-[22px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#0d457a] text-white flex items-center justify-center font-black text-sm shadow-lg shrink-0 group-hover:rotate-3 transition-transform">
                        {getInitials(currentUser.name)}
                      </div>
                      <div className="hidden sm:flex flex-col items-start justify-center min-w-0">
                        <p className="text-[11px] font-black text-[#0d457a] leading-tight truncate max-w-[150px] uppercase">{currentUser.name}</p>
                        <p className="text-[8px] text-slate-400 font-black uppercase mt-1 tracking-tighter leading-none flex items-center gap-1">
                          <Settings2 size={10} /> {currentUser.role}
                        </p>
                      </div>
                      <ChevronDown size={14} className={`text-slate-300 transition-transform duration-500 ${showProfileMenu ? 'rotate-180' : ''} shrink-0`} />
                    </button>

                    {showProfileMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
                        <div className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col items-center text-center gap-3">
                              <div className="w-16 h-16 rounded-3xl bg-[#0d457a] text-white flex items-center justify-center font-black text-xl shadow-xl">
                                {getInitials(currentUser.name)}
                              </div>
                              <div>
                                <p className="text-xs font-black text-[#0d457a] uppercase leading-tight">{currentUser.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">v{APP_VERSION} • {currentUser.department}</p>
                              </div>
                          </div>
                          <div className="p-3 space-y-1">
                              <button 
                                onClick={() => { onChangePassword(); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                              >
                                <Key size={18} className="text-blue-400" /> Alterar Senha
                              </button>
                              <div className="h-px bg-slate-50 mx-4"></div>
                              <button 
                                onClick={onLogout}
                                className="w-full flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                              >
                                <LogOut size={18} className="text-red-400" /> Sair do Sistema
                              </button>
                          </div>
                          <div className="bg-slate-50 p-4 text-center">
                              <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">Ambiente de Produção Seguro</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={onLoginClick}
                    className="flex items-center gap-3 px-6 py-3 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#0a365f] transition-all active:scale-95"
                  >
                    <LogIn size={16} /> Entrar
                  </button>
                )}
             </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#f8fafc] custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};