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
import { MobileAppGuide } from './components/MobileAppGuide';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { Login } from './components/Login';
import { CalendarView } from './components/CalendarView';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { PlushNotificationContainer } from './components/PlushNotification';
import { 
  User, Amendment, SystemMode, StatusConfig, AuditLog, SectorConfig, AuditAction, Status, Role, AmendmentMovement
} from './types';
import { LogIn, ShieldCheck } from 'lucide-react';
import { MOCK_AMENDMENTS, DEFAULT_SECTOR_CONFIGS, MOCK_USERS } from './constants';
import { db, supabase } from './services/supabase';

/**
 * COMPONENTE PRINCIPAL (ORQUESTRADOR)
 * Gerencia o estado global da aplicação, autenticação, persistência e sincronismo real-time.
 */
const AppContent: React.FC = () => {
  const { notify } = useNotification();
  
  // ESTADO DE SESSÃO E USUÁRIO
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // ESTADO DE DADOS OPERACIONAIS
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // ESTADO DE NAVEGAÇÃO
  const [currentView, setCurrentView] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // ESTADO DE INFRAESTRUTURA E SINCRONIZAÇÃO
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [dbErrors, setDbErrors] = useState<{ [key: string]: string | undefined }>({});

  /**
   * MATRIZ DE SEGURANÇA LÓGICA (GUARDAS DE NAVEGAÇÃO)
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
    mobile_app: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.AUDITOR, Role.VIEWER],
    documentation: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR],
    governance: [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR],
    compliance_details: [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.AUDITOR, Role.VIEWER],
  }), []);

  /**
   * Busca inicial de dados com isolamento de Tenant (Secretaria).
   */
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    const tId = currentUser.tenantId; 

    const loadTable = async (key: string, promise: Promise<any>, fallback: any, setter: (d: any) => void) => {
      try {
        const data = await promise;
        setter(data);
        setDbErrors(prev => ({ ...prev, [key]: undefined }));
        setIsLiveSync(true);
      } catch (err: any) {
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
  }, [currentUser]);

  // EFEITO 1: Recuperação de Sessão Segura
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const profile = await db.users.getByEmail(session.user.email);
          if (profile) {
            setCurrentUser(profile);
            return;
          }
        }
        const saved = localStorage.getItem('gesa_current_user');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        } else {
          setShowLogin(true);
        }
      } catch (e) {
        console.error("Erro na recuperação de sessão:", e);
        setShowLogin(true);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, []);

  // EFEITO 2: Sincronização em Tempo Real (Realtime) para Concorrência
  useEffect(() => {
    if (!currentUser) return;
    fetchData();

    // Inscrição no canal Realtime do Supabase para refletir mudanças de outros usuários instantaneamente
    const channel = supabase
      .channel(`tenant-${currentUser.tenantId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'amendments',
        filter: `tenantId=eq.${currentUser.tenantId}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAmendments(prev => [payload.new as Amendment, ...prev]);
          notify('info', 'Processo Recebido', `Novo processo ${payload.new.seiNumber} protocolado por outro usuário.`);
        } else if (payload.eventType === 'UPDATE') {
          setAmendments(prev => prev.map(a => a.id === payload.new.id ? (payload.new as Amendment) : a));
        } else if (payload.eventType === 'DELETE') {
          setAmendments(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        db.audit.getAll(currentUser.tenantId).then(setLogs);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchData, notify]);

  /**
   * HANDLERS DE OPERAÇÕES (CRUD + WORKFLOW)
   */
  const handleCreateAmendment = async (data: Amendment) => {
    if (!currentUser) return;
    try {
      const result = await db.amendments.upsert({ ...data, tenantId: currentUser.tenantId });
      if (result) {
        await db.audit.log({
          tenantId: currentUser.tenantId,
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: AuditAction.CREATE,
          details: `Protocolo SEI ${data.seiNumber} iniciado no sistema GESA.`,
          severity: 'INFO'
        });
        notify('success', 'Protocolo Efetivado', `Processo ${data.seiNumber} registrado com sucesso.`);
      }
    } catch (e: any) {
      notify('error', 'Falha no Registro', e.message);
    }
  };

  const handleUpdateAmendment = async (data: Amendment) => {
    if (!currentUser) return;
    try {
      const result = await db.amendments.upsert(data);
      if (result) {
        await db.audit.log({
          tenantId: currentUser.tenantId,
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: AuditAction.UPDATE,
          details: `Dados do processo ${data.seiNumber} atualizados via editor de fluxo.`,
          severity: 'INFO'
        });
        if (selectedAmendment?.id === data.id) setSelectedAmendment(result);
        notify('success', 'Registro Atualizado', 'As alterações foram salvas na nuvem.');
      }
    } catch (e: any) {
      notify('error', 'Erro na Atualização', e.message);
    }
  };

  const handleMoveAmendment = async (movements: AmendmentMovement[], newStatus: string) => {
    if (!selectedAmendment || !currentUser) return;
    
    const updated: Amendment = {
      ...selectedAmendment,
      movements: [...selectedAmendment.movements, ...movements],
      status: newStatus,
      currentSector: movements[movements.length - 1].toSector,
      updatedAt: new Date().toISOString()
    };

    try {
      const result = await db.amendments.upsert(updated);
      if (result) {
        await db.audit.log({
          tenantId: currentUser.tenantId,
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: AuditAction.MOVE,
          details: `Processo ${selectedAmendment.seiNumber} tramitado para ${updated.currentSector}.`,
          severity: 'INFO'
        });
        setSelectedAmendment(result);
        notify('success', 'Trâmite Realizado', 'A movimentação setorial foi registrada na trilha.');
      }
    } catch (e: any) {
      notify('error', 'Erro no Trâmite', e.message);
    }
  };

  const handleDeleteAmendment = async (id: string, justification: string) => {
    if (!currentUser) return;
    const a = amendments.find(x => x.id === id);
    try {
      await db.amendments.delete(id);
      await db.audit.log({
        tenantId: currentUser.tenantId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: AuditAction.DELETE,
        details: `EXCLUSÃO CRÍTICA: Processo ${a?.seiNumber} removido. Motivo: ${justification}`,
        severity: 'CRITICAL'
      });
      setAmendments(prev => prev.filter(x => x.id !== id));
      setSelectedAmendment(null);
      setCurrentView('amendments');
      notify('warning', 'Registro Excluído', 'O processo foi removido e a ação auditada.');
    } catch (e: any) {
      notify('error', 'Falha na Exclusão', e.message);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLogin(false);
    localStorage.setItem('gesa_current_user', JSON.stringify(user));
    notify('success', `Bem-vindo, ${user.name}`, 'Acesso autorizado ao ecossistema GESA Cloud.');
  };

  const handleLogout = async () => {
    // Limpa o estado local imediatamente para feedback instantâneo e evita bloqueios de popups
    setCurrentUser(null);
    localStorage.removeItem('gesa_current_user');
    setSelectedAmendment(null);
    setCurrentView('dashboard');
    setShowLogin(true);
    
    try {
      // Tenta deslogar do Supabase em segundo plano
      await db.auth.signOut();
      notify('info', 'Sessão Encerrada', 'Você saiu do sistema com segurança.');
    } catch (error) {
      console.error("Erro ao sincronizar logout com a nuvem:", error);
    }
  };

  /**
   * RENDERIZAÇÃO CONDICIONAL DE TELAS (ROUTING LÓGICO)
   */
  if (isInitializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0d457a] text-white gap-6">
        <div className="w-20 h-20 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin"></div>
        <p className="font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Sincronizando com GESA Cloud...</p>
      </div>
    );
  }

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView}
      activeTenantId={currentUser?.tenantId}
      isLive={isLiveSync}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      onTenantChange={() => notify('warning', 'Ação Restrita', 'Isolamento de Tenant ativo. Troca de unidade requer perfil Super Admin.')}
      onChangePassword={() => setIsPasswordModalOpen(true)}
      onLoginClick={() => setShowLogin(true)}
    >
      
      {showLogin && !currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/60 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-10"
            >
              Fechar
            </button>
            <Login onLogin={handleLogin} />
          </div>
        </div>
      )}

      {!currentUser && !showLogin && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-[#0d457a] mb-8 shadow-inner">
              <ShieldCheck size={48} />
           </div>
           <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter mb-4">Bem-vindo ao Portal GESA</h2>
           <p className="text-slate-500 max-w-md leading-relaxed mb-10 font-medium">
             Você está no ambiente de consulta pública limitada. Para gerenciar processos SEI e emendas parlamentares, acesse sua conta institucional.
           </p>
           <button 
             onClick={() => setShowLogin(true)}
             className="px-10 py-5 bg-[#0d457a] text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-[#0a365f] transition-all active:scale-95 flex items-center gap-4"
           >
             Acessar Painel Restrito <LogIn size={20} />
           </button>
        </div>
      )}

      {/* NAVEGAÇÃO ENTRE MÓDULOS */}
      {currentUser && currentView === 'dashboard' && (
        <Dashboard 
          amendments={amendments} 
          statusConfigs={statuses}
          onSelectAmendment={(id) => {
            const a = amendments.find(x => x.id === id);
            if (a) { setSelectedAmendment(a); setCurrentView('details'); }
          }}
        />
      )}

      {currentUser && currentView === 'amendments' && (
        <AmendmentList 
          amendments={amendments}
          sectors={sectors}
          statuses={statuses}
          userRole={currentUser.role}
          systemMode={SystemMode.PRODUCTION}
          onCreate={handleCreateAmendment}
          onUpdate={handleUpdateAmendment}
          onSelect={(a) => { setSelectedAmendment(a); setCurrentView('details'); }}
          onInactivate={() => {}}
        />
      )}

      {currentUser && currentView === 'details' && selectedAmendment && (
        <AmendmentDetail 
          amendment={selectedAmendment}
          currentUser={currentUser}
          sectors={sectors}
          statuses={statuses}
          systemMode={SystemMode.PRODUCTION}
          onBack={() => setCurrentView('amendments')}
          onMove={handleMoveAmendment}
          onUpdate={handleUpdateAmendment}
          onStatusChange={() => {}}
          onDelete={handleDeleteAmendment}
        />
      )}

      {currentUser && currentView === 'repository' && <RepositoryModule amendments={amendments} />}
      
      {currentUser && currentView === 'calendar' && (
        <CalendarView 
          amendments={amendments} 
          onSelectAmendment={(a) => { setSelectedAmendment(a); setCurrentView('details'); }} 
        />
      )}

      {currentUser && currentView === 'reports' && <ReportModule amendments={amendments} />}

      {currentUser && currentView === 'sectors' && (
        <SectorManagement 
          sectors={sectors} 
          statuses={statuses}
          onAdd={async (s) => {
            const res = await db.sectors.upsert({...s, tenantId: currentUser.tenantId});
            if (res) { setSectors(prev => [...prev, res]); notify('success', 'Unidade Criada', 'A nova unidade técnica foi registrada.'); }
          }}
          onUpdateSla={async (id, val) => {
            const s = sectors.find(x => x.id === id);
            if (s) {
              const res = await db.sectors.upsert({...s, defaultSlaDays: val});
              if (res) { setSectors(prev => prev.map(x => x.id === id ? res : x)); notify('success', 'SLA Atualizado', 'Novo prazo de permanência salvo.'); }
            }
          }}
          onBatchAdd={() => {}}
        />
      )}

      {currentUser && currentView === 'statuses' && (
        <StatusManagement 
          statuses={statuses}
          onAdd={async (s) => {
            const res = await db.statuses.upsert({...s, tenantId: currentUser.tenantId});
            if (res) { setStatuses(prev => [...prev, res]); notify('success', 'Estado Criado', 'Novo status adicionado ao workflow.'); }
          }}
          onBatchAdd={async (list) => {
            for (const s of list) await db.statuses.upsert({...s, tenantId: currentUser.tenantId});
            fetchData();
            notify('success', 'Base Padronizada', 'Estados padrão do Governo de Goiás carregados.');
          }}
          onReset={() => {}}
        />
      )}

      {currentUser && currentView === 'audit' && (
        <AuditModule 
          logs={logs} 
          currentUser={currentUser} 
          activeTenantId={currentUser.tenantId} 
          onRefresh={fetchData}
          error={dbErrors.audit}
        />
      )}

      {currentUser && currentView === 'security' && (
        <SecurityModule 
          users={users} 
          currentUser={currentUser}
          onAddUser={() => {}}
          onDeleteUser={async (id) => {
            await db.users.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            notify('warning', 'Acesso Revogado', 'O colaborador foi removido da base de usuários.');
          }}
          onNavigateToRegister={() => setCurrentView('register')}
          error={dbErrors.users}
        />
      )}

      {currentUser && currentView === 'register' && (
        <UserRegistration 
          onAddUser={async (u) => {
            const res = await db.users.upsert({...u, tenantId: currentUser.tenantId});
            if (res) {
              setUsers(prev => [...prev, res]);
              notify('success', 'Servidor Provisionado', 'Novo acesso criado com sucesso.');
              setCurrentView('security');
            }
          }}
          onBack={() => setCurrentView('security')}
        />
      )}

      {currentUser && currentView === 'api' && <ApiPortal currentUser={currentUser} amendments={amendments} />}
      {currentUser && currentView === 'mobile_app' && <MobileAppGuide />}
      {currentUser && currentView === 'documentation' && <SystemDocumentation />}
      {currentUser && currentView === 'governance' && <GovernanceDocs />}
      {currentUser && currentView === 'compliance_details' && <ComplianceDetails />}

      {currentUser && isPasswordModalOpen && <PasswordChangeModal currentUser={currentUser} onClose={() => setIsPasswordModalOpen(false)} />}
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
