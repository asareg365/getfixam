'use server';

import { admin } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/audit-log';

export async function POST(req: NextRequest, { params }: { params: { action: 'approve' | 'reject' | 'suspend' } }) {
  try {
    const adminUser = await requireAdmin(); // Secure the route
    const body = await req.formData();
    const providerId = body.get('providerId') as string;
    
    if (!providerId) {
      return NextResponse.json({ success: false, error: 'Provider ID missing' }, { status: 400 });
    }

    const providerRef = admin.firestore().collection('providers').doc(providerId);
    const providerSnap = await providerRef.get();
    const providerData = providerSnap.data();

    if (!providerData) {
      return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
    }

    const updateData: any = {};
    const adminEmail = adminUser.email;

    if (params.action === 'approve') {
      updateData.status = 'approved';
      updateData.verified = true;
      updateData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.approvedBy = adminEmail;
    } else if (params.action === 'reject') {
      updateData.status = 'rejected';
      updateData.verified = false;
      updateData.rejectedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.rejectedBy = adminEmail;
    } else if (params.action === 'suspend') {
        updateData.status = 'suspended';
        updateData.verified = false;
        updateData.suspendedAt = admin.firestore.FieldValue.serverTimestamp();
        updateData.suspendedBy = adminEmail;
    } else {
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await providerRef.update(updateData);

    // Use the centralized audit log helper
    await logAdminAction({
      adminEmail: adminEmail!,
      action: params.action,
      targetType: 'provider',
      targetId: providerId,
      details: {
        providerName: providerData.name ?? 'Unknown',
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error processing action: ${params.action}`, error);
     if (error.message.includes('Invalid admin session')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 });
  }
}
