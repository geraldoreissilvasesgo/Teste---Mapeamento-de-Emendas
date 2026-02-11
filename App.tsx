import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AmendmentList } from './components/AmendmentList';
import { AmendmentDetail } from './components/AmendmentDetail';
import { ReportModule } from './components/ReportModule';
import { RepositoryModule } from './components/RepositoryModule';
import { SecurityModule } from './components/SecurityModule';
import { AuditModule } from './components/AuditModule';
import { UserRegistration } from './components/UserRegistration';
import { SectorManagement } from './components/SectorManagement';
import { StatusManagement } from './components/StatusManagement';
import { GovernanceDocs } from './components/GovernanceDocs';
import { ComplianceDetails } from './components/ComplianceDetails';
import { ApiPortal } from './components/ApiPortal';
import { SystemDocumentation } from './components/SystemDocumentation';
import { DatabaseStatusAlert } from './components/DatabaseStatusAlert';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { Login } from './components/Login';
import { CalendarView } from './components/CalendarView';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { PlushNotificationContainer } from './components/PlushNotification';
import { 
  User, Amendment, SystemMode, StatusConfig, AuditLog, SectorConfig, AuditAction, Status
} from './types';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS, MOCK_USERS } from './constants';
import { db, supabase } from './services/supabase';

const AppContent: React.FC = () => {
  const { notify } = useNotification();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [dbErrors, setDbErrors] = useState<{ [key: string]: string | undefined }>({});

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    const tId = currentUser.tenantId; 
    setIsLoadingData(true);

    const loadTable = async (key: string, promise: Promise<any>, fallback: any, setter: (d: any) => void) => {
      try {
        const data = await promise;
        setter(data);
        setDbErrors(prev => ({ ...prev, [key]: undefined }));
        setIsLiveSync(true);
      } catch (err: any) {
        console.warn(`Aviso: Usando modo local para ${key}.`);
        if (err.message === 'TABLE_MISSING' || err.message?.includes('does not exist')) {
          setDbErrors(prev => ({ ...prev, [key]: 'DATABASE_SETUP_REQUIRED' }));
        }
        setter(fallback);
      }
    };

    await Promise.all([
      loadTable('amendments', db.amendments.getAll(tId), MOCK_AMENDMENTS, setAmendments),
      loadTable('users', db.users.getAll(tId), MOCK_USERS, setUsers),
      loadTable('sectors', db.sectors.getAll(tId), DEFAULT_SECTOR_CONFIGS, (d) => { if(d.length > 0) setSectors(d); }),
      loadTable('statuses', db.statuses.getAll(tId), [], setStatuses),
      loadTable('audit', db.audit.getAll(tId), [], setLogs)
    ]);

    setIsLoadingData(false);
  }, [currentUser]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const profile = await db.users.getByEmail(session.user.email);
          if (profile) setCurrentUser(profile);
          else {
            const saved = localStorage.getItem('gesa_current_user');
            if (saved) setCurrentUser(JSON.parse(saved));
          }
        } else {
          const saved = localStorage.getItem('gesa_current_user');
          if (saved) setCurrentUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Falha ao recuperar sessão:", e);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, fetchData]);

  const handleUpdateAmendment = async (amendment: Amendment) => {
    const previousAmendments = [...amendments];
    const previousSelected = selectedAmendment;

    setAmendments(prev => {
      const exists = prev.find(a => a.id === amendment.id);
      if (!exists) return [amendment, ...prev];
      return prev.map(a => a.id === amendment.id ? amendment : a);
    });
    
    if (selectedAmendment?.id === amendment.id) setSelectedAmendment(amendment);

    try {
      const isNew = !amendment.id;
      const payload = { ...amendment, updatedAt: new Date().toISOString() };
      const saved = await db.amendments.upsert({ ...payload, tenantId: currentUser?.tenantId || 'GOIAS' });
      
      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: isNew ? AuditAction.CREATE : AuditAction.UPDATE,
        details: `${isNew ? 'Protocolo' : 'Edição'} do SEI ${amendment.seiNumber}.`,
        severity: 'INFO'
      });

      notify('success', 'Sincronizado', `Processo SEI ${amendment.seiNumber} atualizado na nuvem.`);
      setAmendments(prev => prev.map(a => (a.id === amendment.id || a.seiNumber === saved.seiNumber) ? saved : a));
      if (selectedAmendment?.id === amendment.id) setSelectedAmendment(saved);
    } catch (err: any) {
      if (err.message !== 'TABLE_MISSING') {
        setAmendments(previousAmendments);
        setSelectedAmendment(previousSelected);
      }
      notify('warning', 'Modo Offline', 'Alteração mantida localmente (Banco não configurado).');
    }
  };

  const handleDeleteAmendment = async (id: string, justification: string) => {
    const amendmentToDelete = amendments.find(a => a.id === id);
    if (!amendmentToDelete) return;

    // Ação Reativa Imediata
    setAmendments(prev => prev.filter(a => a.id !== id));
    setSelectedAmendment(null);

    try {
      // Tenta exclusão no Supabase apenas se não for ID mock
      if (id && id.length > 10) {
        await db.amendments.delete(id);
      }

      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: AuditAction.DELETE,
        details: `EXCLUSÃO DEFINITIVA: SEI ${amendmentToDelete.seiNumber}. Justificativa: ${justification}`,
        severity: 'CRITICAL'
      });

      notify('error', 'Registro Removido', `O processo SEI ${amendmentToDelete.seiNumber} foi excluído.`);
    } catch (err: any) {
      console.error("Falha na exclusão remota:", err);
      // Se for apenas erro de tabela ausente, não re-sincroniza para não trazer o mock de volta
      if (err.message !== 'TABLE_MISSING') {
        await fetchData();
        notify('error', 'Falha na Operação', 'Não foi possível completar a exclusão no servidor.');
      }
    }
  };

  const handleLogout = async () => {
    await db.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('gesa_current_user');
  };

  if (isInitializing) return (
    <div className="h-screen w-screen bg-[#f1f5f9] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

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
      onChangePassword={() => setIsPasswordModalOpen(true)}
    >
      {isLoadingData && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div>
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
             const updatedMovements = [...selectedAmendment.movements];
             if (updatedMovements.length > 0) {
               updatedMovements[updatedMovements.length - 1].dateOut = new Date().toISOString();
             }
             const updated = { 
               ...selectedAmendment, 
               movements: [...updatedMovements, ...movs], 
               status, 
               currentSector: movs[movs.length-1].toSector 
             };
             handleUpdateAmendment(updated);
          }}
          onUpdate={handleUpdateAmendment}
          onStatusChange={() => {}} 
          onDelete={handleDeleteAmendment}
        />
      ) : (
        <>
          {Object.values(dbErrors).some(v => !!v) && <DatabaseStatusAlert errors={dbErrors} />}
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
            />
          )}
          {currentView === 'calendar' && <CalendarView amendments={amendments} onSelectAmendment={setSelectedAmendment} />}
          {currentView === 'reports' && <ReportModule amendments={amendments} />}
          {currentView === 'repository' && <RepositoryModule amendments={amendments} />}
          {currentView === 'sectors' && <SectorManagement sectors={sectors} statuses={statuses} onAdd={(s) => db.sectors.upsert({ ...s, tenantId: currentUser.tenantId }).then(fetchData)} onBatchAdd={() => fetchData()} onUpdateSla={() => {}} />}
          {currentView === 'statuses' && <StatusManagement statuses={statuses} onAdd={(s) => db.statuses.upsert({ ...s, tenantId: currentUser.tenantId }).then(fetchData)} onReset={() => {}} onBatchAdd={() => fetchData()} />}
          {currentView === 'audit' && <AuditModule logs={logs} currentUser={currentUser} activeTenantId={currentUser.tenantId} onRefresh={fetchData} />}
          {currentView === 'security' && <SecurityModule users={users} onDeleteUser={(id) => db.users.delete(id).then(fetchData)} currentUser={currentUser} onNavigateToRegister={() => setCurrentView('register')} />}
          {currentView === 'register' && <UserRegistration onAddUser={(u) => db.users.upsert({ ...u, tenantId: currentUser.tenantId }).then(() => setCurrentView('security'))} onBack={() => setCurrentView('security')} />}
          {currentView === 'documentation' && <SystemDocumentation />}
          {currentView === 'governance' && <GovernanceDocs />}
          {currentView === 'compliance_details' && <ComplianceDetails />}
          {currentView === 'api' && <ApiPortal currentUser={currentUser} amendments={amendments} />}
        </>
      )}

      {isPasswordModalOpen && <PasswordChangeModal currentUser={currentUser} onClose={() => setIsPasswordModalOpen(false)} />}
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