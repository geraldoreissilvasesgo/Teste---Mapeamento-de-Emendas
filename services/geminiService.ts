/**
 * SERVIÇO DE INTELIGÊNCIA ARTIFICIAL - GOOGLE GEMINI
 * 
 * Este serviço encapsula a lógica para interagir com a API do Google Gemini.
 * Sua principal função é enviar os dados de um processo (especificamente seu histórico
 * de tramitação) para o modelo de IA e solicitar uma análise sobre possíveis
 * gargalos e recomendações de otimização de fluxo.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Amendment, AIAnalysisResult } from "../types";

/**
 * Resposta simulada (mock) para a análise de IA.
 * 
 * Esta constante é utilizada como um fallback caso a chave da API do Gemini não
 * esteja configurada no ambiente. Isso garante que a aplicação continue funcionando
 * para demonstrações ou em ambientes de desenvolvimento sem acesso à internet ou
 * a credenciais, simulando uma resposta da IA após um breve delay.
 */
const mockAnalysis: AIAnalysisResult = {
  summary: "Análise simulada: O processo segue o fluxo esperado pela GESA/SUBIPEI.",
  bottleneck: "Não foram identificados gargalos críticos no momento.",
  recommendation: "Mantenha o monitoramento regular via sistema."
};

/**
 * Realiza a análise de uma emenda enviando os dados para o modelo Gemini.
 * 
 * @param amendment O objeto completo da emenda, incluindo seu histórico de movimentos.
 * @returns Uma Promise que resolve com um objeto `AIAnalysisResult` contendo o
 *          resumo, gargalo e recomendação gerados pela IA ou pelo mock.
 */
export const analyzeAmendment = async (amendment: Amendment): Promise<AIAnalysisResult> => {
  // Verifica a existência da chave de API no ambiente. Se não existir, retorna a análise simulada.
  if (!process.env.API_KEY) {
    console.warn("Chave API do Gemini não encontrada. Retornando análise simulada.");
    return new Promise(resolve => setTimeout(() => resolve(mockAnalysis), 1500));
  }

  try {
    // Inicializa o cliente da API do Google GenAI com a chave fornecida.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Constrói o prompt que será enviado ao modelo.
    // O prompt é estruturado para dar contexto ao modelo sobre seu papel ("especialista em gestão pública")
    // e fornecer os dados relevantes da emenda de forma clara.
    const prompt = `
      Você é um especialista em gestão pública da GESA/SUBIPEI do Estado de Goiás.
      Analise o histórico de tramitação deste Processo SEI e identifique atrasos.
      
      Dados da Emenda/Processo:
      Código: ${amendment.code}
      Processo SEI: ${amendment.seiNumber}
      Objeto: ${amendment.object}
      Valor: R$ ${amendment.value}
      Status Atual: ${amendment.status}
      Setores Técnicos Envolvidos: SUINFRA=${amendment.suinfra}, SUTIS=${amendment.sutis}
      
      Histórico de Movimentações:
      ${amendment.movements.map(m => `- De ${m.fromSector || 'Início'} para ${m.toSector}: Ficou ${m.daysSpent} dias`).join('\n')}
    `;

    // Realiza a chamada para a API `generateContent`.
    // - model: 'gemini-3-pro-preview' é escolhido para tarefas complexas de raciocínio.
    // - contents: O prompt com os dados da emenda.
    // - config: Especifica que a resposta deve ser em JSON e define o schema esperado,
    //   forçando a IA a retornar dados estruturados e previsíveis.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo do percurso do processo" },
            bottleneck: { type: Type.STRING, description: "Onde o processo ficou parado ou demorou mais" },
            recommendation: { type: Type.STRING, description: "Ação sugerida para o gestor" }
          },
          required: ["summary", "bottleneck", "recommendation"]
        }
      }
    });

    // Extrai o texto da resposta da IA.
    const text = response.text;
    if (!text) throw new Error("A resposta da IA está vazia.");

    // Converte a string JSON recebida em um objeto JavaScript.
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    // Em caso de erro na comunicação com a API, registra o erro no console
    // e retorna a análise simulada para não quebrar a interface do usuário.
    console.error("Erro na análise Gemini:", error);
    return mockAnalysis;
  }
};
