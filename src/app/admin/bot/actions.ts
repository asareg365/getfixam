'use server';

import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { matchArtisan } from '@/ai/flows/match-artisan-flow';
import { logAdminAction } from '@/lib/audit-log';
import { requireAdmin } from '@/lib/admin-guard';
import { headers } from 'next/headers';

/**
 * Simulates an incoming WhatsApp message and processes it via AI.
 */
export async function simulateIncomingMessage(phone: string, message: string) {
  try {
    const adminUser = await requireAdmin();
    if (!adminDb) throw new Error('Database not initialized.');

    // 1. Process with AI
    const aiResult = await matchArtisan({ message });

    // 2. Log the incoming event
    const eventRef = await adminDb.collection('whatsapp_events').add({
      phone,
      message,
      role: 'customer',
      event: 'JOB_REQUEST',
      aiParsed: {
        category: aiResult.category,
        area: aiResult.area,
        confidence: aiResult.confidence,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Log the bot's response
    await adminDb.collection('whatsapp_events').add({
      phone,
      message: aiResult.reply,
      role: 'bot',
      event: 'REPLY',
      parentId: eventRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Audit Log
    const headersList = await headers();
    await logAdminAction({
      adminEmail: adminUser.email!,
      action: 'BOT_SIMULATION_RUN',
      targetType: 'system',
      targetId: eventRef.id,
      ipAddress: headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: headersList.get('user-agent') || 'unknown',
    });

    return { success: true, aiResult };
  } catch (error: any) {
    console.error('Bot Simulation Error:', error);
    return { success: false, error: error.message };
  }
}
