/**
 * DICIONÁRIO DE DADOS SaaS - GESA/SUBIPEI
 * Versão: 3.2.0-documented
 * 
 * Este arquivo define a estrutura fundamental de dados do sistema,
 * garantindo tipagem forte em toda a aplicação.
 */

// Define se o sistema está operando com dados reais ou em ambiente de homologação
export enum SystemMode {
  TEST = 'Teste/Simulação',
  PRODUCTION = 'Produção/Real'
}

// Matriz de responsabilidades e perfis de acesso (RBAC)
export enum Role {
  SUPER_ADMIN = 'Super Administrador', // Acesso total a todas as secretarias
  ADMIN = 'Administrador de Unidade',   // Gestão plena de uma secretaria específica
  OPERATOR = 'Operador GESA',          // Uso diário para trâmites de processos
  AUDITOR = 'Auditor Fiscal',           // Acesso para órgãos de controle (leitura)
  VIEWER = 'Consultor Externo'         // Acesso limitado para acompanhamento
}

// Tipificação das emendas conforme a origem do recurso
export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento',
  RECURSO_PROPRIO = 'Recurso Próprio (SES)',
  TRANSFERENCIA_ESPECIAL = 'Transferência Especial'
}

// Modalidades de transferência financeira previstas na legislação
export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio',
  CONTRATO_REPASSE = 'Contrato de Repasse',
  EXECUCAO_DIRETA = 'Execução Direta'
}

// Classificação de natureza de despesa (GND)
export enum GNDType {
  CUSTEIO = '3 - Custeio',
  INVESTIMENTO = '4 - Investimento'
}

// Ações registradas na trilha de auditoria para conformidade e transparência
export enum AuditAction {
  LOGIN = 'LOGIN_SISTEMA',
  LOGOUT = 'LOGOUT_SISTEMA',
  CREATE = 'CRIAÇÃO_REGISTRO',
  UPDATE = 'ATUALIZAÇÃO_REGISTRO',
  DELETE = 'EXCLUSÃO_LÓGICA',
  MOVE = 'TRAMITAÇÃO_SETORIAL',
  SECURITY = 'ALERTA_SEGURANÇA',
  ERROR = 'ERRO_SISTEMA',
  AI_ANALYSIS = 'IA_ANALYSIS_RUN',
  TENANT_SWITCH = 'TROCA_UNIDADE'
}

// Estados principais do ciclo de vida de um processo administrativo (Workflow)
export enum Status {
  DOCUMENT_ANALYSIS = 'Análise da Documentação',
  TECHNICAL_FLOW = 'Em Tramitação Técnica',
  DILIGENCE = 'Em Diligência',
  LEGAL_OPINION = 'Aguardando Parecer Jurídico',
  COMMITMENT_LIQUIDATION = 'EMPENHO / LIQUIDAÇÃO', // Ativa trava de edição
  CONCLUDED = 'Liquidado / Pago',               // Estado final estável
  ARCHIVED = 'Arquivado / Rejeitado'            // Estado de encerramento
}

// Estrutura de usuário autenticado
export interface User {
  id: string;
  tenantId: string; // Identificador da secretaria (ex: SES, SEDUC)
  name: string;
  email: string;
  role: Role;
  department: string;
  avatarUrl?: string;
  lgpdAccepted: boolean; // Flag de aceite do termo de privacidade
  mfaEnabled?: boolean;  // Autenticação de dois fatores
  api_key?: string;      // Chave para integração externa
}

// Registro individual de movimentação de um processo (Trilha de auditoria interna)
export interface AmendmentMovement {
  id: string;
  amendmentId: string;
  fromSector: string;   // Unidade de origem
  toSector: string;     // Unidade de destino
  dateIn: string;       // Data de entrada na unidade
  dateOut: string | null; // Data de saída (null se estiver parado lá)
  deadline: string;     // Prazo limite para processamento (SLA)
  daysSpent: number;    // Dias úteis consumidos
  handledBy: string;    // Usuário que realizou a ação
  remarks?: string;     // Despacho/Observações
  analysisType?: string; // Categoria da análise realizada
}

// Objeto principal: O Processo de Emenda
export interface Amendment {
  id: string;
  tenantId: string;
  code: string;         // Código interno GESA
  seiNumber: string;    // Número oficial do Processo SEI
  year: number;         // Exercício financeiro
  type: AmendmentType;
  deputyName: string;   // Autor da emenda
  municipality: string; // Município beneficiado
  beneficiaryUnit?: string;
  object: string;       // Descrição detalhada do objeto
  value: number;        // Montante financeiro
  status: string;       // Status atual no workflow
  currentSector: string; // Unidade técnica onde se encontra
  createdAt: string;
  updatedAt?: string;
  entryDate?: string;
  suinfra?: boolean;    // Flag para obras
  sutis?: boolean;      // Flag para tecnologia
  transferMode?: TransferMode;
  gnd?: GNDType;
  movements: AmendmentMovement[]; // Histórico completo de trâmites
}

// Configuração de unidade técnica e seus SLAs
export interface SectorConfig {
  id: string;
  tenantId: string;
  name: string;
  defaultSlaDays: number;
  analysisType: string;
}

// Configuração visual e lógica de um status
export interface StatusConfig {
  id: string;
  tenantId: string;
  name: string;
  color: string;
  isFinal: boolean; // Se true, bloqueia edições no processo
}

// Log de auditoria para segurança e compliance
export interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

// Resultado da análise preditiva gerada pela IA Gemini
export interface AIAnalysisResult {
  summary: string;           // Resumo executivo
  bottleneck: string;        // Identificação de gargalos
  recommendation: string;    // Sugestão de ação
  riskScore: number;         // Pontuação de risco (0-100)
  completionProbability: number; // Chance de sucesso (0-1)
}

// Definição das fases macro do processo para o Stepper visual
export const PROCESS_PHASES = [
  { id: 'start', label: 'Protocolo', statuses: [Status.DOCUMENT_ANALYSIS] },
  { id: 'tech', label: 'Análise Técnica', statuses: [Status.TECHNICAL_FLOW, Status.DILIGENCE] },
  { id: 'legal', label: 'Conformidade', statuses: [Status.LEGAL_OPINION] },
  { id: 'exec', label: 'Empenho', statuses: [Status.COMMITMENT_LIQUIDATION] },
  { id: 'end', label: 'Liquidação', statuses: [Status.CONCLUDED, Status.ARCHIVED] }
];

// Metadados para estilização e permissões baseadas em Role
export const ROLE_METADATA = {
  [Role.SUPER_ADMIN]: {
    label: 'Super Admin',
    description: 'Acesso total irrestrito a todos os tenants e configurações globais.',
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    permissions: ['Gestão Global', 'Logs Críticos', 'MFA Management', 'Banco de Dados']
  },
  [Role.ADMIN]: {
    label: 'Administrador',
    description: 'Gestão completa da unidade (SES, SEDUC, etc).',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    permissions: ['Gestão de Usuários', 'Configuração SLA', 'Edição de Processos', 'Relatórios']
  },
  [Role.OPERATOR]: {
    label: 'Operador',
    description: 'Perfil operacional para tramitação diária e atualização.',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    permissions: ['Tramitar Processos', 'Anexar Documentos', 'Atualizar Status', 'Dashboard']
  },
  [Role.AUDITOR]: {
    label: 'Auditor',
    description: 'Acesso para órgãos de controle. Visualização total de trilhas.',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    permissions: ['Trilha de Auditoria', 'Visualização Global', 'Relatórios Técnicos']
  },
  [Role.VIEWER]: {
    label: 'Consultor',
    description: 'Acesso apenas leitura para acompanhamento de convênios.',
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    permissions: ['Acompanhar Status', 'Consultar Repositório']
  }
};