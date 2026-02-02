
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/audit-log';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.formData();
    const providerId = body.get('providerId') as string;

    if (!providerId) {
      return NextResponse.json({ success: false, error: 'Provider ID missing' }, { status: 400 });
    }

    const providerRef = adminDb.collection('providers').doc(providerId);
    const providerSnap = await providerRef.get();

    if (!providerSnap.exists || providerSnap.data()?.status !== 'approved') {
      return NextResponse.json({ success: false, error: 'Provider not found or not approved' }, { status: 404 });
    }

    // Generate and hash a new PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const saltRounds = 10;
    const pinHash = await bcrypt.hash(pin, saltRounds);

    // Update the provider document
    await providerRef.update({
      loginPinHash: pinHash,
      loginPinCreatedAt: FieldValue.serverTimestamp(),
    });

    // Log the admin action
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    await logAdminAction({
      adminEmail: adminUser.email!,
      action: 'PROVIDER_PIN_RESET',
      targetType: 'provider',
      targetId: providerId,
      ipAddress,
      userAgent,
    });
    
    // Return the new PIN to the admin
    return NextResponse.json({ success: true, pin });

  } catch (error: any) {
    console.error('Error resetting PIN:', error);
    if (error.message.includes('Invalid admin session')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
