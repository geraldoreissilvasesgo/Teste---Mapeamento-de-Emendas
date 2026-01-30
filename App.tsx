
import React, { useState, useEffect, useCallback } from 'react';
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
import { ApiPortal } from './components/ApiPortal';
import { TechnicalPanel } from './components/TechnicalPanel';
import { GovernanceDocs } from './components/GovernanceDocs';
import { User, Amendment, Role, Status, AuditLog, AuditAction, SectorConfig, AmendmentMovement, SystemMode, AuditSeverity } from './types';
import { MOCK_USERS, MOCK_AMENDMENTS, MOCK_AUDIT_LOGS, DEFAULT_SECTOR_CONFIGS } from './constants';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  // --- ESTADO GLOBAL DA APLICAÇÃO ---
  const [amendments, setAmendments] = useState<Amendment[]>(MOCK_AMENDMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [sectors, setSectors] = useState<SectorConfig[]>(DEFAULT_SECTOR_CONFIGS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendmentId, setSelectedAmendmentId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiService.setSession(currentUser);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [currentUser]);

  // --- HANDLERS DE NEGÓCIO ---

  const handleMoveAmendment = useCallback((movements: AmendmentMovement[]) => {
    if (!currentUser) return;
    const targetId = movements[0].amendmentId;
    
    setAmendments(prev => prev.map(a => {
      if (a.id !== targetId) return a;
      const history = [...a.movements];
      if (history.length > 0) history[history.length - 1].dateOut = new Date().toISOString();
      return {
        ...a,
        movements: [...history, ...movements],
        currentSector: movements.map(m => m.toSector).join(' | '),
        status: Status.IN_PROGRESS
      };
    }));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: AuditAction.MOVE,
      severity: AuditSeverity.MEDIUM,
      targetResource: targetId,
      details: `Processo tramitado para ${movements.map(m => m.toSector).join(', ')}`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setSuccessMessage("Movimentação realizada com sucesso.");
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [currentUser]);

  const handleImport = (newData: Amendment[]) => {
    setAmendments(prev => [...prev, ...newData]);
    setSuccessMessage(`${newData.length} processos importados com sucesso.`);
    setCurrentView('amendments');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
    setSuccessMessage(`Usuário ${user.name} cadastrado.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setSuccessMessage("Usuário removido.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddSector = (sector: SectorConfig) => {
    setSectors(prev => [...prev, sector]);
    setSuccessMessage(`Setor ${sector.name} registrado.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateSla = (id: string, newSla: number) => {
    setSectors(prev => prev.map(s => s.id === id ? { ...s, defaultSlaDays: newSla } : s));
    setSuccessMessage("SLA atualizado com sucesso.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-slate-50"><div className="w-12 h-12 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <Login />;
  if (!currentUser.lgpdAccepted) return <LGPDModal userName={currentUser.name} onAccept={() => setCurrentUser({...currentUser, lgpdAccepted: true})} />;

  const selectedAmendment = amendments.find(a => a.id === selectedAmendmentId) || null;

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView}
      notifications={[]}
      systemMode={SystemMode.PRODUCTION}
      successMessage={successMessage}
      onNavigate={(view) => { setCurrentView(view); setSelectedAmendmentId(null); }}
      onLogout={() => setCurrentUser(null)}
    >
      {selectedAmendment ? (
        <AmendmentDetail 
          amendment={selectedAmendment} 
          currentUser={currentUser} 
          sectors={sectors} 
          systemMode={SystemMode.PRODUCTION} 
          onBack={() => setSelectedAmendmentId(null)} 
          onMove={handleMoveAmendment} 
          onStatusChange={() => {}} 
          onDelete={() => {}} 
        />
      ) : (
        <>
          {/* Vistas Estratégicas */}
          {currentView === 'dashboard' && <Dashboard amendments={amendments} systemMode={SystemMode.PRODUCTION} onSelectAmendment={setSelectedAmendmentId} />}
          
          {/* Vistas Operacionais */}
          {currentView === 'amendments' && <AmendmentList amendments={amendments} sectors={sectors} userRole={currentUser.role} systemMode={SystemMode.PRODUCTION} onSelect={(a) => setSelectedAmendmentId(a.id)} onCreate={(a) => setAmendments(p => [a, ...p])} onUpdate={(a) => setAmendments(p => p.map(x => x.id === a.id ? a : x))} onInactivate={() => {}} />}
          {currentView === 'deadlines' && <DeadlinePanel amendments={amendments} onSelect={(a) => setSelectedAmendmentId(a.id)} />}
          
          {/* Vistas de Inteligência */}
          {currentView === 'reports' && <ReportModule amendments={amendments} />}
          {currentView === 'repository' && <RepositoryModule amendments={amendments} />}
          
          {/* Vistas de Sistema & Config */}
          {currentView === 'import' && <ImportModule onImport={handleImport} sectors={sectors} />}
          {currentView === 'sectors' && <SectorManagement sectors={sectors} onAdd={handleAddSector} onReset={() => setSectors(DEFAULT_SECTOR_CONFIGS)} onUpdateSla={handleUpdateSla} />}
          {currentView === 'security' && <SecurityModule users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} currentUser={currentUser} />}
          
          {/* Vistas de Governança */}
          {currentView === 'audit' && <AuditModule logs={auditLogs} />}
          {currentView === 'database' && <TechnicalPanel />}
          {currentView === 'govdocs' && <GovernanceDocs />}
          {currentView === 'api' && <ApiPortal />}
        </>
      )}
    </Layout>
  );
};

export default App;
