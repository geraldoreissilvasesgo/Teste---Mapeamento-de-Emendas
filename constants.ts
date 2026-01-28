
import { Role, Sector, Status, User, AuditLog, AuditAction, SectorConfig, AnalysisType, AmendmentType, TransferMode } from './types';

export const APP_NAME = "Rastreio de Emendas";
export const DEPARTMENT = "Gerência de Suporte Administrativo - GESA/SUBIPEI";

export const DEFAULT_SECTOR_CONFIGS: SectorConfig[] = [
  { id: 's1', name: 'Protocolo', defaultSlaDays: 2, analysisType: AnalysisType.TECHNICAL },
  { id: 's2', name: 'Gerência de Orçamento', defaultSlaDays: 5, analysisType: AnalysisType.BUDGET_RESERVE },
  { id: 's3', name: 'Análise Técnica', defaultSlaDays: 10, analysisType: AnalysisType.TECHNICAL },
  { id: 's4', name: 'Jurídico', defaultSlaDays: 15, analysisType: AnalysisType.LEGAL },
  { id: 's5', name: 'Gabinete', defaultSlaDays: 3, analysisType: AnalysisType.FINAL_APPROVAL },
  { id: 's6', name: 'Pagamento', defaultSlaDays: 7, analysisType: AnalysisType.PAYMENT_PROC }
];

export const GOIAS_CITIES = [
  "Abadia de Goiás", "Anápolis", "Aparecida de Goiânia", "Catalão", "Formosa", "Goiânia", "Goianésia", "Itumbiara", "Jataí", "Luziânia", "Rio Verde", "Trindade"
];

export const GOIAS_DEPUTIES = [
  "Bruno Peixoto", "Antônio Gomide", "Virmondes Cruvinel", "Lucas do Vale", "Lineu Olímpio", "Governo de Goiás (Direto)"
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Carlos Silva', email: 'admin@saude.go.gov.br', role: Role.ADMIN, avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0d457a&color=fff' },
  { id: 'u2', name: 'Mariana Costa', email: 'operador@saude.go.gov.br', role: Role.OPERATOR, avatarUrl: 'https://ui-avatars.com/api/?name=Mariana+Costa&background=0d457a&color=fff' }
];

export const MOCK_AMENDMENTS: any[] = [
  {
    id: 'a1',
    code: 'EM-2025-0001',
    year: 2025,
    type: AmendmentType.IMPOSITIVA,
    seiNumber: '202500042000001',
    value: 500000,
    municipality: 'Anápolis',
    deputyName: 'Bruno Peixoto',
    object: 'Aquisição de ambulância tipo B e equipamentos hospitalares',
    status: Status.PROCESSING,
    currentSector: 'Protocolo',
    healthUnit: 'Hospital Municipal de Anápolis',
    entryDate: '2025-02-24',
    suinfra: false,
    sutis: false,
    createdAt: '2025-02-24T08:00:00Z',
    movements: [
      {
        id: 'm1',
        amendmentId: 'a1',
        fromSector: null,
        toSector: 'Protocolo',
        dateIn: '2025-02-24T08:00:00Z',
        dateOut: null,
        deadline: '2025-02-26T08:00:00Z',
        daysSpent: 0,
        handledBy: 'Protocolo Central SES'
      }
    ]
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'l1',
    actorId: 'u1',
    actorName: 'Carlos Silva',
    action: AuditAction.LOGIN,
    targetResource: 'Autenticação',
    details: 'Login efetuado com sucesso via SSO Institucional.',
    timestamp: new Date().toISOString(),
    ipAddress: '10.20.30.44'
  }
];
