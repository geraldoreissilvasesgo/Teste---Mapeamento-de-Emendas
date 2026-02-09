
import { 
  Amendment, AmendmentType, TransferMode, GNDType, 
  SectorConfig, Role, User, Status 
} from './types';

export const APP_VERSION = '2.9.7-stable';

export const GOIAS_DEPUTIES = [
  'Adailton, Coronel',
  'Alessandro Moreira',
  'Amilton Filho',
  'Anderson Teodoro',
  'André do Premium',
  'Antônio Gomide',
  'Bia de Lima',
  'Bruno Peixoto',
  'Cairo Salim',
  'Charles Bento',
  'Cristiano Galindo',
  'Cristóvão Tormin',
  'Delegado Eduardo Prado',
  'Doutora Zélia',
  'Dr. George Morais',
  'Drake Batista',
  'Fred Rodrigues',
  'Gugu Nader',
  'Henrique César',
  'Issy Quinan',
  'Jamil Calife',
  'José Machado',
  'Karlos Cabral',
  'Lineu Olimpio',
  'Lucas Calil',
  'Lucas do Vale',
  'Major Araújo',
  'Mauro Rubem',
  'Paulo Cezar Martins',
  'Renato de Castro',
  'Ricardo Quirino',
  'Rosângela Rezende',
  'Talles Barreto',
  'Thiago Albernaz',
  'Virmondes Cruvinel',
  'Vitor Hugo',
  'Vivian Naves',
  'Wagner Neto',
  'Wilde Cambão',
  'Zito do Prato',
  'Executivo Estadual'
].sort();

export const GOIAS_CITIES = [
  'Abadia de Goiás', 'Abadiânia', 'Acreúna', 'Adelândia', 'Águas Lindas de Goiás', 
  'Alexânia', 'Aloândia', 'Alto Paraíso de Goiás', 'Alvorada do Norte', 'Amaralina', 
  'Anápolis', 'Aparecida de Goiânia', 'Aparecida do Rio Doces', 'Aporé', 'Araçu', 
  'Aragarças', 'Aragoiânia', 'Araguapaz', 'Arenópolis', 'Aruanã', 'Aurilândia', 
  'Avelinópolis', 'Baliza', 'Barro Alto', 'Bela Vista de Goiás', 'Bom Jardim de Goiás', 
  'Bom Jesus de Goiás', 'Bonfinópolis', 'Bonópolis', 'Brazabrantes', 'Britânia', 
  'Buriti Alegre', 'Buriti de Goiás', 'Buritinuópolis', 'Cabeceiras', 'Cachoeira Alta', 
  'Cachoeira de Goiás', 'Cachoeira Dourada', 'Caçu', 'Caiapônia', 'Caldas Novas', 
  'Caldazinha', 'Campestre de Goiás', 'Campinaçu', 'Campinorte', 'Campo Alegre de Goiás', 
  'Campo Limpo de Goiás', 'Campos Belos', 'Campos Verdes', 'Carmo do Rio Verde', 
  'Castelândia', 'Catalão', 'Caturaí', 'Cavalcante', 'Ceres', 'Cezarina', 'Chapadão do Céu', 
  'Cidade Ocidental', 'Cocalzinho de Goiás', 'Colinas do Sul', 'Córrego do Ouro', 
  'Corumbá de Goiás', 'Corumbaíba', 'Cristalina', 'Cristianópolis', 'Crixás', 'Cromínia', 
  'Cumari', 'Damianópolis', 'Damolândia', 'Davinópolis', 'Diorama', 'Doverlândia', 
  'Edealina', 'Edéia', 'Estrela do Norte', 'Faina', 'Fazenda Nova', 'Firminópolis', 
  'Flores de Goiás', 'Formosa', 'Formoso', 'Gameleira de Goiás', 'Goianápolis', 
  'Goiandira', 'Goianésia', 'Goiânia', 'Goianira', 'Goiás', 'Goiatuba', 'Gouvelândia', 
  'Guapó', 'Guaraíta', 'Guarani de Goiás', 'Guarinos', 'Heitoraí', 'Hidrolândia', 
  'Hidrolina', 'Iaciara', 'Inaciolândia', 'Indiara', 'Inhumas', 'Ipameri', 'Ipiranga de Goiás', 
  'Iporá', 'Israelândia', 'Itaberaí', 'Itaguari', 'Itaguaru', 'Itajá', 'Itapaci', 'Itapirapuã', 
  'Itapuranga', 'Itarumã', 'Itauçu', 'Itumbiara', 'Ivolândia', 'Jandaia', 'Jaraguá', 'Jataí', 
  'Jaupaci', 'Jesúpolis', 'Joviânia', 'Jussara', 'Lagoa Santa', 'Leopoldo de Bulhões', 
  'Luziânia', 'Mairipotaba', 'Mambaí', 'Mara Rosa', 'Marzagão', 'Matrinchã', 'Maurilândia', 
  'Mimoso de Goiás', 'Minaçu', 'Mineiros', 'Moiporá', 'Monte Alegre de Goiás', 
  'Montes Claros de Goiás', 'Montividiu', 'Montividiu do Norte', 'Morrinhos', 
  'Morro Agudo de Goiás', 'Mossâmedes', 'Mozarlândia', 'Mundo Novo', 'Mutunópolis', 
  'Nazário', 'Nerópolis', 'Niquelândia', 'Nova América', 'Nova Aurora', 'Nova Crixás', 
  'Nova Glória', 'Nova Iguaçu de Goiás', 'Nova Roma', 'Nova Veneza', 'Novo Brasil', 
  'Novo Gama', 'Novo Planalto', 'Orizona', 'Ouro Verde de Goiás', 'Ouvidor', 'Padre Bernardo', 
  'Palestina de Goiás', 'Palmeiras de Goiás', 'Palmelo', 'Palminópolis', 'Panamá', 
  'Paranaiguara', 'Paraúna', 'Perolândia', 'Petrolina de Goiás', 'Pilar de Goiás', 
  'Piracanjuba', 'Piranhas', 'Pirenópolis', 'Pires do Rio', 'Planaltina', 'Pontalina', 
  'Porangatu', 'Porteirão', 'Portelândia', 'Posse', 'Professor Jamil', 'Quirinópolis', 
  'Rialma', 'Rianápolis', 'Rio Quente', 'Rio Verde', 'Rubiataba', 'Sanclerlândia', 
  'Santa Bárbara de Goiás', 'Santa Cruz de Goiás', 'Santa Helena de Goiás', 
  'Santa Isabel', 'Santa Rita do Araguaia', 'Santa Rita do Novo Destino', 'Santa Rosa de Goiás', 
  'Santa Tereza de Goiás', 'Santa Terezinha de Goiás', 'Santo Antônio da Barra', 
  'Santo Antônio de Goiás', 'Santo Antônio do Descoberto', 'São Domingos', 
  'São Francisco de Goiás', 'São João d`Aliança', 'São João da Paraúna', 'São Luís de Montes Belos', 
  'São Luíz do Norte', 'São Miguel do Araguaia', 'São Miguel do Passa Quatro', 'São Patrício', 
  'São Simão', 'Senador Canedo', 'Serranópolis', 'Silvânia', 'Simolândia', 'Sítio d`Abadia', 
  'Taquaral de Goiás', 'Teresina de Goiás', 'Terezópolis de Goiás', 'Três Ranchos', 
  'Trindade', 'Trombas', 'Turvânia', 'Turvelândia', 'Uirapuru', 'Uruaçu', 'Uruana', 'Urutaí', 
  'Valparaíso de Goiás', 'Varjão', 'Vianópolis', 'Vicentinópolis', 'Vila Boa', 'Vila Propício'
].sort();

export const DEFAULT_SECTOR_CONFIGS: SectorConfig[] = [
  { id: 'sec-01', tenantId: 'GOIAS', name: 'SES/CEP-20903', defaultSlaDays: 5, analysisType: 'Análise da Documentação' },
  { id: 'sec-02', tenantId: 'GOIAS', name: 'SES/SUBIPEI-21286', defaultSlaDays: 7, analysisType: 'Em Tramitação Técnica' },
  { id: 'sec-03', tenantId: 'GOIAS', name: 'SES/GCONV', defaultSlaDays: 10, analysisType: 'Aguardando Parecer Jurídico' },
  { id: 'sec-04', tenantId: 'GOIAS', name: 'SES/FES', defaultSlaDays: 3, analysisType: 'Liquidado / Pago' }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u-geraldo-01',
    tenantId: 'GOIAS',
    name: 'Geraldo Silva',
    email: 'geraldo.rsilva@goias.gov.br',
    role: Role.SUPER_ADMIN,
    lgpdAccepted: true,
    department: 'SES/SUBIPEI',
    avatarUrl: 'https://ui-avatars.com/api/?name=Geraldo+Silva&background=0d457a&color=fff'
  },
  {
    id: 'u-anderson-01',
    tenantId: 'GOIAS',
    name: 'Anderson Alves',
    email: 'anderson.alves@goias.gov.br',
    role: Role.ADMIN,
    lgpdAccepted: true,
    department: 'SES/SUBIPEI',
    avatarUrl: 'https://ui-avatars.com/api/?name=Anderson+Alves&background=10b981&color=fff'
  },
  {
    id: 'u-admin-01',
    tenantId: 'GOIAS',
    name: 'Gestor GESA',
    email: 'gestor.gesa@goias.gov.br',
    role: Role.ADMIN,
    lgpdAccepted: true,
    department: 'SES/SUBIPEI',
    avatarUrl: 'https://ui-avatars.com/api/?name=Gestor+GESA&background=0d457a&color=fff'
  }
];

export const MOCK_AMENDMENTS: Amendment[] = [
  {
    id: 'a-01',
    tenantId: 'GOIAS',
    code: 'EM-2024-001',
    seiNumber: '202400010001234',
    year: 2024,
    type: AmendmentType.IMPOSITIVA,
    deputyName: 'Bruno Peixoto',
    municipality: 'Goiânia',
    object: 'Aquisição de Ambulâncias para o SAMU',
    value: 1250000,
    status: 'Em Tramitação Técnica',
    currentSector: 'SES/SUBIPEI-21286',
    createdAt: new Date().toISOString(),
    movements: [
      {
        id: 'm-01',
        amendmentId: 'a-01',
        fromSector: 'Protocolo',
        toSector: 'SES/CEP-20903',
        dateIn: '2024-01-10T09:00:00Z',
        dateOut: '2024-01-12T14:00:00Z',
        deadline: '2024-01-15T18:00:00Z',
        daysSpent: 2,
        handledBy: 'Sistema',
        analysisType: 'Análise da Documentação'
      }
    ]
  }
];
