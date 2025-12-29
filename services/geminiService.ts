
import { GoogleGenAI } from "@google/genai";

export const getAcademicInsights = async (studentData: string) => {
  // Use process.env.API_KEY directly when initializing the GoogleGenAI client instance.
  // This environment variable is assumed to be pre-configured and valid.
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using 'gemini-3-flash-preview' for basic text tasks like summarization and pedagogical suggestions.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise os seguintes dados acadêmicos de um aluno e forneça uma sugestão curta (max 3 frases) de foco pedagógico. Dados: ${studentData}`,
      config: {
        systemInstruction: "Você é um consultor pedagógico especializado em reforço escolar.",
        temperature: 0.7,
      }
    });
    
    // Extracting text output directly from the .text property of GenerateContentResponse.
    return response.text || "Sem insights disponíveis no momento.";
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return "Não foi possível gerar insights agora.";
  }
};
