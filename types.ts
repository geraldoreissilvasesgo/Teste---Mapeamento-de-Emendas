
/**
 * DICIONÁRIO DE DADOS SaaS - GESA/SUBIPEI
 * Versão: 2.7.5-stable
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
  ESPECIAL = 'Emenda Especial'
}

export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio / Repasse',
  DIRETA = 'Execução Direta'
}

export enum GNDType {
  CUSTEIO = '3 - Custeio',
  INVESTIMENTO = '4 - Investimento'
}

export enum AnalysisType {
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Parecer Jurídico',
  BUDGET_RESERVE = 'Reserva Orçamentária',
  PAYMENT_PROC = 'Processamento de Pagamento',
  FINAL_APPROVAL = 'Aprovação Final',
  DOC_COMPLEMENT = 'Complementação Documental'
}

export interface SectorConfig {
  id: string;
  name: string;
  defaultSlaDays: number;
  analysisType: AnalysisType;
}

export interface AIAnalysisResult {
  summary: string;
  bottleneck: string;
  recommendation: string;
  riskScore: number;
  completionProbability: number;
}

export enum Status {
  IN_PROGRESS = 'Em Tramitação',
  DILIGENCE = 'Em Diligência',
  REJECTED = 'Rejeitado',
  CONCLUDED = 'Liquidado / Pago',
  ARCHIVED = 'Arquivado',
  CONSOLIDATION = 'Em Consolidação',
  FORWARDING = 'Encaminhado'
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
  analysisType?: AnalysisType;
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
  object: string;
  value: number;
  status: Status;
  currentSector: string;
  movements: AmendmentMovement[];
  suinfra?: boolean;
  sutis?: boolean;
  transferMode?: TransferMode;
  gnd?: GNDType;
  createdAt: string;
  aiInsights?: AIAnalysisResult;
  entryDate?: string;
  healthUnit?: string;
  institutionName?: string;
  notes?: string;
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
  AI_ANALYSIS = 'Análise IA',
  TENANT_SWITCH = 'Troca de Tenant',
  SECURITY = 'Segurança',
  ERROR = 'Erro'
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
