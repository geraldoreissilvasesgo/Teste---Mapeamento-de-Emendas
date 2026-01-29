
/**
 * COMPONENTE RAIZ DA APLICAÇÃO (App.tsx)
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AmendmentList } from './components/AmendmentList';
import { AmendmentDetail } from './components/AmendmentDetail';
import { Login } from './components/Login';
import { SecurityModule } from './components/SecurityModule';
import { AuditModule } from './components/AuditModule';
import { ImportModule } from './components/ImportModule';
import { RepositoryModule } from './components/RepositoryModule';
import { ReportModule } from './components/ReportModule';
import { SectorManagement } from './components/SectorManagement';
import { DeadlinePanel } from './components/DeadlinePanel';
import { LGPDModal } from './components/LGPDModal';
import { User, Amendment, Role, Status, AuditLog, AuditAction, SectorConfig, AmendmentMovement, SystemMode, AuditSeverity } from './types';
import { TechnicalPanel } from './components/TechnicalPanel';
import { MOCK_USERS, MOCK_AMENDMENTS, MOCK_AUDIT_LOGS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendmentId, setSelectedAmendmentId] = useState<string | null>(null);
  
  const systemMode = SystemMode.PRODUCTION;
  const [amendments, setAmendments] = useState<Amendment[]>(MOCK_AMENDMENTS);
  // SETORES RESETADOS PARA VAZIO CONFORME SOLICITAÇÃO
  const [sectors, setSectors] = useState<SectorConfig[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const successTimerRef = useRef<number | null>(null);

  const currentUserRef = useRef<User | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const selectedAmendment = useMemo(() => 
    amendments.find(a => a.id === selectedAmendmentId) || null,
  [amendments, selectedAmendmentId]);

  const showSuccessMessage = (message: string) => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSuccessMessage(message);
    successTimerRef.current = window.setTimeout(() => setSuccessMessage(null), 3000);
  };

  const addAuditLog = useCallback((params: Omit<AuditLog, 'id' | 'actorId' | 'actorName' | 'timestamp' | 'ipAddress' | 'userAgent'>) => {
    const actor = currentUserRef.current;
    if (!actor) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent,
      ...params,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const handleMoveAmendment = useCallback((movements: AmendmentMovement[]) => {
      setAmendments(prev => prev.map(a => {
          if (a.id === movements[0].amendmentId) {
              const newMovements = [...a.movements];
              const lastMovement = newMovements[newMovements.length - 1];
              if(lastMovement) lastMovement.dateOut = new Date().toISOString();
              const updatedMovements = [...newMovements, ...movements];
              const newCurrentSectors = movements.map(m => m.toSector).join(' | ');
              return { ...a, movements: updatedMovements, currentSector: newCurrentSectors };
          }
          return a;
      }));
      addAuditLog({ action: AuditAction.MOVE, severity: AuditSeverity.MEDIUM, targetResource: movements[0].amendmentId, details: `Movido para ${movements.map(m => m.toSector).join(', ')}.` });
      showSuccessMessage("Processo tramitado com sucesso.");
  }, [addAuditLog]);

  const handleCreateAmendment = useCallback((newAmendment: Amendment) => {
      const fullAmendment = { ...newAmendment, movements: newAmendment.movements.map(m => ({ ...m, amendmentId: newAmendment.id })) };
      setAmendments(prev => [fullAmendment, ...prev]);
      addAuditLog({ action: AuditAction.CREATE, severity: AuditSeverity.MEDIUM, targetResource: newAmendment.seiNumber, details: "Novo processo cadastrado." });
      showSuccessMessage(`Processo ${newAmendment.seiNumber} criado com sucesso.`);
  }, [addAuditLog]);
  
  const handleUpdateAmendment = useCallback((updatedAmendment: Amendment) => {
      setAmendments(prev => prev.map(a => a.id === updatedAmendment.id ? updatedAmendment : a));
      addAuditLog({ action: AuditAction.UPDATE, severity: AuditSeverity.MEDIUM, targetResource: updatedAmendment.seiNumber, details: "Dados do processo atualizados." });
      showSuccessMessage(`Processo ${updatedAmendment.seiNumber} atualizado.`);
  }, [addAuditLog]);

  const handleInactivateAmendment = useCallback((id: string) => {
      let seiNumber = '';
      setAmendments(prev => prev.map(a => {
          if (a.id === id) {
              seiNumber = a.seiNumber;
              return { ...a, status: Status.ARCHIVED };
          }
          return a;
      }));
      addAuditLog({ action: AuditAction.DELETE, severity: AuditSeverity.HIGH, targetResource: seiNumber, details: "Processo arquivado." });
      showSuccessMessage(`Processo ${seiNumber} arquivado com sucesso.`);
  }, [addAuditLog]);
  
  const handleStatusChange = useCallback((id: string, status: Status) => {
      setAmendments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }, []);

  const handleAddUser = useCallback((user: User) => {
      setUsers(prev => [...prev, user]);
      addAuditLog({ action: AuditAction.SECURITY, severity: AuditSeverity.HIGH, targetResource: user.email, details: "Novo usuário criado." });
  }, [addAuditLog]);
  
  const handleDeleteUser = useCallback((id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
      addAuditLog({ action: AuditAction.SECURITY, severity: AuditSeverity.HIGH, targetResource: id, details: "Usuário removido." });
  }, [addAuditLog]);
  
  const handleAddSector = useCallback((sector: SectorConfig) => {
      setSectors(prev => [...prev, sector]);
      addAuditLog({ action: AuditAction.CREATE, severity: AuditSeverity.MEDIUM, targetResource: sector.name, details: "Novo setor cadastrado no fluxo permanente." });
      showSuccessMessage(`Setor ${sector.name} registrado permanentemente.`);
  }, [addAuditLog]);

  const handleUpdateSectorSla = useCallback((id: string, newSla: number) => {
      setSectors(prev => prev.map(s => s.id === id ? { ...s, defaultSlaDays: newSla } : s));
      addAuditLog({ action: AuditAction.UPDATE, severity: AuditSeverity.LOW, targetResource: id, details: `Atualização de SLA para ${newSla} dias.` });
      showSuccessMessage("SLA atualizado com sucesso.");
  }, [addAuditLog]);

  const handleResetSectors = useCallback(() => {
      setSectors([]);
      addAuditLog({ action: AuditAction.DELETE, severity: AuditSeverity.CRITICAL, targetResource: 'Configuração de Fluxo', details: "Reset total da lista de setores." });
      showSuccessMessage("Lista de setores resetada com sucesso.");
  }, [addAuditLog]);

  const handleLgpdAccept = () => {
    if(currentUser) {
        const updatedUser = {...currentUser, lgpdAccepted: true};
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        addAuditLog({ action: AuditAction.LGPD_CONSENT, severity: AuditSeverity.INFO, targetResource: currentUser.email, details: "Termo de privacidade aceito."});
    }
  };

  const handleLogout = () => {
    if(currentUser) {
        addAuditLog({ action: AuditAction.LOGIN, severity: AuditSeverity.INFO, targetResource: currentUser.email, details: "Logout realizado." });
    }
    setCurrentUser(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#0d457a]"></div>
            <p className="mt-4 text-slate-500 font-bold">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  if (currentUser && !currentUser.lgpdAccepted) {
    return <LGPDModal userName={currentUser.name} onAccept={handleLgpdAccept} />;
  }

  const renderCurrentView = () => {
    if (selectedAmendment) {
      return ( <AmendmentDetail amendment={selectedAmendment} currentUser={currentUser} sectors={sectors} systemMode={systemMode} onBack={() => setSelectedAmendmentId(null)} onMove={handleMoveAmendment} onStatusChange={handleStatusChange} onDelete={handleInactivateAmendment} /> );
    }

    switch(currentView) {
      case 'dashboard': return <Dashboard amendments={amendments} systemMode={systemMode} onSelectAmendment={(id) => setSelectedAmendmentId(id)} />;
      case 'amendments': return <AmendmentList amendments={amendments} sectors={sectors} userRole={currentUser.role} systemMode={systemMode} onSelect={(a) => setSelectedAmendmentId(a.id)} onCreate={handleCreateAmendment} onUpdate={handleUpdateAmendment} onInactivate={handleInactivateAmendment} />;
      case 'deadlines': return <DeadlinePanel amendments={amendments} onSelect={(a) => setSelectedAmendmentId(a.id)} />;
      case 'repository': return <RepositoryModule amendments={amendments} />;
      case 'reports': return <ReportModule amendments={amendments} />;
      case 'import': return <ImportModule onImport={(data) => {setAmendments(prev => [...prev, ...data]); showSuccessMessage("Dados importados.");}} sectors={sectors} />;
      case 'sectors': return <SectorManagement sectors={sectors} onAdd={handleAddSector} onReset={handleResetSectors} onUpdateSla={handleUpdateSectorSla} />;
      case 'security': return <SecurityModule users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} currentUser={currentUser} />;
      case 'audit': return <AuditModule logs={auditLogs} />;
      case 'database': return <TechnicalPanel />;
      default: return <Dashboard amendments={amendments} systemMode={systemMode} onSelectAmendment={(id) => setSelectedAmendmentId(id)} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView}
      notifications={[]}
      systemMode={systemMode}
      successMessage={successMessage}
      onNavigate={(view) => {
        setSelectedAmendmentId(null);
        setCurrentView(view);
      }}
      onLogout={handleLogout}
    >
      {renderCurrentView()}
    </Layout>
  );
};

export default App;
