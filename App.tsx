
import React, { useState, useEffect } from 'react';
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
import { User, Amendment, Role, Status, Sector, AuditLog, AuditAction } from './types';
import { MOCK_AMENDMENTS, MOCK_USERS, MOCK_AUDIT_LOGS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  
  // Estados Globais da Aplicação
  const [amendments, setAmendments] = useState<Amendment[]>(MOCK_AMENDMENTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        // Garantindo que o usuário de teste seja sempre ADMIN
        const isAdmin = user.email === 'admin@saude.go.gov.br' || user.email?.endsWith('@saude.go.gov.br');
        
        setCurrentUser({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0],
          email: user.email,
          role: isAdmin ? Role.ADMIN : Role.OPERATOR,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0d457a&color=fff`
        });
      } else {
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentView('dashboard');
    setSelectedAmendment(null);
  };

  // Handlers de Dados
  const handleCreateAmendment = (newAmendment: Amendment) => {
    setAmendments(prev => [newAmendment, ...prev]);
    addAuditLog(AuditAction.CREATE, `Processo ${newAmendment.seiNumber}`, `Criação de nova emenda no valor de R$ ${newAmendment.value}`);
  };

  const handleImportData = (newData: Amendment[]) => {
    setAmendments(prev => [...newData, ...prev]);
    addAuditLog(AuditAction.CREATE, 'Importação em Lote', `Importados ${newData.length} registros via planilha.`);
    setCurrentView('amendments');
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    addAuditLog(AuditAction.SECURITY, `Usuário ${newUser.name}`, `Novo usuário cadastrado com perfil ${newUser.role}`);
  };

  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (userToDelete) {
      addAuditLog(AuditAction.DELETE, `Usuário ${userToDelete.name}`, 'Remoção de acesso ao sistema');
    }
  };

  const addAuditLog = (action: AuditAction, target: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      actorId: currentUser.id,
      actorName: currentUser.name,
      action,
      targetResource: target,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Sessão Atual)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0d457a]">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse text-center">
            Validando Credenciais<br/>GO.GOV.BR
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={() => {}} />;
  }

  // Renderizador de Visões
  const renderContent = () => {
    if (selectedAmendment) {
      return (
        <AmendmentDetail 
          amendment={selectedAmendment} 
          currentUser={currentUser}
          onBack={() => setSelectedAmendment(null)}
          onMove={(id, sector) => {
             setAmendments(prev => prev.map(a => a.id === id ? {...a, currentSector: sector} : a));
             addAuditLog(AuditAction.MOVE, `Processo ID: ${id}`, `Tramitado para o setor: ${sector}`);
          }} 
          onStatusChange={(id, status) => {
             setAmendments(prev => prev.map(a => a.id === id ? {...a, status} : a));
             addAuditLog(AuditAction.APPROVE, `Processo ID: ${id}`, `Status alterado para: ${status}`);
          }}
          onDelete={(id) => {
             setAmendments(prev => prev.filter(a => a.id !== id));
             setSelectedAmendment(null);
             addAuditLog(AuditAction.DELETE, `Processo ID: ${id}`, 'Exclusão definitiva de registro');
          }}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard amendments={amendments} />;
      case 'amendments':
        return (
          <AmendmentList 
            amendments={amendments} 
            userRole={currentUser.role}
            onSelect={setSelectedAmendment}
            onCreate={handleCreateAmendment}
            onUpdate={() => {}}
            onDelete={(id) => setAmendments(prev => prev.filter(a => a.id !== id))}
          />
        );
      case 'repository':
        return <RepositoryModule amendments={amendments} />;
      case 'reports':
        return <ReportModule amendments={amendments} />;
      case 'import':
        return <ImportModule onImport={handleImportData} />;
      case 'security':
        return <SecurityModule users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />;
      case 'audit':
        return <AuditModule logs={auditLogs} />;
      default:
        return <Dashboard amendments={amendments} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      onNavigate={(view) => {
        setCurrentView(view);
        setSelectedAmendment(null);
      }}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
