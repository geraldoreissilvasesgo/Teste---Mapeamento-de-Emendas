/**
 * DICIONÁRIO DE DADOS - GESA/SUBIPEI
 * 
 * Este arquivo é o coração da modelagem de dados do sistema. Ele centraliza todas as
 * definições de tipos, enums e interfaces. Manter este arquivo bem documentado
 * e coeso é crucial, pois qualquer alteração aqui impacta a aplicação inteira.
 * Ele serve como uma fonte única da verdade para a estrutura de todas as entidades
 * de negócio.
 */

/**
 * Define o ambiente de execução do sistema.
 * Utilizado para alternar lógicas ou visuais específicos entre desenvolvimento e produção.
 */
export enum SystemMode {
  TEST = 'Teste/Simulação',
  PRODUCTION = 'Produção/Real'
}

/**
 * Perfis de Acesso (RBAC - Role Based Access Control).
 * Define as permissões de cada tipo de usuário no sistema.
 */
export enum Role {
  ADMIN = 'Administrador',       // Acesso total (CRUD + Auditoria + Segurança)
  OPERATOR = 'Operador GESA',    // Acesso operacional (Tramitação + Edição)
  AUDITOR = 'Auditor Fiscal',    // Apenas leitura (Visualização + Logs)
  VIEWER = 'Consultor Externo'   // Apenas visualização básica
}

/**
 * Tipologia das Emendas Parlamentares e Recursos do Executivo.
 * Classifica a origem e a natureza dos recursos financeiros dos processos.
 */
export enum AmendmentType {
  IMPOSITIVA = 'Emenda Impositiva',          // Obrigatórias por lei, de origem parlamentar.
  GOIAS_CRESCIMENTO = 'Goiás em Crescimento', // Programa de investimentos do poder Executivo.
  ESPECIAL = 'Emenda Especial'               // Transferência direta para municípios sem destinação específica.
}

/**
 * Modalidade de Transferência do Recurso.
 * Descreve como o recurso financeiro será repassado ao beneficiário.
 */
export enum TransferMode {
  FUNDO_A_FUNDO = 'Fundo a Fundo', // Transferência entre fundos (ex: Saúde, Educação).
  CONVENIO = 'Convênio / Repasse', // Acordo formal com plano de trabalho.
  DIRETA = 'Execução Direta'       // O próprio órgão estadual executa a despesa.
}

/**
 * Grupo de Natureza de Despesa (GND).
 * Classificação orçamentária para a aplicação do recurso.
 */
export enum GNDType {
  CUSTEIO = '3 - Custeio',       // Despesas de manutenção (pessoal, material de consumo).
  INVESTIMENTO = '4 - Investimento' // Despesas de capital (obras, equipamentos).
}

/**

 * Interface para Notificações do Sistema.
 * Usada para exibir alertas e mensagens importantes no cabeçalho da aplicação.
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'alert' | 'critical';
}

/**
 * Estrutura de resposta da IA (Gemini).
 * Define o formato esperado do JSON retornado pela análise preditiva.
 */
export interface AIAnalysisResult {
  summary: string;        // Resumo do trâmite
  bottleneck: string;     // Gargalo identificado
  recommendation: string; // Sugestão de ação
}

/**
 * Tipos de Análise Técnica realizada pelos setores.
 * Classifica a natureza do trabalho executado em cada etapa do fluxo.
 */
export enum AnalysisType {
  TECHNICAL = 'Análise Técnica',
  LEGAL = 'Análise Jurídica',
  DOC_COMPLEMENT = 'Complementação de Documentação',
  BUDGET_RESERVE = 'Reserva Orçamentária',
  PAYMENT_PROC = 'Processamento de Pagamento',
  FINAL_APPROVAL = 'Homologação Final',
  INACTIVATION = 'Inativação de Registro'
}

/**
 * Setores padrão do sistema.
 * Lista de setores principais para garantir o funcionamento básico.
 * Em produção, a gestão é feita dinamicamente via `SectorConfig`.
 */
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

/**
 * Configuração dinâmica de setores.
 * Permite que administradores cadastrem novos setores e suas regras de negócio.
 */
export interface SectorConfig {
  id: string;
  name: string;
  defaultSlaDays: number;     // Tempo limite padrão para este setor (SLA)
  analysisType: AnalysisType; // Tipo de trabalho realizado
}

/**
 * Status do Ciclo de Vida do Processo.
 * Representa a fase atual em que um processo se encontra.
 */
export enum Status {
  IN_PROGRESS = 'Em Tramitação',
  DILIGENCE = 'Em Diligência',    // Pendente de informações ou correções.
  REJECTED = 'Rejeitado',         // Processo indeferido.
  CONCLUDED = 'Liquidado / Pago', // Processo finalizado e pago.
  ARCHIVED = 'Arquivado',         // Processo movido para o arquivo morto.
  CONSOLIDATION = 'Em Consolidação',
  FORWARDING = 'Encaminhado',
}

/**
 * Registro de Movimentação (Histórico de Tramitação).
 * Cada objeto desta interface representa uma etapa no fluxo do processo.
 */
export interface AmendmentMovement {
  id: string;
  amendmentId: string;       // Chave estrangeira para a Emenda.
  fromSector: string | null; // Setor de origem.
  toSector: string;          // Setor de destino.
  dateIn: string;            // Data de entrada no setor (ISO String).
  dateOut: string | null;    // Data de saída (null se ainda estiver lá).
  deadline: string;          // Data limite baseada no SLA.
  daysSpent: number;         // Dias corridos no setor.
  handledBy: string;         // Usuário responsável pela tramitação.
  analysisType?: AnalysisType; // Tipo de análise realizada nesta etapa.
}

/**
 * Entidade Principal: Emenda / Processo.
 * Representa um processo SEI de emenda parlamentar ou recurso do executivo.
 */
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
  
  // Metadados Técnicos para direcionamento de fluxo
  healthUnit?: string;        // Unidade de Saúde (se aplicável)
  suinfra?: boolean;          // Requer análise de engenharia?
  sutis?: boolean;            // Requer análise de TI?
  transferMode?: TransferMode;// Modalidade de repasse
  gnd?: GNDType;              // Grupo de Natureza de Despesa
  
  // Datas de controle
  entryDate?: string;         // Data de criação
  exitDate?: string | null;   // Data de conclusão
  createdAt: string;
  notes?: string;             // Observações gerais
  institutionName?: string;   // Instituição beneficiária (se houver)
}

/**
 * Usuário do Sistema.
 * Representa uma conta de acesso, com suas permissões e dados.
 */
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

/**
 * Ações de Auditoria.
 * Enum para categorizar os eventos registrados no log do sistema.
 */
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

/**
 * Níveis de Severidade de Auditoria.
 * Classifica a criticidade de um evento de log.
 */
export enum AuditSeverity {
  INFO = 'Informativo',     // Evento rotineiro.
  LOW = 'Baixa',            // Evento de baixa importância.
  MEDIUM = 'Média',           // Alteração de dados esperada.
  HIGH = 'Alta',            // Ação sensível (ex: exclusão).
  CRITICAL = 'Crítica'        // Erro de sistema ou falha de segurança.
}

/**
 * Log de Auditoria.
 * Estrutura de um registro de log, contendo todas as informações
 * necessárias para a rastreabilidade das ações no sistema.
 */
export interface AuditLog {
  id: string;
  actorId: string;         // ID do usuário que realizou a ação.
  actorName: string;       // Nome do usuário.
  action: AuditAction;     // Tipo de ação realizada.
  severity: AuditSeverity; // Criticidade do evento.
  targetResource: string;  // Recurso afetado (ex: nº do processo SEI).
  details: string;         // Descrição textual do evento.
  timestamp: string;       // Data e hora do evento (ISO String).
  ipAddress: string;       // Endereço IP de origem da requisição.
  userAgent: string;       // Informações do navegador/cliente.
  payloadBefore?: string; // Snapshot JSON do dado *antes* da mudança.
  payloadAfter?: string;  // Snapshot JSON do dado *depois* da mudança.
}
