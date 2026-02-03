
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
import { Login } from './components/Login.tsx';
import { SystemManual } from './components/SystemManual.tsx';
import { NotificationProvider, useNotification } from './context/NotificationContext.tsx';
import { PlushNotificationContainer } from './components/PlushNotification.tsx';
import { 
  User, Amendment, AmendmentMovement, SystemMode, StatusConfig, AuditLog, AuditAction, SectorConfig
} from './types.ts';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS, MOCK_USERS } from './constants.ts';
import { db } from './services/supabase.ts';

const AppContent: React.FC = () => {
  const { notify } = useNotification();
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gesa_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [dbErrors, setDbErrors] = useState<{
    users?: string;
    sectors?: string;
    statuses?: string;
    amendments?: string;
    audit?: string;
  }>({});

  // Helper para Registrar Auditoria e Recarregar Logs
  const logAction = useCallback(async (action: AuditAction, details: string, severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    if (!currentUser) return;
    try {
      await db.audit.log({
        tenantId: currentUser.tenantId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action,
        details,
        severity,
        timestamp: new Date().toISOString()
      });
      // Recarrega logs para manter a aba de auditoria atualizada
      const freshLogs = await db.audit.getLogs(currentUser.tenantId);
      setLogs(freshLogs);
    } catch (err) {
      console.error("Erro ao registrar log de auditoria:", err);
    }
  }, [currentUser]);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    const tenantId = currentUser.tenantId;
    setIsLoadingData(true);

    try {
      const data = await db.amendments.getAll(tenantId);
      setAmendments(data);
      setDbErrors(prev => ({ ...prev, amendments: undefined }));
    } catch (err: any) {
      if (err.message === 'TABLE_MISSING') {
        setDbErrors(prev => ({ ...prev, amendments: 'DATABASE_SETUP_REQUIRED' }));
        setAmendments(MOCK_AMENDMENTS);
      }
    }

    try {
      const data = await db.users.getAll(tenantId);
      setUsers(data);
      setDbErrors(prev => ({ ...prev, users: undefined }));
    } catch (err: any) {
      if (err.message === 'TABLE_MISSING') {
        setDbErrors(prev => ({ ...prev, users: 'DATABASE_SETUP_REQUIRED' }));
        setUsers(MOCK_USERS);
      }
    }

    try {
      const data = await db.sectors.getAll(tenantId);
      if (data.length > 0) {
        setSectors(data);
        setDbErrors(prev => ({ ...prev, sectors: undefined }));
      }
    } catch (err: any) {
      if (err.message === 'TABLE_MISSING') {
        setDbErrors(prev => ({ ...prev, sectors: 'DATABASE_SETUP_REQUIRED' }));
      }
    }

    try {
      const data = await db.statuses.getAll(tenantId);
      setStatuses(data);
      setDbErrors(prev => ({ ...prev, statuses: undefined }));
    } catch (err: any) {
      if (err.message === 'TABLE_MISSING') {
        setDbErrors(prev => ({ ...prev, statuses: 'DATABASE_SETUP_REQUIRED' }));
      }
    }

    try {
      const auditData = await db.audit.getLogs(tenantId);
      setLogs(auditData);
      setDbErrors(prev => ({ ...prev, audit: undefined }));
    } catch (err: any) {
      if (err.message === 'TABLE_MISSING') {
        setDbErrors(prev => ({ ...prev, audit: 'DATABASE_SETUP_REQUIRED' }));
      }
    }

    setIsLoadingData(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gesa_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gesa_current_user');
    }
  }, [currentUser]);

  const handleUpdateAmendment = async (amendment: Amendment) => {
    try {
      const saved = await db.amendments.upsert(amendment);
      setAmendments(prev => prev.map(a => a.id === saved.id ? saved : a));
      if (selectedAmendment?.id === saved.id) setSelectedAmendment(saved);
      notify('success', 'Atualizado', `Processo ${saved.seiNumber} salvo.`);
      logAction(AuditAction.UPDATE, `Editou o processo SEI ${saved.seiNumber}.`, 'INFO');
    } catch (err) {
      notify('error', 'Erro', 'Falha ao persistir dados.');
    }
  };

  const handleCreateAmendment = async (a: Amendment) => {
    try {
      const saved = await db.amendments.upsert({ ...a, tenantId: currentUser?.tenantId || 'GOIAS' });
      setAmendments(prev => [saved, ...prev]);
      notify('success', 'Criado', `Novo processo ${saved.seiNumber} registrado.`);
      logAction(AuditAction.CREATE, `Criou um novo registro de processo SEI: ${saved.seiNumber}.`, 'INFO');
    } catch (err) {
      notify('error', 'Erro', 'Falha ao registrar processo.');
    }
  };

  const handleMoveAmendment = (movements: AmendmentMovement[], newStatus: string) => {
    if (!selectedAmendment) return;
    const destName = movements.map(m => m.toSector).join(', ');
    const updated = {
      ...selectedAmendment,
      movements: [...selectedAmendment.movements, ...movements],
      status: newStatus,
      currentSector: movements[movements.length - 1].toSector
    };
    handleUpdateAmendment(updated);
    logAction(AuditAction.MOVE, `Tramitou o processo ${selectedAmendment.seiNumber} para: ${destName}. Status: ${newStatus}`, 'INFO');
  };

  const handleAddSector = async (sector: SectorConfig) => {
    try {
      const saved = await db.sectors.upsert(sector);
      setSectors(prev => {
        const index = prev.findIndex(s => s.id === saved.id || s.name === saved.name);
        if (index >= 0) {
          const newSectors = [...prev];
          newSectors[index] = saved;
          return newSectors;
        }
        return [...prev, saved];
      });
      notify('success', 'Setor Salvo', 'Unidade técnica atualizada.');
      logAction(AuditAction.UPDATE, `Configurou/Editou o setor: ${saved.name}. SLA: ${saved.defaultSlaDays}d.`, 'INFO');
    } catch (err) {
      notify('error', 'Erro DB', 'Falha ao salvar setor.');
    }
  };

  const handleBatchAddSectors = async (newSectors: any[]) => {
    try {
      const saved = await db.sectors.insertMany(newSectors);
      setSectors(prev => [...prev, ...saved]);
      notify('success', 'Lote Importado', `${saved.length} setores adicionados.`);
      logAction(AuditAction.CREATE, `Importou ${saved.length} setores via carga em lote.`, 'WARN');
    } catch (err) {}
  };

  const handleAddStatus = async (status: StatusConfig) => {
    try {
      const saved = await db.statuses.upsert(status);
      setStatuses(prev => {
        const index = prev.findIndex(s => s.id === saved.id || s.name === saved.name);
        if (index >= 0) {
          const newStatuses = [...prev];
          newStatuses[index] = saved;
          return newStatuses;
        }
        return [...prev, saved];
      });
      notify('success', 'Estado Salvo', 'Ciclo de vida atualizado.');
      logAction(AuditAction.UPDATE, `Adicionou/Alterou o estado do ciclo: ${saved.name}.`, 'INFO');
      return saved; // Retorna para uso em cadastro rápido
    } catch (err) {
      notify('error', 'Erro DB', 'Falha ao salvar estado.');
      throw err;
    }
  };

  const handleBatchAddStatuses = async (newStatuses: any[]) => {
    try {
      const saved = await db.statuses.insertMany(newStatuses);
      const freshData = await db.statuses.getAll(currentUser?.tenantId || 'GOIAS');
      setStatuses(freshData);
      notify('success', 'Sincronizado', `${saved.length} estados gravados.`);
      logAction(AuditAction.CREATE, `Realizou carga em lote de ${saved.length} novos estados do ciclo.`, 'WARN');
    } catch (err) {}
  };

  const handleResetStatuses = async () => {
    if (!currentUser) return;
    try {
      await db.statuses.resetToEmpty(currentUser.tenantId);
      setStatuses([]);
      notify('info', 'Base Limpa', 'Todos os estados foram removidos.');
      logAction(AuditAction.DELETE, `LIMPEZA DE BASE: Removeu todos os estados do ciclo do banco de dados.`, 'CRITICAL');
    } catch (err) {}
  };

  const handleAddUser = async (u: any) => {
    try {
      const savedUser = await db.users.upsert({ ...u, tenantId: currentUser?.tenantId || 'GOIAS', lgpdAccepted: true });
      setUsers(prev => [...prev, savedUser]);
      setCurrentView('security');
      logAction(AuditAction.SECURITY, `Provisionou novo usuário: ${savedUser.name} (${savedUser.role}).`, 'WARN');
    } catch (err) {}
  };

  const handleDeleteUser = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    try {
      await db.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      logAction(AuditAction.SECURITY, `REVOGAÇÃO DE ACESSO: Excluiu o usuário ${userToDelete?.name || id}.`, 'CRITICAL');
    } catch (err) {}
  };

  const handleLogout = () => {
    logAction(AuditAction.LOGIN, `Sessão encerrada pelo usuário.`, 'INFO').then(() => {
      setCurrentUser(null);
      notify('info', 'Sessão Encerrada', 'Até breve.');
    });
  };

  if (!currentUser) return <Login onLogin={(user) => { 
    setCurrentUser(user);
    // Log de login só pode ser feito após setar o user, ou via db.audit.log direto
    db.audit.log({
      tenantId: user.tenantId,
      actorId: user.id,
      actorName: user.name,
      action: AuditAction.LOGIN,
      details: `Acesso ao sistema realizado com sucesso.`,
      severity: 'INFO',
      timestamp: new Date().toISOString()
    });
  }} />;

  const renderView = () => {
    if (selectedAmendment) {
      return (
        <AmendmentDetail 
          amendment={selectedAmendment} 
          currentUser={currentUser}
          sectors={sectors}
          statuses={statuses}
          systemMode={SystemMode.PRODUCTION}
          onBack={() => setSelectedAmendment(null)}
          onMove={handleMoveAmendment}
          onUpdate={handleUpdateAmendment}
          onStatusChange={() => {}} 
          onDelete={() => {}}
        />
      );
    }

    switch (currentView) {
      case 'dashboard': 
        return <Dashboard 
          amendments={amendments} 
          statusConfigs={statuses} 
          onSelectAmendment={(id) => setSelectedAmendment(amendments.find(a => a.id === id) || null)} 
        />;
      case 'amendments': 
        return <AmendmentList 
          amendments={amendments} 
          sectors={sectors} 
          statuses={statuses} 
          userRole={currentUser.role} 
          systemMode={SystemMode.PRODUCTION} 
          onSelect={setSelectedAmendment} 
          onCreate={handleCreateAmendment} 
          onUpdate={handleUpdateAmendment} 
          onInactivate={() => {}} 
          onAddStatus={handleAddStatus}
          error={dbErrors.amendments}
        />;
      case 'sectors':
        return <SectorManagement 
          sectors={sectors} 
          statuses={statuses} 
          onAdd={handleAddSector} 
          onBatchAdd={handleBatchAddSectors} 
          onUpdateSla={(id, sla) => handleAddSector(sectors.find(s => s.id === id)!)}
          error={dbErrors.sectors}
        />;
      case 'statuses':
        return <StatusManagement 
          statuses={statuses} 
          onAdd={handleAddStatus} 
          onReset={handleResetStatuses} 
          onBatchAdd={handleBatchAddStatuses} 
          error={dbErrors.statuses}
        />;
      case 'import':
        return <ImportModule onImport={(data) => { 
          data.forEach(item => db.amendments.upsert(item));
          setAmendments(prev => [...data, ...prev]); 
          logAction(AuditAction.CREATE, `Realizou importação de ${data.length} registros via CSV.`, 'WARN');
        }} sectors={sectors} tenantId={currentUser.tenantId} />;
      case 'repository':
        return <RepositoryModule amendments={amendments} />;
      case 'reports': 
        return <ReportModule amendments={amendments} />;
      case 'security':
        return <SecurityModule 
          users={users} 
          onAddUser={() => {}} 
          onDeleteUser={handleDeleteUser} 
          currentUser={currentUser} 
          onNavigateToRegister={() => setCurrentView('register')}
          error={dbErrors.users}
        />;
      case 'register':
        return <UserRegistration onAddUser={handleAddUser} onBack={() => setCurrentView('security')} />;
      case 'audit':
        return <AuditModule 
          logs={logs} 
          currentUser={currentUser} 
          activeTenantId={currentUser.tenantId} 
          error={dbErrors.audit}
          onRefresh={() => fetchData()}
        />;
      case 'manual':
        return <SystemManual onBack={() => setCurrentView('dashboard')} />;
      default: 
        return <Dashboard amendments={amendments} statusConfigs={statuses} onSelectAmendment={() => {}} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      activeTenantId={currentUser.tenantId}
      onNavigate={(v) => { setCurrentView(v); setSelectedAmendment(null); }} 
      onLogout={handleLogout}
      onTenantChange={(id) => {
        if (currentUser) {
          setCurrentUser({ ...currentUser, tenantId: id });
          logAction(AuditAction.TENANT_SWITCH, `Alterou a unidade de trabalho para: ${id}`, 'INFO');
        }
      }}
    >
      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 animate-pulse">
           <div className="w-12 h-12 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div>
           <p className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Sincronizando Base GESA Cloud...</p>
        </div>
      ) : renderView()}
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
