
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { User, Amendment, Role, Status, AuditLog, AuditAction, SectorConfig, AmendmentMovement, Sector, Notification, AnalysisType } from './types';
import { MOCK_AMENDMENTS, MOCK_USERS, MOCK_AUDIT_LOGS, DEFAULT_SECTOR_CONFIGS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendmentId, setSelectedAmendmentId] = useState<string | null>(null);
  
  const [amendments, setAmendments] = useState<Amendment[]>(MOCK_AMENDMENTS);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // Memoize selected amendment for performance
  const selectedAmendment = useMemo(() => 
    amendments.find(a => a.id === selectedAmendmentId) || null,
  [amendments, selectedAmendmentId]);

  // SLA Overdue Detector - Memoized calculation
  const notifications = useMemo(() => {
    const today = new Date();
    return amendments
      .filter(a => {
        if (a.status === Status.CONCLUDED || a.status === Status.PAID || a.status === Status.INACTIVE) return false;
        const lastMove = a.movements[a.movements.length - 1];
        return lastMove && new Date(lastMove.deadline) < today;
      })
      .map(a => ({
        id: `notif-${a.id}`,
        title: 'Prazo SLA Expirado',
        message: `O processo ${a.seiNumber} está atrasado no setor ${a.currentSector}.`,
        seiNumber: a.seiNumber,
        type: 'critical' as const,
        timestamp: new Date().toISOString()
      }));
  }, [amendments]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        const isAdmin = user.email?.includes('admin');
        setCurrentUser({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0],
          email: user.email,
          role: isAdmin ? Role.ADMIN : Role.OPERATOR,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=0d457a&color=fff`
        });
      } else {
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const addAuditLog = useCallback((action: AuditAction, target: string, details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      actorId: currentUser?.id || 'system',
      actorName: currentUser?.name || 'Sistema',
      action,
      targetResource: target,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '10.20.30.' + Math.floor(Math.random() * 255)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  const handleMoveAmendment = useCallback((movement: AmendmentMovement) => {
    setAmendments(prev => prev.map(a => {
      if (a.id === movement.amendmentId) {
        const movements = [...a.movements];
        if (movements.length > 0) {
          const last = movements[movements.length - 1];
          last.dateOut = movement.dateIn;
          const diff = Math.ceil((new Date(movement.dateIn).getTime() - new Date(last.dateIn).getTime()) / (1000 * 60 * 60 * 24));
          last.daysSpent = diff > 0 ? diff : 0;
        }
        return { ...a, currentSector: movement.toSector, movements: [...movements, movement] };
      }
      return a;
    }));
    addAuditLog(AuditAction.MOVE, `Processo SEI ${selectedAmendment?.seiNumber}`, `Tramitado para ${movement.toSector}.`);
  }, [selectedAmendment, addAuditLog]);

  const handleCreateAmendment = useCallback((newAmendment: Amendment) => {
    const protocolSla = sectors.find(s => s.name === Sector.PROTOCOL)?.defaultSlaDays || 2;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + protocolSla);
    newAmendment.movements[0].deadline = deadline.toISOString();
    
    setAmendments(prev => [newAmendment, ...prev]);
    addAuditLog(AuditAction.CREATE, `Processo ${newAmendment.seiNumber}`, `Nova emenda cadastrada no protocolo.`);
  }, [sectors, addAuditLog]);

  const handleUpdateAmendment = useCallback((updated: Amendment) => {
    setAmendments(prev => prev.map(a => a.id === updated.id ? updated : a));
    addAuditLog(AuditAction.UPDATE, `Processo ${updated.seiNumber}`, `Alteração de dados cadastrais.`);
  }, [addAuditLog]);

  const handleInactivateAmendment = useCallback((id: string) => {
    const reason = window.prompt("JUSTIFICATIVA OBRIGATÓRIA:\nPor que este registro de emenda está sendo inativado?");
    
    if (reason === null) return;
    if (reason.trim().length < 10) {
      alert("Erro: Justificativa muito curta. Descreva o motivo detalhadamente para fins de auditoria.");
      return;
    }

    setAmendments(prev => prev.map(a => {
      if (a.id === id) {
        const inactivationMovement: AmendmentMovement = {
          id: Math.random().toString(36).substr(2, 9),
          amendmentId: a.id,
          fromSector: a.currentSector,
          toSector: Sector.ARCHIVE,
          dateIn: new Date().toISOString(),
          dateOut: null,
          deadline: new Date().toISOString(),
          daysSpent: 0,
          handledBy: currentUser?.name || 'Sistema',
          analysisType: AnalysisType.INACTIVATION,
          justification: reason
        };

        addAuditLog(AuditAction.INACTIVATE, `Processo ${a.seiNumber}`, `Inativação efetuada. Motivo: ${reason}`);
        
        return { 
          ...a, 
          status: Status.INACTIVE, 
          currentSector: Sector.ARCHIVE,
          inactivatedAt: new Date().toISOString(),
          inactivationReason: reason,
          movements: [...a.movements, inactivationMovement]
        };
      }
      return a;
    }));
  }, [currentUser, addAuditLog]);

  const activeAmendments = useMemo(() => 
    amendments.filter(a => a.status !== Status.INACTIVE), 
  [amendments]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0d457a] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="h-16 w-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-widest">Iniciando GESA-SES</h2>
        <p className="text-white/50 text-xs mt-2 uppercase font-medium">Carregando módulos de segurança e dados...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={() => {}} />;
  }

  const renderView = () => {
    if (selectedAmendment) {
      return (
        <AmendmentDetail 
          amendment={selectedAmendment}
          currentUser={currentUser}
          sectors={sectors}
          onBack={() => setSelectedAmendmentId(null)}
          onMove={handleMoveAmendment}
          onStatusChange={(id, status) => {
            setAmendments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            addAuditLog(AuditAction.APPROVE, `ID ${id}`, `Status alterado para ${status}`);
          }}
          onDelete={handleInactivateAmendment}
        />
      );
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard amendments={activeAmendments} />;
      case 'amendments': return (
        <AmendmentList 
          amendments={amendments} 
          userRole={currentUser.role}
          onSelect={(a) => setSelectedAmendmentId(a.id)}
          onCreate={handleCreateAmendment}
          onUpdate={handleUpdateAmendment}
          onDelete={handleInactivateAmendment}
        />
      );
      case 'deadlines': return <DeadlinePanel amendments={activeAmendments} onSelect={(a) => setSelectedAmendmentId(a.id)} />;
      case 'sectors': return (
        <SectorManagement 
          sectors={sectors} 
          onAdd={(s) => { setSectors(prev => [...prev, s]); addAuditLog(AuditAction.SECURITY, s.name, 'Novo setor configurado no workflow'); }}
          onDelete={(id) => setSectors(prev => prev.filter(s => s.id !== id))}
        />
      );
      case 'repository': return <RepositoryModule amendments={amendments} />;
      case 'reports': return <ReportModule amendments={amendments} />;
      case 'import': return <ImportModule onImport={(data) => { setAmendments(prev => [...data, ...prev]); addAuditLog(AuditAction.CREATE, 'Importação em Massa', `${data.length} registros importados.`); }} />;
      case 'security': return <SecurityModule users={users} onAddUser={(u) => setUsers(prev => [...prev, u])} onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} />;
      case 'audit': return <AuditModule logs={auditLogs} />;
      default: return <Dashboard amendments={activeAmendments} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView}
      notifications={notifications}
      onNavigate={setCurrentView}
      onLogout={() => { logout(); setCurrentUser(null); }}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
