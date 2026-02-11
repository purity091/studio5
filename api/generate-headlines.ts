
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API Key is not configured on the server' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
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

        const data = JSON.parse(response.text || '{"headlines":[]}');
        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Gemini API error:', error);
        return res.status(500).json({ error: 'Failed to generate headlines', details: error.message });
    }
}
