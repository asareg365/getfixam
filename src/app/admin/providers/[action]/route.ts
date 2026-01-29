'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest, { params }: { params: { action: 'approve' | 'reject' } }) {
  const body = await req.formData();
  const providerId = body.get('providerId') as string;
  if (!providerId) return NextResponse.json({ success: false, error: 'Provider ID missing' });

  const sessionToken = req.cookies().get('adminSession')?.value;
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' });

  try {
    const decoded = await adminAuth.verifyIdToken(sessionToken);
    const adminEmail = decoded.email ?? 'Unknown Admin';
    const providerRef = adminDb.collection('providers').doc(providerId);
    const providerSnap = await providerRef.get();
    const providerData = providerSnap.data();

    if (!providerData) return NextResponse.json({ success: false, error: 'Provider not found' });

    const updateData: any = {
      status: params.action === 'approve' ? 'approved' : 'rejected',
      verified: params.action === 'approve',
    };

    if (params.action === 'approve') {
      updateData.approvedAt = FieldValue.serverTimestamp();
      updateData.approvedBy = adminEmail;
    } else { // 'reject'
      updateData.rejectedAt = FieldValue.serverTimestamp();
      updateData.rejectedBy = adminEmail;
    }

    await providerRef.update(updateData);

    // Audit log
    await adminDb.collection('auditLogs').add({
      adminEmail: decoded.email,
      providerId,
      providerName: providerData.name ?? 'Unknown',
      action: params.action,
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' });
  }
}

    