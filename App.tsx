import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AmendmentList } from './components/AmendmentList';
import { AmendmentDetail } from './components/AmendmentDetail';
import { SecurityModule } from './components/SecurityModule';
import { AuditModule } from './components/AuditModule';
import { ImportModule } from './components/ImportModule';
import { RepositoryModule } from './components/RepositoryModule';
import { ReportModule } from './components/ReportModule';
import { Login } from './components/Login';
import { User, Amendment, Role, Status, Sector, AuditLog, AuditAction } from './types';
import { MOCK_USERS, MOCK_AMENDMENTS, MOCK_AUDIT_LOGS } from './constants';

/**
 * COMPONENTE PRINCIPAL (App)
 * Gerencia o estado global, autenticação, roteamento interno e logs de auditoria.
 */
const App: React.FC = () => {
  // ESTADOS DE AUTENTICAÇÃO
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ESTADOS DE NAVEGAÇÃO
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  
  // ESTADOS DE DADOS (Simulação de Banco de Dados)
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [amendments, setAmendments] = useState<Amendment[]>(MOCK_AMENDMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  /**
   * Função Auxiliar para Registro de Auditoria
   * Registra toda ação importante no sistema para fins de conformidade legal.
   */
  const addAuditLog = (action: AuditAction, target: string, details: string, userOverride?: User) => {
    const actor = userOverride || currentUser;
    if (!actor) return;

    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      actorId: actor.id,
      actorName: actor.name,
      action: action,
      targetResource: target,
      details: details,
      timestamp: new Date().toISOString(),
      ipAddress: '10.15.100.24' // IP estático simulado
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- GERENCIADORES DE AUTENTICAÇÃO ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView('dashboard'); 
    
    addAuditLog(
      AuditAction.LOGIN, 
      'Sistema', 
      'Acesso realizado com sucesso no painel', 
      user
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedAmendment(null);
  };

  // --- GERENCIADORES DE EMENDAS (CRUD & BUSINESS LOGIC) ---

  const handleCreateAmendment = (newAmendment: Amendment) => {
    setAmendments(prev => [...prev, newAmendment]);
    addAuditLog(
      AuditAction.CREATE,
      newAmendment.seiNumber,
      `Cadastro realizado. Objeto: ${newAmendment.object}, Valor: R$ ${newAmendment.value}`
    );
  };

  const handleUpdateAmendment = (updatedAmendment: Amendment) => {
    setAmendments(prev => prev.map(a => a.id === updatedAmendment.id ? updatedAmendment : a));
    addAuditLog(
      AuditAction.UPDATE,
      updatedAmendment.seiNumber,
      `Alteração de dados. Novo Status: ${updatedAmendment.status}`
    );
  };

  const handleDeleteAmendment = (id: string) => {
    const target = amendments.find(a => a.id === id);
    setAmendments(prevAmendments => prevAmendments.filter(a => a.id !== id));

    if (selected