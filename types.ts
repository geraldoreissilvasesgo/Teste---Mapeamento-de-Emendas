
/**
 * DICIONÁRIO DE DADOS SaaS - GESA/SUBIPEI
 * Este arquivo define a estrutura fundamental de dados do sistema, utilizando TypeScript
 * para garantir segurança de tipos e clareza nas regras de negócio.
 */

/**
 * Modos de operação do sistema para distinguir ambientes de homologação e produção.
 */
export enum SystemMode {
  TEST = 'Teste/Simulação',
  PRODUCTION = 'Produção/Real'
}

/**
 * Níveis de acesso baseados em função (RBAC).
 * Define as permissões granulares de cada usuário no ecossistema.
 */
export enum Role {
  SUPER_ADMIN = 'Super Administrador', // Gestor global de todos os Tenants (SaaS)
  ADMIN = 'Administrador de Unidade',   // Gestor de uma secretaria específica
  OPERATOR = 'Operador GESA',           // Usuário operacional padrão
  AUDITOR = 'Auditor Fiscal',           // Acesso de leitura e trilha de auditoria
  VIEWER = 'Consultor Externo'          // Acesso restrito apenas para visualização
}

/**
 * Categorias de Emendas Parlamentares ou Projetos.
 */
export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento',
  ESPECIAL = 'Emenda Especial'
}

/**
 * Modalidades de transferência de recursos financeiros.
 */
export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio / Repasse',
  DIRETA = 'Execução Direta'
}

/**
 * Classificação do Grupo de Natureza de Despesa (GND).
 */
export enum GNDType {
  CUSTEIO = '3 - Custeio',
  INVESTIMENTO = '4 - Investimento'
}

/**
 * Tipos de análise técnica realizados durante a tramitação.
 */
export enum AnalysisType {
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Parecer Jurídico',
  BUDGET_RESERVE = 'Reserva Orçamentária',
  PAYMENT_PROC = 'Processamento de Pagamento',
  FINAL_APPROVAL = 'Aprovação Final',
  DOC_COMPLEMENT = 'Complementação Documental'
}

/**
 * Configuração de cada setor que compõe o fluxo de trabalho.
 */
export interface SectorConfig {
  id: string;
  name: string;
  defaultSlaDays: number; // Prazo padrão em dias para este setor
  analysisType: AnalysisType;
}

/**
 * Estrutura do Tenant (Inquilino) para arquitetura SaaS multi-órgãos.
 */
export interface Tenant {
  id: string;
  name: string;
  code: string;
  active: boolean;
  quota: number; // Limite contratual de processos
}

/**
 * Resultado da análise preditiva gerada por Inteligência Artificial (Gemini).
 */
export interface AIAnalysisResult {
  summary: string;           // Resumo executivo da IA
  bottleneck: string;        // Identificação de gargalos
  recommendation: string;    // Sugestão de ação imediata
  riskScore: number;         // Pontuação de risco (0-100)
  completionProbability: number; // Probabilidade de sucesso (0-1)
}

/**
 * Estados possíveis de um processo no fluxo de vida.
 */
export enum Status {
  IN_PROGRESS = 'Em Tramitação',
  DILIGENCE = 'Em Diligência',
  REJECTED = 'Rejeitado',
  CONCLUDED = 'Liquidado / Pago',
  ARCHIVED = 'Arquivado',
  CONSOLIDATION = 'Em Consolidação',
  FORWARDING = 'Encaminhado'
}

/**
 * Registro de movimentação (trâmite) entre setores.
 */
export interface AmendmentMovement {
  id: string;
  amendmentId: string;
  fromSector: string | null;
  toSector: string;
  dateIn: string;
  dateOut: string | null;
  deadline: string;        // Data limite baseada no SLA
  daysSpent: number;
  handledBy: string;       // Nome do operador responsável
  remarks?: string;        // Despacho ou observações
  analysisType?: AnalysisType;
}

/**
 * Entidade principal: O Processo/Emenda Parlamentar.
 */
export interface Amendment {
  id: string;
  tenantId: string; // Chave de isolamento SaaS
  code: string;     // Código interno (ex: EM-2025-001)
  seiNumber: string; // Número do processo no SEI
  year: number;
  type: AmendmentType;
  deputyName?: string;
  municipality: string;
  object: string;   // Descrição da finalidade do recurso
  value: number;
  status: Status;
  currentSector: string;
  movements: AmendmentMovement[];
  suinfra?: boolean; // Flag para setor de Infraestrutura
  sutis?: boolean;   // Flag para setor de Tecnologia
  transferMode?: TransferMode;
  gnd?: GNDType;
  createdAt: string;
  aiInsights?: AIAnalysisResult; // Cache da análise de IA
  entryDate?: string;
  healthUnit?: string;
  institutionName?: string;
  notes?: string;
}

/**
 * Perfil do Usuário autenticado no sistema.
 */
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

/**
 * Tipos de ações registradas na trilha de auditoria imutável.
 */
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

/**
 * Níveis de severidade para monitoramento de eventos.
 */
export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL';

/**
 * Registro individual da trilha de auditoria (Compliance).
 */
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
