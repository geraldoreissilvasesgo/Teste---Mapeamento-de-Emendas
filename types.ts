/**
 * DEFINIÇÕES DE TIPOS E INTERFACES DO SISTEMA
 * Este arquivo centraliza todas as estruturas de dados utilizadas no Rastreio de Emendas.
 */

// Define os papéis (roles) para controle de acesso baseado em funções (RBAC)
export enum Role {
  ADMIN = 'Administrador', // Acesso total ao sistema e auditoria
  OPERATOR = 'Operador SES', // Pode criar e tramitar emendas
  VIEWER = 'Consultor'      // Acesso apenas de leitura para relatórios
}

// Setores da Secretaria de Saúde e Gabinete para o fluxo de tramitação
export enum Sector {
  PROTOCOL = 'Protocolo',
  BUDGET = 'Gerência de Orçamento',
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Jurídico',
  SECRETARY = 'Gabinete',
  PAYMENT = 'Pagamento'
}

// Estados possíveis de uma emenda parlamentar
export enum Status {
  DRAFT = 'Rascunho',
  PROCESSING = 'Em Tramitação',
  APPROVED = 'Aprovada',
  REJECTED = 'Rejeitada',
  PAID = 'Paga',
  
  // Status específicos solicitados para o fluxo de Goiás
  DILIGENCE_SUINFRA = 'Em diligência Suinfra',
  DILIGENCE_SUTIS = 'Em diligência Sutis',
  DILIGENCE_BOTH = 'Em diligência Suinfra / Sutis',
  DILIGENCE_SGI = 'Em diligência SGI',
  CONCLUDED = 'Concluída'
}

// Distinção entre emendas de parlamentares e programas de governo
export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento'
}

// Modalidades de repasse de recursos financeiros
export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio'
}

// Estrutura do usuário autenticado no sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: Sector; // Setor ao qual o operador está vinculado
  avatarUrl?: string;
  password?: string;   // Armazenado para simulação de login
}

// Registro de uma movimentação entre setores (histórico)
export interface Movement {
  id: string;
  amendmentId: string;
  fromSector: Sector | null;
  toSector: Sector;
  dateIn: string;        // Data de entrada no setor (ISO)
  dateOut: string | null; // Data de saída do setor (ISO)
  daysSpent: number;     // Cálculo de tempo de permanência no setor
  notes?: string;
  handledBy: string;     // ID do usuário que realizou a movimentação
}

// Objeto principal: A Emenda Parlamentar / Processo SEI
export interface Amendment {
  id: string;
  code: string;       // Código interno (Ex: EM-2025-XXXX)
  type: AmendmentType; 
  
  seiNumber: string;  // Número do Processo no SEI (Identificador Principal)
  value: number;      // Valor em Reais (R$)
  municipality: string; // Município de Goiás beneficiado
  object: string;     // Descrição do que será adquirido/realizado
  
  transferMode?: TransferMode; 
  institutionName?: string; 

  suinfra: boolean; // Indica se o processo depende da área de obras
  sutis: boolean;   // Indica se depende da área de tecnologia/equipamentos
  
  statusDescription?: string; // Descrição textual vinda de importações
  status: Status;             // Status padronizado do sistema
  
  entryDate?: string; // Data de entrada física/digital no sistema
  exitDate?: string;  // Data de conclusão final do processo
  notes?: string;     // Observações de texto livre

  year: number;        // Ano do exercício financeiro
  deputyName?: string; // Nome do Deputado (ALEGO) ou Suplente
  party: string;
  healthUnit: string;  // Unidade de Saúde destino (Ex: SES-GO)
  currentSector: Sector; // Setor onde o processo se encontra agora
  createdAt: string;
  movements: Movement[]; // Lista cronológica de tramitações
}

// Resultado da análise processada pela IA Gemini
export interface AIAnalysisResult {
  summary: string;     // Resumo da trajetória do processo
  bottleneck: string;  // Identificação de onde o processo parou (gargalo)
  recommendation: string; // Sugestão técnica para destravar o processo
}

// Tipos de ações registradas na Auditoria do Sistema
export enum AuditAction {
  LOGIN = 'LOGIN',
  CREATE = 'CRIAÇÃO',
  UPDATE = 'ATUALIZAÇÃO',
  DELETE = 'EXCLUSÃO',
  MOVE = 'TRAMITAÇÃO',
  APPROVE = 'APROVAÇÃO',
  SECURITY = 'SEGURANÇA'
}

// Registro individual de auditoria (Log)
export interface AuditLog {
  id: string;
  actorId: string;   // Quem fez
  actorName: string; // Nome de quem fez
  action: AuditAction; 
  targetResource: string; // Qual recurso foi afetado (Ex: Número SEI)
  details: string;   // Detalhamento do que foi alterado
  timestamp: string; // Quando ocorreu
  ipAddress: string; // IP de origem (Simulado)
}