
import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// The schema is simplified. The API's only job is to validate and create the initial record.
const engageSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(9, { message: "Please enter a valid phone number." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  type: z.enum(['REQUEST', 'COMPLAINT', 'FOLLOW_UP']),
  service: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  customerId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = engageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    // The API's ONLY job is to write the initial job request and return.
    // All heavy lifting (finding providers, sending notifications) is offloaded to a background Cloud Function.
    const newEngagement = {
      ...parsed.data,
      status: 'created', // The initial status that will trigger the background dispatch function.
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('engagements').add(newEngagement);

    // Return immediately. This gives the user a sub-300ms response time.
    return NextResponse.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Error creating engagement:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
