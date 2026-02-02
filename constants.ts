
/**
 * ARQUIVO DE CONSTANTES GLOBAIS
 * 
 * Este arquivo centraliza valores fixos e dados estáticos utilizados em múltiplas
 * partes da aplicação. Manter esses valores aqui facilita a manutenção e garante
 * consistência em toda a interface.
 */

import { Role, Status, User, AuditLog, AuditAction, SectorConfig, AnalysisType, AmendmentType, AuditSeverity, Amendment, TransferMode, GNDType } from './types';

// Informações gerais da aplicação, exibidas no layout e em títulos.
export const APP_NAME = "Rastreio de Emendas";
export const DEPARTMENT = "Gerência de Suporte Administrativo - GESA/SUBIPEI";
export const APP_VERSION = "2.8.5-prod";

// Configuração inicial de setores reais da estrutura de Goiás (SEI/SUBIPEI).
export const DEFAULT_SECTOR_CONFIGS: SectorConfig[] = [
  { id: 'sec-init', name: 'SES/CEP-20903', defaultSlaDays: 2, analysisType: AnalysisType.DOC_COMPLEMENT },
  { id: 'sec-01', name: 'GESA - Protocolo Central', defaultSlaDays: 2, analysisType: AnalysisType.TECHNICAL },
  { id: 'sec-02', name: 'SUBIPEI - Gabinete', defaultSlaDays: 3, analysisType: AnalysisType.FINAL_APPROVAL },
  { id: 'sec-03', name: 'SUINFRA - Engenharia', defaultSlaDays: 10, analysisType: AnalysisType.TECHNICAL },
  { id: 'sec-04', name: 'SUTIS - Tecnologia', defaultSlaDays: 7, analysisType: AnalysisType.TECHNICAL },
  { id: 'sec-05', name: 'Gerência de Convênios', defaultSlaDays: 5, analysisType: AnalysisType.DOC_COMPLEMENT },
  { id: 'sec-06', name: 'Procuradoria Setorial', defaultSlaDays: 15, analysisType: AnalysisType.LEGAL },
  { id: 'sec-07', name: 'Gerência de Orçamento', defaultSlaDays: 3, analysisType: AnalysisType.BUDGET_RESERVE },
  { id: 'sec-08', name: 'Gerência de Finanças', defaultSlaDays: 4, analysisType: AnalysisType.PAYMENT_PROC }
];

// Lista completa de todos os 246 municípios de Goiás.
export const GOIAS_CITIES = [
  "Abadia de Goiás", "Abadiânia", "Acreúna", "Adelândia", "Água Fria de Goiás", "Água Limpa", "Águas Lindas de Goiás", "Alexânia", "Aloândia", "Alto Horizonte", "Alto Paraíso de Goiás", "Alvorada do Norte", "Amaralina", "Americano do Brasil", "Amorinópolis", "Anápolis", "Anhanguera", "Anicuns", "Aparecida de Goiânia", "Aparecida do Rio Doce", "Aporé", "Araçu", "Aragarças", "Aragoiânia", "Araguapaz", "Arenópolis", "Aruanã", "Aurilândia", "Avelinópolis", "Baliza", "Barro Alto", "Bela Vista de Goiás", "Bom Jardim de Goiás", "Bom Jesus de Goiás", "Bonfinópolis", "Bonópolis", "Brazabrantes", "Britânia", "Buriti Alegre", "Buriti de Goiás", "Buritinuópolis", "Cabeceiras", "Cachoeira Alta", "Cachoeira de Goiás", "Cachoeira Dourada", "Caçu", "Caiapônia", "Caldas Novas", "Caldazinha", "Campestre de Goiás", "Campinaçu", "Campinorte", "Campo Alegre de Goiás", "Campo Limpo de Goiás", "Campos Belos", "Campos Verdes", "Carmo do Rio Verde", "Castelândia", "Catalão", "Caturaí", "Cavalcante", "Cezarina", "Chapadão do Céu", "Cidade Ocidental", "Cocalzinho de Goiás", "Colinas do Sul", "Córrego do Ouro", "Corumbá de Goiás", "Corumbaíba", "Cristalina", "Cristianópolis", "Cristalina", "Cristianópolis", "Crixás", "Cromínia", "Cumari", "Damianópolis", "Damolândia", "Davinópolis", "Diorama", "Divinópolis de Goiás", "Doverlândia", "Edealina", "Edéia", "Estrela do Norte", "Faina", "Fazenda Nova", "Firminópolis", "Flores de Goiás", "Formosa", "Formoso", "Gameleira de Goiás", "Goianápolis", "Goiandira", "Goianésia", "Goiânia", "Goianira", "Goiás", "Goiatuba", "Gouvelândia", "Guapó", "Guaraíta", "Guarani de Goiás", "Guarinos", "Heitoraí", "Hidrolândia", "Hidrolina", "Iaciara", "Inaciolândia", "Indiara", "Inhumas", "Ipameri", "Ipiranga de Goiás", "Iporá", "Israelândia", "Itaberaí", "Itaguari", "Itaguaru", "Itajá", "Itapaci", "Itapirapuã", "Itapuranga", "Itarumã", "Itauçu", "Itumbiara", "Ivolândia", "Jandaia", "Jaraguá", "Jataí", "Jaupaci", "Jesúpolis", "Joviânia", "Jussara", "Lagoa Santa", "Leopoldo de Bulhões", "Luziânia", "Mairipotaba", "Mambaí", "Mara Rosa", "Marzagão", "Matrinchã", "Maurilândia", "Mimoso de Goiás", "Minaçu", "Mineiros", "Moiporá", "Monte Alegre de Goiás", "Montes Claros de Goiás", "Montividiu", "Montividiu do Norte", "Morrinhos", "Morro Agudo de Goiás", "Mossâmedes", "Mozarlândia", "Mundo Novo", "Mutunópolis", "Nazário", "Nerópolis", "Niquelândia", "Nova América", "Nova Aurora", "Nova Crixás", "Nova Glória", "Nova Iguaçu de Goiás", "Nova Roma", "Nova Veneza", "Novo Brasil", "Novo Gama", "Novo Planalto", "Orizona", "Ouro Verde de Goiás", "Ouvidor", "Padre Bernardo", "Palestina de Goiás", "Palmeiras de Goiás", "Palmelo", "Palminópolis", "Panamá", "Paranaiguara", "Paraúna", "Perolândia", "Petrolina de Goiás", "Pilar de Goiás", "Piracanjuba", "Piranhas", "Pirenópolis", "Pires do Rio", "Planaltina", "Pontalina", "Porangatu", "Porteirão", "Portelândia", "Posse", "Professor Jamil", "Quirinópolis", "Rialma", "Rianápolis", "Rio Quente", "Rio Verde", "Rubiataba", "Sanclerlândia", "Santa Bárbara de Goiás", "Santa Cruz de Goiás", "Santa Fé de Goiás", "Santa Helena de Goiás", "Santa Isabel", "Santa Rita do Araguaia", "Santa Rita do Novo Destino", "Santa Rosa de Goiás", "Santa Tereza de Goiás", "Santa Terezinha de Goiás", "Santo Antônio da Barra", "Santo Antônio de Goiás", "Santo Antônio do Descoberto", "São Domingos", "São Francisco de Goiás", "São João d'Aliança", "São João da Paraúna", "São Luís de Montes Claros", "São Luíz do Norte", "São Miguel do Araguaia", "São Miguel do Passa Quatro", "São Patrício", "São Simão", "Senador Canedo", "Serranópolis", "Silvânia", "Simolândia", "Sítio d'Abadia", "Taquaral de Goiás", "Teresina de Goiás", "Terezópolis de Goiás", "Três Ranchos", "Trindade", "Trombas", "Turvânia", "Turvelândia", "Uirapuru", "Uruaçu", "Uruana", "Urutaí", "Valparaíso de Goiás", "Varjão", "Vianópolis", "Vicentinópolis", "Vila Boa", "Vila Propício"
];

// Lista oficial dos 41 deputados estaduais da ALEGO (Legislatura 2023-2027).
export const GOIAS_DEPUTIES = [
  "Alessandro Moreira",
  "Amilton Filho",
  "Amauri Ribeiro",
  "Anderson Teodoro",
  "André do Premium",
  "Antônio Gomide",
  "Bia de Lima",
  "Bruno Peixoto",
  "Cairo Salim",
  "Charles Bento",
  "Clécio Alves",
  "Coronel Adailton",
  "Cristiano Galindo",
  "Cristóvão Tormin",
  "Delegado Eduardo Prado",
  "Dr. George Morais",
  "Dr. José Machado",
  "Dra. Zélia",
  "Gugu Nader",
  "Gustavo Sebba",
  "Henrique César",
  "Issy Quinan",
  "Jamil Calife",
  "Julio Pina",
  "Karlos Cabral",
  "Lineu Olimpio",
  "Lincoln Tejota",
  "Lucas Calil",
  "Lucas do Vale",
  "Mauro Rubem",
  "Paulo Cezar Martins",
  "Renato de Castro",
  "Ricardo Quirino",
  "Rosângela Rezende",
  "Talles Barreto",
  "Thiago Albernaz",
  "Veter Martins",
  "Vívian Naves",
  "Wagner Neto",
  "Wilde Cambão"
];

// Usuário padrão para bypassar a tela de login em ambiente de desenvolvimento.
export const MOCK_USERS: User[] = [
  {
    id: 'test-admin-01',
    tenantId: 'T-01',
    name: 'Gestor GESA',
    email: 'admin.teste@gesa.go.gov.br',
    role: Role.ADMIN,
    avatarUrl: `https://ui-avatars.com/api/?name=Gestor+GESA&background=0d457a&color=fff`,
    lgpdAccepted: true,
    mfaEnabled: true,
    department: 'GESA/SUBIPEI'
  }
];

// Lista inicial de emendas para teste imediato.
export const MOCK_AMENDMENTS: Amendment[] = [
  {
    id: 'am-001',
    tenantId: 'T-01',
    code: 'EM-2025-0001',
    seiNumber: '202500067001234',
    year: 2025,
    type: AmendmentType.IMPOSITIVA,
    deputyName: 'Bruno Peixoto',
    municipality: 'Goiânia',
    object: 'Aquisição de Ambulância para Unidade de Saúde Central',
    value: 250000.00,
    status: Status.DOCUMENT_ANALYSIS,
    currentSector: 'SES/CEP-20903',
    createdAt: new Date().toISOString(),
    suinfra: false,
    sutis: false,
    movements: [
      {
        id: 'mov-01',
        amendmentId: 'am-001',
        fromSector: 'Origem Externa',
        toSector: 'SES/CEP-20903',
        dateIn: new Date(Date.now() - 86400000 * 2).toISOString(),
        dateOut: null,
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        daysSpent: 2,
        handledBy: 'Sistema'
      }
    ]
  },
  {
    id: 'am-002',
    tenantId: 'T-01',
    code: 'EM-2025-0002',
    seiNumber: '202500067005678',
    year: 2025,
    type: AmendmentType.GOIAS_CRESCIMENTO,
    municipality: 'Anápolis',
    object: 'Recapeamento Asfáltico - Distrito Industrial',
    value: 1200000.00,
    status: Status.DILIGENCE,
    currentSector: 'SUINFRA - Engenharia',
    createdAt: new Date().toISOString(),
    suinfra: true,
    sutis: false,
    movements: [
      {
        id: 'mov-02',
        amendmentId: 'am-002',
        fromSector: 'SES/CEP-20903',
        toSector: 'SUINFRA - Engenharia',
        dateIn: new Date(Date.now() - 86400000 * 5).toISOString(),
        dateOut: null,
        deadline: new Date(Date.now() - 86400000 * 1).toISOString(), // Atrasado
        daysSpent: 5,
        handledBy: 'Gestor GESA'
      }
    ]
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [];
