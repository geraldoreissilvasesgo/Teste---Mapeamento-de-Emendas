

/**
 * DICIONÁRIO DE DADOS - GESA/SUBIPEI
 * Este arquivo centraliza todas as definições de tipos, enums e interfaces
 * utilizados em toda a aplicação. Alterações aqui impactam todo o sistema.
 */

// Define o ambiente de execução do sistema
export enum SystemMode {
  TEST = 'Teste/Simulação',
  PRODUCTION = 'Produção/Real'
}

// Perfis de Acesso (RBAC - Role Based Access Control)
export enum Role {
  ADMIN = 'Administrador',       // Acesso total (CRUD + Auditoria + Segurança)
  OPERATOR = 'Operador GESA',    // Acesso operacional (Tramitação + Edição)
  AUDITOR = 'Auditor Fiscal',    // Apenas leitura (Visualização + Logs)
  VIEWER = 'Consultor Externo'   // Apenas visualização básica
}

// Tipologia das Emendas Parlamentares e Recursos
export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',          // Obrigatórias
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento', // Programa do Executivo
  ESPECIAL = 'Emenda Especial'               // Transferência Especial
}

// Modalidade de Transferência do Recurso
export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo',
  CONVENIO = 'Convênio / Repasse',
  DIRETA = 'Execução Direta'
}

// Grupo de Natureza de Despesa
export enum GNDType {
  CUSTEIO = '3 - Custeio',       // Manutenção, serviços, material de consumo
  INVESTIMENTO = '4 - Investimento' // Obras, equipamentos, material permanente
}

// Interface para Notificações do Sistema (Alertas no Header)
export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'alert' | 'critical';
}

// Estrutura de resposta da IA (Gemini)
export interface AIAnalysisResult {
  summary: string;        // Resumo do trâmite
  bottleneck: string;     // Gargalo identificado
  recommendation: string; // Sugestão de ação
}

// Tipos de Análise Técnica realizada pelos setores
export enum AnalysisType {
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Análise Jurídica',
  DOC_COMPLEMENT = 'Complementação de Documentação',
  BUDGET_RESERVE = 'Reserva Orçamentária',
  PAYMENT_PROC = 'Processamento de Pagamento',
  FINAL_APPROVAL = 'Homologação Final',
  INACTIVATION = 'Inativação de Registro'
}

// Setores padrão do sistema (Hardcoded para fallback)
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

// Configuração dinâmica de setores (gerenciado no SectorManagement)
export interface SectorConfig {
  id: string;
  name: string;
  defaultSlaDays: number;     // Tempo limite padrão para este setor (SLA)
  analysisType: AnalysisType; // Tipo de trabalho realizado
}

// Status do Ciclo de Vida do Processo (Refatorado para Produção)
export enum Status {
  IN_PROGRESS = 'Em Tramitação',
  DILIGENCE = 'Em Diligência',
  REJECTED = 'Rejeitado',
  CONCLUDED = 'Liquidado / Pago',
  ARCHIVED = 'Arquivado',
  // Fix: Added missing status values to align with component logic.
  CONSOLIDATION = 'Em Consolidação',
  FORWARDING = 'Encaminhado',
}

// Registro de Movimentação (Histórico de Tramitação)
export interface AmendmentMovement {
  id: string;
  amendmentId: string;
  fromSector: string | null; // Origem
  toSector: string;          // Destino
  dateIn: string;            // Data de entrada no setor (ISO String)
  dateOut: string | null;    // Data de saída (null se ainda estiver lá)
  deadline: string;          // Data limite baseada no SLA
  daysSpent: number;         // Dias corridos no setor
  handledBy: string;         // Usuário responsável pela tramitação
  analysisType?: AnalysisType; // Tipo de análise realizada
}

// Entidade Principal: Emenda / Processo
export interface Amendment {
  id: string;
  code: string;               // Código Interno (Ex: EM-2025-001)
  seiNumber: string;          // Número do Processo SEI (Chave de Negócio)
  year: number;               // Exercício Financeiro
  type: AmendmentType;        // Fonte do Recurso
  deputyName?: string;        // Autor (Parlamentar) ou Governo
  municipality: string;       // Beneficiário
  object: string;             // Descrição do Objeto
  value: number;              // Valor Financeiro
  status: Status;             // Estado Atual
  statusDescription?: string; // Descrição textual do status (importação)
  currentSector: string;      // Localização Atual
  movements: AmendmentMovement[]; // Histórico de Movimentações
  
  // Metadados Técnicos
  healthUnit?: string;        // Unidade de Saúde (se aplicável)
  suinfra?: boolean;          // Requer análise de engenharia?
  sutis?: boolean;            // Requer análise de TI?
  transferMode?: TransferMode;// Modalidade de repasse
  gnd?: GNDType;              // Grupo de Natureza de Despesa
  
  entryDate?: string;         // Data de criação
  exitDate?: string | null;   // Data de conclusão
  createdAt: string;
  notes?: string;             // Observações gerais
  institutionName?: string;   // Instituição beneficiária (se houver)
}

// Usuário do Sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  lgpdAccepted: boolean;      // Flag de aceite do termo de privacidade
  mfaEnabled?: boolean;       // Se requer autenticação de dois fatores
  department?: string;        // Departamento de lotação
  password?: string;          // (Apenas frontend - não persistido em prod idealmente)
}

// Ações de Auditoria
export enum AuditAction {
  LOGIN = 'Login / Acesso',
  CREATE = 'Criação de Registro',
  UPDATE = 'Atualização de Dados',
  DELETE = 'Exclusão / Inativação',
  MOVE = 'Tramitação de Processo',
  LGPD_CONSENT = 'Consentimento LGPD',
  SECURITY = 'Segurança / Acessos',
  ERROR = 'Erro do Sistema'
}

// Níveis de Severidade de Auditoria
export enum AuditSeverity {
  INFO = 'Informativo',
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

// Log de Auditoria
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  severity: AuditSeverity;
  targetResource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  payloadBefore?: string; // Snapshot JSON antes da mudança
  payloadAfter?: string;  // Snapshot JSON depois da mudança
}