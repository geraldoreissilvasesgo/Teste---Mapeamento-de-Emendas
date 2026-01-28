
export enum Role {
  ADMIN = 'Administrador',
  OPERATOR = 'Operador SES',
  VIEWER = 'Consultor'
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
  PROTOCOL = 'Protocolo',
  BUDGET = 'Gerência de Orçamento',
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Jurídico',
  SECRETARY = 'Gabinete',
  PAYMENT = 'Pagamento',
  SGI = 'Coordenação SGI',
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
  PROCESSING = 'Em Tramitação',
  APPROVED = 'Aprovada',
  REJECTED = 'Rejeitada',
  PAID = 'Paga',
  DILIGENCE = 'Em Diligência',
  CONCLUDED = 'Concluída',
  INACTIVE = 'Inativada'
}

export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento',
  ESPECIAL = 'Transferência Especial'
}

export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio',
  DIRETO = 'Execução Direta'
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
  entryDate?: string;
  exitDate?: string;
  suinfra: boolean;
  sutis: boolean;
  transferMode?: TransferMode;
  institutionName?: string;
  notes?: string;
  createdAt: string;
  movements: AmendmentMovement[];
  inactivatedAt?: string;
  inactivationReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: Sector;
  avatarUrl?: string;
  password?: string;
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MOVE = 'TRAMITACAO',
  APPROVE = 'APROVACAO',
  SECURITY = 'SEGURANCA',
  SIGNATURE = 'ASSINATURA_DIGITAL',
  INACTIVATE = 'INATIVACAO'
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  targetResource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface AIAnalysisResult {
  summary: string;
  bottleneck: string;
  recommendation: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'critical';
  seiNumber: string;
  timestamp: string;
}
