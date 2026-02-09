
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AmendmentList } from './components/AmendmentList';
import { AmendmentDetail } from './components/AmendmentDetail';
import { ReportModule } from './components/ReportModule';
import { ImportModule } from './components/ImportModule';
import { RepositoryModule } from './components/RepositoryModule';
import { SecurityModule } from './components/SecurityModule';
import { AuditModule } from './components/AuditModule';
import { UserRegistration } from './components/UserRegistration';
import { SectorManagement } from './components/SectorManagement';
import { StatusManagement } from './components/StatusManagement';
import { GovernanceDocs } from './components/GovernanceDocs';
import { ComplianceDetails } from './components/ComplianceDetails';
import { ApiPortal } from './components/ApiPortal';
import { Login } from './components/Login';
import { DatabaseStatusAlert } from './components/DatabaseStatusAlert';
import { CalendarView } from './components/CalendarView';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { PlushNotificationContainer } from './components/PlushNotification';
import { 
  User, Amendment, SystemMode, StatusConfig, AuditLog, SectorConfig, AuditAction
} from './types';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS, MOCK_USERS } from './constants';
import { db, supabase } from './services/supabase';

const AppContent: React.FC = () => {
  const { notify } = useNotification();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLiveSync, setIsLiveSync] = useState(false);
  
  const [dbErrors, setDbErrors] = useState<{
    users?: string;
    sectors?: string;
    statuses?: string;
    amendments?: string;
    audit?: string;
  }>({});

  // Efeito de Inicialização de Sessão
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          // Recupera o perfil do banco para garantir as 'roles' corretas
          const profile = await db.users.getByEmail(session.user.email);
          if (profile) {
            setCurrentUser(profile);
          } else {
            // Fallback para o que estiver no localStorage se houver erro de rede, 
            // mas priorizando a segurança do banco
            const saved = localStorage.getItem('gesa_current_user');
            if (saved) setCurrentUser(JSON.parse(saved));
          }
        } else {
          // Tenta carregar do localStorage apenas se houver uma persistência de "lembrar e-mail"
          const saved = localStorage.getItem('gesa_current_user');
          if (saved) setCurrentUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Session init failed:", e);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    const tId = currentUser.tenantId;
    setIsLoadingData(true);

    const loadTable = async (key: keyof typeof dbErrors, promise: Promise<any>, fallback: any, setter: (d: any) => void) => {
      try {
        const data = await promise;
        setter(data);
        setDbErrors(prev => ({ ...prev, [key]: undefined }));
        setIsLiveSync(true);
      } catch (err: any) {
        if (err.message === 'TABLE_MISSING') {
          setDbErrors(prev => ({ ...prev, [key]: 'DATABASE_SETUP_REQUIRED' }));
          setter(fallback);
        } else {
          console.error(`Read error on ${String(key)}:`, err.message);
        }
      }
    };

    await Promise.all([
      loadTable('amendments', db.amendments.getAll(tId), MOCK_AMENDMENTS, setAmendments),
      loadTable('users', db.users.getAll(tId), MOCK_USERS, setUsers),
      loadTable('sectors', db.sectors.getAll(tId), DEFAULT_SECTOR_CONFIGS, (d) => d.length > 0 && setSectors(d)),
      loadTable('statuses', db.statuses.getAll(tId), [], setStatuses),
      loadTable('audit', db.audit.getAll(tId), [], setLogs)
    ]);

    setIsLoadingData(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, fetchData]);

  const handleUpdateAmendment = async (amendment: Amendment) => {
    try {
      const saved = await db.amendments.upsert({ ...amendment, tenantId: currentUser?.tenantId });
      
      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: AuditAction.UPDATE,
        details: `Gravação do processo SEI ${amendment.seiNumber}`,
        severity: 'INFO'
      });

      setAmendments(prev => {
        const exists = prev.some(a => a.id === saved.id);
        if (exists) {
          return prev.map(a => a.id === saved.id ? saved : a);
        }
        return [saved, ...prev];
      });

      if (selectedAmendment?.id === saved.id) setSelectedAmendment(saved);
      notify('success', 'Base Cloud Atualizada', `O processo ${amendment.seiNumber} foi sincronizado.`);
    } catch (err: any) {
      notify('error', 'Falha na Gravação', `O banco rejeitou a operação.`);
    }
  };

  const handleUpdateSectorSla = async (id: string, newSla: number) => {
    try {
      const sector = sectors.find(s => s.id === id);
      if (!sector) return;
      
      const updated = { ...sector, defaultSlaDays: newSla };
      await db.sectors.upsert({ ...updated, tenantId: currentUser?.tenantId });
      
      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: AuditAction.UPDATE,
        details: `SLA da unidade ${sector.name} alterado para ${newSla} dias.`,
        severity: 'WARN'
      });

      setSectors(prev => prev.map(s => s.id === id ? updated : s));
      notify('success', 'SLA Atualizado', `A unidade ${sector.name} agora possui ${newSla} dias de prazo padrão.`);
    } catch (err) {
      notify('error', 'Erro', 'Não foi possível atualizar o SLA no banco.');
    }
  };

  const handleLogout = async () => {
    await db.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('gesa_current_user');
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-[#f1f5f9] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Validando Credenciais Governamentais...</p>
         </div>
      </div>
    );
  }

  if (!currentUser) return <Login onLogin={(u) => { setCurrentUser(u); localStorage.setItem('gesa_current_user', JSON.stringify(u)); }} />;

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      activeTenantId={currentUser.tenantId}
      isLive={isLiveSync}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      onTenantChange={() => {}}
    >
      <DatabaseStatusAlert errors={dbErrors} />
      
      {isLoadingData && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest text-center px-4">
                 Sincronizando com GESA Cloud Engine...
              </p>
           </div>
        </div>
      )}

      {selectedAmendment ? (
        <AmendmentDetail 
          amendment={selectedAmendment} 
          currentUser={currentUser}
          sectors={sectors}
          statuses={statuses}
          systemMode={SystemMode.PRODUCTION}
          onBack={() => setSelectedAmendment(null)}
          onMove={(movs, status) => {
             const updated = { 
               ...selectedAmendment, 
               movements: [...selectedAmendment.movements, ...movs], 
               status, 
               currentSector: movs[movs.length-1].toSector 
             };
             handleUpdateAmendment(updated);
          }}
          onUpdate={handleUpdateAmendment}
          onStatusChange={() => {}} 
          onDelete={() => {}}
        />
      ) : (
        <>
          {currentView === 'dashboard' && <Dashboard amendments={amendments} statusConfigs={statuses} onSelectAmendment={(id) => setSelectedAmendment(amendments.find(a => a.id === id) || null)} />}
          {currentView === 'amendments' && (
            <AmendmentList 
              amendments={amendments} 
              sectors={sectors} 
              statuses={statuses} 
              userRole={currentUser.role} 
              systemMode={SystemMode.PRODUCTION} 
              onSelect={setSelectedAmendment} 
              onCreate={handleUpdateAmendment} 
              onUpdate={handleUpdateAmendment} 
              onInactivate={() => {}} 
              error={dbErrors.amendments} 
            />
          )}
          {currentView === 'calendar' && <CalendarView amendments={amendments} onSelectAmendment={setSelectedAmendment} />}
          {currentView === 'import' && <ImportModule onImport={fetchData} sectors={sectors} tenantId={currentUser.tenantId} />}
          {currentView === 'reports' && <ReportModule amendments={amendments} />}
          {currentView === 'repository' && <RepositoryModule amendments={amendments} />}
          {currentView === 'sectors' && <SectorManagement sectors={sectors} statuses={statuses} onAdd={(s) => db.sectors.upsert({ ...s, tenantId: currentUser.tenantId }).then(fetchData)} onBatchAdd={(items) => fetchData()} onUpdateSla={handleUpdateSectorSla} error={dbErrors.sectors} />}
          {currentView === 'statuses' && <StatusManagement statuses={statuses} onAdd={(s) => db.statuses.upsert({ ...s, tenantId: currentUser.tenantId }).then(fetchData)} onReset={() => {}} onBatchAdd={(items) => fetchData()} error={dbErrors.statuses} />}
          {currentView === 'audit' && <AuditModule logs={logs} currentUser={currentUser} activeTenantId={currentUser.tenantId} error={dbErrors.audit} onRefresh={fetchData} />}
          {currentView === 'security' && <SecurityModule users={users} onDeleteUser={(id) => db.users.delete(id).then(fetchData)} currentUser={currentUser} onNavigateToRegister={() => setCurrentView('register')} error={dbErrors.users} onAddUser={() => {}} />}
          {currentView === 'register' && <UserRegistration onAddUser={(u) => db.users.upsert({ ...u, tenantId: currentUser.tenantId }).then(() => setCurrentView('security'))} onBack={() => setCurrentView('security')} />}
          {currentView === 'governance' && <GovernanceDocs />}
          {currentView === 'compliance_details' && <ComplianceDetails />}
          {currentView === 'api' && <ApiPortal currentUser={currentUser} amendments={amendments} />}
        </>
      )}
      <PlushNotificationContainer />
    </Layout>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);

export default App;
