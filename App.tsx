
import React, { useState, useMemo, useEffect } from 'react';
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
import { Login } from './components/Login';
import { 
  User, Amendment, Role, Status, 
  AmendmentMovement, SystemMode, AuditLog, AuditAction
} from './types';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS } from './constants';
import { analyzeAmendment } from './services/geminiService';
import { db, supabase } from './services/supabase';
import { Loader2, RefreshCw, ShieldAlert, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTenantId, setActiveTenantId] = useState<string>('');
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendmentId, setSelectedAmendmentId] = useState<string | null>(null);
  const [systemMode] = useState<SystemMode>(SystemMode.PRODUCTION);
  const [sectorConfigs, setSectorConfigs] = useState(DEFAULT_SECTOR_CONFIGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [syncError, setSyncError] = useState<{message: string, isSecurity: boolean} | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const userTenant = session.user.user_metadata.tenantId || 'T-01';
        setCurrentUser({
          id: session.user.id,
          tenantId: userTenant, 
          name: session.user.user_metadata.name || 'Usuário GESA',
          email: session.user.email || '',
          role: (session.user.user_metadata.role as Role) || Role.ADMIN,
          lgpdAccepted: session.user.user_metadata.lgpdAccepted || false,
          avatarUrl: `https://ui-avatars.com/api/?name=${session.user.email}&background=0d457a&color=fff`
        });
        setActiveTenantId(userTenant);
      } else {
        setCurrentUser(null);
        setAmendments([]);
        setAuditLogs([]);
        setUsers([]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUsers = async () => {
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
  };

  const fetchData = async () => {
    if (!currentUser || !activeTenantId) return;
    
    if (currentUser.role !== Role.SUPER_ADMIN && activeTenantId !== currentUser.tenantId) {
      setSyncError({ message: 'Acesso negado: Você não tem permissão para acessar esta secretaria.', isSecurity: true });
      setActiveTenantId(currentUser.tenantId);
      return;
    }

    setIsLoading(true);
    setSyncError(null);
    try {
      const [amendmentsData, logsData] = await Promise.all([
        db.amendments.getAll(activeTenantId),
        db.audit.getLogs(activeTenantId)
      ]);
      
      setAmendments(amendmentsData || []);
      setAuditLogs(logsData || []);
      
      if (currentView === 'security' || users.length === 0) {
        await fetchUsers();
      }
    } catch (error: any) {
      const isRLS = error.code === '42501' || error.message?.includes('RLS') || error.message?.includes('policy');
      setSyncError({
        message: isRLS ? 'Segurança RLS ativa: Acesso restrito detectado pelo servidor.' : error.message,
        isSecurity: isRLS
      });
      if (!isRLS && amendments.length === 0) setAmendments(MOCK_AMENDMENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && activeTenantId) fetchData();
  }, [currentUser, activeTenantId, currentView]);

  const handleCreateAmendment = async (newAmendment: Amendment) => {
    setIsLoading(true);
    try {
      // O DB agora gera o UUID se o ID for temporário
      const created = await db.amendments.upsert(newAmendment);
      if (created) {
        setAmendments(prev => [created, ...prev]);
        await db.audit.log({
          action: AuditAction.CREATE,
          details: `Novo processo cadastrado com sucesso: ${created.seiNumber}`,
          severity: 'INFO'
        });
      }
    } catch (err: any) {
      console.error("Erro fatal ao cadastrar:", err);
      alert(`Falha no Cadastro: ${err.message || 'Verifique sua conexão ou permissões de perfil.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAmendment = async (updated: Amendment) => {
    try {
      const saved = await db.amendments.upsert(updated);
      if (saved) {
        setAmendments(prev => prev.map(a => a.id === saved.id ? saved : a));
      }
    } catch (err: any) {
      console.error("Erro RLS Update:", err);
      alert("Não foi possível atualizar o registro: " + err.message);
    }
  };

  const handleTramitation = async (movements: AmendmentMovement[]) => {
    const targetId = movements[0].amendmentId;
    const targetAmendment = amendments.find(a => a.id === targetId);
    
    if (targetAmendment) {
      const updatedAmendment = {
        ...targetAmendment,
        movements: [...targetAmendment.movements, ...movements],
        currentSector: movements.map(m => m.toSector).join(' | '),
        status: Status.IN_PROGRESS
      };

      try {
        const saved = await db.amendments.upsert(updatedAmendment);
        if (saved) {
          setAmendments(prev => prev.map(a => a.id === saved.id ? saved : a));
          await db.audit.log({
            action: AuditAction.MOVE,
            details: `Tramitou ${targetAmendment.seiNumber}`,
            severity: 'INFO'
          });

          const insights = await analyzeAmendment(saved);
          if (insights) {
            const withAi = { ...saved, aiInsights: insights };
            const final = await db.amendments.upsert(withAi);
            if (final) setAmendments(prev => prev.map(a => a.id === final.id ? final : a));
          }
        }
      } catch (err: any) {
        console.error("Tramitação Rejeitada pelo RLS:", err);
        alert("Erro na tramitação: " + err.message);
      }
    }
  };

  const handleInactivate = async (id: string, justification: string) => {
    const target = amendments.find(a => a.id === id);
    if (target) {
      const updated = { ...target, status: Status.ARCHIVED, notes: justification };
      try {
        const saved = await db.amendments.upsert(updated);
        if (saved) {
          setAmendments(prev => prev.map(a => a.id === id ? saved : a));
          await db.audit.log({
            action: AuditAction.DELETE,
            details: `Arquivou ${target.seiNumber}`,
            severity: 'WARN'
          });
        }
      } catch (err: any) {
        console.error("Arquivamento negado:", err);
        alert("Erro ao arquivar: " + err.message);
      }
    }
  };

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="text-[#0d457a] animate-spin" size={64} />
        <div className="text-center">
          <p className="text-[12px] font-black text-[#0d457a] uppercase tracking-widest">GESA Cloud - Validando Identidade</p>
        </div>
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
      onTenantChange={setActiveTenantId}
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
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${syncError.isSecurity ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {syncError.isSecurity ? <Lock size={14} /> : <ShieldAlert size={14} />} 
                {syncError.message}
              </div>
            )}
            <div className="ml-auto flex items-center gap-4">
               {currentUser.role === Role.SUPER_ADMIN && (
                 <span className="text-[9px] font-black text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full uppercase tracking-widest">Modo Super Admin</span>
               )}
               <button 
                onClick={fetchData} 
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#0d457a] uppercase transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                Auditar Permissões
              </button>
            </div>
          </div>

          {currentView === 'dashboard' && <Dashboard amendments={amendments} onSelectAmendment={setSelectedAmendmentId} />}
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
          {currentView === 'audit' && (
            <AuditModule 
              logs={auditLogs} 
              currentUser={currentUser} 
              activeTenantId={activeTenantId} 
            />
          )}
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
              isDbConnected={!syncError} 
            />
          )}
          {currentView === 'docs' && <GovernanceDocs />}
          {currentView === 'api' && <ApiPortal currentUser={currentUser} amendments={amendments} />}
          {currentView === 'qa' && <TestingPanel />}
        </div>
      )}
    </Layout>
  );
};

export default App;
