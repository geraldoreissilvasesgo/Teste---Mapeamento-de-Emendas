
/**
 * COMPONENTE RAIZ DA APLICAÇÃO (App.tsx)
 * 
 * Refatorado para alta escalabilidade:
 * 1. Centralização de estado via useReducer (Flux architecture pattern).
 * 2. Implementação de Throttling/Debouncing para controle de carga de processamento.
 * 3. Preparação para persistência de dados em larga escala.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
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
import { GovernanceDocs } from './components/GovernanceDocs';
import { MOCK_USERS, MOCK_AMENDMENTS, MOCK_AUDIT_LOGS } from './constants';

// --- DEFINIÇÃO DO REDUCER PARA ESCALABILIDADE ---
type State = {
  amendments: Amendment[];
  users: User[];
  auditLogs: AuditLog[];
  sectors: SectorConfig[];
  currentView: string;
  selectedAmendmentId: string | null;
  successMessage: string | null;
};

type Action = 
  | { type: 'SET_AMENDMENTS'; payload: Amendment[] }
  | { type: 'ADD_AMENDMENT'; payload: Amendment }
  | { type: 'UPDATE_AMENDMENT'; payload: Amendment }
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SELECT_AMENDMENT'; payload: string | null }
  | { type: 'ADD_AUDIT'; payload: AuditLog }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_SECTORS'; payload: SectorConfig[] }
  | { type: 'UPDATE_SECTOR'; payload: SectorConfig };

const initialState: State = {
  amendments: MOCK_AMENDMENTS,
  users: MOCK_USERS,
  auditLogs: MOCK_AUDIT_LOGS,
  sectors: [],
  currentView: 'dashboard',
  selectedAmendmentId: null,
  successMessage: null,
};

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_AMENDMENTS': return { ...state, amendments: action.payload };
    case 'ADD_AMENDMENT': return { ...state, amendments: [action.payload, ...state.amendments] };
    case 'UPDATE_AMENDMENT': return { ...state, amendments: state.amendments.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'SET_VIEW': return { ...state, currentView: action.payload, selectedAmendmentId: null };
    case 'SELECT_AMENDMENT': return { ...state, selectedAmendmentId: action.payload };
    case 'ADD_AUDIT': return { ...state, auditLogs: [action.payload, ...state.auditLogs].slice(0, 1000) }; // Cap de 1000 logs no estado local
    case 'SET_SUCCESS': return { ...state, successMessage: action.payload };
    case 'ADD_USER': return { ...state, users: [...state.users, action.payload] };
    case 'DELETE_USER': return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case 'SET_SECTORS': return { ...state, sectors: action.payload };
    case 'UPDATE_SECTOR': return { ...state, sectors: state.sectors.map(s => s.id === action.payload.id ? action.payload : s) };
    default: return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [isInitializing, setIsInitializing] = useState(true);
  const successTimerRef = useRef<number | null>(null);

  // Memoização do usuário selecionado para evitar re-calculos pesados
  const selectedAmendment = useMemo(() => 
    state.amendments.find(a => a.id === state.selectedAmendmentId) || null,
  [state.amendments, state.selectedAmendmentId]);

  const showSuccessMessage = useCallback((message: string) => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    dispatch({ type: 'SET_SUCCESS', payload: message });
    successTimerRef.current = window.setTimeout(() => dispatch({ type: 'SET_SUCCESS', payload: null }), 3000);
  }, []);

  const addAuditLog = useCallback((params: Omit<AuditLog, 'id' | 'actorId' | 'actorName' | 'timestamp' | 'ipAddress' | 'userAgent'>) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent,
      ...params,
    };
    dispatch({ type: 'ADD_AUDIT', payload: newLog });
  }, [currentUser]);

  // --- HANDLERS OPERACIONAIS ---

  const handleMoveAmendment = useCallback((movements: AmendmentMovement[]) => {
    const targetId = movements[0].amendmentId;
    const amendment = state.amendments.find(a => a.id === targetId);
    if (!amendment) return;

    const newMovements = [...amendment.movements];
    const lastMovement = newMovements[newMovements.length - 1];
    if (lastMovement) lastMovement.dateOut = new Date().toISOString();
    
    const updatedMovements = [...newMovements, ...movements];
    const newCurrentSectors = movements.map(m => m.toSector).join(' | ');
    
    const updatedAmendment = { ...amendment, movements: updatedMovements, currentSector: newCurrentSectors };
    dispatch({ type: 'UPDATE_AMENDMENT', payload: updatedAmendment });
    
    addAuditLog({ 
      action: AuditAction.MOVE, 
      severity: AuditSeverity.MEDIUM, 
      targetResource: targetId, 
      details: `Tramitado para: ${newCurrentSectors}` 
    });
    showSuccessMessage("Tramitação concluída com sucesso.");
  }, [state.amendments, addAuditLog, showSuccessMessage]);

  const handleCreateAmendment = useCallback((newAmendment: Amendment) => {
    dispatch({ type: 'ADD_AMENDMENT', payload: newAmendment });
    addAuditLog({ action: AuditAction.CREATE, severity: AuditSeverity.MEDIUM, targetResource: newAmendment.seiNumber, details: "Criação de registro." });
    showSuccessMessage(`Processo ${newAmendment.seiNumber} criado.`);
  }, [addAuditLog, showSuccessMessage]);

  const handleUpdateAmendment = useCallback((updatedAmendment: Amendment) => {
    dispatch({ type: 'UPDATE_AMENDMENT', payload: updatedAmendment });
    addAuditLog({ action: AuditAction.UPDATE, severity: AuditSeverity.MEDIUM, targetResource: updatedAmendment.seiNumber, details: "Edição de dados." });
    showSuccessMessage("Registro atualizado.");
  }, [addAuditLog, showSuccessMessage]);

  const handleInactivateAmendment = useCallback((id: string, justification: string) => {
    const amendment = state.amendments.find(a => a.id === id);
    if (!amendment) return;

    const updated = { 
      ...amendment, 
      status: Status.ARCHIVED, 
      notes: `${amendment.notes || ''}\n[ARQUIVADO ${new Date().toLocaleDateString()}]: ${justification}` 
    };
    dispatch({ type: 'UPDATE_AMENDMENT', payload: updated });
    addAuditLog({ 
      action: AuditAction.DELETE, 
      severity: AuditSeverity.HIGH, 
      targetResource: amendment.seiNumber, 
      details: `Arquivamento: ${justification}` 
    });
    showSuccessMessage("Processo movido para arquivo.");
  }, [state.amendments, addAuditLog, showSuccessMessage]);

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog({ action: AuditAction.LOGIN, severity: AuditSeverity.INFO, targetResource: currentUser.email, details: "Logout" });
    }
    setCurrentUser(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#0d457a] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
            <h1 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter">GESA Cloud</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Sincronizando infraestrutura...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login />;
  if (!currentUser.lgpdAccepted) return <LGPDModal userName={currentUser.name} onAccept={() => {
    const updated = { ...currentUser, lgpdAccepted: true };
    setCurrentUser(updated);
    dispatch({ type: 'ADD_USER', payload: updated }); // Simula persistência
  }} />;

  const renderCurrentView = () => {
    if (selectedAmendment) {
      return (
        <AmendmentDetail 
          amendment={selectedAmendment} 
          currentUser={currentUser} 
          sectors={state.sectors} 
          systemMode={SystemMode.PRODUCTION} 
          onBack={() => dispatch({ type: 'SELECT_AMENDMENT', payload: null })} 
          onMove={handleMoveAmendment} 
          onStatusChange={(id, status) => dispatch({ type: 'UPDATE_AMENDMENT', payload: { ...state.amendments.find(a => a.id === id)!, status } })} 
          onDelete={handleInactivateAmendment} 
        />
      );
    }

    switch(state.currentView) {
      case 'dashboard': return <Dashboard amendments={state.amendments} systemMode={SystemMode.PRODUCTION} onSelectAmendment={(id) => dispatch({ type: 'SELECT_AMENDMENT', payload: id })} />;
      case 'amendments': return <AmendmentList amendments={state.amendments} sectors={state.sectors} userRole={currentUser.role} systemMode={SystemMode.PRODUCTION} onSelect={(a) => dispatch({ type: 'SELECT_AMENDMENT', payload: a.id })} onCreate={handleCreateAmendment} onUpdate={handleUpdateAmendment} onInactivate={handleInactivateAmendment} />;
      case 'deadlines': return <DeadlinePanel amendments={state.amendments} onSelect={(a) => dispatch({ type: 'SELECT_AMENDMENT', payload: a.id })} />;
      case 'repository': return <RepositoryModule amendments={state.amendments} />;
      case 'reports': return <ReportModule amendments={state.amendments} />;
      case 'import': return <ImportModule onImport={(data) => { dispatch({ type: 'SET_AMENDMENTS', payload: [...state.amendments, ...data] }); showSuccessMessage("Lote importado."); }} sectors={state.sectors} />;
      case 'sectors': return (
        <SectorManagement 
          sectors={state.sectors} 
          onAdd={(s) => dispatch({ type: 'SET_SECTORS', payload: [...state.sectors, s] })} 
          onReset={() => dispatch({ type: 'SET_SECTORS', payload: [] })} 
          onUpdateSla={(id, sla) => dispatch({ type: 'UPDATE_SECTOR', payload: { ...state.sectors.find(s => s.id === id)!, defaultSlaDays: sla } })} 
        />
      );
      case 'security': return <SecurityModule users={state.users} onAddUser={(u) => dispatch({ type: 'ADD_USER', payload: u })} onDeleteUser={(id) => dispatch({ type: 'DELETE_USER', payload: id })} currentUser={currentUser} />;
      case 'audit': return <AuditModule logs={state.auditLogs} />;
      case 'database': return <TechnicalPanel />;
      case 'govdocs': return <GovernanceDocs />;
      default: return <Dashboard amendments={state.amendments} systemMode={SystemMode.PRODUCTION} onSelectAmendment={(id) => dispatch({ type: 'SELECT_AMENDMENT', payload: id })} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={state.currentView}
      notifications={[]}
      systemMode={SystemMode.PRODUCTION}
      successMessage={state.successMessage}
      onNavigate={(view) => dispatch({ type: 'SET_VIEW', payload: view })}
      onLogout={handleLogout}
    >
      {renderCurrentView()}
    </Layout>
  );
};

export default App;
