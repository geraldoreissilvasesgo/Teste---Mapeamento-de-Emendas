/**
 * DEFINIÇÕES DE TIPOS E INTERFACES DO SISTEMA
 * Este arquivo centraliza todas as estruturas de dados utilizadas no Rastreio de Emendas.
 * A tipagem forte garante consistência e facilita a manutenção do código.
 */

/**
 * Papéis de Usuário (RBAC)
 * Define os níveis de acesso para garantir a segurança da informação.
 */
export enum Role {
  ADMIN = 'Administrador', // Acesso total, incluindo auditoria e gestão de usuários
  OPERATOR = 'Operador SES', // Pode criar, editar e tramitar processos SEI
  VIEWER = 'Consultor'      // Acesso apenas de leitura para relatórios e consulta
}

/**
 * Setores da SES-GO (Tramitação)
 * Representa os departamentos por onde o processo administrativo circula.
 */
export enum Sector {
  PROTOCOL = 'Protocolo',
  BUDGET = 'Gerência de Orçamento',
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Jurídico',
  SECRETARY = 'Gabinete',
  PAYMENT = 'Pagamento'
}

/**
 * Estados da Emenda (Status)
 * Reflete a situação atual do processo no fluxo administrativo.
 */
export enum Status {
  DRAFT = 'Rascunho',
  PROCESSING = 'Em Tramitação',
  APPROVED = 'Aprovada',
  REJECTED = 'Rejeitada',
  PAID = 'Paga',
  DILIGENCE_SUINFRA = 'Em diligência Suinfra', // Pendência em obras/infraestrutura
  DILIGENCE_SUTIS = 'Em diligência Sutis',     // Pendência em tecnologia/equipamentos
  DILIGENCE_BOTH = 'Em diligência Suinfra / Sutis',
  DILIGENCE_SGI = 'Em diligência SGI',         // Pendência no sistema de gestão
  CONCLUDED = 'Concluída'
}

/**
 * Categorias de Emenda
 */
export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva', // Origem ALEGO
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento' // Programa do Executivo
}

/**
 * Formas de Repasse Financeiro
 */
export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo', // Repasse direto SES para Fundo Municipal
  CONVENIO = 'Convênio'            // Instrumento jurídico específico
}

/**
 * Dados do Usuário do Sistema
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: Sector;
  avatarUrl?: string;
  password?: string; // Utilizado apenas para simulação de login
}

/**
 * Registro de Movimentação (Tramitação)
 * Armazena o histórico de entrada e saída de cada setor.
 */
export interface Movement {
  id: string;
  amendmentId: string;
  fromSector: Sector | null;
  toSector: Sector;
  dateIn: string;        // ISO format
  dateOut: string | null; // ISO format
  daysSpent: number;     // Cálculo automático de permanência
  notes?: string;
  handledBy: string;     // Nome/ID do operador responsável
}

/**
 * Estrutura Principal da Emenda / Processo SEI
 */
export interface Amendment {
  id: string;
  code: string;       // Código interno (Ex: EM-2025-XXXXX)
  type: AmendmentType; 
  seiNumber: string;  // Número do Processo no SEI (Chave de busca principal)
  value: number;      // Valor em Reais (R$)
  municipality: string; // Município de Goiás beneficiado
  object: string;     // Objeto da emenda (Ex: Ambulância, Custeio)
  transferMode?: TransferMode; 
  institutionName?: string; 
  suinfra: boolean; // Requer análise da área de obras
  sutis: boolean;   // Requer análise da área de tecnologia
  statusDescription?: string; 
  status: Status;             
  entryDate?: string; 
  exitDate?: string;  
  notes?: string;     
  year: number;        // Ano do exercício (Exercício Financeiro)
  deputyName?: string; // Nome do Parlamentar (Titular ou Suplente)
  party: string;
  healthUnit: string;  
  currentSector: Sector; 
  createdAt: string;
  movements: Movement[]; 
}

/**
 * Resultado da Inteligência Artificial Gemini
 */
export interface AIAnalysisResult {
  summary: string;     // Resumo do percurso
  bottleneck: string;  // Identificação de onde o processo parou
  recommendation: string; // Sugestão para destravar o fluxo
}

/**
 * Tipos de Log de Auditoria
 */
export enum AuditAction {
  LOGIN = 'LOGIN',
  CREATE = 'CRIAÇÃO',
  UPDATE = 'ATUALIZAÇÃO',
  DELETE = 'EXCLUSÃO',
  MOVE = 'TRAMITAÇÃO',
  APPROVE = 'APROVAÇÃO',
  SECURITY = 'SEGURANÇA'
}

/**
 * Registro individual de auditoria
 */
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