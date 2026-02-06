
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AmendmentList } from './components/AmendmentList.tsx';
import { AmendmentDetail } from './components/AmendmentDetail.tsx';
import { ReportModule } from './components/ReportModule.tsx';
import { ImportModule } from './components/ImportModule.tsx';
import { RepositoryModule } from './components/RepositoryModule.tsx';
import { SecurityModule } from './components/SecurityModule.tsx';
import { AuditModule } from './components/AuditModule.tsx';
import { UserRegistration } from './components/UserRegistration.tsx';
import { SectorManagement } from './components/SectorManagement.tsx';
import { StatusManagement } from './components/StatusManagement.tsx';
import { GovernanceDocs } from './components/GovernanceDocs.tsx';
import { ComplianceDetails } from './components/ComplianceDetails.tsx';
import { ApiPortal } from './components/ApiPortal.tsx';
import { Login } from './components/Login.tsx';
import { DatabaseStatusAlert } from './components/DatabaseStatusAlert.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { NotificationProvider, useNotification } from './context/NotificationContext.tsx';
import { PlushNotificationContainer } from './components/PlushNotification.tsx';
import { 
  User, Amendment, SystemMode, StatusConfig, AuditLog, SectorConfig, AuditAction
} from './types.ts';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS, MOCK_USERS } from './constants.ts';
import { db } from './services/supabase.ts';
import { Activity, CloudSync } from 'lucide-react';

const AppContent: React.FC = () => {
  const { notify } = useNotification();
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gesa_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

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
    fetchData();
  }, [fetchData]);

  const handleUpdateAmendment = async (amendment: Amendment) => {
    try {
      const saved = await db.amendments.upsert({ ...amendment, tenantId: currentUser?.tenantId });
      
      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: AuditAction.UPDATE,
        details: `Sucesso: Gravação do processo SEI ${amendment.seiNumber}`,
        severity: 'INFO'
      });

      // Atualização imediata do estado local para refletir no Grid e Dashboard
      setAmendments(prev => {
        const exists = prev.some(a => a.id === saved.id);
        if (exists) {
          return prev.map(a => a.id === saved.id ? saved : a);
        }
        return [saved, ...prev]; // Novo registro entra no topo
      });

      if (selectedAmendment?.id === saved.id) setSelectedAmendment(saved);
      notify('success', 'Base Cloud Atualizada', `O processo ${amendment.seiNumber} foi sincronizado com sucesso.`);
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      console.error("Save failure:", errorMsg);
      notify('error', 'Falha na Gravação', `O banco rejeitou a operação. Motivo: ${errorMsg}`);
      
      if (errorMsg.includes('42501') || errorMsg.includes('permission denied')) {
        setDbErrors(prev => ({ ...prev, amendments: 'DATABASE_SETUP_REQUIRED' }));
      }
    }
  };

  const handleBatchImport = async (newAmendments: Amendment[]) => {
    setIsLoadingData(true);
    try {
      await db.amendments.insertMany(newAmendments.map(a => ({ ...a, tenantId: currentUser?.tenantId })));
      
      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: AuditAction.CREATE,
        details: `Importação em lote: ${newAmendments.length} emendas.`,
        severity: 'INFO'
      });

      await fetchData();
      notify('success', 'Importação Concluída', `${newAmendments.length} registros persistidos.`);
      setCurrentView('amendments');
    } catch (err: any) {
      notify('error', 'Erro na Carga', `Não foi possível incluir os registros: ${err.message}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gesa_current_user');
  };

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
          {currentView === 'import' && <ImportModule onImport={handleBatchImport} sectors={sectors} tenantId={currentUser.tenantId} />}
          {currentView === 'reports' && <ReportModule amendments={amendments} />}
          {currentView === 'repository' && <RepositoryModule amendments={amendments} />}
          {currentView === 'sectors' && <SectorManagement sectors={sectors} statuses={statuses} onAdd={(s) => db.sectors.upsert({ ...s, tenantId: currentUser.tenantId }).then(fetchData)} onBatchAdd={(items) => fetchData()} onUpdateSla={() => {}} error={dbErrors.sectors} />}
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
