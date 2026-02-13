
/**
 * DICIONÁRIO DE DADOS SaaS - GESA/SUBIPEI
 * Versão: 3.3.0-security-hardened
 * 
 * Este arquivo define a estrutura fundamental de dados do sistema.
 */

export enum SystemMode {
  TEST = 'Teste/Simulação',
  PRODUCTION = 'Produção/Real'
}

export enum Role {
  SUPER_ADMIN = 'Super Administrador',
  ADMIN = 'Administrador de Unidade',
  OPERATOR = 'Operador GESA',
  AUDITOR = 'Auditor Fiscal',
  VIEWER = 'Consultor Externo'
}

export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento',
  RECURSO_PROPRIO = 'Recurso Próprio (SES)',
  TRANSFERENCIA_ESPECIAL = 'Transferência Especial'
}

export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio',
  CONTRATO_REPASSE = 'Contrato de Repasse',
  EXECUCAO_DIRETA = 'Execução Direta'
}

export enum GNDType {
  CUSTEIO = '3 - Custeio',
  INVESTIMENTO = '4 - Investimento'
}

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

export enum Status {
  DOCUMENT_ANALYSIS = 'Análise da Documentação',
  TECHNICAL_FLOW = 'Em Tramitação Técnica',
  DILIGENCE = 'Em Diligência',
  LEGAL_OPINION = 'Aguardando Parecer Jurídico',
  COMMITMENT_LIQUIDATION = 'EMPENHO / LIQUIDAÇÃO',
  CONCLUDED = 'Liquidado / Pago',
  ARCHIVED = 'Arquivado / Rejeitado'
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  lgpdAccepted: boolean;
  mfaEnabled?: boolean;
  api_key?: string;
  password?: string;
}

export interface AmendmentMovement {
  id: string;
  amendmentId: string;
  fromSector: string;
  toSector: string;
  dateIn: string;
  dateOut: string | null;
  deadline: string;
  daysSpent: number;
  handledBy: string;
  remarks?: string;
  analysisType?: string;
}

export interface Amendment {
  id: string;
  tenantId: string;
  code: string;
  seiNumber: string;
  year: number;
  type: AmendmentType;
  deputyName: string;
  municipality: string;
  beneficiaryUnit?: string;
  object: string;
  value: number;
  status: string;
  currentSector: string;
  createdAt: string;
  updatedAt?: string;
  entryDate?: string;
  suinfra?: boolean;
  sutis?: boolean;
  transferMode?: TransferMode;
  gnd?: GNDType;
  movements: AmendmentMovement[];
}

export interface SectorConfig {
  id: string;
  tenantId: string;
  name: string;
  defaultSlaDays: number;
  analysisType: string;
}

export interface StatusConfig {
  id: string;
  tenantId: string;
  name: string;
  color: string;
  isFinal: boolean;
}

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

export interface AIAnalysisResult {
  summary: string;
  bottleneck: string;
  recommendation: string;
  riskScore: number;
  completionProbability: number;
}

export const PROCESS_PHASES = [
  { id: 'start', label: 'Protocolo', statuses: [Status.DOCUMENT_ANALYSIS] },
  { id: 'tech', label: 'Análise Técnica', statuses: [Status.TECHNICAL_FLOW, Status.DILIGENCE] },
  { id: 'legal', label: 'Conformidade', statuses: [Status.LEGAL_OPINION] },
  { id: 'exec', label: 'Empenho', statuses: [Status.COMMITMENT_LIQUIDATION] },
  { id: 'end', label: 'Liquidação', statuses: [Status.CONCLUDED, Status.ARCHIVED] }
];

export const ROLE_METADATA = {
  [Role.SUPER_ADMIN]: {
    label: 'Super Admin',
    description: 'Acesso total irrestrito para governança de infraestrutura e segurança.',
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    permissions: ['Controle de Tenants', 'Auditoria Estrutural', 'MFA Management', 'Banco de Dados (DDL)']
  },
  [Role.ADMIN]: {
    label: 'Administrador',
    description: 'Gestão executiva da unidade governamental (SES, SEDUC).',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    permissions: ['Gestão de Operadores', 'Configuração de SLAs', 'Edição de Processos SEI', 'Relatórios Fiscais']
  },
  [Role.OPERATOR]: {
    label: 'Operador GESA',
    description: 'Responsável técnico pela tramitação e processamento diário.',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    permissions: ['Tramitação Intersetorial', 'Carga de Protocolos', 'Atualização de Status', 'Consulta de Dossiês']
  },
  [Role.AUDITOR]: {
    label: 'Auditor Fiscal',
    description: 'Órgão de controle com visibilidade total de trilhas de auditoria.',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    permissions: ['Leitura de Trilhas Imutáveis', 'Logs de Conformidade', 'Matriz de Risco', 'Compliance Jurídico']
  },
  [Role.VIEWER]: {
    label: 'Consultor',
    description: 'Acesso de leitura para acompanhamento de emendas externas.',
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    permissions: ['Consulta de Repositório', 'Status de Temporalidade', 'Visualização de Prazos']
  }
};
