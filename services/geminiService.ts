
import { GoogleGenAI, Type } from "@google/genai";
import { Amendment, AIAnalysisResult } from "../types";

/**
 * SERVIÇO DE INTELIGÊNCIA ARTIFICIAL - GOOGLE GEMINI
 * Este serviço analisa o histórico de tramitação para sugerir melhorias no fluxo.
 */

// Resposta simulada caso a API Key não esteja presente (Garante funcionamento offline/demo)
const mockAnalysis: AIAnalysisResult = {
  summary: "Análise simulada: O processo segue o fluxo esperado pela GESA/SUBIPEI.",
  bottleneck: "Não foram identificados gargalos críticos no momento.",
  recommendation: "Mantenha o monitoramento regular via sistema."
};

/**
 * Realiza a análise de uma emenda enviando os dados para o modelo Gemini.
 * @param amendment O objeto da emenda com todo seu histórico de movimentos.
 */
export const analyzeAmendment = async (amendment: Amendment): Promise<AIAnalysisResult> => {
  // Fix: Strictly following the guidelines for API key access and initialization
  if (!process.env.API_KEY) {
    console.warn("Chave API não encontrada. Retornando análise simulada.");
    return new Promise(resolve => setTimeout(() => resolve(mockAnalysis), 1500));
  }

  try {
    // Fix: Using direct initialization as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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

    // Fix: Using 'gemini-3-pro-preview' for advanced reasoning/analysis tasks
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

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Erro na análise Gemini:", error);
    return mockAnalysis;
  }
};
