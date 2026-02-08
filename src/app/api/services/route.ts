
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { Service } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized.');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const snapshot = await adminDb.collection('services').orderBy('name').get();
    if (snapshot.empty) {
      return NextResponse.json({ services: [] });
    }

    // Assuming the Service type includes the document ID.
    const services: Service[] = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Service;
    });

    return NextResponse.json({ services });
  } catch (err: any) {
    console.error('Error fetching services:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
