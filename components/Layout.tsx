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
  FileBarChart
} from 'lucide-react';
import { User, Role } from '../types';
import { APP_NAME, DEPARTMENT } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  currentView, 
  onNavigate,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Updated to use GO.GOV color #0d457a
  const GO_NAVY = "bg-[#0d457a]";
  const GO_NAVY_HOVER = "hover:bg-[#0a365f]";

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
      {/* Sidebar - GO.GOV Identity */}
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
            <NavItem view="repository" icon={Database} label="Repositório Geral" />
            <NavItem view="reports" icon={FileBarChart} label="Central Relatórios" />
            
            {currentUser.role === Role.ADMIN && (
              <>
                <div className="mt-4 mb-2 border-t border-white/5"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-4">Administração</p>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 z-10 border-b border-gray-200 print:hidden">
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

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-[#0d457a]/5 text-[#0d457a] rounded-full border border-[#0d457a]/10">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase">Sistema Online</span>
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