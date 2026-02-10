import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/audit-log';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';

/**
 * Handles administrative actions for providers (approve, reject, suspend).
 */
export async function POST(req: NextRequest, context: { params: Promise<{ action: string }> }) {
  if (!adminDb) {
    return NextResponse.json({ success: false, error: 'Database not initialized' }, { status: 500 });
  }

  const { action } = await context.params;
  
  try {
    // 1. Verify administrative privileges
    const adminUser = await requireAdmin();

    if (!['approve', 'reject', 'suspend'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // 2. Extract provider ID from request
    const { providerId } = await req.json();
    if (!providerId) {
      return NextResponse.json({ success: false, error: 'Provider ID is missing' }, { status: 400 });
    }

    const providerRef = adminDb.collection('providers').doc(providerId);
    const snap = await providerRef.get();

    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    let pin = '';
    const updateData: any = {
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended',
      updatedAt: FieldValue.serverTimestamp(),
    };

    // 3. Handle specific action logic
    if (action === 'approve') {
      updateData.approvedAt = FieldValue.serverTimestamp();
      updateData.approvedBy = adminUser.email;
      updateData.verified = true; // MVPs are auto-verified upon manual admin approval

      // Generate a one-time 6-digit PIN for the artisan's first login
      pin = Math.floor(100000 + Math.random() * 900000).toString();
      updateData.loginPinHash = await bcrypt.hash(pin, 10);
      updateData.loginPinCreatedAt = FieldValue.serverTimestamp();
    } else if (action === 'reject') {
      updateData.rejectedAt = FieldValue.serverTimestamp();
      updateData.rejectedBy = adminUser.email;
    } else if (action === 'suspend') {
      updateData.suspendedAt = FieldValue.serverTimestamp();
      updateData.suspendedBy = adminUser.email;
    }

    // 4. Update the document
    await providerRef.update(updateData);

    // 5. Log the administrative action
    await logAdminAction({
      adminEmail: adminUser.email!,
      action: `PROVIDER_${action.toUpperCase()}D`,
      targetType: 'provider',
      targetId: providerId,
      ipAddress,
      userAgent,
    });

    // 6. Revalidate relevant cache paths
    revalidatePath('/admin/providers');
    revalidatePath('/admin/audit-logs');
    revalidatePath('/');
    revalidatePath('/category/all');

    // Return the generated PIN if approved, so the admin can give it to the artisan
    return NextResponse.json({ success: true, pin: pin || undefined });

  } catch (error: any) {
    console.error(`[ProviderAction] Error processing ${action}:`, error);
    if (error.message?.includes('redirect')) throw error; // Allow Next.js redirects to function
    return NextResponse.json({ success: false, error: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}
