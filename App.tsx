
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  User, Amendment, SystemMode, StatusConfig, AuditLog, SectorConfig, AuditAction, Status, Role
} from './types';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS, MOCK_USERS } from './constants';
import { db, supabase } from './services/supabase';

/**
 * COMPONENTE PRINCIPAL (ORQUESTRADOR)
 * Gerencia o estado global da aplicação, autenticação, persistência e roteamento interno.
 */
const AppContent: React.FC = () => {
  const { notify } = useNotification();
  
  // ESTADO DE SESSÃO E USUÁRIO
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  // ESTADO DE DADOS OPERACIONAIS
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // ESTADO DE NAVEGAÇÃO
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // ESTADO DE INFRAESTRUTURA E SINCRONIZAÇÃO
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [dbErrors, setDbErrors] = useState<{ [key: string]: string | undefined }>({});

  /**
   * MATRIZ DE SEGURANÇA LÓGICA (GUARDAS)
   * Impede o acesso funcional a módulos restritos.
   */
  const VIEW_ACCESS_MAP: Record<string, Role[]> = useMemo(() => ({
    dashboard: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.AUDITOR, Role.VIEWER],
    amendments: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR],
    calendar: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.AUDITOR, Role.VIEWER],
    repository: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.AUDITOR, Role.VIEWER],
    reports: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR],
    sectors: [Role.SUPER_ADMIN, Role.ADMIN],
    statuses: [Role.SUPER_ADMIN, Role.ADMIN],
    audit: [Role.SUPER_ADMIN, Role.AUDITOR],
    security: [Role.SUPER_ADMIN, Role.ADMIN],
    register: [Role.SUPER_ADMIN, Role.ADMIN],
    api: [Role.SUPER_ADMIN, Role.ADMIN],
    documentation: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR],
    governance: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR],
    compliance_details: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.AUDITOR, Role.VIEWER],
  }), []);

  const hasAccess = useCallback((view: string) => {
    if (!currentUser) return false;
    const allowedRoles = VIEW_ACCESS_MAP[view];
    return !allowedRoles || allowedRoles.includes(currentUser.role);
  }, [currentUser, VIEW_ACCESS_MAP]);

  /**
   * Função de busca de dados (Fetch) com suporte a isolamento de Secretaria (Tenant).
   */
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
        console.warn(`Aviso: Falha ao carregar ${key} do banco. Usando cache local.`);
        if (err.message === 'TABLE_MISSING' || err.message?.includes('does not exist')) {
          setDbErrors(prev => ({ ...prev, [key]: 'DATABASE_SETUP_REQUIRED' }));
        } else if (err.message?.includes('SCHEMA_MISMATCH') || err.message?.includes('column')) {
          setDbErrors(prev => ({ ...prev, [key]: 'SCHEMA_MISMATCH' }));
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
          if (profile) {
            setCurrentUser(profile);
          }
          else {
            const saved = localStorage.getItem('gesa_current_user');
            if (saved) setCurrentUser(JSON.parse(saved));
          }
        } else {
          const saved = localStorage.getItem('gesa_current_user');
          if (saved) setCurrentUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Falha ao recuperar sessão segura:", e);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchData();
  }, [currentUser, fetchData]);

  const handleUpdateAmendment = async (amendment: Amendment) => {
    try {
      const isNew = !amendment.id;
      const payload = { ...amendment, updatedAt: new Date().toISOString() };
      const saved = await db.amendments.upsert({ ...payload, tenantId: currentUser?.tenantId || 'GOIAS' });
      
      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: isNew ? AuditAction.CREATE : AuditAction.UPDATE,
        details: `${isNew ? 'Protocolo' : 'Edição'} do processo SEI ${amendment.seiNumber}. Status: ${amendment.status}`,
        severity: 'INFO'
      });

      notify('success', 'Registro Efetivado', `Processo SEI ${amendment.seiNumber} sincronizado na nuvem.`);
      await fetchData();
      if (!isNew && selectedAmendment?.id === saved.id) {
        setSelectedAmendment(saved);
      }
    } catch (err: any) {
      console.error("Erro crítico de persistência:", err);
      notify('warning', 'Modo Local Ativado', 'O registro foi mantido apenas em memória devido a um erro de rede.', 8000);
    }
  };

  const handleDeleteAmendment = async (id: string, justification: string) => {
    setIsLoadingData(true);
    const amendmentToDelete = amendments.find(a => a.id === id);
    try {
      if (id && !id.startsWith('local-') && !id.startsWith('a-')) {
        await db.amendments.delete(id);
      }
      await db.audit.log({
        tenantId: currentUser?.tenantId,
        actorId: currentUser?.id,
        actorName: currentUser?.name,
        action: AuditAction.DELETE,
        details: `EXCLUSÃO DEFINITIVA do SEI ${amendmentToDelete?.seiNumber || 'Desconhecido'}. Justificativa: ${justification}`,
        severity: 'CRITICAL'
      });
      setAmendments(prev => prev.filter(a => a.id !== id));
      setSelectedAmendment(null);
      notify('error', 'Registro Removido', `O processo foi excluído permanentemente da base GESA.`);
      await fetchData();
    } catch (err: any) {
      notify('error', 'Falha na Operação', `Erro: ${err.message}.`);
    } finally {
      setIsLoadingData(false);
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
            <p className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Validando Sessão Segura...</p>
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
      onlineUsers={onlineUsers}
      onNavigate={(v) => hasAccess(v) ? setCurrentView(v) : notify('error', 'Acesso Negado', 'Seu perfil não possui privilégios para este módulo.')}
      onLogout={handleLogout}
      onTenantChange={() => {}}
      onChangePassword={() => setIsPasswordModalOpen(true)}
    >
      {isLoadingData && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Sincronizando Dados Cloud...</p>
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
             const updatedMovements = [...selectedAmendment.movements];
             if (updatedMovements.length > 0) {
               const lastIndex = updatedMovements.length - 1;
               updatedMovements[lastIndex] = { ...updatedMovements[lastIndex], dateOut: new Date().toISOString() };
             }
             const finalStatusNames = [Status.CONCLUDED, Status.ARCHIVED, Status.COMMITMENT_LIQUIDATION];
             const isFinal = finalStatusNames.includes(status as Status) || statuses.find(s => s.name === status)?.isFinal;
             const processedNewMovs = movs.map((m, idx) => ({ ...m, dateOut: (isFinal && idx === movs.length - 1) ? new Date().toISOString() : null }));
             const updated = { ...selectedAmendment, movements: [...updatedMovements, ...processedNewMovs], status, currentSector: processedNewMovs[processedNewMovs.length-1].toSector };
             handleUpdateAmendment(updated);
          }}
          onUpdate={handleUpdateAmendment}
          onStatusChange={() => {}} 
          onDelete={handleDeleteAmendment}
        />
      ) : (
        <>
          {(currentView === 'amendments' || currentView === 'dashboard') && Object.values(dbErrors).some(v => !!v) && (
            <DatabaseStatusAlert errors={dbErrors} />
          )}

          {currentView === 'dashboard' && <Dashboard amendments={amendments} statusConfigs={statuses} onSelectAmendment={(id) => setSelectedAmendment(amendments.find(a => a.id === id) || null)} />}
          {currentView === 'amendments' && hasAccess('amendments') && (
            <AmendmentList amendments={amendments} sectors={sectors} statuses={statuses} userRole={currentUser.role} systemMode={SystemMode.PRODUCTION} onSelect={setSelectedAmendment} onCreate={handleUpdateAmendment} onUpdate={handleUpdateAmendment} onInactivate={() => {}} error={dbErrors.amendments} />
          )}
          {currentView === 'calendar' && <CalendarView amendments={amendments} onSelectAmendment={setSelectedAmendment} />}
          {currentView === 'reports' && hasAccess('reports') && <ReportModule amendments={amendments} />}
          {currentView === 'repository' && <RepositoryModule amendments={amendments} />}
          
          {currentView === 'sectors' && hasAccess('sectors') && <SectorManagement sectors={sectors} statuses={statuses} onAdd={(s) => db.sectors.upsert({ ...s, tenantId: currentUser.tenantId }).then(fetchData)} onBatchAdd={(items) => fetchData()} onUpdateSla={(id, sla) => {}} error={dbErrors.sectors} />}
          {currentView === 'statuses' && hasAccess('statuses') && <StatusManagement statuses={statuses} onAdd={(s) => db.statuses.upsert({ ...s, tenantId: currentUser.tenantId }).then(fetchData)} onReset={() => {}} onBatchAdd={(items) => fetchData()} error={dbErrors.statuses} />}
          {currentView === 'audit' && hasAccess('audit') && <AuditModule logs={logs} currentUser={currentUser} activeTenantId={currentUser.tenantId} error={dbErrors.audit} onRefresh={fetchData} />}
          {currentView === 'security' && hasAccess('security') && <SecurityModule users={users} onDeleteUser={(id) => db.users.delete(id).then(fetchData)} currentUser={currentUser} onNavigateToRegister={() => setCurrentView('register')} error={dbErrors.users} onAddUser={() => {}} />}
          {currentView === 'register' && hasAccess('register') && <UserRegistration onAddUser={(u) => db.users.upsert({ ...u, tenantId: currentUser.tenantId }).then(() => setCurrentView('security'))} onBack={() => setCurrentView('security')} />}
          
          {currentView === 'documentation' && hasAccess('documentation') && <SystemDocumentation />}
          {currentView === 'governance' && hasAccess('governance') && <GovernanceDocs />}
          {currentView === 'compliance_details' && <ComplianceDetails />}
          {currentView === 'api' && hasAccess('api') && <ApiPortal currentUser={currentUser} amendments={amendments} />}
        </>
      )}

      {isPasswordModalOpen && (
        <PasswordChangeModal currentUser={currentUser} onClose={() => setIsPasswordModalOpen(false)} />
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
