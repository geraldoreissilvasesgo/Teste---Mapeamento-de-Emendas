
export enum SystemMode {
  TEST = 'Teste/Simulação',
  PRODUCTION = 'Produção/Real'
}

export enum Role {
  ADMIN = 'Administrador',
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'alert' | 'critical';
}

export interface AIAnalysisResult {
  summary: string;
  bottleneck: string;
  recommendation: string;
}

export enum AnalysisType {
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Análise Jurídica',
  DOC_COMPLEMENT = 'Complementação de Documentação',
  BUDGET_RESERVE = 'Reserva Orçamentária',
  PAYMENT_PROC = 'Processamento de Pagamento',
  FINAL_APPROVAL = 'Homologação Final',
  INACTIVATION = 'Inativação de Registro'
}

export enum Sector {
  PROTOCOL = 'GESA - Protocolo Central',
  BUDGET = 'Gerência de Orçamento',
  TECHNICAL_ENG = 'SUINFRA - Engenharia e Infraestrutura',
  TECHNICAL_IT = 'SUTIS - Tecnologia da Informação',
  CONVENANTS = 'Coordenação de Convênios',
  LEGAL = 'Procuradoria Setorial (Jurídico)',
  SECRETARY = 'Gabinete da Secretária',
  PAYMENT = 'Gerência de Finanças (Pagamento)',
  ARCHIVE = 'Arquivo/Inativos'
}

export interface SectorConfig {
  id: string;
  name: string;
  defaultSlaDays: number;
  analysisType: AnalysisType;
}

export enum Status {
  DRAFT = 'Rascunho',
  IN_PROGRESS = 'Em Andamento',
  FORWARDING = 'Encaminhamento',
  CONSOLIDATION = 'Consolidação de Processo',
  PROCESSING = 'Em Tramitação',
  APPROVED = 'Aprovada',
  REJECTED = 'Rejeitada',
  PAID = 'Paga',
  DILIGENCE = 'Em Diligência',
  CONCLUDED = 'Concluída',
  INACTIVE = 'Inativada'
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
  analysisType?: AnalysisType;
  justification?: string;
}

export interface Amendment {
  id: string;
  code: string;
  year: number;
  type: AmendmentType;
  seiNumber: string;
  value: number;
  municipality: string;
  deputyName?: string;
  party?: string;
  object: string;
  status: Status;
  statusDescription?: string;
  currentSector: string;
  healthUnit: string;
  movements: AmendmentMovement[];
  suinfra?: boolean;
  sutis?: boolean;
  entryDate?: string;
  exitDate?: string | null;
  notes?: string;
  transferMode?: TransferMode;
  gnd?: GNDType;
  institutionName?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  mfaEnabled?: boolean;
  lgpdAccepted?: boolean;
  avatarUrl?: string;
  password?: string;
  department?: string;
}

export enum AuditAction {
  LOGIN = 'LOGIN_ACESSO',
  LOGIN_FAIL = 'LOGIN_FALHA',
  MFA_VERIFY = 'MFA_VERIFICACAO',
  CREATE = 'CADASTRO_NOVO',
  UPDATE = 'ALTERACAO_DADOS',
  DELETE = 'EXCLUSAO_LOGICA',
  MOVE = 'TRAMITACAO_FLUXO',
  SECURITY = 'ALTERACAO_SEGURANCA',
  ERROR = 'ERRO_SISTEMA',
  LGPD_CONSENT = 'LGPD_CONSENTIMENTO'
}

export enum AuditSeverity {
  INFO = 'Informativo',
  LOW = 'Baixo',
  MEDIUM = 'Médio',
  HIGH = 'Alto',
  CRITICAL = 'Crítico'
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  severity: AuditSeverity;
  targetResource: string;
  details: string;
  payloadBefore?: string;
  payloadAfter?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}
