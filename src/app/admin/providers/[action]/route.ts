
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/audit-log';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const action = params.action;
  if (!['approve', 'reject', 'suspend'].includes(action)) {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }

  try {
    const adminUser = await requireAdmin(); // Secure the route
    const { providerId } = await req.json();
    
    if (!providerId) {
      return NextResponse.json({ success: false, error: 'Provider ID missing' }, { status: 400 });
    }

    const providerRef = adminDb.collection('providers').doc(providerId);
    const providerSnap = await providerRef.get();
    const providerData = providerSnap.data();

    if (!providerData) {
      return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
    }

    const updateData: any = {};
    let pin: string | null = null;
    const adminEmail = adminUser.email;
    let actionLog: string;

    if (action === 'approve') {
      if (providerData.status !== 'approved') {
        pin = Math.floor(100000 + Math.random() * 900000).toString();
        const saltRounds = 10;
        const pinHash = await bcrypt.hash(pin, saltRounds);

        updateData.loginPinHash = pinHash;
        updateData.loginPinCreatedAt = FieldValue.serverTimestamp();
      }

      updateData.status = 'approved';
      updateData.verified = true;
      updateData.approvedAt = FieldValue.serverTimestamp();
      updateData.approvedBy = adminEmail;
      actionLog = 'PROVIDER_APPROVED';

    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.verified = false;
      updateData.rejectedAt = FieldValue.serverTimestamp();
      updateData.rejectedBy = adminEmail;
      actionLog = 'PROVIDER_REJECTED';
    } else if (action === 'suspend') {
        updateData.status = 'suspended';
        updateData.verified = false;
        updateData.suspendedAt = FieldValue.serverTimestamp();
        updateData.suspendedBy = adminEmail;
        actionLog = 'PROVIDER_SUSPENDED';
    } else {
        // This case is already handled above, but as a safeguard.
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await providerRef.update(updateData);

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await logAdminAction({
      adminEmail: adminEmail!,
      action: actionLog,
      targetType: 'provider',
      targetId: providerId,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true, pin });
  } catch (error: any) {
    console.error(`Error processing action: ${action}`, error);
     if (error.message.includes('Invalid admin session')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}

// GET – optional, simple status
export async function GET() {
  return NextResponse.json({ message: 'User action API is live' });
}
