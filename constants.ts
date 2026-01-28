
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
    code: 'EM-2025-4421',
    year: 2025,
    type: AmendmentType.IMPOSITIVA,
    seiNumber: '202500042001122',
    value: 450000,
    municipality: 'Anápolis',
    deputyName: 'Bruno Peixoto',
    object: 'Aquisição de equipamentos de Raio-X para UPA Central',
    status: Status.PROCESSING,
    currentSector: 'Análise Técnica',
    healthUnit: 'UPA Anápolis',
    entryDate: '2025-01-10',
    suinfra: false,
    sutis: false,
    createdAt: '2025-01-10T10:00:00Z',
    movements: [
      {
        id: 'm1',
        amendmentId: 'a1',
        fromSector: null,
        toSector: 'Protocolo',
        dateIn: '2025-01-10T10:00:00Z',
        dateOut: '2025-01-11T09:00:00Z',
        deadline: '2025-01-12T10:00:00Z',
        daysSpent: 1,
        handledBy: 'Protocolo Central'
      },
      {
        id: 'm2',
        amendmentId: 'a1',
        fromSector: 'Protocolo',
        toSector: 'Análise Técnica',
        dateIn: '2025-01-11T09:00:00Z',
        dateOut: null,
        deadline: '2025-01-21T09:00:00Z',
        daysSpent: 0,
        handledBy: 'Mariana Costa'
      }
    ]
  },
  {
    id: 'a2',
    code: 'EM-2025-9982',
    year: 2025,
    type: AmendmentType.GOIAS_CRESCIMENTO,
    seiNumber: '202500042009988',
    value: 1200000,
    municipality: 'Goiânia',
    deputyName: 'Governo de Goiás (Direto)',
    object: 'Reforma da Ala de Oncologia do HUGOL',
    status: Status.DILIGENCE,
    currentSector: 'Gerência de Orçamento',
    healthUnit: 'HUGOL',
    entryDate: '2025-01-05',
    suinfra: true,
    sutis: false,
    createdAt: '2025-01-05T14:00:00Z',
    movements: [
      {
        id: 'm3',
        amendmentId: 'a2',
        fromSector: null,
        toSector: 'Gerência de Orçamento',
        dateIn: '2025-01-05T14:00:00Z',
        dateOut: null,
        deadline: '2025-01-10T14:00:00Z',
        daysSpent: 10,
        handledBy: 'Carlos Silva'
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
