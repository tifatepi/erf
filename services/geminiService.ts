
import { GoogleGenAI } from "@google/genai";

// Guideline: Use this process.env.API_KEY string directly when initializing
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAcademicInsights = async (studentData: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise os seguintes dados acadêmicos de um aluno e forneça uma sugestão curta (max 3 frases) de foco pedagógico. Dados: ${studentData}`,
      config: {
        systemInstruction: "Você é um consultor pedagógico especializado em reforço escolar.",
        temperature: 0.7,
      }
    });
    // Guideline: The .text property directly returns the string output (do not use text())
    return response.text || "Sem insights disponíveis no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar insights automáticos.";
  }
};
