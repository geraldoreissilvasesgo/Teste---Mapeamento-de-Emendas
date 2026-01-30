
/**
 * ARQUIVO DE CONSTANTES GLOBAIS
 * 
 * Este arquivo centraliza valores fixos e dados estáticos utilizados em múltiplas
 * partes da aplicação. Manter esses valores aqui facilita a manutenção e garante
 * consistência em toda a interface.
 */

import { Role, Status, User, AuditLog, AuditAction, SectorConfig, AnalysisType, AmendmentType, AuditSeverity, Amendment, TransferMode, GNDType } from './types';

// Informações gerais da aplicação, exibidas no layout e em títulos.
export const APP_NAME = "Rastreio de Emendas";
export const DEPARTMENT = "Gerência de Suporte Administrativo - GESA/SUBIPEI";
export const APP_VERSION = "2.7.1-prod";

// Configuração inicial de setores reais da estrutura de Goiás (SEI/SUBIPEI).
export const DEFAULT_SECTOR_CONFIGS: SectorConfig[] = [
  { id: 'sec-01', name: 'GESA - Protocolo Central', defaultSlaDays: 2, analysisType: AnalysisType.TECHNICAL },
  { id: 'sec-02', name: 'SUBIPEI - Gabinete', defaultSlaDays: 3, analysisType: AnalysisType.FINAL_APPROVAL },
  { id: 'sec-03', name: 'SUINFRA - Engenharia', defaultSlaDays: 10, analysisType: AnalysisType.TECHNICAL },
  { id: 'sec-04', name: 'SUTIS - Tecnologia', defaultSlaDays: 7, analysisType: AnalysisType.TECHNICAL },
  { id: 'sec-05', name: 'Gerência de Convênios', defaultSlaDays: 5, analysisType: AnalysisType.DOC_COMPLEMENT },
  { id: 'sec-06', name: 'Procuradoria Setorial', defaultSlaDays: 15, analysisType: AnalysisType.LEGAL },
  { id: 'sec-07', name: 'Gerência de Orçamento', defaultSlaDays: 3, analysisType: AnalysisType.BUDGET_RESERVE },
  { id: 'sec-08', name: 'Gerência de Finanças', defaultSlaDays: 4, analysisType: AnalysisType.PAYMENT_PROC }
];

// Lista de municípios de Goiás para preenchimento de formulários.
export const GOIAS_CITIES = [
  "Abadia de Goiás", "Abadiânia", "Acreúna", "Adelândia", "Água Fria de Goiás", "Água Limpa", "Águas Lindas de Goiás", 
  "Alexânia", "Aloândia", "Alto Horizonte", "Alto Paraíso de Goiás", "Alvorada do Norte", "Amaralina", "Americano do Brasil", 
  "Anápolis", "Anhanguera", "Anicuns", "Aparecida de Goiânia", "Caldas Novas", "Catalão", "Formosa", "Goiânia", "Goianira", 
  "Itumbiara", "Jaraguá", "Jataí", "Luziânia", "Rio Verde", "Senador Canedo", "Trindade", "Valparaíso de Goiás"
];

// Lista de deputados estaduais da ALEGO.
export const GOIAS_DEPUTIES = [
  "Adriana Accorsi", "Amilton Filho", "Amauri Ribeiro", "Antônio Gomide", "Bia de Lima", "Bruno Peixoto",
  "Cairo Salim", "Charles Bento", "Clécio Alves", "Delegado Eduardo Prado", "Dr. George Morais",
  "Gustavo Sebba", "Issy Quinan", "Lincoln Tejota", "Lucas Calil", "Major Araújo", "Mauro Rubem",
  "Paulo Cezar Martins", "Talles Barreto", "Vívian Naves", "Wilde Cambão"
];

// Usuário padrão para bypassar a tela de login em ambiente de desenvolvimento.
export const MOCK_USERS: User[] = [
  {
    id: 'test-admin-01',
    tenantId: 'T-01',
    name: 'Gestor GESA',
    email: 'admin.teste@gesa.go.gov.br',
    role: Role.ADMIN,
    avatarUrl: `https://ui-avatars.com/api/?name=Gestor+GESA&background=0d457a&color=fff`,
    lgpdAccepted: true,
    mfaEnabled: true,
    department: 'GESA/SUBIPEI'
  }
];

// Lista inicial de emendas para teste imediato.
export const MOCK_AMENDMENTS: Amendment[] = [
  {
    id: 'am-001',
    tenantId: 'T-01',
    code: 'EM-2025-0001',
    seiNumber: '202500067001234',
    year: 2025,
    type: AmendmentType.IMPOSITIVA,
    deputyName: 'Bruno Peixoto',
    municipality: 'Goiânia',
    object: 'Aquisição de Ambulância para Unidade de Saúde Central',
    value: 250000.00,
    status: Status.IN_PROGRESS,
    currentSector: 'GESA - Protocolo Central',
    createdAt: new Date().toISOString(),
    suinfra: false,
    sutis: false,
    movements: [
      {
        id: 'mov-01',
        amendmentId: 'am-001',
        fromSector: 'Origem Externa',
        toSector: 'GESA - Protocolo Central',
        dateIn: new Date(Date.now() - 86400000 * 2).toISOString(),
        dateOut: null,
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        daysSpent: 2,
        handledBy: 'Sistema'
      }
    ]
  },
  {
    id: 'am-002',
    tenantId: 'T-01',
    code: 'EM-2025-0002',
    seiNumber: '202500067005678',
    year: 2025,
    type: AmendmentType.GOIAS_CRESCIMENTO,
    municipality: 'Anápolis',
    object: 'Recapeamento Asfáltico - Distrito Industrial',
    value: 1200000.00,
    status: Status.DILIGENCE,
    currentSector: 'SUINFRA - Engenharia',
    createdAt: new Date().toISOString(),
    suinfra: true,
    sutis: false,
    movements: [
      {
        id: 'mov-02',
        amendmentId: 'am-002',
        fromSector: 'GESA - Protocolo Central',
        toSector: 'SUINFRA - Engenharia',
        dateIn: new Date(Date.now() - 86400000 * 5).toISOString(),
        dateOut: null,
        deadline: new Date(Date.now() - 86400000 * 1).toISOString(), // Atrasado
        daysSpent: 5,
        handledBy: 'Gestor GESA'
      }
    ]
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [];
