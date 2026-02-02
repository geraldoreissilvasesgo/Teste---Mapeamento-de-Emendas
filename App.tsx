
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AmendmentList } from './components/AmendmentList';
import { AmendmentDetail } from './components/AmendmentDetail';
import { RepositoryModule } from './components/RepositoryModule';
import { ReportModule } from './components/ReportModule';
import { AuditModule } from './components/AuditModule';
import { SectorManagement } from './components/SectorManagement';
import { SecurityModule } from './components/SecurityModule';
import { GovernanceDocs } from './components/GovernanceDocs';
import { ApiPortal } from './components/ApiPortal';
import { TestingPanel } from './components/TestingPanel';
import { SystemManual } from './components/SystemManual';
import { DebugConsole } from './components/DebugConsole';
import { Login } from './components/Login';
import { 
  User, Amendment, Role, Status, 
  AmendmentMovement, SystemMode, AuditLog, AuditAction, AuditSeverity
} from './types';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS } from './constants';
import { analyzeAmendment } from './services/geminiService';
import { db, supabase } from './services/supabase';
import { Loader2, RefreshCw, ShieldAlert, Lock, WifiOff, AlertTriangle } from 'lucide-react';

/**
 * COMPONENTE PRINCIPAL (ORQUESTRADOR)
 * Gerencia o estado global, autenticação e sincronização de dados.
 */
const App: React.FC = () => {
  // --- ESTADOS DE USUÁRIO E CONTEXTO ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTenantId, setActiveTenantId] = useState<string>(''); 
  
  // --- ESTADOS DE DADOS ---
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // --- ESTADOS DE INTERFACE (UI) ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendmentId, setSelectedAmendmentId] = useState<string | null>(null);
  const [systemMode] = useState<SystemMode>(SystemMode.PRODUCTION);
  const [sectorConfigs, setSectorConfigs] = useState(DEFAULT_SECTOR_CONFIGS);
  
  // --- ESTADOS DE CARREGAMENTO E ERRO ---
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [syncError, setSyncError] = useState<{message: string, isSecurity: boolean, isNetwork?: boolean, isAborted?: boolean} | null>(null);

  // --- CONTROLE DE REQUISIÇÕES (FIX PARA 'SIGNAL ABORTED') ---
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Busca perfis de usuários vinculados ao tenant atual.
   */
  const fetchUsers = useCallback(async () => {
    if (!currentUser || !activeTenantId) return;
    setIsUsersLoading(true);
    try {
      const profiles = await db.profiles.getAll(activeTenantId);
      setUsers(profiles as User[]);
    } catch (error: any) {
      console.error("Erro ao carregar perfis:", error);
    } finally {
      setIsUsersLoading(false);
    }
  }, [currentUser, activeTenantId]);

  /**
   * Sincronização central de dados com proteção contra 'Signal Aborted'.
   */
  const fetchData = useCallback(async () => {
    if (!currentUser || !activeTenantId) return;
    
    // Cancela requisição anterior se houver uma em curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("Nova requisição iniciada");
    }
    
    // Cria novo controlador para esta requisição
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setSyncError(null);

    try {
      // Busca paralela otimizada
      const [amendmentsData, logsData] = await Promise.all([
        db.amendments.getAll(activeTenantId),
        db.audit.getLogs(activeTenantId)
      ]);
      
      // Validação de sinal para evitar atualizações em componentes desmontados
      if (controller.signal.aborted) return;

      setAmendments(amendmentsData || []);
      setAuditLogs(logsData || []);
      
      if (currentView === 'security' || currentView === 'debugger' || users.length === 0) {
        await fetchUsers();
      }
    } catch (error: any) {
      const isAborted = error.name === 'AbortError' || 
                        error.message?.toLowerCase().includes('aborted');

      if (isAborted) return; // Retorno silencioso para abortos controlados

      console.error("Erro na busca de dados:", error);
      
      const isNetwork = error.message?.includes('Failed to fetch') || error.name === 'TypeError';
      const isRLS = error.code === '42501' || error.message?.includes('RLS');
      
      setSyncError({
        message: isNetwork ? 'Erro de Conexão: Servidor inacessível.' : (isRLS ? 'Segurança RLS ativa.' : error.message),
        isSecurity: isRLS,
        isNetwork: isNetwork,
        isAborted: false
      });
      
      if (!isRLS && !isNetwork && amendments.length === 0) {
        setAmendments(MOCK_AMENDMENTS);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [currentUser, activeTenantId, currentView, users.length, fetchUsers]);

  /**
   * Handlers de Ação com useCallback para evitar re-renders desnecessários de componentes filhos
   */
  const handleTenantChange = useCallback(async (newTenantId: string) => {
     if (newTenantId === activeTenantId) return;
     setActiveTenantId(newTenantId);
     await db.audit.log({
       action: AuditAction.TENANT_SWITCH,
       details: `Super Admin alternou contexto para unidade ${newTenantId}.`,
       severity: 'WARN' as AuditSeverity
     });
  }, [activeTenantId]);

  const handleCreateAmendment = useCallback(async (newAmendment: Amendment) => {
    setIsLoading(true);
    try {
      const created = await db.amendments.upsert(newAmendment);
      if (created) {
        setAmendments(prev => [created, ...prev]);
        await db.audit.log({
          action: AuditAction.CREATE,
          details: `Novo processo SEI ${created.seiNumber} inserido.`,
          severity: 'INFO' as AuditSeverity
        });
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateAmendment = useCallback(async (updated: Amendment) => {
    try {
      const saved = await db.amendments.upsert(updated);
      if (saved) {
        setAmendments(prev => prev.map(a => a.id === saved.id ? saved : a));
      }
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  }, []);

  const handleTramitation = useCallback(async (movements: AmendmentMovement[], newStatus: Status) => {
    const targetId = movements[0].amendmentId;
    const targetAmendment = amendments.find(a => a.id === targetId);
    
    if (targetAmendment) {
      const updatedAmendment = {
        ...targetAmendment,
        movements: [...targetAmendment.movements, ...movements],
        currentSector: movements.map(m => m.toSector).join(' | '),
        status: newStatus
      };

      try {
        const saved = await db.amendments.upsert(updatedAmendment);
        if (saved) {
          setAmendments(prev => prev.map(a => a.id === saved.id ? saved : a));
          analyzeAmendment(saved).then(async (insights) => {
            if (insights) {
              const withAi = { ...saved, aiInsights: insights };
              await db.amendments.upsert(withAi);
              fetchData(); 
            }
          });
        }
      } catch (err: any) {
        alert("Erro na tramitação: " + err.message);
      }
    }
  }, [amendments, fetchData]);

  const handleInactivate = useCallback(async (id: string, justification: string) => {
    const target = amendments.find(a => a.id === id);
    if (target) {
      const updated = { ...target, status: Status.ARCHIVED, notes: justification };
      try {
        await db.amendments.upsert(updated);
        setAmendments(prev => prev.map(a => a.id === id ? updated : a));
      } catch (err: any) {
        alert("Erro ao arquivar: " + err.message);
      }
    }
  }, [amendments]);

  // Ciclo de Vida da Sessão
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userTenant = session.user.user_metadata.tenantId || 'T-01';
        const userData: User = {
          id: session.user.id,
          tenantId: userTenant, 
          name: session.user.user_metadata.name || 'Usuário GESA',
          email: session.user.email || '',
          role: (session.user.user_metadata.role as Role) || Role.ADMIN,
          lgpdAccepted: session.user.user_metadata.lgpdAccepted || false,
          avatarUrl: `https://ui-avatars.com/api/?name=${session.user.email}&background=0d457a&color=fff`
        };
        setCurrentUser(userData);
        setActiveTenantId(userTenant);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && activeTenantId) fetchData();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchData, currentUser, activeTenantId]);

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="text-[#0d457a] animate-spin" size={64} aria-hidden="true" />
        <p className="text-[12px] font-black text-[#0d457a] uppercase tracking-widest">Validando Sessão...</p>
      </div>
    );
  }

  if (!currentUser) return <Login />;

  const selectedAmendment = amendments.find(a => a.id === selectedAmendmentId);

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView}
      activeTenantId={activeTenantId}
      onNavigate={(v) => { setCurrentView(v); setSelectedAmendmentId(null); }}
      onLogout={async () => await db.auth.signOut()}
      onTenantChange={handleTenantChange}
    >
      {selectedAmendment ? (
        <AmendmentDetail 
          amendment={selectedAmendment}
          currentUser={currentUser}
          sectors={sectorConfigs}
          systemMode={systemMode}
          onBack={() => setSelectedAmendmentId(null)}
          onMove={handleTramitation}
          onStatusChange={(id, status) => handleUpdateAmendment({...selectedAmendment, status})}
          onDelete={handleInactivate}
        />
      ) : (
        <div className="animate-in fade-in duration-700">
          <div className="flex justify-between items-center mb-6 print:hidden">
            {syncError && (
              <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border cursor-pointer bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-all"
              >
                <AlertTriangle size={14} aria-hidden="true" /> {syncError.message}
                <span className="ml-2 underline opacity-50">Tentar Novamente</span>
              </button>
            )}
            
            <div className="ml-auto flex items-center gap-4">
               {currentUser.role === Role.SUPER_ADMIN && (
                 <span className="text-[9px] font-black text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full uppercase tracking-widest">SaaS Super Admin</span>
               )}
               <button 
                onClick={fetchData} 
                aria-label="Atualizar dados do servidor"
                className="flex items-center gap-2 text-[10px] font-black text-[#0d457a] uppercase transition-all bg-white px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm"
               >
                 <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> Atualizar Base
               </button>
            </div>
          </div>

          {currentView === 'dashboard' && <Dashboard amendments={amendments} onSelectAmendment={(id) => { setSelectedAmendmentId(id); setCurrentView('amendments'); }} />}
          {currentView === 'amendments' && (
            <AmendmentList 
              amendments={amendments} 
              sectors={sectorConfigs}
              userRole={currentUser.role} 
              systemMode={systemMode}
              onSelect={(a) => setSelectedAmendmentId(a.id)}
              onCreate={handleCreateAmendment}
              onUpdate={handleUpdateAmendment}
              onInactivate={handleInactivate}
            />
          )}
          {currentView === 'repository' && <RepositoryModule amendments={amendments} />}
          {currentView === 'reports' && <ReportModule amendments={amendments} />}
          {currentView === 'audit' && <AuditModule logs={auditLogs} currentUser={currentUser} activeTenantId={activeTenantId} onSimulate={() => fetchData()} />}
          {currentView === 'sectors' && (
            <SectorManagement 
              sectors={sectorConfigs} 
              onAdd={(s) => setSectorConfigs(prev => [...prev, s])} 
              onReset={() => setSectorConfigs(DEFAULT_SECTOR_CONFIGS)}
              onUpdateSla={(id, sla) => setSectorConfigs(prev => prev.map(s => s.id === id ? {...s, defaultSlaDays: sla} : s))}
            />
          )}
          {currentView === 'security' && (
            <SecurityModule 
              users={users} 
              currentUser={currentUser} 
              onAddUser={(u) => setUsers(prev => [...prev, u])}
              onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
              isLoading={isUsersLoading}
            />
          )}
          {currentView === 'docs' && <GovernanceDocs />}
          {currentView === 'api' && <ApiPortal currentUser={currentUser} amendments={amendments} />}
          {currentView === 'debugger' && <DebugConsole amendments={amendments} currentUser={currentUser} logs={auditLogs} />}
          {currentView === 'qa' && <TestingPanel />}
          {currentView === 'manual' && <SystemManual onBack={() => setCurrentView('dashboard')} />}
        </div>
      )}
    </Layout>
  );
};

export default App;
