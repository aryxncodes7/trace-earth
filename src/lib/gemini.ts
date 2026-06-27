import { GoogleGenAI } from '@google/generativeai';

/**
 * Interface for the insight generator options
 */
export interface InsightOptions {
  totalKg: number;
  highestCategory: string; // e.g. 'transport', 'diet', 'energy', 'shopping'
  highestVal: number;
}

/**
 * Contacts the Gemini API to produce a personalized footprint tip
 */
export async function getPersonalizedInsight(options: InsightOptions): Promise<string> {
  const { totalKg, highestCategory, highestVal } = options;

  // Input Validation & Sanitize Against Prompt Injection
  if (typeof totalKg !== 'number' || isNaN(totalKg) || totalKg < 0) {
    throw new Error('Invalid totalKg: must be a positive number.');
  }
  if (typeof highestVal !== 'number' || isNaN(highestVal) || highestVal < 0) {
    throw new Error('Invalid highestVal: must be a positive number.');
  }
  
  // Allow only alphanumeric characters and spaces for highestCategory to prevent prompt injection
  const sanitizedCategory = String(highestCategory).replace(/[^a-zA-Z0-9\s]/g, '').trim();
  if (!sanitizedCategory) {
    throw new Error('Invalid highestCategory: must contain alphanumeric characters.');
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    } as any); // using as any in case the typed constructor doesn't accept this object

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `My total emissions for today are ${totalKg.toFixed(1)} kg CO2.
My highest category of emissions is "${sanitizedCategory}" at ${highestVal.toFixed(1)} kg CO2.
Provide my coaching recommendation.`,
      config: {
        systemInstruction: 'You are an environmental coach. Give short, specific, non-preachy advice. Always suggest one concrete action the user can take today. Max 2 sentences.',
        temperature: 0.7,
      },
    });

    if (response && response.text) {
      return response.text.trim();
    }
    
    return 'Great work monitoring your footprint! Try powering off idle devices to save incremental energy today.';
  } catch (error) {
    console.error('Error generating AI coaching tip with Gemini API:', error);
    // Return a thoughtful fallback that fits the requested category
    switch (highestCategory) {
      case 'transport':
        return 'Commute emissions represent your highest impact today. Consider joining a carpool or swapping one short trip for a bike ride.';
      case 'diet':
        return 'Your dietary footprint is your main footprint driver today. Swapping beef or dairy for direct plant proteins lowers food CO₂ by up to 80%.';
      case 'energy':
        return 'Home power usage dominates today. Lowering heating/cooling thermostat settings by just 2°F cuts utility emissions by 10%.';
      case 'shopping':
        return 'Streaming and online purchases are your core emission areas today. Consolidate shipping orders and choose slow shipping speeds.';
      default:
        return 'Tracking your carbon habits is the first crucial step to reduction. Choose one small change to make today.';
    }
  }
}
