
import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for input validation
const engageSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(9, { message: "Please enter a valid phone number." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  artisanId: z.string().optional(),
  type: z.enum(['REQUEST', 'COMPLAINT', 'FOLLOW_UP']),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = engageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { name, phone, message, artisanId, type } = parsed.data;

    const engagementData: any = {
      name,
      phone,
      message,
      type,
      status: 'new',
      createdAt: new Date(),
      read: false,
    };

    if (artisanId) {
      engagementData.artisanId = artisanId;
      // Optional: Add artisan details here if needed by denormalizing
    }

    const docRef = await adminDb.collection('engagements').add(engagementData);

    return NextResponse.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Error creating engagement:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
