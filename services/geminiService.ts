
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const generateEconomicHeadlines = async (topic: string): Promise<string[]> => {
  if (!API_KEY) return ["يرجى إضافة مفتاح API"];

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `بناءً على هذا الموضوع: "${topic}"، اقترح 5 عناوين اقتصادية قصيرة ومثيرة (Clickbait مهني) باللغة العربية الفصحى لمنصة أخبار اقتصادية. يجب أن تكون العناوين قوية وعصرية ومناسبة لوسائل التواصل الاجتماعي.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headlines: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["headlines"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{"headlines":[]}');
    return data.headlines;
  } catch (error) {
    console.error("Error parsing Gemini response", error);
    return ["حدث خطأ في توليد العناوين"];
  }
};
