
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AmendmentList } from './components/AmendmentList';
import { AmendmentDetail } from './components/AmendmentDetail';
import { RepositoryModule } from './components/RepositoryModule';
import { ReportModule } from './components/ReportModule';
import { AuditModule } from './components/AuditModule';
import { SectorManagement } from './components/SectorManagement';
import { StatusManagement } from './components/StatusManagement';
import { SecurityModule } from './components/SecurityModule';
import { UserRegistration } from './components/UserRegistration';
import { GovernanceDocs } from './components/GovernanceDocs';
import { ApiPortal } from './components/ApiPortal';
import { TestingPanel } from './components/TestingPanel';
import { SystemManual } from './components/SystemManual';
import { DebugConsole } from './components/DebugConsole';
import { Login } from './components/Login';
import { LGPDModal } from './components/LGPDModal';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { PlushNotificationContainer } from './components/PlushNotification';
import { 
  User, Amendment, Role, Status, SectorConfig, StatusConfig,
  AmendmentMovement, SystemMode, AuditLog, AuditAction
} from './types';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS, APP_VERSION } from './constants';
import { db, supabase } from './services/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { notify } = useNotification();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTenantId, setActiveTenantId] = useState<string>('T-01'); 
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [systemMode, setSystemMode] = useState<SystemMode>(SystemMode.PRODUCTION);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const loadData = useCallback(async (tenantId: string) => {
    setIsLoading(true);
    setDbError(null);
    try {
      const [fetchedAmendments, fetchedSectors, fetchedStatuses, fetchedLogs, fetchedUsers] = await Promise.all([
        db.amendments.getAll(tenantId),
        db.sectors.getAll(tenantId),
        db.statuses.getAll(tenantId),
        db.audit.getLogs(tenantId),
        db.profiles.getAll(tenantId)
      ]);
      setAmendments(fetchedAmendments);
      if (fetchedSectors.length > 0) setSectors(fetchedSectors);
      setStatuses(fetchedStatuses);
      setAuditLogs(fetchedLogs);
      setSystemUsers(fetchedUsers);
    } catch (err: any) {
      console.error("Erro ao carregar dados do banco:", err);
      if (err.message === 'TABLE_MISSING') setDbError('DATABASE_SETUP_REQUIRED');
      else setAmendments(MOCK_AMENDMENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const user = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email,
          email: session.user.email || '',
          role: session.user.user_metadata.role || Role.OPERATOR,
          tenantId: session.user.user_metadata.tenantId || 'T-01',
          lgpdAccepted: session.user.user_metadata.lgpdAccepted || false,
          avatarUrl: `https://ui-avatars.com/api/?name=${session.user.user_metadata.name || session.user.email}&background=0d457a&color=fff`,
          department: session.user.user_metadata.department || 'GESA'
        };
        setCurrentUser(user);
        setActiveTenantId(user.tenantId);
        loadData(user.tenantId);
        notify('info', 'Autenticação Bem-sucedida', `Bem-vindo, ${user.name}. Sessão governamental iniciada.`);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadData, notify]);

  const handleCreateUser = async (userData: any) => {
    try {
      await db.auth.signUp(
        userData.email, 
        userData.password, 
        userData.name, 
        userData.role, 
        activeTenantId,
        userData.department
      );
      
      await db.audit.log({ 
        action: AuditAction.SECURITY, 
        details: `Novo acesso provisionado: ${userData.name} (${userData.role}) em ${userData.department}` 
      });
      
      notify('success', 'Usuário Provisionado', `Acesso criado com sucesso para ${userData.name}.`);
      loadData(activeTenantId);
    } catch (err: any) {
      notify('error', 'Falha no Registro', err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await db.audit.log({ 
        action: AuditAction.SECURITY, 
        details: `Revogação de acesso solicitada para o ID: ${userId}`,
        severity: 'CRITICAL'
      });
      
      notify('warning', 'Revogação em Análise', 'A solicitação de revogação foi registrada para auditoria.');
      loadData(activeTenantId);
    } catch (err: any) {
      notify('error', 'Erro na Revogação', err.message);
    }
  };

  const handleUpdateAmendment = async (amendment: Amendment) => {
    try {
      const updated = await db.amendments.upsert(amendment);
      setAmendments(prev => prev.map(a => a.id === updated.id ? updated : a));
      if (selectedAmendment?.id === updated.id) {
        setSelectedAmendment(updated);
      }
      db.audit.log({ action: AuditAction.UPDATE, details: `Processo ${updated.seiNumber} atualizado.` });
      notify('success', 'Dados Sincronizados', `Processo ${updated.seiNumber} atualizado na base.`);
    } catch (err) {
      notify('error', 'Erro de Sincronização', 'Não foi possível salvar as alterações no banco de dados.');
    }
  };

  const handleMoveAmendment = async (movements: AmendmentMovement[], newStatus: string) => {
    if (!selectedAmendment) return;
    
    const updatedMovements = [...selectedAmendment.movements, ...movements];
    const destinationNames = movements.map(m => m.toSector).join(' | ');
    
    const updatedAmendment = {
      ...selectedAmendment,
      movements: updatedMovements,
      status: newStatus,
      currentSector: destinationNames
    };

    try {
      const saved = await db.amendments.upsert(updatedAmendment);
      setAmendments(prev => prev.map(a => a.id === saved.id ? saved : a));
      setSelectedAmendment(saved);
      db.audit.log({ action: AuditAction.MOVE, details: `Processo ${saved.seiNumber} tramitado para ${destinationNames}.` });
      notify('success', 'Tramitação Concluída', `Processo enviado para ${destinationNames}.`);
    } catch (err) {
      notify('error', 'Erro na Tramitação', 'Ocorreu uma falha ao registrar o movimento do processo.');
    }
  };

  const handleLogout = async () => {
    await db.auth.signOut();
    setCurrentUser(null);
    notify('info', 'Sessão Encerrada', 'Você saiu do sistema com segurança.');
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f1f5f9] gap-4">
        <Loader2 className="animate-spin text-[#0d457a]" size={48} />
        <p className="text-xs font-black text-[#0d457a] uppercase tracking-widest animate-pulse">Autenticando na GESA Cloud...</p>
      </div>
    );
  }

  if (!currentUser) return <Login />;

  const renderView = () => {
    if (selectedAmendment) {
      return (
        <AmendmentDetail 
          amendment={selectedAmendment} 
          currentUser={currentUser}
          sectors={sectors}
          statuses={statuses}
          systemMode={systemMode}
          onBack={() => setSelectedAmendment(null)}
          onMove={handleMoveAmendment}
          onUpdate={handleUpdateAmendment}
          onStatusChange={() => {}} 
          onDelete={() => {}}
        />
      );
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard amendments={amendments} statusConfigs={statuses} onSelectAmendment={(id) => setSelectedAmendment(amendments.find(a => a.id === id) || null)} />;
      case 'amendments': return <AmendmentList amendments={amendments} sectors={sectors} statuses={statuses} userRole={currentUser.role} systemMode={systemMode} onSelect={setSelectedAmendment} onCreate={(a) => db.amendments.upsert(a).then(() => loadData(activeTenantId))} onUpdate={handleUpdateAmendment} onInactivate={() => {}} />;
      case 'repository': return <RepositoryModule amendments={amendments} />;
      case 'reports': return <ReportModule amendments={amendments} />;
      case 'audit': return <AuditModule logs={auditLogs} currentUser={currentUser} activeTenantId={activeTenantId} />;
      case 'sectors': return <SectorManagement sectors={sectors} statuses={statuses} onAdd={(s) => db.sectors.upsert(s).then(() => loadData(activeTenantId))} onBatchAdd={(s) => db.sectors.insertMany(s).then(() => loadData(activeTenantId))} onUpdateSla={() => {}} error={dbError} />;
      case 'statuses': return <StatusManagement statuses={statuses} onAdd={(s) => db.statuses.upsert(s).then(() => loadData(activeTenantId))} onBatchAdd={(s) => db.statuses.insertMany(s).then(() => loadData(activeTenantId))} onReset={() => db.statuses.resetToEmpty(activeTenantId).then(() => loadData(activeTenantId))} error={dbError} />;
      case 'security': return <SecurityModule users={systemUsers} onAddUser={handleCreateUser} onDeleteUser={handleDeleteUser} currentUser={currentUser} isLoading={isLoading} />;
      case 'register-user': return <UserRegistration onAddUser={handleCreateUser} onBack={() => setCurrentView('security')} />;
      case 'api': return <ApiPortal currentUser={currentUser} amendments={amendments} />;
      case 'debugger': return <DebugConsole amendments={amendments} currentUser={currentUser} logs={auditLogs} />;
      case 'qa': return <TestingPanel />;
      case 'manual': return <SystemManual onBack={() => setCurrentView('dashboard')} />;
      case 'docs': return <GovernanceDocs />;
      default: return <Dashboard amendments={amendments} statusConfigs={statuses} onSelectAmendment={() => {}} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      activeTenantId={activeTenantId} 
      onNavigate={(v) => { setCurrentView(v); setSelectedAmendment(null); }} 
      onLogout={handleLogout}
      onTenantChange={setActiveTenantId}
    >
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
      <PlushNotificationContainer />
    </NotificationProvider>
  );
};

export default App;
