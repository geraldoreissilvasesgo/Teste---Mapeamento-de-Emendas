
import { GoogleGenAI, Type } from "@google/genai";
import { Amendment, AIAnalysisResult } from "../types";

/**
 * SERVIÇO DE INTELIGÊNCIA ARTIFICIAL (IA)
 * Utiliza o modelo Gemini 3.0 Pro para realizar análises preditivas em processos burocráticos.
 */
export const analyzeAmendment = async (amendment: Amendment): Promise<AIAnalysisResult> => {
  // Verifica se a chave de API está presente no ambiente
  if (!process.env.API_KEY) {
    return {
      summary: "Análise Preditiva Indisponível (Sem API Key)",
      bottleneck: "N/A",
      recommendation: "Configure a API Key para habilitar inteligência de dados.",
      riskScore: 50,
      completionProbability: 0.5
    };
  }

  try {
    // Inicialização do SDK do Google GenAI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prompt de sistema estruturado para atuar como especialista em eficiência pública
    const prompt = `
      Você é um especialista em eficiência burocrática da GESA Cloud.
      Analise o processo SEI ${amendment.seiNumber} - "${amendment.object}".
      Localização Atual: ${amendment.currentSector}.
      Histórico: ${amendment.movements.length} tramitações realizadas.
      
      Gere uma análise técnica em formato JSON contendo:
      1. summary: Um breve resumo executivo do status.
      2. bottleneck: Identifique o provável gargalo técnico ou administrativo.
      3. recommendation: Sugestão de ação imediata para o gestor.
      4. riskScore: Pontuação de risco de atraso (0-100).
      5. completionProbability: Probabilidade de liquidação financeira este ano (0-1).
    `;

    // Chamada ao modelo com esquema de resposta JSON forçado para estabilidade
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            bottleneck: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            completionProbability: { type: Type.NUMBER }
          },
          required: ["summary", "bottleneck", "recommendation", "riskScore", "completionProbability"]
        }
      }
    });

    // Extração e limpeza do texto retornado pela IA conforme diretrizes do SDK
    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("O modelo retornou uma resposta vazia.");
    }

    return JSON.parse(jsonStr) as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Falha na análise técnica por IA. O serviço pode estar sobrecarregado.",
      bottleneck: "Indeterminado",
      recommendation: "Realize a conferência manual do processo no SEI.",
      riskScore: 0,
      completionProbability: 0
    };
  }
};
