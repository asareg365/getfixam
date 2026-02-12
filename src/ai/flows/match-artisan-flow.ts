'use server';
/**
 * @fileOverview AI flow for matching natural language WhatsApp messages to artisan categories and zones.
 * 
 * - matchArtisan - Function to categorize customer requests.
 * - MatchArtisanInput - Schema for incoming chat messages.
 * - MatchArtisanOutput - Structured parsing of category and area.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CATEGORIES } from '@/lib/constants';

const MatchArtisanInputSchema = z.object({
  message: z.string().describe('The text message received from the customer via WhatsApp.'),
});
export type MatchArtisanInput = z.infer<typeof MatchArtisanInputSchema>;

const MatchArtisanOutputSchema = z.object({
  category: z.string().describe('The identified service category (e.g., Plumber, Electrician).'),
  area: z.string().describe('The identified neighborhood or area in Berekum.'),
  confidence: z.number().describe('Confidence score from 0 to 1.'),
  reply: z.string().describe('A friendly Twi/English response acknowledging the request.'),
});
export type MatchArtisanOutput = z.infer<typeof MatchArtisanOutputSchema>;

const prompt = ai.definePrompt({
  name: 'matchArtisanPrompt',
  input: { schema: MatchArtisanInputSchema },
  output: { schema: MatchArtisanOutputSchema },
  prompt: `You are the FixAm Ghana Smart Matching assistant. 
Your goal is to extract the requested service category and the location from a customer's WhatsApp message.

Available Categories: ${CATEGORIES.map(c => c.name).join(', ')}
Available Areas: Adom, Adom Newtown, Ahenbronoso, Amomaso, Anyimon, Ayakorase, Benkasa, Berekum Central, Biadan, Brenyekwa, Fetentaa, Jamdede, Jinijini, Kato, Koraso, Kyeritwedie, Magazine, Mpatapo, Mpatasie, Nanasuano, New Biadan, Nsapor, Nyamebekyere, Nyametease, Senase, Sofokyere, World of Friends, Zongo.

Instructions:
1. Identify the category. If not clear, pick 'Other'.
2. Identify the area. If not mentioned, pick 'Unknown'.
3. Write a friendly response in a mix of English and Twi (Ghanaian language).
   Example: "Mepa wo kyɛw, I've found a few Plumbers in Kato for you. Checking availability..."

Customer Message: "{{{message}}}"`,
});

export const matchArtisanFlow = ai.defineFlow(
  {
    name: 'matchArtisanFlow',
    inputSchema: MatchArtisanInputSchema,
    outputSchema: MatchArtisanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI failed to parse the message.');
    return output;
  }
);

export async function matchArtisan(input: MatchArtisanInput): Promise<MatchArtisanOutput> {
  return matchArtisanFlow(input);
}
