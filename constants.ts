
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
  "Abadia de Goiás", "Abadiânia", "Acreúna", "Adelândia", "Água Fria de Goiás", "Água Limpa", "Águas Lindas de Goiás", 
  "Alexânia", "Aloândia", "Alto Horizonte", "Alto Paraíso de Goiás", "Alvorada do Norte", "Amaralina", "Americano do Brasil", 
  "Amorinópolis", "Anápolis", "Anhanguera", "Anicuns", "Aparecida de Goiânia", "Aparecida do Rio Doce", "Aporé", "Araçu", 
  "Aragarças", "Aragoiânia", "Araguapaz", "Arenópolis", "Aruanã", "Aurilândia", "Avelinópolis", "Baliza", "Barro Alto", 
  "Bela Vista de Goiás", "Bom Jardim de Goiás", "Bom Jesus de Goiás", "Bonfinópolis", "Bonópolis", "Brazabrantes", 
  "Britânia", "Buriti Alegre", "Buriti de Goiás", "Buritinópolis", "Cabeceiras", "Cachoeira Alta", "Cachoeira de Goiás", 
  "Cachoeira Dourada", "Caçu", "Caiapônia", "Caldas Novas", "Caldazinha", "Campestre de Goiás", "Campinaçu", "Campinorte", 
  "Campo Alegre de Goiás", "Campo Limpo de Goiás", "Campos Belos", "Campos Verdes", "Carmo do Rio Verde", "Castelândia", 
  "Catalão", "Caturaí", "Cavalcante", "Ceres", "Cezarina", "Chapadão do Céu", "Cidade Ocidental", "Cocalzinho de Goiás", 
  "Colinas do Sul", "Córrego do Ouro", "Corumbá de Goiás", "Corumbaíba", "Cristalina", "Cristianópolis", "Crixás", 
  "Cromínia", "Cumari", "Damianópolis", "Damolândia", "Davinópolis", "Diorama", "Divinópolis de Goiás", "Doverlândia", 
  "Edealina", "Edéia", "Estrela do Norte", "Faina", "Fazenda Nova", "Firminópolis", "Flores de Goiás", "Formosa", 
  "Formoso", "Gameleira de Goiás", "Goianápolis", "Goiandira", "Goianésia", "Goiânia", "Goianira", "Goiás", "Goiatuba", 
  "Gouvelândia", "Guapó", "Guaraíta", "Guarani de Goiás", "Guarinos", "Heitoraí", "Hidrolândia", "Hidrolina", "Iaciara", 
  "Inaciolândia", "Indiara", "Inhumas", "Ipameri", "Ipiranga de Goiás", "Iporá", "Israelândia", "Itaberaí", "Itaguari", 
  "Itaguaru", "Itajá", "Itapaci", "Itapirapuã", "Itapuranga", "Itarumã", "Itauçu", "Itumbiara", "Ivolândia", "Jandaia", 
  "Jaraguá", "Jataí", "Jaupaci", "Jesúpolis", "Joviânia", "Jussara", "Lagoa Santa", "Leopoldo de Bulhões", "Luziânia", 
  "Mairipotaba", "Mambaí", "Mara Rosa", "Marzagão", "Matrinchã", "Maurilândia", "Mimoso de Goiás", "Minaçu", "Mineiros", 
  "Moiporá", "Monte Alegre de Goiás", "Montes Claros de Goiás", "Montividiu", "Montividiu do Norte", "Morrinhos", 
  "Morro Agudo de Goiás", "Mossâmedes", "Mozarlândia", "Mundo Novo", "Mutunópolis", "Nazário", "Nerópolis", "Niquelândia", 
  "Nova América", "Nova Aurora", "Nova Crixás", "Nova Glória", "Nova Iguaçu de Goiás", "Nova Roma", "Nova Veneza", 
  "Novo Brasil", "Novo Gama", "Novo Planalto", "Orizona", "Ouro Verde de Goiás", "Ouvidor", "Padre Bernardo", 
  "Palestina de Goiás", "Palmeiras de Goiás", "Palmelo", "Palminópolis", "Panamá", "Paranaiguara", "Paraúna", 
  "Perolândia", "Petrolina de Goiás", "Pilar de Goiás", "Piracanjuba", "Piranhas", "Pirenópolis", "Pires do Rio", 
  "Planaltina", "Pontalina", "Porangatu", "Porteirão", "Portelândia", "Posse", "Professor Jamil", "Quirinópolis", 
  "Rialma", "Rianápolis", "Rio Quente", "Rio Verde", "Rubiataba", "Sanclerlândia", "Santa Bárbara de Goiás", 
  "Santa Cruz de Goiás", "Santa Fé de Goiás", "Santa Helena de Goiás", "Santa Isabel", "Santa Rita do Novo Destino", 
  "Santa Rita do Araguaia", "Santa Rosa de Goiás", "Santa Tereza de Goiás", "Santa Terezinha de Goiás", 
  "Santo Antônio da Barra", "Santo Antônio de Goiás", "Santo Antônio do Descoberto", "São Domingos", "São Francisco de Goiás", 
  "São João d'Aliança", "São João da Paraúna", "São Luís de Montes Claros", "São Luíz do Norte", "São Miguel do Araguaia", 
  "São Miguel do Passa Quatro", "São Patrício", "São Simão", "Senador Canedo", "Serranópolis", "Silvânia", "Simolândia", 
  "Sítio d'Abadia", "Taquaral de Goiás", "Teresina de Goiás", "Terezópolis de Goiás", "Três Ranchos", "Trindade", 
  "Turvânia", "Turvelândia", "Uirapuru", "Uruaçu", "Uruana", "Urutaí", "Valparaíso de Goiás", "Varjão", "Vianópolis", 
  "Vicentinópolis", "Vila Boa", "Vila Propício"
];

export const GOIAS_DEPUTIES = [
  "Alessandro Moreira", "Amauri Ribeiro", "Amilton Filho", "Anderson Teodoro", "André do Premium", "Antônio Gomide", 
  "Bia de Lima", "Bruno Peixoto (Presidência)", "Cairo Salim", "Charles Bento", "Clécio Alves", "Coronel Adailton", 
  "Cristiano Galindo", "Cristóvão Tormin", "Delegado Eduardo Prado", "Dr. George Morais", "Dra. Zélia", 
  "Gugu Nader", "Henrique César", "Issy Quinan", "Jamil Calife", "José Machado", "Karlos Cabral", "Lineu Olímpio", 
  "Lucas Calil", "Lucas do Vale", "Mauro Rubem", "Paulo Cezar Martins", "Quirino", "Renato de Castro", 
  "Ricardo Quirino", "Rosângela Rezende", "Talles Barreto", "Thiago Albernaz", "Uebe Rezeck", "Veter Martins", 
  "Virmondes Cruvinel", "Vivian Naves", "Wagner Neto", "Wilde Cambão", "Zeli Fritsche", "Governo de Goiás (Execução Direta)"
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
    deputyName: 'Bruno Peixoto (Presidência)',
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
