
import { GoogleGenAI } from "@google/genai";

export const getAcademicInsights = async (studentData: string) => {
  // Verificação de segurança para a chave de API
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    console.warn("Gemini API Key não configurada.");
    return "A IA está desativada no momento (Chave de API ausente).";
  }

  try {
    // Inicializamos o cliente apenas no momento do uso para evitar travar o app no load
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise os seguintes dados acadêmicos de um aluno e forneça uma sugestão curta (max 3 frases) de foco pedagógico. Dados: ${studentData}`,
      config: {
        systemInstruction: "Você é um consultor pedagógico especializado em reforço escolar.",
        temperature: 0.7,
      }
    });
    
    return response.text || "Sem insights disponíveis no momento.";
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return "Não foi possível gerar insights agora.";
  }
};
