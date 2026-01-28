import { Amendment, Role, Sector, Status, User, AuditLog, AuditAction, AmendmentType } from './types';

export const APP_NAME = "Rastreio de Emendas";
export const DEPARTMENT = "Gerência de Suporte Administrativo - GESA/SUBIPEI";

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Carlos Silva',
    email: 'carlos.silva@saude.go.gov.br',
    role: Role.ADMIN,
    department: Sector.SECRETARY,
    avatarUrl: 'https://picsum.photos/100/100',
    password: '123'
  },
  {
    id: 'u2',
    name: 'Mariana Costa',
    email: 'mariana.costa@saude.go.gov.br',
    role: Role.OPERATOR,
    department: Sector.PROTOCOL,
    avatarUrl: 'https://picsum.photos/101/101',
    password: '123'
  }
];

export const MOCK_AMENDMENTS: Amendment[] = [];

// Lista abrangente de Municípios de Goiás
export const GOIAS_CITIES = [
  "Abadia de Goiás", "Abadiânia", "Acreúna", "Adelândia", "Água Fria de Goiás", "Água Limpa", "Águas Lindas de Goiás", "Alexânia", "Aloândia", "Alto Horizonte", "Alto Paraíso de Goiás", "Alvorada do Norte", "Amaralina", "Americano do Brasil", "Amorinópolis", "Anápolis", "Anhanguera", "Anicuns", "Aparecida de Goiânia", "Aparecida do Rio Doce", "Aporé", "Araçu", "Aragarças", "Aragoiânia", "Araguapaz", "Arenópolis", "Aruanã", "Aurilândia", "Avelinópolis", "Baliza", "Barro Alto", "Bela Vista de Goiás", "Bom Jardim de Goiás", "Bom Jesus de Goiás", "Bonfinópolis", "Bonópolis", "Brazabrantes", "Britânia", "Buriti Alegre", "Buriti de Goiás", "Buritinópolis", "Cabeceiras", "Cachoeira Alta", "Cachoeira de Goiás", "Cachoeira Dourada", "Caçu", "Caiapônia", "Caldas Novas", "Caldazinha", "Campestre de Goiás", "Campinaçu", "Campinorte", "Campo Alegre de Goiás", "Campo Limpo de Goiás", "Campos Belos", "Campos Verdes", "Carmo do Rio Verde", "Castelândia", "Catalão", "Caturaí", "Cavalcante", "Ceres", "Cezarina", "Chapadão do Céu", "Cidade Ocidental", "Cocalzinho de Goiás", "Colinas do Sul", "Córrego do Ouro", "Corumbá de Goiás", "Corumbaíba", "Cristalina", "Cristianópolis", "Crixás", "Cromínia", "Cumari", "Damianópolis", "Damolândia", "Davinópolis", "Diorama", "Doverlândia", "Edealina", "Edéia", "Estrela do Norte", "Faina", "Fazenda Nova", "Firminópolis", "Flores de Goiás", "Formosa", "Formoso", "Gameleira de Goiás", "Goianápolis", "Goiandira", "Goianésia", "Goiânia", "Goianira", "Goiás", "Goiatuba", "Gouvelândia", "Guapó", "Guaraíta", "Guarani de Goiás", "Guarinos", "Heitoraí", "Hidrolândia", "Hidrolina", "Iaciara", "Inaciolândia", "Indiara", "Inhumas", "Ipameri", "Ipiranga de Goiás", "Iporá", "Israelândia", "Itaberaí", "Itaguari", "Itaguaru", "Itajá", "Itapaci", "Itapirapuã", "Itapuranga", "Itarumã", "Itauçu", "Itumbiara", "Ivolândia", "Jandaia", "Jaraguá", "Jataí", "Jaupaci", "Jesúpolis", "Joviânia", "Jussara", "Lagoa Santa", "Leopoldo de Bulhões", "Luziânia", "Mairipotaba", "Mambaí", "Mara Rosa", "Marzagão", "Matrinchã", "Maurilândia", "Mimoso de Goiás", "Minaçu", "Mineiros", "Moiporá", "Monte Alegre de Goiás", "Montes Claros de Goiás", "Montividiu", "Montividiu do Norte", "Morrinhos", "Morro Agudo de Goiás", "Mossâmedes", "Mozarlândia", "Mundo Novo", "Mutunópolis", "Nazário", "Nerópolis", "Niquelândia", "Nova América", "Nova Aurora", "Nova Crixás", "Nova Glória", "Nova Iguaçu de Goiás", "Nova Roma", "Nova Veneza", "Novo Brasil", "Novo Gama", "Novo Planalto", "Orizona", "Ouro Verde de Goiás", "Ouvidor", "Padre Bernardo", "Palestina de Goiás", "Palmeiras de Goiás", "Palmelo", "Palminópolis", "Panamá", "Paranaiguara", "Paraúna", "Perolândia", "Petrolina de Goiás", "Pilar de Goiás", "Piracanjuba", "Piranhas", "Pirenópolis", "Pires do Rio", "Planaltina", "Pontalina", "Porangatu", "Porteirão", "Portelândia", "Posse", "Professor Jamil", "Quirinópolis", "Rialma", "Rianápolis", "Rio Quente", "Rio Verde", "Rubiataba", "Sanclerlândia", "Santa Bárbara de Goiás", "Santa Cruz de Goiás", "Santa Fé de Goiás", "Santa Helena de Goiás", "Santa Isabel", "Santa Rita do Araguaia", "Santa Rita do Novo Destino", "Santa Rosa de Goiás", "Santa Tereza de Goiás", "Santa Terezinha de Goiás", "Santo Antônio da Barra", "Santo Antônio de Goiás", "Santo Antônio do Descoberto", "São Domingos", "São Francisco de Goiás", "São João d'Aliança", "São João da Paraúna", "São Luís de Montes Claros", "São Luíz do Norte", "São Miguel do Araguaia", "São Miguel do Passa Quatro", "São Patrício", "São Simão", "Senador Canedo", "Serranópolis", "Silvânia", "Simolândia", "Sítio d'Abadia", "Taquaral de Goiás", "Teresina de Goiás", "Terezópolis de Goiás", "Três Ranchos", "Trindade", "Trombas", "Turvânia", "Turvelândia", "Uirapuru", "Uruaçu", "Uruana", "Urutaí", "Valparaíso de Goiás", "Varjão", "Vianópolis", "Vicentinópolis", "Vila Boa", "Vila Propício"
];

// Lista de Deputados Estaduais ALEGO - 20ª Legislatura (Incluindo Suplentes que assumiram)
export const GOIAS_DEPUTIES = [
  "Alessandro Moreira", "Amauri Ribeiro", "Amilton Filho", "Anderson Teodoro", "Antônio Gomide",
  "Bia de Lima", "Bruno Peixoto", "Cairo Salim", "Charles Bento", "Clécio Alves",
  "Coronel Adailton", "Cristiano Galindo", "Cristóvão Tormin", "Delegado Eduardo Prado",
  "Dr. George Morais", "Dra. Zélia", "Fred Rodrigues", "Gugu Nader", "Heli de Oliveira",
  "Issy Quinan", "Jamil Calife", "José Machado", "Karlos Cabral", "Lineu Olímpio",
  "Lucas Calil", "Lucas do Vale", "Major Araújo", "Mauro Rubem", "Paulo Cezar Martins",
  "Quirino", "Renato de Castro", "Ricardo Quirino", "Rosângela Rezende", "Talles Barreto",
  "Thiago Albernaz", "Urubatan Lopes", "Virmondes Cruvinel", "Vivian Naves", "Wagner Neto",
  "Wilde Cambão", "Zander Fábio",
  // Suplentes e outros que assumiram ou são relevantes no fluxo de emendas
  "Suplente - Cristóvão Tormin (Assumiu)",
  "Suplente - Fabrício Rosa",
  "Suplente - Luiz Sampaio",
  "Suplente - Max Menezes",
  "Suplente - Thiago Albernaz (Assumiu)",
  "Governo de Goiás (Cota Gabinete)"
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'l1',
    actorId: 'u1',
    actorName: 'Carlos Silva',
    action: AuditAction.LOGIN,
    targetResource: 'Sistema',
    details: 'Login bem-sucedido via Microsoft SSO',
    timestamp: new Date().toISOString(),
    ipAddress: '10.15.100.24'
  }
];