
import { GoogleGenAI, Type } from "@google/genai";
import { Amendment, AIAnalysisResult } from "../types";

export const analyzeAmendment = async (amendment: Amendment): Promise<AIAnalysisResult> => {
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Você é um especialista em eficiência burocrática da GESA/GO.
      Analise o processo SEI ${amendment.seiNumber} - "${amendment.object}".
      Localização Atual: ${amendment.currentSector}.
      Histórico: ${amendment.movements.length} tramitações.
      
      Gere uma análise JSON com:
      1. summary: Resumo da situação.
      2. bottleneck: Identifique o gargalo mais provável.
      3. recommendation: Ação imediata sugerida.
      4. riskScore: Risco de atraso (0-100).
      5. completionProbability: Probabilidade de pagamento este ano (0-1).
    `;

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

    return JSON.parse(response.text) as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Falha na análise técnica por IA.",
      bottleneck: "Indeterminado",
      recommendation: "Revise o histórico manualmente.",
      riskScore: 0,
      completionProbability: 0
    };
  }
};
