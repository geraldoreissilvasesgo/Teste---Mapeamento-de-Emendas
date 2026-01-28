import { GoogleGenAI, Type } from "@google/genai";
import { Amendment, AIAnalysisResult } from "../types";

/**
 * SERVIÇO DE INTELIGÊNCIA ARTIFICIAL - GOOGLE GEMINI
 * Este serviço analisa o histórico de tramitação para sugerir melhorias no fluxo.
 */

const apiKey = process.env.API_KEY || '';

// Resposta simulada caso a API Key não esteja presente (Garante funcionamento offline/demo)
const mockAnalysis: AIAnalysisResult = {
  summary: "Análise simulada: O processo segue o fluxo esperado pela SES-GO.",
  bottleneck: "Não foram identificados gargalos críticos no momento.",
  recommendation: "Mantenha o monitoramento regular via sistema."
};

/**
 * Realiza a análise de uma emenda enviando os dados para o modelo Gemini.
 * @param amendment O objeto da emenda com todo seu histórico de movimentos.
 */
export const analyzeAmendment = async (amendment: Amendment): Promise<AIAnalysisResult> => {
  // Fallback para ambiente sem chave de API
  if (!apiKey) {
    console.warn("Chave API não encontrada. Retornando análise simulada.");
    return new Promise(resolve => setTimeout(() => resolve(mockAnalysis), 1500));
  }

  try {
    // Inicializa o SDK do Google GenAI
    const ai = new GoogleGenAI({ apiKey });
    
    // Constrói o prompt contextualizado com a realidade de Goiás
    const prompt = `
      Você é um especialista em gestão pública da Saúde do Estado de Goiás.
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

    // Chama o modelo Gemini 3 Flash para análise rápida e econômica
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Define o esquema de resposta para garantir que a IA retorne um JSON válido
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

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    // Retorna os dados processados para a interface
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Erro na análise Gemini:", error);
    return mockAnalysis;
  }
};