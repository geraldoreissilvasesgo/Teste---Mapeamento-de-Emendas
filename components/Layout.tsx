
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
  Search
} from 'lucide-react';
import { User, Role, Notification } from '../types';
import { APP_NAME, DEPARTMENT } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: string;
  notifications: Notification[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  currentView, 
  notifications,
  onNavigate,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const GO_NAVY = "bg-[#0d457a]";

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1 uppercase tracking-wide
        ${currentView === view 
          ? 'bg-white/10 text-white shadow-md border-l-4 border-slate-400' 
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-inter">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 ${GO_NAVY} shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col text-white print:hidden
      `}>
        <div className="h-24 flex items-center justify-center border-b border-white/10 shadow-sm px-6">
          <div className="text-left w-full">
            <h1 className="text-white font-bold text-xl tracking-tight leading-none">GESA</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Gerência de Suporte Administrativo - GESA/SUBIPEI</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4">
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu Principal</p>
            <NavItem view="dashboard" icon={LayoutDashboard} label="Visão Geral" />
            <NavItem view="amendments" icon={FileText} label="Emendas & SEI" />
            <NavItem view="deadlines" icon={AlarmClockCheck} label="Monitor de Prazos" />
            <NavItem view="repository" icon={Database} label="Repositório Geral" />
            <NavItem view="reports" icon={FileBarChart} label="Central Relatórios" />
            
            {currentUser.role === Role.ADMIN && (
              <>
                <div className="mt-4 mb-2 border-t border-white/5"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-4">Configurações SES</p>
                <NavItem view="sectors" icon={Settings2} label="Configurar Setores" />
                <NavItem view="import" icon={UploadCloud} label="Importar Dados" />
                <NavItem view="security" icon={ShieldCheck} label="Segurança (RBAC)" />
                <NavItem view="audit" icon={ClipboardList} label="Auditoria" />
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#082f54]">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-white/5">
            <img 
              src={currentUser.avatarUrl || 'https://via.placeholder.com/40'} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full border-2 border-slate-400"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate uppercase">{currentUser.name}</p>
              <p className="text-[10px] text-slate-300 truncate uppercase tracking-wider">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-200 hover:bg-red-900/30 hover:text-white rounded-md transition-colors uppercase font-semibold tracking-wide"
          >
            <LogOut size={16} />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 z-10 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-[#0d457a] tracking-tight uppercase">{APP_NAME}</h2>
              <span className="text-xs text-slate-500 hidden sm:block uppercase tracking-wide">{DEPARTMENT}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-400 hover:text-[#0d457a] hover:bg-slate-50 rounded-full transition-all relative"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white ring-1 ring-red-500 animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="text-xs font-bold text-[#0d457a] uppercase tracking-wider">Alertas de SLA</h4>
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{notifications.length} Críticos</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs italic">Nenhuma pendência crítica identificada.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                            <p className="text-[10px] font-bold text-red-500 uppercase mb-1">{n.title}</p>
                            <p className="text-xs text-slate-600 leading-tight mb-2">{n.message}</p>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                              <span>SEI: {n.seiNumber}</span>
                              <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
             </div>
             <div className="h-6 w-px bg-slate-200 mx-1"></div>
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
