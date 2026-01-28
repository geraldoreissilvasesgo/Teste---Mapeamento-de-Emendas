
import { Role, Status, User, AuditLog, AuditAction, SectorConfig, AnalysisType, AmendmentType, AuditSeverity, Amendment, TransferMode, GNDType } from './types';

export const APP_NAME = "Rastreio de Emendas";
export const DEPARTMENT = "Gerência de Suporte Administrativo - GESA/SUBIPEI";

// Lista iniciada vazia conforme solicitação para novo cadastramento manual
export const DEFAULT_SECTOR_CONFIGS: SectorConfig[] = [];

export const GOIAS_CITIES = [
  "Abadia de Goiás", "Abadiânia", "Acreúna", "Adelândia", "Água Fria de Goiás", "Água Limpa", "Águas Lindas de Goiás", 
  "Alexânia", "Aloândia", "Alto Horizonte", "Alto Paraíso de Goiás", "Alvorada do Norte", "Amaralina", "Americano do Brasil", 
  "Amorinópolis", "Anápolis", "Anhanguera", "Anicuns", "Aparecida de Goiânia", "Aparecida do Rio Doc", "Aporé", "Araçu", 
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
  "Gouvelândia", "Guapó", "Guaraíta", "Guarani de Goiás", "Guarani de Goiás", "Guarinos", "Heitoraí", "Hidrolândia", "Hidrolina", "Iaciara", 
  "Inaciolândia", "Indiara", "Inhumas", "Ipameri", "Ipiranga de Goiás", "Iporá", "Israelândia", "Itaberaí", "Itaguari", 
  "Itaguaru", "Itajá", "Itapaci", "Itapirapuã", "Itapuranga", "Itarumã", "Itauçu", "Itumbiara", "Ivolândia", "Jandaia", 
  "Jaraguá", "Jataí", "Jaupaci", "Jesúpolis", "Joviânia", "Jussara", "Lagoa Santa", "Leopoldo de Bulhões", "Luziânia", 
  "Mairipotaba", "Mambaí", "Mara Rosa", "Marzagão", "Maurilândia", "Mimoso de Goiás", "Mineiros", "Moiporá", 
  "Monte Alegre de Goiás", "Montes Claros de Goiás", "Montividiu", "Montividiu do Norte", "Morrinhos", "Morro Agudo de Goiás", 
  "Mossâmedes", "Mozarlândia", "Mundo Novo", "Mutunópolis", "Nazário", "Nerópolis", "Niquelândia", "Nova América", 
  "Nova Aurora", "Nova Crixás", "Nova Glória", "Nova Iguaçu de Goiás", "Nova Roma", "Nova Veneza", "Novo Brasil", 
  "Novo Gama", "Novo Planalto", "Orizona", "Ouro Verde de Goiás", "Ouvidor", "Padre Bernardo", "Palestina de Goiás", 
  "Palmeiras de Goiás", "Palmelo", "Palminópolis", "Panamá", "Paranaiguara", "Paraúna", "Perolândia", "Petrolina de Goiás", 
  "Pilar de Goiás", "Piracanjuba", "Piranhas", "Pirenópolis", "Pires do Rio", "Planaltina", "Pontalina", "Porangatu", 
  "Porteirão", "Portelândia", "Posse", "Professor Jamil", "Quirinópolis", "Rialma", "Rianápolis", "Rio Quente", 
  "Rio Verde", "Rubiataba", "Sanclerlândia", "Santa Bárbara de Goiás", "Santa Cruz de Goiás", "Santa Fé de Goiás", 
  "Santa Helena de Goiás", "Santa Isabel", "Santa Rita do Araguaia", "Santa Rita do Novo Destino", "Santa Rosa de Goiás", 
  "Santa Tereza de Goiás", "Santa Terezinha de Goiás", "Santo Antônio da Barra", "Santo Antônio de Goiás", 
  "Santo Antônio do Descoberto", "São Domingos", "São Francisco de Goiás", "São João d'Aliança", "São João da Paraúna", 
  "São Luís de Montes Belos", "São Luíz do Norte", "São Miguel do Araguaia", "São Miguel do Passa Quatro", 
  "São Patrício", "São Simão", "Senador Canedo", "Serranópolis", "Silvânia", "Simolândia", "Sítio d'Abadia", 
  "Taquaral de Goiás", "Teresina de Goiás", "Terezópolis de Goiás", "Três Ranchos", "Trindade", "Trombas", "Turvânia", 
  "Turvelândia", "Uirapuru", "Uruaçu", "Uruana", "Urutaí", "Valparaíso de Goiás", "Varjão", "Vianópolis", "Vicentinópolis", 
  "Vila Boa", "Vila Propício"
];

export const GOIAS_DEPUTIES = [
  "Adriana Accorsi",
  "Alessandro Moreira",
  "Amilton Filho",
  "Amauri Ribeiro",
  "Anderson Teodoro",
  "Antônio Gomide",
  "Bia de Lima",
  "Bruno Peixoto",
  "Cairo Salim",
  "Charles Bento",
  "Clécio Alves",
  "Cristiano Galindo",
  "Delegado Eduardo Prado",
  "Dra. Zélia",
  "Dr. George Morais",
  "Dr. José Machado",
  "Gugu Nader",
  "Gustavo Sebba",
  "Henrique César",
  "Issy Quinan",
  "Jamil Calife",
  "Karlos Cabral",
  "Lineu Olimpio",
  "Lincoln Tejota",
  "Lucas Calil",
  "Lucas do Vale",
  "Major Araújo",
  "Mauro Rubem",
  "Paulo Cezar Martins",
  "Renato de Castro",
  "Ricardo Quirino",
  "Talles Barreto",
  "Veter Martins",
  "Vívian Naves",
  "Wilde Cambão",
  "Zequinha Conti"
];

export const MOCK_USERS: User[] = [
  { 
    id: 'u-01', 
    name: 'Administrador GESA', 
    email: 'admin@gesa.subipei.go.gov.br', 
    role: Role.ADMIN, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0d457a&color=fff', 
    lgpdAccepted: true 
  },
  { 
    id: 'u-02', 
    name: 'Operador Técnico', 
    email: 'operador@gesa.subipei.go.gov.br', 
    role: Role.OPERATOR, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Operador&background=0d457a&color=fff', 
    lgpdAccepted: true 
  }
];

export const MOCK_AMENDMENTS: Amendment[] = [];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    actorId: 'u-01',
    actorName: 'Administrador GESA',
    action: AuditAction.LOGIN,
    severity: AuditSeverity.INFO,
    targetResource: 'Sessão de Usuário',
    details: 'Login administrativo realizado com sucesso.',
    timestamp: new Date().toISOString(),
    ipAddress: '10.20.15.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
];
