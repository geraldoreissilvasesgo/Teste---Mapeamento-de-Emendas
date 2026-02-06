
import { GoogleGenAI, Type } from "@google/genai";
import { Amendment, AIAnalysisResult } from "../types.ts";

/**
 * SERVIÇO DE INTELIGÊNCIA ARTIFICIAL (IA)
 * Utiliza o modelo Gemini 3 Pro para realizar análises preditivas.
 */
export const analyzeAmendment = async (amendment: Amendment): Promise<AIAnalysisResult> => {
  try {
    // Inicialização obrigatória conforme diretrizes: usar process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Você é um especialista em auditoria e eficiência burocrática da GESA Cloud (Estado de Goiás).
      Analise o processo SEI ${amendment.seiNumber} - "${amendment.object}".
      Exercício: ${amendment.year}.
      Localização Atual: ${amendment.currentSector}.
      Valor: R$ ${amendment.value}.
      Status do Ciclo: ${amendment.status}.
      Histórico: ${amendment.movements.length} tramitações realizadas.
      
      Considere as normas do Decreto Estadual nº 10.634/2025 para emendas parlamentares.
      
      Gere uma análise técnica rigorosa em formato JSON contendo:
      1. summary: Um breve resumo executivo do status jurídico-administrativo.
      2. bottleneck: Identifique o provável gargalo técnico ou administrativo (ex: falta de certidão, análise orçamentária).
      3. recommendation: Sugestão de ação imediata e específica para o gestor da SES-GO.
      4. riskScore: Pontuação de risco de atraso ou impedimento (0-100).
      5. completionProbability: Probabilidade de liquidação financeira efetiva (0-1).
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

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    
    // Fallback amigável caso a API_KEY do Gemini falhe
    return {
      summary: "A análise automática está indisponível no momento. O token de IA pode estar inválido ou expirado.",
      bottleneck: "Interrupção do serviço de inteligência externa",
      recommendation: "Prossiga com a conferência manual via SEI-GO para garantir o cumprimento dos prazos do Decreto 10.634/2025.",
      riskScore: 50,
      completionProbability: 0.5
    };
  }
};
