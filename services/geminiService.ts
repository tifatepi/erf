
import { GoogleGenAI } from "@google/genai";

// Fix: Always use process.env.API_KEY directly when initializing the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAcademicInsights = async (studentData: string) => {
  try {
    // Fix: Query GenAI with the model name and prompt directly via ai.models.generateContent.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise os seguintes dados acadêmicos de um aluno e forneça uma sugestão curta (max 3 frases) de foco pedagógico. Dados: ${studentData}`,
      config: {
        systemInstruction: "Você é um consultor pedagógico especializado em reforço escolar.",
        temperature: 0.7,
      }
    });
    
    // Fix: Use the .text property directly (it is a property, not a method).
    return response.text || "Sem insights disponíveis no momento.";
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return "Não foi possível gerar insights agora.";
  }
};
