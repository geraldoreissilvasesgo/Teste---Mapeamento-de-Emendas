
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
import { MOCK_AMENDMENTS, MOCK_USERS, MOCK_AUDIT_LOGS, DEFAULT_SECTOR_CONFIGS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendmentId, setSelectedAmendmentId] = useState<string | null>(null);
  
  // Sistema agora fixo em modo Produção
  const systemMode = SystemMode.PRODUCTION;
  
  const [amendments, setAmendments] = useState<Amendment[]>(MOCK_AMENDMENTS);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
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
    setCurrentView('amendments'); // Navega para a lista de processos
    setSuccessMessage(`${data.length} registros importados com sucesso! A base de dados foi atualizada.`);
    setTimeout(() => {
        setSuccessMessage(null);
    }, 5000); // Limpa a mensagem após 5 segundos
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
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [addAuditLog]);

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
        addAuditLog({
          action: AuditAction.LOGIN,
          severity: AuditSeverity.INFO,
          target: 'Autenticação',
          details: `Acesso autenticado com perfil ${role}.`
        });
      } else {
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [addAuditLog]);

  const handleMoveAmendment = useCallback((movements: AmendmentMovement[]) => {
    if (currentUserRef.current?.role === Role.AUDITOR) {
      alert("Acesso Negado: Auditores possuem perfil de apenas leitura.");
      return;
    }

    setAmendments(prev => prev.map(a => {
      if (a.id === movements[0].amendmentId) {
        // Para tramitação múltipla, o setor atual é a lista de todos os destinos da remessa
        const targetSectors = movements.map(m => m.toSector).join(' | ');
        const updated = { 
          ...a, 
          currentSector: targetSectors, 
          movements: [...a.movements, ...movements],
          status: Status.PROCESSING // Atualiza para tramitação ao mover
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
      alert("Permissão insuficiente para inativar registros.");
      return;
    }
    
    const before = amendments.find(a => a.id === id);
    if (!before) return;
    
    const after = { 
      ...before, 
      status: Status.INACTIVE,
      object: `[ARQUIVADO] ${before.object}`, // Adiciona uma marcação visual permanente
      currentSector: 'Arquivo Morto' // Move para um setor final não operacional
    };
    setAmendments(prev => prev.map(a => a.id === id ? after : a));
    
    addAuditLog({ 
        action: AuditAction.DELETE, 
        severity: AuditSeverity.HIGH,
        target: before.seiNumber, 
        details: 'Registro de processo foi permanentemente arquivado (Status: INACTIVE). A ação é irreversível para fins de auditoria.',
        before: before,
        after: after
    });
    setSuccessMessage('Processo arquivado com sucesso!');
    setTimeout(() => setSuccessMessage(null), 5000);
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
    return <Login onLogin={() => {}} />;
  }

  if (currentUser && !currentUser.lgpdAccepted) {
    return <LGPDModal userName={currentUser.name} onAccept={() => {
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

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView}
      notifications={[]}
      systemMode={systemMode}
      successMessage={successMessage}
      onNavigate={setCurrentView}
      onLogout={() => {
        addAuditLog({ action: AuditAction.LOGIN, severity: AuditSeverity.INFO, details: 'Logout realizado pelo servidor.', target: 'Sessão' });
        logout();
        setCurrentUser(null);
      }}
    >
      {selectedAmendment ? (
        <AmendmentDetail 
          amendment={selectedAmendment}
          currentUser={currentUser}
          sectors={sectors}
          systemMode={systemMode}
          onBack={() => setSelectedAmendmentId(null)}
          onMove={handleMoveAmendment}
          onStatusChange={(id, status) => {
            const before = amendments.find(a => id === a.id);
            setAmendments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            addAuditLog({ 
              action: AuditAction.UPDATE, 
              severity: AuditSeverity.MEDIUM,
              target: id, 
              details: `Status alterado para ${status}`,
              before,
              after: { ...before, status }
            });
          }}
          onDelete={handleInactivateAmendment}
        />
      ) : (
        <>
          {currentView === 'dashboard' && <Dashboard amendments={amendments} systemMode={systemMode} />}
          {currentView === 'amendments' && (
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
          )}
          {currentView === 'audit' && <AuditModule logs={auditLogs} />}
          {currentView === 'security' && (
            <SecurityModule 
              users={users} 
              currentUser={currentUser} 
              onAddUser={(u) => {
                setUsers(prev => [...prev, u]);
                addAuditLog({ action: AuditAction.SECURITY, severity: AuditSeverity.HIGH, target: u.email, details: `Novo usuário criado com perfil ${u.role}` });
              }} 
              onDeleteUser={(id) => {
                const u = users.find(usr => usr.id === id);
                setUsers(prev => prev.filter(usr => usr.id !== id));
                addAuditLog({ action: AuditAction.SECURITY, severity: AuditSeverity.HIGH, target: id, details: `Usuário ${u?.email} removido do sistema.` });
              }} 
            />
          )}
          {currentView === 'repository' && <RepositoryModule amendments={amendments} />}
          {currentView === 'reports' && <ReportModule amendments={amendments} />}
          {currentView === 'sectors' && <SectorManagement sectors={sectors} onAdd={s => setSectors(prev => [...prev, s])} />}
          {currentView === 'deadlines' && <DeadlinePanel amendments={amendments} onSelect={a => setSelectedAmendmentId(a.id)} />}
          {currentView === 'import' && <ImportModule onImport={handleImportData} sectors={sectors} />}
        </>
      )}
    </Layout>
  );
};

export default App;
