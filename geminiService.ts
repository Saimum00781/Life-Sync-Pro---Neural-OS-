
import { GoogleGenAI } from "@google/genai";

export const generateMorningBriefing = async (yesterdayData: any, coreIdentity: string, accountabilityLevel: 'supportive' | 'relentless' = 'supportive') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const toneInstruction = accountabilityLevel === 'relentless' 
    ? `Tone: Relentless, brutally honest, David Goggins-style elite accountability. Do not sugarcoat failures. If they missed habits or goals, call them out aggressively. If they succeeded, demand more.`
    : `Tone: Elite, proactive, analytical, and supportive.`;

  const systemPrompt = `You are the "Life Sync Pro" Oracle AI.
  Your task is to generate a 2-sentence morning briefing for the user based on their data from yesterday.
  Core Identity: ${coreIdentity}
  Yesterday's Data: ${JSON.stringify(yesterdayData)}
  
  Rules:
  1. Be extremely concise (exactly 2 sentences).
  2. ${toneInstruction}
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

export const parseNaturalLanguageCommand = async (command: string, currentDay: any, habits: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemPrompt = `You are the Life Sync Pro NLP parser.
  Parse the user's natural language command into a JSON object representing updates to their daily tracking data.
  
  Current Day Data: ${JSON.stringify(currentDay)}
  Active Habits: ${JSON.stringify(habits)}
  
  Return ONLY a valid JSON object matching this schema (no markdown formatting, just raw JSON):
  {
    "addedProductiveMins": number,
    "addedLeisureMins": number,
    "addedWater": number,
    "addedSleepMins": number,
    "addedSteps": number,
    "completedHabits": string[], // exact matches from Active Habits
    "newGoals": string[], // new tasks to add
    "completedGoalIds": string[] // exact IDs of goals from Current Day Data that should be marked done
  }
  
  Example: "Drank 2 glasses of water and finished reading"
  Output: {"addedProductiveMins": 0, "addedLeisureMins": 0, "addedWater": 2, "addedSleepMins": 0, "addedSteps": 0, "completedHabits": ["Reading"], "newGoals": [], "completedGoalIds": []}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: command,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("NLP Parser Error:", error);
    return null;
  }
};
export const generateEveningReview = async (todayData: any, coreIdentity: string, accountabilityLevel: 'supportive' | 'relentless' = 'supportive') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const toneInstruction = accountabilityLevel === 'relentless' 
    ? `Tone: Relentless, brutally honest, David Goggins-style elite accountability. If they slacked off, tell them. If they crushed it, tell them the job isn't done.`
    : `Tone: Reflective, supportive, and analytical.`;

  const systemPrompt = `You are the "Life Sync Pro" Oracle AI conducting the Evening Review.
  Your task is to generate a 3-sentence end-of-day summary for the user based on today's data.
  Core Identity: ${coreIdentity}
  Today's Data: ${JSON.stringify(todayData)}
  
  Rules:
  1. Be concise (exactly 3 sentences).
  2. ${toneInstruction}
  3. Address the user as "Operator".
  4. Sentence 1: Analyze their overall output (tasks, habits, focus).
  5. Sentence 2: Highlight a specific metric (e.g., sleep, water, mood).
  6. Sentence 3: Provide a closing thought to prepare them for tomorrow.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate my evening review.",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Evening Review Error:", error);
    return "Evening review complete, Operator. Rest well. Tomorrow we optimize further.";
  }
};

export const generatePatternAnalysis = async (historicalData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemPrompt = `You are the Life Sync Pro Neural Pattern Analyzer.
  Analyze the user's last 7-14 days of data to find hidden correlations and predictive insights.
  
  Historical Data: ${JSON.stringify(historicalData)}
  
  Rules:
  1. Return exactly 3 bullet points.
  2. Focus on correlations (e.g., "When you sleep < 6 hours, your deep work drops by 40%").
  3. Be highly analytical, data-driven, and concise.
  4. Do not use markdown formatting, just plain text with bullet points (•).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Analyze my neural patterns.",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Pattern Analysis Error:", error);
    return "• Insufficient data for neural pattern recognition.\n• Continue logging daily metrics to establish a baseline.\n• Sync score correlation engine offline.";
  }
};

export const askAIArchitectStream = async function* (prompt: string, context?: any) {
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
