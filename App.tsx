
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { onAuthChange, logout } from './services/firebase';
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
import { TestingPanel } from './components/TestingPanel';
import { TechnicalPanel } from './components/TechnicalPanel';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  // MODO DE DESENVOLVIMENTO: Inicia com um usuário mockado para bypassar o login.
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendmentId, setSelectedAmendmentId] = useState<string | null>(null);
  
  const systemMode = SystemMode.PRODUCTION;
  
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentUserRef = useRef<User | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const selectedAmendment = useMemo(() => 
    amendments.find(a => a.id === selectedAmendmentId) || null,
  [amendments, selectedAmendmentId]);

  const addAuditLog = useCallback((params: { 
    action: AuditAction, 
    target: string, 
    details: string, 
    severity?: AuditSeverity,
    before?: any,
    after?: any
  }) => {
    const user = currentUserRef.current;
    const newLog: AuditLog = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      actorId: user?.id || 'sys-kernel',
      actorName: user?.name || 'Sistema de Automação',
      action: params.action,
      severity: params.severity || AuditSeverity.INFO,
      targetResource: params.target,
      details: params.details,
      payloadBefore: params.before ? JSON.stringify(params.before) : undefined,
      payloadAfter: params.after ? JSON.stringify(params.after) : undefined,
      timestamp: new Date().toISOString(),
      ipAddress: '10.20.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      userAgent: navigator.userAgent
    };

    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const handleImportData = (data: Amendment[]) => {
    setAmendments(prev => [...data, ...prev]);
    addAuditLog({
        action: AuditAction.CREATE,
        severity: AuditSeverity.MEDIUM,
        target: 'Importação em Lote',
        details: `Importação em massa de ${data.length} registros realizada com sucesso.`
    });
    setCurrentView('amendments');
    setSuccessMessage(`${data.length} registros importados com sucesso! A base de dados foi atualizada.`);
    setTimeout(() => {
        setSuccessMessage(null);
    }, 5000);
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addAuditLog({
        action: AuditAction.ERROR,
        severity: AuditSeverity.CRITICAL,
        target: 'Interface GESA',
        details: `Erro em Tempo de Execução: ${event.message} @ ${event.filename}:${event.lineno}`
      });
    };
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      addAuditLog({
        action: AuditAction.ERROR,
        severity: AuditSeverity.CRITICAL,
        target: 'Operação Assíncrona',
        details: `Promise não tratada: ${event.reason}`
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [addAuditLog]);

  // MODO DE DESENVOLVIMENTO: A autenticação do Firebase foi desativada
  // para permitir o login com um usuário mockado.
  // Para reativar, comente o useEffect abaixo e descomente o próximo.
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  /*
  // MODO DE PRODUÇÃO: Descomente este bloco para reativar a autenticação real do Firebase.
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        const hasAccepted = localStorage.getItem(`lgpd_${user.uid}`) === 'true';
        let role = Role.OPERATOR;
        if (user.email?.includes('admin')) role = Role.ADMIN;
        if (user.email?.includes('auditor')) role = Role.AUDITOR;

        const userData: User = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0],
          email: user.email,
          role: role,
          mfaEnabled: role !== Role.OPERATOR,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=${role === Role.AUDITOR ? '334155' : '0d457a'}&color=fff`,
          lgpdAccepted: hasAccepted
        };
        
        setCurrentUser(userData);
        setUsers(prevUsers => {
            const userExists = prevUsers.some(u => u.id === userData.id);
            if (userExists) {
                return prevUsers.map(u => u.id === userData.id ? userData : u);
            }
            return [...prevUsers, userData];
        });

        if (!auditLogs.some(log => log.action === AuditAction.LOGIN && log.actorId === user.uid)) {
          addAuditLog({
            action: AuditAction.LOGIN,
            severity: AuditSeverity.INFO,
            target: 'Autenticação',
            details: `Acesso autenticado com perfil ${role}.`
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [addAuditLog]);
  */

  const handleMoveAmendment = useCallback((movements: AmendmentMovement[]) => {
    if (currentUserRef.current?.role === Role.AUDITOR) {
      alert("Acesso Negado: Auditores possuem perfil de apenas leitura.");
      return;
    }

    setAmendments(prev => prev.map(a => {
      if (a.id === movements[0].amendmentId) {
        const targetSectors = movements.map(m => m.toSector).join(' | ');
        const updated = { 
          ...a, 
          currentSector: targetSectors, 
          movements: [...a.movements, ...movements],
          status: Status.IN_PROGRESS
        };
        addAuditLog({
          action: AuditAction.MOVE,
          severity: AuditSeverity.LOW,
          target: a.seiNumber,
          details: `Tramitação múltipla realizada para: ${targetSectors}`,
          before: a,
          after: updated
        });
        return updated;
      }
      return a;
    }));
  }, [addAuditLog]);

  const handleCreateAmendment = useCallback((newAmendment: Amendment) => {
    if (currentUserRef.current?.role === Role.AUDITOR) return;
    setAmendments(prev => [newAmendment, ...prev]);
    addAuditLog({
      action: AuditAction.CREATE,
      severity: AuditSeverity.MEDIUM,
      target: newAmendment.seiNumber,
      details: 'Novo cadastro de processo SEI realizado.',
      after: newAmendment
    });
  }, [addAuditLog]);

  const handleUpdateAmendment = useCallback((updatedAmendment: Amendment) => {
    if (currentUserRef.current?.role === Role.AUDITOR) return;
    
    const before = amendments.find(a => a.id === updatedAmendment.id);
    setAmendments(prev => prev.map(a => a.id === updatedAmendment.id ? updatedAmendment : a));
    
    addAuditLog({
      action: AuditAction.UPDATE,
      severity: AuditSeverity.MEDIUM,
      target: updatedAmendment.seiNumber,
      details: 'Registro de processo SEI foi atualizado.',
      before: before,
      after: updatedAmendment
    });
    setSuccessMessage('Processo atualizado com sucesso!');
    setTimeout(() => setSuccessMessage(null), 5000);
  }, [amendments, addAuditLog]);

  const handleInactivateAmendment = useCallback((id: string) => {
    if (currentUserRef.current?.role !== Role.ADMIN && currentUserRef.current?.role !== Role.OPERATOR) {
      alert("Permissão insuficiente para arquivar registros.");
      return;
    }
    
    const before = amendments.find(a => a.id === id);
    if (!before) return;
    
    const after = { 
      ...before, 
      status: Status.ARCHIVED,
      object: `[ARQUIVADO] ${before.object}`,
      currentSector: 'Arquivo Morto'
    };
    setAmendments(prev => prev.map(a => a.id === id ? after : a));
    
    addAuditLog({ 
        action: AuditAction.DELETE, 
        severity: AuditSeverity.HIGH,
        target: before.seiNumber, 
        details: 'Registro de processo foi permanentemente arquivado. A ação é irreversível para fins de auditoria.',
        before: before,
        after: after
    });
    setSuccessMessage('Processo arquivado com sucesso!');
    setTimeout(() => setSuccessMessage(null), 5000);
  }, [amendments, addAuditLog]);
  
  const handleStatusChange = useCallback((id: string, status: Status) => {
      const before = amendments.find(a => id === a.id);
      if (!before) return;
      
      const after = { ...before, status };
      setAmendments(prev => prev.map(a => a.id === id ? after : a));
      
      addAuditLog({ 
        action: AuditAction.UPDATE, 
        severity: AuditSeverity.MEDIUM,
        target: id, 
        details: `Status do processo alterado para ${status}`,
        before,
        after
      });
  }, [amendments, addAuditLog]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0d457a] flex flex-col items-center justify-center p-6 text-white">
        <div className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-black uppercase tracking-[0.3em]">GESA / SUBIPEI - GOIÁS</h2>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  if (currentUser && !currentUser.lgpdAccepted) {
    return <LGPDModal userName={currentUser.name || ''} onAccept={() => {
      localStorage.setItem(`lgpd_${currentUser.id}`, 'true');
      setCurrentUser(prev => prev ? { ...prev, lgpdAccepted: true } : null);
      addAuditLog({ 
        action: AuditAction.LGPD_CONSENT, 
        severity: AuditSeverity.INFO,
        target: 'LGPD Compliance', 
        details: 'Consentimento de tratamento de dados aceito no primeiro acesso.' 
      });
    }} />;
  }

  const renderCurrentView = () => {
    if (selectedAmendment) {
      return (
        <AmendmentDetail 
          amendment={selectedAmendment}
          currentUser={currentUser}
          sectors={sectors}
          systemMode={systemMode}
          onBack={() => setSelectedAmendmentId(null)}
          onMove={handleMoveAmendment}
          onStatusChange={handleStatusChange}
          onDelete={handleInactivateAmendment}
        />
      );
    }

    switch(currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            amendments={amendments} 
            systemMode={systemMode} 
            onSelectAmendment={(id) => setSelectedAmendmentId(id)} 
          />
        );
      case 'amendments':
        return (
          <AmendmentList 
            amendments={amendments} 
            sectors={sectors} 
            userRole={currentUser.role} 
            systemMode={systemMode} 
            onSelect={a => setSelectedAmendmentId(a.id)} 
            onCreate={handleCreateAmendment} 
            onUpdate={handleUpdateAmendment} 
            onInactivate={handleInactivateAmendment} 
          />
        );
      case 'audit':
        return <AuditModule logs={auditLogs} />;
      case 'security':
        return (
          <SecurityModule 
            users={users} 
            currentUser={currentUser} 
            onAddUser={(user) => setUsers(prev => [...prev, user])} 
            onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} 
          />
        );
      case 'import':
        return <ImportModule onImport={handleImportData} sectors={sectors} />;
      case 'repository':
        return <RepositoryModule amendments={amendments} />;
      case 'reports':
        return <ReportModule amendments={amendments} />;
      case 'sectors':
        return <SectorManagement sectors={sectors} onAdd={(s) => setSectors(prev => [...prev, s])} />;
      case 'deadlines':
        return <DeadlinePanel amendments={amendments} onSelect={a => setSelectedAmendmentId(a.id)} />;
      case 'database':
        return <TechnicalPanel />;
      case 'testing':
        return <TestingPanel />;
      default:
        return (
          <Dashboard 
            amendments={amendments} 
            systemMode={systemMode} 
            onSelectAmendment={(id) => setSelectedAmendmentId(id)} 
          />
        );
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
      onLogout={() => {
        addAuditLog({ action: AuditAction.LOGIN, severity: AuditSeverity.INFO, details: 'Logout realizado pelo servidor.', target: 'Sessão' });
        // Em modo de teste, simplesmente recarregamos a página para simular logout
        window.location.reload();
      }}
    >
      {renderCurrentView()}
    </Layout>
  );
};

export default App;
