
import { GoogleGenAI } from "@google/genai";

// Função auxiliar para obter a chave de forma segura
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

// Inicializa a instância. Se a chave estiver vazia, as chamadas falharão graciosamente mas não o carregamento do app.
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getAcademicInsights = async (studentData: string) => {
  const key = getApiKey();
  if (!key) {
    console.warn("EduBoost: Gemini API Key não configurada.");
    return "Insights automáticos desativados (Chave de API ausente).";
  }

  try {
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
