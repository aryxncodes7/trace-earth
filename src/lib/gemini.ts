import { GoogleGenAI } from '@google/genai';

// Initialize full-stack Gemini client using backend credentials with proper User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `My total emissions for today are ${totalKg.toFixed(1)} kg CO2.
My highest category of emissions is "${highestCategory}" at ${highestVal.toFixed(1)} kg CO2.
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
