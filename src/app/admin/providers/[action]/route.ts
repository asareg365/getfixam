 import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { providerId } = await req.json();

  const providerRef = adminDb.collection("providers").doc(providerId);
  const providerSnap = await providerRef.get();

  if (!providerSnap.exists) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const provider = providerSnap.data()!;

  if (provider.status === "approved") {
    return NextResponse.json({ error: "Already approved" }, { status: 400 });
  }

  // Generate PIN
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const pinHash = await bcrypt.hash(pin, 10);

  // Create Firebase Auth user
  const user = await adminAuth.createUser({
    phoneNumber: provider.phone,
  });

  // Set role claim
  await adminAuth.setCustomUserClaims(user.uid, {
    role: "provider",
  });

  await providerRef.update({
    status: "approved",
    uid: user.uid,
    pinHash,
  });

  return NextResponse.json({
    success: true,
    generatedPin: pin,
  });
}
