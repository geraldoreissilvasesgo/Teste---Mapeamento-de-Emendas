
/**
 * COMPONENTE DE LAYOUT PRINCIPAL - REDESENHADO
 * 
 * Estrutura de navegação baseada em Domínios de Responsabilidade.
 * Segue padrões modernos de UX para ERPs e sistemas governamentais.
 */
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  Menu,
  X,
  ClipboardList,
  UploadCloud,
  Database,
  BarChart3,
  Settings2,
  AlarmClockCheck,
  Bell,
  Globe,
  CheckCircle2,
  DatabaseZap,
  Activity,
  UserCog,
  Workflow,
  SearchCode
} from 'lucide-react';
import { User, Role, Notification, SystemMode } from '../types';
import { APP_NAME, DEPARTMENT } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: string;
  notifications: Notification[];
  systemMode: SystemMode;
  successMessage: string | null;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  currentView, 
  notifications,
  systemMode,
  successMessage,
  onNavigate, 
  onLogout 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Estrutura de Menus Agrupada por Contexto
  const menuGroups = [
    {
      group: 'Estratégico',
      items: [
        { id: 'dashboard', label: 'Painel de Controle', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Operacional',
      items: [
        { id: 'amendments', label: 'Gestão de Processos', icon: FileText },
        { id: 'deadlines', label: 'Monitor de SLAs', icon: AlarmClockCheck },
      ]
    },
    {
      group: 'Inteligência',
      items: [
        { id: 'reports', label: 'BI & Analíticos', icon: BarChart3 },
        { id: 'repository', label: 'Acervo Central', icon: Database },
      ]
    },
    {
      group: 'Sistema & Config',
      items: [
        { id: 'import', label: 'Carga de Dados', icon: UploadCloud },
        { id: 'sectors', label: 'Workflows (Setores)', icon: Workflow },
        { id: 'security', label: 'Controle de Acesso', icon: UserCog, roles: [Role.ADMIN] },
      ]
    },
    {
      group: 'Governança',
      items: [
        { id: 'audit', label: 'Trilha de Auditoria', icon: ClipboardList, roles: [Role.ADMIN] },
        { id: 'database', label: 'Console Técnico', icon: SearchCode, roles: [Role.ADMIN] },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-inter">
      {/* Sidebar Redesenhada */}
      <aside className={`bg-[#0d457a] text-white transition-all duration-500 flex flex-col z-50 border-r border-white/5 ${isSidebarOpen ? 'w-80' : 'w-24'}`}>
        <div className="p-8 flex items-center gap-4 border-b border-white/5 bg-[#0a365f]/50">
          <div className="bg-white p-3 rounded-2xl text-[#0d457a] shadow-[0_10px_20px_rgba(0,0,0,0.2)] shrink-0 group-hover:rotate-12 transition-transform">
            <ShieldCheck size={28} />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
              <h1 className="font-black text-base uppercase tracking-tighter leading-none">{APP_NAME}</h1>
              <p className="text-[9px] text-emerald-400 font-black uppercase mt-1.5 tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                Sistema Ativo
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-8 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group, gIdx) => {
            // Verifica se o grupo possui algum item visível para o cargo atual
            const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(currentUser.role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-3">
                {isSidebarOpen && (
                  <h3 className="px-5 text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-4">
                    {group.group}
                  </h3>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 group relative ${
                          isActive 
                            ? 'bg-white text-[#0d457a] shadow-2xl font-black translate-x-1' 
                            : 'hover:bg-white/5 text-white/60 hover:text-white font-bold'
                        }`}
                        title={!isSidebarOpen ? item.label : ''}
                      >
                        <Icon size={22} className={isActive ? 'text-[#0d457a]' : 'text-white/20 group-hover:text-white/80 group-hover:scale-110 transition-all'} />
                        {isSidebarOpen && (
                          <span className="text-[11px] uppercase tracking-widest truncate animate-in fade-in duration-700">
                            {item.label}
                          </span>
                        )}
                        {isActive && isSidebarOpen && (
                          <div className="absolute right-4 w-1.5 h-1.5 bg-[#0d457a] rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={`p-6 border-t border-white/5 bg-[#0a365f]/30 ${!isSidebarOpen && 'flex justify-center'}`}>
          <button 
            onClick={onLogout}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-red-500/10 text-red-400 transition-all font-black text-[11px] uppercase tracking-widest ${isSidebarOpen ? 'w-full' : 'w-auto'}`}
          >
            <LogOut size={22} />
            {isSidebarOpen && <span>Encerrar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-[#0d457a] shadow-sm border border-slate-100"
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            <div className="hidden md:flex items-center gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 px-5 py-3">
               <Globe size={16} className="text-blue-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GESA Cloud <span className="text-slate-300 mx-2">|</span> Sefaz-GO v2.7</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all relative group border border-slate-100"
              >
                <Bell size={22} className="text-slate-400 group-hover:text-[#0d457a]" />
                {notifications.length > 0 && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-5 pl-8 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#0d457a] leading-none uppercase tracking-tighter">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase mt-1.5 tracking-widest">{currentUser.role}</p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img src={currentUser.avatarUrl} alt="User" className="relative w-12 h-12 rounded-2xl border-2 border-white shadow-md ring-1 ring-slate-100 object-cover" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative bg-[#f8fafc]">
          {successMessage && (
            <div className="fixed top-10 right-10 z-[100] bg-emerald-500 text-white px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-5 animate-in fade-in slide-in-from-top-6 duration-500">
              <div className="p-2 bg-white/20 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest">Sincronização OK</h4>
                <p className="text-[11px] font-medium mt-1 opacity-90">{successMessage}</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
