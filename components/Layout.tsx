
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
  FileBarChart,
  Settings2,
  AlarmClockCheck,
  Bell,
  Globe,
  Terminal,
  CheckCircle2 // Ícone para mensagem de sucesso
} from 'lucide-react';
import { User, Role, Notification, SystemMode } from '../types';
import { APP_NAME, DEPARTMENT } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: string;
  notifications: Notification[];
  systemMode: SystemMode;
  successMessage: string | null; // Prop para a mensagem de sucesso
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  currentView, 
  notifications,
  systemMode,
  successMessage, // Recebe a mensagem
  onNavigate, 
  onLogout 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Removido menuItems dinâmicos de teste
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'amendments', label: 'Processos SEI', icon: FileText },
    { id: 'deadlines', label: 'Prazos/SLA', icon: AlarmClockCheck },
    { id: 'repository', label: 'Repositório', icon: Database },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart },
    { id: 'import', label: 'Importação', icon: UploadCloud },
    { id: 'sectors', label: 'Setores', icon: Settings2 },
    { id: 'security', label: 'Segurança', icon: ShieldCheck, roles: [Role.ADMIN] },
    { id: 'audit', label: 'Auditoria', icon: ClipboardList, roles: [Role.ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className={`bg-[#0d457a] text-white transition-all duration-300 flex flex-col z-50 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10 bg-[#0a365f]">
          <div className="bg-white p-2 rounded-xl text-[#0d457a] shadow-lg shrink-0">
            <ShieldCheck size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-black text-sm uppercase tracking-tighter leading-none">{APP_NAME}</h1>
              <p className="text-[9px] text-white/50 font-bold uppercase mt-1">GESA / SUBIPEI</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            if (item.roles && !item.roles.includes(currentUser.role)) return null;
            
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-white text-[#0d457a] shadow-xl font-black' 
                    : 'hover:bg-white/5 text-white/70 hover:text-white font-bold'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#0d457a]' : 'text-white/40 group-hover:text-white'} />
                {isSidebarOpen && <span className="text-xs uppercase tracking-wider">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-white/10 bg-[#0a365f]/50 ${!isSidebarOpen && 'items-center'}`}>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-300 transition-all font-black text-xs uppercase"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Ambiente fixo em Produção */}
            <div className="flex items-center gap-2 p-1 bg-emerald-50 rounded-2xl border border-emerald-100 px-4 py-2">
               <Globe size={14} className="text-emerald-600" />
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ambiente de Produção</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all relative group"
              >
                <Bell size={20} className="text-slate-500 group-hover:text-[#0d457a]" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 py-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-6 pb-3 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-black text-[#0d457a] text-xs uppercase tracking-widest">Notificações</h4>
                    <span className="bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <p className="text-[10px] font-black text-red-500 uppercase mb-1">{n.title}</p>
                          <p className="text-xs text-slate-600 font-bold leading-tight group-hover:text-[#0d457a]">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase">Nenhum alerta crítico</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#0d457a] leading-none uppercase tracking-tighter">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-2xl shadow-md border-2 border-white ring-1 ring-slate-100" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {successMessage && (
            <div className="absolute top-6 right-8 z-50 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <CheckCircle2 size={28} />
              <div>
                <h4 className="font-black text-sm uppercase">Operação Concluída</h4>
                <p className="text-xs font-medium mt-1">{successMessage}</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
