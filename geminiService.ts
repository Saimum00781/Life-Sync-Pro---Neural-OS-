
import { GoogleGenAI } from "@google/genai";

export const generateMorningBriefing = async (yesterdayData: any, coreIdentity: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemPrompt = `You are the "Life Sync Pro" Oracle AI.
  Your task is to generate a 2-sentence morning briefing for the user based on their data from yesterday.
  Core Identity: ${coreIdentity}
  Yesterday's Data: ${JSON.stringify(yesterdayData)}
  
  Rules:
  1. Be extremely concise (exactly 2 sentences).
  2. Tone: Elite, proactive, and analytical.
  3. Address the user as "Operator".
  4. Highlight one win or one area of improvement from yesterday, and set a focus for today.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate my morning briefing.",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Briefing Error:", error);
    return "Good morning, Operator. Systems are online and ready for optimization.";
  }
};

export const askAIArchitectStream = async function* (prompt: string, context?: any) {
  // Production initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are the "Life Sync Pro" Strategic Architect. 
  Your persona is a high-level performance coach and neural optimization expert.
  Current Context: ${JSON.stringify(context || {})}
  
  Operational Rules:
  1. Be razor-sharp and elite in tone.
  2. Use "we" to signal partnership.
  3. Focus on "Cognitive Load Management" and "Energy ROI".
  4. Provide 1 actionable insight per response. Avoid fluff.`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.65, // Lowered for more consistent strategic advice
        topK: 40,
        topP: 0.9,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Neural Bridge Error:", error);
    yield "Strategic link interrupted. Re-syncing protocols...";
  }
};
