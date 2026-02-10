'use server';

import { matchArtisan } from '@/ai/flows/match-artisan-flow';

/**
 * AI-only server action for processing WhatsApp messages.
 * Logging is performed client-side to ensure session reliability in the preview environment.
 */
export async function simulateIncomingMessage(message: string) {
  try {
    // 1. Process with AI
    const aiResult = await matchArtisan({ message });
    return { success: true, aiResult };
  } catch (error: any) {
    console.error('Bot AI Matching Error:', error);
    return { success: false, error: error.message || 'The AI engine encountered an issue.' };
  }
}
