
/**
 * DICIONÁRIO DE DADOS SaaS - GESA/SUBIPEI
 * Versão: 2.9.8-stable
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

// Enum para os estados padronizados do ciclo de vida
export enum Status {
  DOCUMENT_ANALYSIS = 'Análise da Documentação',
  TECHNICAL_FLOW = 'Em Tramitação Técnica',
  DILIGENCE = 'Em Diligência',
  LEGAL_OPINION = 'Aguardando Parecer Jurídico',
  CONCLUDED = 'Liquidado / Pago',
  ARCHIVED = 'Arquivado / Rejeitado'
}

// Mapeamento de Fases para o Stepper de Rastreabilidade
export const PROCESS_PHASES = [
  { id: 'start', label: 'Protocolo', statuses: [Status.DOCUMENT_ANALYSIS] },
  { id: 'tech', label: 'Análise Técnica', statuses: [Status.TECHNICAL_FLOW, Status.DILIGENCE] },
  { id: 'legal', label: 'Conformidade', statuses: [Status.LEGAL_OPINION] },
  { id: 'end', label: 'Liquidação', statuses: [Status.CONCLUDED, Status.ARCHIVED] }
];

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
    permissions: ['Trilha de Auditoria', 'Exportação de Dados', 'Logs', 'Relatórios Fiscais']
  },
  [Role.VIEWER]: {
    label: 'Consultor',
    description: 'Acesso apenas leitura para acompanhamento.',
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    permissions: ['Consulta de Processos', 'Ver Detalhes', 'Acompanhar Trâmite']
  }
};

export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento',
  ESPECIAL = 'Emenda Especial'
}

export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio / Repasse',
  DIRETA = 'Execução Direta'
}

export enum GNDType {
  CUSTEIO = '3 - Custeio',
  INVESTIMENTO = '4 - Investmento'
}

export interface SectorConfig {
  id: string;
  tenantId?: string;
  name: string;
  defaultSlaDays: number;
  analysisType: string;
}

export interface StatusConfig {
  id: string;
  tenantId: string;
  name: string;
  color: string;
  isFinal?: boolean;
}

export interface AmendmentMovement {
  id: string;
  amendmentId: string;
  fromSector: string | null;
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
  deputyName?: string;
  municipality: string;
  beneficiaryUnit?: string;
  object: string;
  value: number;
  status: string | Status;
  currentSector: string;
  movements: AmendmentMovement[];
  createdAt: string;
  entryDate?: string;
  suinfra?: boolean;
  sutis?: boolean;
  transferMode?: TransferMode;
  gnd?: GNDType;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  lgpdAccepted: boolean;
  department?: string;
  password?: string;
  mfaEnabled?: boolean;
}

export enum AuditAction {
  LOGIN = 'Login / Acesso',
  CREATE = 'Criação',
  UPDATE = 'Edição',
  DELETE = 'Arquivamento',
  MOVE = 'Tramitação',
  SECURITY = 'Segurança',
  ERROR = 'Erro',
  AI_ANALYSIS = 'Análise IA Preditiva',
  TENANT_SWITCH = 'Troca de Tenant/Unidade'
}

export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  details: string;
  timestamp: string;
  severity: AuditSeverity;
}

export interface AIAnalysisResult {
  summary: string;
  bottleneck: string;
  recommendation: string;
  riskScore: number;
  completionProbability: number;
}
